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
//   - B hace update y delete sobre filas de A por id: deben afectar cero filas (y A las ve intactas).
//   - Si existe el bucket `media`: B sube a la carpeta <tenant_id de A>/: debe fallar.
//     Si el bucket no existe, la comprobación se omite (no cuenta como FALLA).
//   - Sin sesión (anon): leer cualquiera de esas tablas devuelve cero filas o error.
//
// Para tener filas de A con qué probar, A (sesión legítima) crea unas filas marcadas con
// "zz-aislamiento" y el script las borra al final, también si algo falla. Lo que B logre crear
// por error se reporta como FALLA y se intenta borrar. Las pruebas de update sobre `tenants` y
// `tenant_settings` reescriben el mismo valor que ya tenían, así que no cambian nada si pasaran.
//
// Importante: A y B deben ser usuarios de restaurante (no super admin) de locales distintos.
// El script se niega a correr si alguno es super admin, porque esa prueba no probaría nada.
// Nunca imprime contraseñas ni tokens. No correrlo con claves de otro proyecto que no sea el
// que querés probar: escribe y borra filas de prueba con la sesión de A.
//
// Salida: exit 0 si todo pasa, 1 si algo falla, 2 si faltan variables o no se pudo preparar la prueba.

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
Salida: 0 si todo pasa, 1 si algo falla, 2 si faltan variables o no se pudo preparar.`);
  process.exit(2);
}

// ---------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------
let fallas = 0;
let oks = 0;
let omitidas = 0;
let avisos = 0;

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
const resultado = (pasa, msgOk, msgFalla) => (pasa ? ok(msgOk) : falla(msgFalla));

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
const limpiezaB = []; // { tabla, id }: filas que B logró crear por error o que creó a propósito
const archivosAborrar = []; // { cliente, ruta }

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
  for (const { cliente, ruta } of archivosAborrar.splice(0).reverse()) {
    try {
      await cliente.storage.from("media").remove([ruta]);
    } catch {
      /* mejor esfuerzo */
    }
  }
  for (const { tabla, id } of limpiezaB.splice(0).reverse()) {
    const { error } = await B.cliente.from(tabla).delete().eq("id", id);
    if (error) aviso(`No se pudo borrar ${tabla}/${id} con B: ${limpio(error)}. Borrarla a mano.`);
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
  const orden = await crearComoA("orders", { tenant_id: A.tenantId, table_id: mesa?.id ?? null, customer_note: MARCA });
  const linea = orden
    ? await crearComoA("order_items", {
        order_id: orden.id,
        tenant_id: A.tenantId,
        product_id: producto?.id ?? null,
        product_name_snapshot: MARCA,
        unit_price_snapshot: 1,
        quantity: 1,
        line_total: 1,
      })
    : null;
  semillas = { categories: categoria, products: producto, tables: mesa, orders: orden, order_items: linea };

  tenantA = (await A.cliente.from("tenants").select("id, name").eq("id", A.tenantId).maybeSingle()).data;
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
        ok(`B lee ${tipo} ${def.nombre}: la API la rechaza (${limpio(error)})`);
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
    resultado(!error && (data ?? []).length === 0, `B lee ${tabla} por id de una fila de A: cero filas`, `B lee ${tabla} por id de una fila de A: la ve`);
  }
  for (const def of TABLAS.filter((t) => t.clave === "tenant_id")) {
    const { data, error } = await B.cliente.from(def.nombre).select("*").eq("tenant_id", A.tenantId);
    resultado(
      error || (data ?? []).length === 0,
      `B filtra ${def.nombre} por el tenant_id de A: cero filas`,
      `B filtra ${def.nombre} por el tenant_id de A: obtiene ${(data ?? []).length} fila(s)`,
    );
  }
  {
    const { data, error } = await B.cliente.from("tenants").select("id").eq("id", A.tenantId);
    resultado(error || (data ?? []).length === 0, "B lee tenants por el id de A: cero filas", "B lee tenants por el id de A: ve el negocio");
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
    } else {
      ok(`B inserta en ${tabla} con el tenant_id de A: rechazado (${error ? limpio(error) : "sin filas"})`);
    }
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
      omitido(`update/delete en ${tabla}: A no pudo crear una fila de prueba`);
      continue;
    }
    const upd = await B.cliente.from(tabla).update(cambios[tabla]).eq("id", fila.id).select("id");
    resultado(
      !upd.error ? (upd.data ?? []).length === 0 : true,
      `B hace update en ${tabla} sobre una fila de A: 0 filas afectadas`,
      `B hace update en ${tabla} sobre una fila de A: modificó ${(upd.data ?? []).length} fila(s)`,
    );
    const del = await B.cliente.from(tabla).delete().eq("id", fila.id).select("id");
    resultado(
      !del.error ? (del.data ?? []).length === 0 : true,
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
    resultado(
      !error ? (data ?? []).length === 0 : true,
      "B hace update en tenants sobre el negocio de A: 0 filas afectadas",
      "B hace update en tenants sobre el negocio de A: modificó el negocio",
    );
  } else {
    omitido("update en tenants: A no pudo leer su propio negocio");
  }
  if (settingsA) {
    const { data, error } = await B.cliente
      .from("tenant_settings")
      .update({ restaurant_name: settingsA.restaurant_name })
      .eq("tenant_id", A.tenantId)
      .select("tenant_id");
    resultado(
      !error ? (data ?? []).length === 0 : true,
      "B hace update en tenant_settings de A: 0 filas afectadas",
      "B hace update en tenant_settings de A: modificó la configuración",
    );
  } else {
    omitido("update en tenant_settings: A no tiene fila de configuración");
  }

  // -------------------------------------------------------------------
  // 4) Storage: bucket `media`
  // -------------------------------------------------------------------
  console.log("\n4) Storage (bucket media)");
  const ruta = `${A.tenantId}/${MARCA}-${Date.now()}.txt`;
  const contenido = new Blob([MARCA], { type: "text/plain" });
  const subidaB = await B.cliente.storage.from("media").upload(ruta, contenido, { upsert: false });
  const sinBucket = (e) => e && (/bucket not found/i.test(e.message ?? "") || String(e.statusCode ?? e.status ?? "") === "404");
  if (sinBucket(subidaB.error)) {
    omitido("el bucket media no existe todavía: se omite la prueba de storage");
  } else {
    if (!subidaB.error) {
      archivosAborrar.push({ cliente: B.cliente, ruta });
      archivosAborrar.push({ cliente: A.cliente, ruta });
      falla("B sube un archivo a la carpeta del negocio de A en media: lo logró");
    } else {
      ok(`B sube a la carpeta del negocio de A en media: rechazado (${limpio(subidaB.error)})`);
    }
    // Control positivo: A sí puede subir a su carpeta; si no, el rechazo de B no demuestra nada.
    const rutaA = `${A.tenantId}/${MARCA}-propio-${Date.now()}.txt`;
    const subidaA = await A.cliente.storage.from("media").upload(rutaA, contenido, { upsert: false });
    if (subidaA.error) {
      aviso(`A tampoco pudo subir a su propia carpeta de media (${limpio(subidaA.error)}): el rechazo a B no es concluyente.`);
    } else {
      archivosAborrar.push({ cliente: A.cliente, ruta: rutaA });
      ok("A sube a su propia carpeta de media (control positivo)");
      // B no debe poder borrar ni listar lo de A.
      const borrado = await B.cliente.storage.from("media").remove([rutaA]);
      const { data: sigue } = await A.cliente.storage.from("media").list(A.tenantId, { search: `${MARCA}-propio` });
      resultado(
        (sigue ?? []).length > 0 && !(borrado.data ?? []).length,
        "B intenta borrar un archivo de A en media: el archivo sigue ahí",
        "B intenta borrar un archivo de A en media: el archivo desapareció",
      );
      const listadoB = await B.cliente.storage.from("media").list(A.tenantId);
      resultado(
        Boolean(listadoB.error) || (listadoB.data ?? []).length === 0,
        "B lista la carpeta del negocio de A en media: cero archivos",
        `B lista la carpeta del negocio de A en media: ve ${(listadoB.data ?? []).length} archivo(s)`,
      );
    }
  }
  {
    const subidaAnon = await anon.storage.from("media").upload(`${A.tenantId}/${MARCA}-anon-${Date.now()}.txt`, contenido, { upsert: false });
    if (sinBucket(subidaAnon.error)) {
      omitido("anon sube a media: el bucket no existe todavía");
    } else {
      resultado(Boolean(subidaAnon.error), "anon sube a media: rechazado", "anon sube a media: lo logró");
      if (!subidaAnon.error) archivosAborrar.push({ cliente: A.cliente, ruta: subidaAnon.data?.path });
    }
  }

  // -------------------------------------------------------------------
  // 5) Sin sesión (anon)
  // -------------------------------------------------------------------
  console.log("\n5) Sin sesión (rol anon)");
  for (const def of [...TABLAS, ...VISTAS]) {
    const tipo = VISTAS.includes(def) ? "vista" : "tabla";
    const { data, error } = await anon.from(def.nombre).select("*").limit(5);
    resultado(
      error || (data ?? []).length === 0,
      `anon lee ${tipo} ${def.nombre}: ${error ? "rechazado" : "cero filas"}`,
      `anon lee ${tipo} ${def.nombre}: obtiene ${(data ?? []).length} fila(s)`,
    );
  }
  for (const tabla of ["categories", "products", "tables", "orders"]) {
    const { data, error } = await anon.from(tabla).insert({ tenant_id: A.tenantId }).select("id");
    resultado(error || (data ?? []).length === 0, `anon inserta en ${tabla}: rechazado`, `anon inserta en ${tabla}: lo logró`);
    if (!error && (data ?? []).length) for (const r of data) limpiezaA.push({ tabla, id: r.id });
  }
  // Los catálogos globales no son datos de un negocio, pero anon tampoco debería tocarlos como tablas.
  for (const tabla of ["plans", "currencies"]) {
    const { data, error } = await anon.from(tabla).select("*").limit(1);
    if (!error && (data ?? []).length) aviso(`anon lee el catálogo ${tabla} (no es de un negocio; schema.sql le deja la política plans_read en true, pero sin permiso de tabla no debería llegar).`);
  }
} catch (e) {
  console.error(`\nLa prueba se interrumpió: ${limpio(e)}`);
  process.exitCode = 2;
} finally {
  console.log("\nLimpieza de filas de prueba");
  await limpiar();
}

if (process.exitCode === 2) process.exit(2);
const total = oks + fallas;
console.log(`\nResumen: ${oks} ok, ${fallas} FALLA, ${omitidas} omitida(s), ${avisos} aviso(s) de ${total} comprobaciones.`);
if (fallas > 0) {
  console.log("RESULTADO: FALLA. Hay datos de un negocio al alcance de otro: no abrir el registro ni enlazar «Ingresar».");
  process.exit(1);
}
console.log("RESULTADO: ok. B no ve ni toca los datos de A.");
process.exit(0);
