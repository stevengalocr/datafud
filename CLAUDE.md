# DataFud

SaaS multi-tenant de menú digital por QR/NFC para restaurantes, sodas y cafeterías de Latam.
Next.js 15 (App Router) + React 19 + TypeScript + Supabase (Postgres, Auth, RLS) + Tailwind 3.
Producción en Vercel (`datafud.com`, proyecto `datafud`). Versión en `package.json`.

**Etapa actual: "landing primero" (D-010, 2026-09-19).** Producción NO tiene backend: Vercel no
tiene variables de Supabase y no se montan ahora. La landing es la fachada de venta (WhatsApp +
formulario); `/register` redirige a `/#contacto`; `/login` sin variables muestra un aviso, no
un formulario; el nav no ofrece "Ingresar". El backend se enciende con el primer cliente de un
plan con pedidos. No prometas en la landing nada que no exista: ver `docs/MARKETING.md` §9.
Desde el loop "lista para vender" (2026-09-22, D-023 a D-031) la oferta se muestra en colones
primero, la landing tiene 8 secciones, hay tres guías de SEO local y el material de venta vive en
`docs/ventas/`. Desde el loop "oferta sólida" (2026-09-25, D-014 y D-039 a D-041) **una Carta se
entrega sin backend**: se publica desde `src/content/cartas/` en `/c/<slug>`, los QR impresos
entran por `/q/<código>`, el único canal público es WhatsApp y la web habla como empresa.

## Comandos

- `npm run dev` — local en :3000 (sin `.env.local` cargan `/`, `/preview`, `/login` con aviso, legal).
- `npm run typecheck` · `npm run lint` · `npm run build` — los tres en verde antes de cada commit.
- `npm run qa:landing` — QA de la landing en navegador real (Playwright); ver `scripts/qa-landing.mjs`.
- BD: `supabase/schema.sql` (idempotente, sin usuarios) → `supabase/verify.sql`. Solo en desarrollo:
  `psql "$DBURL" -v seed_password='<tu-contraseña>' -f supabase/seed.dev.sql`.

## Mapa

- `src/app/page.tsx` landing (hero → cómo funciona → demo → planes → hardware → por qué DataFud →
  preguntas → contacto) · `src/components/marketing/v2/` secciones, `guide-page.tsx` (plantilla de
  guías), `tracking.ts` (eventos + UTMs) y `meta-pixel.tsx` (solo con `NEXT_PUBLIC_META_PIXEL_ID`).
- `src/app/(marketing)/` guías de SEO local: `/menu-digital-costa-rica`, `/menu-digital-para-sodas`,
  `/menu-qr-restaurantes-turisticos`.
- `src/app/(auth)/` login (Server Component + `login-form.tsx`), register (redirige), `actions.ts`
  (único uso de `service_role`), ruta privada del super admin (no enlazada, noindex).
- `src/app/(legal)/` términos y privacidad, versión 1.0 (cifras desde `PRICING`).
- `src/app/dashboard/` panel del restaurante · `src/app/admin/` super admin · `src/app/m/[tenant]/[table]/`
  menú del comensal (RPC `get_menu` / `place_order`, `MenuClient` con `ordering`) ·
  `src/app/preview/` demo sin backend (`/preview/carta` es la que se enseña primero).
- `src/app/c/[slug]/` **Carta publicada sin backend** (D-040), estática desde `src/content/cartas/`
  (`CARTAS`, `cartaBySlug`, los 4 pasos de alta en `index.ts`); usa `MenuClient` con
  `ordering={false}`. `src/app/q/[code]/` **redirección de los QR y NFC impresos** (D-014), con los
  destinos en `src/content/qr.ts`: el código impreso es permanente y nunca se reutiliza.
- `src/lib/site.ts` contacto, `waProps`, redes, `leadsEmail` (destino interno del formulario, que
  nunca se renderiza) y `metaPixelId()` · `constants.ts` `PRICING`
  (CRC y USD, implementación por tipo, fundadores, textos de garantía) y `TESTIMONIALS` ·
  `currency/format.ts` `formatCrc()` · `faq.ts` · `seo.ts` · `contact.ts` +
  `src/app/actions.ts` formulario · `turnstile.ts` · `env.ts` · `supabase/` clientes · `auth/` guardas.
- `supabase/schema.sql` tablas, RLS, RPC, vistas, monedas y planes · `seed.dev.sql` semillas de desarrollo.
- `docs/` PRODUCT (leer primero), USER_MANUAL, MARKETING, BRAND, CHANGELOG, `ventas/` (kit de
  prospección y contenido), `specs/`, `plans/`
  (estados e informes de los loops), `vault-sync/` (puente al vault, ver abajo).

## Reglas que no se rompen

1. El aislamiento entre negocios es RLS. Tabla nueva de negocio = `tenant_id` + índice + RLS + política
   `tenant_id = current_tenant_id() or is_super_admin()` + entrada en `verify.sql`.
2. Toda vista nueva lleva `with (security_invoker = true)`. Las tres vistas de reportes actuales
   todavía no lo tienen (hallazgo S1 del vault): arreglarlo antes de encender el backend.
3. El rol `anon` nunca recibe políticas sobre tablas. Solo RPC `security definer` con `search_path`
   fijo, `revoke all … from public` y `grant execute` explícito (hoy: `get_menu`, `place_order`).
4. Nunca usar un `tenant_id` ni un precio que venga del navegador: `place_order` lee precios de
   `products` y guarda snapshots.
5. `createAdminClient()` (`service_role`) solo en `registerAction`. Para usarlo en otro lado, preguntar.
6. Precios y límites viven en `PRICING` (`src/lib/constants.ts`) y de ahí los leen planes, hero, FAQ,
   términos, JSON-LD y guías; deben coincidir con las semillas de planes de `schema.sql` (USD y
   límites). Colones con `formatCrc()` ("₡14 900", sin decimales). Actualizar también
   `docs/MARKETING.md`, `docs/PRODUCT.md` y `docs/ventas/`.
7. `schema.sql` sigue idempotente y **sin usuarios, correos ni contraseñas**. Las semillas de personas
   solo en `seed.dev.sql`, con contraseña por variable. La contraseña que hubo en el historial está
   quemada: no se reutiliza. Nunca reescribir el historial de git.
8. Toda Server Action valida con Zod y devuelve un estado que la UI muestra (hoy lo cumplen
   `(auth)/actions.ts` y `app/actions.ts`; `dashboard/actions.ts` y `admin/actions.ts` no: S10).
9. Marca: `docs/BRAND.md` y `.impeccable.md`. Iconos solo SVG (`src/components/ui/icon.tsx`). Sin
   emojis en UI, sin texto con degradado, sin `backdrop-blur`, voseo tico natural.
10. Honestidad comercial: en la landing no van "tiempo real", "24/7", "exportación", "trial",
    "crea tu cuenta", promesas de resultado ("más ventas", "más estrellas", "llená tus mesas") ni
    testimonios, logos o cifras inventados. **Canal único (D-039):** el único contacto público es
    WhatsApp; ningún correo se muestra en la web, en los legales ni en JSON-LD, y no se agregan
    enlaces `mailto:`. **Voz de empresa (D-041):** se habla como DataFud y en plural, sin "proyecto
    chico", sin firma personal y sin "un producto de GaloDev"; eso no autoriza a inventar sociedad,
    cédula jurídica, equipo ni dirección, y los legales siguen nombrando a `SITE.legalResponsible`.
11. Cero secretos en código, docs o commits. Variables nuevas solo en `.env.example`, vacías. Toda
    función que dependa de una variable ausente degrada sin romper la página.

## Convenciones

- Server Components por defecto; `"use client"` solo con estado o eventos.
- Mutaciones en `actions.ts` junto a la ruta, con `revalidatePath` al final (los paneles) o estado
  devuelto por `useActionState` (landing).
- Contenido traducible en columnas `*_i18n` (jsonb); campos de formulario `name_es`, `name_en`, `name_pt`.
- Commits convencionales: `feat(scope):`, `fix:`, `docs:`, `design:`, `security:`, `release:`.
- Cada cambio visible entra en `docs/CHANGELOG.md` ("Unreleased"); cada release sube la versión.
- Cambios grandes: plan en `docs/plans/AAAA-MM-DD-tema.md` antes de codificar.
- Texto de UI y documentación en español de Latam.

## Trampas conocidas

- `middleware.ts` está en la raíz y la app vive en `src/`: Next lo ignora. Al encender el backend hay
  que moverlo a `src/middleware.ts` y comprobar en el log del build que aparece "Middleware".
- `NEXT_PUBLIC_SITE_URL` define la URL grabada en los QR (`dashboard/tables`); en producción debe
  ser `https://datafud.com`.
- `/preview` no toca la BD: que se vea bien ahí no prueba el flujo real.
- `next start` sirve el build que había cuando arrancó: una carta nueva en `/c/<slug>` da **404**
  hasta que se reinicia el proceso, aunque el `build` ya la haya generado. El síntoma parece un
  error del alta y no lo es.
- El alta y la baja de cartas se hacen con los scripts (`carta-nueva`, `carta-borrar`), no
  editando `src/content/cartas/index.ts` a mano. La baja deja el código de QR comentado en
  `src/content/qr.ts` **a propósito** y ese cambio se commitea (D-014).
- La landing es estática: lo que dependa de variables de entorno (formulario con `RESEND_API_KEY`,
  aviso de `/login`, Turnstile) se decide en el build. Cambiar una variable en Vercel exige redeploy.
- Las fotos reales del hardware (`public/hardware/<código>.webp`) se detectan en el build:
  subirlas exige redeploy.
- La imagen OG no puede dibujar "₡" (la fuente dinámica no baja en el build): escribir "colones".
- Quedan restos del nombre viejo "Datfud" en `package.json`, `src/lib/supabase/types.ts` y los `.sql`.
- Los triggers de límite de plan lanzan excepción: la UI tiene que mostrarla.

## Vault de Obsidian (memoria del proyecto) — protocolo de alineación

El estado, las decisiones y las prioridades viven fuera del repo, en el vault de Obsidian
(Google Drive, `Cerebro2.0/02-Proyectos/Datafud/`): `Pendientes.md`, `Decisiones.md`,
`Seguridad.md`, `Cuentas-y-Accesos.md`, `Paneles-Y-Vistas.md`, `Arquitectura-Y-Base-De-Datos.md`,
`Guia-De-Desarrollo.md`, `Marca-Y-Marketing.md`, `Plan-Landing-First.md`, `log.md`.

**Toda sesión que cambie código, oferta, seguridad o decisiones deja el vault al día.** Como las
sesiones en la nube normalmente no ven Drive, el repo lleva un archivo puente que después se aplica
al vault tal cual:

- Archivo: `docs/vault-sync/AAAA-MM-DD-<tema>.md` (uno por sesión o loop; se versiona).
- Un bloque por unidad de trabajo, con este formato exacto:
  ```
  ### <ID> · <título> · commit <hash> · despliegue <estado>
  **Pendientes.md** — ítems a cerrar (texto literal o descripción) e ítems nuevos.
  **Decisiones.md** — decisiones nuevas en ADR corto (contexto, decisión, consecuencias), o "ninguna".
  **Seguridad.md** — hallazgos S# que cambian de estado y cómo quedaron, o "sin cambios".
  **Otras páginas** — qué frase queda desactualizada en qué página y el texto nuevo propuesto.
  **log.md** — `## [AAAA-MM-DD] ingest | <título>` + 3-6 viñetas de qué se hizo y cómo se verificó.
  ```
- Si la sesión sí tiene herramientas de Google Drive, además aplica los cambios en el vault
  respetando su `CLAUDE.md` (frontmatter YAML, formato de log) y anota en el puente
  "aplicado en vault: sí"; si no, "aplicado en vault: no".
- Una unidad sin su bloque no está terminada. El vault no se toca por iniciativa propia fuera de
  este protocolo ni se escribe en `_raw/` u otros nodos.
