# Estado del loop — Correcciones post-revisión (2026-09-20)

> Archivo de estado del segundo bucle autónomo. Cierra los hallazgos de la revisión
> independiente del 2026-09-20 sobre la fachada publicada por el loop anterior
> (`landing-loop-state.md`, `landing-loop-report.md`). Si la sesión se corta: "Releé
> docs/plans/correcciones-loop-state.md y continuá el loop".

## Contador

- Iteración actual: 5
- Iteraciones consumidas: 5 / 25

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
| C04 | Formulario anti-abuso (trampa de tiempo, URLs, Turnstile opcional) | hecho | 1 | (ver bitácora it. 5) | directo a main | `abuse-test.mjs`: envío a 1,5 s → éxito silencioso + log "descartado por trampa de tiempo"; envío a 3,5 s → llega a Resend; 3 URLs → error visible; widget Turnstile solo con su clave |
| C05 | Copy honesto | pendiente | 0 | | | |
| C06 | QA sin peso en producción (`qa:landing`) | pendiente | 0 | | | |
| C07 | `CLAUDE.md` en el repo | pendiente | 0 | | | |
| C08 | Verificación final y pulido (mín. 2 pasadas) | pendiente | 0 | | | |
| C09 | Informe final y cierre de vault-sync | pendiente | 0 | | | |

## PENDIENTES-STEVEN

- Los del informe anterior siguen vigentes: `RESEND_API_KEY` + redeploy, Web Analytics en Vercel, fotos del hardware, revisión legal, prueba en teléfono real.
- Se agregan los que salgan de este loop (ver bitácora).

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
