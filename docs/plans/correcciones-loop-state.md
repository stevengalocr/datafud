# Estado del loop — Correcciones post-revisión (2026-09-20)

> Archivo de estado del segundo bucle autónomo. Cierra los hallazgos de la revisión
> independiente del 2026-09-20 sobre la fachada publicada por el loop anterior
> (`landing-loop-state.md`, `landing-loop-report.md`). Si la sesión se corta: "Releé
> docs/plans/correcciones-loop-state.md y continuá el loop".

## Contador

- Iteración actual: 8
- Iteraciones consumidas: 8 / 25

## Capacidades del entorno

| Capacidad | Estado | Evidencia |
|---|---|---|
| Navegador real | Sí | Chromium 1194 en `/opt/pw-browsers`, `@playwright/test` 1.63 |
| Red a datafud.com | Parcial | Sin salida directa; se lee producción vía la herramienta `web_fetch` de Vercel y la API de despliegues |
| Red a images.unsplash.com | No | En `next start` local las fotos remotas devuelven 500 (solo en el sandbox) |
| Publicar en main | Sí | Push directo aceptado en el loop anterior (18 commits) |
| Google Drive (vault) | Sí, lectura y escritura por MCP | El puente `docs/vault-sync/…` se escribe siempre; la aplicación directa al vault se hace al cerrar (C09) |
| Base de datos | No | No hay proyecto Supabase: `seed.dev.sql` no se puede ejecutar acá |

## Unidades

| ID | Título | Estado | Intentos | Commit | Despliegue | Evidencia |
|---|---|---|---|---|---|---|
| C01 | Acceso cerrado con dignidad (sin "Ingresar"; /login con aviso sin backend) | hecho | 1 | 6e173b0 | READY (`dpl_A83jsKJhZcVBPxDuz4M3sDooh9Wd`) | `grep href="/login"` = 0; /login sin env → 200, 0 `<form>`, sin errores; con env falsa → 1 `<form>`; capturas nav/footer/menú/login |
| C02 | Ruta privada fuera de robots + noindex | hecho | 1 | 94db3a5 | READY (`dpl_BsMyrnuTuMf92ErwqkivJ84U1BsP`) | robots sin "acceso"; `<meta name="robots" content="noindex…">` en /login y la ruta privada; `X-Robots-Tag` en las tres (incluida la 307 de /register); ninguna en el sitemap |
| C03 | Credenciales fuera del repo (`seed.dev.sql`) | hecho | 1 | de882b6 | READY (`dpl_4bbZkUSq1LfWRdWmr78s19YvXtij`) | `grep -rn Datfud2026` = 0; diff de schema.sql = solo sección 10 (−139/+5); seed.dev.sql revisado línea a línea; sin BD para ejecutarlo |
| C04 | Formulario anti-abuso (trampa de tiempo, URLs, Turnstile opcional) | hecho | 1 | ae1b32a | READY (`dpl_6HuYV8MKnkbA9rWWnTTzdu86Hine`) | `abuse-test.mjs`: envío a 1,5 s → éxito silencioso + log "descartado por trampa de tiempo"; envío a 3,5 s → llega a Resend; 3 URLs → error visible; widget Turnstile solo con su clave |
| C05 | Copy honesto | hecho | 1 | 236e674 | READY (`dpl_87hryu7YvUvfuzP44emUD48zkJee`) | 8 cambios antes → después; grep ampliado (más estrellas, mesas llenas, más ventas, vende más, prioritari, avanzad) = 0 en la landing; docs alineados |
| C06 | QA sin peso en producción (`qa:landing`) | hecho | 1 | e27fe85 | (verificar en it. 8) | `lighthouse` fuera de devDependencies; `npm ci && npm run build` OK; `npm run qa:landing` → OK · 3 avisos (fotos remotas) en 32 s, con servidor previo y levantando el suyo |
| C07 | `CLAUDE.md` en el repo | hecho | 1 | (ver bitácora it. 8) | directo a main | 111 líneas; cada afirmación verificada contra el código (middleware en raíz, service_role solo en registerAction, sin security_invoker aún, Zod solo en dos actions, grants de anon, restos Datfud) |
| C08 | Verificación final y pulido (mín. 2 pasadas) | pendiente | 0 | | | |
| C09 | Informe final y cierre de vault-sync | pendiente | 0 | | | |

## PENDIENTES-STEVEN

- Los del informe anterior siguen vigentes: `RESEND_API_KEY` + redeploy, Web Analytics en Vercel, fotos del hardware, revisión legal, prueba en teléfono real.
- Decidir si el eslogan "El menú digital que abre apetito y cierra ventas" (hero y OG) se mantiene como identidad de marca o se cambia por uno sin promesa de resultado (C05).
- Opcional: activar Cloudflare Turnstile con sus dos variables si el formulario recibe spam (C04).
- Si alguna vez se corrió `schema.sql` en una BD real, cambiar la contraseña de esas cuentas (C03).

## Línea base (iteración 1, `main` @ f90bfd7)

- `npm run typecheck` → 0 errores · `npm run lint` → 0 warnings · `npm run build` → ok.
- Lectura: README, BRAND, .impeccable.md, los dos documentos del loop anterior, nav/menú
  móvil/footer, login, ruta privada, robots/sitemap, `schema.sql` sección 10 (líneas 628–766),
  `verify.sql`, USER_MANUAL/PRODUCT/README/specs/plans (menciones de la contraseña semilla:
  10 líneas en 6 archivos), `actions.ts`, `contact.ts`, `contact-form.tsx`, `constants.ts`,
  `faq.ts`, `seo.ts`. Vault: `CLAUDE.md` del vault (formato de frontmatter y de log) y
  `Seguridad.md` (S1–S13).

## Bitácora

### Iteración 1 — arranque y prueba de publicación

- Estado y `docs/vault-sync/2026-09-20-correcciones.md` creados. Prueba de publicación:
  commit 8b788f9 en `main` por push directo (aceptado).

### Iteración 2 — C01 Acceso cerrado con dignidad

- Plan: quitar "Ingresar" de `landing-nav-v2.tsx`, `mobile-menu.tsx` (desaparece el bloque
  inferior del panel; el nav queda solo con secciones) y `site-footer.tsx` (la columna
  Contacto queda con WhatsApp, correo y región). `/login` se parte en `page.tsx` (Server
  Component que decide con `hasSupabaseEnv()` de `src/lib/env.ts`) y `login-form.tsx` (el
  formulario cliente existente, sin cambios). Sin variables: aviso de marca "El acceso al
  panel se activa con tu implementación" + CTA WhatsApp (`waProps("contacto")`) + "Volver a
  la landing".
- Lo que ve un visitante: ni el nav ni el footer ofrecen "Ingresar"; si alguien entra a
  /login por URL ve el aviso con el WhatsApp, nunca un formulario que no funciona.
- Evidencia: `grep -rn 'href="/login"' src/components/marketing src/app/page.tsx` = 0;
  build con `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` falsas → `/login` 200 con 1 `<form>`; build
  sin variables → `/login` 200 con 0 `<form>`, `/register` 307 → `/#contacto`; QA en
  375/768/1440 de `/`, `/login`, `/terminos`, `/privacidad` sin hallazgos; menú móvil por
  teclado OK (5 secciones, Escape devuelve el foco). El log del servidor solo tiene los
  `fetch failed` del optimizador de imágenes con Unsplash (sandbox), ninguno de /login.
- Autocrítica: el CTA del aviso partía en dos líneas en 375 con altura fija → `min-h-12`.
- Puertas: A ✓ · B ✓ · C ✓ · D ✓ (nav, menú, footer, `(auth)/login`, `lib/env.ts`) · E ✓ ·
  F ✓ · G ✓ · H n.a. · I ✓ · J siguiente iteración · K ✓ (bloque abajo en vault-sync).

### Iteración 3 — C02 Ruta privada sin anunciar

- Plan: quitar `/acceso-galodev-9f3a` de `robots.ts`; `robots: { index:false, follow:false }`
  en `/login` (page servidor), `/register` (page servidor) y `layout.tsx` nuevo de la ruta
  privada (su page es "use client"); además cabecera `X-Robots-Tag: noindex, nofollow` para
  las tres en `next.config.mjs`, porque `/register` responde 307 sin HTML y el meta no
  alcanzaría.
- Evidencia (`next start` sin variables): `/robots.txt` sin "acceso"; `/login` 200 con
  `X-Robots-Tag` y `<meta name="robots" content="noindex, nofollow">`; ruta privada 200 con
  cabecera y `<meta … "noindex, nofollow, nocache">`; `/register` 307 → `/#contacto` con la
  cabecera; `sitemap.xml` sin ninguna de las tres. QA en 375/768/1440 de `/`, `/login` y la
  ruta privada sin hallazgos.
- Puertas: A ✓ · B ✓ · C ✓ · D ✓ (`robots.ts`, `(auth)/*`, `next.config.mjs`) · E ✓ · F ✓ ·
  G ✓ · H n.a. · I n.a. · J siguiente iteración · K ✓.

### Iteración 4 — C03 Credenciales fuera del repo

- Plan: (a) `supabase/seed.dev.sql` nuevo con la sección 10 completa; la contraseña llega por
  `-v seed_password=…` (`\if :{?seed_password}` … `\quit`), se pasa al bloque `do $$` por
  `set_config('seed.password', …)` porque psql no interpola dentro de `$$`, y el bloque
  aborta con `raise exception` si la contraseña falta o tiene menos de 12 caracteres (cubre
  el SQL Editor de Supabase) o si no existe el plan estándar (schema sin correr). Correos por
  variable con valor por defecto `admin@datafud.test` / `demo@datafud.test` (los personales
  salen del archivo vigente). Encabezado en mayúsculas SOLO DESARROLLO, NUNCA EN PRODUCCIÓN;
  al final se limpia el setting de la contraseña. (b) `schema.sql`: la sección 10 se
  reemplaza por una nota de 5 líneas; el resto del archivo intacto. (c) `verify.sql`: parte 1
  esquema (siempre) y parte 2 "SOLO SI CORRISTE seed.dev.sql" (usuarios por rol/tenant demo,
  productos, reportes). (d) README (flujo nuevo + aviso de contraseña quemada), PRODUCT §12,
  USER_MANUAL §7, spec §8 (nota) y plan de fase 0: literal reemplazado por
  `<definida-por-vos>`.
- Revisión línea por línea de `seed.dev.sql` contra la sección original: mismas
  declaraciones, mismos `insert … on conflict`, mismas categorías/productos/mesas/orden; los
  únicos cambios son la fuente de la contraseña y de los correos y el `full_name` del super
  admin ("Super Admin (dev)").
- Evidencia: `grep -rn "Datfud2026" . --exclude-dir=node_modules --exclude-dir=.git
  --exclude-dir=.next` = 0; `grep stevengalocr|demo@datfud.com supabase/*.sql` = 0;
  `git diff --stat supabase/schema.sql` = 1 archivo, +5/−138, todo dentro de la sección 10 y
  su cabecera; typecheck/lint/build en verde. **No hay base de datos** en este entorno ni
  proyecto Supabase de Datafud: `seed.dev.sql` y `verify.sql` no se ejecutaron; la sintaxis
  psql (`\if :{?var}`, `\set`, `set_config`) es la estándar desde psql 10.
- Puertas: A ✓ · B ✓ · C ✓ · D ✓ (supabase/ solo en esta unidad) · E ✓ · F ✓ · G n.a. (sin
  cambios de UI) · H n.a. · I n.a. · J siguiente iteración · K ✓.

### Iteración 5 — C04 Formulario resistente a abuso

- Plan: (a) trampa de tiempo medida en el **cliente** (`elapsedMs` = envío − montaje, escrito
  en `onSubmit`), no con la hora de render: la landing es estática y una marca de tiempo del
  servidor sería la del build, y una marca del cliente comparada con el reloj del servidor
  fallaría con relojes desfasados. El servidor descarta en silencio si falta, no es número,
  es < 3 s o > 2 h (`looksAutomated`). Sin JS el campo va vacío y se descarta (sin JS el
  formulario tampoco podía mostrar sus estados). (b) `contactSchema.message` con `refine`:
  más de 2 URLs (`https?://` o `www.`) → error visible. (c) Turnstile opcional:
  `src/lib/turnstile.ts` (site key, `isTurnstileEnabled` solo con las dos variables,
  `verifyTurnstileToken` vía fetch a siteverify con `remoteip`) y `turnstile-widget.tsx`
  (script oficial con `next/script`, modo declarativo `.cf-turnstile`). Sin variables no se
  carga nada. `.env.example` con `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY`.
  Logs `[contacto] descartado por …` para evidencia. Sin dependencias nuevas.
- Evidencia (build con `RESEND_API_KEY` falsa): envío automatizado a 1,07 s → la UI muestra
  "Recibimos tu mensaje" y el log dice `descartado por trampa de tiempo (elapsedMs=1535)`;
  **no** hay llamada a Resend. Envío humano a 3,5 s → "No pudimos enviar tu mensaje" y en el
  log `Resend devolvió error: Unable to fetch data` (llegó a Resend; falla por la clave falsa
  y la red del sandbox). Mensaje con 3 URLs → "Tu mensaje tiene demasiados enlaces…". HTML
  sin claves de Turnstile: 0 `cf-turnstile`; con `NEXT_PUBLIC_TURNSTILE_SITE_KEY` el widget
  aparece con su `data-sitekey`. Build de producción sin variables: 0 `<form>` (solo accesos
  directos), QA 375/768/1440 OK.
- Puertas: A ✓ · B ✓ · C ✓ · D ✓ · E ✓ · F ✓ · G ✓ · H n.a. · I ✓ · J siguiente · K ✓.

### Iteración 6 — C05 Copy honesto

Pasada completa por page.tsx, componentes de marketing, `faq.ts`, `seo.ts`, `constants.ts`,
`og.tsx`, legal y metadatos buscando promesas de resultado o funciones que el sistema no
entrega en 15 días. Cambios (antes → después):

| Dónde | Antes | Después |
|---|---|---|
| `constants.ts` · stand de reseñas | "QR y NFC que llevan directo a dejar la reseña. Más estrellas, más mesas llenas." | "QR y NFC que llevan al comensal directo a tu ficha de Google para dejar la reseña, sin buscar nada." |
| `hardware-section.tsx` · etiqueta | "Para subir tus estrellas" | "Para pedir reseñas" |
| `page.tsx` · act-break título | "Hecho para llenar mesas en Latinoamérica." | "Hecho para las mesas de Latinoamérica." |
| `page.tsx` · act-break texto | "…una experiencia digital que vende más y opera mejor." | "…una carta digital que se ve mejor, se actualiza sola y habla el idioma de cada cliente." |
| `pricing-v2.tsx` · Estándar | "Soporte prioritario por WhatsApp" | "Soporte por WhatsApp en horario de oficina" |
| `pricing-v2.tsx` · Empresarial | "Reportes avanzados de venta" | "Ventas por día, ticket promedio y platillos más vendidos" (lo que hay: `v_daily_sales`, `v_top_products`, `v_order_summary`) |
| `pricing-v2.tsx` · Empresarial | "Soporte dedicado por WhatsApp" | "Soporte por WhatsApp con contacto directo" |
| `pricing-v2.tsx` · Empresarial tagline | "Sin límites para tu crecimiento" | "Sin límites de platillos, categorías ni mesas" |

Revisados y sin cambios (describen funciones que sí existen): "Actualizás platos y precios al
instante" (panel), "la carta se abre al instante" (QR/NFC), FAQ, JSON-LD (usa `deliveryLabel`
y límites), descripciones de metadatos. `PRICING.trialDays` (sin uso en el código) se elimina.
Regla 8: MARKETING §6 (tabla de planes: reportes y soporte; nota de honestidad en hardware),
§9 (voz: prohibidas las promesas de resultado) y PRODUCT §8 alineados.

- Decisión que queda para Steven: el titular "El menú digital que abre apetito **y cierra
  ventas**" (hero, OG, MARKETING §1) es el eslogan de marca definido en BRAND/MARKETING; es una
  promesa de resultado en tono de eslogan. No se cambió por ser identidad de marca; se anota
  en PENDIENTES-STEVEN para que decida si lo conserva.
- Puerta E: el grep ampliado da 0 en la landing y en `faq.ts`/`seo.ts`; en `constants.ts`
  quedan solo `trial: "Prueba"` y su color en `TENANT_STATUS_LABEL/COLOR`, que son la
  etiqueta del enum `tenant_status` de la base de datos usada por los paneles, no copy de la
  landing (no se puede renombrar sin tocar `src/app/admin` y `dashboard`, prohibidos).
- Puertas: A ✓ · B ✓ · C ✓ · D ✓ · E ✓ (con la salvedad anterior) · F ✓ · G ✓ · H n.a. ·
  I n.a. · J siguiente · K ✓.

### Iteración 7 — C06 QA sin peso en producción

- Plan: `npm uninstall lighthouse` (−96 paquetes; queda `@playwright/test`), script
  `scripts/qa-landing.mjs` versionado con las comprobaciones de los dos loops (3 tamaños,
  consola, requests, scroll horizontal y desbordes, anclas, CTAs de WhatsApp, h1, alt, áreas
  táctiles, TODO/PENDIENTE, acordeón y menú por teclado, `/register` 307, robots y sitemap,
  capturas por sección en `.qa/` ignorada), `npm run qa:landing`, sección 5 en README.
  El script levanta `next start` si el puerto está libre (grupo de procesos `detached`, se
  apaga al final) y usa `/opt/pw-browsers/chromium` si existe o `QA_CHROMIUM`.
- Autocrítica (3 ciclos): (1) con `waitUntil: "networkidle"` la corrida se colgó 14 min en
  el sandbox porque las fotos remotas tardan en fallar → `load` + pausa corta (32 s en
  total); (2) los enlaces `/#sección` del nav en `/terminos` se contaban como anclas rotas →
  solo se exigen las anclas de la misma página y las absolutas en `/`; (3) al levantar el
  servidor propio, el optimizador de imágenes devuelve 403 vía proxy y llenaba la consola →
  los "Failed to load resource" se evalúan por request, y las fotos remotas (`/_next/image?
  url=https…`) son aviso, no fallo, porque dependen de la red del entorno.
- Evidencia: `npm ci` (416 paquetes) + `npm run build` OK; `npm run qa:landing` con servidor
  previo → `OK · 3 avisos`; `QA_BASE=http://localhost:3100 npm run qa:landing` sin servidor →
  levanta, `OK · 3 avisos`, y al terminar no queda nada escuchando en 3100. 30 capturas en
  `.qa/`. `grep lighthouse package.json package-lock.json` = 0.
- Puertas: A ✓ · B ✓ · C ✓ · D ✓ · E ✓ · F ✓ · G ✓ (la corre el propio script) · H n.a. ·
  I ✓ · J siguiente · K ✓.

### Iteración 8 — C07 CLAUDE.md

- Plan: `CLAUDE.md` en la raíz (111 líneas, español): qué es y etapa actual (landing primero,
  sin backend, /register → /#contacto, /login con aviso, sin "Ingresar"); comandos (incluido
  `qa:landing` y el seed con contraseña por variable); mapa; 11 reglas que no se rompen;
  convenciones; trampas conocidas; y la sección "Vault de Obsidian — protocolo de alineación"
  con el formato exacto del bloque de vault-sync y la regla "aplicado en vault: sí/no".
- Verificación de cada afirmación antes de escribirla: `middleware.ts` está en la raíz y no
  hay `src/middleware.ts`; `createAdminClient` solo se usa en `(auth)/actions.ts`
  (`registerAction`); `schema.sql` no tiene `security_invoker` (se escribe como regla para
  vistas nuevas y se señala S1 como pendiente); `anon` solo recibe `grant execute` en
  `get_menu` y `place_order` tras `revoke all … from public`; Zod solo en `(auth)/actions.ts`
  y `app/actions.ts` (se señala S10); `NEXT_PUBLIC_SITE_URL` se usa en `dashboard/tables`;
  `enforce_plan_limit` hace `raise exception`; restos "Datfud" en `package.json`,
  `types.ts` y los `.sql`; `revalidatePath` en `dashboard/actions.ts`. Nada de lo escrito
  contradice el código.
- Puertas: A ✓ · B ✓ · C ✓ · D ✓ (solo `CLAUDE.md` + estado + vault-sync) · E n.a. · F n.a. ·
  G n.a. (sin UI) · H n.a. · I n.a. · J siguiente · K ✓.
