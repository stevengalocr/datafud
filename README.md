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
2. En el **SQL Editor**, pega y ejecuta `supabase/schema.sql` (es idempotente).
3. (Opcional) Ejecuta `supabase/verify.sql` para validar que todo quedó bien.

Esto crea todas las tablas, RLS, vistas de reportes, las monedas de Latam, los 3
planes y dos cuentas de demostración:

- **Super admin:** `stevengalocr@gmail.com` · `Datfud2026!`
- **Restaurante demo:** `demo@datfud.com` · `Datfud2026!`

### 2. Variables de entorno

Copia `.env.example` a `.env.local` y completa con los datos de tu proyecto
(Supabase → Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

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
