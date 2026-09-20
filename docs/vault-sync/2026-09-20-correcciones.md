# Vault-sync · Correcciones post-revisión de la landing · 2026-09-20

> Cola de entrada para el vault de Obsidian (`02-Proyectos/Datafud/`). Cada unidad del loop de
> correcciones agrega su bloque abajo. Se aplica tal cual en Pendientes, Decisiones, Seguridad,
> las páginas que se nombren y el log del nodo (formato del `CLAUDE.md` del vault:
> `## [AAAA-MM-DD] ingest | Título`). El resumen "qué cambiar en cada página" se agrega arriba
> de todo al cerrar el loop (C09).

Aplicado en vault: **parcial**. El conector de Google Drive de esta sesión solo crea archivos y
cambia título/carpeta (no edita el contenido de los `.md` existentes), así que este puente se
subió completo como archivo nuevo al nodo Datafud del vault
(`02-Proyectos/Datafud/vault-sync-2026-09-20-correcciones.md`). Las páginas se actualizan con
"sincronizá el vault" desde Cowork usando el resumen de abajo.

## Resumen · qué cambiar en cada página (aplicar tal cual)

**Pendientes.md**
- Datos que esperan a Steven — agregar: "Decidir si el eslogan 'El menú digital que abre apetito
  y cierra ventas' se mantiene (identidad de marca) o se cambia por uno sin promesa de resultado";
  "Si alguna vez se corrió el `schema.sql` antiguo en una BD real, cambiar la contraseña de esas
  cuentas (la antigua está en el historial público)"; "Opcional: Turnstile con
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` en Vercel si hay spam".
- L — Fachada de venta — marcar cerrados (2026-09-20): "Copiar `CLAUDE.md` al repo" (la rama
  `feat/landing-ventas` no aplica), "Sacar las contraseñas semilla del repo y de `/login` (S2)",
  y los ítems L1–L7 y L9 del loop anterior si siguen abiertos; agregar cerrado: "Loop de
  correcciones post-revisión 2026-09-20 (C01–C09), estado en
  `docs/plans/correcciones-loop-state.md`".
- P0 — en "Proyecto Supabase + `schema.sql` sin cuentas semilla + variables en Vercel": la parte
  "`schema.sql` sin cuentas semilla" queda hecha; siguen el proyecto y las variables. Agregar:
  "Mover `middleware.ts` a `src/middleware.ts`" ya está (sin cambios).
- P1 — en "S5 Captcha + verificación de correo en /register": anotar "el formulario de contacto ya
  soporta Turnstile opcional; /register sigue cerrado".
- P2 — en "Tests de aislamiento + Playwright…": anotar "ya existe `npm run qa:landing` para la
  landing; el flujo QR → orden sigue pendiente".
- P3 — "S8 Retirar o reubicar la ruta privada": mitigado (fuera de robots, noindex por meta y
  cabecera, fuera del sitemap); agregar "Quitar `backdrop-blur` de `menu-client.tsx` y
  `preview/page.tsx` cuando se toquen esas rutas".

**Decisiones.md** — agregar D-016 (protocolo de alineación repo → vault), D-017 (sin "Ingresar"
mientras no haya backend), D-018 (semillas de usuarios solo en `seed.dev.sql`), D-019 (anti-abuso
del formulario sin infraestructura), D-020 (sin promesas de resultado en la landing), D-021
(lighthouse fuera del repo; QA como script). Texto completo en los bloques de abajo.

**Seguridad.md** — S2: cerrado en el repo (queda la acción operativa de cambiar la contraseña si
se usó en una BD real). S8: mitigado 2026-09-20. S14 (nuevo, cerrado): formulario de contacto sin
anti-bots → honeypot, trampa de tiempo, tope de URLs, Turnstile opcional. S1 y S10 sin cambios,
ahora escritos como reglas en `CLAUDE.md`. "Arreglo sugerido 1": hecho salvo la acción operativa
y la decisión del repo privado.

**Cuentas-y-Accesos.md** — tabla de variables: agregar `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
(formulario) y `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` (opcionales). Tabla
"Cuentas sembradas por `schema.sql`": reemplazar por "`schema.sql` ya no siembra cuentas;
`seed.dev.sql` (solo desarrollo) crea `admin@datafud.test` y `demo@datafud.test` con la
contraseña que se pase por psql". "Acceso del super admin": agregar "no está en robots.txt ni en
el sitemap; responde noindex/nofollow por meta y `X-Robots-Tag`".

**Paneles-Y-Vistas.md** — `/login`: "sin variables de Supabase muestra un aviso ('El acceso al
panel se activa con tu implementación') con CTA a WhatsApp; el formulario solo aparece con
backend". La landing ya no enlaza "Ingresar".

**Arquitectura-Y-Base-De-Datos.md** — `schema.sql` solo siembra monedas y planes; semillas de
usuarios/tenant demo en `seed.dev.sql`; `next.config.mjs` define `headers()` con `X-Robots-Tag`;
piezas nuevas: `src/lib/{env,contact,turnstile}.ts`, `turnstile-widget.tsx`,
`scripts/qa-landing.mjs`; `lighthouse` fuera de las dependencias de desarrollo.

**Guia-De-Desarrollo.md** — comandos: `npm run qa:landing` (capturas en `.qa/`, `QA_CHROMIUM`) y
`psql "$DBURL" -v seed_password='…' -f supabase/seed.dev.sql`; referenciar `CLAUDE.md` como
fuente de reglas.

**Marca-Y-Marketing.md** — regla "sin promesas de resultado" en Mensajes clave / Voz; planes:
Estándar "soporte por WhatsApp en horario de oficina", Empresarial "ventas por día, ticket
promedio y platillos más vendidos" y "soporte por WhatsApp con contacto directo".

**Producto-Y-Modelo-De-Negocio.md** — misma corrección de reportes y soporte por plan.

**Plan-Landing-First.md** — stand de reseñas "lleva directo a dejar la reseña" (quitar "para subir
valoraciones").

**Claude-Code/CLAUDE-repo.md** — `estado: activo`; el archivo vivo es `CLAUDE.md` en el repo
(commit af089cb); enlazar el protocolo de vault-sync. **Claude-Code/Flujo-Obsidian-Claude-Code.md**
— paso 2 hecho; agregar "las sesiones en la nube dejan `docs/vault-sync/…` y Cowork lo aplica".

**log.md** — pegar las entradas `## [2026-09-20] ingest | …` de cada bloque (C00 a C09).

---

### C00 · Arranque del loop de correcciones · commit (este) · despliegue (ver estado)
**Pendientes.md** — nada que cerrar todavía. Ítem nuevo bajo "L — Fachada de venta": "Loop de
correcciones post-revisión 2026-09-20 en curso (`docs/plans/correcciones-loop-state.md`)".
**Decisiones.md** — ninguna.
**Seguridad.md** — sin cambios.
**Otras páginas** — ninguna.
**log.md** — `## [2026-09-20] ingest | Arranque del loop de correcciones de la landing`
- Segundo bucle autónomo desde Claude Code en la nube sobre `main` @ f90bfd7.
- Línea base en verde (typecheck, lint, build). Estado en `docs/plans/correcciones-loop-state.md`.
- El puente vault-sync vive en `docs/vault-sync/2026-09-20-correcciones.md`.

### C01 · Acceso cerrado con dignidad · commit (ver estado, it. 2) · despliegue (ver estado)
**Pendientes.md** — cerrar en "L — Fachada de venta": "Sacar las contraseñas semilla del repo y
de `/login` (S2)" queda **parcial**: la parte de `/login` está cerrada (ya no muestra la cuenta
demo y sin backend no muestra formulario); la parte del repo se cierra en C03. Ítem nuevo: ninguno.
**Decisiones.md** — D-017 · La landing no ofrece "Ingresar" mientras no haya backend.
- Fecha: 2026-09-20 · Estado: aceptada · Fuente: revisión independiente 2026-09-20.
- Contexto: el enlace "Ingresar" llevaba a un formulario que no podía autenticar a nadie
  (Vercel sin variables de Supabase).
- Decisión: se quita "Ingresar" del nav, del menú móvil y del footer. `/login` decide en el
  servidor: sin `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` muestra un aviso de marca con WhatsApp;
  con variables muestra el formulario de siempre.
- Consecuencias: cuando se encienda el backend (P0) solo hay que poner las variables; el
  enlace "Ingresar" se vuelve a agregar en ese momento.
**Seguridad.md** — S2: la exposición en `/login` queda cerrada; el hallazgo sigue **abierto**
por las credenciales en el repo hasta C03. S8: sin cambios (C02).
**Otras páginas** — Paneles-Y-Vistas: donde describa `/login`, agregar "Sin variables de Supabase
muestra un aviso ('El acceso al panel se activa con tu implementación') con CTA a WhatsApp; el
formulario solo aparece con backend configurado". Cuentas-y-Accesos: en la tabla de cuentas
sembradas, la nota "visible en `/login`" ya no aplica.
**log.md** — `## [2026-09-20] ingest | C01: se quita "Ingresar" y /login degrada sin backend`
- Nav, menú móvil y footer sin "Ingresar" (`grep href="/login"` en marketing = 0).
- `/login` partido en Server Component + `login-form.tsx`; `src/lib/env.ts` con `hasSupabaseEnv()`.
- Verificado con dos builds: con variables falsas hay formulario; sin variables hay aviso y 200.
- QA de navegador en 375/768/1440 sobre `/`, `/login`, `/terminos`, `/privacidad` sin hallazgos.

### C02 · Ruta privada sin anunciar · commit (ver estado, it. 3) · despliegue (ver estado)
**Pendientes.md** — cerrar en P3: "S8 Retirar o reubicar `/acceso-galodev-9f3a`" pasa a
**mitigado** (ya no se anuncia en robots.txt, lleva noindex/nofollow por meta y por cabecera
`X-Robots-Tag`, y no está en el sitemap); la reubicación completa queda para cuando se encienda
el backend. Ítem nuevo: ninguno.
**Decisiones.md** — ninguna.
**Seguridad.md** — S8: de "Media · a la vista en un repo público" a "Media · mitigado
2026-09-20: fuera de robots.txt, noindex por meta y cabecera, fuera del sitemap. Sigue en el
código público; la protección real continúa siendo el rol en /admin".
**Otras páginas** — Cuentas-y-Accesos, sección "Acceso del super admin": agregar "No aparece en
robots.txt ni en el sitemap y responde noindex/nofollow (meta + `X-Robots-Tag`)".
Arquitectura-Y-Base-De-Datos (si menciona `next.config.mjs`): ahora define `headers()` con
`X-Robots-Tag` para `/login`, `/register` y la ruta privada.
**log.md** — `## [2026-09-20] ingest | C02: ruta privada fuera de robots y rutas de acceso con noindex`
- `robots.ts` ya no lista la ruta privada; `/login`, `/register` y la ruta privada llevan noindex.
- `next.config.mjs` añade `X-Robots-Tag: noindex, nofollow` (cubre la 307 de `/register`).
- Verificado con curl sobre `next start`: robots sin "acceso", metas y cabeceras presentes, sitemap limpio.

### C03 · Credenciales fuera del repo · commit (ver estado, it. 4) · despliegue (ver estado)
**Pendientes.md** — cerrar en "L — Fachada de venta": "Sacar las contraseñas semilla del repo y
de `/login` (S2)" → **cerrado 2026-09-20** (C01 + C03). Cerrar también en P0 la parte
"`schema.sql` sin cuentas semilla" del ítem "Proyecto Supabase + schema.sql sin cuentas semilla
+ variables en Vercel" (queda pendiente crear el proyecto y las variables). Ítem nuevo en "Datos
que esperan a Steven": "Si alguna vez se corrió `schema.sql` en una BD real, cambiar la
contraseña de esas cuentas: la antigua está en el historial público del repo".
**Decisiones.md** — D-018 · Las semillas de usuarios viven en `seed.dev.sql`, nunca en `schema.sql`.
- Fecha: 2026-09-20 · Estado: aceptada · Fuente: revisión independiente 2026-09-20 (S2).
- Contexto: `schema.sql` creaba dos usuarios con una contraseña escrita en el archivo y en la
  documentación de un repo público.
- Decisión: `schema.sql` no crea usuarios, correos ni contraseñas. `supabase/seed.dev.sql`
  (solo desarrollo) crea super admin + demo con la contraseña pasada por `-v seed_password` y
  aborta si falta; correos por defecto `admin@datafud.test` / `demo@datafud.test`. En
  producción el super admin se crea a mano en Supabase. La contraseña antigua se considera
  quemada: no se reutiliza. No se reescribe el historial de git.
- Consecuencias: `verify.sql` tiene una parte 2 que solo aplica con el seed; README, PRODUCT y
  USER_MANUAL explican el flujo; D-009 (schema único idempotente) sigue vigente para el esquema.
**Seguridad.md** — S2: **cerrado en el repo** (sin contraseñas en archivos vigentes; `/login`
sin cuenta demo). Queda la acción operativa: si esa contraseña se usó en alguna BD real,
cambiarla. Actualizar el "Arreglo sugerido 1" como hecho salvo esa acción y la decisión de repo
privado (pendiente de Steven).
**Otras páginas** — Cuentas-y-Accesos, tabla "Cuentas sembradas por `schema.sql`": reemplazar por
"`schema.sql` ya no siembra cuentas. `seed.dev.sql` (solo desarrollo) crea
`admin@datafud.test` (super_admin) y `demo@datafud.test` (restaurant_admin del tenant `demo`)
con la contraseña que se pase por psql". Arquitectura-Y-Base-De-Datos: donde describa
`schema.sql` y sus semillas, indicar que las semillas de usuarios/tenant demo están en
`seed.dev.sql` y que `schema.sql` solo siembra monedas y planes. Guia-De-Desarrollo: comando
de seed `psql "$DBURL" -v seed_password='…' -f supabase/seed.dev.sql`.
**log.md** — `## [2026-09-20] ingest | C03: semillas de usuarios fuera de schema.sql (seed.dev.sql)`
- Sección 10 de `schema.sql` movida a `supabase/seed.dev.sql`; contraseña por variable de psql con guardas.
- `schema.sql` sin usuarios ni correos; `verify.sql` con parte 2 condicionada al seed.
- README, PRODUCT, USER_MANUAL, spec y plan de fase 0 sin la contraseña; aviso de contraseña quemada en README.
- `grep` de la contraseña antigua en el repo = 0. Sin BD disponible: el SQL no se ejecutó (revisión línea a línea).

### C04 · Formulario resistente a abuso · commit (ver estado, it. 5) · despliegue (ver estado)
**Pendientes.md** — ítem nuevo en "Datos que esperan a Steven": "Opcional: crear un sitio en
Cloudflare Turnstile y poner `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY` en
Vercel (+ redeploy) si el formulario recibe spam; sin eso ya hay honeypot, trampa de tiempo y
tope de enlaces". En P1, "S5 Captcha + verificación de correo en /register": anotar que el
formulario de contacto ya soporta Turnstile opcional; /register sigue cerrado.
**Decisiones.md** — D-019 · Anti-abuso del formulario sin infraestructura nueva.
- Fecha: 2026-09-20 · Estado: aceptada · Fuente: revisión independiente 2026-09-20.
- Decisión: honeypot + trampa de tiempo medida en el cliente (< 3 s o > 2 h se descarta en
  silencio) + máximo 2 enlaces por mensaje; Cloudflare Turnstile solo si están sus dos
  variables. Nada de esto añade dependencias ni servicios obligatorios.
- Consecuencias: los envíos sin JavaScript se descartan (el formulario ya dependía de JS para
  mostrar estados); si aparece spam, activar Turnstile es poner dos variables.
**Seguridad.md** — agregar hallazgo nuevo cerrado: "S14 · Media · Formulario de contacto sin
protección anti-bots → cerrado 2026-09-20 (honeypot, trampa de tiempo, tope de URLs, Turnstile
opcional)". S5 sin cambios (aplica a /register cuando vuelva a abrirse).
**Otras páginas** — Cuentas-y-Accesos, tabla de variables: agregar `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
y `TURNSTILE_SECRET_KEY` (opcionales, formulario de contacto) junto a `RESEND_API_KEY` y
`RESEND_FROM_EMAIL`. Arquitectura-Y-Base-De-Datos: `src/lib/turnstile.ts` y
`turnstile-widget.tsx` como piezas del formulario.
**log.md** — `## [2026-09-20] ingest | C04: formulario de contacto resistente a abuso`
- Trampa de tiempo en el cliente (`elapsedMs`), tope de 2 enlaces, Turnstile opcional por variables.
- Probado con clave falsa de Resend: envío a 1 s se descarta en silencio (log), envío a 3,5 s llega a Resend, 3 URLs se rechazan.
- Sin claves de Turnstile no se carga ningún script; sin `RESEND_API_KEY` la sección sigue sin formulario.

### C05 · Copy honesto · commit (ver estado, it. 6) · despliegue (ver estado)
**Pendientes.md** — ítem nuevo en "Datos que esperan a Steven": "Decidir si el eslogan 'El menú
digital que abre apetito y cierra ventas' se mantiene (es identidad de marca) o se reemplaza por
uno sin promesa de resultado". Nada que cerrar.
**Decisiones.md** — D-020 · Sin promesas de resultado en la landing.
- Fecha: 2026-09-20 · Estado: aceptada · Fuente: revisión independiente 2026-09-20.
- Decisión: la landing describe lo que el producto hace, no lo que va a lograr. Fuera "más
  estrellas", "más mesas llenas", "vende más", "llenar mesas"; los planes nombran las funciones
  reales (ventas por día, ticket promedio, platillos más vendidos) y el soporte sin adjetivos
  que impliquen tiempos de respuesta no definidos. El eslogan de marca queda a decisión de Steven.
- Consecuencias: MARKETING §9 incorpora la regla; el grep de la puerta E de los loops incluye
  esas frases.
**Seguridad.md** — sin cambios.
**Otras páginas** — Marca-Y-Marketing: en "Mensajes clave" y "Voz", agregar la regla "sin
promesas de resultado" y actualizar la tabla de planes si la reproduce (reportes y soporte con
el texto nuevo). Producto-Y-Modelo-De-Negocio: fila de reportes de Empresarial = "ventas por
día, ticket promedio y platillos más vendidos"; soporte = "WhatsApp en horario de oficina"
(Estándar) / "WhatsApp con contacto directo" (Empresarial). Plan-Landing-First: en la tabla de
hardware, el stand de reseñas "lleva directo a dejar la reseña" (quitar "para subir
valoraciones").
**log.md** — `## [2026-09-20] ingest | C05: copy de la landing sin promesas de resultado`
- 8 textos cambiados (stand de reseñas, act-break, planes Estándar y Empresarial); lista antes → después en el estado del loop.
- MARKETING §6 y §9 y PRODUCT §8 alineados; `PRICING.trialDays` eliminado por no usarse.
- El eslogan "abre apetito y cierra ventas" se conserva como identidad de marca, pendiente de decisión de Steven.

### C06 · QA sin peso en producción · commit (ver estado, it. 7) · despliegue (ver estado)
**Pendientes.md** — en P2, el ítem "Tests de aislamiento entre tenants + Playwright del flujo
QR → orden → cocina": anotar que ya existe `npm run qa:landing` (Playwright) para la landing;
el flujo QR → orden sigue pendiente. Nada que cerrar.
**Decisiones.md** — D-021 · Lighthouse no es dependencia del repo; el QA de la landing es un script versionado.
- Fecha: 2026-09-20 · Estado: aceptada · Fuente: revisión independiente 2026-09-20.
- Decisión: `lighthouse` sale de `devDependencies` (se corre con `npx lighthouse@13` cuando
  haga falta); `@playwright/test` se queda y `scripts/qa-landing.mjs` (`npm run qa:landing`)
  reúne las comprobaciones de navegador de los loops.
- Consecuencias: `npm ci` instala 96 paquetes menos; cualquier sesión puede repetir la puerta G
  con un comando; las capturas van a `.qa/` (ignorada).
**Seguridad.md** — sin cambios.
**Otras páginas** — Guia-De-Desarrollo: agregar `npm run qa:landing` a los comandos y una línea
sobre `.qa/` y `QA_CHROMIUM`. Arquitectura-Y-Base-De-Datos (dependencias): quitar `lighthouse`
de las de desarrollo si las lista.
**log.md** — `## [2026-09-20] ingest | C06: QA de la landing como script versionado, sin lighthouse`
- `scripts/qa-landing.mjs` + `npm run qa:landing`: 3 tamaños, consola, requests, anclas, CTAs, teclado, rutas.
- `lighthouse` eliminado de devDependencies; `npm ci && npm run build` en verde.
- Corrida completa en 32 s: OK con 3 avisos (fotos remotas que no cargan en el sandbox).

### C07 · CLAUDE.md en el repo · commit (ver estado, it. 8) · despliegue (ver estado)
**Pendientes.md** — cerrar en "L — Fachada de venta": "Copiar `CLAUDE.md` al repo y crear la
rama `feat/landing-ventas`" → la parte de `CLAUDE.md` **cerrada 2026-09-20** (la rama no
aplica: los loops publican directo en `main` desde la rama de sesión).
**Decisiones.md** — D-016 · Protocolo de alineación repo → vault (formalizado en `CLAUDE.md`).
- Fecha: 2026-09-20 · Estado: aceptada · Fuente: Steven (prompt del loop de correcciones).
- Decisión: toda sesión que cambie código, oferta, seguridad o decisiones deja un bloque en
  `docs/vault-sync/AAAA-MM-DD-<tema>.md` (Pendientes, Decisiones, Seguridad, otras páginas, log)
  o actualiza el vault directo si tiene acceso; una unidad sin su bloque no está terminada.
- Consecuencias: el vault deja de depender de que alguien recuerde sincronizar; `CLAUDE.md`
  lo exige a todas las sesiones futuras.
**Seguridad.md** — sin cambios de estado. `CLAUDE.md` deja escritas como reglas S1 (vistas con
`security_invoker`, aún no aplicado) y S10 (Zod en todas las Server Actions, aún no en paneles).
**Otras páginas** — Claude-Code/CLAUDE-repo: pasa de `estado: pendiente` a `estado: activo`;
reemplazar el bloque propuesto por una nota "ya está en el repo (commit de C07); el archivo vivo
manda" y enlazar el protocolo de vault-sync. Claude-Code/Flujo-Obsidian-Claude-Code: en
"Montaje", el paso 2 ("`CLAUDE.md` en la raíz del repo") queda hecho; agregar el paso "las
sesiones en la nube dejan `docs/vault-sync/…` y Cowork lo aplica con 'sincronizá el vault'".
Guia-De-Desarrollo: referenciar `CLAUDE.md` como fuente de reglas y comandos.
**log.md** — `## [2026-09-20] ingest | C07: CLAUDE.md en el repo con el protocolo de alineación con el vault`
- `CLAUDE.md` (111 líneas): etapa, comandos, mapa, 11 reglas, convenciones, trampas y protocolo de vault-sync.
- Cada afirmación verificada contra el código; S1 y S10 quedan señalados como pendientes, no como hechos.
- La página CLAUDE-repo del vault pasa a activa y deja de ser la copia maestra.

### C08 · Verificación final y pulido · pasada 1 · commit (ver estado, it. 9) · despliegue (ver estado)
**Pendientes.md** — nada que cerrar; ítem nuevo en P3: "Quitar `backdrop-blur` de
`menu-client.tsx` y `preview/page.tsx` (regla de marca) cuando se toquen esas rutas".
**Decisiones.md** — ninguna.
**Seguridad.md** — sin cambios.
**Otras páginas** — ninguna.
**log.md** — `## [2026-09-20] ingest | C08 pasada 1: verificación de las correcciones`
- `/login` con landmark `<main>` (Lighthouse a11y 100). Performance de `/` 95/95 en dos corridas.
- `npm run qa:landing` OK en 375/768/1440; grep de honestidad ampliado = 0.
- Rúbrica ≥ 4 en los 11 criterios; queda la pasada 2 con lectura fresca de los archivos.

### C08 · Verificación final · pasada 2 · commit 3efb23e (sin cambios de código) · despliegue READY
**Pendientes.md** — nada. **Decisiones.md** — ninguna. **Seguridad.md** — sin cambios.
**Otras páginas** — ninguna.
**log.md** — `## [2026-09-20] ingest | C08 pasada 2: lectura fresca sin hallazgos altos ni medios`
- Releídos los 16 archivos tocados; 4 notas bajas aceptadas; rúbrica ≥ 4 en 11 criterios.

### C09 · Informe final y cierre · commit (este archivo) · despliegue (ver estado)
**Pendientes.md** — ver el resumen de arriba (cierra el loop). **Decisiones.md** — ninguna nueva.
**Seguridad.md** — sin cambios. **Otras páginas** — ver el resumen de arriba.
**log.md** — `## [2026-09-20] ingest | Cierre del loop de correcciones (C01–C09)`
- Informe en `docs/plans/correcciones-loop-report.md`; CHANGELOG "Unreleased" actualizado.
- 11 iteraciones, 10 commits en `main`, todos desplegados (READY) en Vercel.
- Puente subido al nodo Datafud de Drive; páginas del vault pendientes de "sincronizá el vault".
