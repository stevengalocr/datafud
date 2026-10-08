-- =====================================================================
-- DataFud — verify.sql · comprobación después de schema.sql
-- SQL puro (sin comandos de psql): se pega completo en el SQL Editor de
-- Supabase o se corre con  psql "$DBURL" -f supabase/verify.sql
-- Devuelve una sola tabla. Esperado: ok = true en todas las filas.
-- Las filas de Storage (16 a 21) dan false hasta aplicar la sección 12 de schema.sql.
-- La última fila (super admin) da false hasta crear el super admin a mano.
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
  select 4, 'funciones', count(*)::int, 7
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname in ('current_tenant_id', 'current_user_role', 'is_super_admin',
                       'set_updated_at', 'enforce_plan_limit', 'get_menu', 'place_order')
  union all
  select 5, 'vistas de reportes', count(*)::int, 3 from vistas
  union all
  select 6, 'vistas con security_invoker (S1)', count(*)::int, 3
    from vistas where reloptions @> array['security_invoker=true']
  union all
  select 7, 'monedas', count(*)::int, 18 from public.currencies
  union all
  select 8, 'planes', count(*)::int, 3 from public.plans
  union all
  select 9, 'anon sin permisos sobre tablas ni vistas', count(*)::int, 0
    from rel
   where has_table_privilege('anon', oid, 'SELECT') or has_table_privilege('anon', oid, 'INSERT')
      or has_table_privilege('anon', oid, 'UPDATE') or has_table_privilege('anon', oid, 'DELETE')
  union all
  select 10, 'authenticated lee las 12 tablas y las 3 vistas', count(*)::int, 15
    from (select oid from tablas union all select oid from vistas) x
   where has_table_privilege('authenticated', oid, 'SELECT')
  union all
  select 11, 'authenticated no escribe en las vistas', count(*)::int, 0
    from vistas
   where has_table_privilege('authenticated', oid, 'INSERT')
      or has_table_privilege('authenticated', oid, 'UPDATE')
      or has_table_privilege('authenticated', oid, 'DELETE')
  union all
  select 12, 'authenticated ejecuta is_super_admin',
         has_function_privilege('authenticated', 'public.is_super_admin()', 'EXECUTE')::int, 1
  union all
  select 13, 'anon no ejecuta is_super_admin',
         has_function_privilege('anon', 'public.is_super_admin()', 'EXECUTE')::int, 0
  union all
  select 14, 'anon ejecuta get_menu',
         has_function_privilege('anon', 'public.get_menu(text, uuid)', 'EXECUTE')::int, 1
  union all
  select 15, 'anon ejecuta place_order',
         has_function_privilege('anon', 'public.place_order(text, uuid, jsonb, text)', 'EXECUTE')::int, 1
  union all
  select 16, 'Storage: bucket media existe', count(*)::int, 1
    from storage.buckets where id = 'media'
  union all
  select 17, 'Storage: bucket media es público (lectura de las fotos del menú)', count(*)::int, 1
    from storage.buckets where id = 'media' and public
  union all
  select 18, 'Storage: bucket media limita a 2 MB', count(*)::int, 1
    from storage.buckets where id = 'media' and file_size_limit = 2097152
  union all
  select 19, 'Storage: bucket media solo jpeg, png y webp', count(*)::int, 1
    from storage.buckets
   where id = 'media'
     and allowed_mime_types @> array['image/jpeg', 'image/png', 'image/webp']
     and allowed_mime_types <@ array['image/jpeg', 'image/png', 'image/webp']
  union all
  select 20, 'Storage: políticas de escritura (insert, update, delete) para authenticated', count(*)::int, 3
    from pg_policies
   where schemaname = 'storage' and tablename = 'objects'
     and policyname in ('media_tenant_insert', 'media_tenant_update', 'media_tenant_delete')
     and roles = array['authenticated']::name[]
     and (coalesce(qual, '') || coalesce(with_check, '')) like '%current_tenant_id%'
  union all
  select 21, 'Storage: ninguna política de anon ni public sobre el bucket media', count(*)::int, 0
    from pg_policies
   where schemaname = 'storage' and tablename = 'objects'
     and (roles && array['anon', 'public']::name[])
     and (coalesce(qual, '') || coalesce(with_check, '') || policyname) like '%media%'
  union all
  select 22, 'super admin (false hasta crearlo a mano)', count(*)::int, 1
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
