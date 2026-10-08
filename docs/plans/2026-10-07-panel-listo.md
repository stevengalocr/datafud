# Panel de administración listo — antes de la oleada de pruebas (2026-10-07)

> Etapa 1 del Recorrido de GaloDeVibes («Datafud: código sólido», medalla «Panel de administración
> listo»). Hace lo que `docs/plans/2026-10-04-oleada-de-pruebas.md` pone **antes** de la oleada (D1,
> D2 y D3, que Steven aprobó el 2026-10-07) y prepara la prueba de aislamiento (paso 4 de la oleada).
> Steven aprobó: Storage entra ahora (código y SQL; aplicarlo en producción es un paso suyo), y al
> terminar se une a `main` y se hace push.

## Spec

La spec es esta página junto con `CLAUDE.md` del repo (las «Reglas que no se rompen» mandan) y la
propuesta de la oleada. No hay otra.

## Restricciones globales (todas las tareas)

- Reglas 1 a 11 de `CLAUDE.md`. En especial: toda Server Action valida con Zod y devuelve
  `ActionResult` (`ok`/`fail`/`zodFail`/`dbFail`), nunca lanza a la UI ni muestra el mensaje crudo
  de la base; `anon` nunca recibe permisos sobre tablas; nunca un `tenant_id` del navegador; nada de
  secretos en código, docs ni commits; `schema.sql` idempotente y sin usuarios.
- Marca: íconos solo SVG de `src/components/ui/icon.tsx`, sin emojis, sin `backdrop-blur`, sin texto
  con degradado, voseo tico natural en la UI («Guardá», «Probá de nuevo»).
- Sin dependencias nuevas de npm.
- Antes de cada commit: `npm run typecheck`, `npm run lint` y `npm run build` en verde, y
  `git diff --stat --ignore-cr-at-eol` muestra solo cambios reales (LF).
- Commits convencionales en español (`feat(paneles):`, `security:`, `docs:`…), uno por unidad.
- Cada cambio visible entra en `docs/CHANGELOG.md` bajo «Unreleased».
- No se toca producción (ni Supabase ni Vercel) ni se hace push dentro de las tareas.

## Task 1: Editar un platillo (`updateProduct`) y mensajes de límite de plan

**Por qué:** sin editar, un error de precio o nombre obliga a borrar y crear el platillo (D1). La
oleada intenta pasarse del tope del plan y la UI tiene que mostrar el mensaje (D2).

1. En `src/app/dashboard/actions.ts`, agregar `updateProduct(formData)`:
   - `id` validado como uuid; los mismos campos y la misma validación que `createProduct`
     (reutilizar `productSchema`, sin duplicarlo); `name_i18n` y `description_i18n` con `i18nFrom`.
   - `update` filtrado por `id` con `.select("id")`; si no actualizó ninguna fila, `fail("Ese platillo
     ya no existe.")` (mismo patrón que `updateOrderStatus`). El RLS ya limita al negocio: no se
     agrega `tenant_id` desde el navegador.
   - `dbFail("updateProduct", …)` y `revalidatePath("/dashboard/menu")`.
2. En `src/app/dashboard/menu/menu-manager.tsx`, un botón «Editar» por platillo abre el formulario
   con los valores actuales (nombre ES/EN/PT, descripción ES/EN/PT, categoría, precio, foto, orden),
   con el mismo patrón que la edición de categorías que ya existe en ese archivo (estado, errores
   visibles, formulario que no pierde lo escrito, «Guardando…»). Cancelar vuelve sin cambios.
3. D2: revisar que `createCategory`, `createProduct` y `createTable` pasen su error por `dbFail` (que
   ya traduce «Límite del plan alcanzado» en un mensaje para la UI) y que la UI de menú y de mesas
   muestre `res.error` cuando `ok` es `false`. Corregir solo lo que falte; si ya está, decirlo en el
   reporte con las líneas.
4. CHANGELOG: «Editar platillos desde el panel».

## Task 2: Fotos y logo con Supabase Storage

**Por qué:** hoy la foto de un platillo y el logo se pegan como URL https; un restaurante no tiene
dónde alojarlas (D3, «Storage, día 9» del plan).

1. `supabase/schema.sql`, sección nueva e idempotente: bucket `media`, **público para leer** (las fotos
   del menú las ve el comensal sin sesión), con `file_size_limit` de 2 MB y `allowed_mime_types`
   `image/jpeg`, `image/png`, `image/webp` (insert … on conflict do update). Políticas sobre
   `storage.objects` para `authenticated`: insertar, actualizar y borrar solo cuando
   `bucket_id = 'media'` y la primera carpeta del nombre sea `current_tenant_id()::text`, o
   `is_super_admin()`. **Ninguna política para `anon`** (la lectura pública la da el bucket público).
   `drop policy if exists` antes de cada `create policy`.
2. `supabase/verify.sql`: filas que comprueben que existe el bucket, que es público, sus límites, y
   que existen las políticas (y que ninguna es para `anon`).
3. Server Action `uploadImage(formData)` en `src/app/dashboard/actions.ts` (o un archivo de acciones
   junto a ella si queda más claro): recibe un `File`, valida con Zod tipo (los tres de arriba) y
   tamaño (≤ 2 MB), sube con el cliente de servidor con la sesión del usuario (no `service_role`) a
   `<tenant_id del contexto>/<products|logo>/<uuid>.<ext>` y devuelve la URL pública en `data`.
   Si el bucket no existe o Storage falla, devuelve `fail` con un mensaje amable («La subida de fotos
   todavía no está activa. Pegá la dirección de la foto.»): **la página nunca se rompe** y el campo de
   URL sigue funcionando (regla 11).
4. El límite de cuerpo de las Server Actions es 1 MB: en el navegador, antes de subir, reducir la
   imagen con `<canvas>` a un máximo de 1600 px de lado y pasarla a WebP (calidad ~0,82), sin
   dependencias. Si el resultado sigue pasando de 1 MB, avisar en la UI sin subir.
5. UI: en el formulario de platillo (crear y editar, Task 1) y en el del logo de
   `settings/settings-form.tsx`, un botón «Subir foto» / «Subir logo» junto al campo de URL que, al
   terminar, llena ese campo con la URL devuelta y muestra la vista previa. Estados visibles:
   «Subiendo…», error, listo. Accesible (label, `aria-live` para el estado).
6. No se borran archivos viejos al reemplazar una foto (queda anotado como pendiente en el reporte).
7. CHANGELOG: «Subir fotos de platillos y el logo (requiere aplicar `schema.sql` en producción)».

## Task 3: Prueba de aislamiento entre dos negocios (script)

**Por qué:** el paso 4 de la oleada (cierra D-018) pide que Claude repita la prueba contra la API con
la sesión de `test2`. Hoy no hay con qué hacerlo de forma repetible.

1. `scripts/prueba-aislamiento.mjs` (Node ≥ 18, sin dependencias nuevas: puede usar
   `@supabase/supabase-js`, que ya está). Lee de variables de entorno: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `AISLAMIENTO_A_EMAIL`, `AISLAMIENTO_A_PASSWORD`,
   `AISLAMIENTO_B_EMAIL`, `AISLAMIENTO_B_PASSWORD`. Sin variables, explica cómo correrlo y sale con 2.
   Nunca imprime contraseñas ni tokens.
2. Inicia sesión como A y como B. Con la sesión de B, contra los datos de A, intenta:
   - leer `categories`, `products`, `tables`, `orders`, `order_items`, `tenant_settings`,
     `tenants`, `subscriptions`/pagos si existen, y las vistas de reportes: debe ver **cero** filas de A;
   - `insert` con el `tenant_id` de A en `categories`, `products` y `tables`: debe fallar;
   - `update` y `delete` sobre una fila de A (por id): debe afectar **cero** filas;
   - si existe el bucket `media`: subir a la carpeta `<tenant_id de A>/` debe fallar.
   Además, sin sesión (`anon`): leer cualquiera de esas tablas devuelve cero filas o error.
   Las tablas y vistas salen de `schema.sql`; listar en el script exactamente las que existen ahí.
3. Las escrituras de prueba que pasaran por error se reportan como FALLA; el script **no deja
   basura**: lo que sí crea con la sesión legítima (si necesita una fila de A para probar update o
   delete) lo borra al final.
4. Salida: una línea `ok`/`FALLA` por comprobación y un resumen; exit 0 si todo pasa, 1 si algo
   falla. Documentarlo en `docs/USER_MANUAL.md` o en un comentario al inicio del script, y en la
   propuesta de la oleada (paso 4) mencionar el comando.
5. No se corre contra producción en esta tarea. Se verifica con `node --check` y corriendo sin
   variables (debe explicar y salir con 2).

## Task 5: Referencias entre negocios (hallazgo de la revisión de la Task 3)

**Por qué:** la revisión de seguridad del 2026-10-07 confirmó (severidad media) que las políticas RLS
solo validan el `tenant_id` de la fila, y las FK no pasan por RLS. `get_menu` entrega a cualquiera con
el QR los id de local, mesas, categorías y platillos. Con eso, B puede crear en su propio negocio filas
que apuntan a filas de A (un producto con `category_id` de A, una orden con `table_id` de A), y el tope
de `place_order` (10 pedidos por mesa en 10 min) cuenta por `table_id` sin filtrar el negocio: B puede
bloquear los pedidos en las mesas de A. Además, borrar en A pone en null o borra en cascada filas de B.

1. En `supabase/schema.sql`, de forma idempotente, garantizar que toda referencia entre tablas de
   negocio apunte al **mismo** `tenant_id`: revisar cada FK entre tablas de negocio (al menos
   `products.category_id`, `orders.table_id`, `order_items.order_id`, `order_items.product_id` y las
   que haya en suscripciones o pagos) y elegir el mecanismo que mejor encaje con el esquema existente
   (FK compuestas `(tenant_id, id)` con `unique (tenant_id, id)` en la tabla padre, o un trigger
   `before insert or update` que lo verifique). El mecanismo y el porqué van en el reporte.
   Debe aplicarse sobre una base que ya tiene datos sin romperla: si una fila existente violara la
   regla, el script lo detecta y lo informa en vez de fallar a medias (en producción hoy solo existe
   el local «test»).
2. `place_order`: los conteos del límite por mesa y por local filtran también por `tenant_id`.
3. `supabase/verify.sql`: filas que comprueben el mecanismo.
4. `scripts/prueba-aislamiento.mjs`: comprobación nueva: B no puede insertar en su negocio un
   producto con la `category_id` de A ni una mesa u orden ligada a A (debe fallar); limpieza de lo
   que se creara por error.
5. Registrar el hallazgo en el reporte con un id `S` nuevo (la siguiente libre en
   `..\obsidian\Cerebro2.0-Proyectos\Datafud\Seguridad.md`, solo lectura en esta tarea) para
   que la Task 4 lo lleve al vault.
6. CHANGELOG: «Seguridad: las referencias entre tablas no pueden cruzar de un negocio a otro
   (requiere aplicar `schema.sql` en producción)».

## Task 4: Release 1.6.0, vault-sync y vault

1. `package.json` → 1.6.0; `docs/CHANGELOG.md`: «Unreleased» pasa a 1.6.0 con fecha 2026-10-07.
2. `docs/vault-sync/2026-10-07-panel-listo.md` con un bloque por tarea (formato de `CLAUDE.md`) y
   aplicarlo al vault (`..\obsidian\Cerebro2.0\02-Proyectos\Datafud\`), marcando «Aplicado en vault: sí»:
   - `Pendientes.md` de Datafud y la sección Datafud de
     `..\obsidian\Cerebro2.0\03-Vida-Personal\GaloDeVibes\Pendientes-De-Proyectos.md`, en el mismo
     bloque: cerrar `updateProduct y su formulario` (`· hecho 2026-10-07`); la línea «Storage para
     fotos y logo; tablero de comandas con refresco» queda abierta con el texto «Storage para fotos y
     logo: aplicar schema.sql en producción y probar» y su duración bajada a `~30m · trámite` (el
     refresco del tablero ya estaba desde `4cbf188`); cerrar «P0 · Paneles con sesión fallan en
     Vercel» como hecho el 2026-10-03 (`6382835`); la de «Security Advisor, prueba de aislamiento…»
     sigue abierta y anota que el script existe.
   - Corregir lo desactualizado del nodo: `Producto-Y-Modelo-De-Negocio.md` («Tablero de comandas …
     no se refresca solo», «Editar platillos … No existe», «Fotos y logo … Sin subida»), `index.md`
     (dice 1.4.1) y el hub `Datafud.md` (versión y número de decisiones si dice 62 y ya hay D-063).
   - `log.md` de Datafud: entrada `## [2026-10-07] ingest | …`.
   - Correr `node 00-Sistema/scripts/lint-vault.mjs` desde la raíz del vault: 0 problemas.
3. El texto de las líneas de la cola se mantiene (la app de GaloDeVibes las identifica por su texto):
   solo se agrega `· hecho AAAA-MM-DD` o se cambia la línea de Storage como se indica.
