#!/usr/bin/env node
/**
 * Alta de una carta desde CSV (D-046).
 *
 *   node scripts/carta-nueva.mjs <slug> [--dir entregas/<slug>] [--dry-run] [--sin-fotos]
 *
 * Lee `<dir>/menu.csv` y `<dir>/carta.json`, procesa las fotos de `<dir>/fotos/` y escribe:
 *
 *   src/content/cartas/<slug>.ts     la carta (se commitea)
 *   src/content/cartas/index.ts      import + entrada en CARTAS
 *   src/content/qr.ts                la línea del código impreso, si carta.json trae codigo_qr
 *   public/cartas/<slug>/*.webp      las fotos optimizadas (se commitean)
 *
 * Las fuentes (`menu.csv`, `carta.json`, `fotos/`) NO se commitean: viven en `entregas/`, que
 * está en `.gitignore`.
 *
 * `--dry-run` valida e informa sin escribir nada. `--sin-fotos` salta el procesamiento de
 * imágenes (útil para validar un CSV antes de tener las fotos).
 *
 * Columnas de `menu.csv`: categoria,nombre_es,nombre_en,desc_es,desc_en,precio,foto
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { correr, fallar, limitesPlanCarta, parseArgs, parseCsv, slugificar, validarCodigoQr } from "./carta-lib.mjs";
import { procesarFotos } from "./carta-fotos.mjs";

const COLUMNAS = ["categoria", "nombre_es", "nombre_en", "desc_es", "desc_en", "precio", "foto"];
const MONEDAS = ["CRC", "USD"];

await correr(async () => {
  const args = parseArgs(process.argv.slice(2));
  const slug = args._[0];
  if (!slug) {
    fallar("Falta el slug.\n       node scripts/carta-nueva.mjs <slug> [--dir entregas/<slug>] [--dry-run]");
  }
  if (slugificar(slug) !== slug) {
    fallar(`El slug "${slug}" tiene mayúsculas, tildes o signos. Usá "${slugificar(slug)}".`);
  }

  const dir = args.dir || path.join("entregas", slug);
  const dryRun = Boolean(args["dry-run"]);
  const sinFotos = Boolean(args["sin-fotos"]);

  const csvPath = path.join(dir, "menu.csv");
  const jsonPath = path.join(dir, "carta.json");
  if (!existsSync(csvPath)) fallar(`No existe ${csvPath}.`);
  if (!existsSync(jsonPath)) fallar(`No existe ${jsonPath}.`);

  // ── carta.json ────────────────────────────────────────────────────────────
  let meta;
  try {
    meta = JSON.parse(readFileSync(jsonPath, "utf8"));
  } catch (e) {
    fallar(`${jsonPath} no es JSON válido: ${e.message}`);
  }
  if (!meta.nombre?.trim()) fallar(`${jsonPath}: falta "nombre" (el nombre del local).`);
  if (!MONEDAS.includes(meta.moneda)) {
    fallar(`${jsonPath}: "moneda" debe ser ${MONEDAS.join(" o ")}, vino ${JSON.stringify(meta.moneda)}.`);
  }
  const idiomas = meta.idiomas?.length ? meta.idiomas : ["es"];
  for (const l of idiomas) {
    if (!["es", "en", "pt"].includes(l)) fallar(`${jsonPath}: idioma "${l}" desconocido (es, en o pt).`);
  }
  const limites = limitesPlanCarta();
  if (idiomas.length > limites.maxLanguages) {
    fallar(`El plan Carta llega a ${limites.maxLanguages} idiomas y la carta pide ${idiomas.length}.`);
  }
  const bilingue = idiomas.includes("en");

  if (meta.codigo_qr) {
    const err = validarCodigoQr(meta.codigo_qr);
    if (err) fallar(`${jsonPath}: ${err}`);
  }

  // ── menu.csv ──────────────────────────────────────────────────────────────
  const { columnas, filas, sep } = parseCsv(readFileSync(csvPath, "utf8"));
  const faltan = COLUMNAS.filter((c) => !columnas.includes(c));
  if (faltan.length) {
    fallar(`${csvPath}: faltan las columnas ${faltan.join(", ")}.\n       Se esperaba: ${COLUMNAS.join(",")}`);
  }
  if (!filas.length) fallar(`${csvPath}: no tiene ninguna fila de platillos.`);

  const col = (valores, nombre) => (valores[columnas.indexOf(nombre)] ?? "").trim();
  const errores = [];
  const avisos = [];
  const categorias = [];
  const productos = [];

  for (const { linea, valores } of filas) {
    const categoria = col(valores, "categoria");
    const nombreEs = col(valores, "nombre_es");
    const precioTexto = col(valores, "precio");
    const foto = col(valores, "foto");

    if (!categoria) { errores.push(`fila ${linea}: la categoría está vacía.`); continue; }
    if (!nombreEs) { errores.push(`fila ${linea}: falta nombre_es.`); continue; }

    // Se acepta la coma decimal: en Costa Rica se escribe 8,50 tanto como 8.50.
    const precio = Number(precioTexto.replace(/\s/g, "").replace(",", "."));
    if (!precioTexto || !Number.isFinite(precio) || precio < 0) {
      errores.push(`fila ${linea} ("${nombreEs}"): precio ${JSON.stringify(precioTexto)} no es un número.`);
      continue;
    }

    if (foto && !sinFotos) {
      const origen = path.join(dir, "fotos", foto);
      if (!existsSync(origen)) {
        errores.push(`fila ${linea} ("${nombreEs}"): la foto ${foto} no está en ${path.join(dir, "fotos")}.`);
        continue;
      }
    }
    if (bilingue && !col(valores, "nombre_en")) {
      avisos.push(`fila ${linea} ("${nombreEs}"): sin nombre_en. La carta es bilingüe y ahí va a mostrar el español.`);
    }

    let cat = categorias.find((c) => c.nombre === categoria);
    if (!cat) {
      cat = { nombre: categoria, id: `c-${slug}-${categorias.length + 1}`, orden: categorias.length + 1, nombresPorIdioma: {} };
      categorias.push(cat);
    }
    productos.push({
      id: `p-${slug}-${productos.length + 1}`,
      categoriaId: cat.id,
      orden: productos.filter((p) => p.categoriaId === cat.id).length + 1,
      nombre_es: nombreEs,
      nombre_en: col(valores, "nombre_en"),
      desc_es: col(valores, "desc_es"),
      desc_en: col(valores, "desc_en"),
      precio,
      foto,
    });
  }

  if (errores.length) {
    fallar(`${csvPath} tiene ${errores.length} problema(s):\n       - ${errores.join("\n       - ")}`);
  }
  if (limites.maxProducts !== null && productos.length > limites.maxProducts) {
    fallar(`El plan Carta llega a ${limites.maxProducts} platillos y el CSV trae ${productos.length}.`);
  }
  if (limites.maxCategories !== null && categorias.length > limites.maxCategories) {
    fallar(`El plan Carta llega a ${limites.maxCategories} categorías y el CSV trae ${categorias.length}.`);
  }

  // ── Nombres de categoría en inglés: por convención, `Categoria|Category` ───
  for (const c of categorias) {
    const [es, en] = c.nombre.split("|").map((s) => s.trim());
    c.nombresPorIdioma = { es, ...(en ? { en } : {}) };
    if (bilingue && !en) {
      avisos.push(`categoría "${es}": sin traducción. Escribila como "${es}|English name" en el CSV si querés traducirla.`);
    }
  }

  // ── Colisiones con lo que ya existe ───────────────────────────────────────
  const indexPath = "src/content/cartas/index.ts";
  const indexSrc = readFileSync(indexPath, "utf8");
  const yaEnCartas = new RegExp(`^import \\{ ${slug} \\}`, "m").test(indexSrc);
  const cartaPath = `src/content/cartas/${slug}.ts`;
  if (yaEnCartas || existsSync(cartaPath)) {
    fallar(`El slug "${slug}" ya existe (${cartaPath}). Un slug no se reutiliza: elegí otro o borrá la carta anterior a mano.`);
  }

  const qrPath = "src/content/qr.ts";
  let qrSrc = readFileSync(qrPath, "utf8");
  if (meta.codigo_qr) {
    // Ojo con el `//?`: el código de un local dado de baja queda **comentado** en qr.ts, no
    // borrado, justamente para que nadie se lo dé a otro local. Si este chequeo mirara solo los
    // códigos activos, D-014 se rompería en el único caso donde importa.
    const enUso = new RegExp(`^\\s*(?://\\s*)?${meta.codigo_qr}:`, "m").test(qrSrc);
    if (enUso) {
      const reservado = new RegExp(`^\\s*//\\s*${meta.codigo_qr}:`, "m").test(qrSrc);
      fallar(
        reservado
          ? `El código "${meta.codigo_qr}" está reservado en ${qrPath}: era de un local que se dio de baja. Un código impreso NUNCA se reutiliza (D-014) ni después de que el local se vaya, porque el stand viejo puede seguir dando vueltas.`
          : `El código "${meta.codigo_qr}" ya está en uso en ${qrPath}. Un código impreso NUNCA se reutiliza para otro local (D-014).`
      );
    }
  }

  // ── Fotos ─────────────────────────────────────────────────────────────────
  let fotos = new Map();
  let logoUrl = null;
  if (!sinFotos) {
    const resultado = await procesarFotos({
      slug,
      dir,
      nombres: [...new Set(productos.map((p) => p.foto).filter(Boolean))],
      logo: meta.logo,
      dryRun,
    });
    fotos = resultado.fotos;
    logoUrl = resultado.logoUrl;
  }

  // ── El .ts de la carta ────────────────────────────────────────────────────
  const j = (v) => JSON.stringify(v);
  const i18n = (es, en) => (en ? `{ es: ${j(es)}, en: ${j(en)} }` : `{ es: ${j(es)} }`);

  const lineasCategorias = categorias
    .map((c) => `      { id: ${j(c.id)}, name_i18n: ${i18n(c.nombresPorIdioma.es, c.nombresPorIdioma.en)}, sort_order: ${c.orden} },`)
    .join("\n");

  const lineasProductos = productos
    .map((p) => {
      const desc = p.desc_es || p.desc_en ? i18n(p.desc_es, p.desc_en) : "{}";
      const url = p.foto ? fotos.get(p.foto) : null;
      if (p.foto && !sinFotos && !url) fallar(`La foto ${p.foto} no se procesó.`);
      const img = url ? j(url) : "null";
      return `      {
        id: ${j(p.id)},
        category_id: ${j(p.categoriaId)},
        name_i18n: ${i18n(p.nombre_es, p.nombre_en)},
        description_i18n: ${desc},
        price: ${p.precio},
        image_url: ${img},
        sort_order: ${p.orden},
      },`;
    })
    .join("\n");

  const tagline = meta.tagline_es
    ? `\n  // Subtítulo propio del local (D-045): sustituye al del diccionario.\n  tagline: { es: ${j(meta.tagline_es)}${meta.tagline_en ? `, en: ${j(meta.tagline_en)}` : ""}${meta.tagline_pt ? `, pt: ${j(meta.tagline_pt)}` : ""} },`
    : "";

  const contenido = `import type { CartaEstatica } from "./types";

// Carta de ${meta.nombre}. Generada con \`node scripts/carta-nueva.mjs ${slug}\` desde
// \`${dir.replace(/\\\\/g, "/")}/menu.csv\`. Para cambiar precios o platillos, editá el CSV y
// volvé a correr el script; así el .ts y el CSV no se separan.
export const ${slug}: CartaEstatica = {
  slug: ${j(slug)},
  // \`true\` solo cuando el local confirme que quiere salir en Google.
  indexable: false,${tagline}
  menu: {
    tenant: { id: ${j(`t-${slug}`)}, name: ${j(meta.nombre)}, slug: ${j(slug)} },
    // En modo Carta no hay mesa: la cabecera muestra solo "Menú".
    table: { id: "carta", label: "" },
    settings: {
      currency_code: ${j(meta.moneda)},
      default_language: ${j(idiomas[0])},
      enabled_languages: ${j(idiomas).replace(/,/g, ", ")},
      theme: { primary: ${j(meta.color_primario || "#22503a")}, accent: ${j(meta.color_acento || "#b8923f")} },
      logo_url: ${logoUrl ? j(logoUrl) : "null"},
      restaurant_name: ${j(meta.nombre)},
    },
    categories: [
${lineasCategorias}
    ],
    products: [
${lineasProductos}
    ],
  },
};
`;

  // ── index.ts y qr.ts ──────────────────────────────────────────────────────
  const indexNuevo = indexSrc
    .replace(/^(import \{ ejemplo \} from "\.\/ejemplo";)$/m, `$1\nimport { ${slug} } from "./${slug}";`)
    .replace(/export const CARTAS: CartaEstatica\[\] = \[([^\]]*)\];/, (_, actual) => {
      const items = actual.split(",").map((s) => s.trim()).filter(Boolean);
      return `export const CARTAS: CartaEstatica[] = [${[...items, slug].join(", ")}];`;
    });
  if (indexNuevo === indexSrc) fallar(`No se pudo agregar "${slug}" a CARTAS en ${indexPath}: revisá el archivo a mano.`);

  if (meta.codigo_qr) {
    const marca = "export const QR_CODES: Record<string, string> = {";
    if (!qrSrc.includes(marca)) fallar(`No se encontró QR_CODES en ${qrPath}.`);
    qrSrc = qrSrc.replace(marca, `${marca}\n  // ${meta.nombre}.\n  ${meta.codigo_qr}: "/c/${slug}",`);
  }

  // ── Escribir ──────────────────────────────────────────────────────────────
  if (dryRun) {
    console.log(`\n[--dry-run] No se escribió nada. Se habría generado:`);
    console.log(`  ${cartaPath}`);
    console.log(`  ${indexPath}            (import + CARTAS)`);
    if (meta.codigo_qr) console.log(`  ${qrPath}                 (${meta.codigo_qr} -> /c/${slug})`);
  } else {
    mkdirSync(path.dirname(cartaPath), { recursive: true });
    writeFileSync(cartaPath, contenido, "utf8");
    writeFileSync(indexPath, indexNuevo, "utf8");
    if (meta.codigo_qr) writeFileSync(qrPath, qrSrc, "utf8");
  }

  // ── Informe ───────────────────────────────────────────────────────────────
  console.log(`\nCarta "${meta.nombre}" (/c/${slug})`);
  console.log(`  CSV            ${csvPath} (separador ${j(sep)})`);
  console.log(`  Categorías     ${categorias.length} de ${limites.maxCategories}`);
  console.log(`  Platillos      ${productos.length} de ${limites.maxProducts}`);
  console.log(`  Moneda         ${meta.moneda}`);
  console.log(`  Idiomas        ${idiomas.join(", ")}`);
  console.log(`  Logo           ${logoUrl ?? "sin logo"}`);
  console.log(`  Fotos          ${fotos.size} de ${productos.length} platillos`);
  if (meta.codigo_qr) console.log(`  Código impreso ${meta.codigo_qr} -> /c/${slug}`);
  for (const a of avisos) console.log(`  AVISO  ${a}`);
  if (!dryRun) {
    console.log(`\nFalta: npm run build && git add -A && commit, y probar /c/${slug} en un teléfono de verdad.`);
    if (meta.codigo_qr) console.log(`       node scripts/carta-kit.mjs ${slug}   (QR y PDF para el local)`);
  }
});
