# Auditoría de la aplicación: correctitud, robustez y UX (DataFud 1.6.1)

Fecha: 2026-10-07 · Rama: `main` (`0cc337b`) · Alcance: todo el código, no un diff.
Fuera de alcance: seguridad y RLS (tiene su propio auditor). No se repiten los diferidos de
`2026-10-07-panel-listo-revision-final.md` (T1-m1 a T5-m4, N1 a N3).

Método: lectura completa de `src/app/dashboard/**`, `src/app/admin/**`, `src/app/m/**`, `/c`, `/q`,
`/preview`, librerías (`dates`, `currency/format`, `action-result`, `constants`, `faq`, `seo`,
`i18n`), secciones 5, 7, 7b y 9 de `supabase/schema.sql`. Se corrieron una vez `npm run typecheck`,
`npm run lint` y `npm run build`, y algunos GET públicos a `https://datafud.com` (404 y `/q/`).
Sin BD, sin `dev` ni `start`.

## Resumen

| Severidad | Cantidad |
|---|---|
| Crítico | 1 |
| Alto | 2 |
| Medio | 18 |
| Bajo | 16 |

Build: typecheck, lint y build en verde. 29 páginas, sin advertencias (tampoco salió esta vez la
de `process.version` del Edge). La única nota es que `next lint` está deprecado (ver AA-36).

---

## Crítico

### AA-1 · El tablero de órdenes no dice de qué mesa viene cada orden
- **Archivos:** `src/app/dashboard/orders/order-board.tsx:99-109` (la cabecera de la tarjeta solo
  muestra el total, la hora y el estado), `src/app/dashboard/orders/page.tsx:14-18` (`select("*")`
  sin las mesas) y `src/app/dashboard/page.tsx:139-155` (las órdenes recientes, igual).
- **Escenario:** en el paso de la oleada, dos mesas piden un casado cada una. En el tablero salen
  dos tarjetas «₡3 500 · Hoy, 12:41» sin mesa. El salonero toca «Marcar entregada» y no sabe a qué
  mesa llevarlo. La propia página de mesas promete lo contrario (`tables/page.tsx:39`: «así sabemos
  de qué mesa viene cada orden»), y la landing y las guías venden «pedidos desde la mesa directo a
  cocina». `orders.table_id` existe y `place_order` lo guarda: lo que falta es mostrarlo. La demo
  (`/preview/dashboard`) tampoco lo muestra, así que nadie lo notó.
- **Arreglo:** en `orders/page.tsx`, traer la etiqueta con
  `.select("*, tables(label)")` (o una segunda consulta a `tables` con `id, label` y un `Map`).
  Pasarla a `OrderBoard` y ponerla como título de la tarjeta, grande: «Mesa 3» arriba del total.
  Si `table_id` es null (mesa borrada, S15 con set null), mostrar «Mesa eliminada». Hacer lo mismo
  en las órdenes recientes de `dashboard/page.tsx` y en el mock de `/preview/dashboard`.

## Alto

### AA-2 · Si el envío del pedido falla por red o después de un deploy, el botón queda en «Enviando…» para siempre
- **Archivo:** `src/app/m/[tenant]/[table]/menu-client.tsx:118-140`.
- **Escenario:** el comensal está con datos móviles débiles, o tiene la carta abierta desde antes
  de un deploy (el id de la Server Action cambió: «Failed to find Server Action»).
  `await placeOrder(...)` lanza, `setSending(false)` nunca corre y la excepción queda sin atrapar.
  El botón se queda deshabilitado en «Enviando...». La persona recarga y pierde el carrito. Si la
  orden sí había entrado y lo que se perdió fue la respuesta, la vuelve a armar y la cocina recibe
  dos pedidos.
- **Arreglo:** usar `try { … } catch { setError(d.sendFailed) } finally { setSending(false) }`.
  Agregar a los tres diccionarios un `sendFailed` («No se pudo enviar. Revisá la conexión y probá
  de nuevo; si ya lo enviaste, avisale al salonero antes de repetirlo»). Mostrarlo dentro de la
  hoja del carrito y no con `alert` (ver AA-14). Opcional: guardar el carrito en `sessionStorage`
  por `slug+token` para que sobreviva a la recarga.

### AA-3 · «Ventas por día» agrupa en UTC: lo vendido de 6 p. m. a medianoche cuenta para el día siguiente
- **Archivos:** `supabase/schema.sql:577` y `:584` (`date_trunc('day', o.created_at)`, que corre
  en la zona de la sesión de Postgres; en Supabase es UTC), y `:589` y `:597` lo mismo en
  `v_top_products`. La página `src/app/dashboard/reports/page.tsx:105` formatea `r.day` como
  fecha en UTC.
- **Escenario:** una soda vende ₡180 000 el viernes, la mitad en la cena después de las 6 p. m.
  En el reporte el viernes sale con ₡90 000 y el sábado (cerrado) con ₡90 000. El panel de inicio
  ya calcula «hoy» en la hora de Costa Rica (`localDayKey`), así que el resumen y el reporte no
  coinciden.
- **Arreglo:** en las dos vistas, cambiar `date_trunc('day', o.created_at)::date` por
  `(o.created_at at time zone 'America/Costa_Rica')::date`, en el `select` y en el `group by`.
  Las vistas siguen con `security_invoker`, porque `create or replace` conserva la opción si va en
  el `create` (regla 2). Volver a aplicar `schema.sql` en producción y agregar a `verify.sql` una
  fila que revise que la definición contiene `America/Costa_Rica`.

## Medio

### AA-4 · El tablero trae las últimas 100 órdenes de cualquier estado: las pendientes viejas se caen
- **Archivo:** `src/app/dashboard/orders/page.tsx:14-18` y `order-board.tsx:86`.
- **Escenario:** en un día de 120 órdenes, una que quedó «Lista» a las 11 a. m. sin marcar como
  pagada desaparece del tablero, porque las 100 más nuevas son en su mayoría pagadas. Además,
  pagadas, canceladas y pendientes se mezclan en una sola grilla por fecha, y lo que espera
  atención queda enterrado.
- **Arreglo:** dos consultas. Una trae todas las activas
  (`.in("status", ["pending","preparing","ready","delivered"])`, sin límite o con uno alto), en
  orden ascendente (la más vieja primero). La otra trae las cerradas de hoy (`paid`, `cancelled`)
  con límite. Mostrarlas en dos bloques, «Por atender» y «Cerradas hoy», o en columnas por estado.

### AA-5 · Las páginas del panel ignoran el `error` de Supabase y muestran estados vacíos falsos
- **Archivos:** `dashboard/orders/page.tsx:14-27`, `dashboard/page.tsx:55-60`,
  `dashboard/menu/page.tsx:13-20`, `dashboard/tables/page.tsx:18-22`, `dashboard/reports/page.tsx:30-40`
  y las páginas de `admin/*`.
- **Escenario:** Supabase tiene un corte breve o vence un JWT a mitad de la carga. La consulta
  devuelve `{ data: null, error }`, la página pinta «Todavía no hay órdenes» y el dueño cree que no
  le entró nada. El `error.tsx` del panel, que existe para esto, nunca se activa.
- **Arreglo:** en cada consulta, `if (error) throw new Error("orders")`. Así entra el
  `PanelError` con reintento y digest. Lo más simple es un helper `must(result, "where")` en
  `src/lib/supabase/` que registre `code` y lance un mensaje genérico.

### AA-6 · «Órdenes hoy» y «Vendido hoy» se calculan sobre las últimas 50 órdenes
- **Archivo:** `src/app/dashboard/page.tsx:55-68`.
- **Escenario:** una soda con 70 órdenes en el almuerzo ve «Órdenes hoy: 50» y un «Vendido hoy»
  menor que lo real, sin ninguna advertencia.
- **Arreglo:** consultar las de hoy por rango, con el inicio del día de Costa Rica en UTC:
  `.gte("created_at", inicioHoyCR)`. Para eso, agregar a `src/lib/dates.ts` un
  `startOfLocalDayIso()` (CR es UTC−6 fijo, sin horario de verano). Usar `count: "exact"` para el
  conteo. La lista de recientes puede seguir con `limit(8)`.

### AA-7 · «Platillos más vendidos» es de todo el historial y se corta en silencio a las 1000 filas
- **Archivo:** `src/app/dashboard/reports/page.tsx:37-56`.
- **Escenario:** la página dice «los últimos 14 días con ventas», pero el top no filtra por
  fecha. Además, la vista devuelve una fila por platillo y día, y PostgREST corta en 1000 filas
  (`max-rows` por defecto). Con 60 platillos, unos 17 días de ventas bastan para que el top se
  calcule sobre datos truncados, sin aviso. Por otro lado, «Vendido (14 días)» suma los últimos 14
  días con ventas, que en un local nuevo pueden abarcar dos meses.
- **Arreglo:** filtrar las dos consultas por `day >= hace14díasCR` (con AA-3 aplicado) y cambiar
  la etiqueta a «Últimos 14 días». Lo ideal es una vista o RPC que ya agregue por platillo en el
  rango, para no bajar filas por día.

### AA-8 · Un local suspendido sigue usando el panel, aunque la confirmación dice que deja de funcionar
- **Archivos:** `src/app/admin/tenants/tenant-actions.tsx:13-18` («Su carta y su panel dejan de
  funcionar») y `src/lib/auth/tenant-context.ts:33-52` (no mira `tenant.status`).
- **Escenario:** Steven suspende a un local por falta de pago. La carta `/m/` cae, porque
  `get_menu` filtra por estado, pero el dueño entra al panel y sigue editando con normalidad. Solo
  ve una insignia «Suspendido». El texto del super admin es falso.
- **Arreglo (elegir uno):** (a) en `getTenantContext`, si el estado es `suspended` o
  `cancelled`, mostrar una página dentro del shell: «Tu local está suspendido. Escribinos por
  WhatsApp», sin navegación a las secciones. (b) Cambiar el texto a «Su carta deja de abrirse en
  las mesas. El panel sigue entrando». (a) es lo que se le dijo al super admin.

### AA-9 · Los límites de plan que no son triggers no se cumplen: idiomas y pedidos en el plan Carta
- **Archivos:** `src/app/dashboard/settings/settings-form.tsx:147-163` y `dashboard/actions.ts:283`
  (`enabled: z.array(...).max(3)`). `PRICING.plans.basico.tableOrdering: false`
  (`constants.ts:94`) no lo lee nadie en `get_menu` ni en `place_order`.
- **Escenario:** un local en Básico (2 idiomas) activa los tres. Un local creado con plan
  «Básico» desde `/admin/tenants` recibe pedidos en `/m/` igual que Estándar, contra lo que dice
  la tabla de planes. El menú del panel dice «en los idiomas de tu plan» (`menu/page.tsx:26`).
- **Arreglo:** en `updateSettings`, leer `plans.features.max_languages` del local y rechazar con
  «Tu plan incluye N idiomas». En la UI, deshabilitar las casillas que sobran. Para pedidos, que
  `get_menu` devuelva `ordering: features->>'table_ordering'` (agregar la clave a la semilla de
  planes y a `PRICING`) y que `MenuClient` reciba `ordering={data.ordering}`. También que
  `place_order` rechace si el plan no lo incluye.

### AA-10 · El 404 de la carta del comensal es el de Next, en inglés y sin marca
- **Archivos:** no existe `src/app/not-found.tsx`. `src/app/m/[tenant]/[table]/page.tsx:20-22`
  llama a `notFound()` para todo: local suspendido, mesa borrada, mesa inactiva, token mal formado.
- **Escenario:** comprobado en producción: `GET /m/noexiste/<uuid>` y `GET /c/noexiste` devuelven
  «404: This page could not be found.». Un turista o un comensal tico que escanea el QR de una
  mesa borrada, o de un local suspendido, ve una página técnica en inglés y no sabe qué hacer.
- **Arreglo:** crear `src/app/not-found.tsx` con la marca, en voseo: «Esta carta no está
  disponible. Pedile la carta al salonero». Sin correo y con enlace a `/`. Para `/m/`, un
  `src/app/m/[tenant]/[table]/not-found.tsx` propio, en español e inglés, porque ahí llegan
  turistas.

### AA-11 · Un código `/q/` desconocido o dado de baja manda a la landing sin decir nada
- **Archivo:** `src/app/q/[code]/route.ts:11`. El parámetro `?qr=desconocido` no lo lee nadie
  (no hay coincidencias en `src`).
- **Escenario:** un local da de baja su Carta (`carta-borrar` deja el código comentado, D-014),
  pero el stand sigue en la mesa. El comensal escanea y aterriza en la página de venta de DataFud
  («Menú digital con QR para restaurantes…») en lugar de un aviso.
- **Arreglo:** que el destino desconocido sea una página `noindex` (por ejemplo `/q/no-disponible`,
  o el `not-found` de AA-10), con «Este código ya no está activo. Pedile la carta al personal», en
  español e inglés.

### AA-12 · La carta del comensal (`/m/`) no tiene metadatos propios: el título es el de la landing y es indexable
- **Archivo:** `src/app/m/[tenant]/[table]/page.tsx` (sin `generateMetadata`). Hereda de
  `src/app/layout.tsx:21-56` `robots: index` y el título de venta.
- **Escenario:** comprobado en producción: el `<title>` de `/m/...` es «Menú digital con QR para
  restaurantes en Costa Rica · DataFud». Si un comensal comparte el enlace de la mesa por
  WhatsApp, la tarjeta muestra la oferta de DataFud y no el restaurante. La pestaña tampoco dice
  el nombre del local.
- **Arreglo:** `generateMetadata` con `title: restaurant_name`,
  `robots: { index: false, follow: false }` y sin `openGraph` de venta, con un OG neutro o el logo
  del local. Agregar `/m/` al `disallow` de `robots.ts`. En `dashboard/layout.tsx` y
  `admin/layout.tsx`, poner `title` por sección y `robots` noindex.

### AA-13 · La mesa sale duplicada: «Menú · Mesa Mesa 3»
- **Archivo:** `src/app/m/[tenant]/[table]/menu-client.tsx:155` y `:205`. Las sugerencias del panel
  invitan a escribir la palabra: `tables/page.tsx:45` («Mesa 1, Barra, Terraza 2») y
  `table-actions.tsx:24` (placeholder «Mesa 3»).
- **Escenario:** el dueño sigue el ejemplo y crea «Mesa 3». La cabecera de la carta dice
  «MENÚ · MESA MESA 3», y en inglés «MENU · TABLE MESA 3». La pantalla de confirmación dice
  «· Mesa Mesa 3». Con «Barra» queda «Mesa Barra».
- **Arreglo:** mostrar `data.table.label` solo, sin anteponer `d.table`. La etiqueta la escribe el
  local tal como la usa. También se puede anteponer solo cuando la etiqueta es un número
  (`/^\d+$/`).

### AA-14 · Los errores del pedido salen con `alert()` nativo y siempre en español
- **Archivos:** `menu-client.tsx:138` y `m/[tenant]/[table]/actions.ts:42-51` y `:71`.
- **Escenario:** un turista que lee la carta en inglés pide 2 de un plato que se agotó mientras
  tanto. Recibe un `alert` del sistema, con el dominio arriba, que dice «Ningún platillo válido en
  la orden.». Si la nota pasa de 300 caracteres, Zod devuelve su mensaje por defecto en inglés
  técnico («String must contain at most 300 character(s)»), porque `note: z.string().max(300)` no
  tiene mensaje.
- **Arreglo:** que `placeOrder` devuelva un código (`{ error: "unavailable" | "rate_table" | … }`)
  y que `MenuClient` lo traduzca con `getDict(lang)`. Mostrarlo dentro de la hoja del carrito con
  `role="alert"`. Poner `maxLength={300}` al input de la nota y un mensaje en la regla de Zod.

### AA-15 · Si un platillo se agota mientras el comensal arma el pedido, se descarta en silencio
- **Archivos:** `supabase/schema.sql` (función `place_order`, `if found then … end if` dentro del
  `loop`) y `menu-client.tsx:131-136` y `:143-166`.
- **Escenario:** el comensal pide 3 platillos. Uno se marcó agotado hace 2 minutos.
  `place_order` crea la orden con 2 y el comensal ve «¡Orden enviada!», sin total ni detalle, y
  espera un plato que nunca llega. La pantalla de confirmación no muestra qué se envió.
- **Arreglo:** en la RPC, lanzar un error si algún `product_id` no es válido, por ejemplo
  `'Algunos platillos ya no están disponibles'`, para que el comensal ajuste el carrito. La otra
  opción es devolver los ids descartados. En la confirmación, mostrar el resumen (líneas y total)
  que devuelva la RPC.

### AA-16 · Los botones de cantidad del menú del comensal miden 28 px y se anuncian como «+» y «−»
- **Archivo:** `menu-client.tsx:331` y `:333` (tarjeta), `:401` y `:403` (carrito): `h-7 w-7`,
  `aria-label="−"` y `"+"`. El de agregar mide 36 px (`h-9`, `:324`) y el de cerrar la hoja, 36 px
  (`:375`).
- **Escenario:** en un teléfono, con el pulgar y en una mesa, es fácil tocar «−» en vez de «+».
  Un lector de pantalla lee «más, botón» sin decir de qué platillo. La regla de la casa es 44 px
  (el panel ya la cumple con `min-h-11`).
- **Arreglo:** `h-11 w-11` (o `h-9 w-9` con un `::before` que extienda el área a 44 px, como en
  `menu-manager.tsx:218`). Usar `aria-label={`${d.remove} ${nombre}`}` y `${d.add} ${nombre}`, con
  las claves en los diccionarios. El input de la nota (`:413`) necesita un `<label>` (sr-only), no
  solo el placeholder.

### AA-17 · `backdrop-blur` en el menú del comensal (regla 9)
- **Archivo:** `menu-client.tsx:204`, `:209`, `:239` (`backdrop-blur-md`) y `:371`.
- **Escenario:** la regla de marca prohíbe `backdrop-blur`. Además, en Android de gama baja el
  blur de una barra sticky cuesta FPS al hacer scroll por la carta.
- **Arreglo:** quitar las cuatro clases. La barra de categorías ya es `bg-cream-50/90`: pasarla a
  `bg-cream-50` opaca. Las píldoras de la cabecera quedan bien con `bg-white/15` sin blur, y el
  velo de la hoja, con `bg-brand-950/60`.

### AA-18 · Los platillos de una categoría borrada desaparecen de la carta y el panel no lo dice
- **Archivos:** `menu-client.tsx:74` y `:267-268` (solo se pintan los productos con categoría),
  `menu-manager.tsx:114` (el diálogo dice «quedan sin categoría») y `:357-411` (la lista no
  muestra la categoría).
- **Escenario:** el dueño borra «Bebidas» para reorganizar. Sus 12 bebidas siguen «Disponible» en
  el panel, pero ya no salen en la carta de las mesas. Nada en el panel lo indica.
- **Arreglo:** que el texto del diálogo diga «…quedan sin categoría y dejan de verse en la carta
  hasta que les asignés una». En la lista, agrupar por categoría o mostrar una insignia
  «Sin categoría · no se ve en la carta». Otra opción: que la carta los muestre en una sección
  «Otros».

### AA-19 · El QR descargable mide 240 px y tiene un margen de 1 módulo: queda chico y difícil de leer al imprimir
- **Archivo:** `src/app/dashboard/tables/page.tsx:30` (`width: 240, margin: 1`) y `:73-80` (la
  descarga es el mismo data URL).
- **Escenario:** el dueño descarga el PNG y lo amplía a 8 cm para el stand. A 240 px sale
  pixelado o borroso. La norma pide 4 módulos de zona silenciosa y con 1 algunas cámaras no lo
  leen, sobre todo sobre fondos de color. La página dice «Descargalo, imprimilo».
- **Arreglo:** generar dos versiones: la vista previa de 240 px y la descarga con
  `width: 1024, margin: 4, errorCorrectionLevel: "M"`. Mejor todavía, un SVG
  (`QRCode.toString(url, { type: "svg", margin: 4 })`) que se imprime a cualquier tamaño. Poner el
  nombre de la mesa en el archivo, como ya se hace.

### AA-20 · La «contraseña temporal» del dueño no se puede cambiar
- **Archivos:** `src/app/admin/tenants/create-tenant-form.tsx:133` y `:153`, y
  `src/app/admin/actions.ts:42-60`. No hay `auth.updateUser` en ninguna parte de `src`.
- **Escenario:** el dueño recibe «Contraseña temporal: abcde-fghjk-mnpqr» por WhatsApp y la busca
  para cambiarla. No hay dónde, así que la temporal queda para siempre en el chat. Tampoco hay
  «olvidé mi contraseña»: el login manda a WhatsApp.
- **Arreglo:** agregar en Configuración una tarjeta «Cambiar contraseña», con una Server Action:
  Zod con mínimo 10 caracteres y confirmación, `supabase.auth.updateUser({ password })` y
  `ActionResult`. Mientras no exista, cambiar el texto a «Contraseña inicial» y no prometer que es
  temporal.

### AA-21 · `/preview/admin` muestra correos en dominios que pueden ser de negocios reales (regla 10)
- **Archivos:** `src/lib/demo/mock.ts:72`, `:85`, `:98`, `:111`, `:124` (cinco correos de
  demo con dominios que podrían ser de negocios reales; ya reemplazados), que se
  pintan en `src/app/preview/admin/page.tsx:95`.
- **Escenario:** la regla 10 dice que ningún correo se muestra en la web. Además, `lacosecha.cr` o
  `cafeparque.com` pueden pertenecer a negocios reales, y la página los muestra como clientes de
  DataFud con pagos «vencidos». Tiene `noindex`, pero es pública.
- **Arreglo:** quitar el correo de la fila en `/preview/admin` (mostrar solo `/{slug}` y el
  dueño) o usar dominios reservados (`@ejemplo.test`). Revisar que los nombres de los locales de
  ejemplo no coincidan con negocios conocidos de la GAM.

## Bajo

### AA-22 · «Comandas en vivo» con punto pulsante en la demo del panel
- `src/app/preview/dashboard/page.tsx:57-59`. Es lo más cercano a «tiempo real», que la regla 10
  prohíbe, y el panel real refresca cada 15 s. Cambiar a «Comandas activas» y quitar
  `animate-pulse`.

### AA-23 · Vacío de la carta del comensal con el mensaje del carrito y en tuteo
- `menu-client.tsx:263-265` usa `d.emptyOrder` («Aún no has agregado platillos») cuando el local
  no tiene platillos. El texto, además, está en tuteo (`dictionaries.ts:9`). Agregar
  `emptyMenu: "Esta carta todavía no tiene platillos."` y cambiar `emptyOrder` a «Todavía no
  agregaste platillos.».

### AA-24 · `html lang="es"` fijo aunque el comensal cambie a inglés o portugués
- `src/app/layout.tsx:64` y `menu-client.tsx:214`. El lector de pantalla lee la carta en inglés
  con voz española. En `MenuClient`, un `useEffect` que haga `document.documentElement.lang = lang`,
  o envolver `<main lang={lang}>`.

### AA-25 · Textos con opacidad 40-50 % sobre crema en la carta del comensal
- `menu-client.tsx:264`, `:282`, `:346` y `:382` (`text-brand-700/40` y `/50`). El contraste
  estimado es menor que 3:1. Usar `text-stone-600` (token AA) en el conteo, el pie y los vacíos.

### AA-26 · El registro de pago propone la fecha de mañana después de las 6 p. m.
- `src/app/admin/payments/payment-form.tsx:30-33`: `new Date().toISOString()` es UTC, en el
  servidor y en el navegador. Además, `setMonth(+1)` desde el 31 de enero da el 3 de marzo. Usar
  `localDayKey()` de `src/lib/dates.ts` para «Desde» y sumar el mes sobre la clave local, con tope
  al último día del mes. El monto por defecto `49` está escrito a mano: leer el precio del plan
  del local.

### AA-27 · Registrar un pago reactiva cualquier local e ignora el error de esa actualización
- `src/app/admin/actions.ts:214-215`. Un pago atrasado de un local `cancelled` lo vuelve `active`
  sin preguntar. Si el `update` falla, la acción igual dice «Pago registrado». Reactivar solo desde
  `suspended` o `trial`, revisar el `error` y decir en el resultado si el estado cambió.

### AA-28 · Cambiar la moneda no avisa que los precios no se convierten
- `settings-form.tsx:119-132`. Pasar de CRC a USD convierte «₡3 500» en «$3 500.00» en todas las
  mesas. Mostrar un `FieldHint`: «Cambiar la moneda no convierte los precios: revisalos en Menú»,
  o pedir confirmación si cambió.

### AA-29 · El precio acepta céntimos en colones y se muestra redondeado
- `menu-manager.tsx:328` y `:449` (`step="0.01"`). Con `₡3 500,50`, la carta muestra «₡3 501» y
  el total, que se calcula con decimales, puede no cuadrar con la suma de lo mostrado. Si
  `currency === "CRC"`, usar `step="1"` y redondear en `productSchema`.

### AA-30 · En el tablero no se deshace un cambio de estado
- `order-board.tsx:15-28` y `:131-151`. Un toque de más en «Marcar pagada» o en una orden
  equivocada no tiene vuelta atrás desde la UI. Agregar «Volver a <estado anterior>» en la tarjeta
  por unos segundos (o siempre en las que no estén pagadas o canceladas).

### AA-31 · El texto de cancelar una orden promete algo que el comensal no ve
- `order-board.tsx:72`: «El cliente ya no la verá en preparación». El comensal no tiene pantalla
  de seguimiento: después de enviar solo ve la confirmación. Cambiar a «Sale del tablero de
  cocina. Avisale al cliente si ya estaba esperando».

### AA-32 · El login ignora `?redirect=` y deja en un bucle a un usuario sin local
- `src/lib/supabase/middleware.ts:56` arma `redirect`, pero `loginAction`
  (`src/app/(auth)/actions.ts:42-44`) siempre manda a `/dashboard` o `/admin`. Un perfil sin
  `tenant_id` va de `/dashboard` a `/login` sin mensaje (`tenant-context.ts:28`), y al entrar de
  nuevo vuelve a lo mismo. Respetar `redirect` (solo rutas internas que empiecen con `/dashboard` o
  `/admin`) y mostrar «Tu usuario no tiene un local asignado. Escribinos» con `?motivo=sin-local`.

### AA-33 · Si falta la fila de `tenants`, el layout del panel truena fuera del `error.tsx`
- `src/lib/auth/tenant-context.ts:32-46` devuelve `tenant as Tenant` aunque sea null, y
  `dashboard/layout.tsx:20-23` hace `tenant.name`. El error del layout no lo atrapa
  `dashboard/error.tsx` (que está dentro del layout) y no hay `app/error.tsx` ni
  `app/global-error.tsx`: sale la página genérica de Next. Redirigir a `/login?motivo=sin-local`
  si `!tenant` y agregar un `app/global-error.tsx` con la marca.

### AA-34 · Borrar o actualizar sin filas afectadas dice «listo»
- `dashboard/actions.ts:85` y `:178` (borrar categoría y platillo), `:255` (mesa), `:317-329`
  (configuración sin fila en `tenant_settings`) y `admin/actions.ts:34`. Agregar `.select("id")` y
  `if (!data?.length) return fail("Ya no existe. Recargá la página.")`, como ya hacen
  `updateCategory` y `updateProduct`.

### AA-35 · Nombres largos sin cortar en el panel y en la carta
- `menu-manager.tsx:364` y `menu-client.tsx:316`. Un nombre sin espacios
  («Hamburguesa-doble-con-tocineta-y-queso…») o una URL pegada como nombre desborda la tarjeta en
  pantallas de 360 px. Agregar `[overflow-wrap:anywhere]`, como ya hace `reports/page.tsx:130`.

### AA-36 · `next lint` está deprecado
- Salida de `npm run lint`: «`next lint` is deprecated and will be removed in Next.js 16».
  Migrar con `npx @next/codemod@canary next-lint-to-eslint-cli .` antes de subir a Next 16; si no,
  el paso «lint en verde» de CLAUDE.md deja de existir.

### AA-37 · La lista de platillos del panel no está agrupada ni muestra la categoría
- `menu-manager.tsx:357-411`. Con 60 a 150 platillos (los límites del plan) es una lista plana sin
  categoría, sin búsqueda y en el orden de `sort_order` global. Agrupar por categoría (con
  «Sin categoría» al final, ver AA-18) y agregar un filtro de texto.

---

## Revisado y sano

- **Build y tipos:** `typecheck`, `lint` y `build` en verde. 29 rutas, `/c/ejemplo` como SSG,
  paneles y `/m/` dinámicos, sin advertencias de compilación.
- **E/S al importar (trampa conocida):** `src/lib/og.tsx` lee las fuentes dentro de
  `loadOgFonts()`, al dibujar. Los `opengraph-image.tsx` solo importan constantes.
  `hardware-section.tsx` usa `existsSync` dentro de una función de render de una página estática,
  no en metadatos.
- **Fronteras cliente/servidor:** los `"use server"` solo exportan funciones async. Los
  componentes cliente no importan `server.ts` ni `createAdminClient`.
- **ActionResult (regla 8):** todas las acciones de los paneles validan con Zod y devuelven
  `ok`, `fail` o `dbFail`. El límite de plan se traduce en `dbFail` («Llegaste al límite de tu
  plan»). `useFormSubmit` evita el reset prematuro de React 19 y el doble envío.
- **Formato de moneda:** `formatCrc` y `formatMoney` dan «₡14 900» sin decimales y con espacio de
  no-corte, el signo negativo bien puesto, y USD con decimales según el idioma del lector.
- **Fechas:** `formatDateTime`, `formatTime` y `localDayKey` en `America/Costa_Rica`.
  `formatDate` lee las columnas `date` en UTC para no retroceder un día. El resumen del panel usa
  el día local.
- **Auto-refresco del tablero:** 15 s, en pausa con la pestaña oculta, refresca al volver,
  `aria-live="off"`, y el texto no promete tiempo real. Sin riesgo de hidratación (la diferencia
  de tiempos arranca en 0).
- **Snapshots tras S15:** el tablero y los reportes usan `product_name_snapshot` y `line_total`,
  así que un `product_id` null no rompe nada. `itemsByOrder[o.id] ?? []`.
- **Subida de imágenes:** I1 e I2 de la revisión anterior están resueltos (fondo blanco antes del
  JPG; `shrink` y `uploadImage` en `try` separados, con mensajes distintos).
- **Diálogo de confirmación:** `<dialog>` nativo con foco en «Volver», Escape, clic en el velo y
  `overflow-wrap` en títulos largos.
- **Shell del panel:** enlace para saltar al contenido, panel móvil con trampa de foco, Escape y
  bloqueo de scroll. Objetivos de 44 px. Logout con estado pendiente.
- **Alta de local:** rollback completo (usuario, local, perfil y configuración), slug validado y
  comprobado antes, CRC por defecto, contraseña sin caracteres ambiguos que se muestra una sola
  vez, y mensaje para WhatsApp sin correos públicos.
- **Cargos:** el monto unitario sale de `PRICING` (`setupFeeUsd`, `nfcUnitUsd`) y el total se
  redondea a 2 decimales en el servidor.
- **`/c/[slug]`:** `dynamicParams = false`, `noindex` cuando `indexable: false`, la carta de
  ejemplo fuera del sitemap, `ordering={false}`.
- **`/q/[code]`:** 307 (no permanente), sin distinguir mayúsculas, con `hasOwnProperty` (sin
  colisión con `__proto__`). Comprobado en producción: `/q/zzzzzz` responde 307 (el destino, ver
  AA-11).
- **PRICING contra las semillas:** Básico 29/60/5/8/2, Estándar 49/150/20/30/2 y Empresarial
  99/sin límite/3 coinciden con `schema.sql:644-656`. FAQ, JSON-LD (`seo.ts`), descripción y OG
  leen de `PRICING`. El JSON-LD no tiene correo.
- **Honestidad de la landing (regla 10):** sin «tiempo real», «24/7», «exportación», «trial» ni
  «creá tu cuenta». `TESTIMONIALS` vacío. Los cupos de fundadores van sin cifra mientras
  `remaining` es null. Sin `mailto:` en el contenido (`magnetic-cta.tsx` solo lo reconoce como
  enlace externo). `leadsEmail` se usa solo como destino del formulario.
- **Anclas:** todas las de la landing y las guías (`#planes`, `#hardware`, `#demo`,
  `#preguntas`, `#contacto`, `#como-funciona`, `#confianza`, `#contenido`) tienen su `id`.
- **Sitemap y robots:** solo rutas públicas. Bloquean `/admin`, `/dashboard`, `/login`,
  `/register` y `/api`. La ruta privada del super admin no aparece.
- **Marca (regla 9):** no hay emojis en `src` (escaneo de rangos Unicode), ni texto con
  degradado (`bg-clip-text` / `text-transparent`). El único incumplimiento es `backdrop-blur`
  (AA-17).
- **Tope del comensal:** 20 por platillo y 30 líneas en el cliente, en Zod y en la RPC, alineados.
  `place_order` lee los precios de `products` (regla 4) y borra la orden si queda en cero.
- **Middleware:** solo cubre paneles, `/login` y la ruta privada. Sin variables no hace nada.
  No hay bucle de redirección para un usuario con sesión en `/login`.
