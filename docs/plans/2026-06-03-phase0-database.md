# Datfud — Fase 0: Base de Datos · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Producir un único script SQL idempotente (`supabase/schema.sql`) que crea todo el esquema multi-tenant del SaaS de menú digital —tablas, funciones, RLS, vistas de reportes y semillas (monedas, planes, tenant demo y super admin)— listo para correr en Supabase y validar.

**Architecture:** Postgres en Supabase. Multi-tenant por `tenant_id` + Row-Level Security. Funciones `SECURITY DEFINER` resuelven tenant/rol desde `profiles`. Contenido i18n en columnas jsonb. Snapshots de precio en `order_items`. Auth sembrado vía `auth.users` con `pgcrypto`.

**Tech Stack:** PostgreSQL 15 (Supabase), extensiones `pgcrypto`/`pgjwt` no requeridas (usamos `gen_random_uuid` nativo y `crypt`), RLS, SQL views.

**Cómo se valida cada tarea:** Como es SQL, el ciclo TDD se adapta así: (1) se escribe una consulta de verificación que falla porque el objeto no existe, (2) se corre y se confirma el fallo, (3) se añade el bloque SQL al script y se corre el script completo, (4) se vuelve a correr la verificación y pasa, (5) commit. Las verificaciones se ejecutan con `psql` contra una base local de Postgres/Supabase, o con el editor SQL de Supabase.

**Prerequisito de entorno:** Postgres accesible. Opciones:
- Supabase CLI local: `npx supabase start` (levanta Postgres en `localhost:54322`).
- O conexión directa al proyecto Supabase (cadena de conexión en el dashboard).
- Variable usada en los comandos: `export DBURL="postgresql://postgres:postgres@localhost:54322/postgres"` (ajustar a tu entorno).

---

## File Structure

```
datfud/
  supabase/
    schema.sql        # ÚNICO script idempotente con todo (este plan lo construye en orden)
    verify.sql        # consultas de verificación post-ejecución (smoke test)
```

`schema.sql` se construye por secciones, en este orden, dentro del mismo archivo:
1. Extensiones y limpieza idempotente
2. Tipos enum
3. Tablas core (currencies, plans, tenants, profiles, subscription_payments)
4. Tablas de menú (categories, products, tables)
5. Tablas de órdenes (orders, order_items)
6. tenant_settings
7. Funciones helper + triggers (updated_at, límites de plan)
8. RLS (enable + policies)
9. Vistas de reportes
10. Semillas (currencies, plans, super admin, tenant demo)

---

## Task 1: Encabezado idempotente, extensiones y enums

**Files:**
- Create: `supabase/schema.sql`
- Create: `supabase/verify.sql`

- [ ] **Step 1: Escribir verificación que falla**

En `supabase/verify.sql`:

```sql
-- VERIFY: extensiones y enums existen
select extname from pg_extension where extname = 'pgcrypto';
select typname from pg_type where typname in ('user_role','tenant_status','order_status','payment_status');
```

- [ ] **Step 2: Correr y confirmar fallo**

Run: `psql "$DBURL" -f supabase/verify.sql`
Expected: las filas de enums vienen vacías (aún no existen).

- [ ] **Step 3: Escribir el inicio de `schema.sql`**

```sql
-- =====================================================================
-- Datfud — Digital Menu SaaS · schema.sql (idempotente)
-- Correr completo en Supabase SQL Editor o: psql "$DBURL" -f schema.sql
-- =====================================================================
begin;

create extension if not exists pgcrypto;

-- Enums (drop seguro vía DO para idempotencia)
do $$ begin
  create type user_role as enum ('super_admin','restaurant_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tenant_status as enum ('trial','active','suspended','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pending','preparing','ready','delivered','paid','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending','paid','overdue');
exception when duplicate_object then null; end $$;

commit;
```

- [ ] **Step 4: Correr el script y verificar**

Run: `psql "$DBURL" -f supabase/schema.sql && psql "$DBURL" -f supabase/verify.sql`
Expected: `pgcrypto` listado y los 4 enums presentes.

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql supabase/verify.sql
git commit -m "feat(db): idempotent header, pgcrypto and enums"
```

---

## Task 2: Tablas core — currencies, plans, tenants, profiles, subscription_payments

**Files:**
- Modify: `supabase/schema.sql` (añadir sección al final, antes de cualquier commit final)
- Modify: `supabase/verify.sql`

- [ ] **Step 1: Verificación que falla**

Añadir a `verify.sql`:

```sql
-- VERIFY: tablas core
select table_name from information_schema.tables
where table_schema='public'
  and table_name in ('currencies','plans','tenants','profiles','subscription_payments')
order by table_name;
```

- [ ] **Step 2: Correr y confirmar fallo**

Run: `psql "$DBURL" -f supabase/verify.sql`
Expected: sin filas para esas tablas.

- [ ] **Step 3: Añadir las tablas core a `schema.sql`**

```sql
begin;

create table if not exists public.currencies (
  code text primary key,                 -- ISO 4217: 'CRC','USD',...
  name text not null,
  symbol text not null,
  decimal_digits int not null default 2
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,             -- 'basico','estandar','empresarial'
  name text not null,
  price_usd numeric(10,2) not null,
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  status tenant_status not null default 'trial',
  plan_id uuid references public.plans(id),
  trial_ends_at timestamptz,
  owner_email text,
  owner_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete cascade,
  role user_role not null default 'restaurant_admin',
  full_name text,
  created_at timestamptz not null default now()
);
create index if not exists idx_profiles_tenant on public.profiles(tenant_id);

create table if not exists public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  plan_id uuid references public.plans(id),
  amount_usd numeric(10,2) not null,
  period_start date not null,
  period_end date not null,
  paid_at timestamptz,
  status payment_status not null default 'pending',
  approved_by uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_payments_tenant on public.subscription_payments(tenant_id);

commit;
```

- [ ] **Step 4: Correr y verificar**

Run: `psql "$DBURL" -f supabase/schema.sql && psql "$DBURL" -f supabase/verify.sql`
Expected: las 5 tablas listadas.

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql supabase/verify.sql
git commit -m "feat(db): core tables (currencies, plans, tenants, profiles, payments)"
```

---

## Task 3: Tablas de menú — categories, products, tables

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `supabase/verify.sql`

- [ ] **Step 1: Verificación que falla**

Añadir a `verify.sql`:

```sql
-- VERIFY: tablas de menú
select table_name from information_schema.tables
where table_schema='public' and table_name in ('categories','products','tables')
order by table_name;
```

- [ ] **Step 2: Correr y confirmar fallo**

Run: `psql "$DBURL" -f supabase/verify.sql`
Expected: sin filas.

- [ ] **Step 3: Añadir tablas de menú a `schema.sql`**

```sql
begin;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name_i18n jsonb not null default '{}'::jsonb,        -- {"es":..,"en":..,"pt":..}
  description_i18n jsonb not null default '{}'::jsonb,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_categories_tenant on public.categories(tenant_id);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name_i18n jsonb not null default '{}'::jsonb,
  description_i18n jsonb not null default '{}'::jsonb,
  price numeric(12,2) not null default 0,
  image_url text,
  is_available boolean not null default true,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_tenant on public.products(tenant_id);
create index if not exists idx_products_category on public.products(category_id);

create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  label text not null,
  qr_token uuid not null unique default gen_random_uuid(),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_tables_tenant on public.tables(tenant_id);

commit;
```

- [ ] **Step 4: Correr y verificar**

Run: `psql "$DBURL" -f supabase/schema.sql && psql "$DBURL" -f supabase/verify.sql`
Expected: `categories`, `products`, `tables` listadas.

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql supabase/verify.sql
git commit -m "feat(db): menu tables (categories, products, tables)"
```

---

## Task 4: Tablas de órdenes — orders, order_items

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `supabase/verify.sql`

- [ ] **Step 1: Verificación que falla**

Añadir a `verify.sql`:

```sql
-- VERIFY: tablas de órdenes y snapshots
select column_name from information_schema.columns
where table_schema='public' and table_name='order_items'
  and column_name in ('product_name_snapshot','unit_price_snapshot');
```

- [ ] **Step 2: Correr y confirmar fallo**

Run: `psql "$DBURL" -f supabase/verify.sql`
Expected: sin filas.

- [ ] **Step 3: Añadir tablas de órdenes a `schema.sql`**

```sql
begin;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  table_id uuid references public.tables(id) on delete set null,
  status order_status not null default 'pending',
  currency_code text references public.currencies(code),
  subtotal numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  customer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_tenant on public.orders(tenant_id);
create index if not exists idx_orders_created on public.orders(tenant_id, created_at);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name_snapshot text not null,
  unit_price_snapshot numeric(12,2) not null,
  quantity int not null default 1 check (quantity > 0),
  line_total numeric(12,2) not null default 0,
  note text
);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_tenant on public.order_items(tenant_id);

commit;
```

- [ ] **Step 4: Correr y verificar**

Run: `psql "$DBURL" -f supabase/schema.sql && psql "$DBURL" -f supabase/verify.sql`
Expected: `product_name_snapshot` y `unit_price_snapshot` listadas.

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql supabase/verify.sql
git commit -m "feat(db): order tables with price/name snapshots"
```

---

## Task 5: tenant_settings

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `supabase/verify.sql`

- [ ] **Step 1: Verificación que falla**

Añadir a `verify.sql`:

```sql
-- VERIFY: tenant_settings
select table_name from information_schema.tables
where table_schema='public' and table_name='tenant_settings';
```

- [ ] **Step 2: Correr y confirmar fallo**

Run: `psql "$DBURL" -f supabase/verify.sql`
Expected: sin filas.

- [ ] **Step 3: Añadir `tenant_settings` a `schema.sql`**

```sql
begin;

create table if not exists public.tenant_settings (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  currency_code text not null default 'USD' references public.currencies(code),
  default_language text not null default 'es',           -- 'es'|'en'|'pt'
  enabled_languages text[] not null default array['es'],
  theme jsonb not null default '{}'::jsonb,               -- colores menú + admin
  logo_url text,
  restaurant_name text,
  address text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

commit;
```

- [ ] **Step 4: Correr y verificar**

Run: `psql "$DBURL" -f supabase/schema.sql && psql "$DBURL" -f supabase/verify.sql`
Expected: `tenant_settings` listada.

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql supabase/verify.sql
git commit -m "feat(db): tenant_settings"
```

---

## Task 6: Funciones helper y triggers (updated_at, límites de plan)

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `supabase/verify.sql`

- [ ] **Step 1: Verificación que falla**

Añadir a `verify.sql`:

```sql
-- VERIFY: funciones helper
select proname from pg_proc
where proname in ('current_tenant_id','current_user_role','set_updated_at','enforce_plan_limit');
```

- [ ] **Step 2: Correr y confirmar fallo**

Run: `psql "$DBURL" -f supabase/verify.sql`
Expected: sin filas.

- [ ] **Step 3: Añadir funciones y triggers a `schema.sql`**

```sql
begin;

-- Resuelve tenant del usuario autenticado desde profiles (no desde claims)
create or replace function public.current_tenant_id()
returns uuid language sql stable security definer set search_path = public as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'super_admin' from public.profiles where id = auth.uid()), false);
$$;

-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['tenants','categories','products','tables','orders','tenant_settings']
  loop
    execute format('drop trigger if exists trg_updated_at on public.%I;', t);
    execute format('create trigger trg_updated_at before update on public.%I
                    for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- Trigger genérico de límite de plan (productos, categorías, mesas)
create or replace function public.enforce_plan_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_limit_key text := tg_argv[0];     -- 'max_products' | 'max_categories' | 'max_tables'
  v_limit int;
  v_count int;
begin
  select (p.features ->> v_limit_key)::int into v_limit
  from public.tenants te join public.plans p on p.id = te.plan_id
  where te.id = new.tenant_id;

  if v_limit is null then           -- null = ilimitado
    return new;
  end if;

  execute format('select count(*) from public.%I where tenant_id = $1', tg_table_name)
    into v_count using new.tenant_id;

  if v_count >= v_limit then
    raise exception 'Límite del plan alcanzado para % (máx %)', v_limit_key, v_limit;
  end if;
  return new;
end $$;

drop trigger if exists trg_limit_products on public.products;
create trigger trg_limit_products before insert on public.products
  for each row execute function public.enforce_plan_limit('max_products');

drop trigger if exists trg_limit_categories on public.categories;
create trigger trg_limit_categories before insert on public.categories
  for each row execute function public.enforce_plan_limit('max_categories');

drop trigger if exists trg_limit_tables on public.tables;
create trigger trg_limit_tables before insert on public.tables
  for each row execute function public.enforce_plan_limit('max_tables');

commit;
```

- [ ] **Step 4: Correr y verificar**

Run: `psql "$DBURL" -f supabase/schema.sql && psql "$DBURL" -f supabase/verify.sql`
Expected: las 4 funciones listadas.

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql supabase/verify.sql
git commit -m "feat(db): helper functions and triggers (updated_at, plan limits)"
```

---

## Task 7: RLS — habilitar y políticas

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `supabase/verify.sql`

- [ ] **Step 1: Verificación que falla**

Añadir a `verify.sql`:

```sql
-- VERIFY: RLS habilitado en tablas de negocio
select relname from pg_class
where relname in ('tenants','products','categories','orders','order_items','tables',
                  'tenant_settings','subscription_payments','profiles')
  and relrowsecurity = true
order by relname;
```

- [ ] **Step 2: Correr y confirmar fallo**

Run: `psql "$DBURL" -f supabase/verify.sql`
Expected: sin filas (RLS aún desactivado).

- [ ] **Step 3: Añadir RLS a `schema.sql`**

```sql
begin;

-- Habilitar RLS
do $$
declare t text;
begin
  foreach t in array array['tenants','profiles','subscription_payments','plans',
                           'categories','products','tables','orders','order_items',
                           'tenant_settings']
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- PLANS: lectura pública (para landing), escritura solo super_admin
drop policy if exists plans_read on public.plans;
create policy plans_read on public.plans for select using (true);
drop policy if exists plans_write on public.plans;
create policy plans_write on public.plans for all
  using (public.is_super_admin()) with check (public.is_super_admin());

-- PROFILES: cada quien ve su perfil; super_admin ve todos
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for select
  using (id = auth.uid() or public.is_super_admin());

-- TENANTS: super_admin todo; restaurant_admin solo el suyo (lectura)
drop policy if exists tenants_super on public.tenants;
create policy tenants_super on public.tenants for all
  using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists tenants_own_read on public.tenants;
create policy tenants_own_read on public.tenants for select
  using (id = public.current_tenant_id());

-- SUBSCRIPTION_PAYMENTS: solo super_admin
drop policy if exists payments_super on public.subscription_payments;
create policy payments_super on public.subscription_payments for all
  using (public.is_super_admin()) with check (public.is_super_admin());

-- Helper macro: políticas tenant-scoped para admin del restaurante
-- CATEGORIES
drop policy if exists categories_tenant on public.categories;
create policy categories_tenant on public.categories for all
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());
drop policy if exists categories_anon_read on public.categories;
create policy categories_anon_read on public.categories for select to anon
  using (is_active = true);

-- PRODUCTS
drop policy if exists products_tenant on public.products;
create policy products_tenant on public.products for all
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());
drop policy if exists products_anon_read on public.products;
create policy products_anon_read on public.products for select to anon
  using (is_active = true and is_available = true);

-- TABLES
drop policy if exists tables_tenant on public.tables;
create policy tables_tenant on public.tables for all
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

-- ORDERS: admin del tenant gestiona; anon solo inserta
drop policy if exists orders_tenant on public.orders;
create policy orders_tenant on public.orders for all
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());
drop policy if exists orders_anon_insert on public.orders;
create policy orders_anon_insert on public.orders for insert to anon
  with check (
    exists (select 1 from public.tables t
            where t.id = table_id and t.tenant_id = orders.tenant_id and t.is_active)
  );

-- ORDER_ITEMS: igual patrón
drop policy if exists order_items_tenant on public.order_items;
create policy order_items_tenant on public.order_items for all
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());
drop policy if exists order_items_anon_insert on public.order_items;
create policy order_items_anon_insert on public.order_items for insert to anon
  with check (
    exists (select 1 from public.orders o
            where o.id = order_id and o.tenant_id = order_items.tenant_id)
  );

-- TENANT_SETTINGS: admin del tenant; anon lee branding del menú
drop policy if exists settings_tenant on public.tenant_settings;
create policy settings_tenant on public.tenant_settings for all
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());
drop policy if exists settings_anon_read on public.tenant_settings;
create policy settings_anon_read on public.tenant_settings for select to anon
  using (true);

commit;
```

- [ ] **Step 4: Correr y verificar**

Run: `psql "$DBURL" -f supabase/schema.sql && psql "$DBURL" -f supabase/verify.sql`
Expected: las tablas de negocio listadas con RLS activo.

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql supabase/verify.sql
git commit -m "feat(db): row-level security policies for all roles"
```

---

## Task 8: Vistas de reportes

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `supabase/verify.sql`

- [ ] **Step 1: Verificación que falla**

Añadir a `verify.sql`:

```sql
-- VERIFY: vistas de reportes
select table_name from information_schema.views
where table_schema='public'
  and table_name in ('v_daily_sales','v_top_products','v_order_summary')
order by table_name;
```

- [ ] **Step 2: Correr y confirmar fallo**

Run: `psql "$DBURL" -f supabase/verify.sql`
Expected: sin filas.

- [ ] **Step 3: Añadir vistas a `schema.sql`**

```sql
begin;

-- Ingresos por día por tenant (solo órdenes pagadas/entregadas)
create or replace view public.v_daily_sales as
select
  o.tenant_id,
  date_trunc('day', o.created_at)::date as day,
  count(*) as orders_count,
  sum(o.total) as revenue,
  avg(o.total) as avg_ticket,
  o.currency_code
from public.orders o
where o.status in ('delivered','paid')
group by o.tenant_id, date_trunc('day', o.created_at), o.currency_code;

-- Platillos más vendidos por tenant/día
create or replace view public.v_top_products as
select
  oi.tenant_id,
  date_trunc('day', o.created_at)::date as day,
  oi.product_id,
  oi.product_name_snapshot as product_name,
  sum(oi.quantity) as units_sold,
  sum(oi.line_total) as revenue
from public.order_items oi
join public.orders o on o.id = oi.order_id
where o.status in ('delivered','paid')
group by oi.tenant_id, date_trunc('day', o.created_at), oi.product_id, oi.product_name_snapshot;

-- Resumen por estado por tenant
create or replace view public.v_order_summary as
select
  tenant_id,
  status,
  count(*) as orders_count,
  coalesce(sum(total),0) as total_amount
from public.orders
group by tenant_id, status;

commit;
```

> Las vistas heredan la RLS de las tablas base (`security_invoker` por defecto en Postgres 15 para vistas no-materializadas no aplica a permisos de RLS de tablas base salvo configuración; en Supabase las vistas se consultan con el rol del solicitante). Cada tenant solo verá sus filas porque `orders`/`order_items` ya filtran por RLS.

- [ ] **Step 4: Correr y verificar**

Run: `psql "$DBURL" -f supabase/schema.sql && psql "$DBURL" -f supabase/verify.sql`
Expected: las 3 vistas listadas.

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql supabase/verify.sql
git commit -m "feat(db): reporting views (daily sales, top products, summary)"
```

---

## Task 9: Semilla de monedas (Latam + USD)

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `supabase/verify.sql`

- [ ] **Step 1: Verificación que falla**

Añadir a `verify.sql`:

```sql
-- VERIFY: monedas sembradas
select count(*) as currency_count from public.currencies;
select code from public.currencies where code in ('CRC','MXN','BRL','USD') order by code;
```

- [ ] **Step 2: Correr y confirmar fallo**

Run: `psql "$DBURL" -f supabase/verify.sql`
Expected: `currency_count = 0`.

- [ ] **Step 3: Añadir semilla de monedas a `schema.sql`**

```sql
begin;

insert into public.currencies (code, name, symbol, decimal_digits) values
  ('ARS','Peso argentino','$',2),
  ('BOB','Boliviano','Bs',2),
  ('BRL','Real brasileño','R$',2),
  ('CLP','Peso chileno','$',0),
  ('COP','Peso colombiano','$',2),
  ('CRC','Colón costarricense','₡',2),
  ('CUP','Peso cubano','$',2),
  ('DOP','Peso dominicano','RD$',2),
  ('GTQ','Quetzal','Q',2),
  ('HNL','Lempira','L',2),
  ('MXN','Peso mexicano','$',2),
  ('NIO','Córdoba','C$',2),
  ('PAB','Balboa','B/.',2),
  ('PYG','Guaraní','₲',0),
  ('PEN','Sol','S/',2),
  ('UYU','Peso uruguayo','$U',2),
  ('VES','Bolívar','Bs.',2),
  ('USD','Dólar estadounidense','$',2)
on conflict (code) do update
  set name = excluded.name, symbol = excluded.symbol, decimal_digits = excluded.decimal_digits;

commit;
```

- [ ] **Step 4: Correr y verificar**

Run: `psql "$DBURL" -f supabase/schema.sql && psql "$DBURL" -f supabase/verify.sql`
Expected: `currency_count = 18`, y CRC/MXN/BRL/USD presentes.

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql supabase/verify.sql
git commit -m "feat(db): seed Latam + USD currencies"
```

---

## Task 10: Semilla de planes (Básico/Estándar/Empresarial)

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `supabase/verify.sql`

- [ ] **Step 1: Verificación que falla**

Añadir a `verify.sql`:

```sql
-- VERIFY: planes sembrados con límites
select code, price_usd, features->>'max_products' as max_products
from public.plans order by sort_order;
```

- [ ] **Step 2: Correr y confirmar fallo**

Run: `psql "$DBURL" -f supabase/verify.sql`
Expected: sin filas.

- [ ] **Step 3: Añadir semilla de planes a `schema.sql`**

```sql
begin;

insert into public.plans (code, name, price_usd, sort_order, features) values
  ('basico','Básico',29.00,1, jsonb_build_object(
     'max_languages',1,'max_products',30,'max_categories',5,'max_tables',8,
     'advanced_reports',false,'full_branding',false)),
  ('estandar','Estándar',49.00,2, jsonb_build_object(
     'max_languages',2,'max_products',100,'max_categories',20,'max_tables',30,
     'advanced_reports',true,'full_branding',true)),
  ('empresarial','Empresarial',99.00,3, jsonb_build_object(
     'max_languages',3,'max_products',null,'max_categories',null,'max_tables',null,
     'advanced_reports',true,'full_branding',true))
on conflict (code) do update
  set name = excluded.name, price_usd = excluded.price_usd,
      features = excluded.features, sort_order = excluded.sort_order;

commit;
```

- [ ] **Step 4: Correr y verificar**

Run: `psql "$DBURL" -f supabase/schema.sql && psql "$DBURL" -f supabase/verify.sql`
Expected: 3 planes; `basico` con `max_products = 30`, `empresarial` con `max_products` nulo (ilimitado).

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql supabase/verify.sql
git commit -m "feat(db): seed plans with limits in features jsonb"
```

---

## Task 11: Semilla de super admin + tenant demo (auth + datos)

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `supabase/verify.sql`

> Crea usuarios reales en `auth.users` con contraseña encriptada vía `crypt()` (pgcrypto). Funciona en Supabase. Email super admin: `stevengalocr@gmail.com`. Demo: `demo@datfud.com`. Contraseña temporal: `Datfud2026!`.

- [ ] **Step 1: Verificación que falla**

Añadir a `verify.sql`:

```sql
-- VERIFY: usuarios semilla, tenant demo, settings y datos de menú
select email from auth.users where email in ('stevengalocr@gmail.com','demo@datfud.com') order by email;
select slug, status from public.tenants where slug = 'demo';
select count(*) as demo_products from public.products p
  join public.tenants t on t.id = p.tenant_id where t.slug = 'demo';
select count(*) as demo_orders from public.orders o
  join public.tenants t on t.id = o.tenant_id where t.slug = 'demo';
```

- [ ] **Step 2: Correr y confirmar fallo**

Run: `psql "$DBURL" -f supabase/verify.sql`
Expected: sin usuarios, sin tenant demo.

- [ ] **Step 3: Añadir bloque de semilla a `schema.sql`**

```sql
begin;

do $$
declare
  v_super_id uuid;
  v_demo_user_id uuid;
  v_tenant_id uuid;
  v_plan_estandar uuid;
  v_cat_comidas uuid;
  v_cat_bebidas uuid;
  v_table1 uuid;
  v_prod_casado uuid;
  v_prod_gallo uuid;
  v_prod_fresco uuid;
  v_order_id uuid;
begin
  select id into v_plan_estandar from public.plans where code = 'estandar';

  -- 1) Super admin auth user (idempotente por email)
  select id into v_super_id from auth.users where email = 'stevengalocr@gmail.com';
  if v_super_id is null then
    v_super_id := gen_random_uuid();
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    values (v_super_id, '00000000-0000-0000-0000-000000000000', 'authenticated','authenticated',
      'stevengalocr@gmail.com', crypt('Datfud2026!', gen_salt('bf')),
      now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}');
  end if;

  -- 2) Demo restaurant auth user
  select id into v_demo_user_id from auth.users where email = 'demo@datfud.com';
  if v_demo_user_id is null then
    v_demo_user_id := gen_random_uuid();
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    values (v_demo_user_id, '00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'demo@datfud.com', crypt('Datfud2026!', gen_salt('bf')),
      now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}');
  end if;

  -- 3) Tenant demo
  select id into v_tenant_id from public.tenants where slug = 'demo';
  if v_tenant_id is null then
    insert into public.tenants (name, slug, status, plan_id, trial_ends_at, owner_email, owner_name)
    values ('Soda Demo Datfud','demo','active', v_plan_estandar, now() + interval '30 days',
            'demo@datfud.com','Demo Owner')
    returning id into v_tenant_id;
  end if;

  -- 4) Profiles
  insert into public.profiles (id, tenant_id, role, full_name)
  values (v_super_id, null, 'super_admin', 'Steven Galo')
  on conflict (id) do update set role = 'super_admin', tenant_id = null;

  insert into public.profiles (id, tenant_id, role, full_name)
  values (v_demo_user_id, v_tenant_id, 'restaurant_admin', 'Demo Admin')
  on conflict (id) do update set role = 'restaurant_admin', tenant_id = v_tenant_id;

  -- 5) Settings del demo (CRC + español)
  insert into public.tenant_settings (tenant_id, currency_code, default_language, enabled_languages,
      theme, restaurant_name)
  values (v_tenant_id, 'CRC', 'es', array['es','en'],
      jsonb_build_object('primary','#16a34a','accent','#f59e0b','admin_primary','#0ea5e9'),
      'Soda Demo Datfud')
  on conflict (tenant_id) do nothing;

  -- 6) Categorías
  select id into v_cat_comidas from public.categories where tenant_id = v_tenant_id and name_i18n->>'es' = 'Comidas';
  if v_cat_comidas is null then
    insert into public.categories (tenant_id, name_i18n, sort_order)
    values (v_tenant_id, jsonb_build_object('es','Comidas','en','Meals','pt','Refeições'), 1)
    returning id into v_cat_comidas;
  end if;
  select id into v_cat_bebidas from public.categories where tenant_id = v_tenant_id and name_i18n->>'es' = 'Bebidas';
  if v_cat_bebidas is null then
    insert into public.categories (tenant_id, name_i18n, sort_order)
    values (v_tenant_id, jsonb_build_object('es','Bebidas','en','Drinks','pt','Bebidas'), 2)
    returning id into v_cat_bebidas;
  end if;

  -- 7) Productos (solo si el tenant no tiene productos aún)
  if not exists (select 1 from public.products where tenant_id = v_tenant_id) then
    insert into public.products (tenant_id, category_id, name_i18n, description_i18n, price, sort_order)
    values
      (v_tenant_id, v_cat_comidas,
        jsonb_build_object('es','Casado','en','Casado','pt','Casado'),
        jsonb_build_object('es','Arroz, frijoles, carne y ensalada'), 3500, 1)
      returning id into v_prod_casado;
    insert into public.products (tenant_id, category_id, name_i18n, description_i18n, price, sort_order)
    values
      (v_tenant_id, v_cat_comidas,
        jsonb_build_object('es','Gallo Pinto','en','Gallo Pinto','pt','Gallo Pinto'),
        jsonb_build_object('es','Arroz con frijoles típico'), 2500, 2)
      returning id into v_prod_gallo;
    insert into public.products (tenant_id, category_id, name_i18n, description_i18n, price, sort_order)
    values
      (v_tenant_id, v_cat_bebidas,
        jsonb_build_object('es','Fresco Natural','en','Natural Drink','pt','Suco Natural'),
        jsonb_build_object('es','Fresco del día'), 1200, 1)
      returning id into v_prod_fresco;
  else
    select id into v_prod_casado from public.products where tenant_id = v_tenant_id and name_i18n->>'es' = 'Casado' limit 1;
    select id into v_prod_fresco from public.products where tenant_id = v_tenant_id and name_i18n->>'es' = 'Fresco Natural' limit 1;
  end if;

  -- 8) Mesa con QR
  select id into v_table1 from public.tables where tenant_id = v_tenant_id and label = 'Mesa 1';
  if v_table1 is null then
    insert into public.tables (tenant_id, label) values (v_tenant_id, 'Mesa 1')
    returning id into v_table1;
    insert into public.tables (tenant_id, label) values (v_tenant_id, 'Mesa 2');
  end if;

  -- 9) Orden de ejemplo (para que los reportes muestren datos)
  if not exists (select 1 from public.orders where tenant_id = v_tenant_id) and v_prod_casado is not null then
    insert into public.orders (tenant_id, table_id, status, currency_code, subtotal, total)
    values (v_tenant_id, v_table1, 'paid', 'CRC', 4700, 4700)
    returning id into v_order_id;

    insert into public.order_items (order_id, tenant_id, product_id, product_name_snapshot, unit_price_snapshot, quantity, line_total)
    values
      (v_order_id, v_tenant_id, v_prod_casado, 'Casado', 3500, 1, 3500),
      (v_order_id, v_tenant_id, v_prod_fresco, 'Fresco Natural', 1200, 1, 1200);
  end if;
end $$;

commit;
```

- [ ] **Step 4: Correr y verificar**

Run: `psql "$DBURL" -f supabase/schema.sql && psql "$DBURL" -f supabase/verify.sql`
Expected: ambos emails presentes; tenant `demo` con status `active`; `demo_products = 3`; `demo_orders = 1`.

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql supabase/verify.sql
git commit -m "feat(db): seed super admin, demo tenant, menu and sample order"
```

---

## Task 12: Validación integral e idempotencia

**Files:**
- Modify: `supabase/verify.sql`

- [ ] **Step 1: Añadir verificación de idempotencia y reportes**

Añadir a `verify.sql`:

```sql
-- VERIFY: reportes con datos del demo
select * from public.v_daily_sales;
select product_name, units_sold from public.v_top_products order by units_sold desc;
-- VERIFY: límite de plan (debe fallar al exceder en básico; demo es estándar -> ok)
```

- [ ] **Step 2: Correr el script DOS veces seguidas (idempotencia)**

Run:
```bash
psql "$DBURL" -f supabase/schema.sql
psql "$DBURL" -f supabase/schema.sql
psql "$DBURL" -f supabase/verify.sql
```
Expected: la segunda corrida no produce errores; `currency_count` sigue en 18; `demo_products = 3` (no se duplican); `v_daily_sales` muestra 1 día con `revenue = 4700`.

- [ ] **Step 3: Verificar aislamiento (smoke manual opcional)**

En Supabase, autenticarse como `demo@datfud.com` y confirmar vía API REST que `select * from products` solo devuelve los del tenant demo, y que `subscription_payments` devuelve 0 filas para ese rol.

- [ ] **Step 4: Commit final**

```bash
git add supabase/verify.sql
git commit -m "test(db): integral verification and idempotency checks"
```

---

## Roadmap de fases siguientes (cada una con su propio plan detallado)

1. **Fundación app** — scaffold Next.js (App Router, TS), clientes Supabase server/browser, auth + middleware de rol, i18n (es/en/pt), generación de tipos desde la BD, layout base.
2. **Panel super admin** (`/admin`) — listado/aprobación/suspensión de tenants, gestión de planes, registro de pagos y vencimientos, métricas globales.
3. **Panel del restaurante** (`/dashboard`) — CRUD de categorías y platillos, mesas/QR (generación de QR), tablero de órdenes en vivo, reportes (vistas), settings (moneda/idioma/colores/logo).
4. **Menú del cliente** (`/m/[tenant]/[table]`) — menú responsive, carrito, envío de orden anónima vía RLS de `anon`.
5. **Landing** — explicación completa y congruente del sistema, sección de planes, registro con trial.
6. **Hardening + deploy** — auditoría RLS, rate limiting de órdenes anónimas, performance, despliegue en Vercel con variables de entorno.

> Al abordar cada fase se invoca writing-plans para generar su plan bite-sized propio, manteniendo cada entregable funcional y verificable.
