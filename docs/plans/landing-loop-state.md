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

- Iteración actual: 16
- Iteraciones consumidas: 16 / 35

## Capacidades del entorno

| Capacidad | Estado | Evidencia |
|---|---|---|
| Navegador real | Sí | Chromium 1194 preinstalado en `/opt/pw-browsers`; `@playwright/test` 1.63 como dev-dependency; script de QA fuera del repo (scratchpad) |
| Red a datafud.com | No | `curl https://datafud.com/` → código 000 (sin salida a internet general). La puerta J se verifica con la API de GitHub/Vercel, no con curl a producción |
| Red a images.unsplash.com | No | 403 vía proxy. En `next start` local los `/_next/image` de Unsplash devuelven 500 **solo en este entorno**; en producción cargan. Se anota como limitación, no como bug |
| Publicar en main | Sí, push directo | `git push origin HEAD:main` fue aceptado (398bf74). No hace falta PR. Despliegue de Vercel verificado con el MCP de Vercel (proyecto `prj_n957iGSeYbe4GbTsDxlP0ytLHJSt`) |
| Lighthouse | Sí, local | `lighthouse` (dev) sobre `next start` con el Chromium de `/opt/pw-browsers`, preset móvil. Limitación: las fotos de Unsplash no cargan en el sandbox, así que Performance en producción puede diferir (allí sí cargan y pesan) |

## Unidades

| ID | Título | Estado | Intentos | Commit | PR | Despliegue | Evidencia |
|---|---|---|---|---|---|---|---|
| U01 | Config central `site.ts` + `PRICING.hardware` + `deliveryLabel` | hecho | 1 | 91df1af | directo a main | READY (`dpl_EkvtvuSQmEUTVFiUMuob2etKFaBr`) | typecheck/lint/build ✓; prueba de `waLink`, `waProps`, `mailLink` en Node; sin cambios visibles |
| U02 | Contacto (#contacto, formulario Resend, /register → /#contacto, demo fuera de /login) | hecho | 1 | 34e75a3 | directo a main | READY (`dpl_FynHV9NVoSWdrDAN16CR8zhTqhsJ`) | Capturas de #contacto con y sin formulario en 375/1440; prueba de teclado, validación Zod y error de Resend con aria-live |
| U03 | CTAs a WhatsApp + botón flotante | hecho | 1 | c4acd8d | directo a main | READY (`dpl_4rGKvw2931aCoaRcmUhFwUQKPv4d`) | `grep href="/register"` = 0; 9 enlaces wa.me con target/rel correctos y data-wa-origin; flotante 56×56 solo en 375, sin tapar el footer |
| U04 | Promesas y planes (48 h / 15 días, Básico = Carta, frases prohibidas, docs) | hecho | 1 | dc4093d | directo a main | READY (`dpl_5ZvvPVUVmTvRsry7kRGbzmAR1qhX`) | grep de frases prohibidas en landing = 0; capturas de hero, stats y planes; MARKETING/PRODUCT/CHANGELOG alineados |
| U05 | Sección #hardware | hecho | 1 | 1f7ed73 | directo a main | READY (`dpl_2D3hodjJMk8d9iJqHJRdc8BmjNsB`) | Capturas 375/1440 de #hardware; 4 productos desde PRICING.hardware; CTA de cotización a WhatsApp |
| U06 | Sección #demo | hecho | 1 | 7311a8f | directo a main | READY (`dpl_6VRNLVhPHVyPT1boVzuCzDFX7TSm`) | Capturas 375/1440; CTA a /preview/cliente (200) y /preview/dashboard; sin desbordes en 375 |
| U07 | Sección #implementacion | hecho | 1 | 740a182 | directo a main | READY (`dpl_FfADLZgQXR78bTBv1D7pVNjyb58R`) | Capturas 375/1440: línea de tiempo de 4 hitos y dos columnas |
| U08 | Sección #confianza | hecho | 1 | 21571ae | directo a main | READY (`dpl_3HGbCcsSVf4hVkByjAhDefUrrYzi`) | Capturas 375/1440; 4 compromisos + firma GaloDev; bloque del primer caso real comentado |
| U09 | Sección #preguntas + nav final | hecho | 1 | 639eea7 | directo a main | READY (`dpl_HwTRMENDNGZeY6eW6td6dTwt4vpm`) | 11 preguntas en `src/lib/faq.ts`; prueba de teclado (Enter/Space/flechas/Home/End) y de menú móvil (aria-expanded, Escape, 44 px) |
| U10 | Legal: /terminos y /privacidad | hecho | 1 | fd4c98c | directo a main | READY (`dpl_5K2Qm1gNvDKQAnqunz53V8fdCTfQ`) | Ambas rutas 200 y estáticas; capturas 375/1440; 29 marcas [REVISAR] resaltadas en /terminos; aviso de borrador visible |
| U11 | SEO: sitemap, robots, metadata, OG, JSON-LD | hecho | 1 | ab7fd6c | directo a main | READY (`dpl_JA4xxhYzAejBykgL1CWZf7wwHUNX`) | robots/sitemap/OG verificados con curl; JSON-LD Organization + 3 Product + FAQPage (11); Lighthouse móvil 94/100/96/100 |
| U12 | Analítica: @vercel/analytics + eventos | hecho | 1 | 94fa50f | directo a main | READY (`dpl_FqNJKLxB5LNjaL9mWM66B9jLHtXW`) | `events-test.mjs`: cola `vaq` con pageview, whatsapp_click{origen:hero}, whatsapp_click{origen:plan-estandar}, demo_open{vista:cliente} |
| U13 | Accesibilidad y rendimiento | hecho | 1 | 980e100 | directo a main | READY (`dpl_6APevQvwUW3skEsKtmE6Mj8RQkKN`) | Lighthouse móvil con reduced-motion forzado: / 96/100/96/100, /terminos 99/100/96/100; 0 objetivos < 44 px; CLS 0 |
| U14 | Seguridad de dependencias (next 15.5.x, audit) | hecho | 1 | d1533fc | directo a main | READY (`dpl_85iQ4Um43VxCLzux68xE3MNrJPZx`) | next 15.5.25; audit prod: 0 críticas; queda 1 alta (postcss interno de Next, solo se arregla con Next 16) |
| U15 | Carta estática /c/[slug] | omitida (CONFIG=no) | – | | | | |
| U16 | Redirecciones /q/[code] | omitida (CONFIG=no) | – | | | | |
| U17 | Pulido (bucle de calidad) | hecho | 1 | (ver bitácora it. 16) | directo a main | (ver bitácora it. 16) | Pasada 1: 0 hallazgos altos, 4 medios corregidos, rúbrica ≥ 4 en los 10 criterios; todas las puertas en verde |
| U18 | Informe final | pendiente | 0 | | | | |

## PENDIENTES-STEVEN

- Revisar con un profesional en derecho `/terminos` y `/privacidad` y completar los `[REVISAR]`: razón social, cédula jurídica, domicilio, jurisdicción, días de gracia por atraso, política de reembolsos, garantía del hardware, límite de responsabilidad, plazos de aviso, conservación de datos y registro ante PRODHAB si aplica. Después quitar el aviso de borrador en `legal-page.tsx`.
- Crear `RESEND_API_KEY` en Vercel para activar el formulario de contacto y **redesplegar** (la landing es estática: la decisión de mostrar el formulario se toma en el build). Mientras tanto la sección muestra WhatsApp y correo. Con el remitente por defecto `onboarding@resend.dev`, Resend solo entrega al correo dueño de la cuenta: crear la cuenta de Resend con galodevcr@gmail.com o verificar el dominio y poner `RESEND_FROM_EMAIL`.
- Activar Web Analytics en el proyecto `datafud` de Vercel (Analytics → Enable) para que `@vercel/analytics` registre visitas y eventos.
- Fotos reales del hardware (ver lista TODO-FOTO).
- Pedido mínimo del hardware, si aplica.

## TODO-FOTO

Hoy se muestran ilustraciones SVG de marca (`hardware-art.tsx`) en cajas de proporción fija
con `role="img"` y alt descriptivo. Al tener las fotos reales, basta con poner la ruta en
`PRICING.hardware[].photo` (constants.ts) y dejar el archivo en `public/`.

- `stand-qr-3d` — foto real del stand QR impreso en 3D (ideal: sobre una mesa del local, 4:3).
- `stand-qr-3d-nfc` — foto real del stand QR 3D con chip NFC.
- `stand-resenas` — foto real del stand de reseñas de Google (QR + NFC).
- `tarjeta-nfc` — ya usa `public/nfc.png` (render existente); opcional reemplazar por foto real.

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

### Iteración 6 — U05 Sección #hardware

- Plan: `hardware-section.tsx` (servidor) con los cuatro productos de `PRICING.hardware` en
  composición asimétrica (stand QR 3D grande · tarjeta NFC y stand QR 3D + NFC apilados ·
  stand de reseñas ancho · bloque oscuro "Todo es 100 % personalizable… Cotizá tu diseño por
  WhatsApp" con `waProps("hardware")`); `hardware-art.tsx` con tres ilustraciones SVG de
  marca (TODO-FOTO) y `nfc.png` para la tarjeta. Precio "desde $X / unidad" o "$15 / unidad";
  con precio PENDIENTE mostraría "Cotizá por WhatsApp" (`formatPublishedPrice`). Nav y footer
  ganan "Hardware". En #planes el bloque NFC duplicado se reemplaza por un puente a #hardware.
- Lo que ve un visitante: nueva sección entre "El sistema" y el act-break con los precios
  publicados y el CTA de cotización.
- Puertas: A ✓ · B ✓ · C ✓ · D ✓ · E ✓ (0) · F ✓ (0 bg-clip-text/backdrop-blur, 0 emojis;
  `curl /` sin TODO/PENDIENTE: los TODO-FOTO están solo en comentarios) · G ✓ (375/768/1440
  sin scroll horizontal; ancla #hardware resuelve desde nav, footer y planes) · H n.a. · I ✓
  · J siguiente iteración.
- Capturas: #hardware 375 y 1440. Autocrítica corregida: texto "TU LOGO" pisaba la franja en
  la ilustración (se quitó), la tarjeta grande dejaba aire vacío en desktop (la imagen ahora
  llena la altura) y el CTA del bloque oscuro se salía en 375 (ahora envuelve).

### Iteración 7 — U06 Sección #demo

- Plan: `demo-section.tsx` con marco de teléfono (CSS) que muestra una composición estática
  de la carta de "Verde Limón" usando los mismos datos de `src/lib/demo/mock.ts` (cover,
  categorías, tres platillos en colones, barra de orden) + texto "Probalo vos mismo, sin
  hablar con nadie", tres puntos y CTAs "Abrir la carta demo" → `/preview/cliente` y "Ver el
  panel" → `/preview/dashboard` (con `data-demo-open` para la analítica de U12). Aviso
  "Restaurante ficticio · datos de ejemplo · nada se guarda". Nav gana "Demo"; el footer
  enlaza `#demo`.
- Puertas: A ✓ · B ✓ · C ✓ · D ✓ · E ✓ · F ✓ (`curl /` sin TODO/PENDIENTE) · G ✓
  (375/768/1440; `/preview/cliente` responde 200) · H n.a. · I ✓ · J siguiente iteración.
- Autocrítica corregida: en 375 el CTA con `whitespace-nowrap` y un texto largo ensanchaba la
  columna del grid y cortaba el título (no lo detectaba `scrollWidth`); se acortó el texto,
  se permite el salto de línea y se añadió `min-w-0`. El QA ahora también detecta elementos
  que sobresalen del viewport. Precios en colones sin decimales.

### Iteración 8 — U07 Sección #implementacion

- Plan: `implementation-section.tsx` con línea de tiempo (Día 0 → 48 horas → Días 2 a 5 →
  Día 15; horizontal en desktop, vertical en móvil; plazos desde `PRICING.delivery`) y dos
  columnas: "Lo que hacemos nosotros" (bloque oscuro) y "Lo que ponés vos" (lista numerada).
  Aclara que con el plan Carta se termina en 48 h. Va justo antes de #planes; el footer la
  enlaza.
- Puertas: A ✓ · B ✓ · C ✓ · D ✓ · E ✓ · F ✓ · G ✓ (375/768/1440, sin desbordes) · H n.a.
  · I ✓ · J siguiente iteración.
- Autocrítica: las dos tarjetas se estiraban a la misma altura y la oscura dejaba aire vacío
  en desktop → `lg:items-start`.

### Iteración 9 — U08 Sección #confianza

- Plan: `trust-section.tsx` con cuatro compromisos como lista de definición (sin contratos
  atados · soporte por WhatsApp con una persona · tus datos son tuyos · hecho en Costa Rica
  por GaloDev), columna izquierda pegajosa con la firma de GaloDev y el WhatsApp, y un bloque
  JSX comentado reservado para el primer caso real (solo con permiso del local). Entre
  #planes y #contacto. Sin testimonios, logos ni cifras.
- Puertas: A ✓ · B ✓ · C ✓ · D ✓ · E ✓ · F ✓ (`curl /` sin TODO/PENDIENTE) · G ✓ · H n.a. ·
  I ✓ · J siguiente iteración.
- Nota de honestidad: se nombra "Steven, de GaloDev" (solo nombre de pila) como la persona
  que atiende el WhatsApp; se evitó cualquier garantía no confirmada (p. ej. "garantía de
  satisfacción" quedó fuera hasta que Steven la defina).

### Iteración 10 — U09 Preguntas frecuentes y nav final

- Plan: `src/lib/faq.ts` (11 preguntas: las 5 objeciones de MARKETING §8 + internet en el
  local, cambios de precio, cómo se paga, tipos de negocio, empezar solo con carta, qué
  incluye la implementación); `faq-section.tsx` (cliente): acordeón con `button
  aria-expanded aria-controls`, panel `role=region aria-labelledby`, flechas/Home/End,
  sin animar altura (solo opacidad/transform en la respuesta). Nav final Producto · Hardware
  · Planes · Demo · Preguntas con `mobile-menu.tsx` (botón `aria-expanded/aria-controls`,
  Escape devuelve el foco, cierra al elegir, enlaces de 48 px). Footer gana "Preguntas".
- Puertas: A ✓ · B ✓ · C ✓ · D ✓ · E ✓ · F ✓ · G ✓ (375/768/1440; `a11y-test.mjs`:
  11 preguntas, Enter abre y cierra la anterior, ArrowDown/End mueven el foco, una sola
  región visible; menú móvil: expanded true/false, panel visible, 0 enlaces < 44 px, Escape
  cierra y devuelve el foco, clic en "Preguntas" cierra y llega a la sección) · H n.a. ·
  I ✓ · J siguiente iteración.
- Autocrítica corregida: en 768 px el nav de escritorio con cinco secciones desbordaba 3 px
  (`hscroll 771>768`) → el nav completo aparece desde `lg` y tablet usa el menú; se quitó el
  botón de WhatsApp duplicado dentro del panel (ya está en el header).
- Honestidad: la respuesta "¿Cómo se paga?" no promete medios concretos (se coordinan por
  WhatsApp) y aclara que no hay cobros automáticos, coherente con la suscripción manual.

### Iteración 11 — U10 Legal

- Plan: `legal-page.tsx` (plantilla con nav de marca, aviso visible de borrador con
  `role="note"`, secciones numeradas, `[REVISAR]` resaltado con `<mark>`, pie propio con
  Inicio · Contacto · Términos · Privacidad); `(legal)/terminos` (13 secciones: quién
  ofrece, qué es, precios y pagos, sin permanencia, plazos, contenido del cliente, hardware,
  disponibilidad y soporte, propiedad intelectual, datos, responsabilidad, cambios, ley
  aplicable) y `(legal)/privacidad` (10 secciones: responsable, qué datos y cómo, para qué,
  base legal con la Ley 8968, con quién se comparten —Vercel, Resend, Meta—, conservación,
  derechos y PRODHAB, seguridad, menores, cambios). Precios y plazos salen de `PRICING`.
  Enlaces en el footer de la landing. Las anclas del nav pasan a rutas absolutas (`/#…`)
  para que funcionen desde las páginas legales.
- Puertas: A ✓ · B ✓ · C ✓ (`/terminos` y `/privacidad` estáticas, 3 kB) · D ✓ · E ✓ ·
  F ✓ (`curl /` sin TODO/PENDIENTE; en legal solo `[REVISAR]`, que es el marcador previsto y
  va acompañado del aviso de borrador) · G ✓ (las tres rutas en 375/768/1440, sin desbordes,
  un solo h1) · H n.a. · I ✓ · J siguiente iteración.

### Iteración 12 — U11 SEO

- Plan: `sitemap.ts` (/, /preview, /preview/cliente, /terminos, /privacidad), `robots.ts`
  (disallow /admin, /dashboard, /login, /register, /acceso-galodev-9f3a, /api; sitemap y
  host), `src/lib/seo.ts` (título, descripción, JSON-LD Organization / Product ×3 / FAQPage
  desde `FAQ_ITEMS`), `src/lib/og.tsx` + `opengraph-image.tsx` por página (home, términos,
  privacidad; `ImageResponse` sin fuentes remotas), `layout.tsx` con `metadataBase`, plantilla
  de título, Open Graph, Twitter, robots e iconos; canonical por página (`/`, `/terminos`,
  `/privacidad`); `lang="es"` ya existía. Dev-dependency `lighthouse`.
- Verificación (curl sobre `next start`): `/robots.txt` y `/sitemap.xml` correctos; `<link
  rel="canonical">`, `og:title/url/image` y `<title>` en `/` y `/terminos`; `/opengraph-image`
  200 `image/png` 152 kB; JSON-LD parsea: `['Organization','Product','Product','Product',
  'FAQPage']`, 11 preguntas, "DataFud Carta" 29 USD.
- Lighthouse móvil (puerta H) primera pasada: 76 / 86 / 96 / 100. Causas y arreglos en la
  misma iteración: LCP 7,2 s porque el banner del hero bajaba 1080 px en móvil (sin `sizes`)
  → `sizes` explícito; contraste: `accent-600` sobre crema daba 4,17 y los numerales
  `accent-500` 2,78 → todos los textos dorados sobre claro pasan a `accent-700` (el h1 a
  `accent-600`, texto grande); `<dl>` de #confianza con hijos no válidos → icono dentro de
  `<dt>`; sin `<main>` → la landing va envuelta en `<main>`; `h4` en el footer → `h3`.
  Segunda pasada: **Performance 94 · Accessibility 100 · Best Practices 96 · SEO 100**; LCP
  2,8 s, CLS 0, TBT 130 ms. Único fallo restante: `errors-in-console` por los 500 de Unsplash
  del sandbox (no ocurre en producción).
- Puertas: A ✓ · B ✓ · C ✓ · D ✓ · E ✓ · F ✓ · G ✓ · H ✓ (con la salvedad de red anotada
  arriba) · I ✓ · J siguiente iteración.

### Iteración 13 — U12 Analítica

- Plan: `@vercel/analytics` (`<Analytics />` en el layout raíz), `analytics-events.tsx`
  (delegación de clics: `whatsapp_click {origen}` desde `data-wa-origin`, `demo_open {vista}`
  desde `data-demo-open`) y `contact_submit {resultado: ok|error}` en el formulario. Sin
  Vercel, `track()` no envía nada y la página no se rompe.
- Verificación en navegador sobre `next start`: tras clics en hero, plan Estándar y demo la
  cola `window.vaq` contiene `pageview`, `whatsapp_click {origen:"hero"}`, `whatsapp_click
  {origen:"plan-estandar"}` y `demo_open {vista:"cliente"}`; el script
  `/_vercel/insights/script.js` está en el HTML (localmente responde 404, en Vercel existe).
- Puertas: A ✓ · B ✓ · C ✓ · D ✓ · E ✓ · F ✓ · G ✓ (único request fallido nuevo: el script
  de insights, que solo existe en Vercel) · H sin cambios de UI · I ✓ · J siguiente iteración.
- PENDIENTE-STEVEN: activar **Web Analytics** en el proyecto de Vercel (pestaña Analytics);
  sin eso el script devuelve 404 también en producción y no se registran eventos.

### Iteración 14 — U13 Accesibilidad y rendimiento

- Diagnóstico: Lighthouse con `--force-prefers-reduced-motion` (así se auditan también los
  elementos que entran con reveal): contraste insuficiente en `text-brand-700/60` (3,59) y
  `/50` (2,73) y en la etiqueta "Recomendado" (blanco sobre oro, 2,9); objetivos táctiles
  de 16–36 px en enlaces del footer, nav, firma de #confianza y pie legal; imágenes `fill`
  sin `sizes` en el act-break y el cierre.
- Cambios: opacidades de texto verde sobre claro suben a `/75` (todos los archivos de la
  landing y legal); "Recomendado" pasa a verde con borde dorado; enlaces de texto con
  `min-h-11` (44 px) en footer, nav de escritorio, logo, "Ingresar", firma de GaloDev, pie
  legal y enlace hermano; `sizes="100vw"` en las dos imágenes de fondo; estilo global de
  `:focus-visible` (anillo dorado, solo teclado). Ya cumplían: un solo h1 y orden de
  encabezados, alt en todas las imágenes, `display: swap` en las fuentes, CLS 0.
- Resultado: Lighthouse móvil `/` → Performance 96 · Accessibility 100 · Best Practices 96 ·
  SEO 100 (LCP 2,7 s, CLS 0); `/terminos` → 99 / 100 / 96 / 100. Único fallo restante en
  ambas: `errors-in-console` por Unsplash (sandbox) y el script de insights (solo en Vercel).
  `qa.mjs` ahora exige 44 px de área táctil: 0 hallazgos en `/`, `/terminos`, `/privacidad`.
- Puertas: A ✓ · B ✓ · C ✓ · D ✓ · E ✓ · F ✓ · G ✓ · H ✓ · I ✓ (corrida con reduced-motion
  sin diferencias) · J siguiente iteración.

### Iteración 15 — U14 Seguridad de dependencias

- Antes: `next` 15.5.19 con 1 crítica (DoS/SSRF/cache en Server Actions) y 3 altas
  (`nanoid`, `postcss`, `sharp`). Cambios: `next` y `eslint-config-next` → 15.5.25 (última
  15.5.x), `npm audit fix --omit=dev` (nanoid), `npm ci` limpio desde el lockfile.
- Después: `npm audit --omit=dev` → 0 críticas; quedan 1 alta + 1 moderada, ambas por el
  `postcss` que Next empaqueta en `node_modules/next/node_modules/postcss`; el único arreglo
  es `next@16` (salto mayor), fuera del alcance de la regla 3. Riesgo bajo en esta etapa: el
  vector es un `sourceMappingURL` controlado por el atacante en el build, no en producción.
- Puertas repetidas con Next 15.5.25: A ✓ · B ✓ · C ✓ (build ok) · D ✓ · E ✓ · F ✓ · G ✓
  (`/`, `/terminos`, `/privacidad`, `/preview` OK en 375/768/1440; `/login` tiene un enlace
  de 36 px, fuera del alcance de la landing) · H ✓ (96 / 100 / 96 / 100) · I ✓ · J siguiente.
- Extra: el "Ingresar" del nav de escritorio quedó en 44 px (se había escapado en U13).
  CHANGELOG "Unreleased" actualizado con U05–U14.

### Iteración 16 — U17 Pulido, pasada 1

Revisión completa de las 13 secciones en 375 y 1440 (capturas en el scratchpad) desde las
tres miradas.

**Hallazgos**

| Sev. | Mirada | Hallazgo | Archivo | Acción |
|---|---|---|---|---|
| media | arte | En los stats, "días para el sistema completo" chocaba con "idiomas listos" en 1440 | page.tsx | `pr-6` por columna (ahora envuelve limpio) |
| media | ingeniero | `page.tsx` con 506 líneas, cierre + footer inline | page.tsx | Extraído a `site-footer.tsx` (page.tsx 410 líneas); lista "Explorar" como arreglo |
| media | ingeniero | Importaciones sin uso tras la extracción (`SITE`, `hasWhatsApp`, `mailLink`, `whatsappDisplay`) | page.tsx | Eliminadas; `tsc --noUnusedLocals` limpio en la landing |
| media | marca | `backdrop-blur` heredado en nav, hero, chips, barra de highlights, insignia de pasos y pill del cierre (regla 5: sin glassmorphism; puerta F) | nav, page, pinned-steps, site-footer | Quitado en todos; el nav pasa a `bg-cream-50/95` |
| baja | arte | El símbolo ₡ del marquee cae a una fuente de respaldo (Young Serif no lo trae) | page.tsx | Se deja: es un detalle decorativo y cambiar la fuente del marquee rompería su ritmo |
| baja | dueño | Etiqueta del hero "QR Menus · Orders · Analytics" en inglés | page.tsx | Se deja: es el tagline oficial de la marca (BRAND.md) |
| baja | ingeniero | `PRICING.trialDays` ya no lo usa la landing | constants.ts | Se deja: lo usa la lógica de suscripción (fuera del alcance) |
| baja | dueño | No se publica pedido mínimo del hardware | hardware-section | Pendiente de Steven (PENDIENTES-STEVEN) |

Sin hallazgos altos. Las fotos de Unsplash y el script de insights no cargan en el sandbox;
en producción sí (verificado por diseño: rutas remotas permitidas y Vercel sirve el script).

**Rúbrica (1–5)**

| Criterio | Nota | Evidencia |
|---|---|---|
| Claridad de la oferta | 5 | Hero + highlights dicen qué es, cuánto (desde $29/mes, $249), cuánto tarda (48 h / 15 días) y cómo pedirlo (WhatsApp) sin bajar |
| Confianza que transmite | 4 | #confianza, #implementacion con fechas, legal y demo real; falta el primer caso real (bloque reservado) |
| Fidelidad a la marca | 5 | Young Serif + Hanken, verde/oro/crema, sin emojis, sin degradado en texto, sin blur, asimetría en #hardware y #demo |
| Calidad del copy | 4 | Voseo consistente, frases cortas, sin promesas vacías; el tagline en inglés y algún texto largo en móvil (planes) admiten afinado |
| Responsive | 5 | 375/768/1024/1440 sin desbordes ni scroll horizontal; nav completo en lg, menú en tablet/móvil |
| Accesibilidad | 5 | Lighthouse 100; teclado en acordeón y menú; foco visible; 44 px; un h1; `<main>`; contraste AA |
| Rendimiento | 4 | Lighthouse móvil 95–96, LCP 2,7 s, CLS 0; las fotos remotas de Unsplash no se pudieron medir en el sandbox |
| SEO | 5 | Lighthouse 100; sitemap, robots, canonical, OG por página, JSON-LD válido |
| Honestidad comercial | 5 | 0 frases prohibidas; sin testimonios, logos ni cifras; plazos y precios desde `PRICING`; borrador legal señalado |
| Calidad del código | 4 | Componentes de 100–220 líneas, datos en `site.ts`/`constants.ts`/`faq.ts`, sin `any` ni `eslint-disable`; `pricing-v2` conserva nombre heredado |

Convergió en la primera pasada: 0 altos/medios abiertos y todos los criterios ≥ 4.

- Puertas de la pasada: A ✓ · B ✓ · C ✓ · D ✓ · E ✓ (0) · F ✓ (0 bg-clip-text, 0
  backdrop-blur en toda la landing, 0 emojis, `curl /` sin TODO/PENDIENTE) · G ✓ (`/`,
  `/terminos`, `/privacidad` en 3 tamaños; 12 enlaces wa.me correctos; acordeón y menú por
  teclado) · H ✓ (95 / 100 / 96 / 100) · I ✓ · J siguiente iteración.
