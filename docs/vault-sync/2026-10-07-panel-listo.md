# Vault-sync · Panel listo antes de la oleada (1.6.0) · 2026-10-07

> Puente al vault **local** (`..\obsidian\Cerebro2.0\02-Proyectos\Datafud\`). Sesión local: aplicado
> directo a las páginas del nodo y a la cola de GaloDeVibes. Todo está en la rama `panel-listo`, sin
> empujar ni desplegar. Fuera de este puente quedan, a propósito, `Decisiones.md` (ninguna decisión
> nueva: la última sigue siendo D-063) y el log maestro del vault.

### P01 · Editar platillos desde el panel · commit afd6a05 · despliegue pendiente (rama `panel-listo`, sin empujar)
**Pendientes.md** — Cerrar «updateProduct y su formulario» (`· hecho 2026-10-07`) en la cola de GaloDeVibes y «**Desarrollo:** `updateProduct` + formulario» en el detalle. Sin ítems nuevos. Los mensajes de límite de plan ya se mostraban en la UI.
**Decisiones.md** — ninguna.
**Seguridad.md** — sin cambios.
**Otras páginas** — `Producto-Y-Modelo-De-Negocio.md`: «Editar platillos y precios desde el panel · **No existe**…» pasa a «Existe: botón «Editar» en cada platillo (nombre ES/EN/PT, descripción, categoría, precio, foto y orden; `afd6a05`, 1.6.0)».
**log.md** — `## [2026-10-07] ingest | Panel listo antes de la oleada (1.6.0)` (una sola entrada para P01 a P05, ver el bloque P05).
Aplicado en vault: sí

### P02 · Fotos de platillos y logo con Storage · commits 97772a1, d4884d8 · despliegue: esquema (sección 12) aplicado en producción el 2026-10-07; código pendiente
**Pendientes.md** — La línea «Storage para fotos y logo; tablero de comandas con refresco» (cola y detalle) se reescribe, por única vez, a «Storage para fotos y logo: probar la subida en la oleada · ~15m · trámite»: Steven aplicó la sección 12 de `schema.sql` y `verify.sql` dio todo true, así que ya no se pide aplicar nada; queda una subida real. No se cierra. El refresco del tablero ya estaba desde `4cbf188`.
**Decisiones.md** — ninguna.
**Seguridad.md** — sin hallazgo nuevo. Postura del backend: bucket `media` con políticas por negocio; `authenticated` solo tiene `media_tenant_insert/update/delete` en `storage.objects` (confirmado por Steven).
**Otras páginas** — `Producto-Y-Modelo-De-Negocio.md`: «Fotos y logo en el panel · Sin subida» pasa a «Existe en el código (1.6.0)…; el bucket está aplicado en producción; falta probar una subida real». `Arquitectura-Y-Base-De-Datos.md`: «Lo que el plan de 15 días tiene que construir» pasa a lo ya construido más lo que falta (`/c` → `/m`).
**log.md** — ver P05.
Aplicado en vault: sí

### P03 · Prueba de aislamiento entre dos negocios · commits a16ede9, caf95e9 · despliegue no aplica (script local)
**Pendientes.md** — La línea «Security Advisor, prueba de aislamiento con dos tenants y volver a enlazar «Ingresar»» sigue abierta y **sin cambiar su texto** (la app de GaloDeVibes la identifica por él). En el detalle se anota que `scripts/prueba-aislamiento.mjs` existe (salida 0 ok, 1 falla, 2 entorno ausente o interrumpido, 3 incompleto) y que falta correrlo en producción con dos usuarios de prueba. El Security Advisor sigue sin correrse: el proyecto Datafud no es alcanzable desde la cuenta de Supabase conectada a Claude; lo corre Steven a mano.
**Decisiones.md** — ninguna.
**Seguridad.md** — sin cambios de S#; el script es el paso 4 de la oleada (D-018).
**Otras páginas** — ninguna.
**log.md** — ver P05.
Aplicado en vault: sí

### P04 · S15: las referencias entre tablas no cruzan de un negocio a otro · commit ba9cfcb · despliegue: sección 13 de `schema.sql` en aplicación por Steven; falta confirmar `verify.sql` 22 a 26
**Pendientes.md** — Ítem nuevo en el detalle (no en la cola): confirmar `verify.sql` filas 22 a 26 en producción y correr la prueba de aislamiento (sección 2b). Si la fila 25 no da 0, correr la consulta del aviso `WARNING: S15:`, corregir las filas y volver a correr `schema.sql`.
**Decisiones.md** — ninguna.
**Seguridad.md** — hallazgo nuevo **S15** (media): las FK entre tablas de negocio no validaban el negocio (B creaba filas que apuntaban a filas de A; el tope por mesa de `place_order` contaba órdenes de otro negocio; borrados de A tocaban filas de B). Revisión del 2026-10-07. Estado: **cerrado en código; pendiente de confirmar `verify.sql` 22–26 en producción**. FK compuestas `(tenant_id, col)` → `(tenant_id, id)` en `products.category_id`, `orders.table_id`, `order_items.order_id` y `order_items.product_id`; el tope por mesa filtra por negocio.
**Otras páginas** — ninguna.
**log.md** — ver P05.
Aplicado en vault: sí

### P05 · Release 1.6.0 y alineación del vault · commit 34506a4 · despliegue pendiente (rama `panel-listo`, sin empujar)
**Pendientes.md** — Cerrar «P0 · Paneles con sesión fallan en Vercel» en la cola como `· hecho 2026-10-03` (`6382835`; el detalle ya lo tenía cerrado). Estado de `Pendientes.md` reescrito al 2026-10-07 y entrada en Cerrados.
**Decisiones.md** — ninguna (la última es D-063; el hub y el índice decían 62).
**Seguridad.md** — S15 y la línea de Storage de P02/P04.
**Otras páginas** — `Datafud.md` (versión 1.6.0, 63 decisiones D-001…D-063), `index.md` (decía 1.4.1; decisiones 63), `Producto-Y-Modelo-De-Negocio.md` (filas «Tablero de comandas», «Editar platillos», «Alta del local», «Fotos y logo» y «Reportes», más «Pedidos desde la mesa»), `Arquitectura-Y-Base-De-Datos.md`.
**log.md** — `## [2026-10-07] ingest | Panel listo antes de la oleada (1.6.0)`
- Versión 1.6.0 en `package.json` y `package-lock.json`; el CHANGELOG pasa «Unreleased» a `[1.6.0] — 2026-10-07` y junta las dos secciones `Security` en una.
- Entran editar platillos (`afd6a05`), Storage con fotos y logo (`97772a1`, `d4884d8`), la prueba de aislamiento (`a16ede9`, `caf95e9`) y S15 (`ba9cfcb`).
- Cola de GaloDeVibes: cerradas «updateProduct…» y «P0 · Paneles…»; Storage reescrita a «probar la subida»; la de Security Advisor sigue abierta.
- Corregido lo desactualizado del nodo (versión 1.4.1 y 62 decisiones en hub e índice; filas de prometido frente a construido).
- Verificado: `typecheck`, `lint` y `build` en verde; `lint-vault.mjs` con 0 problemas.
Aplicado en vault: sí
