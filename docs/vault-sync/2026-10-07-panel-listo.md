# Vault-sync · Panel listo antes de la oleada (1.6.0) y pulido (1.6.1) · 2026-10-07

> Puente al vault **local** (`..\obsidian\Cerebro2.0\02-Proyectos\Datafud\`). Sesión local: aplicado
> directo a las páginas del nodo y a la cola de GaloDeVibes. **El código de 1.6.0 está desplegado en
> producción desde el 2026-10-07** (`main` @ `462aa6a`, deployment de Vercel
> `dpl_HGBnnrdiJpE3Dk4SxuXRVy1x3Ffr`, en estado READY en `datafud.com`); el esquema (secciones 12 y 13
> de `schema.sql`) ya lo había aplicado Steven. **1.6.1** (`main` @ `a0ac854`, deployment
> `dpl_CYs9FAg9YFHcdNHw4MsbDLSWSPTN`, READY el mismo día) está en el bloque P06. Fuera de este puente quedan, a propósito, `Decisiones.md` (ninguna decisión
> nueva: la última sigue siendo D-063) y el log maestro del vault.

### P01 · Editar platillos desde el panel · commit afd6a05 · despliegue en producción 2026-10-07 (dpl_HGBnnrdiJpE3Dk4SxuXRVy1x3Ffr, main @ 462aa6a)
**Pendientes.md** — Cerrar «updateProduct y su formulario» (`· hecho 2026-10-07`) en la cola de GaloDeVibes y «**Desarrollo:** `updateProduct` + formulario» en el detalle. Sin ítems nuevos. Los mensajes de límite de plan ya se mostraban en la UI.
**Decisiones.md** — ninguna.
**Seguridad.md** — sin cambios.
**Otras páginas** — `Producto-Y-Modelo-De-Negocio.md`: «Editar platillos y precios desde el panel · **No existe**…» pasa a «Existe: botón «Editar» en cada platillo (nombre ES/EN/PT, descripción, categoría, precio, foto y orden; `afd6a05`, 1.6.0)».
**log.md** — `## [2026-10-07] ingest | Panel listo antes de la oleada (1.6.0)` (una sola entrada para P01 a P05, ver el bloque P05).
Aplicado en vault: sí

### P02 · Fotos de platillos y logo con Storage · commit 97772a1 · despliegue en producción 2026-10-07 (dpl_HGBnnrdiJpE3Dk4SxuXRVy1x3Ffr, main @ 462aa6a); esquema (sección 12) aplicado por Steven el 2026-10-07
**Pendientes.md** — (Segundo commit de la unidad: `d4884d8`.) La línea «Storage para fotos y logo; tablero de comandas con refresco» (cola y detalle) se reescribe, por única vez, a «Storage para fotos y logo: probar la subida en la oleada · ~15m · trámite»: Steven aplicó la sección 12 de `schema.sql` y `verify.sql` dio todo true, así que ya no se pide aplicar nada; queda una subida real. No se cierra. El refresco del tablero ya estaba desde `4cbf188`.
**Decisiones.md** — ninguna.
**Seguridad.md** — sin hallazgo nuevo. Postura del backend: bucket `media` con políticas por negocio; `authenticated` solo tiene `media_tenant_insert/update/delete` en `storage.objects` (confirmado por Steven).
**Otras páginas** — `Producto-Y-Modelo-De-Negocio.md`: «Fotos y logo en el panel · Sin subida» pasa a «Existe en el código (1.6.0)…; el bucket está aplicado en producción; falta probar una subida real». `Arquitectura-Y-Base-De-Datos.md`: «Lo que el plan de 15 días tiene que construir» pasa a lo ya construido más lo que falta (`/c` → `/m`).
**log.md** — ver P05.
Aplicado en vault: sí

### P03 · Prueba de aislamiento entre dos negocios · commit a16ede9 · despliegue no aplica (script local)
**Pendientes.md** — (Segundo commit de la unidad: `caf95e9`.) La línea «Security Advisor, prueba de aislamiento con dos tenants y volver a enlazar «Ingresar»» sigue abierta y **sin cambiar su texto** (la app de GaloDeVibes la identifica por él). En el detalle se anota que `scripts/prueba-aislamiento.mjs` existe (salida 0 ok, 1 falla, 2 entorno ausente o interrumpido, 3 incompleto) y que falta correrlo en producción con dos usuarios de prueba. El Security Advisor sigue sin correrse: el proyecto Datafud no es alcanzable desde la cuenta de Supabase conectada a Claude; lo corre Steven a mano.
**Decisiones.md** — ninguna.
**Seguridad.md** — sin cambios de S#; el script es el paso 4 de la oleada (D-018).
**Otras páginas** — ninguna.
**log.md** — ver P05.
Aplicado en vault: sí

### P04 · S15: las referencias entre tablas no cruzan de un negocio a otro · commit ba9cfcb · despliegue en producción 2026-10-07 (dpl_HGBnnrdiJpE3Dk4SxuXRVy1x3Ffr, main @ 462aa6a); `schema.sql` (sección 13) aplicado por Steven el 2026-10-07 y `verify.sql` con las 27 filas en true
**Pendientes.md** — Ítem nuevo en el detalle (no en la cola): S15 aplicado en producción; falta correr la prueba de aislamiento con dos negocios (sección 2b) en la oleada.
**Decisiones.md** — ninguna.
**Seguridad.md** — hallazgo nuevo **S15** (media): las FK entre tablas de negocio no validaban el negocio (B creaba filas que apuntaban a filas de A; el tope por mesa de `place_order` contaba órdenes de otro negocio; borrados de A tocaban filas de B). Revisión del 2026-10-07. Estado: **cerrado y aplicado en producción el 2026-10-07 (`verify.sql` 22–26 en true); falta correr `prueba-aislamiento.mjs` con dos negocios en la oleada**. FK compuestas `(tenant_id, col)` → `(tenant_id, id)` en `products.category_id`, `orders.table_id`, `order_items.order_id` y `order_items.product_id`; el tope por mesa filtra por negocio.
**Otras páginas** — ninguna.
**log.md** — ver P05.
Aplicado en vault: sí

### P05 · Release 1.6.0 y alineación del vault · commit 34506a4 · despliegue en producción 2026-10-07 (dpl_HGBnnrdiJpE3Dk4SxuXRVy1x3Ffr, main @ 462aa6a)
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

### P06 · Pulido 1.6.1: menú, subida de fotos y prueba de aislamiento · commit a20d481 · despliegue en producción 2026-10-07 (dpl_CYs9FAg9YFHcdNHw4MsbDLSWSPTN, main @ a0ac854)
**Pendientes.md** — Líneas nuevas en la cola y el detalle, sin tocar el texto de las existentes: bajo «Panel de administración listo», «Oleada de pruebas en producción con el local «test»: panel, carta, pedido y fotos · ~1,5h»; bajo «Después», «Tope de almacenamiento por negocio y limpieza de fotos reemplazadas (política SELECT en Storage) · ~2h» e «Índice order_items (tenant_id, product_id) y filas nuevas de verify.sql para Storage · ~30m». Lo que 1.6.1 no pudo cerrar sin aplicar `schema.sql` (tope de almacenamiento, índice, filas de `verify.sql`) quedó así mapeado. La oleada necesita a Steven: crear el local test2, correr `scripts/prueba-aislamiento.mjs`, subir una foto y un logo PNG transparente desde el iPhone, hacer un pedido real y correr el Security Advisor en su panel de Supabase.
**Decisiones.md** — ninguna (la última sigue siendo D-063).
**Seguridad.md** — sin cambios de S#. El script de aislamiento ya no toma un 403 genérico por rechazo de RLS (un JWT vencido queda «inconcluso») y su limpieza no tumba el resumen. S15 sigue cerrado y aplicado; falta correr el script con dos negocios.
**Otras páginas** — `Datafud.md`, `index.md` y `Pendientes.md`: producción en 1.6.1 (`a0ac854`), ya no «sin desplegar». `Seguridad.md` y `Producto-Y-Modelo-De-Negocio.md`: la foto fechada de 1.4.1 pasa a 1.6.1. Detalle del release en `docs/CHANGELOG.md` `## [1.6.1]`.
**log.md** — `## [2026-10-07] ingest | Pulido 1.6.1 y vault al día con 1.6.0 y 1.6.1 desplegados`
- 1.6.0 (`main` @ `462aa6a`, `dpl_HGBnnrdiJpE3Dk4SxuXRVy1x3Ffr`) y 1.6.1 (`main` @ `a0ac854`, `dpl_CYs9FAg9YFHcdNHw4MsbDLSWSPTN`) en producción, READY en `datafud.com` el 2026-10-07.
- 1.6.1 corrige el formulario de editar platillos (foco, vista y botones bloqueados al guardar), la vista previa de la dirección de foto, el aviso de «subida no activa» y la prueba de aislamiento (`120c6fb`, `cdbbc85`, `426bfe4`, `07981e4`).
- Verificado en producción tras 1.6.1: `/`, `/login`, `/preview/carta`, `/c/ejemplo`, la guía y la imagen OG responden 200; `/dashboard` y `/admin` redirigen (307) al login; `/q/demo26` redirige (307).
- Pendiente de la oleada, con Steven: test2, `prueba-aislamiento.mjs`, foto y logo desde el iPhone, un pedido real y el Security Advisor.
Aplicado en vault: sí

### P07 · Oleada, primer paso: login y sonda anónima en producción · commit n/a (solo verificación) · despliegue en producción 2026-10-07 (main @ b4e332b)
**Pendientes.md** — sin cerrar líneas: la oleada sigue abierta. Anotar en el detalle que el segundo local de prueba es **test3**.
**Decisiones.md** — ninguna.
**Seguridad.md** — sin cambios de S#. Evidencia nueva a favor del aislamiento (rol anónimo), sin reemplazar la prueba con dos negocios.
**Otras páginas** — ninguna.
**log.md** — `## [2026-10-07] query | Oleada: login y sonda anónima en producción`
- Steven probó el login en producción el 2026-10-07: ok. Creó el segundo local de prueba con el nombre **test3** (no test2).
- Sonda anónima de solo lectura contra producción (clave `anon`, sin sesión): las 10 tablas de negocio y las 3 vistas de reportes rechazan con 42501; el bucket `media` no deja listar ningún objeto; `get_menu` con una mesa inexistente devuelve vacío.
- Sigue pendiente de la oleada, con Steven: `prueba-aislamiento.mjs` con test y test3 (desde su PowerShell, contraseñas ocultas), foto y logo PNG transparente desde el iPhone, un pedido real desde el QR y el Security Advisor.
Aplicado en vault: sí
