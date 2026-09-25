# Estado del loop — Imágenes nuevas y honestas (2026-09-25)

> Sexto bucle autónomo, sobre `main` @ `a7e9798` (1.3.0). Reemplaza las tres imágenes de la web
> que contradicen las reglas de la marca (texto, euros, marca inventada, personas, comida
> generada) y hace que todo QR dibujado en un render escanee de verdad.
> Prompt maestro: `LOOP-Imagenes-Datafud.md` (v1), decisiones CERRADAS D-049 a D-051.
> Si la sesión se corta: "Releé docs/plans/imagenes-loop-state.md y continuá el loop".

## Contador

- Iteración actual: 7
- Iteraciones consumidas: 7 / 12
- **LOOP COMPLETO** (R01–R07 hechas, ninguna bloqueada)

## Capacidades del entorno

| Capacidad | Estado | Evidencia |
|---|---|---|
| Navegador real | Sí | Chromium de `@playwright/test` 1.63 |
| Decodificar QR | Sí, **fuera del repo** | OpenCV 5.0 (`cv2.QRCodeDetector`) en un venv temporal del scratchpad; nada entra en `package.json` |
| `sharp` | Sí, transitiva de `next` | Sin cambios respecto del loop anterior |
| gh CLI · git push a `main` | Sí | |
| Vercel | Sí (MCP) | Proyecto `datafud` `prj_n957iGSeYbe4GbTsDxlP0ytLHJSt`; último READY `dpl_HQ8KawyQrn6QmBNTcJF3xBzxaVj8` (`a7e9798`) |
| Puerto 3000 | Ocupado por otro proyecto | Todo lo local corre en `:3177` (`QA_BASE=http://localhost:3177`) |

### Ajustes al repo (§3.2 del prompt)

- **Los renders no estaban en el repo.** El paso previo (subirlos a `public/renders/` por la web
  de GitHub) no se hizo: `origin/main` seguía en `a7e9798` sin esa carpeta. Steven adjuntó las
  tres imágenes en el mensaje que arrancó el loop, así que se tomaron de ahí; **no se generó
  ninguna sustituta**. El render de la mesa es byte a byte el de
  `Downloads/datafud-restaurante-qr-nfc.webp`.
- **Los bytes no coinciden con la tabla §0.** Las imágenes recibidas son más pesadas que las que
  describe el prompt (probablemente la tabla es de otra exportación). Se versionan tal cual las
  entregó Steven: la web las sirve siempre por `next/image`, que las redimensiona, así que el peso
  del original no llega al teléfono. Los tres decodifican a la URL correcta.

| Archivo | Tabla §0 | Recibido | SHA-256 |
|---|---|---|---|
| `ambiente-mesa.webp` | 131 028 | 159 200 | `43dc7988…a32690` |
| `ambiente-piedra.webp` | 128 604 | 208 098 | `aad44acc…fbc723` |
| `tarjeta-nfc.webp` | 109 728 | 183 762 | `99bec071…35a342` |

## Unidades

| ID | Título | Estado | Intentos | Commit | Despliegue | Evidencia |
|---|---|---|---|---|---|---|
| R01 | Estado, línea base y archivos | hecho | 1 | `ebd5e77` | READY `dpl_GSgjRAdP…` | Abajo |
| R02 | Hero | hecho | 1 | `d5013ba` + `03e47c1` | READY `dpl_3e79x2bj…` | Abajo |
| R03 | Tarjeta NFC en `#hardware` | hecho | 1 | `be38789` | READY `dpl_BFrhfgus…` | Abajo |
| R04 | Fondo del cierre (footer) | hecho | 1 | `e9c5744` | READY `dpl_Dqv9PoVm…` | Abajo |
| R05 | QR real en los renders de estudio | hecho | 1 | `933d8a2` | READY `dpl_3hC2DbkM…` | Abajo |
| R06 | Auditoría de imágenes públicas | hecho | 1 | `d84a8f8` | READY `dpl_3ghyHuat…` | Abajo |
| R07 | Verificación final, release 1.3.1 y puente | hecho | 1 | `316d576` | READY `dpl_2Kky21dK…` | Abajo e informe |

## Herramientas de verificación del loop

En `.qa/bin/` (ignorada por git) y en el venv temporal:

| Script | Qué comprueba |
|---|---|
| `node .qa/bin/peso-home.mjs <base> / 3` | Peso transferido (encodedDataLength) y LCP de la home a 375×812, DPR 2, 4G lenta y CPU x4; mediana de 3 corridas |
| `python qr.py <imagenes…>` | Decodifica el QR de cada imagen con OpenCV (copia en `.qa/bin/qr.py`) |
| `node .qa/bin/contraste.mjs <base> <ancho>` | R04: contraste de cada texto del cierre contra el píxel de fondo más claro de su caja (texto oculto al fotografiar) |
| `node .qa/bin/shot.mjs <url> <png> "w=…,h=…,scroll=1,sel=…"` | Captura; `scroll=1` recorre la página antes para que carguen las imágenes diferidas |
| `python pegar-qr.py <in> <out> <qr.json>` | R05: pega el QR real sobre el panel blanco con perspectiva (copia en `.qa/bin/pegar-qr.py`) |

## Línea base (literal)

`main` @ `a7e9798`, versión 1.3.0.

```
$ npm ci                → ci=0
$ npm run typecheck     → tc=0   (tsc --noEmit, sin salida)
$ npm run lint          → ✔ No ESLint warnings or errors
$ npm run build         → build=0 (check-cartas + next build)
$ QA_BASE=http://localhost:3177 npm run qa:landing
qa:landing → OK · 21 avisos
```

Peso de la home (línea base):

```
http://localhost:3177/ a 375×812 (DPR 2, 4G lenta, CPU x4), 3 corridas (mediana):

  LCP                 1040 ms   (1044 / 1032 / 1040)
  elemento LCP        IMG /_next/image?url=/banner.png&w=750&q=75
  bytes imagen LCP    31.6 KB
  AL ABRIR            244.2 KB
  RECORRIDA ENTERA    399.2 KB

  imágenes (recorrida entera):
        49.4 KB  /_next/image?url=/cta-bg.png&w=750&q=75
        31.6 KB  /_next/image?url=/banner.png&w=750&q=75
        19.9 KB  /_next/image?url=/nfc.png&w=750&q=75
        10.4 KB  /_next/image?url=/stand-resenas.webp&w=750&q=75
        10.3 KB  /_next/image?url=/stand-qr-3d.webp&w=750&q=75
        10.1 KB  /_next/image?url=/stand-qr-3d-nfc.webp&w=750&q=75
         4.1 KB  /_next/image?url=/logo-main.png&w=384&q=75
         1.3 KB  /_next/image?url=/icono-main.png&w=96&q=75
```

QR de los renders nuevos (OpenCV 5.0):

```
ambiente-mesa.webp   | 1536x1024 | 159200 B | 'https://datafud.com/q/demo26'
ambiente-piedra.webp | 1536x1024 | 208098 B | 'https://datafud.com/q/demo26'
tarjeta-nfc.webp     | 1536x1024 | 183762 B | 'https://datafud.com/q/demo26'
```

QR de los renders de estudio (antes de R05):

```
stand-qr-3d.webp     | 27692 B | None
stand-qr-3d-nfc.webp | 26986 B | None
stand-resenas.webp   | 25128 B | None
```

Ninguno de los tres de estudio escanea: confirma el hallazgo de §0 y amplía el alcance de R05 a
los tres, no solo a `stand-qr-3d.webp`.

## PENDIENTES-STEVEN

- Fotos reales de los stands impresos → `public/hardware/<código>.webp` (reemplazan la etiqueta).
- Imprimir el stand de muestra con `/q/demo26` y escanearlo.
- IVA y factura 4.4; confirmar propuestas D-034–D-038, D-047, D-048.
- Siguen abiertos los del loop anterior (`docs/plans/entrega-loop-state.md`).
- Decidir si `icono-main.png` (782 KB, favicon sin optimizar) se reexporta a 512 px.
- Confirmar que el logo del local ficticio de la demo ("Verde Limón") puede seguir: la regla
  §1.3 prohíbe marcas inventadas en imágenes; la demo lo presenta como ejemplo.
- De la revisión fresca: fotos de Unsplash de la demo que no corresponden a su platillo; cinco
  estrellas del stand de reseñas; "₡" a 13 px que se lee como "€" en el teléfono de la demo;
  QR reconocible en el fondo del cierre a 1440.

## Informes por unidad

### R01 · Estado, línea base y archivos

- Línea base en verde (typecheck, lint, build, `qa:landing → OK · 21 avisos`).
- Los tres renders nuevos, versionados en `public/renders/`, decodifican a
  `https://datafud.com/q/demo26`. Los tres de estudio no decodifican.
- El LCP de la home en móvil es el `banner.png` del hero (31,6 KB servidos por `next/image`).

### R02 · Hero

- Antes: `ambiente-mesa en / = 0 · banner.png en / = 2`.
- `src/app/page.tsx`: `renders/ambiente-mesa.webp`, 1536×1024, `priority`,
  `sizes="(min-width: 520px) 444px, calc(100vw - 56px)"`, alt del prompt y chip "Render
  ilustrativo" abajo a la izquierda. Capturas a 375, 768 y 1440 miradas: stand y tarjeta completos;
  el chip no tapa el QR ni el chip "Carta publicada · Español · English".
- QR de la imagen **servida** (no solo del original):
  ```
  served-640.webp  | 640x427  | 31054 B | 'https://datafud.com/q/demo26'   (local)
  served-1080.webp | 1080x720 | 61628 B | 'https://datafud.com/q/demo26'   (local)
  prod-640.webp    | 640x427  | 31054 B | 'https://datafud.com/q/demo26'   (datafud.com)
  ```
- **LCP.** Con 3 y 5 corridas el LCP nuevo salía 16–80 ms arriba, dentro del ruido (una misma
  build varía de 1032 a 1176 ms). Para comparar en igualdad se levantó la línea base `a7e9798`
  en un worktree (`:3178`) y se midió **intercalado**, 3×3 corridas por lado:
  ```
  base  a7e9798: 1036 1144 1048 1176 1148 1160 1064 1048 1048 → mediana 1064 ms
  R02          : 1064 1060 1068 1052 1128 1048 1132 1056 1108 → mediana 1064 ms
  ```
  Criterio "LCP ≤ línea base": se cumple (empate). Imagen LCP: 31,6 KB → 30,7 KB.
- **Tropiezo.** `d5013ba` salió solo con el borrado de `banner.png` (el `git add` falló al nombrar
  un archivo ya borrado y el commit tomó únicamente lo que estaba en el índice). Producción sirvió
  ese despliegue ~20 s con el hero pidiendo `/banner.png`; `03e47c1` lo completó. Desde acá:
  `git show --stat HEAD` antes de cada push.

### R03 · Tarjeta NFC en `#hardware`

- Antes: la home pedía `url=%2Fnfc.png`.
- `PRICING.hardware` → `tarjeta-nfc.photo = "/renders/tarjeta-nfc.webp"` (único cambio en
  `constants.ts`; `photoIsRender` ya era `true`). `ALT["tarjeta-nfc"]` con el texto del prompt.
- `Visual` acepta `position` (encuadre) y `chip` (dónde va la etiqueta). La tarjeta usa
  `object-[50%_25%]` y la etiqueta arriba a la derecha: en 5/2 abajo a la izquierda tapaba la
  esquina de la tarjeta (captura mirada y descartada).
- Capturas a 375, 768 y 1440 miradas: la tarjeta entera, el stand con su QR a la derecha.
- Etiquetas: `375px: "Render ilustrativo" en #hardware = 4, con caja visible = 4` (ídem 1440).
- `nfc.png` borrado; `grep -rn "nfc\.png" src scripts` → sin resultados.
- Puertas A en verde (`qa:landing → OK · 21 avisos`).

### R04 · Fondo del cierre (footer)

- Antes: `cta-bg.png en / = 1`.
- `site-footer.tsx`: `renders/ambiente-piedra.webp`, `alt=""`, mismas capas de oscurecido.
- **Ajuste respecto del prompt.** Con `object-position` solo no alcanza: a 1440 la capa mide
  1440×680 y el render se escala por el ancho, así que no hay holgura horizontal y el stand quedaba
  justo detrás del párrafo y del botón (captura mirada y descartada). La capa se estira a la
  derecha (`sm:-right-[80%] lg:-right-[45%]`) con `object-left-top`: el stand cae abajo a la
  derecha del texto a 1024 y 1440, fuera de pantalla a 768, y a 375 se ve la piedra con la
  tarjeta en su base, debajo del botón. `sizes="100vw"`: con `145vw` el escritorio bajaba la
  variante de 3840 px para un fondo que va bajo una capa oscura del 80–90 %.
- Capturas a 375, 768, 1024 y 1440 miradas.
- Contraste (texto oculto al fotografiar; el fondo es el píxel **más claro** de la caja; el color
  del texto se mezcla con su alfa). No hizo falta subir la opacidad de la capa:

| Elemento | 375 | 768 | 1024 | 1440 | Mínimo |
|---|---|---|---|---|---|
| Etiqueta "Empezá hoy" (12 px) | 4,80:1 | 4,98:1 | 4,98:1 | 4,91:1 | 4,5:1 |
| Titular (32–56 px) | 10,86:1 | 11,00:1 | 11,18:1 | 11,01:1 | 3:1 |
| Texto (14 px, 80 % de alfa) | 8,41:1 | 8,52:1 | 9,10:1 | 9,31:1 | 4,5:1 |
| Botón WhatsApp (12 px, fondo sólido) | 6,17:1 | 6,17:1 | 6,17:1 | 6,17:1 | 4,5:1 |

  Línea base con `cta-bg.png` (misma herramienta): etiqueta 5,45 / 4,98, titular 11,17 / 11,29,
  texto 8,42 / 9,66 (375 / 1440). La etiqueta queda más cerca del mínimo porque su peor píxel es
  su propio borde translúcido (`border-white/15`), no la foto.
- Peso de la home (375×812): recorrida entera **399,2 → 382,1 KB**; al abrir 244,2 → 243,6 KB.
- `cta-bg.png` borrado; `grep -rn "cta-bg" src scripts` → sin resultados. Puertas A en verde
  (`qa:landing → OK · 21 avisos`).
- Producción (`?rev=e9c5744`): la home pide `renders/tarjeta-nfc` y `renders/ambiente-piedra`;
  `nfc.png`, `cta-bg.png` y `banner.png` = 0. `/c/ejemplo 200`, `/q/demo26 307 → /c/ejemplo`.

### R05 · QR real en los renders de estudio (D-051)

- Antes:
  ```
  stand-qr-3d.webp     | 1536x1024 | 27692 B | None
  stand-qr-3d-nfc.webp | 1536x1024 | 26986 B | None
  stand-resenas.webp   | 1536x1024 | 25128 B | None
  ```
- Cómo (`.qa/bin/pegar-qr.py`, OpenCV en el venv temporal; solo se commitean las imágenes):
  1. El panel es el hueco no verde más grande dentro del cuerpo verde del stand → cuadrilátero.
  2. Se borran los módulos de la IA (`inpaint`) y se suaviza la luz del papel.
  3. Matriz de `qrcode` (ECC H, versión 4, 33×33, la misma librería y nivel que el kit) con 1
     módulo de margen, deformada al panel (con 2,5 px de retiro del borde) y supermuestreada ×4.
  4. Papel × QR: módulos negro puro, blanco con la luz original. WebP calidad 86.
- Después:
  ```
  stand-qr-3d.webp     | 1536x1024 | 37896 B | 'https://datafud.com/q/demo26'
  stand-qr-3d-nfc.webp | 1536x1024 | 36082 B | 'https://datafud.com/q/demo26'
  stand-resenas.webp   | 1536x1024 | 34726 B | 'https://datafud.com/q/demo26'
  ```
  Variantes servidas por `next/image` (640, 750 y 1080 px de cada una): **9 de 9** decodifican
  a `https://datafud.com/q/demo26`.
- **Trampa encontrada.** La primera lectura de las variantes servidas dio `None` en 4 de 6: el
  caché local de `next/image` (`.next/cache/images`) se indexa por URL, ancho y calidad, **no por
  el contenido**, y un `next build` no lo limpia. Seguía sirviendo los renders viejos. Con
  `rm -rf .next/cache/images` y el servidor reiniciado, 9 de 9. En producción se comprueba igual
  (R05 en producción, abajo).
- Zoom ×2 de los bordes del pegado y capturas de `#hardware` a 375 y 1440 miradas: sin halos ni
  bordes visibles. A la derecha el margen queda algo menor que 1 módulo por el bisel del panel;
  decodifica igual.
- Puertas A en verde (`qa:landing → OK · 21 avisos`).
- **Producción** (`dpl_3hC2DbkM…`): original + 750 + 1080 de cada uno, 9 de 9 decodifican a
  `https://datafud.com/q/demo26`. El optimizador de Vercel no sirvió versiones viejas (a
  diferencia del caché local).

### R06 · Auditoría de todas las imágenes públicas

Uso = `grep` de la ruta y del nombre en `src/`, `scripts/` y `next.config.mjs`. Cada imagen
mirada a ojo.

| Archivo | Bytes | Usado en | Veredicto |
|---|---|---|---|
| `/renders/ambiente-mesa.webp` | 159 200 | hero (`page.tsx`) | OK · render etiquetado, QR real |
| `/renders/ambiente-piedra.webp` | 208 098 | fondo del cierre (`site-footer.tsx`) | OK · decorativo, QR real |
| `/renders/tarjeta-nfc.webp` | 183 762 | `#hardware` (`constants.ts`) | OK · render etiquetado, QR real |
| `/stand-qr-3d.webp` | 37 896 | `#hardware` | OK · render etiquetado, QR real (R05) |
| `/stand-qr-3d-nfc.webp` | 36 082 | `#hardware` | OK · ídem |
| `/stand-resenas.webp` | 34 726 | `#hardware` | OK · ídem |
| `/logo-main.png` | 840 456 | nav, footer, login, legales | OK · el texto es la propia marca |
| `/icono-main.png` | 782 659 | favicon, apple-icon, JSON-LD, confianza, sidebar | OK · isotipo sin texto (ver nota de peso) |
| `/demo/logo-verde-limon.webp` | 4 268 | demo (`mock.ts`) | OK con nota · logo del local **ficticio** de la demo, que la web presenta como demo |
| `/hardware-familia.webp` | 50 128 | — | **Borrado** · sin uso y con 3 QR inventados (`detectados 2, decodificados []`) |
| `/libro-marca.png` | 2 230 638 | — (solo `BRAND.md`) | **Movido a `docs/marca/`** · texto con errores y promesa de "Orders. Analytics." |
| `/banner.png`, `/cta-bg.png`, `/nfc.png` | — | — | Borrados en R02–R04 |

Fuera de `public/`: las fotos de platillos de la demo son de Unsplash (fotos reales con licencia,
permitidas por el prompt); la carta `/c/ejemplo` no tiene fotos. Las imágenes OG se generan con
`opengraph-image` y llevan texto a propósito (son tarjetas para compartir, no fotos).

**0 imágenes usadas que rompan §1.3.** Antes de borrarlos, producción servía los dos sobrantes:
`/hardware-familia.webp 200`, `/libro-marca.png 200`.

Hallazgo sin tocar (no es de este loop): `icono-main.png` pesa 782 KB y es el favicon y el
`apple-icon` **sin optimizar** (no pasa por `next/image`). No afecta al LCP, pero cada primera
visita lo baja. Queda en PENDIENTES para decidir si se reexporta a 512 px.

Puertas A en verde (`qa:landing → OK · 21 avisos`).

### R07 · Verificación final, release 1.3.1 y puente

- Puertas B, C, D y G (literal en `.qa/r07/puertas-bcdg.txt`):
  ```
  $ grep -rn "banner.png\|cta-bg.png\|nfc.png" src      → 0 coincidencias
  $ ls public/banner.png public/cta-bg.png public/nfc.png → No such file or directory (×3)
  ambiente-mesa.webp   | 'https://datafud.com/q/demo26'
  ambiente-piedra.webp | 'https://datafud.com/q/demo26'
  tarjeta-nfc.webp     | 'https://datafud.com/q/demo26'
  stand-qr-3d-nfc.webp | 'https://datafud.com/q/demo26'
  stand-qr-3d.webp     | 'https://datafud.com/q/demo26'
  stand-resenas.webp   | 'https://datafud.com/q/demo26'
  $ ls public/hardware                                    → No such file or directory
  $ git diff a7e9798 -- supabase/ | wc -l                 → 0
  $ git diff a7e9798 -- src/lib/constants.ts              → solo photo: "/nfc.png" → "/renders/tarjeta-nfc.webp"
  ```
- Puerta E (intercalada contra la línea base, 3 rondas × 3 corridas): recorrida entera
  399,3 → 385,5 KB, al abrir 244,4 → 243,6 KB, LCP mediana de 9: 1068 → 1052 ms.
- Revisor con contexto fresco sobre producción (`?rev=d84a8f8`) a 375 y 1440: ninguna imagen
  promete pedidos, carrito, panel ni estadísticas; no hay euros; todos los renders de producto
  llevan la etiqueta. Roces y hallazgos fuera de alcance en el informe y en PENDIENTES.
- `package.json` → 1.3.1; CHANGELOG `[1.3.1]`; informe `docs/plans/imagenes-loop-report.md`;
  `CLAUDE.md` suma la regla de imágenes y la trampa del caché de `next/image`.
- Puerta F en producción (`dpl_2Kky21dKbgFRwgaAEPiXB8W8fFGi`, alias `datafud.com`):
  ```
  home ?rev=316d576 — referencias
    renders%2Fambiente-mesa 33 · renders%2Ftarjeta-nfc 11 · renders%2Fambiente-piedra 9
    banner.png 0 · cta-bg.png 0 · nfc.png 0 · hardware-familia 0
  /c/ejemplo 200
  /q/demo26 307 https://datafud.com/c/ejemplo
  /banner.png 404 · /cta-bg.png 404 · /nfc.png 404 · /hardware-familia.webp 404 · /libro-marca.png 404
  ```
  Capturas del hero, `#hardware` y el cierre a 375 y 1440 contra producción, miradas.
