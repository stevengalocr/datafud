/**
 * Fotos de una carta: de lo que manda el local a lo que se publica en `public/cartas/<slug>/`.
 *
 * Esta versión copia los archivos tal cual, que es lo que hace hoy la entrega a mano. Es el
 * punto de partida que la unidad E03 tiene que mejorar: una foto de teléfono pesa varios MB y
 * en la mesa, con datos móviles, la carta no abre a tiempo.
 */

import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { fallar, slugificar } from "./carta-lib.mjs";

const DESTINO = (slug) => path.join("public", "cartas", slug);

/**
 * @param {{slug: string, dir: string, nombres: string[], logo?: string, dryRun?: boolean}} opciones
 * @returns {Promise<{fotos: Map<string,string>, logoUrl: string|null}>} nombre en el CSV → URL pública
 */
export async function procesarFotos({ slug, dir, nombres, logo, dryRun = false }) {
  const origenDir = path.join(dir, "fotos");
  const destinoDir = DESTINO(slug);
  if (!dryRun && (nombres.length || logo)) mkdirSync(destinoDir, { recursive: true });

  const fotos = new Map();
  for (const nombre of nombres) {
    const origen = path.join(origenDir, nombre);
    if (!existsSync(origen)) fallar(`No existe la foto ${origen}.`);
    const ext = path.extname(nombre).toLowerCase();
    const base = slugificar(path.basename(nombre, path.extname(nombre)));
    const salida = `${base}${ext}`;
    if (!dryRun) copyFileSync(origen, path.join(destinoDir, salida));
    fotos.set(nombre, `/cartas/${slug}/${salida}`);
    const kb = Math.round(statSync(origen).size / 1024);
    console.log(`  foto  ${nombre.padEnd(24)} → ${salida.padEnd(24)} ${String(kb).padStart(6)} KB`);
  }

  let logoUrl = null;
  if (logo) {
    const origen = path.join(dir, logo);
    if (!existsSync(origen)) fallar(`No existe el logo ${origen}.`);
    const salida = `logo${path.extname(logo).toLowerCase()}`;
    if (!dryRun) copyFileSync(origen, path.join(destinoDir, salida));
    logoUrl = `/cartas/${slug}/${salida}`;
    const kb = Math.round(statSync(origen).size / 1024);
    console.log(`  logo  ${logo.padEnd(24)} → ${salida.padEnd(24)} ${String(kb).padStart(6)} KB`);
  }

  return { fotos, logoUrl };
}
