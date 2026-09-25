/**
 * Fotos de una carta: de lo que manda el local a lo que se publica (D-043).
 *
 * Un dueño de soda manda las fotos como salen del teléfono: 3000 px y varios MB. Servidas tal
 * cual, una carta de 6 platillos pesa 15 MB y con datos móviles no abre a tiempo en la mesa,
 * que es justo el momento en que tiene que abrir. Acá se recomprimen:
 *
 *   platillos  → .webp, máx. 800 px de lado mayor, ≤ 150 KB
 *   logo       → .webp (o .png si sale más chico), ≤ 60 KB
 *
 * **El presupuesto por foto se reparte según cuántas fotos tenga la carta.** 150 KB es el techo
 * de D-043, no el objetivo: una carta de 6 fotos puede gastarlos, pero una de 60 a 150 KB pesaría
 * 9 MB y la promesa de que abre en la mesa se cae. Se mide contra un presupuesto de imágenes por
 * carta y se baja primero el ancho y después la calidad hasta entrar.
 *
 * Bajar el ancho es casi gratis en calidad visible: la foto se muestra en un cuadro de 96 px CSS,
 * o sea 288 px en un teléfono de 3×. A 800 px se están mandando 7 veces más píxeles de los que
 * se ven. A 640 px todavía sobra margen y el archivo pesa la mitad.
 *
 * El límite se hace cumplir aparte, en `scripts/check-cartas.mjs`, que corre en cada `build`:
 * un archivo pesado puede entrar a `public/cartas/` por fuera de este script.
 */

import sharp from "sharp";
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fallar, slugificar } from "./carta-lib.mjs";

/** Techo por archivo (D-043). Nunca se supera, aunque la carta tenga pocas fotos. */
export const LIMITE_FOTO = 150 * 1024;
export const LIMITE_LOGO = 60 * 1024;
export const LADO_MAYOR = 800;
export const EXTENSIONES = new Set([".webp", ".png"]);

/**
 * Presupuesto de imágenes de una carta entera. No es el peso de lo que se descarga al abrir
 * —la carga diferida reparte eso en el tiempo— pero acotarlo es lo que mantiene la carta usable
 * con datos móviles hasta los postres.
 */
const PRESUPUESTO_CARTA = 3 * 1024 * 1024;
const MINIMO_POR_FOTO = 24 * 1024;

/** Cuántos KB le tocan a cada foto de esta carta. Con pocas fotos, el techo de D-043. */
export function presupuestoPorFoto(cantidad) {
  if (cantidad <= 0) return LIMITE_FOTO;
  return Math.max(MINIMO_POR_FOTO, Math.min(LIMITE_FOTO, Math.floor(PRESUPUESTO_CARTA / cantidad)));
}

/**
 * Baja primero el ancho y después la calidad, en ese orden: de 800 a 640 px no se nota nada
 * (el cuadro donde se muestra la foto es de 288 px en un teléfono de 3×), mientras que bajar la
 * calidad sí se empieza a ver en las texturas de la comida.
 */
async function aWebpBajoLimite(entrada, limite) {
  let ultimo = null;
  for (const ancho of [LADO_MAYOR, 640, 560, 480, 400]) {
    for (const calidad of [82, 74, 66, 58, 50, 42]) {
      const buf = await sharp(entrada)
        .rotate() // respeta la orientación EXIF: si no, las fotos verticales salen acostadas
        .resize({ width: ancho, height: ancho, fit: "inside", withoutEnlargement: true })
        .webp({ quality: calidad, effort: 5 })
        .toBuffer();
      ultimo = { buf, calidad, ancho };
      if (buf.length <= limite) return ultimo;
    }
  }
  return ultimo;
}

/**
 * @param {{slug: string, dir: string, nombres: string[], logo?: string, dryRun?: boolean}} opciones
 * @returns {Promise<{fotos: Map<string,string>, logoUrl: string|null}>} nombre en el CSV → URL pública
 */
export async function procesarFotos({ slug, dir, nombres, logo, dryRun = false }) {
  const origenDir = path.join(dir, "fotos");
  const destinoDir = path.join("public", "cartas", slug);
  if (!dryRun && (nombres.length || logo)) mkdirSync(destinoDir, { recursive: true });

  const presupuesto = presupuestoPorFoto(nombres.length);
  if (nombres.length) {
    console.log(
      `  ${nombres.length} foto(s), presupuesto de ${Math.round(presupuesto / 1024)} KB cada una ` +
        `(techo de D-043: ${Math.round(LIMITE_FOTO / 1024)} KB)`
    );
  }

  const fotos = new Map();
  for (const nombre of nombres) {
    const origen = path.join(origenDir, nombre);
    if (!existsSync(origen)) fallar(`No existe la foto ${origen}.`);

    const antes = statSync(origen).size;
    const { width, height } = await sharp(origen).metadata();
    const { buf, calidad, ancho } = await aWebpBajoLimite(origen, presupuesto);
    if (buf.length > LIMITE_FOTO) {
      fallar(
        `La foto ${nombre} no baja de ${Math.round(LIMITE_FOTO / 1024)} KB ni con la calidad más baja ` +
          `(quedó en ${Math.round(buf.length / 1024)} KB). Suele pasar con capturas de pantalla o ` +
          `collages: pedile al local la foto original del platillo.`
      );
    }

    const salida = `${slugificar(path.basename(nombre, path.extname(nombre)))}.webp`;
    if (!dryRun) writeFileSync(path.join(destinoDir, salida), buf);
    fotos.set(nombre, `/cartas/${slug}/${salida}`);
    console.log(
      `  foto  ${nombre.padEnd(22)} ${String(width)}×${height} ${String(Math.round(antes / 1024)).padStart(5)} KB` +
        ` → ${salida.padEnd(22)} ${String(Math.round(buf.length / 1024)).padStart(4)} KB (${ancho} px, q${calidad})`
    );
  }

  let logoUrl = null;
  if (logo) {
    const origen = path.join(dir, logo);
    if (!existsSync(origen)) fallar(`No existe el logo ${origen}.`);
    const antes = statSync(origen).size;

    // El logo se muestra chico (48–56 px) pero en pantallas de 3×, así que 256 px alcanza.
    // Se prueban webp y png porque un logo plano con pocos colores suele comprimir mejor en png.
    const base = sharp(origen)
      .rotate()
      .resize({ width: 256, height: 256, fit: "inside", withoutEnlargement: true });
    const candidatos = [
      { ext: ".webp", buf: await base.clone().webp({ quality: 90, effort: 5 }).toBuffer() },
      { ext: ".png", buf: await base.clone().png({ compressionLevel: 9, palette: true }).toBuffer() },
    ].sort((a, b) => a.buf.length - b.buf.length);

    const elegido = candidatos[0];
    if (elegido.buf.length > LIMITE_LOGO) {
      fallar(
        `El logo ${logo} no baja de ${Math.round(LIMITE_LOGO / 1024)} KB (quedó en ` +
          `${Math.round(elegido.buf.length / 1024)} KB). Pedile al local el logo en PNG o SVG, no una foto del rótulo.`
      );
    }

    const salida = `logo${elegido.ext}`;
    if (!dryRun) writeFileSync(path.join(destinoDir, salida), elegido.buf);
    logoUrl = `/cartas/${slug}/${salida}`;
    console.log(
      `  logo  ${logo.padEnd(22)} ${String(Math.round(antes / 1024)).padStart(11)} KB` +
        ` → ${salida.padEnd(22)} ${String(Math.round(elegido.buf.length / 1024)).padStart(4)} KB`
    );
  }

  return { fotos, logoUrl };
}
