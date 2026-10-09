-- =====================================================================
-- DataFud — verify.sql · comprobación después de schema.sql
-- SQL puro (sin comandos de psql): se pega completo en el SQL Editor de
-- Supabase o se corre con  psql "$DBURL" -f supabase/verify.sql
-- Devuelve una sola tabla de 51 filas. Esperado: ok = true en las 51.
-- Si una fila da false, `chequeo` dice qué mira y, en las de políticas, funciones y reglas,
-- entre paréntesis qué sobra o qué falta.
-- Notas:
--   · Las filas de Storage (16 y 25 a 33) dan false hasta aplicar la sección 12 de schema.sql.
--   · Las filas S15 (34 a 38): la 37 cuenta filas que ya apuntan a otro negocio (si no es 0,
--     schema.sql avisó cuáles con un WARNING).
--   · La 47 y la 48 (pagos repetidos) y la 49 (reglas CHECK) dan false si hay filas viejas que no
--     cumplen; schema.sql avisó cuáles con un WARNING y la consulta para listarlas. Si el SQL
--     Editor no muestra los WARNING, estas filas igual lo dicen: la regla exacta de cada CHECK
--     está en schema.sql, sección 14b, y las filas se ven con
--       select * from public.<tabla> where not (<regla>);
--     los pagos repetidos, con
--       select tenant_id, period_start, period_end, count(*) from public.subscription_payments
--        group by 1, 2, 3 having count(*) > 1;
--     y las referencias entre negocios (fila 37), con las consultas del encabezado de la sección 13.
--   · La última fila (super admin) da false hasta crear el super admin a mano.
-- Ninguna fila falla con error si falta algo de schema.sql: da false (sirve también antes de
-- aplicar la versión nueva, para ver qué falta).
--
-- ANTES de aplicar schema.sql 1.7.0: el plan Básico («Carta») no incluye pedidos desde la mesa, y
-- desde 1.7.0 la base lo hace cumplir. Para ver qué locales van a dejar de recibir pedidos por la
-- carta (los de plan basico), correr aparte:
--   select t.slug, t.name, t.status, coalesce(p.code, '(sin plan: recibe pedidos)') as plan,
--          coalesce((p.features -> 'table_ordering')::text, '(sin la clave: recibe pedidos)') as table_ordering
--     from public.tenants t left join public.plans p on p.id = t.plan_id
--    order by p.code nulls first, t.slug;
-- Un local de prueba que tenga que recibir pedidos se pasa a estandar desde /admin antes.
-- =====================================================================

with rel as (
  select c.oid, c.relname, c.relkind, c.relrowsecurity, c.reloptions
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r', 'v')
),
tablas as (select * from rel where relkind = 'r'),
vistas as (
  select * from rel
  where relkind = 'v' and relname in ('v_daily_sales', 'v_top_products', 'v_order_summary')
),
-- Funciones propias de public (sin las que trae una extensión instalada en public).
funciones as (
  select p.oid, p.proname, p.oid::regprocedure::text as firma, p.prosecdef, p.proconfig, p.prosrc
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and not exists (select 1 from pg_depend d
                      where d.classid = 'pg_proc'::regclass and d.objid = p.oid and d.deptype = 'e')
),
rpc (firma) as (values
  ('public.get_menu(text, uuid)'),
  ('public.place_order(text, uuid, jsonb, text, uuid)')
),
-- AS-2: las políticas que crea schema.sql, exactas (nombre, operación; todas para authenticated).
pol_esperadas (esquema, tabla, nombre, cmd) as (values
  ('public', 'currencies', 'currencies_read', 'SELECT'),
  ('public', 'plans', 'plans_read', 'SELECT'),
  ('public', 'plans', 'plans_write', 'ALL'),
  ('public', 'profiles', 'profiles_self', 'SELECT'),
  ('public', 'tenants', 'tenants_super', 'ALL'),
  ('public', 'tenants', 'tenants_own_read', 'SELECT'),
  ('public', 'subscription_payments', 'payments_super', 'ALL'),
  ('public', 'tenant_charges', 'charges_super', 'ALL'),
  ('public', 'tenant_charges', 'charges_own_read', 'SELECT'),
  ('public', 'categories', 'categories_tenant', 'ALL'),
  ('public', 'products', 'products_tenant', 'ALL'),
  ('public', 'tables', 'tables_tenant', 'ALL'),
  ('public', 'orders', 'orders_tenant_read', 'SELECT'),
  ('public', 'orders', 'orders_tenant_update', 'UPDATE'),
  ('public', 'orders', 'orders_tenant_delete', 'DELETE'),
  ('public', 'order_items', 'order_items_tenant_read', 'SELECT'),
  ('public', 'order_items', 'order_items_tenant_delete', 'DELETE'),
  ('public', 'tenant_settings', 'settings_tenant', 'ALL'),
  ('storage', 'objects', 'media_tenant_select', 'SELECT'),
  ('storage', 'objects', 'media_tenant_insert', 'INSERT'),
  ('storage', 'objects', 'media_tenant_update', 'UPDATE'),
  ('storage', 'objects', 'media_tenant_delete', 'DELETE')
),
pol_reales as (
  select schemaname::text as esquema, tablename::text as tabla, policyname::text as nombre,
         cmd, roles, permissive
    from pg_policies
   where schemaname = 'public' or (schemaname = 'storage' and tablename = 'objects')
),
-- Lo que sobra, lo que falta y lo que tiene otra operación, otros roles o es restrictiva.
pol_dif as (
  select coalesce(e.esquema, r.esquema) as esquema,
         coalesce(e.tabla, r.tabla) || '.' || coalesce(e.nombre, r.nombre)
           || case when r.nombre is null then ' falta'
                   when e.nombre is null then ' sobra'
                   else ' distinta' end as detalle
    from pol_esperadas e
    full join pol_reales r on r.esquema = e.esquema and r.tabla = e.tabla and r.nombre = e.nombre
   where e.nombre is null or r.nombre is null
      or r.cmd <> e.cmd or r.roles <> array['authenticated']::name[] or r.permissive <> 'PERMISSIVE'
),
-- AS-11: reglas CHECK de la sección 14 de schema.sql.
checks_esperados (tabla, nombre) as (values
  ('categories', 'categories_name_i18n_check'),
  ('categories', 'categories_description_i18n_check'),
  ('categories', 'categories_image_url_check'),
  ('categories', 'categories_sort_order_check'),
  ('products', 'products_name_i18n_check'),
  ('products', 'products_description_i18n_check'),
  ('products', 'products_price_check'),
  ('products', 'products_image_url_check'),
  ('products', 'products_sort_order_check'),
  ('tables', 'tables_label_check'),
  ('tenant_settings', 'tenant_settings_logo_url_check'),
  ('tenant_settings', 'tenant_settings_theme_check'),
  ('tenant_settings', 'tenant_settings_texts_check'),
  ('tenant_settings', 'tenant_settings_languages_check'),
  ('orders', 'orders_customer_note_check'),
  ('orders', 'orders_amounts_check'),
  ('order_items', 'order_items_quantity_max_check'),
  ('order_items', 'order_items_note_check'),
  ('order_items', 'order_items_amounts_check')
),
checks_pendientes as (
  select e.nombre || case when c.oid is null then ' falta' else ' sin validar' end as detalle
    from checks_esperados e
    left join pg_constraint c
      on c.conrelid = to_regclass('public.' || e.tabla) and c.conname = e.nombre and c.contype = 'c'
   where c.oid is null or not c.convalidated
),
place_order_src as (select prosrc from funciones where proname = 'place_order'),
chequeos (orden, chequeo, valor, esperado) as (
  select 1, 'enums', count(*)::int, 5
    from pg_type
   where typname in ('user_role', 'tenant_status', 'order_status', 'payment_status', 'charge_kind')
  union all
  select 2, 'tablas en public', count(*)::int, 12 from tablas
  union all
  select 3, 'tablas con RLS (todas, con currencies: S3)', count(*)::int, 12
    from tablas where relrowsecurity
  union all
  select 4, 'funciones de schema.sql (una sola firma de cada una)', count(*)::int, 12
    from funciones
   where proname in ('current_tenant_id', 'current_user_role', 'is_super_admin', 'current_tenant_writable',
                     'set_updated_at', 'enforce_plan_limit', 'guard_tenant_writable', 'guard_order_status',
                     'i18n_ok', 'media_quota_ok', 'get_menu', 'place_order')
  union all
  select 5, 'vistas de reportes', count(*)::int, 3 from vistas
  union all
  select 6, 'vistas con security_invoker (S1)', count(*)::int, 3
    from vistas where reloptions @> array['security_invoker=true']
  union all
  select 7, 'AA-3: ventas y platillos agrupan por día de Costa Rica', count(*)::int, 2
    from vistas
   where relname in ('v_daily_sales', 'v_top_products')
     and pg_get_viewdef(oid) like '%America/Costa_Rica%'
  union all
  select 8, 'monedas', count(*)::int, 18 from public.currencies
  union all
  select 9, 'planes', count(*)::int, 3 from public.plans
  union all
  select 10, 'AA-9: planes con table_ordering como PRICING (Básico sin pedidos, Estándar y Empresarial con)',
         count(*)::int, 3
    from public.plans
   where (code = 'basico' and features -> 'table_ordering' = 'false'::jsonb)
      or (code in ('estandar', 'empresarial') and features -> 'table_ordering' = 'true'::jsonb)
  union all
  select 11, 'anon sin permisos sobre tablas ni vistas', count(*)::int, 0
    from rel
   where has_table_privilege('anon', oid, 'SELECT') or has_table_privilege('anon', oid, 'INSERT')
      or has_table_privilege('anon', oid, 'UPDATE') or has_table_privilege('anon', oid, 'DELETE')
      or has_table_privilege('anon', oid, 'TRUNCATE') or has_table_privilege('anon', oid, 'REFERENCES')
      or has_table_privilege('anon', oid, 'TRIGGER')
  union all
  select 12, 'AS-8: authenticated sin TRUNCATE, REFERENCES ni TRIGGER', count(*)::int, 0
    from rel
   where has_table_privilege('authenticated', oid, 'TRUNCATE')
      or has_table_privilege('authenticated', oid, 'REFERENCES')
      or has_table_privilege('authenticated', oid, 'TRIGGER')
  union all
  select 13, 'authenticated lee las 12 tablas y las 3 vistas', count(*)::int, 15
    from (select oid from tablas union all select oid from vistas) x
   where has_table_privilege('authenticated', oid, 'SELECT')
  union all
  select 14, 'authenticated no escribe en las vistas', count(*)::int, 0
    from vistas
   where has_table_privilege('authenticated', oid, 'INSERT')
      or has_table_privilege('authenticated', oid, 'UPDATE')
      or has_table_privilege('authenticated', oid, 'DELETE')
  union all
  select 15, 'AS-2: políticas de public exactamente las de schema.sql (18, para authenticated)'
           || coalesce(' (' || (select string_agg(detalle, ', ' order by detalle) from pol_dif where esquema = 'public') || ')', ''),
         (select count(*) from pol_dif where esquema = 'public')::int, 0
  union all
  select 16, 'AS-2: políticas de storage.objects exactamente las 4 de media (para authenticated)'
           || coalesce(' (' || (select string_agg(detalle, ', ' order by detalle) from pol_dif where esquema = 'storage') || ')', ''),
         (select count(*) from pol_dif where esquema = 'storage')::int, 0
  union all
  select 17, 'AS-9: funciones de public que anon ejecuta (solo get_menu y place_order)'
           || coalesce(' (' || (select string_agg(firma, ', ' order by firma) from funciones
                                 where has_function_privilege('anon', oid, 'EXECUTE')
                                   and not exists (select 1 from rpc where to_regprocedure(rpc.firma)::oid = funciones.oid))
                        || ' sobra)', ''),
         count(*)::int, 2
    from funciones where has_function_privilege('anon', oid, 'EXECUTE')
  union all
  select 18, 'AS-9: anon ejecuta get_menu(text, uuid) y place_order(text, uuid, jsonb, text, uuid)',
         count(*)::int, 2
    from rpc where coalesce(has_function_privilege('anon', to_regprocedure(firma), 'EXECUTE'), false)
  union all
  select 19, 'AS-9: authenticated ejecuta get_menu y place_order', count(*)::int, 2
    from rpc where coalesce(has_function_privilege('authenticated', to_regprocedure(firma), 'EXECUTE'), false)
  union all
  select 20, 'AS-9: get_menu y place_order son security definer con search_path=public', count(*)::int, 2
    from funciones
   where oid in (select to_regprocedure(firma)::oid from rpc where to_regprocedure(firma) is not null)
     and prosecdef and proconfig @> array['search_path=public']
  union all
  select 21, 'AS-9: place_order tiene una sola firma (la de 5 parámetros)', count(*)::int, 1
    from funciones where proname = 'place_order'
  union all
  select 22, 'AS-9: authenticated ejecuta los helpers de las políticas y de los CHECK', count(*)::int, 6
    from (values ('public.current_tenant_id()'), ('public.current_user_role()'), ('public.is_super_admin()'),
                 ('public.current_tenant_writable()'), ('public.i18n_ok(jsonb, integer)'),
                 ('public.media_quota_ok()')) h(firma)
   where coalesce(has_function_privilege('authenticated', to_regprocedure(firma), 'EXECUTE'), false)
  union all
  select 23, 'AS-9: ni anon ni authenticated ejecutan las funciones de trigger', count(*)::int, 0
    from (values ('public.set_updated_at()'), ('public.enforce_plan_limit()'),
                 ('public.guard_tenant_writable()'), ('public.guard_order_status()')) h(firma)
   where coalesce(has_function_privilege('anon', to_regprocedure(firma), 'EXECUTE'), false)
      or coalesce(has_function_privilege('authenticated', to_regprocedure(firma), 'EXECUTE'), false)
  union all
  select 24, 'AS-7: toda función de public tiene search_path fijo'
           || coalesce(' (' || (select string_agg(firma, ', ' order by firma) from funciones
                                 where not exists (select 1 from unnest(coalesce(proconfig, '{}'::text[])) c
                                                    where c like 'search_path=%')) || ' sin fijar)', ''),
         count(*)::int, 0
    from funciones
   where not exists (select 1 from unnest(coalesce(proconfig, '{}'::text[])) c where c like 'search_path=%')
  union all
  select 25, 'Storage: bucket media existe', count(*)::int, 1
    from storage.buckets where id = 'media'
  union all
  select 26, 'Storage: bucket media es público (lectura de las fotos del menú)', count(*)::int, 1
    from storage.buckets where id = 'media' and public
  union all
  select 27, 'Storage: bucket media limita a 2 MB', count(*)::int, 1
    from storage.buckets where id = 'media' and file_size_limit = 2097152
  union all
  select 28, 'Storage: bucket media solo jpeg, png y webp', count(*)::int, 1
    from storage.buckets
   where id = 'media'
     and allowed_mime_types @> array['image/jpeg', 'image/png', 'image/webp']
     and allowed_mime_types <@ array['image/jpeg', 'image/png', 'image/webp']
  union all
  select 29, 'Storage: las 4 políticas de media miran la carpeta del negocio', count(*)::int, 4
    from pg_policies
   where schemaname = 'storage' and tablename = 'objects'
     and policyname in ('media_tenant_select', 'media_tenant_insert', 'media_tenant_update', 'media_tenant_delete')
     and (coalesce(qual, '') || coalesce(with_check, '')) like '%current_tenant_id%'
  union all
  select 30, 'Storage: subir pide local activo y tope de archivos (media_quota_ok)', count(*)::int, 1
    from pg_policies
   where schemaname = 'storage' and tablename = 'objects' and policyname = 'media_tenant_insert'
     and with_check like '%current_tenant_writable%' and with_check like '%media_quota_ok%'
  union all
  select 31, 'Storage: cambiar y borrar piden local activo', count(*)::int, 2
    from pg_policies
   where schemaname = 'storage' and tablename = 'objects'
     and policyname in ('media_tenant_update', 'media_tenant_delete')
     and qual like '%current_tenant_writable%'
  union all
  select 32, 'Storage: ninguna política de anon ni public en storage.objects', count(*)::int, 0
    from pg_policies
   where schemaname = 'storage' and tablename = 'objects'
     and roles && array['anon', 'public']::name[]
  union all
  select 33, 'Storage: media_quota_ok cuenta solo la carpeta del negocio', count(*)::int, 1
    from funciones
   where proname = 'media_quota_ok' and prosrc like '%current_tenant_id%' and not prosecdef
  union all
  select 34, 'S15: referencias entre tablas de negocio con FK compuesta (tenant_id, ...)', count(*)::int, 4
    from pg_constraint c
   where c.contype = 'f'
     and c.confrelid in ('public.categories'::regclass, 'public.products'::regclass,
                         'public.tables'::regclass, 'public.orders'::regclass)
     and array_length(c.conkey, 1) = 2
     and (select a.attname from pg_attribute a where a.attrelid = c.conrelid and a.attnum = c.conkey[1]) = 'tenant_id'
     and (select a.attname from pg_attribute a where a.attrelid = c.confrelid and a.attnum = c.confkey[1]) = 'tenant_id'
     and (select a.attname from pg_attribute a where a.attrelid = c.confrelid and a.attnum = c.confkey[2]) = 'id'
  union all
  select 35, 'S15: ninguna FK de una sola columna hacia categories, products, tables u orders', count(*)::int, 0
    from pg_constraint c
   where c.contype = 'f'
     and c.confrelid in ('public.categories'::regclass, 'public.products'::regclass,
                         'public.tables'::regclass, 'public.orders'::regclass)
     and array_length(c.conkey, 1) = 1
  union all
  select 36, 'S15: al borrar el padre, set null vacía solo la referencia y order_items se borra con su orden',
         count(*)::int, 4
    from pg_constraint c
   where c.contype = 'f'
     and array_length(c.conkey, 1) = 2
     and ((c.conrelid, c.confrelid, c.confdeltype) in
            (('public.products'::regclass, 'public.categories'::regclass, 'n'),
             ('public.orders'::regclass, 'public.tables'::regclass, 'n'),
             ('public.order_items'::regclass, 'public.products'::regclass, 'n'))
          and array_length(c.confdelsetcols, 1) = 1 and c.confdelsetcols[1] = c.conkey[2]
       or (c.conrelid, c.confrelid, c.confdeltype) =
            ('public.order_items'::regclass, 'public.orders'::regclass, 'c'))
  union all
  select 37, 'S15: filas que apuntan a una fila de otro negocio', (
      (select count(*) from public.products h join public.categories p on p.id = h.category_id
        where p.tenant_id <> h.tenant_id)
    + (select count(*) from public.orders h join public.tables p on p.id = h.table_id
        where p.tenant_id <> h.tenant_id)
    + (select count(*) from public.order_items h join public.orders p on p.id = h.order_id
        where p.tenant_id <> h.tenant_id)
    + (select count(*) from public.order_items h join public.products p on p.id = h.product_id
        where p.tenant_id <> h.tenant_id))::int, 0
  union all
  select 38, 'S15: place_order cuenta el tope por mesa solo con órdenes del mismo negocio', count(*)::int, 1
    from place_order_src
   where prosrc like '%where tenant_id = v_tenant.id and table_id = v_table.id and created_at >%'
  union all
  select 39, 'AS-6: place_order toma el candado del local antes de contar los topes', count(*)::int, 1
    from place_order_src
   where prosrc like '%pg_advisory_xact_lock%'
     and position('pg_advisory_xact_lock' in prosrc) < position('interval ''10 minutes''' in prosrc)
  union all
  select 40, 'AA-9: place_order rechaza si el plan no incluye pedidos; get_menu lo informa', count(*)::int, 2
    from funciones
   where (proname = 'place_order' and prosrc like '%datafud:ordering_off%' and prosrc like '%table_ordering%')
      or (proname = 'get_menu' and prosrc like '%''ordering''%' and prosrc like '%table_ordering%')
  union all
  select 41, 'place_order rechaza la orden si un platillo ya no está disponible', count(*)::int, 1
    from place_order_src
   where prosrc like '%Algunos platillos ya no están disponibles%' and prosrc like '%datafud:items_unavailable%'
  union all
  select 42, 'Pedidos sin duplicar: índice único (tenant_id, client_ref) y place_order lo usa', count(*)::int, 2
    from (
      select 1 from pg_index i
       where i.indexrelid = to_regclass('public.uq_orders_tenant_client_ref') and i.indisunique and i.indpred is not null
      union all
      select 1 from place_order_src where prosrc like '%client_ref = p_client_ref%'
    ) x
  union all
  select 43, 'Órdenes: columnas previous_status, status_changed_at y client_ref', count(*)::int, 3
    from information_schema.columns
   where table_schema = 'public' and table_name = 'orders'
     and column_name in ('previous_status', 'status_changed_at', 'client_ref')
  union all
  select 44, 'S11: trigger de transiciones de estado en orders (trg_order_status)', count(*)::int, 1
    from pg_trigger t
   where t.tgrelid = 'public.orders'::regclass and t.tgname = 'trg_order_status' and not t.tgisinternal
     and t.tgfoid = to_regprocedure('public.guard_order_status()')::oid
  union all
  select 45, 'Solo lectura de locales suspendidos o cancelados: trg_0_tenant_writable en 6 tablas (y ninguno con el nombre viejo)',
         count(*)::int, 6
    from pg_trigger t
   where t.tgname = 'trg_0_tenant_writable' and not t.tgisinternal
     and not exists (select 1 from pg_trigger v where v.tgname = 'trg_tenant_writable' and not v.tgisinternal)
     and t.tgfoid = to_regprocedure('public.guard_tenant_writable()')::oid
     and t.tgrelid in ('public.categories'::regclass, 'public.products'::regclass, 'public.tables'::regclass,
                       'public.tenant_settings'::regclass, 'public.orders'::regclass, 'public.order_items'::regclass)
  union all
  select 46, 'Índices de 1.7.0: orders por estado y por modificación, order_items por platillo', count(*)::int, 3
    from (values ('public.idx_orders_tenant_status_created'), ('public.idx_orders_tenant_updated'),
                 ('public.idx_order_items_tenant_product')) i(nombre)
   where to_regclass(nombre) is not null
  union all
  select 47, 'Pagos: índice único por local y periodo (uq_payments_tenant_period)', count(*)::int, 1
    from pg_index i
   where i.indexrelid = to_regclass('public.uq_payments_tenant_period') and i.indisunique
  union all
  select 48, 'Pagos: grupos repetidos (mismo local y periodo)', count(*)::int, 0
    from (select 1 from public.subscription_payments
           group by tenant_id, period_start, period_end having count(*) > 1) x
  union all
  select 49, 'AS-11: reglas CHECK de la sección 14 agregadas y validadas'
           || coalesce(' (' || (select string_agg(detalle, ', ' order by detalle) from checks_pendientes) || ')', ''),
         (select count(*) from checks_esperados)::int - (select count(*) from checks_pendientes)::int, 19
  union all
  select 50, 'S11: las órdenes y sus líneas entran solo por place_order (authenticated no inserta)', count(*)::int, 0
    from tablas
   where relname in ('orders', 'order_items')
     and (has_table_privilege('authenticated', oid, 'INSERT')
          or exists (select 1 from pg_policies p
                      where p.schemaname = 'public' and p.tablename = tablas.relname
                        and p.cmd in ('INSERT', 'ALL')))
  union all
  select 51, 'super admin (false hasta crearlo a mano)', count(*)::int, 1
    from public.profiles where role = 'super_admin' and tenant_id is null
)
select chequeo, valor, esperado, valor = esperado as ok
from chequeos
order by orden;

-- ---------------------------------------------------------------------
-- Solo en desarrollo, después de seed.dev.sql (en producción no se corre):
--   select email from auth.users u join public.profiles p on p.id = u.id
--    where p.role = 'super_admin' or p.tenant_id = (select id from public.tenants where slug = 'demo');
--   select count(*) as demo_products from public.products p
--     join public.tenants t on t.id = p.tenant_id where t.slug = 'demo';   -- esperado 3
--   select day, orders_count, revenue, currency_code from public.v_daily_sales;
-- ---------------------------------------------------------------------
