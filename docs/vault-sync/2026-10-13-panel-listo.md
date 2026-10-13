# Vault-sync · Panel listo (1.8.0) · 2026-10-13

> Puente al vault **local** (`..\obsidian\Cerebro2.0\02-Proyectos\Datafud\`). Sesión local: aplicado
> directo a las páginas del nodo. Rama `panel-listo-1-8` sobre `main` @ `d848f63` (1.7.0). **Sin
> cambios de esquema:** `schema.sql` sigue en 1.7.0 y no hay que correr nada en el SQL Editor antes del
> merge. El release es un squash-merge a `main` con el visto bueno de Steven; hasta entonces, sin
> desplegar. Detalle en `docs/CHANGELOG.md` `## [1.8.0]`. ESTADO del loop:
> `00-Sistema/Loops/2026-10-13-Datafud-Panel-Listo-ESTADO.md`.

### T1 · Pasar una Carta al sistema y mover su código impreso · commit f6c53ca · despliegue sin desplegar (rama panel-listo-1-8)
**Pendientes.md** — Cerrar «Migrar la carta de `/c/<slug>` a `/m/<tenant>/<mesa>` y cambiar su `/q/<código>`» como **hecho en el código** (2026-10-13, 1.8.0): «Pasar una Carta al sistema» en `/admin/tenants` copia menú, fotos, logo, colores, moneda e idiomas a un local con el menú vacío y crea la mesa del stand; `scripts/qr-mover.mjs` mueve el código. Nuevo, para Steven en la oleada: probarlo pasando la carta `ejemplo` a un local de prueba vacío (por ejemplo uno nuevo, «prueba-carta», en Estándar) y abrir la carta de la mesa en el teléfono.
**Decisiones.md** — ninguna (es el día 11 del plan de 15 días de `OFERTA.md` §4; corre con la sesión del super admin y RLS, sin `service_role`, como pide la regla 5).
**Seguridad.md** — sin cambios. La acción verifica el rol en el servidor, solo baja fotos del propio sitio (origen fijo, rutas `/cartas` o `/demo`, sin redirecciones, 2 MB y tipo comprobado) y la carpeta de Storage sale del local elegido, nunca del navegador.
**Otras páginas** — `Paneles-Y-Vistas.md`: en el super admin, Restaurantes suma «Pasar una Carta al sistema». `Entrega-De-Una-Carta.md`: el paso a sistema ya tiene pantalla y script.
**log.md** — ver T6.
Aplicado en vault: sí

### T2 · Logo con fondo transparente · commit df6b3ca · despliegue sin desplegar (rama panel-listo-1-8)
**Pendientes.md** — Cerrar «P3 · Logo en PNG transparente o SVG para las pantallas de acceso (hoy se ve la placa blanca)» (2026-10-13, 1.8.0): `public/logo-main-transparente.png` en el acceso, la carta no disponible y la barra de la landing.
**Decisiones.md** — ninguna.
**Seguridad.md** — sin cambios.
**Otras páginas** — ninguna.
**log.md** — ver T6.
Aplicado en vault: sí

### T3 · CI mínima en GitHub Actions · commit 4493f55 · despliegue sin desplegar (rama panel-listo-1-8)
**Pendientes.md** — En «P1 · P2 · P3», P2: «GitHub Actions» queda hecho (typecheck, lint, `npm run test:carta` y build en cada push y pull request, sin secretos); siguen abiertos Dependabot y Sentry.
**Decisiones.md** — ninguna.
**Seguridad.md** — sin cambios.
**Otras páginas** — `Ficha-Tecnica.md`: comandos (`npm run test:carta`) y la CI.
**log.md** — ver T6.
Aplicado en vault: sí

### T4 · Política de contenido aplicada en las rutas públicas · commit c3a69d8 · despliegue sin desplegar (rama panel-listo-1-8)
**Pendientes.md** — «Revisar en producción la política de contenido en modo observación… antes de hacerla efectiva» queda **hecho para las rutas públicas** (2026-10-13): 17 rutas en escritorio y teléfono, cero avisos; se aplica desde 1.8.0. Sigue abierto para los paneles, el acceso y la carta de mesa, en la oleada con sesión y un pedido real (la consola del navegador en esas pantallas).
**Decisiones.md** — **D-068** · La política de contenido se aplica en las rutas públicas; los paneles, el acceso y `/m` siguen en observación. Contexto: D-067 pedía revisarla en producción antes de aplicarla; las rutas públicas se pudieron revisar sin sesión. Decisión: política completa aplicada en las rutas públicas y en Report-Only en `PANEL_PATHS`. Consecuencias: una ruta pública nueva que cargue algo de otro origen tiene que sumarlo a la política o se bloquea; los paneles pasan a modo estricto después de la oleada.
**Seguridad.md** — **S18**: la política de contenido se aplica en las rutas públicas (1.8.0, D-068); queda en observación en los paneles, el acceso y la carta de mesa hasta la oleada.
**Otras páginas** — `Ficha-Tecnica.md`: trampa nueva sobre `PANEL_PATHS` y el orden de `headers()`.
**log.md** — ver T6.
Aplicado en vault: sí

### T6 · Vault, cola de GaloDeVibes y ESTADO · commit (este archivo) · despliegue sin desplegar
**Pendientes.md** — lo de T1 a T4. Cola de GaloDeVibes («Panel de administración listo»): cerrar «Carta de /c/<slug> a /m/<tenant>/<mesa> · ~3h» con fecha; nota en «Revisar en producción la política de contenido…»; nota en P3 del logo (cerrado) y en P2 (CI hecha).
**Decisiones.md** — D-068 (ver T4).
**Seguridad.md** — S18 (ver T4).
**Otras páginas** — `Ficha-Tecnica.md`: estado actual 1.8.0 en la rama y trampas 21 a 23.
**log.md** — `## [2026-10-13] ingest | Panel listo 1.8.0: la Carta pasa al sistema, logo sin placa, CI y la política aplicada` con lo de arriba y cómo se verificó (typecheck, lint, `test:carta` y build en verde; la carta `ejemplo` pasa la validación con 5 categorías, 14 platillos y 15 fotos, todas bajadas de producción; barrido de la política en producción y en local con cero avisos; capturas de `/login` y de la landing).
Aplicado en vault: sí
