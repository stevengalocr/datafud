# DataFud — Menú digital para restaurantes y sodas

SaaS multi-tenant de menú digital. Los clientes piden desde su mesa escaneando un
QR; el restaurante controla su negocio en tiempo real; el dueño del SaaS administra
tenants, planes y pagos.

**Stack:** Next.js 15 (App Router) · Supabase (Postgres + Auth + RLS) · Tailwind · Vercel

## Las 3 vistas

| Ruta | Rol | Descripción |
|---|---|---|
| `/` | público | Landing con explicación del sistema y planes |
| `/m/[tenant]/[mesa]` | cliente (anónimo) | Menú virtual por QR + envío de orden |
| `/dashboard` | restaurant_admin | Menú, mesas/QR, órdenes, reportes, configuración |
| `/admin` | super_admin | Tenants, pagos, cargos (implementación/NFC), planes, métricas |

## Documentación

Centro de documentación en [`docs/`](docs/README.md). **Versión actual: v1.0.1** (ver [CHANGELOG](docs/CHANGELOG.md)).

- [`docs/PRODUCT.md`](docs/PRODUCT.md) — contexto completo: qué es, para qué, para quién y cómo está construido.
- [`docs/USER_MANUAL.md`](docs/USER_MANUAL.md) — cómo se usa, paso a paso, por rol (comensal, restaurante, super admin).
- [`docs/MARKETING.md`](docs/MARKETING.md) — línea de venta, mensajes, planes y precios.
- [`docs/BRAND.md`](docs/BRAND.md) — guía de marca: logo, color, tipografía, motion y voz.
- [`docs/CHANGELOG.md`](docs/CHANGELOG.md) — historial de versiones.
- [`docs/specs/`](docs/specs) — diseño técnico · [`docs/plans/`](docs/plans) — planes de implementación.

> 💡 ¿Solo quieres verlo funcionando? Abre **`/preview`** — recorrido por el restaurante de
> ejemplo "Verde Limón" con la carta del comensal totalmente interactiva.

> **Fuente de verdad de precios/límites:** la landing. Cualquier cambio se refleja en
> `src/components/marketing/v2/pricing-v2.tsx`, `src/lib/constants.ts` (`PRICING`) y
> `supabase/schema.sql`.

## Puesta en marcha

### 1. Base de datos (Supabase)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En el **SQL Editor**, pega y ejecuta `supabase/schema.sql` (es idempotente). Crea
   tablas, RLS, vistas de reportes, las monedas de Latam y los 3 planes. **No crea
   usuarios ni contraseñas.**
3. (Opcional) Ejecuta `supabase/verify.sql` para validar que todo quedó bien.

**Solo en desarrollo**, para tener un super admin, un restaurante demo con menú y una orden
de ejemplo, corré `supabase/seed.dev.sql` con **tu propia contraseña** (el script aborta si
no la pasás):

```bash
psql "$DBURL" -v seed_password='<definida-por-vos>' -f supabase/seed.dev.sql
```

Los correos son opcionales (`-v seed_super_email=… -v seed_demo_email=…`; por defecto
`admin@datafud.test` y `demo@datafud.test`). **Nunca corras el seed en producción:** ahí el
super admin se crea a mano en Supabase → Authentication → Users y se le asigna
`role = 'super_admin'` en `public.profiles`.

> **Aviso de seguridad.** Versiones anteriores de este repositorio (público) traían una
> contraseña semilla escrita en `schema.sql`, `README.md` y la documentación. Esa
> contraseña está en el historial de git y se considera comprometida: **no la reutilices**
> en ninguna cuenta.

### 2. Variables de entorno

Copia `.env.example` a `.env.local` y completa con los datos de tu proyecto
(Supabase → Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Opcionales de la landing (todas vacías = la página funciona igual, sin errores):

| Variable | Qué activa | Nota |
|---|---|---|
| `RESEND_API_KEY` | Formulario de contacto en `#contacto` | Sin ella se muestran solo WhatsApp y correo. |
| `RESEND_FROM_EMAIL` | Remitente del formulario | Debe ser de un **dominio verificado en Resend** (ej. `DataFud <hola@datafud.com>`). Con el valor por defecto `onboarding@resend.dev` los correos **solo le llegan al dueño de la cuenta de Resend**. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel (PageView, `Lead` en WhatsApp y formulario, `ViewContent` en la demo) | Solo el ID numérico. Sin ella no se carga nada de facebook.net. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile en el formulario | Las dos o ninguna. |

La landing es estática: cualquier cambio de estas variables en Vercel exige **redesplegar**.

**Correo de ventas:** vive en una sola línea, `SITE.email` en `src/lib/site.ts` (hoy
`galodevcr@gmail.com`). Cuando exista el buzón `hola@datafud.com`, se cambia ahí y se
redespliega; landing, legales, JSON-LD y formulario lo toman de ese valor.

**Enlaces de campaña:** si la visita llega con `utm_source`, `utm_medium` y `utm_campaign`, se
guardan en `sessionStorage` y se suman a los eventos de Vercel y del píxel. Enlaces listos en
`docs/ventas/KIT-PROSPECCION.md`.

### 3. Correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

### 4. Validar sin errores

```bash
npm run typecheck   # tipos
npm run build       # build de producción
```

### 5. QA de la landing (navegador real)

```bash
npm run build
npm run qa:landing        # levanta next start si hace falta y lo apaga al terminar
```

`scripts/qa-landing.mjs` recorre `/`, `/login`, `/terminos`, `/privacidad`, `/preview`, `/preview/cliente`, `/preview/dashboard` y las páginas de nicho en 375, 768 y
1440 px con Chromium (Playwright): errores de consola, requests fallidos, scroll horizontal,
anclas, CTAs de WhatsApp, un solo `h1`, `alt`, áreas táctiles, acordeón y menú móvil por
teclado, `/register` → `/#contacto`, `robots.txt` y `sitemap.xml`. Deja capturas por sección
en `.qa/` (ignorada por git) y sale con código 1 si algo falla. Si no tenés Chromium:
`npx playwright install chromium` (o `QA_CHROMIUM=/ruta/a/chrome`). Lighthouse no está en las
dependencias: cuando haga falta, `npx lighthouse@13 http://localhost:3000/ --form-factor=mobile`.

## Despliegue en Vercel

1. Importa el repo en Vercel.
2. Agrega las 4 variables de entorno (las mismas de `.env.local`).
3. Deploy. El build usa `next build` automáticamente.

## Seguridad

- **Multi-tenant por RLS:** cada tabla de negocio filtra por `tenant_id`. Un negocio
  jamás puede leer datos de otro, ni siquiera ante un bug de aplicación.
- **Cliente anónimo:** no accede a las tablas directamente. El menú y las órdenes
  pasan por las funciones `SECURITY DEFINER` `get_menu()` y `place_order()`, que
  validan `slug` + `qr_token` y calculan precios en el servidor (snapshots).
- **Roles:** `super_admin` y `restaurant_admin` viven en `profiles`, no en claims
  manipulables por el usuario.

## Estructura

```
src/
  app/
    (auth)/          login, registro + server actions
    admin/           panel super admin
    dashboard/       panel del restaurante
    m/[tenant]/[table]/  menú del cliente (QR)
    page.tsx         landing
  components/        ui, shell, marketing
  lib/               supabase, auth, i18n, currency, utils
supabase/
  schema.sql         esquema completo idempotente
  verify.sql         smoke test
docs/                spec y plan de implementación
```
