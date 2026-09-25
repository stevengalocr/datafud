# Changelog — DataFud

Todas las versiones notables del proyecto. Formato basado en
[Keep a Changelog](https://keepachangelog.com/) · versionado [SemVer](https://semver.org/).

---

## [Unreleased]

### Changed — Loop "pulido" (2026-09-25)
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
