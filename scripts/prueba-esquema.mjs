// Prueba del SQL sin Supabase: `supabase/schema.sql` dos veces (idempotente), `supabase/verify.sql`
// con sus 51 filas en true y el aislamiento entre dos negocios por RLS, todo sobre una Postgres en
// memoria (PGlite). npm run test:esquema · sin red ni base real · también en la CI.
//
// Supabase trae cosas que una Postgres sola no tiene (roles anon/authenticated/service_role,
// auth.users, auth.uid(), el esquema storage). Abajo van como réplicas mínimas: alcanzan para que
// el esquema corra y para que las políticas se evalúen igual, no prueban Supabase en sí. La prueba
// con dos locales reales en producción sigue siendo `scripts/prueba-aislamiento.mjs`.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const raiz = fileURLToPath(new URL("..", import.meta.url));
const leer = (ruta) => readFile(`${raiz}${ruta}`, "utf8");

// Réplica mínima de lo que Supabase ya trae antes de correr schema.sql.
const SUPABASE_MINIMO = `
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
                  nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid
$$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;

create schema storage;
create table storage.buckets (
  id text primary key, name text not null unique, owner uuid, public boolean default false,
  file_size_limit bigint, allowed_mime_types text[],
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id),
  name text, owner uuid, metadata jsonb,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language plpgsql immutable as $$
declare _parts text[];
begin
  select string_to_array(name, '/') into _parts;
  return _parts[1:array_length(_parts, 1) - 1];
end $$;
grant usage on schema storage to anon, authenticated, service_role;
grant all on storage.objects, storage.buckets to anon, authenticated, service_role;

-- Como un proyecto de Supabase: la Data API recibe todo por defecto en public. schema.sql
-- (sección 11) tiene que quitárselo; si no lo hace, verify.sql lo nota.
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
`;

const ID = {
  admin: "00000000-0000-4000-8000-0000000000aa",
  duenoA: "00000000-0000-4000-8000-00000000000a",
  duenoB: "00000000-0000-4000-8000-00000000000b",
};

const db = await PGlite.create({ extensions: { pgcrypto } });

async function run(paso, sql) {
  try {
    return await db.exec(sql);
  } catch (e) {
    throw new Error(`${paso}: ${e.message}`);
  }
}

// Corre `fn` con la sesión de `rol` (y el usuario `uid`, si hay), como lo haría la Data API.
async function como(rol, uid, fn) {
  await db.exec(`set role ${rol}`);
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [uid ?? ""]);
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
    await db.query(`select set_config('request.jwt.claim.sub', '', false)`);
  }
}

async function falla(promesa, patron, que) {
  await assert.rejects(promesa, patron, que);
}

// 1) Esquema dos veces: la segunda tiene que pasar igual sobre una base con datos (D-009).
const schema = await leer("supabase/schema.sql");
const verify = await leer("supabase/verify.sql");
await run("réplica de Supabase", SUPABASE_MINIMO);
await run("schema.sql (primera vez)", schema);

// Datos: dos locales en Estándar (con pedidos), uno suspendido, sus dueños y el super admin.
await run(
  "datos de prueba",
  `
  insert into auth.users (id, email) values
    ('${ID.admin}', 'admin@prueba.local'), ('${ID.duenoA}', 'a@prueba.local'), ('${ID.duenoB}', 'b@prueba.local');
  insert into public.tenants (name, slug, status, plan_id)
    select v.name, v.slug, v.status::tenant_status, p.id
      from (values ('Local A', 'local-a', 'active'), ('Local B', 'local-b', 'active')) v(name, slug, status)
      cross join public.plans p where p.code = 'estandar';
  insert into public.profiles (id, tenant_id, role, full_name) values
    ('${ID.admin}', null, 'super_admin', 'Admin'),
    ('${ID.duenoA}', (select id from public.tenants where slug = 'local-a'), 'restaurant_admin', 'Dueño A'),
    ('${ID.duenoB}', (select id from public.tenants where slug = 'local-b'), 'restaurant_admin', 'Dueño B');
  insert into public.tenant_settings (tenant_id, currency_code, restaurant_name)
    select id, 'CRC', name from public.tenants;
  insert into public.categories (tenant_id, name_i18n)
    select id, jsonb_build_object('es', 'Platos de ' || name) from public.tenants;
  insert into public.products (tenant_id, category_id, name_i18n, price)
    select t.id, c.id, jsonb_build_object('es', 'Casado de ' || t.name), 3500
      from public.tenants t join public.categories c on c.tenant_id = t.id;
  insert into public.tables (tenant_id, label) select id, 'Mesa 1' from public.tenants;
  `
);

await run("schema.sql (segunda vez, con datos)", schema);
const datos = await db.query("select count(*)::int as n from public.products");
assert.equal(datos.rows[0].n, 2, "la segunda corrida de schema.sql no borra datos");

// 2) verify.sql: las 51 filas en true.
const res = await db.query(verify);
const filas = res.rows;
const malas = filas.filter((f) => f.ok !== true).map((f) => `${f.orden} · ${f.chequeo}`);
assert.equal(filas.length, 51, `verify.sql devuelve 51 filas (dio ${filas.length})`);
assert.deepEqual(malas, [], `filas de verify.sql en false:\n  ${malas.join("\n  ")}`);

// 3) Aislamiento entre negocios por RLS (lo mismo que mira prueba-aislamiento.mjs, sin red).
const tenant = async (slug) =>
  (await db.query("select id from public.tenants where slug = $1", [slug])).rows[0].id;
const A = await tenant("local-a");
const B = await tenant("local-b");
const token = async (t) =>
  (await db.query("select qr_token from public.tables where tenant_id = $1", [t])).rows[0].qr_token;
const productoDe = async (t) =>
  (await db.query("select id from public.products where tenant_id = $1", [t])).rows[0].id;
const tokenA = await token(A);
const prodA = await productoDe(A);
const prodB = await productoDe(B);

await como("authenticated", ID.duenoA, async () => {
  for (const tabla of ["tenants", "tenant_settings", "categories", "products", "tables", "orders", "order_items"]) {
    const { rows } = await db.query(`select tenant_id_de_fila from (select ${tabla === "tenants" ? "id" : "tenant_id"} as tenant_id_de_fila from public.${tabla}) x`);
    assert.ok(rows.every((r) => r.tenant_id_de_fila === A), `${tabla}: el dueño A solo ve filas de su local`);
  }
  const perfiles = await db.query("select id from public.profiles");
  assert.deepEqual(perfiles.rows.map((r) => r.id), [ID.duenoA], "profiles: el dueño A solo se ve a sí mismo");

  const cambio = await db.query("update public.products set price = 1 where id = $1 returning id", [prodB]);
  assert.equal(cambio.rows.length, 0, "el dueño A no cambia un platillo de B");
  const borrado = await db.query("delete from public.products where id = $1 returning id", [prodB]);
  assert.equal(borrado.rows.length, 0, "el dueño A no borra un platillo de B");
  await falla(
    db.query("insert into public.products (tenant_id, name_i18n, price) values ($1, '{\"es\":\"x\"}', 1)", [B]),
    /row-level security/,
    "el dueño A no crea platillos en B"
  );
  await falla(
    db.query("update public.products set tenant_id = $1 where id = $2", [B, prodA]),
    /row-level security/,
    "el dueño A no pasa un platillo suyo a B"
  );
  await falla(
    db.query("insert into public.orders (tenant_id, status) values ($1, 'pending')", [A]),
    /permission denied/,
    "las órdenes entran solo por place_order (S11)"
  );
  const pagos = await db.query("select tenant_id from public.subscription_payments");
  assert.ok(pagos.rows.every((r) => r.tenant_id === A), "el dueño A no ve pagos de otros locales");
});

await como("authenticated", ID.admin, async () => {
  const { rows } = await db.query("select count(*)::int as n from public.tenants");
  assert.equal(rows[0].n, 2, "el super admin ve todos los locales");
});

// 4) El comensal (anon): sin acceso a tablas, solo las dos RPC.
await como("anon", null, async () => {
  await falla(db.query("select * from public.products"), /permission denied/, "anon no lee tablas");
  await falla(db.query("select * from public.v_daily_sales"), /permission denied/, "anon no lee los reportes");
  const menu = await db.query("select public.get_menu('local-a', $1) as m", [tokenA]);
  assert.ok(menu.rows[0].m, "get_menu devuelve la carta del local A");
  const ajena = await db.query("select public.get_menu('local-b', $1) as m", [tokenA]);
  assert.equal(ajena.rows[0].m, null, "el QR de A no abre la carta de B");
  const items = JSON.stringify([{ product_id: prodA, quantity: 2 }]);
  const orden = await db.query("select public.place_order('local-a', $1, $2::jsonb, null, null) as id", [tokenA, items]);
  assert.ok(orden.rows[0].id, "place_order crea la orden en A");
  const cruzada = JSON.stringify([{ product_id: prodB, quantity: 1 }]);
  await falla(
    db.query("select public.place_order('local-a', $1, $2::jsonb, null, null)", [tokenA, cruzada]),
    /no están disponibles/,
    "place_order no acepta un platillo de B en la mesa de A"
  );
});

const total = await db.query("select total::numeric as t from public.orders where tenant_id = $1", [A]);
assert.equal(Number(total.rows[0].t), 7000, "el precio sale de products, no del navegador");

// 5) Un local suspendido queda de solo lectura en la base, no solo en la interfaz.
await run("suspender B", `update public.tenants set status = 'suspended' where id = '${B}'`);
await como("authenticated", ID.duenoB, async () => {
  const { rows } = await db.query("select count(*)::int as n from public.products");
  assert.equal(rows[0].n, 1, "el local suspendido sigue viendo su menú");
  // Lo frena la base (trigger o RLS): o lanza, o no cambia ninguna fila.
  const cambio = await db
    .query("update public.products set price = 1 where tenant_id = $1 returning id", [B])
    .then((r) => r.rows.length, () => 0);
  assert.equal(cambio, 0, "el local suspendido no cambia su menú");
});

const precio = await db.query("select price::numeric as p from public.products where tenant_id = $1", [B]);
assert.equal(Number(precio.rows[0].p), 3500, "el precio del local suspendido quedó igual");

await db.close();
console.log(`esquema: ok (schema.sql dos veces, verify.sql ${filas.length}/51, aislamiento por RLS)`);
