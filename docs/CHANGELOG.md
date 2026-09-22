# Changelog — DataFud

Todas las versiones notables del proyecto. Formato basado en
[Keep a Changelog](https://keepachangelog.com/) · versionado [SemVer](https://semver.org/).

---

## [Unreleased]

### Changed — Loop "lista para vender" (2026-09-22)
- Oferta en colones primero (D-023): Carta ₡14 900/mes, Estándar ₡24 900, Empresarial ₡49 900, con
  US$ de referencia. Implementación por tipo (Carta ₡24 900; sistema ₡125 000), primer pago visible
  por plan, pago anual de la Carta (₡149 000), oferta de fundadores y garantía de 48 h.
  Carta con 2 idiomas y 60 platillos; Estándar con 150. Hardware en colones (desde ₡6 000).
  Nuevo `formatCrc()`; JSON-LD con ofertas en CRC y USD.

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
