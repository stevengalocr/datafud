#!/usr/bin/env node
// Prueba de aislamiento entre dos negocios (cierra D-018).
//
//   AISLAMIENTO_A_EMAIL=... AISLAMIENTO_A_PASSWORD=... \
//   AISLAMIENTO_B_EMAIL=... AISLAMIENTO_B_PASSWORD=... \
//   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
//   node scripts/prueba-aislamiento.mjs
//
// Qué hace: inicia sesión como el negocio A y como el negocio B (dos usuarios restaurant_admin
// de locales distintos, por ejemplo test y test2) y, con la sesión de B, intenta leer y tocar
// los datos de A. También prueba al rol anónimo (sin sesión). Las tablas y vistas son las de
// supabase/schema.sql: si se agrega una, se agrega acá (ver TABLAS y VISTAS).
//
// Comprobaciones (una línea ok / FALLA cada una):
//   - B lee cada tabla y vista de negocio: cero filas de A (cualquier fila ajena cuenta como FALLA).
//   - B inserta con el tenant_id de A en categories, products, tables y orders: debe fallar.
//   - S15: B crea en SU negocio filas que apuntan a filas de A (un platillo con la categoría de A,
//     una orden con la mesa de A, líneas con la orden o el platillo de A, y cambiar la categoría
//     de un platillo propio por la de A): debe fallar por la FK compuesta de la sección 13 de
//     schema.sql (código 23503 con el nombre de esa FK). Desde 1.7.0 nadie con sesión inserta
//     órdenes ni líneas (entran solo por place_order): en esas tres, el rechazo por permisos
//     también cuenta como ok. Si B lo logra, es FALLA. Lo que B cree en su negocio lo borra B.
//   - B tampoco puede insertar una orden en su propio negocio (control de 1.7.0).
//   - B hace update y delete sobre filas de A por id: deben afectar cero filas (y A las ve intactas).
//   - Si existe el bucket `media`: B sube a la carpeta <tenant_id de A>/: debe fallar. A lista su
//     propia carpeta y ve su archivo (control de la política de select de 1.7.0); B no lo ve.
//     Si el bucket no existe, la comprobación se omite (no cuenta como FALLA).
//   - Sin sesión (anon): leer cualquiera de esas tablas devuelve cero filas o error.
//
// Para tener filas de A con qué probar, A (sesión legítima) crea unas filas marcadas con
// "zz-aislamiento" y el script las borra al final, también si algo falla. La orden de A se crea
// como la crea un comensal, con place_order en la mesa de prueba: el local de A tiene que estar
// activo y en un plan con pedidos desde la mesa (Estándar o Empresarial). Lo que B logre crear
// por error se reporta como FALLA y se intenta borrar. Las pruebas de update sobre `tenants` y
// `tenant_settings` reescriben el mismo valor que ya tenían, así que no cambian nada si pasaran.
//
// Importante: A y B deben ser usuarios de restaurante (no super admin) de locales distintos.
// El script se niega a correr si alguno es super admin, porque esa prueba no probaría nada.
// Nunca imprime contraseñas ni tokens. No correrlo con claves de otro proyecto que no sea el
// que querés probar: escribe y borra filas de prueba con la sesión de A.
//
// Un rechazo solo cuenta como ok si lo hizo RLS o los permisos (código 42501 o el mensaje de RLS o de
// permisos; un 403 genérico no basta); en las referencias de la sección 2b, solo si lo hizo la FK
// compuesta esperada (23503 + su nombre). Cualquier otro
// error (límite del plan de A, red, sesión vencida) es "inconcluso": no prueba nada y la corrida
// no queda verde. Lo mismo si falta una fila de A para probar update/delete.
// Si el script se corta de golpe, las filas de prueba son las de A y las de B con "zz-aislamiento"
// en el nombre, la etiqueta o la nota: borrarlas a mano.
//
// Salida: exit 0 si todo pasa, 1 si algo falla (hay fuga), 2 si faltan variables, no se pudo preparar
// o se interrumpió, 3 si quedó incompleta (alguna comprobación inconclusa; no es una prueba válida).

import { createClient } from "@supabase/supabase-js";

const MARCA = "zz-aislamiento";

// Tablas con tenant_id (o `id` en tenants), de schema.sql. `clave` es la columna que dice de quién es la fila.
const TABLAS = [
  { nombre: "tenants", clave: "id" },
  { nombre: "profiles", clave: "tenant_id" },
  { nombre: "tenant_settings", clave: "tenant_id" },
  { nombre: "categories", clave: "tenant_id" },
  { nombre: "products", clave: "tenant_id" },
  { nombre: "tables", clave: "tenant_id" },
  { nombre: "orders", clave: "tenant_id" },
  { nombre: "order_items", clave: "tenant_id" },
  { nombre: "subscription_payments", clave: "tenant_id" },
  { nombre: "tenant_charges", clave: "tenant_id" },
];
// Vistas de reportes (sección 7 y 11 de schema.sql), todas con security_invoker.
const VISTAS = ["v_daily_sales", "v_top_products", "v_order_summary"].map((nombre) => ({ nombre, clave: "tenant_id" }));
// Catálogos globales sin tenant_id (plans, currencies): no se prueban, no son datos de un negocio.

const ENV = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  aEmail: process.env.AISLAMIENTO_A_EMAIL,
  aPass: process.env.AISLAMIENTO_A_PASSWORD,
  bEmail: process.env.AISLAMIENTO_B_EMAIL,
  bPass: process.env.AISLAMIENTO_B_PASSWORD,
};

const faltan = [
  ["NEXT_PUBLIC_SUPABASE_URL", ENV.url],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", ENV.anon],
  ["AISLAMIENTO_A_EMAIL", ENV.aEmail],
  ["AISLAMIENTO_A_PASSWORD", ENV.aPass],
  ["AISLAMIENTO_B_EMAIL", ENV.bEmail],
  ["AISLAMIENTO_B_PASSWORD", ENV.bPass],
]
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (faltan.length) {
  console.error(`Prueba de aislamiento entre dos negocios (DataFud)

Faltan variables de entorno: ${faltan.join(", ")}

Cómo correrla (con dos usuarios de restaurante de locales distintos, por ejemplo test y test2):

  NEXT_PUBLIC_SUPABASE_URL=<url del proyecto> \\
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<clave anon> \\
  AISLAMIENTO_A_EMAIL=<correo del usuario A> AISLAMIENTO_A_PASSWORD=<contraseña de A> \\
  AISLAMIENTO_B_EMAIL=<correo del usuario B> AISLAMIENTO_B_PASSWORD=<contraseña de B> \\
  node scripts/prueba-aislamiento.mjs

Con la sesión de B intenta leer y escribir los datos de A; también prueba al rol anónimo.
Crea unas filas de prueba con la sesión de A y las borra al final. Detalle en el comentario
al inicio de scripts/prueba-aislamiento.mjs.
Salida: 0 si todo pasa, 1 si algo falla, 2 si faltan variables o no se pudo preparar,
3 si quedó incompleta (alguna comprobación inconclusa).`);
  process.exit(2);
}

// ---------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------
let fallas = 0;
let oks = 0;
let omitidas = 0;
let avisos = 0;
let inconclusas = 0;

const ok = (msg) => {
  oks++;
  console.log(`ok     ${msg}`);
};
const falla = (msg) => {
  fallas++;
  console.log(`FALLA  ${msg}`);
};
const omitido = (msg) => {
  omitidas++;
  console.log(`omitido ${msg}`);
};
const aviso = (msg) => {
  avisos++;
  console.log(`aviso  ${msg}`);
};
const inconcluso = (msg) => {
  inconclusas++;
  console.log(`inconcluso ${msg}`);
};
const resultado = (pasa, msgOk, msgFalla) => (pasa ? ok(msgOk) : falla(msgFalla));

// Un rechazo solo cuenta como prueba de aislamiento si lo hizo RLS / los permisos: código 42501 o el
// mensaje de RLS («new row violates row-level security policy», «permission denied»). Un 403 o un
// «Unauthorized» genérico no basta (Storage los devuelve también con un JWT vencido): es inconcluso,
// igual que cualquier otro error (límite de plan, red, NOT NULL).
const esRls = (e) =>
  Boolean(e) && (e.code === "42501" || /row-level security|permission denied/i.test(e.message ?? ""));

// S15: FK compuestas (tenant_id, <columna>) de la sección 13 de schema.sql. Un rechazo de referencia
// cruzada solo vale si lo hizo exactamente esa FK: código 23503 y su nombre en el mensaje.
const FK_MISMO_NEGOCIO = {
  "products.category_id": "products_category_same_tenant_fkey",
  "orders.table_id": "orders_table_same_tenant_fkey",
  "order_items.order_id": "order_items_order_same_tenant_fkey",
  "order_items.product_id": "order_items_product_same_tenant_fkey",
};
const esFkMismoNegocio = (e, referencia) =>
  Boolean(e) && e.code === "23503" && String(e.message ?? "").includes(FK_MISMO_NEGOCIO[referencia]);

// Lectura o escritura que debe afectar cero filas: con error solo vale si lo causó RLS/permisos.
function comprobarCero(error, data, msgOk, msgFalla) {
  if (error) {
    if (esRls(error)) ok(`${msgOk} (rechazado: ${limpio(error)})`);
    else inconcluso(`${msgOk}: error que no es de RLS (${limpio(error)})`);
    return;
  }
  resultado((data ?? []).length === 0, msgOk, msgFalla);
}

// Quita de un mensaje de error cualquier cosa que se parezca a un token.
const limpio = (e) =>
  String(e?.message ?? e ?? "error desconocido")
    .replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[token]")
    .slice(0, 160);

const nuevoCliente = () =>
  createClient(ENV.url, ENV.anon, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });

async function iniciarSesion(etiqueta, email, password) {
  const cliente = nuevoCliente();
  const { data, error } = await cliente.auth.signInWithPassword({ email, password });
  if (error || !data?.user) {
    console.error(`No se pudo iniciar sesión como ${etiqueta}: ${limpio(error)}`);
    process.exit(2);
  }
  const { data: perfil, error: errPerfil } = await cliente
    .from("profiles")
    .select("tenant_id, role")
    .eq("id", data.user.id)
    .maybeSingle();
  if (errPerfil || !perfil) {
    console.error(`${etiqueta}: no se pudo leer su perfil (${limpio(errPerfil)}).`);
    process.exit(2);
  }
  if (perfil.role === "super_admin") {
    console.error(`${etiqueta} es super admin: ve todos los negocios y la prueba no probaría nada. Usá un usuario de restaurante.`);
    process.exit(2);
  }
  if (!perfil.tenant_id) {
    console.error(`${etiqueta} no tiene negocio (profiles.tenant_id vacío).`);
    process.exit(2);
  }
  return { cliente, userId: data.user.id, tenantId: perfil.tenant_id };
}

// Filas visibles para `cliente` en una tabla o vista que no pertenezcan a `propio` (el negocio de quien consulta).
async function filasAjenas(cliente, def, propio) {
  const { data, error } = await cliente.from(def.nombre).select("*").limit(1000);
  if (error) return { error, ajenas: [], total: 0 };
  const filas = data ?? [];
  return { error: null, ajenas: filas.filter((f) => f[def.clave] !== propio), total: filas.length };
}

// ---------------------------------------------------------------------
// Preparación
// ---------------------------------------------------------------------
console.log("Prueba de aislamiento entre dos negocios (DataFud)");
const A = await iniciarSesion("A", ENV.aEmail, ENV.aPass);
const B = await iniciarSesion("B", ENV.bEmail, ENV.bPass);
if (A.tenantId === B.tenantId) {
  console.error("A y B pertenecen al mismo negocio: la prueba necesita dos locales distintos.");
  process.exit(2);
}
console.log(`Sesiones listas: A (negocio ${A.tenantId}) y B (negocio ${B.tenantId}).\n`);

const anon = nuevoCliente();

// Lo que se creó con la sesión legítima de A y hay que borrar al final (en orden inverso).
const limpiezaA = []; // { tabla, id }
// Lo que B creó en su propio negocio (control positivo o referencias cruzadas que no debió lograr): lo borra B, antes que lo de A.
const limpiezaB = []; // { tabla, id }
const archivosAborrar = []; // { cliente, ruta }

// PNG válido de 1x1 píxel: el bucket media solo acepta jpeg/png/webp, así el rechazo que se mide es el de RLS y no el del tipo.
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);
const nuevoPng = () => new Blob([PNG_1X1], { type: "image/png" });

/** ¿Existe el objeto? Por la URL pública (el bucket es público y no hay política de select). true = 200, false = 400/404, null = no se pudo saber. */
async function existeEnMedia(ruta) {
  try {
    const { data } = A.cliente.storage.from("media").getPublicUrl(ruta);
    const res = await fetch(`${data.publicUrl}?t=${Date.now()}`, { cache: "no-store" });
    if (res.status === 200) return true;
    if (res.status === 400 || res.status === 404) return false;
    return null;
  } catch {
    return null;
  }
}

async function crearComoA(tabla, fila) {
  const { data, error } = await A.cliente.from(tabla).insert(fila).select("*").single();
  if (error || !data) {
    aviso(`A no pudo crear una fila de prueba en ${tabla} (${limpio(error)}); esa parte de la prueba es más débil.`);
    return null;
  }
  limpiezaA.push({ tabla, id: data.id });
  return data;
}

async function limpiar() {
  for (const { tabla, id } of limpiezaB.splice(0).reverse()) {
    const { error } = await B.cliente.from(tabla).delete().eq("id", id);
    if (error) aviso(`No se pudo borrar ${tabla}/${id} con B: ${limpio(error)}. Borrarla a mano.`);
  }
  // Desde 1.7.0 cada negocio ve su carpeta (media_tenant_select) y remove() borra lo suyo. Con un
  // schema.sql anterior remove() no borra nada y no avisa: se confirma por la URL pública y, si el
  // archivo sigue, se avisa para borrarlo a mano.
  const sobrantes = [];
  for (const { cliente, ruta } of archivosAborrar.splice(0).reverse()) {
    if (!ruta) continue;
    try {
      await cliente.storage.from("media").remove([ruta]);
    } catch {
      /* mejor esfuerzo */
    }
    if ((await existeEnMedia(ruta)) !== false) sobrantes.push(ruta);
  }
  for (const ruta of [...new Set(sobrantes)]) {
    aviso(`Quedó un archivo de prueba en Storage (bucket media): ${ruta}. Borrarlo a mano en Supabase, Storage, media.`);
  }
  for (const { tabla, id } of limpiezaA.splice(0).reverse()) {
    const { error } = await A.cliente.from(tabla).delete().eq("id", id);
    if (error) aviso(`No se pudo borrar ${tabla}/${id} con A: ${limpio(error)}. Borrarla a mano.`);
  }
}

let semillas = {};
let tenantA = null;
let settingsA = null;
try {
  // Filas de A con qué probar. Las tablas se crean en orden de dependencia.
  const categoria = await crearComoA("categories", { tenant_id: A.tenantId, name_i18n: { es: MARCA } });
  const producto = await crearComoA("products", {
    tenant_id: A.tenantId,
    category_id: categoria?.id ?? null,
    name_i18n: { es: MARCA },
    price: 1,
  });
  const mesa = await crearComoA("tables", { tenant_id: A.tenantId, label: MARCA });
  tenantA = (await A.cliente.from("tenants").select("id, name, slug").eq("id", A.tenantId).maybeSingle()).data;
  // Desde 1.7.0 las órdenes entran solo por place_order: A hace un pedido en su mesa de prueba.
  let orden = null;
  let linea = null;
  if (tenantA?.slug && mesa && producto) {
    const pedido = await A.cliente.rpc("place_order", {
      p_slug: tenantA.slug,
      p_token: mesa.qr_token,
      p_items: [{ product_id: producto.id, quantity: 1 }],
      p_note: MARCA,
    });
    if (pedido.error || typeof pedido.data !== "string") {
      aviso(`A no pudo hacer un pedido de prueba con place_order (${limpio(pedido.error)}); si dice que el local no recibe pedidos, pasalo a un plan con pedidos. Las pruebas de órdenes quedan inconclusas.`);
    } else {
      limpiezaA.push({ tabla: "orders", id: pedido.data }); // sus líneas se borran con la orden
      orden = (await A.cliente.from("orders").select("*").eq("id", pedido.data).maybeSingle()).data;
      linea = (await A.cliente.from("order_items").select("*").eq("order_id", pedido.data).limit(1).maybeSingle()).data;
    }
  }
  semillas = { categories: categoria, products: producto, tables: mesa, orders: orden, order_items: linea };

  settingsA = (await A.cliente.from("tenant_settings").select("tenant_id, restaurant_name").eq("tenant_id", A.tenantId).maybeSingle()).data;

  // -------------------------------------------------------------------
  // 1) Lecturas de B: cero filas de A
  // -------------------------------------------------------------------
  console.log("1) Lecturas con la sesión de B (no debe ver nada de A)");
  for (const def of [...TABLAS, ...VISTAS]) {
    const tipo = VISTAS.includes(def) ? "vista" : "tabla";
    const { error, ajenas, total } = await filasAjenas(B.cliente, def, B.tenantId);
    if (error) {
      // Un error al leer no filtra datos, pero hay que saber por qué (permiso denegado es válido; una tabla que no existe, no).
      if (/does not exist|schema cache|could not find/i.test(error.message ?? "")) {
        falla(`B lee ${tipo} ${def.nombre}: no existe en la base (${limpio(error)}). schema.sql y la base no coinciden.`);
      } else {
        if (esRls(error)) ok(`B lee ${tipo} ${def.nombre}: la API la rechaza (${limpio(error)})`);
        else inconcluso(`B lee ${tipo} ${def.nombre}: error que no es de RLS (${limpio(error)})`);
      }
      continue;
    }
    resultado(
      ajenas.length === 0,
      `B lee ${tipo} ${def.nombre}: ${total} fila(s), ninguna de otro negocio`,
      `B lee ${tipo} ${def.nombre}: ve ${ajenas.length} fila(s) de otro negocio`,
    );
  }

  // Lectura dirigida: por id de las filas sembradas de A y por el tenant_id de A.
  for (const [tabla, fila] of Object.entries(semillas)) {
    if (!fila) continue;
    const { data, error } = await B.cliente.from(tabla).select("id").eq("id", fila.id);
    comprobarCero(error, data, `B lee ${tabla} por id de una fila de A: cero filas`, `B lee ${tabla} por id de una fila de A: la ve`);
  }
  for (const def of TABLAS.filter((t) => t.clave === "tenant_id")) {
    const { data, error } = await B.cliente.from(def.nombre).select("*").eq("tenant_id", A.tenantId);
    comprobarCero(
      error,
      data,
      `B filtra ${def.nombre} por el tenant_id de A: cero filas`,
      `B filtra ${def.nombre} por el tenant_id de A: obtiene ${(data ?? []).length} fila(s)`,
    );
  }
  {
    const { data, error } = await B.cliente.from("tenants").select("id").eq("id", A.tenantId);
    comprobarCero(error, data, "B lee tenants por el id de A: cero filas", "B lee tenants por el id de A: ve el negocio");
  }
  // Con qué rigor se probó cada tabla: si A no tiene filas, que B vea cero no demuestra mucho.
  for (const def of TABLAS) {
    if (def.nombre === "profiles") continue;
    const { count } = await A.cliente.from(def.nombre).select("*", { count: "exact", head: true });
    if (!count) aviso(`A no tiene filas en ${def.nombre}: que B vea cero ahí prueba poco (crear datos en A y repetir).`);
  }

  // -------------------------------------------------------------------
  // 2) Inserciones de B con el tenant_id de A
  // -------------------------------------------------------------------
  console.log("\n2) Inserciones de B con el tenant_id de A (deben fallar)");
  const intentos = [
    ["categories", { tenant_id: A.tenantId, name_i18n: { es: `${MARCA}-B` } }],
    ["products", { tenant_id: A.tenantId, name_i18n: { es: `${MARCA}-B` }, price: 1 }],
    ["tables", { tenant_id: A.tenantId, label: `${MARCA}-B` }],
    ["orders", { tenant_id: A.tenantId, customer_note: `${MARCA}-B` }],
  ];
  for (const [tabla, fila] of intentos) {
    const { data, error } = await B.cliente.from(tabla).insert(fila).select("id");
    if (!error && (data ?? []).length > 0) {
      falla(`B inserta en ${tabla} con el tenant_id de A: lo logró`);
      for (const r of data) limpiezaA.push({ tabla, id: r.id }); // A es dueña de la fila: la borra A
    } else if (esRls(error)) {
      ok(`B inserta en ${tabla} con el tenant_id de A: rechazado por RLS (${limpio(error)})`);
    } else {
      inconcluso(`B inserta en ${tabla} con el tenant_id de A: falló por otra causa, no por RLS (${error ? limpio(error) : "sin error y sin filas"}); si A está al tope del plan, borrar filas de A y repetir`);
    }
  }

  // -------------------------------------------------------------------
  // 2b) Referencias de B hacia filas de A (S15)
  // -------------------------------------------------------------------
  console.log("\n2b) B crea en su negocio filas que apuntan a filas de A (deben fallar por la FK del mismo negocio)");
  // Una inserción o un update de B con una referencia a A: ok solo si lo rechaza la FK compuesta esperada.
  const comprobarReferencia = (referencia, { data, error }, tabla, msg, permisosValen = false) => {
    if (!error && (data ?? []).length > 0) {
      falla(`${msg}: lo logró (la referencia cruza de negocio; falta la sección 13 de schema.sql)`);
      if (tabla) for (const r of data) limpiezaB.push({ tabla, id: r.id });
    } else if (esFkMismoNegocio(error, referencia)) {
      ok(`${msg}: rechazado por ${FK_MISMO_NEGOCIO[referencia]}`);
    } else if (permisosValen && esRls(error)) {
      ok(`${msg}: rechazado (con sesión no se insertan órdenes ni líneas; ${limpio(error)})`);
    } else {
      inconcluso(`${msg}: falló por otra causa, no por la FK del mismo negocio (${error ? limpio(error) : "sin error y sin filas"})`);
    }
  };

  // 1.7.0: B no inserta órdenes ni en su propio negocio (entran solo por place_order).
  const ordenB = await B.cliente
    .from("orders")
    .insert({ tenant_id: B.tenantId, customer_note: `${MARCA}-B-propia`, status: "paid", subtotal: 1, total: 1 })
    .select("id");
  if (!ordenB.error && (ordenB.data ?? []).length) {
    for (const r of ordenB.data) limpiezaB.push({ tabla: "orders", id: r.id });
    falla("B inserta una orden directo en su propio negocio: lo logró (falta la sección 6 de schema.sql 1.7.0)");
  } else if (esRls(ordenB.error)) ok("B no puede insertar una orden directo, ni en su negocio: solo por place_order");
  else inconcluso(`B inserta una orden directo en su negocio: falló por otra causa (${limpio(ordenB.error)})`);

  // Control positivo: B crea un platillo en su propio negocio, sin referencias. Sirve de partida
  // para el update de la categoría.
  const productoB = await B.cliente
    .from("products")
    .insert({ tenant_id: B.tenantId, category_id: null, name_i18n: { es: `${MARCA}-B-propio` }, price: 1 })
    .select("id")
    .single();
  if (productoB.data) limpiezaB.push({ tabla: "products", id: productoB.data.id });
  if (productoB.data) ok("B crea un platillo en su propio negocio (control positivo)");
  else aviso(`B no pudo crear un platillo en su propio negocio (${limpio(productoB.error)}); la prueba que lo usa queda inconclusa.`);

  const lineaB = (extra) => ({
    tenant_id: B.tenantId,
    product_name_snapshot: `${MARCA}-B`,
    unit_price_snapshot: 1,
    quantity: 1,
    line_total: 1,
    ...extra,
  });
  const referencias = [
    {
      referencia: "products.category_id",
      semilla: "categories",
      msg: "B inserta en su negocio un platillo con la categoría de A",
      tabla: "products",
      intento: () =>
        B.cliente
          .from("products")
          .insert({ tenant_id: B.tenantId, category_id: semillas.categories.id, name_i18n: { es: `${MARCA}-B` }, price: 1 })
          .select("id"),
    },
    {
      referencia: "orders.table_id",
      semilla: "tables",
      msg: "B inserta en su negocio una orden con la mesa de A",
      tabla: "orders",
      permisosValen: true,
      intento: () =>
        B.cliente.from("orders").insert({ tenant_id: B.tenantId, table_id: semillas.tables.id, customer_note: `${MARCA}-B` }).select("id"),
    },
    {
      referencia: "order_items.order_id",
      semilla: "orders",
      msg: "B inserta en su negocio una línea colgada de una orden de A",
      tabla: "order_items",
      permisosValen: true,
      intento: () => B.cliente.from("order_items").insert(lineaB({ order_id: semillas.orders.id })).select("id"),
    },
    {
      referencia: "order_items.product_id",
      semilla: "products",
      msg: "B inserta en su negocio una línea con el platillo de A",
      tabla: "order_items",
      permisosValen: true,
      // B ya no tiene órdenes propias que no sean de place_order: el id de orden no existe, y
      // el rechazo llega antes (permisos) o por la FK del platillo.
      intento: () =>
        B.cliente
          .from("order_items")
          .insert(lineaB({ order_id: crypto.randomUUID(), product_id: semillas.products.id }))
          .select("id"),
    },
    {
      referencia: "products.category_id",
      semilla: "categories",
      partida: productoB.data,
      msg: "B cambia la categoría de un platillo suyo por la de A (update)",
      tabla: null, // el platillo ya está en limpiezaB
      intento: () => B.cliente.from("products").update({ category_id: semillas.categories.id }).eq("id", productoB.data.id).select("id"),
    },
  ];
  // Una mesa no tiene columnas que apunten a otra tabla de negocio: "una mesa de B ligada a A" solo
  // puede ser una mesa con el tenant_id de A, y eso ya lo prueba la sección 2.
  for (const r of referencias) {
    if (!semillas[r.semilla]) {
      inconcluso(`${r.msg}: A no pudo crear la fila de ${r.semilla} a la que apuntar, no se probó`);
      continue;
    }
    if ("partida" in r && !r.partida) {
      inconcluso(`${r.msg}: B no pudo crear su propia fila de partida, no se probó`);
      continue;
    }
    comprobarReferencia(r.referencia, await r.intento(), r.tabla, r.msg, Boolean(r.permisosValen));
  }

  // -------------------------------------------------------------------
  // 3) Update y delete de B sobre filas de A (por id): cero filas afectadas
  // -------------------------------------------------------------------
  console.log("\n3) Update y delete de B sobre filas de A (deben afectar cero filas)");
  const cambios = {
    categories: { name_i18n: { es: `${MARCA}-tocada-por-B` } },
    products: { price: 999 },
    tables: { label: `${MARCA}-tocada-por-B` },
    orders: { customer_note: `${MARCA}-tocada-por-B` },
    order_items: { note: `${MARCA}-tocada-por-B` },
  };
  for (const [tabla, fila] of Object.entries(semillas)) {
    if (!fila) {
      inconcluso(`update/delete en ${tabla}: A no pudo crear una fila de prueba, no se probó`);
      continue;
    }
    const upd = await B.cliente.from(tabla).update(cambios[tabla]).eq("id", fila.id).select("id");
    comprobarCero(
      upd.error,
      upd.data,
      `B hace update en ${tabla} sobre una fila de A: 0 filas afectadas`,
      `B hace update en ${tabla} sobre una fila de A: modificó ${(upd.data ?? []).length} fila(s)`,
    );
    const del = await B.cliente.from(tabla).delete().eq("id", fila.id).select("id");
    comprobarCero(
      del.error,
      del.data,
      `B hace delete en ${tabla} sobre una fila de A: 0 filas afectadas`,
      `B hace delete en ${tabla} sobre una fila de A: borró ${(del.data ?? []).length} fila(s)`,
    );
    // Verificación del lado de A: la fila sigue y no cambió.
    const { data: sigue } = await A.cliente.from(tabla).select("*").eq("id", fila.id).maybeSingle();
    const intacta = sigue && JSON.stringify(sigue) === JSON.stringify(fila);
    resultado(Boolean(intacta), `A ve su fila de ${tabla} intacta`, `A ve su fila de ${tabla} ${sigue ? "modificada" : "borrada"}`);
  }

  // tenants y tenant_settings: update que reescribe el mismo valor (no destructivo); sin delete a propósito.
  if (tenantA) {
    const { data, error } = await B.cliente.from("tenants").update({ name: tenantA.name }).eq("id", A.tenantId).select("id");
    comprobarCero(
      error,
      data,
      "B hace update en tenants sobre el negocio de A: 0 filas afectadas",
      "B hace update en tenants sobre el negocio de A: modificó el negocio",
    );
  } else {
    inconcluso("update en tenants: A no pudo leer su propio negocio, no se probó");
  }
  if (settingsA) {
    const { data, error } = await B.cliente
      .from("tenant_settings")
      .update({ restaurant_name: settingsA.restaurant_name })
      .eq("tenant_id", A.tenantId)
      .select("tenant_id");
    comprobarCero(
      error,
      data,
      "B hace update en tenant_settings de A: 0 filas afectadas",
      "B hace update en tenant_settings de A: modificó la configuración",
    );
  } else {
    inconcluso("update en tenant_settings: A no tiene fila de configuración, no se probó");
  }

  // -------------------------------------------------------------------
  // 4) Storage: bucket `media`
  // -------------------------------------------------------------------
  console.log("\n4) Storage (bucket media)");
  const ruta = `${A.tenantId}/${MARCA}-${Date.now()}.png`;
  const contenido = nuevoPng();
  const subidaB = await B.cliente.storage.from("media").upload(ruta, contenido, { upsert: false, contentType: "image/png" });
  const sinBucket = (e) =>
    Boolean(e) &&
    (/bucket not found/i.test(e.message ?? "") ||
      (String(e.statusCode ?? e.status ?? "") === "404" && /bucket/i.test(e.message ?? "")));
  if (sinBucket(subidaB.error)) {
    omitido("el bucket media no existe todavía: se omite la prueba de storage");
  } else {
    if (!subidaB.error) {
      archivosAborrar.push({ cliente: B.cliente, ruta });
      archivosAborrar.push({ cliente: A.cliente, ruta });
      falla("B sube un archivo a la carpeta del negocio de A en media: lo logró");
    } else {
      if (esRls(subidaB.error)) ok(`B sube a la carpeta del negocio de A en media: rechazado (${limpio(subidaB.error)})`);
      else inconcluso(`B sube a la carpeta del negocio de A en media: falló por otra causa, no por RLS (${limpio(subidaB.error)})`);
    }
    // Control positivo: A sí puede subir a su carpeta; si no, el rechazo de B no demuestra nada.
    const rutaA = `${A.tenantId}/${MARCA}-propio-${Date.now()}.png`;
    const subidaA = await A.cliente.storage.from("media").upload(rutaA, contenido, { upsert: false, contentType: "image/png" });
    if (subidaA.error) {
      inconcluso(`A tampoco pudo subir a su propia carpeta de media (${limpio(subidaA.error)}): el rechazo a B no es concluyente.`);
    } else {
      archivosAborrar.push({ cliente: A.cliente, ruta: rutaA });
      ok("A sube a su propia carpeta de media (control positivo)");
      // B no debe poder borrar ni listar lo de A.
      const borrado = await B.cliente.storage.from("media").remove([rutaA]);
      const sigue = await existeEnMedia(rutaA);
      if (sigue === null) inconcluso("B intenta borrar un archivo de A en media: no se pudo comprobar por la URL pública si el archivo sigue");
      else {
        resultado(
          sigue && !(borrado.data ?? []).length,
          "B intenta borrar un archivo de A en media: el archivo sigue ahí",
          "B intenta borrar un archivo de A en media: el archivo desapareció",
        );
      }
      // Control positivo de la política de select (1.7.0): A ve su archivo al listar su carpeta.
      const nombreA = rutaA.slice(A.tenantId.length + 1);
      const listadoA = await A.cliente.storage.from("media").list(A.tenantId, { search: nombreA });
      if (listadoA.error) inconcluso(`A lista su propia carpeta de media: error (${limpio(listadoA.error)})`);
      else if ((listadoA.data ?? []).some((f) => f.name === nombreA)) ok("A lista su propia carpeta de media y ve su archivo");
      else aviso("A no ve su propio archivo al listar su carpeta de media: falta la política media_tenant_select (schema.sql 1.7.0, sección 12).");
      const listadoB = await B.cliente.storage.from("media").list(A.tenantId);
      comprobarCero(
        listadoB.error,
        listadoB.data,
        "B lista la carpeta del negocio de A en media: cero archivos",
        `B lista la carpeta del negocio de A en media: ve ${(listadoB.data ?? []).length} archivo(s)`,
      );
    }
  }
  {
    const subidaAnon = await anon.storage.from("media").upload(`${A.tenantId}/${MARCA}-anon-${Date.now()}.png`, contenido, { upsert: false, contentType: "image/png" });
    if (sinBucket(subidaAnon.error)) {
      omitido("anon sube a media: el bucket no existe todavía");
    } else {
      if (!subidaAnon.error) {
        falla("anon sube a media: lo logró");
        archivosAborrar.push({ cliente: A.cliente, ruta: subidaAnon.data?.path });
      } else if (esRls(subidaAnon.error)) ok("anon sube a media: rechazado");
      else inconcluso(`anon sube a media: falló por otra causa, no por RLS (${limpio(subidaAnon.error)})`);
    }
  }

  // -------------------------------------------------------------------
  // 5) Sin sesión (anon)
  // -------------------------------------------------------------------
  console.log("\n5) Sin sesión (rol anon)");
  for (const def of [...TABLAS, ...VISTAS]) {
    const tipo = VISTAS.includes(def) ? "vista" : "tabla";
    const { data, error } = await anon.from(def.nombre).select("*").limit(5);
    comprobarCero(
      error,
      data,
      `anon lee ${tipo} ${def.nombre}: cero filas`,
      `anon lee ${tipo} ${def.nombre}: obtiene ${(data ?? []).length} fila(s)`,
    );
  }
  for (const tabla of ["categories", "products", "tables", "orders"]) {
    const { data, error } = await anon
      .from(tabla)
      .insert({ tenant_id: A.tenantId, ...(tabla === "tables" ? { label: `${MARCA}-anon` } : {}) })
      .select("id");
    if (!error && (data ?? []).length) falla(`anon inserta en ${tabla}: lo logró`);
    else if (esRls(error)) ok(`anon inserta en ${tabla}: rechazado (${limpio(error)})`);
    else inconcluso(`anon inserta en ${tabla}: falló por otra causa, no por RLS (${error ? limpio(error) : "sin error y sin filas"})`);
    if (!error && (data ?? []).length) for (const r of data) limpiezaA.push({ tabla, id: r.id });
  }
  // Los catálogos globales no son datos de un negocio, pero anon tampoco debería tocarlos como tablas.
  for (const tabla of ["plans", "currencies"]) {
    const { data, error } = await anon.from(tabla).select("*").limit(1);
    if (!error && (data ?? []).length) aviso(`anon lee el catálogo ${tabla} (no es de un negocio, pero desde 1.7.0 sus políticas son solo para authenticated y anon no tiene permiso de tabla: no debería llegar).`);
  }
} catch (e) {
  console.error(`\nLa prueba se interrumpió: ${limpio(e)}`);
  process.exitCode = 2;
} finally {
  console.log("\nLimpieza de filas de prueba");
  try {
    await limpiar();
  } catch (e) {
    // Una falla al limpiar no debe impedir el resumen ni cambiar la prioridad de la salida.
    aviso(`La limpieza se interrumpió (${limpio(e)}). Borrar a mano las filas y archivos con «${MARCA}».`);
  }
}

const total = oks + fallas + inconclusas;
console.log(
  `\nResumen: ${oks} ok, ${fallas} FALLA, ${inconclusas} inconcluso(s), ${omitidas} omitida(s) (bucket), ${avisos} aviso(s) de ${total} comprobaciones.`,
);
if (fallas > 0) {
  console.log("RESULTADO: FALLA. Hay datos de un negocio al alcance de otro: no abrir el registro ni enlazar «Ingresar».");
  process.exit(1);
}
if (process.exitCode === 2) {
  console.log("RESULTADO: incompleto. La prueba se interrumpió antes de terminar; no prueba el aislamiento.");
  process.exit(2);
}
if (inconclusas > 0) {
  console.log("RESULTADO: incompleto. Hubo comprobaciones inconclusas (error que no es de RLS, o falta una fila de A para probar): arreglar la causa y repetir. No prueba el aislamiento todavía.");
  process.exit(3);
}
console.log("RESULTADO: ok. B no ve ni toca los datos de A.");
process.exit(0);
