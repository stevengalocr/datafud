-- =====================================================================
-- DataFud — super-admin.sql · crear el perfil del super admin (producción)
-- Antes: Authentication → Users → Add user → Create new user, con
-- «Auto Confirm User». Después se corre esto en el SQL Editor, cambiando
-- <correo> por el correo de ese usuario. Sin contraseñas: viven solo en Auth.
-- Idempotente: si el perfil existe, lo deja como super admin.
-- =====================================================================

-- 1) El usuario existe y está confirmado (esperado: una fila con fecha).
select id, email, email_confirmed_at
from auth.users
where email = '<correo>';

-- 2) Su perfil como super admin, sin negocio.
insert into public.profiles (id, tenant_id, role, full_name)
select u.id, null, 'super_admin', 'Steven Galo'
from auth.users u
where u.email = '<correo>'
on conflict (id) do update
  set role = 'super_admin', tenant_id = null;

-- 3) Comprobación (esperado: una fila, role = super_admin, tenant_id vacío).
select u.email, p.role, p.tenant_id
from auth.users u
join public.profiles p on p.id = u.id
where p.role = 'super_admin';
