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
Promesa comercial: **carta digital lista en 48 horas y sistema completo en 15 días**,
multi-idioma (ES · EN · PT) y multi-moneda (toda Latam + USD).

> **Etapa actual (2026-09-19, decisión D-010): landing primero.** Producción no tiene backend
> conectado; la landing es la fachada de venta (WhatsApp + formulario) y el registro de
> autoservicio está cerrado (`/register` redirige a `/#contacto`). El backend se enciende con
> el primer cliente de un plan con pedidos. Ver `docs/MARKETING.md`.

## 2. Para qué sirve (problema que resuelve)

| Dolor del negocio | Cómo lo resuelve DataFud |
|---|---|
| Cartas físicas caras de imprimir y desactualizadas | Menú digital editable al instante, sin reimprimir |
| Cambiar precios/platillos es lento | El cambio es inmediato y se ve en todas las mesas |
| Toma de orden manual, errores y demoras | El cliente arma y envía su orden; llega al panel de cocina |
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

También: `/login`, `/register` (en esta etapa redirige a `/#contacto`), `/preview` (demo
navegable sin Supabase) y una ruta de acceso privada y ofuscada para el super admin.

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

Colones primero (lo que ve el cliente tico); USD es la moneda interna y de la BD (D-023, 2026-09-22).

| | Carta (Básico) | Estándar ⭐ | Empresarial |
|---|---|---|---|
| **Mensualidad** | **₡14 900** (≈ US$29) | **₡24 900** (≈ US$49) | **₡49 900** (≈ US$99) |
| **Implementación (pago único)** | ₡24 900 (≈ US$49) | ₡125 000 (≈ US$249) | ₡125 000 (≈ US$249) |
| **Primer pago** (implementación + primer mes) | ₡39 800 | ₡149 900 | ₡174 900 |
| Entrega prometida | 48 horas (solo carta) | 15 días (sistema completo) | 15 días (sistema completo) |
| Pedidos desde la mesa | — | ✓ | ✓ |
| Idiomas | 2 (ES·EN) | 2 (ES·EN) | 3 (ES·EN·PT) |
| Platillos | 60 | 150 | Ilimitados |
| Categorías | 5 | 20 | Ilimitadas |
| Mesas/QR | 8 | 30 | Ilimitadas |
| Reportes de venta (ventas por día, ticket promedio, platillos más vendidos) | — | ✓ | ✓ |
| Soporte | WhatsApp, mientras el plan esté activo | igual | igual |

- **Pago anual de la Carta:** ₡149 000/año (≈ US$290): 2 meses gratis e implementación de la Carta incluida.
- **Oferta de fundadores** (`PRICING.founderOffer`, activa): primeros 10 locales, implementación de la
  Carta sin costo y 1 stand QR 3D incluido, a cambio de mostrar el local como caso.
- **Garantía de 48 h:** si la carta no está publicada en 48 horas hábiles desde que recibimos menú,
  fotos y logo, no se paga la implementación. Solo la Carta tiene garantía de plazo (D-038).
- **Condiciones comerciales (2026-09-25, términos 1.1):** precios finales en colones, IVA incluido
  (D-047); "hábiles" = lunes a viernes sin feriados, desde que llega todo el material (D-048); la
  mensualidad arranca el día que la carta queda publicada (D-035); el hardware se paga por
  adelantado con la implementación, salvo el stand de fundadores (D-036); al pasar de la Carta a
  un plan con pedidos en los primeros 6 meses se descuenta la implementación de la Carta (D-034);
  el permiso de fundadores se da por WhatsApp y se puede retirar sin perder el beneficio (D-037).
- **Peso de la carta (D-043):** la carta pesa menos de 2 MB al abrirla.
- **Cambios de precios y platillos por WhatsApp** incluidos en todos los planes. **Sin permanencia**:
  se cancela con 15 días de aviso.
- **Hardware de mesa** (`PRICING.hardware`): stand QR impreso en 3D desde ₡6 000, tarjeta NFC
  ₡7 500, stand QR 3D + NFC desde ₡10 000, stand de reseñas de Google desde ₡10 000 (por unidad;
  sin mínimo; entrega gratis en la GAM, Correos fuera; de 3 a 5 días hábiles; diseño a medida por
  WhatsApp). USD de referencia: 12 / 15 / 20 / 20.
- El trial automático de 30 días sigue en la BD (`trial_ends_at`), pero el autoservicio
  está cerrado en la landing (D-011).

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
- ✅ Precios y límites alineados a la landing (60/150 desde 2026-09-22) en BD, app y spec; `PRICING` como fuente única.
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
# 1. BD: pega supabase/schema.sql en el SQL Editor de Supabase (idempotente, sin usuarios)
#    Solo en desarrollo: psql "$DBURL" -v seed_password='<definida-por-vos>' -f supabase/seed.dev.sql
# 2. Entorno
cp .env.example .env.local   # completa las 4 variables de Supabase
# 3. Local
npm install && npm run dev   # http://localhost:3000
# 4. Validar
npm run typecheck && npm run build
```

Cuentas de desarrollo: `schema.sql` ya no crea usuarios. Para un super admin y un
restaurante demo en local, corré `supabase/seed.dev.sql` con tu propia contraseña
(`psql "$DBURL" -v seed_password='<definida-por-vos>' -f supabase/seed.dev.sql`). En
producción el super admin se crea a mano desde el panel de Supabase. La contraseña que
traían versiones anteriores del repo está en el historial público y no se reutiliza.
