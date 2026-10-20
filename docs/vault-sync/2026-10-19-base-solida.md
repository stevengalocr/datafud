# Vault-sync · Base sólida (1.9.0) · 2026-10-19

> Puente al vault **local** (`..\obsidian\Cerebro2.0\02-Proyectos\Datafud\`). Sesión local: aplicado
> directo a las páginas del nodo. Rama `base-solida-2026-10-19` sobre `main` @ `d94ab43` (1.8.0), del
> loop «base sólida» que pidió Steven el 2026-10-19 (hacer todo el código que no depende de él).
> **Sin cambios de esquema:** `schema.sql` sigue en 1.7.0; no hay que correr nada en el SQL Editor.
> Release 1.9.0 squash-mergeado a `main` **local, sin empujar**: el push a `main` despliega en
> datafud.com y espera el visto bueno de Steven. Los hashes de cada bloque son de la rama de trabajo
> (queda local, sin empujar). Detalle en `docs/CHANGELOG.md` `## [1.9.0]`.

### B1 · La contraseña temporal del dueño se cambia en el primer ingreso · commit d09bc0f · despliegue pendiente (main local)
**Pendientes.md** — Nuevo y cerrado en el código: «Cambio obligado de la contraseña temporal» (hallazgo Media de `Equipo/Sistemas-Seguridad.md`). Para Steven, en la oleada: crear un local de prueba y entrar con su contraseña temporal; el panel tiene que llevar a Configuración hasta cambiarla.
**Decisiones.md** — ninguna (la marca vive en `user_metadata` para no usar `service_role` fuera de `createTenant`, regla 5; el dueño puede quitarla él mismo, es un empujón y no una barrera frente al dueño).
**Seguridad.md** — nota en S16 / auditoría base: la contraseña que viaja por WhatsApp deja de servir en el primer ingreso. Los locales creados antes de 1.9.0 («test», «test3») no quedan marcados.
**Otras páginas** — `Paneles-Y-Vistas.md`: el panel del restaurante lleva a Configuración mientras el dueño tenga la contraseña temporal.
**log.md** — ver B6.
Aplicado en vault: sí

### B2 · Prueba automática del SQL (schema.sql dos veces, verify.sql 51/51 y aislamiento por RLS) · commit b83b97c · despliegue pendiente (main local)
**Pendientes.md** — En P2, «tests de aislamiento» queda hecho a nivel de esquema (`npm run test:esquema`, también en la CI); la prueba con dos locales reales en producción (`scripts/prueba-aislamiento.mjs`) sigue siendo de Steven.
**Decisiones.md** — ninguna.
**Seguridad.md** — sin cambios de estado; el aislamiento por RLS ya tiene prueba que corre en cada push.
**Otras páginas** — `Arquitectura-Y-Base-De-Datos.md` y `Equipo/Sistemas-Datos.md`: ya no es cierto «El SQL no tiene prueba automática» ni «Sin tests unitarios ni CI».
**log.md** — ver B6.
Aplicado en vault: sí

### B3 · Acciones de la CI fijadas por hash · commit 3e14262 · despliegue pendiente (main local)
**Pendientes.md** — Cerrar el hallazgo Baja de `Equipo/Sistemas-Seguridad.md` («Las acciones de la CI van fijadas por etiqueta»). Dependabot sigue siendo decisión de Steven.
**Decisiones.md** — ninguna.
**Seguridad.md** — sin cambios.
**Otras páginas** — ninguna.
**log.md** — ver B6.
Aplicado en vault: sí

### B4 · Sitemap con la fecha real de cada página · commit da84582 · despliegue pendiente (main local)
**Pendientes.md** — Cerrar el hallazgo Baja de `Equipo/Sistemas-Frontend.md` («El sitemap pone la fecha del build»).
**Decisiones.md** — ninguna.
**Seguridad.md** — sin cambios.
**Otras páginas** — ninguna.
**log.md** — ver B6.
Aplicado en vault: sí

### B5 · Plan del doble factor del super admin · commit b434223 · despliegue n/a (documento)
**Pendientes.md** — La línea «Doble factor del super admin» apunta al plan `docs/plans/2026-10-19-doble-factor-super-admin.md`: la base exige `aal2` solo con un factor verificado; necesita release con `schema.sql` aplicado. Orden: Steven confirma TOTP en Supabase, aplica el esquema, merge, se inscribe.
**Decisiones.md** — ninguna (propuesta; la decide Steven al aprobar el release).
**Seguridad.md** — S16 sigue parcial; el arreglo queda planeado.
**Otras páginas** — ninguna.
**log.md** — ver B6.
Aplicado en vault: sí

### B6 · Vault, cola y auditoría al día · commit (este archivo) · despliegue n/a
**Pendientes.md** — los cierres de B1 a B4 y las tareas de Steven ordenadas por impacto, con su línea en la cola de GaloDeVibes (sección Datafud).
**Decisiones.md** — ninguna.
**Seguridad.md** — ver B1 y B5.
**Otras páginas** — `Equipo/CEO.md` y `01-GaloDev/Mesa/CEO-Datafud.md` con la foto del día; `Equipo/Sistemas-Seguridad.md`, `Sistemas-Datos.md` y `Sistemas-Frontend.md` con lo resuelto marcado; ESTADO `2026-10-13-Datafud-Panel-Listo` con la casilla nueva del push; `Datafud.md` (dónde está el proyecto) y `Ficha-Tecnica.md` (CI con las tres pruebas y la trampa de la marca `must_change_password`); `Arquitectura-Y-Base-De-Datos.md` (versiones y pruebas). Lint del vault: OK · 289 páginas · 0 problemas.
**log.md** — `## [2026-10-19] ingest | Base sólida`: contraseña temporal obligada, prueba del SQL en la CI, acciones por hash, sitemap con fechas reales, plan del doble factor; typecheck, lint, las tres pruebas y build en verde; 1.9.0 en `main` local sin empujar.
Aplicado en vault: sí
