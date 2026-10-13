#!/usr/bin/env node
/**
 * Mueve un código impreso a otro destino (D-014).
 *
 *   node scripts/qr-mover.mjs <código> </m/<local>/<token-de-la-mesa>>
 *   node scripts/qr-mover.mjs <código> </c/<slug>>
 *
 * Es el último paso de pasar una Carta al sistema (OFERTA.md §4, día 11): «Pasar una Carta al
 * sistema» en /admin/tenants copia el menú y crea la mesa, y dice qué comando correr. El stand y
 * el chip NFC no se tocan: siguen en `datafud.com/q/<código>` y solo cambia a dónde redirige.
 *
 * Solo cambia la línea de ese código en `src/content/qr.ts`, con el comentario que tenga encima.
 * No toca códigos comentados (reservados de locales dados de baja): esos no se reactivan.
 * Después: `npm run build`, commit y publicar. Hasta que se publique, el stand sigue abriendo la
 * carta vieja, que sigue en línea. Para quitar la Carta estática más adelante:
 * `node scripts/carta-borrar.mjs <slug>` (el código ya no apunta a `/c/<slug>`, así que no lo toca).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { CODIGO_QR_RE, correr, fallar, parseArgs } from "./carta-lib.mjs";

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const DESTINO_RE = new RegExp(`^(?:/m/[a-z0-9-]{1,60}/${UUID}|/c/[a-z0-9-]{1,60})$`);

await correr(async () => {
  const args = parseArgs(process.argv.slice(2));
  const [codigo, destino] = args._;
  if (!codigo || !destino) {
    fallar("Faltan datos.\n       node scripts/qr-mover.mjs <código> </m/<local>/<token-de-la-mesa>>");
  }
  if (!CODIGO_QR_RE.test(codigo)) fallar(`"${codigo}" no es un código impreso (6 caracteres, a-z y 2-9).`);
  if (!DESTINO_RE.test(destino)) {
    fallar(`"${destino}" no es un destino válido: tiene que ser /m/<local>/<token de la mesa> o /c/<slug>.`);
  }

  const qrPath = "src/content/qr.ts";
  const src = readFileSync(qrPath, "utf8");
  const linea = new RegExp(`^( *)${codigo}: "([^"]+)",(\\r?\\n)`, "m");
  const m = src.match(linea);
  if (!m) {
    const reservado = new RegExp(`^ *// *${codigo}:`, "m").test(src);
    fallar(
      reservado
        ? `${codigo} está reservado (local dado de baja). Un código no se reutiliza (D-014).`
        : `No hay ningún código "${codigo}" en ${qrPath}.`
    );
  }
  const [, sangria, antes, fin] = m;
  if (antes === destino) {
    console.log(`\n${codigo} ya apunta a ${destino}. No cambió nada.`);
    return;
  }

  const hoy = new Date().toISOString().slice(0, 10);
  const nuevo = src.replace(
    linea,
    `${sangria}// ${codigo} apuntaba a ${antes} hasta el ${hoy} (qr-mover).${fin}${sangria}${codigo}: "${destino}",${fin}`
  );
  writeFileSync(qrPath, nuevo, "utf8");

  console.log(`\nCódigo ${codigo} movido.`);
  console.log(`  antes   ${antes}`);
  console.log(`  ahora   ${destino}`);
  console.log(`\nSigue: npm run build, commit de ${qrPath} y publicar. El stand impreso no cambia.`);
});
