#!/usr/bin/env node
/**
 * Baja de una carta.
 *
 *   node scripts/carta-borrar.mjs <slug> [--conservar-codigo]
 *
 * Quita `src/content/cartas/<slug>.ts`, su import y su entrada en `CARTAS`, y las fotos de
 * `public/cartas/<slug>/`.
 *
 * **El código impreso no se borra por defecto** (D-014): el stand puede seguir en una mesa o en
 * la billetera de alguien, así que se deja apuntando a `/?qr=desconocido` con un comentario de
 * cuándo se dio de baja el local, y nunca se reutiliza para otro. `--conservar-codigo` deja la
 * línea intacta (para mover la carta a otra ruta a mano, por ejemplo al pasar de `/c` a `/m`).
 *
 * Para el fixture de prueba de los loops, que nunca tuvo un stand impreso, la línea se borra
 * entera: `--fixture`.
 */

import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { correr, fallar, parseArgs } from "./carta-lib.mjs";

await correr(async () => {
  const args = parseArgs(process.argv.slice(2));
  const slug = args._[0];
  if (!slug) fallar("Falta el slug.\n       node scripts/carta-borrar.mjs <slug> [--conservar-codigo] [--fixture]");

  const cartaPath = `src/content/cartas/${slug}.ts`;
  const indexPath = "src/content/cartas/index.ts";
  const qrPath = "src/content/qr.ts";
  const fotosDir = path.join("public", "cartas", slug);

  const indexSrc = readFileSync(indexPath, "utf8");
  if (!existsSync(cartaPath) && !indexSrc.includes(`from "./${slug}"`)) {
    fallar(`No hay ninguna carta "${slug}" para dar de baja.`);
  }

  const indexNuevo = indexSrc
    .replace(new RegExp(`^import \\{ ${slug} \\} from "\\./${slug}";\\r?\\n`, "m"), "")
    .replace(/export const CARTAS: CartaEstatica\[\] = \[([^\]]*)\];/, (_, actual) => {
      const items = actual.split(",").map((s) => s.trim()).filter((s) => s && s !== slug);
      return `export const CARTAS: CartaEstatica[] = [${items.join(", ")}];`;
    });

  let qrSrc = readFileSync(qrPath, "utf8");
  // Se captura también el comentario con el nombre del local que `carta-nueva` deja encima,
  // para no dejarlo huérfano sobre la línea del local siguiente.
  const lineaQr = new RegExp(`^(?: *//[^\n]*\r?\n)?( *)([a-z2-9]{6}): "/c/${slug}",\r?\n`, "m");
  const match = qrSrc.match(lineaQr);
  let notaQr = "el código no cambió";
  if (match && !args["conservar-codigo"]) {
    const [, sangria, codigo] = match;
    if (args.fixture) {
      // Fixture de los loops: nunca existió un stand impreso, así que la línea se va entera.
      qrSrc = qrSrc.replace(lineaQr, "");
      notaQr = `${codigo} borrado (fixture, nunca se imprimió)`;
    } else {
      const hoy = new Date().toISOString().slice(0, 10);
      qrSrc = qrSrc.replace(
        lineaQr,
        `${sangria}// Local dado de baja el ${hoy}. El código queda reservado: el stand impreso puede\n` +
          `${sangria}// seguir dando vueltas y NUNCA se reutiliza para otro local (D-014).\n` +
          `${sangria}// ${codigo}: "/c/${slug}",\n`
      );
      notaQr = `${codigo} reservado (queda comentado, apunta a /?qr=desconocido)`;
    }
  }

  writeFileSync(indexPath, indexNuevo, "utf8");
  if (qrSrc !== readFileSync(qrPath, "utf8")) writeFileSync(qrPath, qrSrc, "utf8");
  rmSync(cartaPath, { force: true });
  rmSync(fotosDir, { recursive: true, force: true });

  console.log(`\nCarta "${slug}" dada de baja.`);
  console.log(`  ${cartaPath}  borrado`);
  console.log(`  ${indexPath}  sin el import ni la entrada en CARTAS`);
  console.log(`  ${fotosDir}   borrado`);
  console.log(`  ${qrPath}     ${notaQr}`);
});
