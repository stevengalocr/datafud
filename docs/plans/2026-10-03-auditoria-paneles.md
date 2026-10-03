# Auditoría de los paneles con sesión — 2026-10-03

> Primera revisión de diseño de las pantallas que se volvieron visibles al encender el backend:
> `/login`, la entrada privada del super admin, `/admin` (Resumen, Restaurantes, Pagos, Cargos,
> Planes) y `/dashboard` (Resumen, Menú, Órdenes, Mesas y QR, Reportes, Configuración).
> Método: skills `impeccable` (audit + critique, contexto de `.impeccable.md`) y `ui-ux-pro-max`
> (guías de paneles), capturas en 375 × 812 y 1440 × 900 con Playwright y medición de estilos
> computados. Solo presentación: no se tocaron `src/lib/supabase/`, `src/lib/auth/`,
> `src/middleware.ts`, `src/instrumentation.ts`, los `actions.ts` ni `supabase/`.

## Cómo se reprodujo sin Supabase real

Un Supabase falso (`mock-supabase-paneles.mjs`, en el scratchpad de la sesión, puerto 54331)
elige el rol y los datos por el `access_token` de la cookie `sb-127-auth-token`: `tok` super
admin vacío, `tokfull` super admin con datos de peor caso (nombres y correos largos, los cuatro
estados de local, pagos vencidos), `tokr` restaurante vacío y `tokrfull` restaurante con
órdenes, mesas y reportes. `next dev -p 3121` con
`NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54331`. Todas las rutas respondieron 200 sin
errores de consola, antes y después.

## Hallazgos

Las líneas son las del código **antes** de los cambios (commit `11461d5`).

### P0 — bloquean el uso

| # | Hallazgo | Dónde | Estado |
|---|---|---|---|
| P0-1 | En la entrada privada lo que se escribe en correo y contraseña es **blanco sobre blanco** (medido: `color` y `background` = `rgb(255,255,255)`), y las etiquetas `slate-700` sobre `slate-900` dan 1.6:1. Causa: `cn` solo concatena; el `bg-white` del `Input` ganaba al `bg-slate-800` pasado por `className`. | `(auth)/acceso-galodev-9f3a/page.tsx:28-52`, `components/ui/input.tsx:10`, `lib/utils/cn.ts` | Arreglado |

### P1 — rompen la marca, la confianza o la accesibilidad

| # | Hallazgo | Dónde | Estado |
|---|---|---|---|
| P1-1 | `/login` con paleta `slate` genérica (fondo `slate-50`, gris azulado), tuteo ("Accede"), sin `autocomplete`, error sin `role="alert"`. | `(auth)/login/login-form.tsx:18-57` | Arreglado |
| P1-2 | Entrada privada: tarjeta azul noche (`slate-950/900`) que no se parece a DataFud. | `(auth)/acceso-galodev-9f3a/page.tsx:20-22` | Arreglado |
| P1-3 | Texto secundario `slate-400` (2.6:1 sobre blanco, falla AA) en correos, fechas, vacíos y ayudas de todos los paneles. | `admin/page.tsx:60,76,84`, `admin/tenants/page.tsx:46,68`, `dashboard/page.tsx:86,96`, `order-board.tsx:32,52,67`, etc. | Arreglado (`stone-600`, ≥ 7:1) |
| P1-4 | Sin `error.tsx` ni `loading.tsx` en `/admin` y `/dashboard`: un error del servidor (como el de producción en `/admin`) cae en la página genérica de Next y la navegación queda en blanco mientras carga. | `src/app/admin/`, `src/app/dashboard/` | Arreglado (error dentro del shell con reintento y `digest`; esqueleto) |
| P1-5 | Acciones destructivas sin confirmación: cancelar o suspender un local, eliminar categoría, platillo o mesa (su QR impreso deja de servir) y cancelar una orden. | `admin/tenants/tenant-actions.tsx:16-49`, `menu-manager.tsx:84,217`, `tables/table-actions.tsx:31`, `order-board.tsx:93` | Arreglado (`window.confirm` con el nombre) |
| P1-6 | Los formularios de Pagos y Cargos quedan en "Registrando..." para siempre si la acción lanza (datos inválidos) y no dicen nada. Ninguna acción del panel avisa si falla. | `payment-form.tsx:22-27`, `charge-form.tsx:36-42`, `settings-form.tsx:26-30` | Arreglado del lado de la UI (try/catch y mensaje); el motivo real sigue sin llegar (S10) |
| P1-7 | Órdenes promete "en tiempo real" y la página no se actualiza sola (regla 10). | `dashboard/orders/page.tsx:37` | Arreglado ("Las nuevas aparecen al recargar la página") |
| P1-8 | Estados de pago y cargo mostrados con el código de la BD en inglés (`paid`, `pending`, `overdue`). | `admin/payments/page.tsx:79`, `admin/charges/page.tsx:84` | Arreglado (`PAYMENT_STATUS_LABEL`) |
| P1-9 | Fechas y horas sin zona: en Vercel el servidor está en UTC, así que una orden de las 8 p. m. en San José se mostraba a las 2 a. m. del día siguiente, "Órdenes hoy" cortaba el día a las 6 p. m. y las fechas `date` retrocedían un día en local. | `dashboard/page.tsx:31-34,87`, `order-board.tsx:53`, `admin/*` (`toLocaleDateString("es")`) | Arreglado (`src/lib/dates.ts`, `America/Costa_Rica`) |
| P1-10 | Botones `focus:outline-none` + `focus:ring` anulaban el contorno dorado global de `:focus-visible` y mostraban anillo también al hacer clic. | `components/ui/button.tsx:31`, `input.tsx:10` | Arreglado (botones usan el foco global; campos, borde y halo verde) |

### P2 — consistencia, responsive y detalle

| # | Hallazgo | Dónde | Estado |
|---|---|---|---|
| P2-1 | Cifras en Young Serif: con todo en cero el panel dice "O restaurantes". | `shell/stat-card.tsx:29` | Arreglado (sans tabular) |
| P2-2 | Estados vacíos de una línea en gris claro ("Aún no hay..."), sin qué hacer. Con el backend recién encendido es lo único que se ve. | todas las páginas | Arreglado (`EmptyState` con siguiente paso) |
| P2-3 | Estados de orden y local en azul, violeta y esmeralda: fuera de la marca. | `lib/constants.ts:333-354` | Arreglado (crema/oro/verde; "Lista" es la única sólida) |
| P2-4 | Botones de fila de 24-28 px de alto y la "×" de categorías de 8 × 20 px; hamburguesa aplastada a 31 px por el nombre largo del local. | `tenant-actions.tsx`, `menu-manager.tsx:83-90`, `order-board.tsx:85`, `sidebar.tsx:119-127` | Arreglado (40-44 px en el teléfono, 36 px en escritorio) |
| P2-5 | Mesas desborda 21 px en 375 px (campo `w-40` + botón). | `tables/table-actions.tsx:17-22` | Arreglado |
| P2-6 | Campos de 14 px: iOS hace zoom al enfocarlos. | `components/ui/input.tsx:10` | Arreglado (16 px en el teléfono) |
| P2-7 | Tablas anchas con scroll lateral en el teléfono (Restaurantes 680 px, Pagos 640 px, Cargos 720 px). | `admin/*/page.tsx` | Arreglado (fichas en < 768 px) |
| P2-8 | Panel lateral móvil sin `role="dialog"`, sin Escape, sin manejo de foco, scroll de fondo activo, y entrada con `fade-in` desde opacidad 0. | `shell/sidebar.tsx:131-153` | Arreglado (desliza 16 px sin opacidad, sin `fill-mode`) |
| P2-9 | Tuteo en el copy de los paneles ("Aprueba", "Registra", "ofreces", "Comparte", "tienes", "Crea", "Imprímelo"). | varias | Arreglado (voseo) |
| P2-10 | Cargos escribe "$249" y "$15/u" a mano (regla 6). | `admin/charges/page.tsx:36` | Arreglado (desde `PRICING`) |
| P2-11 | Iconos de texto: "+" en botones y "×" para eliminar. | `menu-manager.tsx:41,89,110`, `table-actions.tsx:21` | Arreglado (SVG de `icon.tsx`) |
| P2-12 | Títulos de tarjeta como `<p>`: la página no tiene esquema de h2; tablas sin `caption` ni `scope`; checkboxes sin `fieldset`. | varias | Arreglado (`CardTitle` h2, `caption` sr-only, `scope`, `fieldset/legend`) |
| P2-13 | Sin "Saltar al contenido"; nav sin `aria-current`; contenido estirado a 1180 px en 1440. | `shell/sidebar.tsx` | Arreglado |
| P2-14 | Inconsistencias de jerarquía: Reportes usa otra tarjeta de cifra (`font-bold`), el "Ingresos" de Resumen otra; botones de orden "Pasar a En preparación". | `reports/page.tsx:140-148`, `admin/page.tsx:54-64`, `order-board.tsx:87` | Arreglado (`StatCard` única; botones con la acción) |

### P3 — quedan para después

- **P3-1** `logo-main.png` trae fondo blanco: sobre el crema de las pantallas de acceso se ve
  una placa blanca alrededor del logo (pasaba igual en el aviso sin backend). Pide un PNG
  transparente o un SVG del logo.
- **P3-2** El monto por defecto del pago manual es `49` escrito a mano (`payment-form.tsx`); podría
  salir del plan del local elegido.
- **P3-3** `/preview/admin` y `/preview/dashboard` (demos sin backend) heredan las primitivas
  nuevas pero conservan su propio copy y clases `slate`; conviene alinearlas cuando se toque la
  demo.
- **P3-4** Los formularios de Menú y Configuración siguen sin decir el motivo real de un fallo
  (por ejemplo, el límite del plan): eso necesita que `dashboard/actions.ts` devuelva estado (S10).
  Hoy la UI muestra un mensaje genérico que menciona el límite como causa probable.
- **P3-5** `window.confirm` es nativo y sobrio pero no lleva la marca; si se quiere, un diálogo
  propio más adelante.
- **P3-6** El selector de concepto de Cargos y los `type="color"` usan el control nativo del
  navegador.

## Qué se arregló (antes → después)

Capturas completas (42 por estado) en el scratchpad de la sesión:
`C:\Users\steve\AppData\Local\Temp\claude\C--Users-steve-OneDrive-Desktop-claude-proyectos\c8d27d0f-5a18-4c85-b145-c7245e96e732\scratchpad\capturas-paneles\antes\`
y `...\despues\` (nombre `<pantalla>-<375|1440>.png`; más `dash-menu-abierto-375.png` con el
panel lateral abierto).

- **Entrada privada** (`acceso-*.png`): de tarjeta azul noche con campos blancos ilegibles a la
  tarjeta blanca sobre crema de la marca. Medido después: texto `rgb(10,26,19)` sobre
  `rgb(255,255,255)`, etiqueta `rgb(41,37,36)`.
- **`/login`** (`login-*.png`): de slate a la familia del aviso sin backend: eyebrow dorado,
  "Ingresá a tu panel" en Young Serif, retícula QR que se desvanece, ayuda por WhatsApp. Campo de
  16 px y 44 px de alto en 375 px.
- **Shell** (todas): nav activa `rgb(34,80,58)` con texto crema, foco `2px solid rgb(184,146,63)`
  (medido), cajón móvil que abre con foco adentro, cierra con Escape y devuelve el foco al botón.
- **Resumen admin** (`admin-resumen-vacio-*.png`): de cuatro tarjetas con "O" y una línea gris a
  cinco cifras en sans tabular (incluido lo cobrado, `US$0`) y un estado vacío que explica qué
  pasa cuando entra el primer local.
- **Restaurantes / Pagos / Cargos** (`admin-*-datos-375.png`): fichas en el teléfono, estados en
  español, confirmación antes de suspender o cancelar, "Reactivar" en vez de "Aprobar" para un
  local suspendido o cancelado.
- **Órdenes** (`dash-ordenes-datos-*.png`): horas en hora de Costa Rica ("Hoy, 2:34 p. m."),
  botones de 40 px con la acción, nota del cliente en oro tenue, sin "tiempo real".
- **Mesas** (`dash-mesas-*-375.png`): sin desborde, "Abrir la carta de esta mesa" en vez de la URL
  cruda, descargar con icono de impresora y confirmación al eliminar.

## Verificación

- `npm run typecheck`, `npm run lint` y `npm run build`: en verde.
- 42 capturas después (21 pantallas × 2 anchos): todas 200, sin errores de consola, sin desborde
  horizontal; los únicos elementos < 40 px que quedan son el enlace "Saltar al contenido" (oculto
  hasta recibir foco) y un enlace dentro de un párrafo.
- Estilos computados medidos con Playwright (no solo leídos del código): ver los valores arriba.
- Animación del cajón: `animation-name: drawer-in`, `transform: none` al terminar (sin matriz
  puesta) y sin opacidad inicial.

## Preguntas para Steven

1. **¿Cómo se da de alta un restaurante en producción?** El panel admin no tiene "Crear
   restaurante" y `/register` redirige a la landing. El estado vacío dice "cuando se dé de alta el
   primero" sin prometer cómo; si el alta va a ser desde `/admin`, falta esa pantalla.
2. **Zona horaria:** las fechas se muestran en `America/Costa_Rica`. Si entra un local fuera de
   Costa Rica habría que guardar la zona en `tenant_settings`.
3. **"Cobrado"** en el Resumen suma solo mensualidades pagadas (no cargos). ¿Querés que sume
   también implementaciones y NFC, o que se muestren por separado?
4. ¿Logo en PNG transparente o SVG para las pantallas de acceso (P3-1)?
