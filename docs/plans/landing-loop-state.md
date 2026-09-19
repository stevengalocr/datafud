# Estado del loop — Fachada de venta DataFud

> Archivo de estado del bucle autónomo (prompt maestro v2). Lo lee y actualiza Claude Code
> en cada iteración. Si la sesión se corta: "Releé docs/plans/landing-loop-state.md y
> continuá el loop".

## CONFIG recibida (2026-09-19, confirmada por Steven en la sesión)

| Clave | Valor |
|---|---|
| WHATSAPP_VENTAS | 50672874779 |
| CORREO_LEADS | galodevcr@gmail.com |
| NOMBRE_LEGAL | GaloDev (nombre comercial; razón social, cédula jurídica y domicilio quedan `[REVISAR]`) |
| PRECIO_STAND_QR_3D_DESDE_USD | 12 |
| PRECIO_STAND_QR_3D_NFC_DESDE_USD | 20 |
| PRECIO_STAND_RESENAS_DESDE_USD | 20 |
| PRECIO_TARJETA_NFC_USD | 15 |
| PLAN_BASICO_ES_CARTA | si |
| INCLUIR_CARTA_ESTATICA_Y_REDIRECCIONES | no (U15 y U16 omitidas) |
| MAX_ITERACIONES | 35 |

## Contador

- Iteración actual: 2
- Iteraciones consumidas: 2 / 35

## Capacidades del entorno

| Capacidad | Estado | Evidencia |
|---|---|---|
| Navegador real | Sí | Chromium 1194 preinstalado en `/opt/pw-browsers`; `@playwright/test` 1.63 como dev-dependency; script de QA fuera del repo (scratchpad) |
| Red a datafud.com | No | `curl https://datafud.com/` → código 000 (sin salida a internet general). La puerta J se verifica con la API de GitHub/Vercel, no con curl a producción |
| Red a images.unsplash.com | No | 403 vía proxy. En `next start` local los `/_next/image` de Unsplash devuelven 500 **solo en este entorno**; en producción cargan. Se anota como limitación, no como bug |
| Publicar en main | Sí, push directo | `git push origin HEAD:main` fue aceptado (398bf74). No hace falta PR. Despliegue de Vercel verificado con el MCP de Vercel (proyecto `prj_n957iGSeYbe4GbTsDxlP0ytLHJSt`) |
| Lighthouse | Pendiente (desde U11) | `lighthouse` como dev-dependency cuando toque |

## Unidades

| ID | Título | Estado | Intentos | Commit | PR | Despliegue | Evidencia |
|---|---|---|---|---|---|---|---|
| U01 | Config central `site.ts` + `PRICING.hardware` + `deliveryLabel` | hecho | 1 | (ver bitácora it. 2) | directo a main | (ver bitácora it. 2) | typecheck/lint/build ✓; prueba de `waLink`, `waProps`, `mailLink` en Node; sin cambios visibles |
| U02 | Contacto (#contacto, formulario Resend, /register → /#contacto, demo fuera de /login) | pendiente | 0 | | | | |
| U03 | CTAs a WhatsApp + botón flotante | pendiente | 0 | | | | |
| U04 | Promesas y planes (48 h / 15 días, Básico = Carta, frases prohibidas, docs) | pendiente | 0 | | | | |
| U05 | Sección #hardware | pendiente | 0 | | | | |
| U06 | Sección #demo | pendiente | 0 | | | | |
| U07 | Sección #implementacion | pendiente | 0 | | | | |
| U08 | Sección #confianza | pendiente | 0 | | | | |
| U09 | Sección #preguntas + nav final | pendiente | 0 | | | | |
| U10 | Legal: /terminos y /privacidad | pendiente | 0 | | | | |
| U11 | SEO: sitemap, robots, metadata, OG, JSON-LD | pendiente | 0 | | | | |
| U12 | Analítica: @vercel/analytics + eventos | pendiente | 0 | | | | |
| U13 | Accesibilidad y rendimiento | pendiente | 0 | | | | |
| U14 | Seguridad de dependencias (next 15.5.x, audit) | pendiente | 0 | | | | |
| U15 | Carta estática /c/[slug] | omitida (CONFIG=no) | – | | | | |
| U16 | Redirecciones /q/[code] | omitida (CONFIG=no) | – | | | | |
| U17 | Pulido (bucle de calidad) | pendiente | 0 | | | | |
| U18 | Informe final | pendiente | 0 | | | | |

## PENDIENTES-STEVEN

- Confirmar razón social, cédula jurídica, domicilio y jurisdicción para /terminos y /privacidad (quedan `[REVISAR]`).
- Crear `RESEND_API_KEY` en Vercel para activar el formulario de contacto (mientras tanto la sección muestra WhatsApp y correo).
- Fotos reales del hardware (ver lista TODO-FOTO).
- Pedido mínimo del hardware, si aplica.

## TODO-FOTO

_(se llena cuando U05 publique la sección de hardware)_

## Línea base (iteración 1, `main` @ 25b0cf2)

- `npm run typecheck` → 0 errores.
- `npm run lint` → "No ESLint warnings or errors".
- `npm run build` → ok, 21 rutas.
- Navegador (375×812, 768×1024, 1440×900) sobre `next start` sin variables de entorno:
  un solo `h1`, sin scroll horizontal, todas las anclas resuelven, sin `TODO`/`PENDIENTE`
  visible. Únicos requests fallidos: las 7 fotos de Unsplash vía `/_next/image` (500) por
  falta de red en el sandbox. Enlaces de texto del nav y del footer miden 16–17 px de alto
  (área táctil chica; se atiende en U13).
- Lo que se ve en las capturas: hero con banner y CTA "Quiero mi DataFud" → /register;
  barra de highlights con "Operando en 48 horas" y "Órdenes en tiempo real"; stats; pasos;
  "El sistema"; act-break; planes con "Órdenes en tiempo real", "Soporte prioritario 24/7",
  "exportación avanzada"; bloque NFC; cierre "Crear mi cuenta gratis" → /register; footer
  con `info@datafud.com` y botón "Ingresar" → /login. Todo lo prohibido por la regla 4 está
  presente hoy y se limpia en U03/U04.

## Bitácora

### Iteración 1 — arranque, lectura y prueba de publicación

- CONFIG venía con WhatsApp y correo en PENDIENTE; ni el repo ni el vault los tenían.
  Se le preguntó a Steven y respondió en la sesión (valores arriba). Bloqueo de arranque
  levantado.
- Lectura completa hecha: README, PRODUCT, MARKETING, BRAND, .impeccable.md, page.tsx,
  marketing/v2/*, constants.ts, layout.tsx, globals.css, tailwind.config.ts, icon.tsx,
  login/register, next.config.mjs; además el vault de Drive (Plan-Landing-First,
  Prompts-Landing, Pendientes, Decisiones D-010 a D-014, Cuentas-y-Accesos).
- Línea base arriba. Se agregó `@playwright/test` (permitido por la regla 3) para la
  puerta G.
- Prueba de publicación: commit 398bf74 en `main` por push directo (el proxy lo aceptó, no
  hizo falta PR). Vercel: `dpl_5N48DAZrkunuvgQ8ZgWWN3WsaCYN` → READY, alias `datafud.com`.

### Iteración 2 — U01 Config central

- Plan: `src/lib/site.ts` (SITE, WaOrigin, WA_MESSAGES, `waLink`, `waProps`, `mailLink`,
  `whatsappDisplay`, `CONTACT_ANCHOR`) y en `constants.ts` tipos `Plan`, `HardwareItem`,
  `PublishedPrice`; `PRICING.delivery`, `marketingName`/`deliveryLabel`/`tableOrdering`
  por plan y `PRICING.hardware` con los cuatro productos. Sin cambios visibles: producción
  queda igual. Riesgo: `PRICING.plans.*.name` lo usa `/admin/charges`; se conserva y se
  agrega `marketingName` aparte.
- Puertas: A ✓ (0 errores) · B ✓ (0 warnings) · C ✓ (build ok, 21 rutas) · D ✓ (solo
  `src/lib/constants.ts` y `src/lib/site.ts`) · E/F n.a. (sin UI) · G igual a la línea
  base (sin cambios de UI) · H n.a. · I n.a. · J ver abajo.
- Prueba en Node de `waLink("", "hero")` → `https://wa.me/50672874779?text=Hola%2C%20vi…`;
  `waProps("plan-basico")` → `target=_blank`, `rel=noopener noreferrer`,
  `data-wa-origin=plan-basico`; `mailLink()` → `mailto:galodevcr@gmail.com?subject=…`;
  `whatsappDisplay()` → `+506 7287 4779`.
