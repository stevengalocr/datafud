-- =====================================================================
-- DataFud — Digital Menu SaaS · schema.sql (idempotente)
-- Multi-tenant (tenant_id + RLS). Correr completo en Supabase SQL Editor
-- o:  psql "$DBURL" -f supabase/schema.sql
-- Es seguro correrlo varias veces (idempotente).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0) Extensiones y enums
-- ---------------------------------------------------------------------
begin;

create extension if not exists pgcrypto;

do $$ begin
  create type user_role as enum ('super_admin','restaurant_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tenant_status as enum ('trial','active','suspended','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pending','preparing','ready','delivered','paid','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending','paid','overdue');
exception when duplicate_object then null; end $$;

-- Cargos puntuales (no mensualidad): implementación llave en mano y tarjetas NFC.
do $$ begin
  create type charge_kind as enum ('implementation','nfc_cards','other');
exception when duplicate_object then null; end $$;

commit;

-- ---------------------------------------------------------------------
-- 1) Tablas core
-- ---------------------------------------------------------------------
begin;

create table if not exists public.currencies (
  code text primary key,
  name text not null,
  symbol text not null,
  decimal_digits int not null default 2
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  price_usd numeric(10,2) not null,
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  status tenant_status not null default 'trial',
  plan_id uuid references public.plans(id),
  trial_ends_at timestamptz,
  owner_email text,
  owner_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  role user_role not null default 'restaurant_admin',
  full_name text,
  created_at timestamptz not null default now()
);
create index if not exists idx_profiles_tenant on public.profiles(tenant_id);

create table if not exists public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  plan_id uuid references public.plans(id),
  amount_usd numeric(10,2) not null,
  period_start date not null,
  period_end date not null,
  paid_at timestamptz,
  status payment_status not null default 'pending',
  approved_by uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_payments_tenant on public.subscription_payments(tenant_id);

-- Cargos puntuales por tenant: implementación única ($249) y pedidos de NFC ($15/u).
-- Se registran y gestionan manualmente por el super admin, igual que las mensualidades.
create table if not exists public.tenant_charges (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  kind charge_kind not null default 'other',
  description text,
  quantity int not null default 1 check (quantity > 0),
  unit_amount_usd numeric(10,2) not null default 0,
  amount_usd numeric(10,2) not null default 0,
  status payment_status not null default 'pending',
  paid_at timestamptz,
  approved_by uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_charges_tenant on public.tenant_charges(tenant_id);

commit;

-- ---------------------------------------------------------------------
-- 2) Tablas de menú
-- ---------------------------------------------------------------------
begin;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name_i18n jsonb not null default '{}'::jsonb,
  description_i18n jsonb not null default '{}'::jsonb,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_categories_tenant on public.categories(tenant_id);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  -- La sección 13 (S15) cambia esta FK por (tenant_id, category_id): la categoría es del mismo negocio.
  category_id uuid references public.categories(id) on delete set null,
  name_i18n jsonb not null default '{}'::jsonb,
  description_i18n jsonb not null default '{}'::jsonb,
  price numeric(12,2) not null default 0,
  image_url text,
  is_available boolean not null default true,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_tenant on public.products(tenant_id);
create index if not exists idx_products_category on public.products(category_id);

create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  label text not null,
  qr_token uuid not null unique default gen_random_uuid(),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_tables_tenant on public.tables(tenant_id);

commit;

-- ---------------------------------------------------------------------
-- 3) Tablas de órdenes (con snapshots de precio/nombre)
-- ---------------------------------------------------------------------
begin;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  -- La sección 13 (S15) cambia esta FK por (tenant_id, table_id): la mesa es del mismo negocio.
  table_id uuid references public.tables(id) on delete set null,
  status order_status not null default 'pending',
  currency_code text references public.currencies(code),
  subtotal numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  customer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_tenant on public.orders(tenant_id);
create index if not exists idx_orders_created on public.orders(tenant_id, created_at);
-- Para el límite de pedidos por mesa de place_order (S4).
create index if not exists idx_orders_table_created on public.orders(table_id, created_at);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  -- La sección 13 (S15) cambia las FK de order_id y product_id por compuestas con tenant_id.
  order_id uuid not null references public.orders(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name_snapshot text not null,
  unit_price_snapshot numeric(12,2) not null,
  quantity int not null default 1 check (quantity > 0),
  line_total numeric(12,2) not null default 0,
  note text
);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_tenant on public.order_items(tenant_id);

commit;

-- ---------------------------------------------------------------------
-- 4) Configuración por tenant
-- ---------------------------------------------------------------------
begin;

create table if not exists public.tenant_settings (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  currency_code text not null default 'USD' references public.currencies(code),
  default_language text not null default 'es',
  enabled_languages text[] not null default array['es'],
  theme jsonb not null default '{}'::jsonb,
  logo_url text,
  restaurant_name text,
  address text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

commit;

-- ---------------------------------------------------------------------
-- 5) Funciones helper y triggers
-- ---------------------------------------------------------------------
begin;

create or replace function public.current_tenant_id()
returns uuid language sql stable security definer set search_path = public as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'super_admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['tenants','categories','products','tables','orders','tenant_settings']
  loop
    execute format('drop trigger if exists trg_updated_at on public.%I;', t);
    execute format('create trigger trg_updated_at before update on public.%I
                    for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- Límite de plan genérico (max_products / max_categories / max_tables)
create or replace function public.enforce_plan_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_limit_key text := tg_argv[0];
  v_limit int;
  v_count int;
begin
  select (p.features ->> v_limit_key)::int into v_limit
  from public.tenants te join public.plans p on p.id = te.plan_id
  where te.id = new.tenant_id;

  if v_limit is null then
    return new;            -- null = ilimitado
  end if;

  execute format('select count(*) from public.%I where tenant_id = $1', tg_table_name)
    into v_count using new.tenant_id;

  if v_count >= v_limit then
    raise exception 'Límite del plan alcanzado para % (máx %)', v_limit_key, v_limit;
  end if;
  return new;
end $$;

drop trigger if exists trg_limit_products on public.products;
create trigger trg_limit_products before insert on public.products
  for each row execute function public.enforce_plan_limit('max_products');

drop trigger if exists trg_limit_categories on public.categories;
create trigger trg_limit_categories before insert on public.categories
  for each row execute function public.enforce_plan_limit('max_categories');

drop trigger if exists trg_limit_tables on public.tables;
create trigger trg_limit_tables before insert on public.tables
  for each row execute function public.enforce_plan_limit('max_tables');

commit;

-- ---------------------------------------------------------------------
-- 6) Row-Level Security
-- ---------------------------------------------------------------------
begin;

do $$
declare t text;
begin
  foreach t in array array['tenants','profiles','subscription_payments','plans',
                           'tenant_charges','currencies',
                           'categories','products','tables','orders','order_items',
                           'tenant_settings']
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- CURRENCIES (S3): catálogo de solo lectura para usuarios con sesión. Nadie
-- escribe por la API; la semilla de la sección 8 corre como dueño.
drop policy if exists currencies_read on public.currencies;
create policy currencies_read on public.currencies for select to authenticated
  using (true);

-- PLANS
drop policy if exists plans_read on public.plans;
create policy plans_read on public.plans for select using (true);
drop policy if exists plans_write on public.plans;
create policy plans_write on public.plans for all
  using (public.is_super_admin()) with check (public.is_super_admin());

-- PROFILES
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for select
  using (id = auth.uid() or public.is_super_admin());

-- TENANTS
drop policy if exists tenants_super on public.tenants;
create policy tenants_super on public.tenants for all
  using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists tenants_own_read on public.tenants;
create policy tenants_own_read on public.tenants for select
  using (id = public.current_tenant_id());

-- SUBSCRIPTION_PAYMENTS
drop policy if exists payments_super on public.subscription_payments;
create policy payments_super on public.subscription_payments for all
  using (public.is_super_admin()) with check (public.is_super_admin());

-- TENANT_CHARGES (implementación + NFC): el super admin gestiona todo;
-- el restaurante solo puede leer sus propios cargos.
drop policy if exists charges_super on public.tenant_charges;
create policy charges_super on public.tenant_charges for all
  using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists charges_own_read on public.tenant_charges;
create policy charges_own_read on public.tenant_charges for select
  using (tenant_id = public.current_tenant_id());

-- NOTA: el rol anónimo (cliente final) NO accede directamente a estas tablas.
-- El menú público y el envío de órdenes se hacen mediante las funciones
-- SECURITY DEFINER get_menu() y place_order() (sección 7b), que validan el
-- slug + qr_token y exponen únicamente datos seguros. Así ningún anónimo puede
-- leer datos de otros negocios ni columnas sensibles.

-- CATEGORIES
drop policy if exists categories_tenant on public.categories;
create policy categories_tenant on public.categories for all
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

-- PRODUCTS
drop policy if exists products_tenant on public.products;
create policy products_tenant on public.products for all
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

-- TABLES
drop policy if exists tables_tenant on public.tables;
create policy tables_tenant on public.tables for all
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

-- ORDERS
drop policy if exists orders_tenant on public.orders;
create policy orders_tenant on public.orders for all
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

-- ORDER_ITEMS
drop policy if exists order_items_tenant on public.order_items;
create policy order_items_tenant on public.order_items for all
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

-- TENANT_SETTINGS
drop policy if exists settings_tenant on public.tenant_settings;
create policy settings_tenant on public.tenant_settings for all
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

commit;

-- ---------------------------------------------------------------------
-- 7b) RPCs públicas para el menú del cliente (rol anon)
-- ---------------------------------------------------------------------
begin;

-- Devuelve el menú completo y seguro para una mesa (slug + qr_token).
create or replace function public.get_menu(p_slug text, p_token uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_tenant public.tenants;
  v_table public.tables;
  v_settings public.tenant_settings;
  v_result jsonb;
begin
  select * into v_tenant from public.tenants where slug = p_slug;
  if not found or v_tenant.status not in ('active','trial') then
    return null;
  end if;

  select * into v_table from public.tables
    where qr_token = p_token and tenant_id = v_tenant.id and is_active;
  if not found then
    return null;
  end if;

  select * into v_settings from public.tenant_settings where tenant_id = v_tenant.id;

  select jsonb_build_object(
    'tenant', jsonb_build_object('id', v_tenant.id, 'name', v_tenant.name, 'slug', v_tenant.slug),
    'table', jsonb_build_object('id', v_table.id, 'label', v_table.label),
    'settings', jsonb_build_object(
       'currency_code', coalesce(v_settings.currency_code, 'USD'),
       'default_language', coalesce(v_settings.default_language, 'es'),
       'enabled_languages', coalesce(v_settings.enabled_languages, array['es']),
       'theme', coalesce(v_settings.theme, '{}'::jsonb),
       'logo_url', v_settings.logo_url,
       'restaurant_name', coalesce(v_settings.restaurant_name, v_tenant.name)
    ),
    'categories', coalesce((
       select jsonb_agg(jsonb_build_object(
                'id', c.id, 'name_i18n', c.name_i18n, 'sort_order', c.sort_order)
              order by c.sort_order)
       from public.categories c
       where c.tenant_id = v_tenant.id and c.is_active
    ), '[]'::jsonb),
    'products', coalesce((
       select jsonb_agg(jsonb_build_object(
                'id', p.id, 'category_id', p.category_id, 'name_i18n', p.name_i18n,
                'description_i18n', p.description_i18n, 'price', p.price,
                'image_url', p.image_url, 'sort_order', p.sort_order)
              order by p.sort_order)
       from public.products p
       where p.tenant_id = v_tenant.id and p.is_active and p.is_available
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end $$;

revoke all on function public.get_menu(text, uuid) from public;
grant execute on function public.get_menu(text, uuid) to anon, authenticated;

-- Crea una orden validando el slug + qr_token. Calcula precios reales server-side.
create or replace function public.place_order(
  p_slug text, p_token uuid, p_items jsonb, p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant public.tenants;
  v_table public.tables;
  v_currency text;
  v_order_id uuid;
  v_item jsonb;
  v_product public.products;
  v_qty int;
  v_subtotal numeric(12,2) := 0;
  v_line numeric(12,2);
begin
  select * into v_tenant from public.tenants where slug = p_slug;
  if not found or v_tenant.status not in ('active','trial') then
    raise exception 'Restaurante no disponible';
  end if;

  select * into v_table from public.tables
    where qr_token = p_token and tenant_id = v_tenant.id and is_active;
  if not found then
    raise exception 'Mesa no válida';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'La orden no tiene platillos';
  end if;

  -- S4: topes por pedido y frecuencia por mesa y por local, para que un QR no sirva para
  -- llenar el tablero de un restaurante. Los dos conteos filtran por el negocio (S15): las
  -- órdenes de otro negocio nunca cuentan para el tope de esta mesa.
  if jsonb_array_length(p_items) > 30 then
    raise exception 'Un pedido lleva como máximo 30 platillos distintos';
  end if;
  if (select count(*) from public.orders
       where tenant_id = v_tenant.id and table_id = v_table.id and created_at > now() - interval '10 minutes') >= 10 then
    raise exception 'Hay muchos pedidos seguidos desde esta mesa. Esperá unos minutos o llamá al salonero';
  end if;
  if (select count(*) from public.orders
       where tenant_id = v_tenant.id and created_at > now() - interval '1 minute') >= 60 then
    raise exception 'El restaurante está recibiendo muchos pedidos. Probá de nuevo en un minuto';
  end if;

  select coalesce(currency_code, 'USD') into v_currency
    from public.tenant_settings where tenant_id = v_tenant.id;
  if v_currency is null then v_currency := 'USD'; end if;

  insert into public.orders (tenant_id, table_id, status, currency_code, subtotal, total, customer_note)
  values (v_tenant.id, v_table.id, 'pending', v_currency, 0, 0, nullif(left(trim(coalesce(p_note, '')), 300), ''))
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := greatest(1, coalesce((v_item->>'quantity')::int, 1));
    if v_qty > 20 then
      raise exception 'La cantidad máxima por platillo es 20';
    end if;
    select * into v_product from public.products
      where id = (v_item->>'product_id')::uuid
        and tenant_id = v_tenant.id and is_active and is_available;
    if found then
      v_line := v_product.price * v_qty;
      v_subtotal := v_subtotal + v_line;
      insert into public.order_items (order_id, tenant_id, product_id, product_name_snapshot,
                                       unit_price_snapshot, quantity, line_total, note)
      values (v_order_id, v_tenant.id, v_product.id,
              coalesce(v_product.name_i18n->>'es', v_product.name_i18n->>'en', 'Producto'),
              v_product.price, v_qty, v_line, nullif(left(trim(coalesce(v_item->>'note', '')), 200), ''));
    end if;
  end loop;

  if v_subtotal = 0 then
    delete from public.orders where id = v_order_id;
    raise exception 'Ningún platillo válido en la orden';
  end if;

  update public.orders set subtotal = v_subtotal, total = v_subtotal where id = v_order_id;
  return v_order_id;
end $$;

revoke all on function public.place_order(text, uuid, jsonb, text) from public;
grant execute on function public.place_order(text, uuid, jsonb, text) to anon, authenticated;

commit;

-- ---------------------------------------------------------------------
-- 7) Vistas de reportes
-- security_invoker (S1): la vista corre con los permisos de quien consulta,
-- así que el RLS de orders y order_items filtra por negocio. Sin esto, la
-- vista corre como su dueño y un restaurante ve las ventas de otro.
-- La opción va dentro del create: un "create or replace" futuro no la pierde.
-- ---------------------------------------------------------------------
begin;

create or replace view public.v_daily_sales with (security_invoker = true) as
select
  o.tenant_id,
  date_trunc('day', o.created_at)::date as day,
  count(*) as orders_count,
  sum(o.total) as revenue,
  avg(o.total) as avg_ticket,
  o.currency_code
from public.orders o
where o.status in ('delivered','paid')
group by o.tenant_id, date_trunc('day', o.created_at), o.currency_code;

create or replace view public.v_top_products with (security_invoker = true) as
select
  oi.tenant_id,
  date_trunc('day', o.created_at)::date as day,
  oi.product_id,
  oi.product_name_snapshot as product_name,
  sum(oi.quantity) as units_sold,
  sum(oi.line_total) as revenue
from public.order_items oi
join public.orders o on o.id = oi.order_id
where o.status in ('delivered','paid')
group by oi.tenant_id, date_trunc('day', o.created_at), oi.product_id, oi.product_name_snapshot;

create or replace view public.v_order_summary with (security_invoker = true) as
select
  tenant_id,
  status,
  count(*) as orders_count,
  coalesce(sum(total),0) as total_amount
from public.orders
group by tenant_id, status;

commit;

-- ---------------------------------------------------------------------
-- 8) Semilla: monedas (Latam + USD)
-- ---------------------------------------------------------------------
begin;

insert into public.currencies (code, name, symbol, decimal_digits) values
  ('ARS','Peso argentino','$',2),
  ('BOB','Boliviano','Bs',2),
  ('BRL','Real brasileño','R$',2),
  ('CLP','Peso chileno','$',0),
  ('COP','Peso colombiano','$',2),
  ('CRC','Colón costarricense','₡',2),
  ('CUP','Peso cubano','$',2),
  ('DOP','Peso dominicano','RD$',2),
  ('GTQ','Quetzal','Q',2),
  ('HNL','Lempira','L',2),
  ('MXN','Peso mexicano','$',2),
  ('NIO','Córdoba','C$',2),
  ('PAB','Balboa','B/.',2),
  ('PYG','Guaraní','₲',0),
  ('PEN','Sol','S/',2),
  ('UYU','Peso uruguayo','$U',2),
  ('VES','Bolívar','Bs.',2),
  ('USD','Dólar estadounidense','$',2)
on conflict (code) do update
  set name = excluded.name, symbol = excluded.symbol, decimal_digits = excluded.decimal_digits;

commit;

-- ---------------------------------------------------------------------
-- 9) Semilla: planes
-- ---------------------------------------------------------------------
begin;

insert into public.plans (code, name, price_usd, sort_order, features) values
  ('basico','Básico',29.00,1, jsonb_build_object(
     'max_languages',2,'max_products',60,'max_categories',5,'max_tables',8,
     'advanced_reports',false,'full_branding',false)),
  ('estandar','Estándar',49.00,2, jsonb_build_object(
     'max_languages',2,'max_products',150,'max_categories',20,'max_tables',30,
     'advanced_reports',true,'full_branding',true)),
  ('empresarial','Empresarial',99.00,3, jsonb_build_object(
     'max_languages',3,'max_products',null,'max_categories',null,'max_tables',null,
     'advanced_reports',true,'full_branding',true))
on conflict (code) do update
  set name = excluded.name, price_usd = excluded.price_usd,
      features = excluded.features, sort_order = excluded.sort_order;

commit;

-- ---------------------------------------------------------------------
-- 10) Semillas de usuarios y datos demo: YA NO VIVEN AQUÍ.
-- Este archivo no crea usuarios, correos ni contraseñas. Para un entorno de
-- desarrollo corré supabase/seed.dev.sql (pide la contraseña por variable de
-- psql). En producción el super admin se crea a mano desde Authentication en
-- el panel de Supabase y su fila en public.profiles con role = 'super_admin'.
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- 11) Permisos de la Data API (S1)
-- Desde el 2026-05-30 un proyecto nuevo de Supabase no da permisos sobre las
-- tablas nuevas a los roles de la API: se dan aquí, explícitos.
--   anon           -> nada sobre tablas ni vistas; solo ejecuta get_menu y
--                     place_order (sección 7b).
--   authenticated  -> lee y escribe; el RLS de la sección 6 decide qué filas
--                     y qué operaciones. Vistas: solo lectura.
--   service_role   -> igual que authenticated (salta el RLS por diseño; solo
--                     la usa registerAction en el servidor).
-- Idempotente: revoke y grant se pueden correr varias veces.
-- ---------------------------------------------------------------------
begin;

revoke all on all tables in schema public from anon;

grant select, insert, update, delete on
  public.currencies, public.plans, public.tenants, public.profiles,
  public.subscription_payments, public.tenant_charges, public.categories,
  public.products, public.tables, public.orders, public.order_items,
  public.tenant_settings
  to authenticated, service_role;

revoke all on public.v_daily_sales, public.v_top_products, public.v_order_summary
  from authenticated, service_role;
grant select on public.v_daily_sales, public.v_top_products, public.v_order_summary
  to authenticated, service_role;

-- Helpers que usan las políticas: solo para quien tiene sesión. En Supabase el esquema public
-- trae privilegios por defecto que dan EXECUTE a anon sobre toda función nueva, así que no
-- alcanza con revocar a PUBLIC: se revoca a anon explícitamente.
revoke all on function public.current_tenant_id() from public, anon;
revoke all on function public.current_user_role() from public, anon;
revoke all on function public.is_super_admin() from public, anon;
-- Funciones de trigger: nadie las llama por la API (los triggers no piden EXECUTE al dispararse).
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.enforce_plan_limit() from public, anon, authenticated;
grant execute on function public.current_tenant_id() to authenticated, service_role;
grant execute on function public.current_user_role() to authenticated, service_role;
grant execute on function public.is_super_admin() to authenticated, service_role;

commit;

-- ---------------------------------------------------------------------
-- 12) Storage: fotos de platillos y logos (bucket "media")
-- Público para leer: el comensal ve las fotos del menú sin sesión (la lectura la da el bucket
-- público, por la URL del objeto; NO hay política de select y anon no recibe ninguna).
-- Escribir: solo usuarios con sesión (authenticated), y solo dentro de la carpeta de su negocio:
-- el nombre del objeto empieza con "<tenant_id>/" (la app sube a <tenant_id>/products|logo/<uuid>.<ext>).
-- El super admin puede en cualquier carpeta. Límite de 2 MB y solo jpeg/png/webp, que el servidor
-- de Storage hace cumplir. Idempotente.
-- ---------------------------------------------------------------------
begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists media_tenant_insert on storage.objects;
create policy media_tenant_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'media'
    and ((storage.foldername(name))[1] = public.current_tenant_id()::text or public.is_super_admin())
  );

drop policy if exists media_tenant_update on storage.objects;
create policy media_tenant_update on storage.objects for update to authenticated
  using (
    bucket_id = 'media'
    and ((storage.foldername(name))[1] = public.current_tenant_id()::text or public.is_super_admin())
  )
  with check (
    bucket_id = 'media'
    and ((storage.foldername(name))[1] = public.current_tenant_id()::text or public.is_super_admin())
  );

drop policy if exists media_tenant_delete on storage.objects;
create policy media_tenant_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'media'
    and ((storage.foldername(name))[1] = public.current_tenant_id()::text or public.is_super_admin())
  );

commit;

-- ---------------------------------------------------------------------
-- 13) Referencias dentro del mismo negocio (S15)
-- RLS solo mira el tenant_id de la fila y las FK no pasan por RLS: con FK de una sola columna,
-- el negocio B podía crear en su negocio un platillo con la categoría de A, o una orden con la
-- mesa de A (get_menu entrega esos id a quien tenga el QR), y así llenar el tope de pedidos de
-- esa mesa o quedar colgado de los borrados de A. Desde aquí cada referencia entre tablas de
-- negocio es una FK compuesta (tenant_id, <columna>) -> padre (tenant_id, id): la fila referida
-- tiene que ser del mismo negocio, lo valida Postgres al insertar y al modificar, en los dos
-- lados. Al borrar el padre, "set null (<columna>)" vacía solo la referencia (no el tenant_id;
-- necesita Postgres 15 o más) y order_items se sigue borrando con su orden.
--   products.category_id   -> categories   on delete set null (category_id)
--   orders.table_id        -> tables       on delete set null (table_id)
--   order_items.order_id   -> orders       on delete cascade
--   order_items.product_id -> products     on delete set null (product_id)
-- Las demás FK de schema.sql apuntan a tenants (la propia), a catálogos globales (plans,
-- currencies) o a auth.users (approved_by, que solo escribe el super admin): no cruzan negocios.
-- Idempotente y sobre una base con datos: si alguna fila existente ya apunta a otro negocio,
-- esa referencia NO se cambia, se avisa con un WARNING (con la consulta para listar las filas)
-- y verify.sql la marca en false; no borra ni modifica datos. Corregir esas filas y volver a
-- correr schema.sql. Todo dentro de una transacción: o queda aplicado o queda como estaba.
-- ---------------------------------------------------------------------
begin;

-- Padres: unique (tenant_id, id), que la FK compuesta necesita. Siempre se puede agregar: id ya es único.
do $$
declare
  r record;
begin
  for r in
    select * from (values
      ('categories', 'categories_tenant_id_id_key'),
      ('products',   'products_tenant_id_id_key'),
      ('tables',     'tables_tenant_id_id_key'),
      ('orders',     'orders_tenant_id_id_key')
    ) v(tabla, nombre)
  loop
    if not exists (select 1 from pg_constraint
                    where conrelid = format('public.%I', r.tabla)::regclass and conname = r.nombre) then
      execute format('alter table public.%I add constraint %I unique (tenant_id, id)', r.tabla, r.nombre);
    end if;
  end loop;
end $$;

-- Hijas: FK compuesta en lugar de la de una columna.
do $$
declare
  r record;
  v_consulta text;
  v_malas bigint;
  v_vieja name;
begin
  if current_setting('server_version_num')::int < 150000 then
    raise warning 'S15: este Postgres es anterior al 15 (no tiene "on delete set null (columna)"). No se cambió ninguna referencia; verify.sql lo marca en false.';
    return;
  end if;

  for r in
    select * from (values
      ('products',    'category_id', 'categories', 'products_category_same_tenant_fkey',    'on delete set null (category_id)'),
      ('orders',      'table_id',    'tables',     'orders_table_same_tenant_fkey',         'on delete set null (table_id)'),
      ('order_items', 'order_id',    'orders',     'order_items_order_same_tenant_fkey',    'on delete cascade'),
      ('order_items', 'product_id',  'products',   'order_items_product_same_tenant_fkey',  'on delete set null (product_id)')
    ) v(hija, col, padre, nombre, al_borrar)
  loop
    if not exists (select 1 from pg_constraint
                    where conrelid = format('public.%I', r.hija)::regclass and conname = r.nombre) then
      -- Antes de cambiarla: ¿hay filas que ya apuntan a otro negocio?
      v_consulta := format(
        'select h.id, h.tenant_id, h.%1$I, p.tenant_id as tenant_del_padre from public.%2$I h join public.%3$I p on p.id = h.%1$I where p.tenant_id <> h.tenant_id',
        r.col, r.hija, r.padre);
      execute format('select count(*) from (%s) x', v_consulta) into v_malas;
      if v_malas > 0 then
        raise warning 'S15: % fila(s) de %.% apuntan a % de otro negocio. Esa referencia NO se cambió (sigue la FK de una columna). Para verlas: %',
          v_malas, r.hija, r.col, r.padre, v_consulta;
        continue;
      end if;
      execute format(
        'alter table public.%I add constraint %I foreign key (tenant_id, %I) references public.%I (tenant_id, id) %s',
        r.hija, r.nombre, r.col, r.padre, r.al_borrar);
    end if;

    -- Con la compuesta puesta, la FK vieja de una sola columna sobra: se quita (por estructura, no por nombre).
    for v_vieja in
      select c.conname
        from pg_constraint c
       where c.conrelid = format('public.%I', r.hija)::regclass
         and c.contype = 'f'
         and c.confrelid = format('public.%I', r.padre)::regclass
         and c.conkey = array[(select a.attnum from pg_attribute a
                                where a.attrelid = c.conrelid and a.attname = r.col)]::int2[]
    loop
      execute format('alter table public.%I drop constraint %I', r.hija, v_vieja);
    end loop;
  end loop;
end $$;

commit;

-- =====================================================================
-- Fin de schema.sql
-- =====================================================================
