# Estado del loop — Pulido para salir a vender (2026-09-25)

> Séptimo bucle autónomo, sobre `main` @ `6b3c231` (1.3.1). Deja la demo y la web listas para
> mandárselas a un prospecto: fotos que muestran el platillo que nombran, "₡" que se ve como colón,
> íconos livianos, imágenes remotas cerradas, condiciones comerciales publicadas y el cierre sin un
> QR que compita con WhatsApp.
> Prompt maestro: `LOOP-Pulido-Salida-Datafud.md` (v1), decisiones CERRADAS D-034–D-038, D-043,
> D-047, D-048 y D-052 a D-056.
> Si la sesión se corta: "Releé docs/plans/pulido-loop-state.md y continuá el loop".

## Contador

- Iteración actual: 7
- Iteraciones consumidas: 7 / 14

## Capacidades del entorno

| Capacidad | Estado | Evidencia |
|---|---|---|
| Navegador real | Sí | Chromium de `@playwright/test` 1.63 |
| OpenCV · fontTools · `pyftsubset` | Sí, **fuera del repo** | venv temporal en el scratchpad de la sesión (OpenCV 5.0, fontTools 4.66); nada entra en `package.json` |
| Buscar fotos con licencia | Sí | Unsplash y Pexels desde el navegador integrado (la API de Unsplash pide clave: se lee la web) |
| `sharp` | Sí, transitiva de `next` | Se declara en P07 |
| gh CLI · git push a `main` | Sí | |
| Vercel | Sí (MCP) | Proyecto `datafud` `prj_n957iGSeYbe4GbTsDxlP0ytLHJSt` |
| Puerto 3000 | Ocupado por otro proyecto | Todo lo local corre en `:3177` |

### Ajustes al repo (§3.2 del prompt)

- **Las fuentes de marca no pintan en ninguna página, tampoco en producción.** `globals.css`
  declara `:root { --font-sans: ui-sans-serif, …; --font-display: Georgia, … }` y, en el CSS
  compilado, esas dos variables quedan **después** de las clases de `next/font`
  (`.__variable_0d1ac7{--font-display:"Young Serif",…}`). Misma especificidad, gana la última:
  el navegador pinta Georgia y Segoe UI (en un iPhone, Georgia y SF; en Android, la serif y la
  Roboto del sistema). Los dos `woff2` de marca se precargan igual y no se usan. Medido con CDP
  (`CSS.getPlatformFontsForNode`), local y en `datafud.com`:
  ```
  h1     | CSS: Georgia, "Times New Roman", serif | pinta: Georgia ×17, Georgia ×24
  body p | CSS: ui-sans-serif, system-ui, …       | pinta: Segoe UI Semibold ×212
  variables en <html>: {"sans":"ui-sans-serif,…","display":"Georgia,\"Times New Roman\",serif"}
  ```
  Viene desde `6876254` (rediseño editorial). El problema 2 del prompt ("ninguna de las dos
  fuentes de marca tiene ₡") es cierto, pero hoy ni siquiera se usan. D-052 pide el glifo "en
  pesos parecidos a Hanken Grotesk" y primero en los stacks de las fuentes de marca: **P03 arregla
  primero que las fuentes de marca pinten** (lo que `docs/BRAND.md` y `.impeccable.md` ya dicen) y
  después agrega el glifo.
- **No hay un precio a 13 px en `/c/ejemplo`.** Todos sus precios son `font-display text-lg`
  (18 px). El precio chico está en el teléfono de la demo de la home (`#demo`, 12 px, visible desde
  640 px de ancho). P03 fotografía los tres: carta (18 px), demo (12 px) y hero (14 px).
- **La carta no pasa por `next/image`.** `MenuClient` usa `<img>` directo, así que `/c/ejemplo`
  pide las fotos a `images.unsplash.com` desde el navegador (13 requests). En la home, el teléfono
  de `#demo` (oculto a 375) sí usa `next/image` con URLs de Unsplash, y la portada `RESTAURANT.cover`
  también es de Unsplash: P02 las cubre todas.
- **La portada de la demo (`RESTAURANT.cover`) no es un platillo** pero también depende de
  Unsplash y muestra una terraza frente al mar, no una soda de barrio en Escalante. Entra en P02.

## Unidades

| ID | Título | Estado | Intentos | Commit | Despliegue | Evidencia |
|---|---|---|---|---|---|---|
| P01 | Estado y línea base | hecho | 1 | `3508adb` | READY `dpl_5VhKxyoA…` | Abajo |
| P02 | Fotos de la demo (D-053, D-054) | hecho | 1 | `17e13cd` | READY `dpl_6GGEDs9i…` | Abajo |
| P03 | El colón se ve como colón (D-052) | hecho | 1 | `bcef43e` + `f8e7c6d` | READY `dpl_26hqvz7L…` | Abajo |
| P04 | Íconos y logo livianos | hecho | 1 | `84458e1` | READY `dpl_DnUoYnBR…` | Abajo |
| P05 | Decisiones comerciales en la web y los documentos | hecho | 1 | `fd1049b` | READY `dpl_Hxwq5Yzr…` | Abajo |
| P06 | Cierre sin QR que compita (D-056) y stand de reseñas (D-055) | hecho | 1 | `e78de53` | READY `dpl_GHrsBy6f…` | Abajo |
| P07 | Tareas sueltas | hecho | 1 | (este) | ver bloque | Abajo |
| P08 | Verificación final, release 1.4.0 y puente | pendiente | 0 | | | |

## Herramientas de verificación del loop

En `.qa/bin/` (ignorada por git) y en el venv temporal:

| Script | Qué comprueba |
|---|---|
| `node .qa/bin/peso-375.mjs <base> / /c/ejemplo` | Transferido (encodedDataLength) al abrir y recorrida entera a 375×812, requests a hosts externos y a imágenes remotas vía `/_next/image` |
| `node .qa/bin/peso-carta.mjs <base> /c/ejemplo` | Criterio de D-043: la carta pesa menos de 2 MB al abrir (390×844, DPR 3) |
| `node .qa/bin/zoom-precio.mjs <url> <png> <selector>` | Captura a DPR 4 del primer precio con "₡" y la fuente que lo pinta de verdad (`W=768` para otro ancho) |
| `node .qa/bin/fuentes.mjs <url> <selector…>` | Qué fuente pinta cada texto (CDP), no la que dice el CSS |
| `node .qa/bin/colones.mjs <url> [ancho]` | Todos los textos con "₡": tamaño, peso, familia y si se ven |
| `python .qa/bin/qr.py <imágenes…>` | Decodifica QR con OpenCV |
| `node .qa/bin/shot.mjs <url> <png> "w=…,scroll=1,full=1"` | Capturas |

## Línea base (literal)

`main` @ `6b3c231`, versión 1.3.1.

```
$ npm ci                → ci=0
$ npm run typecheck     → tc=0   (tsc --noEmit, sin salida)
$ npm run lint          → ✔ No ESLint warnings or errors
$ npm run build         → build=0 (check-cartas + next build; /c/ejemplo SSG)
$ QA_BASE=http://localhost:3177 npm run qa:landing
qa:landing → OK · 21 avisos
```

Peso y hosts externos (`peso-375.mjs`):

```
http://localhost:3177 a 375×812, DPR 2, sin caché

| Ruta | Al abrir | Recorrida entera | Requests (abrir / total) | Hosts externos (navegador) | Imágenes remotas vía /_next/image |
|---|---|---|---|---|---|
| `/` | 243.6 KB | 385.5 KB | 19 / 34 | 0 | 0 |
| `/c/ejemplo` | 709.9 KB | 709.9 KB | 24 / 24 | 13 | 0 |

/ por host: {}
/c/ejemplo por host: {"images.unsplash.com":13}
```

Criterio D-043 (`peso-carta.mjs`, 390×844, DPR 3): `peso-carta → OK: 1.02 MB al abrir (límite 2,00 MB)`.

Precios con "₡" y la fuente que los pinta (Chromium en Windows; en un teléfono cambia la fuente del
sistema, que es justamente el problema):

```
/c/ejemplo  "₡2 800"  18px  CSS Georgia            pinta: Times New Roman ×1 (el "₡"), Georgia ×5
/ (#demo)   "₡4 200"  12px  CSS ui-sans-serif 700  pinta: Segoe UI ×6   (a 768; oculto a 375)
/ (hero)    "Desde ₡14 900/mes …" 14px 600         pinta: Segoe UI Semibold ×65
```

Captura: `.qa/pulido/p01-precios-antes.png` (carta, demo y hero, DPR 4). Georgia no tiene "₡":
Chromium lo toma de Times New Roman, con otro trazo que el resto del precio.

### Los 14 platillos de la demo (`mockProducts`) y su foto actual

Mirados uno por uno en la captura completa de `/c/ejemplo` a 375 (`.qa/pulido/p01-carta-375-full.png`)
y en la hoja de contacto de las fotos originales:

| # | Platillo | Foto actual (Unsplash) | Qué muestra | Veredicto |
|---|---|---|---|---|
| 1 | Gallo Pinto con huevo | `photo-1604908176997…` | Guiso de pollo o paneer en sartén, con albahaca y un grissini | **No corresponde** |
| 2 | Panqueques con miel | `photo-1567620905732…` | Torre de panqueques con miel; entra una mano sirviendo | Corresponde (con una mano: D-049 pide sin personas) |
| 3 | Plato de Frutas | `photo-1490474418585…` | Bowl de frutas con una barra de chocolate al lado | Corresponde |
| 4 | Casado Completo | `photo-1543339308-43e59d6b73a6` | Ensalada verde en plato blanco | **No corresponde** |
| 5 | Lomito en salsa | `photo-1432139509613…` | Bistec con espárragos y salsa oscura | Corresponde |
| 6 | Bowl Tropical | `photo-1546069901…` | Bowl de vegetales, maíz, huevo y proteína | Corresponde |
| 7 | Hamburguesa Casera | `photo-1551782450…` | Hamburguesa con papas | Corresponde |
| 8 | Pizza Artesanal | `photo-1565299624946…` | Pizza en tabla | Corresponde |
| 9 | Fresco Natural de Naranja | `photo-1600271886742…` | Vaso de jugo de naranja | Corresponde |
| 10 | Limonada de la casa | `photo-1544145945-f90425340c7e` | Tres cócteles en copa de martini | **No corresponde** |
| 11 | Café Helado | `photo-1461023058943…` | Café con leche en vaso con hielo | Corresponde |
| 12 | Café Chorreado | — | Sin foto (ícono de cubiertos) | Sin foto |
| 13 | Brownie con helado | `photo-1551024506…` | Helado sobre brownie con caramelo | Corresponde |
| 14 | Queque de frutos rojos | `photo-1565958011703…` | Tajada de pastel con frambuesas | Corresponde |
| — | Portada `RESTAURANT.cover` | `photo-1559339352…` | Terraza frente al mar (no es una soda de barrio) | No corresponde al local |

Tres de trece fotos muestran otro plato; una más lleva una mano. La cabecera de la carta usa la
primera foto (hoy el guiso, difuminado), así que cambiar la del gallo pinto cambia también la
cabecera.

## PENDIENTES-STEVEN

- Confirmar con Hacienda o su contador la inscripción y la factura electrónica 4.4. Cuando esté
  confirmado, un cambio de una línea en el FAQ.
- Imprimir el stand y la tarjeta NFC con `/q/demo26` y escanearlos en iPhone y en Android.
- WhatsApp Business y Google Business Profile. Las redes van a `SITE.social`.
- Fotos reales de los 4 productos en `public/hardware/<código>.webp`.
- `founderOffer.remaining = 9` cuando cierre el primer fundador.
- **Del revisor fresco de P05 (necesitan decisión):** D-034 con pago anual (la implementación va
  "incluida" en los ₡149 000: ¿cuánto se descuenta?) y con fundadores (pagaron ₡0); desde cuándo
  se cuentan los 6 meses; si el hardware comprado meses después también va por adelantado (hoy
  dice "junto con la implementación"). Los títulos (h1, OG, descripción del sitio) dicen "48
  horas" sin "hábiles"; la garantía, las tarjetas, la FAQ y los términos sí lo dicen.
- Los términos 1.1 ya no dicen "si la implementación se paga después del material, el plazo corre
  desde el pago" (contradecía D-048). Si querés conservar esa salvaguarda, hay que decidirla.

## Informes por unidad

### P01 · Estado y línea base

- Línea base en verde (arriba). Tabla de peso, precios y los 14 platillos con su veredicto.
- Hallazgo mayor: las fuentes de marca no pintan (ver "Ajustes al repo").

### P02 · Fotos de la demo (D-053, D-054)

- **Antes (criterio fallando):** el `qa:landing` endurecido contra el build de `6b3c231`:
  ```
  FALLO  / @ 768x1024: 4 imágenes pedidas a otro host (D-053): …/_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1559339352…
  FALLO  /preview/carta @ 375x812: 13 imágenes pedidas a otro host (D-053): https://images.unsplash.com/photo-1604908176997…
  ```
  y `datafud.com/_next/image?url=https://example.com/x.jpg&w=64&q=75` → **404** (el optimizador
  intentó bajarla: era un proxy abierto).
- **Búsqueda.** La API de Unsplash pide clave; se buscó desde el navegador integrado en Unsplash
  (solo licencia libre, sin Unsplash+) y en Pexels. Cada candidata se miró en grande antes de
  elegirla. Los autores de las fotos que se quedan se rastrearon por su id en la búsqueda de
  Unsplash. Créditos completos en `docs/marca/creditos-demo.md`.
- **Optimización:** `procesarFotos()` de `scripts/carta-fotos.mjs` (el mismo de una carta real),
  vía `.qa/bin/demo-fotos.mjs`: 14 fotos a 800 px q82, de 24 a 138 KB (presupuesto de 150 KB por
  foto con 14 fotos). Portada a 1600×900, 159 KB (se sirve por `next/image`).
- `mock.ts`: `img(id)` → `/demo/platos/<id>.webp`; `RESTAURANT.cover` → `/demo/portada.webp`.
- `next.config.mjs`: `remotePatterns` solo `*.supabase.co` (D-054). No queda ningún otro host en
  uso: `grep -rn "unsplash" src` → 0. La única mención en `scripts/` es la regla de
  `qa-landing.mjs` que ahora **falla** si una página pide una imagen a Unsplash, Pexels o a
  cualquier host por `/_next/image` (antes era un aviso "depende de la red").

| # | Platillo | Foto nueva | ¿Corresponde? (mirado en la captura a 375) |
|---|---|---|---|
| 1 | Gallo Pinto con huevo | Pexels 37347242 (recorte): gallo pinto, dos huevos fritos, patacones, banano, pan | Sí (descripción ajustada a la foto) |
| 2 | Panqueques con miel | Unsplash dQTMhuR4vB4: torre con cuchara de miel, fresas, banano; sin manos | Sí (descripción ajustada) |
| 3 | Plato de Frutas | Unsplash _Zn_7FzoL1w (la misma) | Sí (sin granola en la descripción) |
| 4 | Casado con carne mechada | Pexels 29450679: arroz, frijoles negros, carne mechada, maduro | Sí (antes "Casado Completo": se renombró a lo que muestra) |
| 5 | Lomito en salsa | Unsplash auIbTAcSH6E (la misma) | Sí (sin "puré") |
| 6 | Bowl Tropical | Unsplash kcA-c3f_3FE (la misma) | Sí (sin "palmito") |
| 7 | Hamburguesa Casera | Unsplash uVPV_nV17Tw (la misma) | Sí |
| 8 | Pizza Artesanal | Unsplash MqT0asuoIcU (la misma) | Sí |
| 9 | Fresco Natural de Naranja | Unsplash kkrXVKK-jhg (la misma) | Sí |
| 10 | Limonada de la casa | Unsplash WDgN0XclV_w: limonada con hierbabuena y limón | Sí |
| 11 | Café Helado | Unsplash L-sm1B4L1Ns (la misma) | Sí |
| 12 | Café Chorreado | Pexels 6307233: café colado en bolsita de tela a una taza de peltre | Sí (antes sin foto) |
| 13 | Brownie con helado | Unsplash idTwDKt2j2o (la misma) | Sí |
| 14 | Queque de frutos rojos | Unsplash Mzy-OjtCI70 (la misma) | Sí |
| — | Portada | Unsplash Ycuvvz_Px8c (recorte): gallo pinto con maduro, aguacate y pico de gallo | Sí, un desayuno tico |

**14 de 14 corresponden.** Capturas miradas: `.qa/pulido/p02-carta-375-full.png`,
`p02-demo-1440.png` (teléfono de `#demo`) y `p02-preview-375.png`.

- **Después:**
  ```
  typecheck=0 · lint ✔ · build=0 · qa:landing → OK · 21 avisos (0 fallos D-053)
  | `/` | 242.8 KB | 384.4 KB | 19 / 34 | 0 | 0 |
  | `/c/ejemplo` | 1062.3 KB | 1062.3 KB | 25 / 25 | 0 | 0 |
  peso-carta → OK: 1.36 MB al abrir (límite 2,00 MB)
  /_next/image?url=https%3A%2F%2Fexample.com%2Fx.jpg&w=64&q=75 → 400   (local)
  ```
- **El peso de la carta subió** de 1,02 a 1,36 MB al abrir: las fotos de Unsplash venían a 600 px
  q75 y las de `carta-fotos.mjs` salen a 800 px q82 (el techo que usa una carta real) y ahora
  también el café tiene foto. Sigue bajo los 2 MB de D-043; queda anotado para P08.

- **Producción (`dpl_6GGEDs9i…`, `17e13cd`):** `/_next/image?url=https://example.com/x.jpg&w=64&q=75`
  → **400**; `/c/ejemplo?rev=17e13cd` pide las 14 `demo/platos/*.webp`, 0 menciones de
  `unsplash`, 0 hosts externos, 1116,5 KB al abrir a 375; `demo/platos/p-cafe.webp` → 200
  `image/webp` 39 500 B.

### P03 · El colón se ve como colón (D-052)

Dos commits: primero que las fuentes de marca pinten (`bcef43e`), después el glifo.

**1. Fuentes de marca (`bcef43e`).** `globals.css` deja de redeclarar `--font-sans` y
`--font-display` en `:root`. Medido con CDP en local:
```
h1     | CSS: "Young Serif", "Young Serif Fallback", Georgia, serif | pinta: Young Serif (web) ×40
body p | CSS: "Hanken Grotesk", "Hanken Grotesk Fallback", …       | pinta: Hanken Grotesk (web) ×212
```
Capturas antes/después a 375 (home y carta) y 1440 (home) miradas: `.qa/pulido/p03-antes-despues-375.png`,
`p03-home-1440-despues.png`. Young Serif es más ancha que Georgia: el h1 del hero pasa a tres
líneas a 375 y 1440; nada se desborda (`qa:landing → OK`, 0 fallos). Los avisos pasan de 21 a 23:
son dos más de la misma familia "áreas táctiles < 44 px" en enlaces de texto ("Ver hardware de
mesa", "Demo") cuyo alto cambió con la fuente; no son regresiones de layout.

**2. El glifo.** fontTools sobre todos los subsets que sirve Google Fonts:
```
Hanken+Grotesk   archivos=12  con U+20A1=0
Young+Serif      archivos= 2  con U+20A1=0
Noto+Sans        archivos=24  con U+20A1=3   (latin-ext, 400/600/700: el mismo archivo variable)
Inter            archivos=21  con U+20A1=3   (latin-ext)
Noto+Serif       archivos= 8  con U+20A1=1
```
Se eligió **Inter**: en la comparación a 12–14 px junto a Hanken Grotesk (`.qa/pulido/p03-comparacion.png`)
su "₡" cruza la letra entera y no se confunde con "¢", que es lo que pasa con el de Noto Sans.
Instancias 400/600/700 (`varLib.instancer`) y `pyftsubset` a U+20A1 en el venv temporal; nada
nuevo en `package.json`:
```
datafud-colon-400.woff2   936 B  glifos=['.notdef', 'colonmonetary']
datafud-colon-600.woff2   904 B
datafud-colon-700.woff2   896 B
```
Licencia OFL al lado (`public/fonts/OFL-Inter.txt`). `@font-face` en `globals.css` con
`unicode-range: U+20A1`; "DataFudColon" primero en `sans` y `display` de Tailwind y en `.font-display`.

**Criterios:**
- Glifo por glifo en toda la página (CDP, `.qa/bin/glifos.mjs`), antes = producción `bcef43e`,
  después = local:
  ```
  /c/ejemplo antes:   1104 Hanken Grotesk · 133 Young Serif · 14 Times New Roman
  /c/ejemplo después: 1104 Hanken Grotesk · 133 Young Serif · 14 Inter
  /          antes:   7339 Hanken Grotesk · 1374 Young Serif · 27 Arial · 7 Times New Roman
  /          después: 7339 Hanken Grotesk · 1374 Young Serif · 26 Inter · 8 Arial
  ```
  Solo cambian los "₡" (14 en la carta, 26 en la home); los 8 de Arial que quedan son los mismos
  caracteres de antes que no son "₡". **0 cambios en otros caracteres.**
- `document.fonts.check('13px DataFudColon', '₡')` → `true`, con las caras `100 500:loaded`,
  `501 650:loaded`, `651 900:loaded` en la home (en producción antes daba `true` sin ninguna cara:
  `check` es verdadero cuando no hay nada que cargar, por eso se acompaña del estado de las caras
  y de la fuente que pinta).
- Capturas con zoom (DPR 4) antes y después: carta 18 px, demo 12 px y hero 14 px —
  `.qa/pulido/p03-precios-antes-despues.png`, miradas. El precio de 13 px del prompt no existe
  (ver "Ajustes al repo").
- **Imagen OG:** `next/og` no lee woff2 y pasar `fonts` reemplaza su fuente por defecto; se le pasa
  la misma subfuente en TTF (`src/lib/og-fonts/datafud-colon-400.ttf`, 1 740 B) más su Noto Sans.
  `/opengraph-image` dibuja "desde ₡14 900 al mes" (antes "14 900 colones"). Captura mirada:
  `.qa/pulido/p03-og.png`.
- Puertas: typecheck, lint, build y `qa:landing → OK · 23 avisos`; `€` = 0 y `mailto:` = 0 en `/`
  y `/c/ejemplo`.
- **Producción (`dpl_26hqvz7L…`, `f8e7c6d`):** `/c/ejemplo?rev=f8e7c6d` → 1104 Hanken Grotesk ·
  133 Young Serif · 14 Inter (los 14 "₡"); h1 de la home en Young Serif ×40; la imagen OG servida
  dice "desde ₡14 900 al mes" (`.qa/pulido/p03-og-prod.png`, mirada).

### P04 · Íconos y logo livianos

- **Ajuste:** el JSON-LD (`src/lib/seo.ts`) referencia `icono-main.png`, no `logo-main.png`. Los
  dos se recomprimen con el mismo nombre y las mismas dimensiones.
- El PNG original trae el blanco con ruido de compresión (nunca 255 parejo): se limpió a blanco
  puro antes de cuantizar. Con PIL (median cut, 16 colores) el cuadro dorado del ícono salía
  verde grisáceo (mirado y descartado); con `sharp` (libimagequant, paleta de 256) se conserva.

| Archivo | Antes | Después | Cómo |
|---|---|---|---|
| favicon | `icono-main.png` 782 659 B (1254×1254) | `src/app/favicon.ico` 6 550 B (16/32/48) | recorte al contenido + 3 % de margen |
| `src/app/icon.png` | — | 15 808 B (512×512, ≤ 40 KB) | 10 % de margen, paleta |
| `src/app/apple-icon.png` | — | 2 053 B (180×180, ≤ 25 KB) | 14 % de margen, paleta |
| `public/logo-main.png` | 840 456 B | 42 890 B (1921×819, ≤ 120 KB) | mismo tamaño, paleta |
| `public/icono-main.png` | 782 659 B | 28 274 B (1254×1254) | mismo tamaño, paleta |

- `layout.tsx` sin `icons`: el HTML trae ahora
  `<link rel="icon" href="/favicon.ico" sizes="16x16">`, `<link rel="icon" href="/icon.png?…" sizes="512x512">`
  y `<link rel="apple-touch-icon" href="/apple-icon.png?…" sizes="180x180">`.
- `.next/cache/images` borrado antes de verificar. Bytes servidos por `next start` = bytes del
  archivo (se detectó y corrigió que `sharp(buf).toFile()` volvía a codificar el PNG sin paleta:
  65 921 B en lugar de 42 890 B).
- Capturas miradas: pestaña con el favicon servido (`.qa/pulido/p04-pestana.png`; Playwright sin
  ventana no dibuja la barra de pestañas, así que es una tira que carga `/favicon.ico` de verdad),
  logo del nav y del footer a DPR 3 a 375 y 1440 (`p04-logos.png`): nítido; el nav pide la
  variante `w=384` de `/_next/image` para 75×32 CSS.
- **Producción (`dpl_DnUoYnBR…`, `84458e1`):** `/favicon.ico` 6 550 B, `/icon.png` 15 808 B,
  `/apple-icon.png` 2 053 B, `/logo-main.png` 42 890 B, `/icono-main.png` 28 274 B; el HTML trae los
  tres `<link>` de íconos.

### P05 · Decisiones comerciales en la web y los documentos

- **`PRICING.terms`** suma `ivaIncluded` (D-047), `businessDays` (D-048), `billingStart` (D-035),
  `hardwarePayment` (D-036), `upgradeCredit` + `upgradeCreditMonths` (D-034) y `founderConsent`
  (D-037); `guaranteeScope` pasa a "La garantía de plazo aplica solo a la implementación de la
  Carta" (D-038). Las etiquetas de plazo de los planes dicen "hábiles" (D-048): la tarjeta decía
  "15 días" y los términos "15 días hábiles". **Montos: 0 cambios** (los números de
  `constants.ts` contra `6b3c231`: idénticos).
- **Planes:** línea bajo las tarjetas "Precios finales en colones, IVA incluido. La mensualidad
  arranca el día que tu carta queda publicada"; "Primer pago" pasa a "Primer mes ·
  implementación + primera mensualidad"; el hardware "se cobra aparte y por adelantado".
- **FAQ: 15 → 18.** Nuevas: "¿Los precios incluyen IVA?", "¿Cuándo empiezo a pagar la
  mensualidad?", "¿Qué quiere decir “hábiles”?", "¿Cómo se paga el hardware?". Ajustadas: primer
  mes (cuándo se paga cada parte y qué es "mostrar como caso"), factura (ya no menciona factura
  electrónica), no soy técnico (hábiles), empezar con la Carta (D-034); "envíos" se une a "pedido
  mínimo". Puerta G: `FAQ: 18 visibles · 18 en JSON-LD · 0 diferencias` (`.qa/bin/faq-ld.mjs`).
- **Términos 1.1** (vigente desde el 25 de setiembre de 2026; privacidad sigue en 1.0, cada página
  con su versión en `LegalPage`; `sitemap` con `TERMS_UPDATED_ISO`): IVA incluido, "hábiles",
  mensualidad desde la publicación, hardware por adelantado, sección nueva "Pasar de la Carta a un
  plan con pedidos" (D-034), sección "Oferta de fundadores" (D-037, solo mientras esté activa) y
  garantía de plazo solo para la Carta (D-038).
- **Documentos:** `OFERTA.md` §5 → "Decisiones cerradas (2026-09-25)", con D-032/D-033
  renumeradas a D-047/D-048 y la nota histórica, D-038 "no se extiende por ahora" con su motivo y
  D-043 con la redacción nueva; `PRODUCT.md` (condiciones comerciales y D-043), `MARKETING.md`
  (objeciones de IVA e inicio de la mensualidad, pagos, 18 preguntas), `KIT-PROSPECCION.md`
  ("¿Eso lleva IVA?" → "No, ya está incluido", más inicio de la mensualidad y paso a pedidos) y
  `CONTENIDO-30-DIAS.md` (lámina de pagos). `CLAUDE.md`: términos 1.1.
- `grep -rn "D-032\|D-033" docs/ventas` → solo `OFERTA.md:212-213`, la nota histórica marcada.
- **Revisor fresco** (subagente sin contexto; leyó planes, FAQ y términos contra las decisiones).
  Se corrigió lo que agregaba reglas no decididas: "(si llegara después, el plazo corre desde el
  pago)" en los términos (contradecía D-048), "desde que el sistema queda funcionando" (no
  decidido) y "sacamos tu local de nuestro material en un plazo razonable" (no está en D-037). Y lo
  confuso: "mostrar como caso" ahora dice qué se muestra, y el primer mes dice qué se paga al
  aprobar y qué al publicar. Lo que necesita una decisión y no redacción quedó en PENDIENTES-STEVEN.
- Capturas miradas a 375: `.qa/pulido/p05-planes-375.png`, `p05-faq-375.png`, `p05-terminos-375.png`.
- Puertas A (typecheck, lint, build, `qa:landing → OK · 23 avisos`), B (`git diff 6b3c231 -- supabase/`
  vacío) y G en verde. La única mención de "factura electrónica" que queda en la web está en la guía
  `/menu-digital-costa-rica`, que describe los POS de otros; no promete nada de DataFud.

### P06 · Cierre sin QR que compita (D-056) y stand de reseñas (D-055)

- **Antes.** A 1440 el panel del stand, con su QR, se ve a la derecha del botón de WhatsApp
  (captura `.qa/pulido/p06-cierre-antes-1440.png`, mirada). OpenCV **no** lo decodifica en las
  capturas del cierre a 375, 768 ni 1440 (ni a DPR 2), tampoco con el decodificador agresivo
  nuevo (`.qa/bin/qr-duro.py`: contraste estirado, CLAHE, Otsu, umbral adaptativo, invertido, 1-3×
  y ventanas deslizantes): la capa oscura del 80-90 % y el degradé cortan la parte de abajo del
  código. Pero el patrón se reconoce a simple vista y un teléfono normaliza mejor que OpenCV, así
  que se aplica D-056 igual: que el QR no esté en el cuadro, no solo que hoy no decodifique.
- **Reencuadre por recorte** (no hizo falta el desenfoque): el QR del render ocupa x 800-1000,
  y 345-520 (esquinas que devuelve OpenCV sobre el original). `ambiente-piedra-cierre.webp` es la
  franja y ≥ 600 del render (1536×424, 76 KB, `sharp`, `.qa/bin/recorte-cierre.mjs`): piedra,
  tarjeta NFC y la base del stand, sin el panel. La capa ya no se estira a la derecha (ya no hay
  stand que esquivar): `inset-x-0`, `object-cover object-center`.
- **Decodificador, después** (`qr.py` y `qr-duro.py`), cierre a 375, 768, 1024, 1440 y 1920, DPR 1 y 2:
  **0 QR**. El recorte solo: `ambiente-piedra-cierre.webp | 1536x424 | None`.
- **Renders (§D-051), siguen decodificando 6 de 6:**
  ```
  ambiente-mesa.webp   | 'https://datafud.com/q/demo26'
  ambiente-piedra.webp | 'https://datafud.com/q/demo26'   (original; ya no se muestra, es la fuente del recorte)
  tarjeta-nfc.webp     | 'https://datafud.com/q/demo26'
  stand-qr-3d.webp     | 'https://datafud.com/q/demo26'
  stand-qr-3d-nfc.webp | 'https://datafud.com/q/demo26'
  stand-resenas.webp   | 'https://datafud.com/q/demo26'
  ```
- **Contraste** (`.qa/bin/contraste.mjs`, texto oculto al fotografiar, píxel de fondo más claro de
  cada caja):

| Elemento | 375 | 768 | 1024 | 1440 | Mínimo |
|---|---|---|---|---|---|
| Etiqueta "Empezá hoy" (12 px) | 5,70:1 | 5,06:1 | 4,99:1 | 4,93:1 | 4,5:1 |
| Titular | 10,75:1 | 10,73:1 | 10,72:1 | 10,72:1 | 3:1 |
| Texto (14 px) | 8,50:1 | 8,60:1 | 9,10:1 | 9,21:1 | 4,5:1 |
| Botón WhatsApp (12 px) | 6,17:1 | 6,17:1 | 6,17:1 | 6,17:1 | 4,5:1 |

- Capturas miradas: `.qa/pulido/p06-cierre-despues-mosaico.png` (1440, 375 y 768) y las de 1024 y
  1920: se ve la piedra, la tarjeta y la base del stand con sus ondas NFC, oscurecidas; ningún QR.
- **Stand de reseñas (D-055):** las cinco estrellas del render se quedan. El copy es "Para pedir
  reseñas" y "QR y NFC que llevan al comensal directo a tu ficha de Google para dejar la reseña,
  sin buscar nada": invita a reseñar, no promete "más estrellas" ni reseñas positivas y no filtra.
  Sin cambios.
- **Producción de P05 (`dpl_Hxwq5Yzr…`) y P06 (`dpl_GHrsBy6f…`, `e78de53`):** `FAQ: 18 visibles ·
  18 en JSON-LD · 0 diferencias`; `/terminos` muestra "Versión 1.1"; la home dice "IVA incluido"
  (2 veces: la línea bajo los planes y la FAQ); el cierre pide `ambiente-piedra-cierre.webp` y
  sus capturas a 375 y 1440 (DPR 1 y 2) no decodifican ningún QR.

### P07 · Tareas sueltas

- **`sharp`** en `dependencies` como `^0.35.4` (lo que resolvía el lockfile). `npm install
  --package-lock-only` actualizó el lockfile (nombre, versión, `sharp` directa; npm podó el peer
  opcional `@opentelemetry/api`); `npm ci → ci=0`.
- **`carta-kit.mjs`** — `chromiumDelKit()` y `abrirChromium()`; se valida antes de escribir el kit:
  ```
  KIT_CHROMIUM=<chrome.exe de Playwright> node scripts/carta-kit.mjs ejemplo --servidor http://localhost:3177
    ✓ entregas/ejemplo/qr-demo26.png · qr-demo26.pdf · carta-ejemplo.pdf · carta-ejemplo-en.pdf   (exit 0)
  KIT_CHROMIUM=C:/no/existe/chrome.exe …
    ERROR  KIT_CHROMIUM apunta a C:/no/existe/chrome.exe, que no es un archivo.
           Corregí la ruta o borrá la variable y corré: npx playwright install chromium   (exit 1)
  KIT_CHROMIUM=C:/Windows/System32/whoami.exe …
    ERROR  No se pudo abrir Chromium desde KIT_CHROMIUM (C:/Windows/System32/whoami.exe).
           browserType.launch: Target page, context or browser has been closed
           Si no es un Chromium válido, corregí KIT_CHROMIUM o corré: npx playwright install chromium   (exit 1)
  sin variable → chromium: Playwright (…\ms-playwright\chromium-1243\chrome-win64\chrome.exe)
  ```
  `/opt/pw-browsers/chromium` se usa solo si es un archivo (en Windows no existe; no se pudo probar
  ese camino acá).
- **Nombre:** `package.json` y el lockfile se llaman `datafud`; `.env.example` dice "DataFud".
  `src/lib/supabase/types.ts` ya no tenía restos. `CLAUDE.md`: la nota de restos dice que solo
  quedan en los `.sql` de `supabase/`, para el loop del backend.
  `grep -rni "<nombre viejo>" . --exclude-dir={node_modules,.next,.git,supabase,plans,specs,.qa,entregas}` → **0**.
  (Con `--exclude-dir=docs/plans` literal, grep no excluye nada: compara contra el nombre de la
  carpeta, no la ruta. Se usó `plans` y `specs`; también `.qa` y `entregas`, que están en `.gitignore`.)
- **Enlace de salto** en `LandingNavV2` (landing, guías y legales) → `<main id="contenido" tabIndex={-1}>`.
  Con teclado (`.qa/bin/salto.mjs`):
  ```
  /                        primer Tab: "Saltar al contenido" visible 152×44 en (16,16) · tras Enter: MAIN#contenido
  /menu-digital-para-sodas primer Tab: ídem · tras Enter: MAIN#contenido
  /terminos                primer Tab: ídem · tras Enter: MAIN#contenido
  ```
  Captura mirada: `.qa/pulido/p07-salto-home.png`.
- **`/preview/dashboard`:** el contenido va en `<main>`. Contraste (`.qa/bin/contraste-texto.mjs`):

| Texto | Antes | Después |
|---|---|---|
| Rótulo "Panel del restaurante" (12 px, `accent-600` → `accent-700`) | 4,18:1 | 6,25:1 |
| "5 activas" (12 px, ídem) | 4,36:1 | 6,52:1 |
| "38 órdenes" (14 px, `brand-700/60` → `/80`) | 3,57:1 | 6,30:1 |
| "86 uds." (14 px, `brand-700/55` → `/80`) | 3,14:1 | 6,30:1 |
| Encabezado de la tabla (12 px, `brand-700/60` → `/85`) | 3,43:1 | 6,78:1 |

- **`qa:landing`** contaba el enlace de salto oculto (1×1 px) como área táctil chica (23 → 27
  avisos); ahora se salta lo `sr-only` y vuelve a 23 (los mismos de antes).
- Puertas A en verde tras `npm ci`: typecheck, lint, build, `qa:landing → OK · 23 avisos`.
