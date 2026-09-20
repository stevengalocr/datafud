# Vault-sync · Correcciones post-revisión de la landing · 2026-09-20

> Cola de entrada para el vault de Obsidian (`02-Proyectos/Datafud/`). Cada unidad del loop de
> correcciones agrega su bloque abajo. Se aplica tal cual en Pendientes, Decisiones, Seguridad,
> las páginas que se nombren y el log del nodo (formato del `CLAUDE.md` del vault:
> `## [AAAA-MM-DD] ingest | Título`). El resumen "qué cambiar en cada página" se agrega arriba
> de todo al cerrar el loop (C09).

Aplicado en vault: no (esta sesión tiene Drive por MCP; se aplica en bloque al cerrar C09).

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
- `grep Datfud2026` en el repo = 0. Sin BD disponible: el SQL no se ejecutó (revisión línea a línea).
