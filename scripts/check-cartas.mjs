#!/usr/bin/env node
/**
 * Hace cumplir D-043 en cada build: ninguna foto publicada de una carta puede hundir la carta.
 *
 *   npm run check:cartas
 *
 * Corre antes de `next build`, así que una foto pesada no llega a producción aunque haya entrado
 * a `public/cartas/` a mano, por fuera de `scripts/carta-nueva.mjs`. Ese es el punto: el script
 * de alta ya comprime, pero el que copia un JPEG a mano un viernes también tiene que rebotar.
 */

import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { EXTENSIONES, LIMITE_FOTO, LIMITE_LOGO } from "./carta-fotos.mjs";

const RAIZ = path.join("public", "cartas");
const kb = (n) => `${Math.round(n / 1024)} KB`;

function archivos(dir) {
  const out = [];
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entrada.name);
    if (entrada.isDirectory()) out.push(...archivos(p));
    else out.push(p);
  }
  return out;
}

let total = 0;
let pesoTotal = 0;
const fallos = [];

try {
  statSync(RAIZ);
} catch {
  console.log("check:cartas → no hay public/cartas todavía: nada que revisar.");
  process.exit(0);
}

for (const archivo of archivos(RAIZ)) {
  const ext = path.extname(archivo).toLowerCase();
  const tam = statSync(archivo).size;
  const esLogo = path.basename(archivo, ext) === "logo";
  const limite = esLogo ? LIMITE_LOGO : LIMITE_FOTO;
  total++;
  pesoTotal += tam;

  if (!EXTENSIONES.has(ext)) {
    fallos.push(
      `${archivo}: es ${ext || "sin extensión"}. En public/cartas solo van .webp o .png; ` +
        `las fotos del local se convierten con scripts/carta-nueva.mjs.`
    );
    continue;
  }
  if (tam > limite) {
    fallos.push(`${archivo}: ${kb(tam)} supera el límite de ${kb(limite)} para ${esLogo ? "un logo" : "una foto"}.`);
  }
}

// Peso por carta: el límite de D-043 es que la carta entera abra bien, no solo cada archivo.
const porCarta = new Map();
for (const archivo of archivos(RAIZ)) {
  const slug = path.relative(RAIZ, archivo).split(path.sep)[0];
  porCarta.set(slug, (porCarta.get(slug) || 0) + statSync(archivo).size);
}
for (const [slug, bytes] of porCarta) {
  console.log(`  /c/${slug.padEnd(20)} ${String(Math.round(bytes / 1024)).padStart(5)} KB en imágenes`);
}

for (const f of fallos) console.log(`  FALLO ${f}`);
console.log(
  `\ncheck:cartas → ${fallos.length === 0 ? "OK" : `${fallos.length} fallo(s)`} · ` +
    `${total} archivo(s), ${kb(pesoTotal)} en total`
);
process.exit(fallos.length ? 1 : 0);
