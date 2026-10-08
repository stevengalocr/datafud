# Changelog — DataFud

Todas las versiones notables del proyecto. Formato basado en
[Keep a Changelog](https://keepachangelog.com/) · versionado [SemVer](https://semver.org/).

---

## [Unreleased]

### Added
- **Editar platillos desde el panel.** Cada platillo tiene un botón «Editar» con nombre, descripción
  (ES/EN/PT), categoría, precio, foto y orden; antes había que borrarlo y crearlo de nuevo.
- **Subir fotos de platillos y el logo** (requiere aplicar `schema.sql` en producción: sección 12, bucket
  `media`). Botón «Subir foto» / «Subir logo» junto al campo de dirección; la imagen se reduce en el
  navegador (1600 px, WebP) y se guarda en la carpeta del negocio. Sin el bucket, la subida avisa y el
  campo de dirección sigue funcionando. Las fotos viejas no se borran al reemplazarlas.
- `scripts/prueba-aislamiento.mjs`: con la sesión de un negocio B intenta leer, insertar, modificar y
  borrar datos de un negocio A (tablas, vistas de reportes y bucket `media` si existe) y prueba al rol
  anónimo; sale 0 si todo pasa, 1 si algo falla y 3 si la prueba quedó incompleta. Es el paso 4 de la oleada de pruebas (D-018).

### Security
- **Seguridad: las referencias entre tablas no pueden cruzar de un negocio a otro (S15; requiere aplicar
  `schema.sql` en producción).** Un platillo solo puede tener una categoría de su negocio, una orden una
  mesa de su negocio y una línea una orden y un platillo de su negocio (FK compuestas `(tenant_id, id)`,
  sección 13). El tope de pedidos por mesa de `place_order` cuenta solo órdenes del mismo negocio, así que
  otro negocio ya no puede bloquear las mesas de uno. Si alguna fila existente apuntara a otro negocio,
  `schema.sql` no la toca y avisa cuáles son. Lo comprueban `verify.sql` (filas 22 a 26) y
  `scripts/prueba-aislamiento.mjs` (sección 2b).

### Fixed — paneles en Vercel (P0, 2026-10-03)
- **«Esta página no cargó» al navegar por `/admin`, `/dashboard` y `/m/` en producción.** Causa:
  `src/lib/og.tsx` leía las fuentes de la imagen OG con `readFileSync` al importarse; Next importa
  los `opengraph-image` para armar los metadatos de toda ruta dinámica y en Vercel esos archivos no
  viajan con la función. Ahora se leen al dibujar la imagen (en el build). No era Supabase.
  Detalle y reproducción en `docs/plans/2026-10-04-paneles-en-vercel.md`.

### Changed — dependencias de Supabase (2026-10-03)
- **`@supabase/ssr` 0.5.2 → 0.12.7 y `supabase-js` 2.107 → 2.117**, la combinación compatible (la
  0.12 pide 2.114 o más). **No resolvió** el error abierto de los paneles en Vercel: toda página de
  `/admin` que crea el cliente de Supabase muestra «Esta página no cargó» sin error registrado en el
  servidor. Diagnóstico y siguientes pruebas en `docs/plans/2026-10-04-paneles-en-vercel.md`.
- `createAdminClient` con import normal en lugar de `require()` dinámico: el build ya no avisa de
  «Critical dependency» ni de `process.version` en el Edge Runtime, y Supabase no se empaqueta dos veces.
- Fuera el código muerto: `registerAction` (nadie lo importaba; era el otro uso de la `service_role`)
  y `src/lib/supabase/client.ts` (sin uso).
- `schema.sql`: los helpers de RLS y las funciones de trigger ya no se pueden ejecutar como `anon`
  (Supabase da EXECUTE a `anon` por privilegios por defecto en `public`).

### Added — S10 y P1 (2026-10-03)
- **Alta de local desde el super admin** (`/admin/tenants` → «Crear restaurante»): crea el local
  activo, el usuario del dueño, su perfil y su configuración (colones por defecto); si algo falla
  deshace todo. La contraseña temporal se muestra una sola vez, con un mensaje listo para WhatsApp.
- **Editar categorías** (`updateCategory`): nombre en tres idiomas y orden en la carta.
- **Órdenes que se actualizan solas**: el tablero se refresca cada 15 s con la pestaña a la vista
  (no es tiempo real) e indica hace cuánto se actualizó.

### Security
- **S10 cerrado:** todas las Server Actions de `/admin` y `/dashboard` validan con Zod, verifican la
  sesión y el rol en el servidor y devuelven el motivo del fallo (`ActionResult`). Los formularios lo
  muestran y bloquean el doble envío.
- **S4 cerrado:** `place_order` acepta hasta 30 platillos distintos y 20 unidades por platillo, como
  máximo 10 pedidos por mesa cada 10 minutos y 60 por local por minuto; recorta notas largas. La
  carta solo muestra los mensajes conocidos de la base. Índice nuevo `idx_orders_table_created`.
  Hay que volver a correr `schema.sql` en producción.

### Design — Movimiento, sombras y blindaje de los paneles (2026-10-03)
Informe: `docs/plans/2026-10-03-movimiento-y-blindaje.md`.
- **Profundidad con la marca:** escala de elevación `panel-xs/sm/md/lg` y `btn-primary` con
  sombras tintadas del verde más oscuro (nada de gris). Tarjetas y cifras apenas separadas del
  papel; cajón móvil, diálogo y tarjeta de acceso, encima de la página. El botón primario tiene
  brillo arriba y apoyo abajo.
- **Respuesta al toque:** botones a `scale(0.97)` en 160 ms, enlaces del menú y botones de la
  barra móvil también; hover solo con mouse (`hov:`), así un toque en el teléfono no deja el
  fondo pegado. Botones de 44 px en el teléfono.
- **Entradas sin opacidad:** cambiar de sección sube el contenido 6 px (220 ms), las cifras
  entran en cascada de 40 ms, el cajón se desliza 24 px con un velo que oscurece de a poco y los
  avisos de error bajan 4 px. Nada parte de `opacity: 0` ni deja una transformación puesta;
  con movimiento reducido no se desplaza nada.
- **Acceso blindado:** con un error, el correo se queda, la contraseña se borra y recibe el foco,
  el error se anuncia y los campos lo referencian; no se puede enviar dos veces.
- **Primitivas para los formularios:** `SubmitButton` (estado de envío sola), `useFormSubmit`
  (no vacía los campos cuando la acción falla, ignora el doble envío) y `useConfirm` (diálogo de
  confirmación con la marca en lugar de `window.confirm`).
- **Textos y cifras extremos:** una nota o un nombre sin espacios ya no ensanchan la página en
  375 px (Órdenes desbordaba 351 px); cifras grandes parten línea; conteos con separador de miles.
- **Error de panel:** «Intentar de nuevo» vuelve a pedir los datos al servidor y muestra que
  está cargando (antes solo repintaba lo mismo).
- Cerrar sesión muestra «Cerrando sesión…» y no se manda dos veces.

## [1.5.0] — 2026-10-03 · Backend encendido: Supabase en producción, S1 y S3 cerrados, paneles con la marca

Informes: `docs/plans/2026-10-03-supabase-produccion-informe.md` y
`docs/plans/2026-10-03-auditoria-paneles.md`. Decisión: D-063 (base lista, sin clientes).

### Added
- `src/instrumentation.ts`: los errores del servidor quedan en los logs de Vercel con su mensaje
  real (en producción Next solo muestra un digest).

### Design — Paneles con sesión y pantallas de acceso (2026-10-03)
- **La entrada privada se podía usar a ciegas:** lo que se escribía en correo y contraseña era
  blanco sobre blanco y las etiquetas tenían contraste 1.6:1 (`cn` no resuelve conflictos de
  Tailwind y el `bg-white` del Input ganaba). Ahora comparte el marco de `/login`.
- **`/login` con la marca:** crema, serif, retícula QR, voseo ("Ingresá a tu panel"),
  autocompletado y error anunciado; la ayuda va por WhatsApp (D-039). Sale el pendiente
  «re-brandear /login».
- **Paneles en la paleta de DataFud** (crema/verde/stone en vez de slate; estados de orden, local
  y pago sin azul, violeta ni esmeralda). Nav activa sólida con `aria-current`, panel lateral
  móvil accesible (Escape, foco, sin `opacity: 0` inicial), enlace "Saltar al contenido",
  contenido a `max-w-6xl`. Cifras en la sans tabular: en Young Serif el "0" se leía "O".
- **Estados vacíos que enseñan qué hacer** en Resumen, Restaurantes, Pagos, Cargos, Planes,
  Menú, Órdenes, Mesas y Reportes; `error.tsx` (con el código del error) y `loading.tsx` en
  `/admin` y `/dashboard`.
- **Acciones seguras:** confirmación antes de suspender o cancelar un local, eliminar una
  categoría, un platillo, una mesa (su QR impreso deja de servir) o cancelar una orden; los
  formularios avisan si la acción falla en vez de quedarse en "Registrando..." para siempre.
- **Teléfono:** fichas en vez de tablas anchas, botones de 40-44 px, campos de 16 px (sin zoom
  en iOS) y sin desborde horizontal en Mesas.
- **Copy honesto y en voseo:** Órdenes ya no dice "en tiempo real" (las nuevas aparecen al
  recargar); estados de pago en español ("Pagado", no "paid"); las cifras de Cargos salen de
  `PRICING`; los botones de orden dicen la acción ("Empezar a preparar", "Marcar lista").
- **Fechas en la hora de Costa Rica** (`src/lib/dates.ts`): en Vercel el servidor está en UTC y
  una orden de las 8 p. m. se mostraba del día siguiente; "Órdenes hoy" usa el día local.
- Informe: `docs/plans/2026-10-03-auditoria-paneles.md`.

### Security — Backend listo para encender (2026-10-03)
- **S1 cerrado en el esquema.** Las tres vistas de reportes llevan `security_invoker = true` dentro
  del `create`, así que el RLS de `orders` y `order_items` filtra por negocio. Reportes además
  filtra por `tenant_id` (defensa en profundidad).
- **S3 cerrado en el esquema.** `currencies` con RLS de solo lectura para usuarios con sesión.
- **Permisos de la Data API explícitos** (sección 11 de `schema.sql`): desde el 2026-05-30 un
  proyecto nuevo de Supabase no los da solo. `anon` no tiene ningún permiso sobre tablas ni
  vistas (solo ejecuta `get_menu` y `place_order`); `authenticated` y `service_role` leen y
  escriben las tablas y solo leen las vistas; los helpers de RLS solo para quien tiene sesión.
- **El middleware corre.** `middleware.ts` pasó a `src/middleware.ts` (la línea "Middleware"
  aparece en el build). Sin variables de Supabase no hace nada, y solo pasa por los paneles,
  `/login` y la ruta privada: la landing, las cartas y los QR no lo tocan.

### Changed
- `verify.sql` es SQL puro: una sola tabla con `ok` por fila (enums, tablas, RLS, vistas con
  `security_invoker`, monedas, planes, permisos de `anon` y `authenticated`, super admin). Corre
  en el SQL Editor de Supabase y con `psql`.
- `supabase/super-admin.sql`: el perfil del super admin, con `<correo>` a completar.
- Encabezados de los `.sql` con el nombre DataFud; comentario de Resend en `.env.example` al día
  con D-039.
- Informe y runbook del encendido: `docs/plans/2026-10-03-supabase-produccion-informe.md`.

## [1.4.1] — 2026-09-25 · Ajustes finales: fundadores en cualquier plan, plazos con material + pago, a quién le pagás

Informe: `docs/plans/ajustes-loop-report.md`.

### Changed — Loop "ajustes finales" (2026-09-25)
- **Fundadores en cualquier plan (D-057).** En la Carta, implementación sin costo; en Estándar o
  Empresarial, ₡24 900 menos en la implementación del sistema; en los dos casos 1 stand QR 3D. En
  la pastilla del hero, la tarjeta de fundadores, el FAQ y los términos.
- **Detalle del descuento de Carta a sistema (D-058):** ₡24 900 también con el pago anual; un
  fundador no tiene descuento; los 6 meses cuentan desde que la carta quedó publicada.
- **Hardware pedido después (D-059):** también por adelantado, al aprobar el diseño.
- **El plazo corre desde el material y el pago de la implementación, lo que llegue último
  (D-060):** en la garantía, el FAQ de "hábiles" y los términos.
- **"48 horas hábiles" en `<title>`/meta, OG, JSON-LD y guías (D-061).** El H1 se queda ("lista
  en 48 horas") y la línea de precio del hero dice "Garantía: carta en 48 horas hábiles".
- **Términos 1.2** (25 de setiembre de 2026). Ningún monto cambió.
- **El botón flotante de WhatsApp aparece recién al pasar el hero** (en el teléfono tapaba la
  esquina del render; el hero ya tiene su propio botón). Sin JavaScript se muestra siempre.
- **"≈ US$" en su propia línea** en todas las tarjetas de planes y de hardware.
- **El teléfono de `#demo` dice "Nuestra carta."** bajo "Verde Limón", igual que `/c/ejemplo`
  (decía "SODA TICA").
- **A quién le pagás (D-062).** `#confianza` y los términos dicen "DataFud es el nombre comercial
  con el que opera Steven Galo, responsable legal del servicio". En los términos reemplaza la
  frase anterior, que nombraba otro nombre comercial y confundía.

## [1.4.0] — 2026-09-25 · Lista para prospectar: demo con fotos reales, colón legible, condiciones comerciales cerradas

Informe: `docs/plans/pulido-loop-report.md`.

### Changed — Loop "pulido" (2026-09-25)
- **Las fuentes de marca pintan por primera vez desde el rediseño editorial.** `globals.css`
  redeclaraba `--font-sans` y `--font-display` en `:root` con Georgia y la fuente del sistema, y
  en el CSS compilado esa regla quedaba después de la de `next/font`: la web se veía en Georgia y
  Segoe UI/SF/Roboto mientras bajaba los `woff2` de Hanken Grotesk y Young Serif sin usarlos.
  Ahora pintan las de `docs/BRAND.md` (medido con CDP: Young Serif ×40 en el h1, Hanken Grotesk
  ×212 en el texto). El título del hero pasa a tres líneas a 375 px.
- **"₡" se ve igual en todos los teléfonos (D-052).** Ni Hanken Grotesk ni Young Serif tienen
  U+20A1 (verificado con fontTools): cada sistema lo dibujaba con su fuente (Times New Roman,
  Arial, Roboto…) y a 13 px podía leerse como "€". Se agrega "DataFudColon": subfuentes de Inter
  (OFL) con solo ese glifo, en 400/600/700, < 1 KB cada una, servidas desde `public/fonts/` con
  `unicode-range: U+20A1` y primeras en los stacks `sans` y `display`. Ningún otro carácter
  cambia de fuente (medido glifo por glifo con CDP en `/` y `/c/ejemplo`).
- **La imagen OG dibuja "₡14 900" en lugar de "14 900 colones"** con la misma subfuente en TTF.
- **Íconos y logo livianos.** El favicon era `icono-main.png` de 782 KB. Ahora Next sirve
  `src/app/favicon.ico` (16/32/48, 6,5 KB), `icon.png` (512 px, 15,8 KB) y `apple-icon.png`
  (180 px, 2 KB) por convención, y `layout.tsx` ya no declara `icons`. `logo-main.png` baja de
  840 KB a 42,9 KB e `icono-main.png` (el que referencia el JSON-LD) de 782 KB a 28,3 KB, con el
  mismo nombre y las mismas dimensiones (PNG con paleta).
- **Condiciones comerciales publicadas (D-034 a D-038, D-047, D-048).** Bajo los planes: "Precios
  finales en colones, IVA incluido. La mensualidad arranca el día que tu carta queda publicada".
  La FAQ pasa de 15 a 18 preguntas (IVA, cuándo empieza la mensualidad, qué son "hábiles", cómo se
  paga el hardware; envíos se une a pedido mínimo) y la de "empezar con la Carta" suma el
  descuento de la implementación dentro de los primeros 6 meses. JSON-LD `FAQPage` idéntico a lo
  visible (18 = 18). Las etiquetas de plazo de los planes dicen "hábiles". **Términos 1.1** (25 de
  setiembre de 2026): IVA incluido, plazos hábiles, inicio de la mensualidad, pago del hardware,
  paso de la Carta a un plan con pedidos, oferta de fundadores y garantía de plazo solo para la
  Carta. La web ya no promete factura electrónica. Ningún monto cambió.
- **El cierre ya no tiene un QR detrás del botón de WhatsApp (D-056).** El fondo usa
  `public/renders/ambiente-piedra-cierre.webp`, un recorte del render de piedra sin el panel del
  stand (la piedra, la tarjeta NFC y la base del stand). El QR del hero se queda. Contraste AA a
  375, 768, 1024 y 1440 px.
- **Enlace "Saltar al contenido"** en la landing, las guías y los legales: invisible hasta que
  recibe foco con el teclado y lleva a `<main id="contenido">`.
- **`/preview/dashboard`** tiene `<main>` y sus textos chicos pasan AA (el rótulo "Panel del
  restaurante" estaba en 4,18:1).

### Fixed — Loop "pulido"
- `sharp` declarado en `dependencies` (0.35.4, la versión que ya resolvía el lockfile): los
  scripts de cartas lo usan directo y antes llegaba solo como dependencia de `next`.
- `scripts/carta-kit.mjs` elige Chromium en este orden: `KIT_CHROMIUM`, `/opt/pw-browsers/chromium`
  y el de Playwright; sin ninguno (o con uno inválido) falla con un mensaje que dice
  `npx playwright install chromium`, antes de escribir nada.
- El paquete se llama `datafud` (quedaba el nombre viejo en `package.json`, el lockfile y
  `.env.example`). Los `.sql` de `supabase/` no se tocan: quedan para el loop del backend.
- `qa:landing` no cuenta como área táctil chica un enlace `sr-only` mientras está oculto.
- Revisión final de un dueño de soda sin contexto: el gallo pinto de la demo pasa a la foto tica
  (los frijoles no se leían a 96 px) y la anterior queda de portada; la hamburguesa es "de pollo",
  la pizza y el bowl dicen lo que muestran sus fotos. "Día 15" pasa a "Día hábil 15", "¿Cómo
  pago?" separa implementación y mensualidad, y el "QR provisional" se explica como la hoja de QR
  con el mismo código de los stands.
- **Las fotos de la demo muestran el platillo que nombran y se sirven desde el sitio (D-053).**
  El "gallo pinto" era un guiso de pollo, el "casado" una ensalada y la "limonada" tres cócteles;
  los panqueques llevaban una mano. Las 14 fotos (el café chorreado ya tiene la suya) son reales,
  de Unsplash o Pexels, optimizadas con `carta-fotos.mjs` y alojadas en
  `public/demo/platos/<id>.webp`; la portada de la demo pasa de una terraza frente al mar a un
  desayuno tico (`public/demo/portada.webp`). Créditos en `docs/marca/creditos-demo.md`. Donde la
  foto no calzaba con la descripción, se ajustó la descripción: el casado queda "con carne
  mechada". `/c/ejemplo` hace 0 requests a otros hosts (antes 13 a `images.unsplash.com`).
- **`/_next/image` solo acepta imágenes de Supabase Storage (D-054).** Con `hostname: "**"`
  cualquiera podía usar el optimizador del sitio como proxy. Ahora
  `/_next/image?url=https://example.com/x.jpg` responde 400.
- **`qa:landing` falla si una página pide una imagen a otro host** (antes era un aviso).

## [1.3.1] — 2026-09-25 · Imágenes de la web sin texto ni marcas inventadas; QR reales

Informe: `docs/plans/imagenes-loop-report.md`.

### Changed — Loop "imágenes" (2026-09-25)
- **El hero muestra un render del producto con su etiqueta (D-049, D-050).** `banner.png` (precios
  en euros, un carrito que la Carta no tiene, "ESCANEA" en tuteo y comida generada) se reemplaza
  por `public/renders/ambiente-mesa.webp`: un stand y una tarjeta NFC en una mesa, con el chip
  "Render ilustrativo". Su QR es real y abre `https://datafud.com/q/demo26` (D-051).
  `banner.png` se borró del repo.
- **La tarjeta NFC de `#hardware` muestra la tarjeta que se vende (D-049).** `nfc.png` (personas,
  una mano, comida generada y un disco metálico que no es el producto) se reemplaza por
  `public/renders/tarjeta-nfc.webp`, encuadrado para que la tarjeta se vea entera en 5/2 y 16/9.
  La etiqueta "Render ilustrativo" de esa pieza pasa arriba a la derecha para no tapar la tarjeta.
  `nfc.png` se borró del repo.
- **El fondo del cierre ya no muestra un restaurante inventado (D-049).** `cta-bg.png` ("THE
  WOODEN OAK", "SCAN FOR MENU", personas y comida) se reemplaza por
  `public/renders/ambiente-piedra.webp`, decorativo y bajo las mismas capas oscuras. La capa se
  estira a la derecha para que el stand caiga fuera de la columna de texto. Contraste medido
  contra el píxel más claro detrás de cada texto: todo AA a 375, 768, 1024 y 1440 px.
  `cta-bg.png` se borró del repo.

### Fixed — Loop "imágenes" (2026-09-25)
- **Los QR de los renders de estudio escanean (D-051).** `stand-qr-3d.webp`,
  `stand-qr-3d-nfc.webp` y `stand-resenas.webp` tenían un QR dibujado por la IA, con módulos
  borrosos, que no decodificaba. Se les pegó el QR real de `https://datafud.com/q/demo26` (ECC H,
  el mismo que genera el kit de entrega) con perspectiva sobre el panel blanco, negro puro y 1
  módulo de margen. Mismo nombre; pesan 35–38 KB. Decodifican el original y las variantes de
  640, 750 y 1080 px que sirve `next/image`.

### Removed — Loop "imágenes" (2026-09-25)
- `public/hardware-familia.webp`: sin uso desde que se agregó y con tres QR inventados por la IA
  que no decodifican; se servía igual en `datafud.com/hardware-familia.webp`.
- `public/libro-marca.png` pasa a `docs/marca/libro-marca.png`: sin uso en la web, con errores de
  texto ("GR Menus", "Analvtics") y una promesa ("Orders. Analytics.") que la Carta no cumple.

## [1.3.0] — 2026-09-25 · Entrega de la Carta lista

Informe: `docs/plans/entrega-loop-report.md`.

### Added — Loop "cierre de la entrega" (2026-09-25)
- **Alta de una carta desde CSV (D-046).** `scripts/carta-nueva.mjs <slug>` lee
  `entregas/<slug>/menu.csv` y `carta.json`, valida (precios, categorías, fotos que falten, límites
  del plan leídos de `PRICING`), optimiza las fotos y escribe el `.ts`, su entrada en `CARTAS` y la
  línea del código en `qr.ts`. `scripts/carta-borrar.mjs` da de baja un local dejando su código
  impreso **reservado**, nunca reutilizable.
- **Kit de entrega por carta (D-044).** `scripts/carta-kit.mjs <slug>` genera el QR en PNG a
  2000 px, una hoja tamaño carta con 4 QR para recortar y el PDF de la carta en español y en
  inglés. Sin código impreso el script se niega, y `--base` solo acepta una dirección pública:
  lo que se graba en un QR queda impreso para siempre.
- **El logo del local se pinta en la carta (D-042)**, a 52 px sobre fondo blanco. Ya viajaba en el
  payload y nadie lo mostraba, mientras la web prometía "carta a tu marca: colores, logo y fotos".
- **Subtítulo propio por local (D-045)**, con `CartaEstatica.tagline`.
- `npm run check:cartas`, que corre antes de cada `next build`.

### Changed — Loop "cierre de la entrega" (2026-09-25)
- **Las fotos se optimizan (D-043).** Una carta de 6 fotos de teléfono pasaba de 15,07 MB a
  **1,20 MB**; una de 60 platillos, de 3,65 MB a **1,69 MB al abrir**. El presupuesto por foto se
  reparte según cuántas tenga la carta: 150 KB es el techo de D-043, no el objetivo.
- El subtítulo por defecto deja de suponer cómo se ordena: "Nuestra carta." en vez de "Consultá a
  tu salonero para ordenar", que no sirve para una soda que cobra en caja.
- **El plan de 15 días de `OFERTA.md` nombra los dos desarrollos que faltan** — alta de local
  desde el super admin y editar un platillo — en vez de darlos por hechos.
- `founderOffer.remaining`: con `null` no se dice cuántos cupos quedan, con un número se dice
  "Quedan N de 10", y con 0 la oferta se apaga sola.
- `/menu-digital-costa-rica` dice de dónde salen los rangos de precio de la competencia.
- La demo estrena logo: era la única carta que no enseñaba la promesa que vende.

### Fixed — Loop "cierre de la entrega" (2026-09-25)
- **Los precios en inglés salían con coma decimal** (`$8,50`): un turista lee esa coma como
  separador de miles. El precio se escribe según el idioma en que se está leyendo la carta.
- El chequeo de códigos de QR repetidos **no veía los reservados**, así que se podía reutilizar el
  código de un local que se fue, justo lo que D-014 prohíbe.
- La regla de los códigos prohibía la letra `o` cuando el propio `demo26` la usa: sin el dígito `0`
  en el alfabeto, la `o` no se confunde con nada.
- El banner de la demo desbordaba su barra de 41 px a 375 px y se montaba sobre la carta.
- En el PDF, la cabecera podía salir de otro color (transparencia mezclada por el visor) y pesaba
  5,88 MB por las fotos reencodificadas sin pérdida: ahora color plano y **212 KB**.

## [1.2.0] — 2026-09-25 · Oferta sólida y Carta entregable

Informe: `docs/plans/oferta-loop-report.md`.

### Added — Loop "oferta sólida" (2026-09-25)
- **Carta entregable sin backend (D-040).** `/c/<slug>` publica la carta de un local desde
  `src/content/cartas/`, con el mismo formato que devuelve `get_menu`. `MenuClient` acepta
  `ordering`: en `false` no hay botones de agregar, barra de orden ni carrito, y la cabecera
  muestra solo "Menú". Nuevos `orderingTagline` y `cartaTagline` en los tres idiomas.
- **QR y NFC impresos permanentes (D-014).** `/q/<código>` redirige (307) al destino declarado en
  `src/content/qr.ts`; un código desconocido cae en `/?qr=desconocido`. Si la carta se mueve, se
  cambia una línea y el material impreso sigue sirviendo.
- **Demo del plan Carta** en `/preview/carta`: lo primero que ve un prospecto.
- `docs/ventas/OFERTA.md`: qué se vende, qué no incluye, cómo se entrega una Carta en 48 h, el
  plan de 15 días hábiles para encender el backend y las decisiones propuestas D-032 a D-038.

### Changed — Loop "oferta sólida" (2026-09-25)
- **Canal único: WhatsApp (D-039).** El correo desaparece de la web: sin tarjeta en `#contacto`,
  sin línea en el footer, sin `mailto:`, sin `email` en el JSON-LD y sin menciones en términos,
  privacidad ni FAQ. `SITE.email` pasa a `SITE.leadsEmail`, destino interno del formulario que no
  se renderiza nunca; fuera `hasEmail()` y `mailLink()`.
- **Voz de empresa (D-041).** "DataFud es una empresa costarricense dedicada a sodas, cafeterías y
  restaurantes" reemplaza a "somos un proyecto chico"; la firma del fundador pasa a la tarjeta
  "Atención DataFud"; el footer dice "DATAFUD · COSTA RICA"; los términos nombran al titular como
  "DataFud"; `authors`/`creator` y el JSON-LD dejan de decir GaloDev. Los legales siguen nombrando
  al responsable legal real.
- El hero, las tres guías, el QR de escritorio y el `sitemap` apuntan a `/preview/carta`; la
  maqueta del teléfono de `#demo` pierde el carrito y la mesa.
- Los platillos de la demo suman descripción en inglés: la carta vende el cambio ES/EN y en inglés
  mostraba las descripciones en español.
- `qa:landing` recorre además `/preview/carta` y `/c/ejemplo`.

### Fixed — Loop "oferta sólida" (2026-09-25)
- La demo decía "¡Orden enviada! La cocina ya la recibió." cuando no hay cocina ni base de datos:
  nuevo `orderSentDemo` en los tres idiomas.
- El conmutador ES/EN (32×25 px) y los chips de categoría (30 px de alto) pasan a 44 px, y los
  botones de idioma suman `aria-label`, `aria-pressed` y `lang`.
- El `sitemap` no incluía ninguna carta: una carta con `indexable: true` quedaba permitida en
  Google pero nunca anunciada.
- "Verde Limon" sin tilde en la descripción en inglés de la limonada.
- La pantalla de confirmación ya no escribe "Mesa" cuando la carta no tiene mesa.

## [1.1.0] — 2026-09-22 · Landing lista para vender

Informe: `docs/plans/venta-loop-report.md`.

### Changed — Loop "lista para vender" (2026-09-22)
- Oferta en colones primero (D-023): Carta ₡14 900/mes, Estándar ₡24 900, Empresarial ₡49 900, con
  US$ de referencia. Implementación por tipo (Carta ₡24 900; sistema ₡125 000), primer pago visible
  por plan, pago anual de la Carta (₡149 000), oferta de fundadores y garantía de 48 h.
  Carta con 2 idiomas y 60 platillos; Estándar con 150. Hardware en colones (desde ₡6 000).
  Nuevo `formatCrc()`; JSON-LD con ofertas en CRC y USD.
- Hero: "Tu carta digital con QR, lista en 48 horas", etiqueta en español, CTA "Quiero mi carta",
  línea "Desde ₡14 900/mes" y pastilla de fundadores. Title, description y OG locales. Sale
  "cierra ventas" de todo el sitio.
- `/terminos` y `/privacidad` versión 1.0: sin borrador ni `[REVISAR]`; responsable, jurisdicción,
  reembolsos, garantía del hardware, permanencia y Ley 8968.
- "Por qué DataFud" reemplaza a "Confianza": cuatro puntos verificables y firma de Steven Galo
  (avatar "SG" hasta que haya foto). Testimonios solo si hay reales; renders con "Render
  ilustrativo"; redes en el footer solo con URL.
- Preguntas frecuentes: 15, con las de Costa Rica (SINPE, factura, contrato, garantía de 48 h,
  pedido mínimo, envíos fuera de la GAM, Uber Eats/PedidosYa, qué pasa si algo falla).
- Demo: colones sin decimales ("₡2 800") en toda la app, "Mesa 1" sin duplicar, platillos más
  vendidos ordenados, voseo, /preview/admin fuera del recorrido (noindex). QR real a la carta demo
  en la landing desde tablet. `qa:landing` cubre /preview y verifica el QR.
- Landing más corta (−30 % de alto en móvil): 8 secciones en orden hero → cómo funciona → demo →
  planes → hardware → por qué DataFud → preguntas → contacto. Fuera la tira de monedas, las cifras,
  "El sistema", el bloque de ambiente y el paso a paso con fotos. Textos mínimos de 12 px.
  "Hecho en Costa Rica" en el footer.
- Medición: UTMs en los eventos de Vercel y Meta Pixel opcional (`NEXT_PUBLIC_META_PIXEL_ID`) con
  PageView, Lead (WhatsApp y formulario) y ViewContent (demo). Sin la variable no se carga nada.

### Added — Loop "lista para vender"
- Guías de SEO local: `/menu-digital-costa-rica`, `/menu-digital-para-sodas` y
  `/menu-qr-restaurantes-turisticos`, con precios desde `PRICING`, FAQ propia, OG y sitemap.
- JSON-LD `LocalBusiness` (sin dirección postal) junto a `Organization`.
- `docs/ventas/`: kit de prospección (enlaces con UTM, mensajes, guion, objeciones) y plan de
  contenido de 30 días.

### Fixed — Verificación final (V12)
- Topes de la Carta visibles (60 platillos · 5 categorías · 8 mesas con QR) y hardware "aparte" en
  planes; la landing se ve completa sin JavaScript; garantía con alcance y devolución claros;
  cancelación y aviso tardío sin contradicciones; FAQ "¿Por qué cuesta más que una carta QR que armo
  yo?"; Open Graph y Twitter completos por página; bloque en inglés en la guía de turísticos.

Fachada de venta ("landing primero", decisiones D-010 a D-013). Sin backend en producción;
cada unidad se publica en `main` desde el loop autónomo (`docs/plans/landing-loop-state.md`).

### Added
- `src/lib/site.ts`: datos de contacto centralizados (WhatsApp, correo, nombre comercial) y
  helpers `waLink` / `waProps` / `mailLink` que degradan a `#contacto` si falta el dato.
- `PRICING`: plazos por plan (`deliveryLabel`), nombre comercial del plan Básico como
  "Carta", `delivery` (48 h / 15 días) y `hardware` (stand QR 3D, tarjeta NFC, stand QR 3D +
  NFC, stand de reseñas) con precios base.
- Sección `#contacto` con WhatsApp, correo y formulario (Server Action + Zod + honeypot +
  Resend). El formulario solo se renderiza si el servidor tiene `RESEND_API_KEY`.
- Botón flotante de WhatsApp en móvil. Iconos `whatsapp`, `mail`, `menu`, `x`, `chevron-down`.
- Secciones nuevas de la landing: `#hardware` (cuatro productos desde `PRICING.hardware`,
  ilustraciones SVG de marca mientras llegan las fotos), `#demo` (teaser de "Verde Limón" en
  marco de teléfono), `#implementacion` (línea de tiempo 0 → 48 h → días 2-5 → día 15),
  `#confianza` (cuatro compromisos), `#preguntas` (acordeón accesible con 11 preguntas en
  `src/lib/faq.ts`). Nav final Producto · Hardware · Planes · Demo · Preguntas con menú móvil.
- Páginas `/terminos` y `/privacidad` (borrador con `[REVISAR]` y aviso visible).
- SEO: `sitemap.ts`, `robots.ts`, metadatos con plantilla, Open Graph y Twitter, imagen OG
  generada por página, canonical por página y JSON-LD (Organization, Product ×3, FAQPage).
- Analítica: `@vercel/analytics` con eventos `whatsapp_click {origen}`, `demo_open {vista}` y
  `contact_submit {resultado}`.
- Accesibilidad: contraste AA, áreas táctiles ≥ 44 px, foco visible global, `<main>`, orden de
  encabezados. Lighthouse móvil 96 / 100 / 96 / 100.
- Dependencias: `resend`, `@vercel/analytics`; dev: `@playwright/test`, `lighthouse`.

### Changed
- Todos los CTA de la landing abren WhatsApp con mensaje prellenado según el origen; ya no
  hay enlaces a `/register`. `/register` redirige a `/#contacto`.
- Promesas alineadas a la realidad: "Carta lista en 48 horas" y "Sistema completo en 15
  días" en highlights, stats, planes e implementación. Plan Básico se vende como "Carta"
  (sin pedidos en mesa) y cada plan muestra su plazo.
- Copy en voseo; se quitaron "tiempo real", "24/7", "exportación", "trial", "crea tu
  cuenta", "dominio propio" y las frases que insinuaban clientes existentes.
- Footer con los datos de contacto reales. `docs/MARKETING.md` y `docs/PRODUCT.md` alineados.

### Security (correcciones post-revisión 2026-09-20)
- Las semillas de usuarios salen de `supabase/schema.sql`: viven en `supabase/seed.dev.sql`
  (solo desarrollo), con la contraseña por variable de psql y guardas que abortan si falta.
  Ningún archivo vigente contiene la contraseña antigua; README avisa que está en el historial
  público y no debe reutilizarse. `verify.sql` separa las comprobaciones que dependen del seed.
- La ruta privada del super admin deja de anunciarse en `robots.txt`; `/login`, `/register` y
  la ruta privada llevan `noindex, nofollow` por metadata y por cabecera `X-Robots-Tag`.
- Formulario de contacto resistente a abuso sin infraestructura nueva: trampa de tiempo medida
  en el cliente, tope de dos enlaces por mensaje y Cloudflare Turnstile opcional
  (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`).
- `next` y `eslint-config-next` a 15.5.25 (cierra las advisories críticas de Next 15.5.19).
  `npm audit --omit=dev` queda solo con el `postcss` que Next 15 empaqueta internamente, cuyo
  arreglo exige Next 16 (salto mayor, fuera de esta etapa).

### Changed (correcciones post-revisión 2026-09-20)
- Sin "Ingresar" en nav, menú móvil ni footer. `/login` decide en el servidor: sin variables de
  Supabase muestra un aviso de marca con CTA a WhatsApp; con variables, el formulario de siempre.
- Copy sin promesas de resultado: stand de reseñas, act-break y planes Estándar/Empresarial
  (funciones reales de reportes; soporte sin adjetivos de tiempo de respuesta).
- QA de la landing como script versionado (`npm run qa:landing`, `scripts/qa-landing.mjs`);
  `lighthouse` fuera de las dependencias.
- `CLAUDE.md` en la raíz con reglas, mapa, trampas y el protocolo de alineación con el vault
  (`docs/vault-sync/`).

### Removed
- Credenciales de la cuenta demo visibles en `/login`.
- `PRICING.trialDays` (sin uso) y `lighthouse` de `devDependencies`.
- Bloque de tarjetas NFC dentro de planes (la oferta de hardware vive en `#hardware`).

---

## [1.0.1] — 2026-06-24

Primera versión documentada y verificada de punta a punta. Auditoría profesional,
landing rediseñada, demo showcase completa y documentación integral del proyecto.

### Added — Documentación
- **`docs/PRODUCT.md`** — contexto completo: qué es, para qué sirve, para quién, arquitectura, modelo de datos, seguridad, planes y estado.
- **`docs/MARKETING.md`** — línea de venta y marketing: propuesta de valor, público, mensajes, oferta/precios, objeciones, tono de marca.
- **`docs/BRAND.md`** — guía de marca: logo, paleta, tipografía, motion, voz y reglas anti-slop.
- **`docs/USER_MANUAL.md`** — manual de usuario detallado para los 3 roles (comensal, restaurante, super admin).
- **`docs/README.md`** — índice de toda la documentación.

### Added — Demo showcase "Verde Limón"
Restaurante ficticio montado de punta a punta como demostración profesional y funcional (`/preview`).
- **Datos demo ricos** (`src/lib/demo/mock.ts`): menú de 14 platillos con fotografía en 5 categorías, comandas en vivo en todos los estados, ventas de 7 días, top vendidos, 5 tenants y pagos.
- **Carta del comensal inmersiva e interactiva** (`menu-client.tsx`): header con cover dinámico, chips de categoría sticky con scroll-spy, tarjetas con foto, carrito en bottom-sheet y confirmación. Flujo de pedido funcional (agregar → carrito → enviar → confirmación) sin backend.
- **Tour de demo** rediseñado y **banner de demo** de marca con acceso a las 3 vistas.
- **Panel del restaurante** de la demo re-brandeado a la identidad DataFud con datos ricos.

### Added — Landing rediseñada (dirección audaz)
- Nuevas secciones: hero con motivo QR animado, tira de monedas (marquee) + stats con count-up, **"cómo funciona" pinneada con scroll**, "el sistema" con parallax, act-break atmosférico, cierre oscuro.
- Componentes de interacción: `scroll-progress`, `count-up`, `parallax`, `magnetic-cta`, `pinned-steps`.
- Set fotográfico de stock (licencia libre) art-dirigido a la paleta de marca.
- Motion 60fps (solo transform/opacity), con `prefers-reduced-motion` respetado.

### Added — Modelo de cargos puntuales
- Tabla **`tenant_charges`** + enum `charge_kind` (`implementation` | `nfc_cards` | `other`) con RLS (super admin gestiona; tenant lee los suyos) en `supabase/schema.sql`.
- Panel **`/admin/charges`** + acción `registerCharge` para registrar la implementación única ($249) y las tarjetas NFC ($15/u).
- Tipos `ChargeKind` / `TenantCharge` y constantes `PRICING` como única fuente de verdad de precios.

### Changed — Alineación a la línea de venta
- Límites de plan alineados a la landing: **Básico 20 / Estándar 70 platillos** (antes 30/100), en `schema.sql`, `constants.ts` y el spec.
- `pricing-v2.tsx` lee precios desde `PRICING` (landing = fuente de verdad).
- Spec de diseño actualizado (setup, NFC, límites y nota de fuente de verdad).

### Fixed
- **Rollback transaccional en el registro** (`registerAction`): si falla la creación del negocio/perfil ya no quedan usuarios huérfanos.
- Validación numérica en `registerPayment` y `registerCharge`.
- Enlace roto del logo en el nav (`/v2` → `/`).

### Removed
- Código muerto: `page.v1.bak.tsx` y los componentes v1 `marketing/landing-nav.tsx` y `marketing/pricing.tsx`.

### Tooling
- **ESLint** configurado (`eslint-config-next`); `next lint` sin errores.
- `.claude/` añadido a `.gitignore`.

### Verificación
- `tsc --noEmit`, `next lint` y `next build` (21 rutas) en verde.
- Flujos de la demo probados funcionalmente: pedido del comensal end-to-end, dashboard y admin con datos reales, formularios, sin errores de consola ni requests fallidos.
- Único warning: `@supabase/supabase-js` *Critical dependency* (benigno, upstream).

---

## [0.1.0] — 2026-06-03 → 2026-06-04

Construcción inicial del SaaS de menú digital multi-tenant.

### Added
- Esquema Postgres idempotente (`supabase/schema.sql`): tablas, RLS por `tenant_id`, funciones `SECURITY DEFINER` (`get_menu`, `place_order`), vistas de reportes y semillas (monedas Latam, planes, super admin + tenant demo).
- Las 4 vistas: landing, menú del comensal por QR (`/m/[tenant]/[table]`), panel del restaurante (`/dashboard`), panel super admin (`/admin`).
- Auth con Supabase, i18n (es/en/pt), formateo de monedas, sistema de iconos SVG y modo preview sin backend.
- Ruta privada ofuscada para el super admin.
- Sistema de diseño Editorial Culinary (`.impeccable.md`).

[1.0.1]: https://github.com/stevengalocr/datafud
[0.1.0]: https://github.com/stevengalocr/datafud
