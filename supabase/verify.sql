-- =====================================================================
-- Datfud — verify.sql · smoke test post-ejecución
-- Correr después de schema.sql:  psql "$DBURL" -f supabase/verify.sql
-- =====================================================================

\echo '== Enums =='
select typname from pg_type where typname in ('user_role','tenant_status','order_status','payment_status') order by typname;

\echo '== Tablas =='
select table_name from information_schema.tables
where table_schema='public'
  and table_name in ('currencies','plans','tenants','profiles','subscription_payments',
                     'categories','products','tables','orders','order_items','tenant_settings')
order by table_name;

\echo '== Funciones helper =='
select proname from pg_proc
where proname in ('current_tenant_id','current_user_role','is_super_admin','set_updated_at','enforce_plan_limit')
order by proname;

\echo '== RLS habilitado =='
select relname from pg_class
where relname in ('tenants','products','categories','orders','order_items','tables',
                  'tenant_settings','subscription_payments','profiles','plans')
  and relrowsecurity = true
order by relname;

\echo '== Vistas =='
select table_name from information_schema.views
where table_schema='public' and table_name in ('v_daily_sales','v_top_products','v_order_summary')
order by table_name;

\echo '== Monedas (esperado 18) =='
select count(*) as currency_count from public.currencies;

\echo '== Planes =='
select code, price_usd, features->>'max_products' as max_products from public.plans order by sort_order;

\echo '== Usuarios semilla =='
select email from auth.users where email in ('stevengalocr@gmail.com','demo@datfud.com') order by email;

\echo '== Tenant demo =='
select slug, status from public.tenants where slug='demo';

\echo '== Productos demo (esperado 3) =='
select count(*) as demo_products from public.products p
  join public.tenants t on t.id=p.tenant_id where t.slug='demo';

\echo '== Reporte ventas diarias demo =='
select day, orders_count, revenue, currency_code from public.v_daily_sales;

\echo '== Top productos demo =='
select product_name, units_sold, revenue from public.v_top_products order by units_sold desc;
