#!/usr/bin/env node
// Genera el material pesado del fixture de prueba: el logo y las 6 fotos "de teléfono".
//
//   node scripts/fixtures/carta-prueba/generar.mjs
//
// Las imágenes NO se versionan (están en .gitignore): pesan decenas de MB y se reconstruyen
// idénticas desde acá. Lo que sí se versiona es este script, `menu.csv` y `carta.json`.
//
// El objetivo es parecerse a lo que manda un dueño de soda por WhatsApp: JPEG de cámara de
// teléfono, más de 3000 px de lado y varios MB cada uno. Si el fixture fuera liviano, la unidad
// de optimización de fotos (E03) pasaría sin probar nada.

import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const FOTOS = path.join(DIR, "fotos");
mkdirSync(FOTOS, { recursive: true });

// Ruido de grano fino: sin él, el JPEG de una imagen lisa comprime a unos pocos KB y no se
// parecería en nada a una foto de cámara.
function ruido(w, h, base) {
  const px = Buffer.allocUnsafe(w * h * 3);
  let semilla = base;
  for (let i = 0; i < px.length; i += 3) {
    semilla = (semilla * 1664525 + 1013904223) >>> 0;
    const n = semilla >>> 24;
    px[i] = (base * 7 + n) % 256;
    px[i + 1] = (base * 13 + n * 3) % 256;
    px[i + 2] = (base * 29 + n * 5) % 256;
  }
  return sharp(px, { raw: { width: w, height: h, channels: 3 } });
}

const FOTOS_FIXTURE = [
  "ceviche.jpg",
  "patacones.jpg",
  "chifrijo.jpg",
  "casado.jpg",
  "pescado.jpg",
  "arroz-camarones.jpg",
];

for (const [i, nombre] of FOTOS_FIXTURE.entries()) {
  const destino = path.join(FOTOS, nombre);
  // Un desenfoque suave sobre el ruido da algo que comprime como una foto de verdad (unos
  // pocos MB) en vez de como una carta de ruido puro (15 MB y nada que ver con el caso real).
  await ruido(3200, 2400, 40 + i * 31)
    .blur(1.6)
    .jpeg({ quality: 92, chromaSubsampling: "4:2:0" })
    .toFile(destino);
  const { size } = await stat(destino);
  console.log(`${nombre.padEnd(20)} 3200×2400  ${(size / 1024 / 1024).toFixed(1)} MB`);
}

// Logo: 800 px, PNG con transparencia, como el que manda un local desde Canva.
const logo = path.join(DIR, "logo.png");
await sharp({
  create: { width: 800, height: 800, channels: 4, background: { r: 31, g: 75, b: 63, alpha: 1 } },
})
  .composite([
    {
      input: Buffer.from(
        `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
           <circle cx="400" cy="400" r="330" fill="#c98b2e"/>
           <text x="400" y="470" font-family="Georgia,serif" font-size="260" font-weight="bold"
                 text-anchor="middle" fill="#1f4b3f">RP</text>
         </svg>`
      ),
      top: 0,
      left: 0,
    },
  ])
  .png()
  .toFile(logo);
const { size: logoSize } = await stat(logo);
console.log(`${"logo.png".padEnd(20)} 800×800    ${(logoSize / 1024).toFixed(0)} KB`);
