-- =====================================================================
-- Datfud — seed.dev.sql · SOLO DESARROLLO, NUNCA EN PRODUCCIÓN
-- =====================================================================
-- Crea un super admin, un usuario y tenant demo, un menú y una orden de
-- ejemplo para probar los paneles en local. Idempotente (se puede correr
-- varias veces). Requiere haber corrido antes supabase/schema.sql.
--
-- La contraseña NO está en este archivo: se pasa como variable de psql y el
-- script aborta si no se define. Correos opcionales (tienen valor por defecto).
--
--   psql "$DBURL" \
--     -v seed_password='<tu-contraseña-de-desarrollo>' \
--     -v seed_super_email='admin@datafud.test' \
--     -v seed_demo_email='demo@datafud.test' \
--     -f supabase/seed.dev.sql
--
-- En el SQL Editor de Supabase las variables de psql no existen: no pegues este
-- archivo ahí. En producción el super admin se crea a mano desde
-- Authentication → Users y su fila en public.profiles (role = 'super_admin').
--
-- NUNCA reutilices la contraseña que estuvo en versiones anteriores de
-- schema.sql: está en el historial público del repositorio.
-- =====================================================================

-- Sin contraseña no seguimos (psql ≥ 10).
\if :{?seed_password}
\else
  \echo 'ERROR seed.dev.sql: definí la contraseña con  -v seed_password=''<tu-contraseña>''  (mínimo 12 caracteres).'
  \quit
\endif

-- Correos con valor por defecto si no se pasan.
\if :{?seed_super_email}
\else
  \set seed_super_email 'admin@datafud.test'
\endif
\if :{?seed_demo_email}
\else
  \set seed_demo_email 'demo@datafud.test'
\endif

-- psql no interpola variables dentro de bloques $$: se pasan como settings de sesión.
select set_config('seed.password', :'seed_password', false);
select set_config('seed.super_email', :'seed_super_email', false);
select set_config('seed.demo_email', :'seed_demo_email', false);

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
  -- Guardas: sin contraseña (o demasiado corta) no se crea nada. Cubre también el caso de
  -- pegar este archivo en el SQL Editor de Supabase sin definir las variables.
  if coalesce(current_setting('seed.password', true), '') = '' then
    raise exception 'seed.dev.sql: falta la contraseña. Corré: psql "$DBURL" -v seed_password=''<tu-contraseña>'' -f supabase/seed.dev.sql';
  end if;
  if length(current_setting('seed.password')) < 12 then
    raise exception 'seed.dev.sql: la contraseña debe tener al menos 12 caracteres';
  end if;
  if coalesce(current_setting('seed.super_email', true), '') = '' or coalesce(current_setting('seed.demo_email', true), '') = '' then
    raise exception 'seed.dev.sql: faltan seed.super_email / seed.demo_email (los define el encabezado del archivo)';
  end if;
  if not exists (select 1 from public.plans where code = 'estandar') then
    raise exception 'seed.dev.sql: primero corré supabase/schema.sql (no existe el plan estandar)';
  end if;

  select id into v_plan_estandar from public.plans where code = 'estandar';

  -- Super admin
  select id into v_super_id from auth.users where email = current_setting('seed.super_email');
  if v_super_id is null then
    v_super_id := gen_random_uuid();
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change, email_change_token_new)
    values (v_super_id, '00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      current_setting('seed.super_email'), crypt(current_setting('seed.password'), gen_salt('bf')),
      now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}',
      '', '', '', '');
  end if;

  -- Demo restaurant user
  select id into v_demo_user_id from auth.users where email = current_setting('seed.demo_email');
  if v_demo_user_id is null then
    v_demo_user_id := gen_random_uuid();
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change, email_change_token_new)
    values (v_demo_user_id, '00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      current_setting('seed.demo_email'), crypt(current_setting('seed.password'), gen_salt('bf')),
      now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}',
      '', '', '', '');
  end if;

  -- Tenant demo
  select id into v_tenant_id from public.tenants where slug = 'demo';
  if v_tenant_id is null then
    insert into public.tenants (name, slug, status, plan_id, trial_ends_at, owner_email, owner_name)
    values ('Soda Demo Datfud','demo','active', v_plan_estandar, now() + interval '30 days',
            current_setting('seed.demo_email'),'Demo Owner')
    returning id into v_tenant_id;
  end if;

  -- Profiles
  insert into public.profiles (id, tenant_id, role, full_name)
  values (v_super_id, null, 'super_admin', 'Super Admin (dev)')
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

-- Limpieza de los settings de sesión (la contraseña no queda en la conexión).
select set_config('seed.password', '', false);

\echo 'seed.dev.sql: listo. Super admin:' :seed_super_email ' · Demo:' :seed_demo_email
-- =====================================================================
-- Fin de seed.dev.sql
-- =====================================================================
