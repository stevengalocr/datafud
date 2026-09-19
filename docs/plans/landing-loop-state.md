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

- Iteración actual: 5
- Iteraciones consumidas: 5 / 35

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
| U01 | Config central `site.ts` + `PRICING.hardware` + `deliveryLabel` | hecho | 1 | 91df1af | directo a main | READY (`dpl_EkvtvuSQmEUTVFiUMuob2etKFaBr`) | typecheck/lint/build ✓; prueba de `waLink`, `waProps`, `mailLink` en Node; sin cambios visibles |
| U02 | Contacto (#contacto, formulario Resend, /register → /#contacto, demo fuera de /login) | hecho | 1 | 34e75a3 | directo a main | READY (`dpl_FynHV9NVoSWdrDAN16CR8zhTqhsJ`) | Capturas de #contacto con y sin formulario en 375/1440; prueba de teclado, validación Zod y error de Resend con aria-live |
| U03 | CTAs a WhatsApp + botón flotante | hecho | 1 | c4acd8d | directo a main | (verificar en it. 5) | `grep href="/register"` = 0; 9 enlaces wa.me con target/rel correctos y data-wa-origin; flotante 56×56 solo en 375, sin tapar el footer |
| U04 | Promesas y planes (48 h / 15 días, Básico = Carta, frases prohibidas, docs) | hecho | 1 | (ver bitácora it. 5) | directo a main | (ver bitácora it. 5) | grep de frases prohibidas en landing = 0; capturas de hero, stats y planes; MARKETING/PRODUCT/CHANGELOG alineados |
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
- Crear `RESEND_API_KEY` en Vercel para activar el formulario de contacto y **redesplegar** (la landing es estática: la decisión de mostrar el formulario se toma en el build). Mientras tanto la sección muestra WhatsApp y correo. Con el remitente por defecto `onboarding@resend.dev`, Resend solo entrega al correo dueño de la cuenta: crear la cuenta de Resend con galodevcr@gmail.com o verificar el dominio y poner `RESEND_FROM_EMAIL`.
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

### Iteración 3 — U02 Contacto y puertas cerradas

- Plan: `src/lib/contact.ts` (Zod, tipos, `isContactFormEnabled`), `src/app/actions.ts`
  (Server Action con honeypot + Resend), `contact-form.tsx` (cliente, `useActionState`,
  `role="status" aria-live="polite"`, foco al estado), `contact-section.tsx` (servidor:
  sin `RESEND_API_KEY` no monta el formulario y muestra checklist "Contanos esto").
  `page.tsx`: sección antes del cierre, footer con WhatsApp/correo desde `site.ts` y enlace
  "Contacto". `/register` → `redirect("/#contacto")`. `/login` sin cuenta demo, enlace
  "Hablemos" → `/#contacto`. Iconos `mail`, `whatsapp`, `menu`, `x`, `chevron-down`.
  `.env.example`: `RESEND_API_KEY`, `RESEND_FROM_EMAIL` vacías. Dependencia nueva: `resend`.
- Lo que ve un visitante de producción: sección "Hablemos de tu local" con WhatsApp
  (+506 7287 4779) y correo (galodevcr@gmail.com) y la checklist; footer con los datos
  reales (antes decía `info@datafud.com`, un buzón sin confirmar).
- Puertas: A ✓ · B ✓ · C ✓ (build ok; `/register` ahora 136 B) · D ✓ (solo rutas
  permitidas; `(auth)/login` y `register` son la excepción de U02) · E ✓ (0 frases en los
  archivos nuevos; las de page.tsx/pricing se limpian en U03/U04) · F ✓ (0 bg-clip-text,
  0 backdrop-blur en archivos nuevos, 0 emojis; `curl /` sin TODO/PENDIENTE) · G ✓
  (375/768/1440: sin scroll horizontal, anclas ok, 1 h1; únicos fallos: Unsplash por el
  sandbox) · G formulario (build con clave falsa): render ✓, orden de tab
  name > business > phone > select > textarea > botón (honeypot fuera) ✓, Zod
  "Contanos tu nombre." ✓, error de Resend "No pudimos enviar…" con enlace a WhatsApp,
  `aria-live=polite`, foco en el estado ✓ · H n.a. · I ✓ (corrida con reduced-motion
  sin diferencias de layout) · J ver abajo.
- Capturas: `#contacto` 375 y 1440 con y sin formulario; formulario con estado de error
  en 375. Se corrigió en la pasada de autocrítica: flecha del `select` (Icon
  `chevron-down`) y el botón "Enviar mensaje" que partía en dos líneas en desktop.
- Nota: `/register` y `/login` siguen en `/register`/`/login`, pero la landing ya no los
  enlaza salvo "Ingresar" (footer y nav), que se mantiene para clientes con cuenta.

### Iteración 4 — U03 CTAs a WhatsApp

- Plan: `MagneticCta` acepta atributos de `<a>` y renderiza `<a>` para enlaces externos;
  hero y cierre → `waProps("hero")` / `waProps("cierre")` con texto "Hablemos por
  WhatsApp"; nav → `waProps("nav")` ("Hablemos" / "WhatsApp" en móvil); planes →
  `waProps("plan-<código>")` con "Quiero <plan>"; nuevo `whatsapp-float.tsx` (solo
  `md:hidden`, 56×56, `aria-label`) y `pb-16 md:pb-0` en la última fila del footer para que
  no tape nada. Secundario "Ver demo en vivo" → `/preview` se mantiene.
- Lo que ve un visitante: todos los botones principales abren WhatsApp en pestaña nueva con
  mensaje prellenado según el lugar; en el celular hay un botón flotante verde abajo a la
  derecha. Ya no existe "Crear mi cuenta gratis" ni "Quiero mi DataFud".
- Puertas: A ✓ · B ✓ · C ✓ · D ✓ · E ✓ (0 frases en archivos tocados; el copy general se
  limpia en U04) · F ✓ (0 bg-clip-text/backdrop-blur nuevos, 0 emojis, `curl /` sin
  TODO/PENDIENTE) · G ✓ (`cta-check.mjs`: 9 `wa.me` en 375 y 1440, 0 con target/rel mal,
  orígenes nav/hero/plan-*/contacto/cierre/footer/flotante; flotante visible solo en 375 y
  sin solaparse con el texto final del footer; 0 hrefs vacíos o a /register) · H n.a. ·
  I ✓ · J ver bitácora siguiente.
- Capturas: hero 375/1440, planes 375, footer 375 con flotante. Autocrítica: los CTA del
  hero partían el texto en dos líneas en 1440 → `whitespace-nowrap`.

### Iteración 5 — U04 Promesas y planes

- Plan: highlights y stats desde `PRICING.delivery` (48 h carta / 15 días sistema); pasos
  reescritos ("Nosotros montamos tu carta", "Ponemos los QR y NFC en tus mesas", "Recibís los
  pedidos", "Medís tu negocio"); hero, act-break, cierre y footer sin "tiempo real" ni frases
  que insinúan clientes existentes; copy en voseo. Planes desde `PRICING.plans` con
  `marketingName` (Básico → "Carta", sin pedidos en mesa), chip con `deliveryLabel` por plan,
  features honestas (sin "24/7", "exportación", "tiempo real"); implementación: "Carta
  publicada en 48 horas y sistema completo en 15 días", "Carta a tu marca", "1 año de soporte
  técnico incluido" (se quitó "dominio propio", que no existe). Docs: MARKETING §1, §4, §5,
  §6, §8, §10; PRODUCT §1, §2, §4, §8; CHANGELOG "Unreleased".
- Lo que ve un visitante: "Carta lista en 48 horas · Sistema completo en 15 días" en la barra
  y en los stats; los planes se llaman Carta / Estándar / Empresarial y cada uno dice su plazo.
- Puertas: A ✓ · B ✓ · C ✓ · D ✓ (page.tsx, pricing-v2.tsx, docs) · E ✓ (grep en
  `src/app/page.tsx` y `src/components/marketing` = 0; "operando en 48" = 0) · F ✓ (sin
  bg-clip-text/backdrop-blur nuevos, 0 emojis en archivos tocados; `curl /` sin
  TODO/PENDIENTE) · G ✓ (375/768/1440 sin scroll horizontal, anclas ok; solo Unsplash falla
  por el sandbox) · H n.a. · I ✓ · J en la siguiente iteración.
- Capturas: planes 1440 (tres tarjetas con chip de plazo; "Quiero Carta / Estándar /
  Empresarial"), stats 375 (48h · 15 · 3 · 18), hero 375 con el nuevo párrafo en voseo.
- Nota: `PRICING.trialDays` y `trial_ends_at` siguen en código/BD (no se tocan; solo salieron
  de la landing).
