# DataFud — Contexto completo del producto

> Documento maestro de contexto (v1.0.1). Si llegas nuevo al proyecto (persona o IA), lee
> esto primero. Responde **qué es**, **para qué sirve**, **para quién** y **cómo está
> construido**. Documentos hermanos: cómo se usa → [`USER_MANUAL.md`](./USER_MANUAL.md);
> línea de venta → [`MARKETING.md`](./MARKETING.md); marca → [`BRAND.md`](./BRAND.md);
> historial → [`CHANGELOG.md`](./CHANGELOG.md); diseño técnico →
> [`specs/`](./specs). Índice completo en [`docs/README.md`](./README.md).

---

## 1. Qué es

**DataFud** es un **SaaS multi-tenant de menú digital** para restaurantes, sodas,
cafeterías y negocios gastronómicos de Latinoamérica. El comensal escanea un **código QR**
(o toca una **tarjeta NFC**) en su mesa, ve la carta en su teléfono y envía su orden
directo a la cocina — **sin descargar nada y sin crear cuenta**. El restaurante gestiona
su menú, sus comandas en vivo y sus reportes desde un panel. El dueño del SaaS administra
todos los negocios, sus planes y sus pagos.

Tagline de marca: **"QR Menus. Orders. Analytics."**
Promesa comercial: **operando en 48 horas**, multi-idioma (ES · EN · PT) y multi-moneda
(toda Latam + USD).

## 2. Para qué sirve (problema que resuelve)

| Dolor del negocio | Cómo lo resuelve DataFud |
|---|---|
| Cartas físicas caras de imprimir y desactualizadas | Menú digital editable al instante, sin reimprimir |
| Cambiar precios/platillos es lento | El cambio es inmediato y se ve en todas las mesas |
| Toma de orden manual, errores y demoras | El cliente arma y envía su orden; llega a cocina en tiempo real |
| Cero datos del negocio | Reportes de ventas, ticket promedio y platillos top |
| Turistas / clientes extranjeros | Carta en español, inglés y portugués |
| Operar en varios países | Catálogo de monedas de toda Latam |

## 3. Para quién es (3 audiencias / roles)

| Rol | Quién | Qué hace | Dónde |
|---|---|---|---|
| `anon` (comensal) | Cliente final en la mesa | Escanea QR/NFC, ve el menú, arma y envía su orden. **Sin login.** Paga en el local | `/m/[tenant]/[mesa]` |
| `restaurant_admin` | Dueño/encargado del restaurante | Menú, mesas/QR, órdenes en vivo, reportes, configuración (moneda, idioma, branding) | `/dashboard` |
| `super_admin` | Dueño del SaaS (GaloDev) | Aprueba/suspende tenants, registra mensualidades y cargos (implementación, NFC), métricas globales | `/admin` |

## 4. Las cuatro vistas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | público | Landing comercial: propuesta de valor, cómo funciona, planes, registro |
| `/m/[tenant]/[mesa]` | anónimo (QR) | Menú del comensal + envío de orden |
| `/dashboard` | `restaurant_admin` | Menú, mesas/QR, órdenes, reportes, ajustes |
| `/admin` | `super_admin` | Restaurantes, pagos, cargos, planes, resumen |

También: `/login`, `/register` (auto-registro con trial), `/preview` (demo navegable sin
Supabase) y una ruta de acceso privada y ofuscada para el super admin.

## 5. Stack y arquitectura

- **Frontend/Backend:** Next.js 15 (App Router) — Server Components por defecto, Server
  Actions para mutaciones, React 19.
- **Datos/Auth:** Supabase (Postgres + Auth + RLS). Cliente server-side con cookies (`@supabase/ssr`).
- **Estilos:** Tailwind 3 + sistema de diseño editorial propio (ver `.impeccable.md`).
- **Validación:** Zod en los inputs. **QR:** librería `qrcode`.
- **Hosting:** Vercel. Dominio: **datafud.com**.

**Multi-tenancy:** un solo esquema Postgres con **`tenant_id` en cada tabla de negocio** +
**Row-Level Security**. El aislamiento se garantiza en la base de datos: aunque la app
tuviera un bug, un negocio nunca puede leer datos de otro.

```
src/
  app/
    (auth)/              login, registro + server actions
    admin/               panel super_admin (tenants, payments, charges, plans)
    dashboard/           panel restaurante (menu, tables, orders, reports, settings)
    m/[tenant]/[table]/  menú del cliente (QR)
    preview/             demo navegable sin backend
    page.tsx             landing (v2, editorial)
  components/  ui · shell · marketing/v2
  lib/         supabase · auth · i18n · currency · constants · utils
supabase/      schema.sql (idempotente) · verify.sql
docs/          PRODUCT.md · MARKETING.md · specs/ · plans/
```

## 6. Modelo de datos (resumen)

- **Identidad/suscripción:** `plans`, `tenants`, `profiles`, `subscription_payments`,
  **`tenant_charges`** (implementación única + NFC).
- **Menú (por tenant):** `categories`, `products`, `tables` (cada mesa con `qr_token`).
- **Órdenes:** `orders`, `order_items` (con **snapshots** de nombre y precio para que los
  reportes históricos no cambien al editar el menú).
- **Config/catálogos:** `tenant_settings`, `currencies` (Latam + USD).
- **Reportes (vistas):** `v_daily_sales`, `v_top_products`, `v_order_summary`.

## 7. Seguridad

- **RLS por `tenant_id`** en toda tabla de negocio; el `super_admin` tiene política de bypass.
- **Roles en `profiles`**, no en JWT claims editables por el usuario.
- **Cliente anónimo** no toca las tablas directamente: el menú y la orden pasan por las
  funciones `SECURITY DEFINER` `get_menu()` y `place_order()`, que validan `slug` +
  `qr_token` y **calculan los precios en el servidor** (no se confía en el cliente).
- Acceso del super admin por ruta privada ofuscada.

## 8. Planes y precios (fuente de verdad: la landing)

| | Básico | Estándar ⭐ | Empresarial |
|---|---|---|---|
| **Mensualidad** | **$29** | **$49** | **$99** |
| Idiomas | 1 | 2 | 3 (ES·EN·PT) |
| Platillos | 20 | 70 | Ilimitados |
| Categorías | 5 | 20 | Ilimitadas |
| Mesas/QR | 8 | 30 | Ilimitadas |
| Reportes avanzados | — | ✓ | ✓ |
| Soporte | Correo | Prioritario 24/7 | Dedicado WhatsApp |

- **Implementación única: $249** (pago único) — llave en mano, landing personalizada con
  dominio propio, 1 año de soporte.
- **Tarjetas NFC: $15/unidad** (add-on físico, sin suscripción extra).
- **Trial automático de 30 días** al registrarse.

> ⚠️ **Estos números viven en tres lugares y deben coincidir:**
> `src/components/marketing/v2/pricing-v2.tsx` (landing) · `src/lib/constants.ts`
> (`PRICING`) · semillas de `supabase/schema.sql` (`plans` + límites en `features`).

## 9. Internacionalización y monedas

- **Idiomas:** ES / EN / PT. Contenido traducible en columnas `*_i18n` (jsonb); UI con
  diccionarios estáticos (`src/lib/i18n`). Idiomas activos según plan.
- **Monedas:** catálogo `currencies` con toda Latam + USD; el tenant elige una en ajustes.
  Formateo según `decimal_digits` y `symbol`.

## 10. Estado actual (v1.0.1)

- ✅ Las 4 vistas implementadas; **landing rediseñada** (dirección audaz: hero con motivo QR,
  scroll pinneado, parallax, count-up, marquee) en producción como `/`.
- ✅ **Demo showcase "Verde Limón"** en `/preview`: restaurante ficticio completo con carta
  del comensal inmersiva e **interactiva** (flujo de pedido funcional sin backend), panel y admin.
- ✅ `schema.sql` idempotente: tablas, RLS, funciones, vistas, semillas. Incluye `tenant_charges`.
- ✅ Modelo de cargos (`tenant_charges`) + panel `/admin/charges` para implementación y NFC.
- ✅ Precios y límites alineados a la landing (20/70) en BD, app y spec; `PRICING` como fuente única.
- ✅ **Verificado:** `typecheck`, `lint` y `build` (21 rutas) en verde; flujos de la demo
  probados funcionalmente; sin errores de consola ni requests fallidos.
- 🔜 Pendientes priorizados: ver §11.

## 11. Deuda técnica / próximos pasos

1. **Paneles reales autenticados** (`/dashboard`, `/admin`) aún usan `slate-*`; alinear al
   sistema de marca verde/cream (la demo `/preview/dashboard` ya quedó re-brandeada).
2. **Panel del restaurante en la demo**: expandir a la experiencia completa con sidebar y
   sub-rutas (menú editable, tablero de cocina, reportes con gráficas).
3. **i18n incompleta** en UI de los paneles (mucho texto fijo en español).
4. **Storage de imágenes** (logos/platillos) descrito en el spec pero aún no cableado a
   Supabase Storage con políticas por tenant.
5. **Tests** ausentes; agregar pruebas de las RPCs `get_menu` / `place_order` y del flujo
   de órdenes.

## 12. Puesta en marcha (rápida)

```bash
# 1. BD: pega supabase/schema.sql en el SQL Editor de Supabase (idempotente)
# 2. Entorno
cp .env.example .env.local   # completa las 4 variables de Supabase
# 3. Local
npm install && npm run dev   # http://localhost:3000
# 4. Validar
npm run typecheck && npm run build
```

Cuentas demo (de las semillas): super admin `stevengalocr@gmail.com` · restaurante
`demo@datfud.com` — ambas con contraseña `Datfud2026!` (temporal, cambiar en producción).
