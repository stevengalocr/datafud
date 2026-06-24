-- =====================================================================
-- Datfud — Digital Menu SaaS · schema.sql (idempotente)
-- Multi-tenant (tenant_id + RLS). Correr completo en Supabase SQL Editor
-- o:  psql "$DBURL" -f supabase/schema.sql
-- Es seguro correrlo varias veces (idempotente).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0) Extensiones y enums
-- ---------------------------------------------------------------------
begin;

create extension if not exists pgcrypto;

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

-- Cargos puntuales (no mensualidad): implementación llave en mano y tarjetas NFC.
do $$ begin
  create type charge_kind as enum ('implementation','nfc_cards','other');
exception when duplicate_object then null; end $$;

commit;

-- ---------------------------------------------------------------------
-- 1) Tablas core
-- ---------------------------------------------------------------------
begin;

create table if not exists public.currencies (
  code text primary key,
  name text not null,
  symbol text not null,
  decimal_digits int not null default 2
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
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

-- Cargos puntuales por tenant: implementación única ($249) y pedidos de NFC ($15/u).
-- Se registran y gestionan manualmente por el super admin, igual que las mensualidades.
create table if not exists public.tenant_charges (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  kind charge_kind not null default 'other',
  description text,
  quantity int not null default 1 check (quantity > 0),
  unit_amount_usd numeric(10,2) not null default 0,
  amount_usd numeric(10,2) not null default 0,
  status payment_status not null default 'pending',
  paid_at timestamptz,
  approved_by uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_charges_tenant on public.tenant_charges(tenant_id);

commit;

-- ---------------------------------------------------------------------
-- 2) Tablas de menú
-- ---------------------------------------------------------------------
begin;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name_i18n jsonb not null default '{}'::jsonb,
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

-- ---------------------------------------------------------------------
-- 3) Tablas de órdenes (con snapshots de precio/nombre)
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- 4) Configuración por tenant
-- ---------------------------------------------------------------------
begin;

create table if not exists public.tenant_settings (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  currency_code text not null default 'USD' references public.currencies(code),
  default_language text not null default 'es',
  enabled_languages text[] not null default array['es'],
  theme jsonb not null default '{}'::jsonb,
  logo_url text,
  restaurant_name text,
  address text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

commit;

-- ---------------------------------------------------------------------
-- 5) Funciones helper y triggers
-- ---------------------------------------------------------------------
begin;

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

-- Límite de plan genérico (max_products / max_categories / max_tables)
create or replace function public.enforce_plan_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_limit_key text := tg_argv[0];
  v_limit int;
  v_count int;
begin
  select (p.features ->> v_limit_key)::int into v_limit
  from public.tenants te join public.plans p on p.id = te.plan_id
  where te.id = new.tenant_id;

  if v_limit is null then
    return new;            -- null = ilimitado
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

-- ---------------------------------------------------------------------
-- 6) Row-Level Security
-- ---------------------------------------------------------------------
begin;

do $$
declare t text;
begin
  foreach t in array array['tenants','profiles','subscription_payments','plans',
                           'tenant_charges',
                           'categories','products','tables','orders','order_items',
                           'tenant_settings']
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- PLANS
drop policy if exists plans_read on public.plans;
create policy plans_read on public.plans for select using (true);
drop policy if exists plans_write on public.plans;
create policy plans_write on public.plans for all
  using (public.is_super_admin()) with check (public.is_super_admin());

-- PROFILES
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for select
  using (id = auth.uid() or public.is_super_admin());

-- TENANTS
drop policy if exists tenants_super on public.tenants;
create policy tenants_super on public.tenants for all
  using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists tenants_own_read on public.tenants;
create policy tenants_own_read on public.tenants for select
  using (id = public.current_tenant_id());

-- SUBSCRIPTION_PAYMENTS
drop policy if exists payments_super on public.subscription_payments;
create policy payments_super on public.subscription_payments for all
  using (public.is_super_admin()) with check (public.is_super_admin());

-- TENANT_CHARGES (implementación + NFC): el super admin gestiona todo;
-- el restaurante solo puede leer sus propios cargos.
drop policy if exists charges_super on public.tenant_charges;
create policy charges_super on public.tenant_charges for all
  using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists charges_own_read on public.tenant_charges;
create policy charges_own_read on public.tenant_charges for select
  using (tenant_id = public.current_tenant_id());

-- NOTA: el rol anónimo (cliente final) NO accede directamente a estas tablas.
-- El menú público y el envío de órdenes se hacen mediante las funciones
-- SECURITY DEFINER get_menu() y place_order() (sección 7b), que validan el
-- slug + qr_token y exponen únicamente datos seguros. Así ningún anónimo puede
-- leer datos de otros negocios ni columnas sensibles.

-- CATEGORIES
drop policy if exists categories_tenant on public.categories;
create policy categories_tenant on public.categories for all
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

-- PRODUCTS
drop policy if exists products_tenant on public.products;
create policy products_tenant on public.products for all
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

-- TABLES
drop policy if exists tables_tenant on public.tables;
create policy tables_tenant on public.tables for all
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

-- ORDERS
drop policy if exists orders_tenant on public.orders;
create policy orders_tenant on public.orders for all
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

-- ORDER_ITEMS
drop policy if exists order_items_tenant on public.order_items;
create policy order_items_tenant on public.order_items for all
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

-- TENANT_SETTINGS
drop policy if exists settings_tenant on public.tenant_settings;
create policy settings_tenant on public.tenant_settings for all
  using (tenant_id = public.current_tenant_id() or public.is_super_admin())
  with check (tenant_id = public.current_tenant_id() or public.is_super_admin());

commit;

-- ---------------------------------------------------------------------
-- 7b) RPCs públicas para el menú del cliente (rol anon)
-- ---------------------------------------------------------------------
begin;

-- Devuelve el menú completo y seguro para una mesa (slug + qr_token).
create or replace function public.get_menu(p_slug text, p_token uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_tenant public.tenants;
  v_table public.tables;
  v_settings public.tenant_settings;
  v_result jsonb;
begin
  select * into v_tenant from public.tenants where slug = p_slug;
  if not found or v_tenant.status not in ('active','trial') then
    return null;
  end if;

  select * into v_table from public.tables
    where qr_token = p_token and tenant_id = v_tenant.id and is_active;
  if not found then
    return null;
  end if;

  select * into v_settings from public.tenant_settings where tenant_id = v_tenant.id;

  select jsonb_build_object(
    'tenant', jsonb_build_object('id', v_tenant.id, 'name', v_tenant.name, 'slug', v_tenant.slug),
    'table', jsonb_build_object('id', v_table.id, 'label', v_table.label),
    'settings', jsonb_build_object(
       'currency_code', coalesce(v_settings.currency_code, 'USD'),
       'default_language', coalesce(v_settings.default_language, 'es'),
       'enabled_languages', coalesce(v_settings.enabled_languages, array['es']),
       'theme', coalesce(v_settings.theme, '{}'::jsonb),
       'logo_url', v_settings.logo_url,
       'restaurant_name', coalesce(v_settings.restaurant_name, v_tenant.name)
    ),
    'categories', coalesce((
       select jsonb_agg(jsonb_build_object(
                'id', c.id, 'name_i18n', c.name_i18n, 'sort_order', c.sort_order)
              order by c.sort_order)
       from public.categories c
       where c.tenant_id = v_tenant.id and c.is_active
    ), '[]'::jsonb),
    'products', coalesce((
       select jsonb_agg(jsonb_build_object(
                'id', p.id, 'category_id', p.category_id, 'name_i18n', p.name_i18n,
                'description_i18n', p.description_i18n, 'price', p.price,
                'image_url', p.image_url, 'sort_order', p.sort_order)
              order by p.sort_order)
       from public.products p
       where p.tenant_id = v_tenant.id and p.is_active and p.is_available
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end $$;

revoke all on function public.get_menu(text, uuid) from public;
grant execute on function public.get_menu(text, uuid) to anon, authenticated;

-- Crea una orden validando el slug + qr_token. Calcula precios reales server-side.
create or replace function public.place_order(
  p_slug text, p_token uuid, p_items jsonb, p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant public.tenants;
  v_table public.tables;
  v_currency text;
  v_order_id uuid;
  v_item jsonb;
  v_product public.products;
  v_qty int;
  v_subtotal numeric(12,2) := 0;
  v_line numeric(12,2);
begin
  select * into v_tenant from public.tenants where slug = p_slug;
  if not found or v_tenant.status not in ('active','trial') then
    raise exception 'Restaurante no disponible';
  end if;

  select * into v_table from public.tables
    where qr_token = p_token and tenant_id = v_tenant.id and is_active;
  if not found then
    raise exception 'Mesa no válida';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'La orden no tiene platillos';
  end if;

  select coalesce(currency_code, 'USD') into v_currency
    from public.tenant_settings where tenant_id = v_tenant.id;
  if v_currency is null then v_currency := 'USD'; end if;

  insert into public.orders (tenant_id, table_id, status, currency_code, subtotal, total, customer_note)
  values (v_tenant.id, v_table.id, 'pending', v_currency, 0, 0, nullif(p_note, ''))
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := greatest(1, coalesce((v_item->>'quantity')::int, 1));
    select * into v_product from public.products
      where id = (v_item->>'product_id')::uuid
        and tenant_id = v_tenant.id and is_active and is_available;
    if found then
      v_line := v_product.price * v_qty;
      v_subtotal := v_subtotal + v_line;
      insert into public.order_items (order_id, tenant_id, product_id, product_name_snapshot,
                                       unit_price_snapshot, quantity, line_total, note)
      values (v_order_id, v_tenant.id, v_product.id,
              coalesce(v_product.name_i18n->>'es', v_product.name_i18n->>'en', 'Producto'),
              v_product.price, v_qty, v_line, nullif(v_item->>'note', ''));
    end if;
  end loop;

  if v_subtotal = 0 then
    delete from public.orders where id = v_order_id;
    raise exception 'Ningún platillo válido en la orden';
  end if;

  update public.orders set subtotal = v_subtotal, total = v_subtotal where id = v_order_id;
  return v_order_id;
end $$;

revoke all on function public.place_order(text, uuid, jsonb, text) from public;
grant execute on function public.place_order(text, uuid, jsonb, text) to anon, authenticated;

commit;

-- ---------------------------------------------------------------------
-- 7) Vistas de reportes
-- ---------------------------------------------------------------------
begin;

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

create or replace view public.v_order_summary as
select
  tenant_id,
  status,
  count(*) as orders_count,
  coalesce(sum(total),0) as total_amount
from public.orders
group by tenant_id, status;

commit;

-- ---------------------------------------------------------------------
-- 8) Semilla: monedas (Latam + USD)
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- 9) Semilla: planes
-- ---------------------------------------------------------------------
begin;

insert into public.plans (code, name, price_usd, sort_order, features) values
  ('basico','Básico',29.00,1, jsonb_build_object(
     'max_languages',1,'max_products',20,'max_categories',5,'max_tables',8,
     'advanced_reports',false,'full_branding',false)),
  ('estandar','Estándar',49.00,2, jsonb_build_object(
     'max_languages',2,'max_products',70,'max_categories',20,'max_tables',30,
     'advanced_reports',true,'full_branding',true)),
  ('empresarial','Empresarial',99.00,3, jsonb_build_object(
     'max_languages',3,'max_products',null,'max_categories',null,'max_tables',null,
     'advanced_reports',true,'full_branding',true))
on conflict (code) do update
  set name = excluded.name, price_usd = excluded.price_usd,
      features = excluded.features, sort_order = excluded.sort_order;

commit;

-- ---------------------------------------------------------------------
-- 10) Semilla: super admin + tenant demo + menú + orden de ejemplo
-- Credenciales temporales:  Datfud2026!
-- super_admin: stevengalocr@gmail.com   ·   demo: demo@datfud.com
-- ---------------------------------------------------------------------
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
  v_prod_fresco uuid;
  v_order_id uuid;
begin
  select id into v_plan_estandar from public.plans where code = 'estandar';

  -- Super admin
  select id into v_super_id from auth.users where email = 'stevengalocr@gmail.com';
  if v_super_id is null then
    v_super_id := gen_random_uuid();
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change, email_change_token_new)
    values (v_super_id, '00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'stevengalocr@gmail.com', crypt('Datfud2026!', gen_salt('bf')),
      now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}',
      '', '', '', '');
  end if;

  -- Demo restaurant user
  select id into v_demo_user_id from auth.users where email = 'demo@datfud.com';
  if v_demo_user_id is null then
    v_demo_user_id := gen_random_uuid();
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change, email_change_token_new)
    values (v_demo_user_id, '00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'demo@datfud.com', crypt('Datfud2026!', gen_salt('bf')),
      now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}',
      '', '', '', '');
  end if;

  -- Tenant demo
  select id into v_tenant_id from public.tenants where slug = 'demo';
  if v_tenant_id is null then
    insert into public.tenants (name, slug, status, plan_id, trial_ends_at, owner_email, owner_name)
    values ('Soda Demo Datfud','demo','active', v_plan_estandar, now() + interval '30 days',
            'demo@datfud.com','Demo Owner')
    returning id into v_tenant_id;
  end if;

  -- Profiles
  insert into public.profiles (id, tenant_id, role, full_name)
  values (v_super_id, null, 'super_admin', 'Steven Galo')
  on conflict (id) do update set role = 'super_admin', tenant_id = null;

  insert into public.profiles (id, tenant_id, role, full_name)
  values (v_demo_user_id, v_tenant_id, 'restaurant_admin', 'Demo Admin')
  on conflict (id) do update set role = 'restaurant_admin', tenant_id = v_tenant_id;

  -- Settings demo (CRC + español)
  insert into public.tenant_settings (tenant_id, currency_code, default_language, enabled_languages,
      theme, restaurant_name)
  values (v_tenant_id, 'CRC', 'es', array['es','en'],
      jsonb_build_object('primary','#16a34a','accent','#f59e0b','admin_primary','#0ea5e9'),
      'Soda Demo Datfud')
  on conflict (tenant_id) do nothing;

  -- Categorías
  select id into v_cat_comidas from public.categories
    where tenant_id = v_tenant_id and name_i18n->>'es' = 'Comidas';
  if v_cat_comidas is null then
    insert into public.categories (tenant_id, name_i18n, sort_order)
    values (v_tenant_id, jsonb_build_object('es','Comidas','en','Meals','pt','Refeições'), 1)
    returning id into v_cat_comidas;
  end if;
  select id into v_cat_bebidas from public.categories
    where tenant_id = v_tenant_id and name_i18n->>'es' = 'Bebidas';
  if v_cat_bebidas is null then
    insert into public.categories (tenant_id, name_i18n, sort_order)
    values (v_tenant_id, jsonb_build_object('es','Bebidas','en','Drinks','pt','Bebidas'), 2)
    returning id into v_cat_bebidas;
  end if;

  -- Productos
  if not exists (select 1 from public.products where tenant_id = v_tenant_id) then
    insert into public.products (tenant_id, category_id, name_i18n, description_i18n, price, sort_order)
    values (v_tenant_id, v_cat_comidas,
      jsonb_build_object('es','Casado','en','Casado','pt','Casado'),
      jsonb_build_object('es','Arroz, frijoles, carne y ensalada','en','Rice, beans, meat and salad','pt','Arroz, feijão, carne e salada'),
      3500, 1)
    returning id into v_prod_casado;

    insert into public.products (tenant_id, category_id, name_i18n, description_i18n, price, sort_order)
    values (v_tenant_id, v_cat_comidas,
      jsonb_build_object('es','Gallo Pinto','en','Gallo Pinto','pt','Gallo Pinto'),
      jsonb_build_object('es','Arroz con frijoles típico','en','Traditional rice and beans','pt','Arroz com feijão típico'),
      2500, 2);

    insert into public.products (tenant_id, category_id, name_i18n, description_i18n, price, sort_order)
    values (v_tenant_id, v_cat_bebidas,
      jsonb_build_object('es','Fresco Natural','en','Natural Drink','pt','Suco Natural'),
      jsonb_build_object('es','Fresco del día','en','Drink of the day','pt','Suco do dia'),
      1200, 1)
    returning id into v_prod_fresco;
  else
    select id into v_prod_casado from public.products
      where tenant_id = v_tenant_id and name_i18n->>'es' = 'Casado' limit 1;
    select id into v_prod_fresco from public.products
      where tenant_id = v_tenant_id and name_i18n->>'es' = 'Fresco Natural' limit 1;
  end if;

  -- Mesas
  select id into v_table1 from public.tables where tenant_id = v_tenant_id and label = 'Mesa 1';
  if v_table1 is null then
    insert into public.tables (tenant_id, label) values (v_tenant_id, 'Mesa 1')
    returning id into v_table1;
    insert into public.tables (tenant_id, label) values (v_tenant_id, 'Mesa 2');
  end if;

  -- Orden de ejemplo
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

-- =====================================================================
-- Fin de schema.sql
-- =====================================================================
