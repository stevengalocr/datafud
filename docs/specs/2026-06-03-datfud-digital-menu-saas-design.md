# Datfud — Digital Menu SaaS · Design Spec

**Fecha:** 2026-06-03
**Estado:** Aprobado para planificación
**Stack:** Next.js (App Router) + Supabase (Postgres + Auth + RLS + Storage) + Vercel

---

## 1. Resumen del producto

Datfud es un **SaaS multi-tenant** que da a restaurantes, sodas y nichos similares un **menú digital** que el cliente final consulta y ordena desde cualquier dispositivo escaneando un QR en su mesa. Cada negocio (tenant) administra su menú, órdenes, reportes y branding. El dueño del SaaS administra los tenants, sus planes y sus pagos.

### Modelo de negocio
- Suscripción mensual: **Básico $29 · Estándar $49 · Empresarial $99**.
- Alta por auto-registro desde la landing → **trial automático** → el super admin aprueba/suspende y registra los pagos manualmente.

---

## 2. Roles y vistas

| Rol | Quién | Qué hace |
|---|---|---|
| `super_admin` | Dueño del SaaS (stevengalocr@gmail.com) | Aprueba/suspende tenants, gestiona planes, registra pagos y vencimientos, ve métricas globales |
| `restaurant_admin` | Dueño/encargado del restaurante | Control total de su negocio: menú, categorías, platillos, mesas/QR, órdenes en vivo, reportes, configuración (moneda, idioma, colores) |
| `anon` (cliente final) | Comensal | Escanea QR de su mesa, ve el menú activo, arma y envía la orden. **Sin login.** Paga en el local |

### Las 3 aplicaciones
1. **Landing pública** — explica el sistema con 100% de congruencia con lo ofrecido, planes y CTA de registro.
2. **Panel super admin** (`/admin`) — gestión de tenants, planes, pagos, métricas.
3. **Panel del restaurante** (`/dashboard`) — gestión del negocio.
4. **Menú del cliente** (`/m/[tenant]/[mesa]`) — menú virtual + orden por QR.

---

## 3. Arquitectura

### Multi-tenancy
Un solo esquema Postgres con **`tenant_id` en cada tabla de negocio** + **Row-Level Security (RLS)**. El aislamiento de datos se garantiza a nivel de base de datos: aunque la app tuviera un bug, un tenant nunca puede leer datos de otro. El super admin tiene políticas de bypass; el `anon` solo accede a lectura de menú activo e inserción de órdenes validadas.

### Capas
- **DB (Supabase):** tablas, RLS, funciones `SECURITY DEFINER` para helpers de tenant/rol, vistas de reportes, triggers de `updated_at` y de límites de plan.
- **Auth (Supabase Auth):** email/password. Rol y tenant viven en `profiles` (no en JWT claims editables por el usuario).
- **App (Next.js App Router):** Server Components + Server Actions, cliente Supabase server-side con cookies, validación con Zod, i18n.
- **Storage (Supabase Storage):** imágenes de platillos, logos, con políticas por tenant.

---

## 4. Modelo de datos

### 4.1 Identidad y suscripción

**`plans`** — catálogo de planes.
- `id`, `code` (`basico`|`estandar`|`empresarial`), `name`, `price_usd`, `features` jsonb (límites), `is_active`, `sort_order`.

**`tenants`** — el restaurante.
- `id`, `name`, `slug` (único, para URL), `status` (`trial`|`active`|`suspended`|`cancelled`), `plan_id`, `trial_ends_at`, `owner_email`, `owner_name`, `phone`, `created_at`, `updated_at`.

**`profiles`** — enlaza `auth.users` con tenant + rol.
- `id` (= `auth.users.id`), `tenant_id` (nullable para super_admin), `role` (`super_admin`|`restaurant_admin`), `full_name`, `created_at`.

**`subscription_payments`** — historial manual de pagos.
- `id`, `tenant_id`, `plan_id`, `amount_usd`, `period_start`, `period_end`, `paid_at`, `status` (`pending`|`paid`|`overdue`), `approved_by` (super_admin id), `notes`, `created_at`.

### 4.2 Menú (por tenant)

**`categories`** — `id`, `tenant_id`, `name_i18n` jsonb `{es,en,pt}`, `description_i18n` jsonb, `image_url`, `sort_order`, `is_active`, timestamps.

**`products`** (platillos) — `id`, `tenant_id`, `category_id`, `name_i18n` jsonb, `description_i18n` jsonb, `price` numeric(12,2), `image_url`, `is_available`, `is_active`, `sort_order`, timestamps.

**`tables`** (mesas) — `id`, `tenant_id`, `label`, `qr_token` (uuid único, para la URL del QR), `is_active`, timestamps.

### 4.3 Órdenes

**`orders`** — `id`, `tenant_id`, `table_id`, `status` (`pending`|`preparing`|`ready`|`delivered`|`paid`|`cancelled`), `currency_code`, `subtotal`, `total`, `customer_note`, `created_at`, `updated_at`.

**`order_items`** — `id`, `order_id`, `tenant_id`, `product_id` (nullable si se borra el producto), `product_name_snapshot`, `unit_price_snapshot`, `quantity`, `line_total`, `note`.

> **Snapshots:** se guarda copia del nombre y precio al momento de la orden para que los reportes históricos no cambien al editar el menú.

### 4.4 Configuración y catálogos

**`tenant_settings`** — `tenant_id` (PK), `currency_code`, `default_language` (`es`|`en`|`pt`), `enabled_languages` (text[]), `theme` jsonb (colores del menú y del admin), `logo_url`, `restaurant_name`, `address`, `phone`, timestamps.

**`currencies`** — catálogo de referencia. `code` (PK), `name`, `symbol`, `decimal_digits`. Semilla con todas las de Latam + USD.

### 4.5 Vistas de reportes
- `v_daily_sales` — ingresos por tenant por día.
- `v_top_products` — platillos más vendidos por tenant/día.
- `v_order_summary` — ticket promedio, número de órdenes, estado.

---

## 5. Seguridad (RLS)

Principios:
1. **Helper functions** `SECURITY DEFINER`: `current_tenant_id()`, `current_role()` leen de `profiles` (no de claims del usuario).
2. Cada tabla de negocio: `SELECT/INSERT/UPDATE/DELETE` solo si `tenant_id = current_tenant_id()`.
3. `super_admin`: política de bypass (ve y administra todo).
4. **`anon`:**
   - `SELECT` en `categories`/`products` solo `is_active = true` del tenant resuelto por slug.
   - `INSERT` en `orders`/`order_items` validado contra una mesa real del tenant (vía `qr_token`). No puede leer órdenes ajenas, pagos, ni settings sensibles.
5. Storage: políticas por carpeta `tenant_id/`.
6. `profiles`: un usuario solo ve su propio perfil; no puede cambiar su `role`/`tenant_id`.

---

## 6. Internacionalización y monedas

- **Idiomas UI + contenido:** ES / EN / PT. Contenido traducible en `*_i18n` jsonb. UI con diccionarios estáticos.
- **Idioma activo:** `tenant_settings.default_language` + `enabled_languages` según plan.
- **Monedas:** catálogo `currencies` con todas las de Latam + USD; el tenant elige una en settings. Formateo según `decimal_digits` y `symbol`.

**Monedas semilla:** ARS, BOB, BRL, CLP, COP, CRC, CUP, DOP, GTQ, HNL, MXN, NIO, PAB, PYG, PEN, UYU, VES, USD.

---

## 7. Planes y límites

| | Básico $29 | Estándar $49 | Empresarial $99 |
|---|---|---|---|
| Idiomas | 1 | 2 | 3 |
| Platillos | 30 | 100 | Ilimitado |
| Categorías | 5 | 20 | Ilimitado |
| Mesas/QR | 8 | 30 | Ilimitado |
| Reportes avanzados | — | ✓ | ✓ |
| Branding completo | básico | ✓ | ✓ |

Límites en `plans.features` jsonb; se validan en la capa de app y, donde aplica, con triggers de conteo.

---

## 8. Cuenta demo + super admin (semillas)

- **super_admin:** `stevengalocr@gmail.com` / contraseña temporal (`Datfud2026!`).
- **Tenant demo:** `demo@datfud.com` / `Datfud2026!`, slug `demo`, plan estándar, settings en CRC + español, categorías y platillos de soda tica, mesas con QR, y órdenes de ejemplo para que los reportes muestren datos reales.

---

## 9. Estructura de proyecto (Next.js)

```
datfud/
  app/
    (marketing)/            # landing pública
    (auth)/                 # login, registro
    admin/                  # panel super_admin
    dashboard/              # panel restaurant_admin
    m/[tenant]/[table]/     # menú del cliente (QR)
    api/                    # route handlers donde se necesiten
  components/
    ui/                     # primitivos (shadcn-style)
    marketing/ dashboard/ admin/ menu/
  lib/
    supabase/               # clientes server/browser
    auth/ i18n/ currency/ validation/
  messages/                 # es.json, en.json, pt.json
  supabase/
    migrations/             # SQL versionado
    seed.sql                # demo + super admin
  docs/specs/
```

Principios: Server Components por defecto, Server Actions para mutaciones, Zod en todos los inputs, un módulo por responsabilidad, archivos enfocados.

---

## 10. Fases de implementación

0. **DB completa** (entregable inmediato): script SQL idempotente — tablas, RLS, funciones, vistas, semillas (monedas, planes, demo, super admin). Correr y validar.
1. **Fundación app:** scaffold Next.js, clientes Supabase, auth, i18n, layout base, tipos generados.
2. **Panel super admin:** tenants (aprobar/suspender), planes, pagos/vencimientos, métricas.
3. **Panel restaurante:** menú (categorías/platillos), mesas/QR, órdenes en vivo, reportes, settings (moneda/idioma/colores).
4. **Menú del cliente (QR):** menú virtual responsive + flujo de orden.
5. **Landing:** explicación completa del sistema, planes, registro — congruente con el producto.
6. **Hardening + deploy:** auditoría de seguridad, performance, Vercel + variables de entorno.

Cada fase se implementa con su propio plan de detalle (writing-plans) cuando se aborde.

---

## 11. Decisiones cerradas
- Pedido por **QR anónimo** por mesa (sin cuenta de cliente).
- Pago del pedido **en el local** (la BD solo registra montos).
- Suscripción **manual** con trial automático al registrarse.
- i18n de contenido vía **jsonb**; snapshots de precio/nombre en `order_items`.
- Multi-tenant vía `tenant_id` + **RLS**.
