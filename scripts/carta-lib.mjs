// Piezas compartidas por los scripts de entrega de cartas (`carta-nueva`, `carta-fotos`,
// `carta-kit`, `check-cartas`). Node puro, sin dependencias fuera de las que ya están.

import { readFileSync } from "node:fs";
import path from "node:path";

/** Límites publicados del plan Carta, leídos de la fuente de verdad y no copiados a mano. */
export function limitesPlanCarta() {
  const src = readFileSync(path.join(process.cwd(), "src/lib/constants.ts"), "utf8");
  const basico = src.slice(src.indexOf("    basico: {"), src.indexOf("    estandar: {"));
  const num = (campo) => {
    const m = basico.match(new RegExp(`${campo}:\\s*(\\d+|null)`));
    if (!m) throw new Error(`No se encontró PRICING.plans.basico.${campo} en src/lib/constants.ts`);
    return m[1] === "null" ? null : Number(m[1]);
  };
  return {
    maxProducts: num("maxProducts"),
    maxCategories: num("maxCategories"),
    maxTables: num("maxTables"),
    maxLanguages: num("maxLanguages"),
  };
}

/**
 * CSV mínimo pero correcto: comillas dobles, comas dentro de comillas, `""` como comilla
 * escapada, CRLF y BOM de Excel. El separador se detecta entre `,` y `;` porque Excel en
 * español exporta con `;` sin avisar.
 */
export function parseCsv(texto) {
  const limpio = texto.replace(/^﻿/, "");
  const cabecera = limpio.slice(0, limpio.search(/\r?\n|$/));
  const sep = (cabecera.match(/;/g) || []).length > (cabecera.match(/,/g) || []).length ? ";" : ",";

  const filas = [];
  let fila = [];
  let campo = "";
  let enComillas = false;

  for (let i = 0; i < limpio.length; i++) {
    const c = limpio[i];
    if (enComillas) {
      if (c === '"') {
        if (limpio[i + 1] === '"') { campo += '"'; i++; }
        else enComillas = false;
      } else campo += c;
      continue;
    }
    if (c === '"') { enComillas = true; continue; }
    if (c === sep) { fila.push(campo); campo = ""; continue; }
    if (c === "\n") { fila.push(campo); filas.push(fila); fila = []; campo = ""; continue; }
    if (c === "\r") continue;
    campo += c;
  }
  if (campo !== "" || fila.length) { fila.push(campo); filas.push(fila); }

  if (!filas.length) return { columnas: [], filas: [], sep };
  const columnas = filas[0].map((c) => c.trim());
  const cuerpo = filas
    .slice(1)
    .map((f, i) => ({ linea: i + 2, valores: f }))
    // Una fila totalmente vacía al final de un CSV de Excel no es un error.
    .filter((f) => f.valores.some((v) => v.trim() !== ""));
  return { columnas, filas: cuerpo, sep };
}

/** `Gallo Pinto con Huevo` → `gallo-pinto-con-huevo`. Sin tildes, sin signos, sin dobles guiones. */
export function slugificar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Un código de QR impreso vive años en una mesa y se dicta por teléfono, así que el alfabeto
 * excluye lo ambiguo (D-014): 6 caracteres en minúscula, sin los dígitos `0` y `1` y sin las
 * letras `l` e `i`.
 *
 * La letra `o` sí se permite, y es a propósito: como el dígito `0` nunca puede aparecer, oír
 * "o" no tiene con qué confundirse. Prohibir las dos mitades de cada par sería excluir un
 * carácter útil sin ganar nada. `l` e `i` se van porque en muchas tipografías se pierden
 * leyendo el código de un stand impreso, no por cómo suenan.
 */
export const CODIGO_QR_RE = /^[a-z2-9]{6}$/;
const AMBIGUOS = /[01li]/;

export function validarCodigoQr(codigo) {
  if (!CODIGO_QR_RE.test(codigo)) {
    return `"${codigo}" no es un código válido: se esperan 6 caracteres en minúscula (letras a-z y dígitos 2-9).`;
  }
  const malos = [...new Set(codigo.match(AMBIGUOS) || [])];
  if (malos.length) {
    return `"${codigo}" usa ${malos.map((c) => `"${c}"`).join(" y ")}. El alfabeto de los códigos impresos excluye los dígitos 0 y 1 y las letras l e i.`;
  }
  return null;
}

/** Errores de uso del script: se muestran limpios, sin traza de Node. */
export class ErrorDeUso extends Error {}

export function fallar(mensaje) {
  throw new ErrorDeUso(mensaje);
}

/** Envoltorio para `main()`: un error de uso sale con mensaje, cualquier otro con su traza. */
export async function correr(main) {
  try {
    await main();
  } catch (e) {
    if (e instanceof ErrorDeUso) {
      console.error(`\nERROR  ${e.message}\n`);
      process.exit(1);
    }
    throw e;
  }
}

/** `--dir valor` / `--dir=valor` / `--flag`. Devuelve { _: [posicionales], flag: valor|true }. */
export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) { out._.push(a); continue; }
    const [clave, valor] = a.slice(2).split(/=(.*)/s);
    if (valor !== undefined) out[clave] = valor;
    else if (argv[i + 1] && !argv[i + 1].startsWith("--")) out[clave] = argv[++i];
    else out[clave] = true;
  }
  return out;
}
