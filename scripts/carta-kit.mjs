#!/usr/bin/env node
/**
 * Kit de entrega de una carta (D-044).
 *
 *   node scripts/carta-kit.mjs <slug> [--base https://datafud.com] [--servidor http://localhost:3177]
 *
 * Genera en `entregas/<slug>/` (carpeta en `.gitignore`):
 *
 *   qr-<codigo>.png      el QR suelto a 2000 px, para mandar a imprimir stands o rotulación
 *   qr-<codigo>.pdf      hoja tamaño carta con 4 QR para recortar y poner en las mesas hoy mismo
 *   carta-<slug>.pdf     la carta completa en español, de respaldo
 *   carta-<slug>-en.pdf  la misma en inglés
 *
 * `--base` es la URL que se graba en el QR y **siempre** es la de producción: lo impreso apunta
 * a `/q/<codigo>`, nunca a la carta directa, para poder mover la carta sin reimprimir (D-014).
 * `--servidor` es de dónde se leen las páginas para armar los PDF; por defecto el mismo `--base`,
 * pero se le puede pasar un `next start` local para generar el kit sin haber desplegado todavía.
 *
 * Chromium, en este orden: `KIT_CHROMIUM` (ruta a un binario), `/opt/pw-browsers/chromium` si
 * existe (entornos en la nube) y el que instaló Playwright. Sin ninguno, pide
 * `npx playwright install chromium`.
 */

import QRCode from "qrcode";
import { chromium } from "@playwright/test";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { correr, fallar, parseArgs } from "./carta-lib.mjs";

const TEXTO_QR = "Escanee para ver la carta · Scan for the menu";

const INSTALAR = "npx playwright install chromium";
const CHROMIUM_NUBE = "/opt/pw-browsers/chromium";

const esArchivo = (ruta) => existsSync(ruta) && statSync(ruta).isFile();

/** Qué Chromium usa el kit y de dónde salió. Falla con la instrucción si no hay ninguno. */
function chromiumDelKit() {
  const propio = process.env.KIT_CHROMIUM;
  if (propio) {
    if (!esArchivo(propio)) {
      fallar(
        `KIT_CHROMIUM apunta a ${propio}, que no es un archivo.\n` +
          `       Corregí la ruta o borrá la variable y corré: ${INSTALAR}`
      );
    }
    return { executablePath: propio, origen: "KIT_CHROMIUM" };
  }
  if (esArchivo(CHROMIUM_NUBE)) return { executablePath: CHROMIUM_NUBE, origen: CHROMIUM_NUBE };
  const dePlaywright = chromium.executablePath();
  if (dePlaywright && esArchivo(dePlaywright)) return { executablePath: dePlaywright, origen: "Playwright" };
  fallar(
    "No hay Chromium para armar los PDF del kit.\n" +
      `       Corré: ${INSTALAR}\n` +
      "       (o apuntá KIT_CHROMIUM a un Chromium que ya tengas)."
  );
}

async function abrirChromium() {
  const { executablePath, origen } = chromiumDelKit();
  try {
    const browser = await chromium.launch({ executablePath });
    console.log(`  chromium: ${origen} (${executablePath})`);
    return browser;
  } catch (e) {
    fallar(
      `No se pudo abrir Chromium desde ${origen} (${executablePath}).\n` +
        `       ${String(e.message).split("\n")[0]}\n` +
        `       Si no es un Chromium válido, corregí KIT_CHROMIUM o corré: ${INSTALAR}`
    );
  }
}

await correr(async () => {
  const args = parseArgs(process.argv.slice(2));
  const slug = args._[0];
  if (!slug) {
    fallar(
      "Falta el slug.\n" +
        "       node scripts/carta-kit.mjs <slug> [--servidor http://localhost:3177]\n\n" +
        "       Para un ensayo local (la carta todavía no está desplegada):\n" +
        "         npm run build && node node_modules/next/dist/bin/next start -p 3177\n" +
        "         node scripts/carta-kit.mjs <slug> --servidor http://localhost:3177\n" +
        "       El QR se graba igual con la URL de producción: lo impreso nunca apunta a una\n" +
        "       máquina de desarrollo."
    );
  }

  // Lo que se graba en el QR es SIEMPRE producción. `--servidor` solo dice de dónde leer las
  // páginas para armar los PDF. Son dos cosas distintas a propósito: un kit armado contra un
  // servidor local tiene que servir igual para mandar a imprimir.
  const base = (args.base || "https://datafud.com").replace(/\/$/, "");
  const servidor = (args.servidor || base).replace(/\/$/, "");

  if (!/^https:\/\//.test(base) || /localhost|127\.0\.0\.1|\.local(?::|$)/.test(base)) {
    fallar(
      `--base es ${base}, que no es una dirección pública.\n` +
        "       Lo que se grabe en el QR queda impreso en el stand para siempre: un código que\n" +
        "       apunta a una máquina de desarrollo no lo abre nadie.\n" +
        "       Si lo que querés es armar el kit sin haber desplegado todavía, no toqués --base:\n" +
        `       usá --servidor ${base}, que solo cambia de dónde se leen las páginas del PDF.`
    );
  }

  // Antes de escribir nada: sin Chromium no hay PDF, y un kit a medias confunde.
  chromiumDelKit();

  // ── El código impreso y el nombre del local salen del repo, no de argumentos ─
  const qrSrc = readFileSync("src/content/qr.ts", "utf8");
  const match = qrSrc.match(new RegExp(`^\\s*([a-z2-9]{6}): "/c/${slug}",`, "m"));
  if (!match) {
    fallar(
      `La carta "${slug}" no tiene código en src/content/qr.ts.\n` +
        `       Sin código no se imprime nada: un QR con la URL final de la carta queda congelado\n` +
        `       en el stand y obliga a reimprimir si la carta se mueve (D-014). Agregá\n` +
        `       "codigo_qr" en carta.json y volvé a correr scripts/carta-nueva.mjs.`
    );
  }
  const codigo = match[1];

  const cartaSrc = readFileSync(`src/content/cartas/${slug}.ts`, "utf8");
  const nombre = cartaSrc.match(/restaurant_name: "([^"]+)"/)?.[1] ?? slug;

  const destino = path.join("entregas", slug);
  mkdirSync(destino, { recursive: true });

  const urlImpresa = `${base}/q/${codigo}`;
  const salidas = [];

  // ── 1. El QR suelto, grande ────────────────────────────────────────────────
  // Corrección H: un stand en una mesa se ensucia y se raya, y H tolera hasta un 30 % del
  // código dañado. A 2000 px sirve lo mismo para un stand de 5 cm que para un rótulo.
  const pngPath = path.join(destino, `qr-${codigo}.png`);
  await QRCode.toFile(pngPath, urlImpresa, {
    type: "png",
    width: 2000,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#112a20", light: "#ffffff" },
  });
  salidas.push(pngPath);

  const qrDataUrl = await QRCode.toDataURL(urlImpresa, {
    width: 900,
    margin: 1,
    errorCorrectionLevel: "H",
    color: { dark: "#112a20", light: "#ffffff" },
  });

  const browser = await abrirChromium();
  try {
    // ── 2. Hoja de 4 QR para recortar ────────────────────────────────────────
    const hoja = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<style>
  @page { size: letter; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Georgia, "Times New Roman", serif; color: #112a20; }
  .hoja { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 6mm; height: 253mm; }
  .tarjeta { border: 1px dashed #b9b4ae; border-radius: 4mm; padding: 6mm 4mm;
             display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .nombre { font-size: 15pt; font-weight: bold; margin: 0 0 3mm; }
  img { width: 58mm; height: 58mm; }
  .texto { font-size: 9pt; margin: 3mm 0 0; line-height: 1.4; }
  .codigo { font-family: ui-monospace, "Courier New", monospace; font-size: 7.5pt; color: #6b6660; margin-top: 1.5mm; letter-spacing: 0.08em; }
</style></head><body>
  <div class="hoja">
    ${Array.from({ length: 4 })
      .map(
        () => `<div class="tarjeta">
      <p class="nombre">${nombre.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>
      <img src="${qrDataUrl}" alt="">
      <p class="texto">${TEXTO_QR}</p>
      <p class="codigo">${urlImpresa.replace(/^https?:\/\//, "")}</p>
    </div>`
      )
      .join("\n    ")}
  </div>
</body></html>`;

    const hojaPage = await browser.newPage();
    await hojaPage.setContent(hoja, { waitUntil: "load" });
    const qrPdf = path.join(destino, `qr-${codigo}.pdf`);
    await hojaPage.pdf({ path: qrPdf, format: "Letter", printBackground: true });
    await hojaPage.close();
    salidas.push(qrPdf);

    // ── 3. La carta en PDF, en cada idioma ───────────────────────────────────
    const idiomas = [
      { lang: "es", sufijo: "", boton: /^(es|Español)$/ },
      { lang: "en", sufijo: "-en", boton: /^(en|English)$/ },
    ];
    for (const idioma of idiomas) {
      const page = await browser.newPage({ viewport: { width: 820, height: 1100 } });
      const respuesta = await page.goto(`${servidor}/c/${slug}`, { waitUntil: "networkidle" });
      if (!respuesta || respuesta.status() !== 200) {
        fallar(
          [
            `${servidor}/c/${slug} respondió ${respuesta?.status() ?? "nada"}.`,
            "       Si la carta todavía no está desplegada, armá el kit contra un servidor local:",
            "         npm run build && node node_modules/next/dist/bin/next start -p 3177",
            `         node scripts/carta-kit.mjs ${slug} --servidor http://localhost:3177`,
            "       Ojo: next start no recoge una carta nueva si quedó levantado desde antes del",
            "       build. Si da 404 con el build recién hecho, reiniciá ese proceso.",
          ].join("\n")
        );
      }
      // El idioma es estado del cliente: se toca el botón, como lo haría el comensal.
      const boton = page.getByRole("button", { name: idioma.boton });
      if ((await boton.count()) > 0) {
        await boton.first().click();
        await page.waitForTimeout(400);
      } else if (idioma.lang !== "es") {
        console.log(`  AVISO  la carta no ofrece ${idioma.lang}: se omite carta-${slug}${idioma.sufijo}.pdf`);
        await page.close();
        continue;
      }
      // Las fotos de abajo cargan al bajar: sin recorrerla, el PDF sale con huecos.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState("networkidle");

      // Las fotos, achicadas solo para el PDF. Chromium no mete el .webp tal cual: lo
      // reencodifica sin pérdida, y un PDF de 14 platillos pesaba 5,6 MB de los cuales 5,4 eran
      // las 6 fotos. Pasándolas a JPEG de 240 px (se imprimen en un cuadro de 96 px) el archivo
      // queda en algo que se manda por WhatsApp sin pensarlo. No toca el sitio: pasa en esta
      // pestaña, un momento antes de imprimir.
      const achicadas = await page.evaluate(async () => {
        const imgs = [...document.querySelectorAll("[data-carta-seccion] article img")];
        let hechas = 0;
        for (const img of imgs) {
          try {
            await img.decode();
            const lado = Math.min(240, Math.max(img.naturalWidth, img.naturalHeight));
            const escala = lado / Math.max(img.naturalWidth, img.naturalHeight);
            const lienzo = document.createElement("canvas");
            lienzo.width = Math.round(img.naturalWidth * escala);
            lienzo.height = Math.round(img.naturalHeight * escala);
            lienzo.getContext("2d").drawImage(img, 0, 0, lienzo.width, lienzo.height);
            img.src = lienzo.toDataURL("image/jpeg", 0.82);
            await img.decode();
            hechas++;
          } catch {
            // Si una foto no se deja copiar al lienzo se deja como está: mejor un PDF pesado
            // que un PDF con un hueco donde iba el platillo.
          }
        }
        return hechas;
      });

      const pdf = path.join(destino, `carta-${slug}${idioma.sufijo}.pdf`);
      await page.pdf({
        path: pdf,
        format: "Letter",
        printBackground: true,
        margin: { top: "10mm", bottom: "12mm", left: "10mm", right: "10mm" },
        displayHeaderFooter: true,
        headerTemplate: "<span></span>",
        footerTemplate:
          `<div style="width:100%;font-size:8px;color:#6b6660;font-family:Georgia,serif;padding:0 12mm;` +
          `display:flex;justify-content:space-between;">` +
          `<span>${nombre.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>` +
          `<span>${urlImpresa.replace(/^https?:\/\//, "")}</span>` +
          `<span class="pageNumber"></span></div>`,
      });
      await page.close();
      salidas.push(pdf);
      if (achicadas) console.log(`  ${achicadas} foto(s) achicadas a 240 px para el PDF ${idioma.lang}`);
    }
  } finally {
    await browser.close();
  }

  console.log(`\nKit de "${nombre}" (/c/${slug}, código ${codigo})`);
  console.log(`  QR grabado con  ${urlImpresa}`);
  console.log(`  Páginas leídas  ${servidor}/c/${slug}`);
  for (const s of salidas) console.log(`  ✓ ${s}`);
  console.log(`\nEl QR apunta a /q/${codigo}, no a la carta: si un día la carta se mueve se cambia`);
  console.log(`una línea en src/content/qr.ts y lo impreso sigue sirviendo.`);
});
