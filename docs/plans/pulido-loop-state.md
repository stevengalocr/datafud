# Estado del loop — Pulido para salir a vender (2026-09-25)

> Séptimo bucle autónomo, sobre `main` @ `6b3c231` (1.3.1). Deja la demo y la web listas para
> mandárselas a un prospecto: fotos que muestran el platillo que nombran, "₡" que se ve como colón,
> íconos livianos, imágenes remotas cerradas, condiciones comerciales publicadas y el cierre sin un
> QR que compita con WhatsApp.
> Prompt maestro: `LOOP-Pulido-Salida-Datafud.md` (v1), decisiones CERRADAS D-034–D-038, D-043,
> D-047, D-048 y D-052 a D-056.
> Si la sesión se corta: "Releé docs/plans/pulido-loop-state.md y continuá el loop".

## Contador

- Iteración actual: 1
- Iteraciones consumidas: 1 / 14

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
| P01 | Estado y línea base | en curso | 1 | | | Abajo |
| P02 | Fotos de la demo (D-053, D-054) | pendiente | 0 | | | |
| P03 | El colón se ve como colón (D-052) | pendiente | 0 | | | |
| P04 | Íconos y logo livianos | pendiente | 0 | | | |
| P05 | Decisiones comerciales en la web y los documentos | pendiente | 0 | | | |
| P06 | Cierre sin QR que compita (D-056) y stand de reseñas (D-055) | pendiente | 0 | | | |
| P07 | Tareas sueltas | pendiente | 0 | | | |
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

## Informes por unidad

### P01 · Estado y línea base

- Línea base en verde (arriba). Tabla de peso, precios y los 14 platillos con su veredicto.
- Hallazgo mayor: las fuentes de marca no pintan (ver "Ajustes al repo").
