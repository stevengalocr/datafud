# Supabase en producción — informe y runbook (2026-10-03)

> Investigación y plan, sin ejecución. Nadie inició sesión en Supabase ni en Vercel, no se tocó
> ninguna variable, no hubo commit ni push. Fuentes: el código del repo (`main` @ `61f930a`,
> versión 1.4.1), las páginas del nodo Datafud del vault y la documentación oficial de Supabase y
> Vercel citada al final. Las credenciales se nombran, nunca se escriben.

> **Estado (2026-10-03, tarde):** Steven eligió el orden recomendado. La sesión de código ya está
> hecha: permisos, S1, S3, middleware en `src/`, filtro por tenant en reportes, `verify.sql` como
> SQL puro y `supabase/super-admin.sql` (ver `docs/CHANGELOG.md`, Unreleased). El proyecto de
> Supabase existe (`us-east-1`). El encendido es un ensayo sin clientes (D-063). Siguen los pasos
> B a F del runbook, que hace Steven a mano.

## 1. Resumen

1. Se enciende un proyecto de Supabase nuevo (organización de galodevcr@gmail.com) con `schema.sql`: 12 tablas, RLS, 7 funciones, 3 vistas, 18 monedas y 3 planes, sin usuarios.
2. Vercel recibe las variables de Supabase y `NEXT_PUBLIC_SITE_URL=https://datafud.com`, y un redeploy cambia el build: `/login` deja el aviso con WhatsApp y muestra el formulario «Ingresar».
3. `/dashboard` y `/admin` pasan de error 500 a redirigir a `/login`, y la ruta privada del super admin empieza a autenticar de verdad.
4. Para el visitante, la landing, las guías, `/c/<slug>`, `/q/<código>` y `/preview` quedan iguales. El nav sigue sin «Ingresar» (D-018) y `/register` sigue redirigiendo a `/#contacto`.
5. Hallazgo nuevo que cambia el orden: desde el 30 de mayo de 2026, un proyecto nuevo de Supabase no da permisos de la Data API sobre las tablas, y `schema.sql` no tiene ningún `grant` de tablas. Sin un bloque de permisos, nadie entra, ni siquiera el super admin. Ese bloque conviene escribirlo junto con S1 y S3, antes del redeploy.

## 2. Runbook para Steven

Cada bloque dura unos 40 minutos y se hace con el dashboard abierto. El orden recomendado es
A → (sesión de código S1+S3+permisos, ver §5) → B → C → D → E → F. G sirve para volver atrás.

### A) Crear el proyecto (unos 25 min)

1. Entrar a supabase.com con la cuenta galodevcr@gmail.com. Antes de nada, activar la verificación en dos pasos de la cuenta (Account → Security) si no está activa.
2. En la organización nueva, elegir **New project**.
   - **Nombre:** `datafud` (sugerido; el nombre no se ve en la web).
   - **Contraseña de la base:** usar **Generate a password** y guardarla de inmediato en el gestor de contraseñas. Esta contraseña no va al vault (ver §6).
   - **Región:** East US (North Virginia), `us-east-1`. Las funciones de Vercel corren por defecto en `iad1` (Washington D. C.), que está al lado. Para Costa Rica no hay región más cercana con menos latencia hacia Vercel: São Paulo y la costa oeste quedan más lejos de `iad1`.
   - **Plan:** Free (ver límites en §5, R7).
3. **Opciones de seguridad o de la Data API** de la pantalla de creación (los nombres pueden variar; hay que leerlos en pantalla):
   - Dejar **la Data API activada**: la app usa PostgREST (`supabase.from(...)`, `supabase.rpc(...)`).
   - Dejar **desmarcado «Automatically expose new tables»**, que es el valor por defecto en proyectos nuevos desde el 2026-05-30. Los permisos se dan explícitos en `schema.sql` (§5). Si se marcara, las vistas de S1 y `currencies` quedarían expuestas a `anon` desde el primer minuto.
   - Si aparece una opción de **RLS automático en tablas nuevas**, se puede dejar activa. `schema.sql` habilita RLS en todo menos `currencies`, y S3 lo agrega ahí.
4. Esperar a que el proyecto quede «healthy» y anotar en el gestor y en una nota temporal (no en el vault todavía):
   - el `project ref`, que es el subdominio de la URL;
   - la **Project URL** (`https://<ref>.supabase.co`), en Project Settings → Data API o en el botón **Connect**;
   - en Project Settings → **API Keys**, qué pestañas hay: «Publishable and secret API keys» o «Legacy API keys» (`anon`, `service_role`). Ver R6 sobre cuál usar.
5. En el SQL Editor, correr `select version();` y confirmar que es Postgres 15 o más (la opción `security_invoker` de S1 lo exige).

### B) `schema.sql` y verificación (unos 40 min)

Requisito: que la sesión de código de §5 (permisos + S1 + S3) ya esté en `main`. Si se decide
encender sin ella, ver R1: nadie podrá entrar.

1. **SQL Editor → New query.** Pegar `supabase/schema.sql` completo, desde la versión de `main`, y darle **Run**.
   - Resultado esperado: «Success. No rows returned».
   - El archivo tiene bloques `begin/commit` y `do $$`, que el editor acepta.
   - Es idempotente: `if not exists`, `drop … if exists`, `on conflict do update` y `duplicate_object` capturado (`schema.sql:13-35`, `:286-296`, `:318-391`, `:601-602`, `:621-623`). Correrlo dos veces no debe dar error, y conviene hacerlo una vez para confirmarlo.
2. **No pegar `verify.sql` en el SQL Editor.** Usa `\echo` (`verify.sql:8`, `:10`, `:13`…), que es un comando de `psql` y no SQL, así que el editor da un error de sintaxis. Hay dos caminos:
   - **Con `psql`** (si Steven lo tiene instalado, ver preguntas): copiar la cadena de conexión desde **Connect** (el «Session pooler» funciona con IPv4) y correr `psql "$DBURL" -f supabase/verify.sql`.
   - **En el SQL Editor**, la consulta única de abajo, que cubre la parte 1 de `verify.sql` más lo que le falta: `tenant_charges`, `charge_kind`, permisos y `security_invoker`. Que la sesión de código la agregue también a `verify.sql`.

```sql
-- Verificación de producción en una sola tabla (SQL Editor). Esperado: ok = true en todas las filas.
with c as (
  select 'enums (5)' as chequeo, count(*)::int as valor, 5 as esperado
    from pg_type where typname in ('user_role','tenant_status','order_status','payment_status','charge_kind')
  union all
  select 'tablas public (12)', count(*)::int, 12
    from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE'
  union all
  select 'tablas con RLS (12 con S3; 11 sin S3)', count(*)::int, 12
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
  union all
  select 'funciones (7)', count(*)::int, 7
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname in ('current_tenant_id','current_user_role','is_super_admin',
         'set_updated_at','enforce_plan_limit','get_menu','place_order')
  union all
  select 'vistas (3)', count(*)::int, 3
    from information_schema.views where table_schema = 'public'
     and table_name in ('v_daily_sales','v_top_products','v_order_summary')
  union all
  select 'vistas con security_invoker (S1: 3)', count(*)::int, 3
    from pg_class where relname in ('v_daily_sales','v_top_products','v_order_summary')
     and reloptions @> array['security_invoker=true']
  union all
  select 'monedas (18)', count(*)::int, 18 from public.currencies
  union all
  select 'planes (3)', count(*)::int, 3 from public.plans
  union all
  select 'permisos de anon sobre tablas y vistas (0)', count(*)::int, 0
    from information_schema.role_table_grants where table_schema = 'public' and grantee = 'anon'
  union all
  select 'tablas y vistas con select para authenticated (15)', count(distinct table_name)::int, 15
    from information_schema.role_table_grants
   where table_schema = 'public' and grantee = 'authenticated' and privilege_type = 'SELECT'
  union all
  select 'authenticated ejecuta is_super_admin (1)',
         has_function_privilege('authenticated', 'public.is_super_admin()', 'execute')::int, 1
  union all
  select 'anon ejecuta get_menu (1)',
         has_function_privilege('anon', 'public.get_menu(text, uuid)', 'execute')::int, 1
  union all
  select 'usuarios en auth (0 antes de E; 1 después)', count(*)::int, 0 from auth.users
)
select chequeo, valor, esperado, valor = esperado as ok from c;
```

   Salida esperada, con la versión de `schema.sql` que trae permisos + S1 + S3: `ok = true` en
   todas las filas. Con el `schema.sql` de hoy (sin esa sesión), en un proyecto nuevo:
   - «tablas con RLS» da 11 (falta `currencies`, S3);
   - «vistas con security_invoker» da 0 (S1);
   - «tablas y vistas con select para authenticated» da **0**: es el síntoma de R1, y con él no entra nadie.

   La parte 1 de `verify.sql` corrida con `psql` debe listar: 4 enums, 11 tablas (su lista
   omite `tenant_charges`), 5 funciones helper, 10 tablas con RLS (su lista omite
   `tenant_charges` y `currencies`), 3 vistas, `currency_count = 18` y los planes `basico 29.00 60`,
   `estandar 49.00 150` y `empresarial 99.00` con `max_products` vacío (`verify.sql:11-41`,
   `schema.sql:611-620`). La parte 2 debe devolver 0 filas antes de E, y después de E una sola
   fila: el correo del super admin (`verify.sql:49-53`).
3. **Database → Advisors → Security Advisor.** Correrlo y guardar una captura.
   - Con S1 y S3 aplicados no deben quedar errores de «Security Definer View» ni de «RLS disabled in public».
   - Sin ellos, debería marcar las tres vistas y `currencies`. Cualquier otro aviso se anota en `Seguridad.md`.
4. **`supabase/seed.dev.sql` no se corre en producción.**
   - Crea `admin@datafud.test`, `demo@datafud.test`, un tenant `demo` y una orden (`seed.dev.sql:2-4`).
   - Usa variables de `psql` (`:26-45`), así que en el SQL Editor aborta (`:64-66`). Aun así, no se pega.

### C) Auth: URLs y correo (unos 20 min)

1. **Authentication → Sign In / Providers**, en la sección Email:
   - Dejar el proveedor **Email** activo: el login es con correo y contraseña (`(auth)/actions.ts:27`).
   - **Desactivar «Allow new users to sign up».** La app nunca usa el registro público: `/register` redirige (`register/page.tsx:14`) y `registerAction` usa la API de administrador (`actions.ts:83`). Con el registro abierto, cualquiera con la anon key puede crear usuarios en `auth.users` y gastar el cupo de correos. Esos usuarios quedarían sin perfil y sin acceso a nada, porque no hay trigger que cree `profiles` y `profiles` no tiene política de insert (`schema.sql:325-327`). El usuario que se crea desde el dashboard en E no depende de este interruptor, y la prueba de E lo confirma.
   - Dejar **«Confirm email»** activo. No afecta a los usuarios creados con «Auto Confirm User» ni a `createUser({ email_confirm: true })` (`actions.ts:86`).
2. **Authentication → URL Configuration:**
   - **Site URL:** `https://datafud.com`
   - **Redirect URLs:** `https://datafud.com/**`, `https://datafud.vercel.app/**` y `http://localhost:3000/**`.
   - Hoy el código no usa enlaces mágicos, OAuth ni recuperación de contraseña, así que estas URLs solo importan cuando Auth mande un correo con enlace. Conviene dejarlas bien desde el inicio.
3. **SMTP:** dejar el de Supabase por ahora. Sus límites, según la documentación:
   - 2 mensajes por hora;
   - solo entrega a direcciones del equipo del proyecto.

   No bloquea este encendido, porque ningún flujo actual manda correo. Bloqueará la recuperación de
   contraseña de un restaurante, y ahí hará falta un SMTP propio, por ejemplo Resend con el dominio
   verificado (ver preguntas).

### D) Variables en Vercel y redeploy (unos 40 min)

1. vercel.com con stevengalocr@gmail.com → proyecto `datafud` → **Settings → Environment Variables**.
2. Cargar las variables de la tabla de §3, **solo en Production**.
   - Marcar como sensible (o tipo «Secret», si la interfaz lo ofrece) la `service_role`, si se decide cargarla (R8).
   - Las tres `NEXT_PUBLIC_*` son públicas por diseño: Next las incrusta en el build.
3. **Settings → Functions → Function Regions:** confirmar que dice `iad1` (Washington, D. C.). Es el valor por defecto de los proyectos nuevos; no hay que cambiarlo si la base quedó en `us-east-1`.
4. **Redesplegar.** Un cambio de variables solo aplica a deploys nuevos («only apply to new deployments»), y la landing y `/login` se deciden en el build (`login/page.tsx:17`). Hay dos caminos:
   - si la sesión de código de §5 se publica **después** de cargar las variables, su push ya produce el build correcto;
   - si no, Deployments → el último de producción → ⋯ → **Redeploy**, sin reutilizar la caché del build.
5. En el log del build, buscar la línea de **Middleware**. Solo aparece si S3 movió `middleware.ts` a `src/` (trampa conocida del `CLAUDE.md`). Hoy el archivo está en la raíz (`middleware.ts:1-13`) y Next lo ignora.
6. Deploy en READY. Anotar el `dpl_…` para `Cuentas-y-Accesos.md` y para G.

### E) Super admin a mano (unos 20 min)

`profiles` no se crea sola: no hay trigger en `auth.users` en `schema.sql`. La única inserción en
código es `registerAction` (`actions.ts:131-136`).

En la tabla (`schema.sql:74-80`):
- `id` es obligatorio y es clave foránea a `auth.users(id)`;
- `tenant_id` acepta nulo y para el super admin va nulo;
- `role` tiene por defecto `restaurant_admin`, así que hay que poner `super_admin`;
- `full_name` es opcional.

1. **Authentication → Users → Add user → Create new user.**
   - Correo: el que Steven elija (ver preguntas).
   - Contraseña: generada en el gestor, de 16 caracteres o más, nueva, y nunca la que quedó en el historial de git.
   - Marcar **Auto Confirm User**. Crear.
2. Copiar el **UUID** del usuario desde la lista.
3. En el SQL Editor, correr el SQL de §4.
4. Comprobar:
   - abrir `https://datafud.com/acceso-galodev-9f3a` (la ruta privada, S8) y entrar con ese correo y esa contraseña;
   - debe redirigir a `/admin` (`actions.ts:42`) con la barra «Administración SaaS» y Resumen, Restaurantes, Pagos, Cargos y Planes (`admin/layout.tsx:6-12`, `:22`);
   - **Planes** debe listar los 3 planes;
   - después, abrir `https://datafud.com/dashboard`, que debe devolver a `/admin` (`tenant-context.ts:27`).
5. Si en vez de `/admin` vuelve a `/login`, la sesión se creó pero el perfil no se pudo leer. Revisar que la fila exista (consulta de §4) y que `authenticated` tenga `select` sobre `profiles` (R1).

### F) Pruebas de humo en datafud.com (unos 40 min)

Usar una ventana privada, en 375 px y en escritorio.

| Abrir | Debe verse |
|---|---|
| `/` | La landing igual que antes: 8 secciones, nav sin «Ingresar», WhatsApp |
| `/menu-digital-costa-rica` y las otras dos guías | Igual que antes |
| `/c/ejemplo` | La carta estática sin pedidos |
| `/q/demo26` | Redirección 307 a `/c/ejemplo` (`q/[code]/route.ts:12`) |
| `/preview/carta` | Igual que antes; no toca la base |
| `/login` | **Cambia:** formulario «Ingresar», con correo y contraseña (`login-form.tsx:25-48`), en lugar del aviso «El acceso al panel se activa con tu implementación» |
| `/login` con datos falsos | «Correo o contraseña incorrectos.» (`actions.ts:29`) |
| `/register` | Redirige a `/#contacto` (sin cambios) |
| `/dashboard` y `/admin` sin sesión | **Cambia:** redirigen a `/login`; antes daban 500 (`Guia-De-Desarrollo.md`, línea 25) |
| `/m/x/00000000-0000-0000-0000-000000000000` | 404: `get_menu` devuelve nulo (`m/[tenant]/[table]/page.tsx:20-22`) |
| La ruta privada con el super admin | `/admin` con los 3 planes; «Salir» lleva a `/login` |
| `/robots.txt` y `/sitemap.xml` | Sin la ruta privada, igual que antes |

Prueba de exposición con la anon key, que es pública por diseño y se puede usar en una terminal:

```bash
curl -s "https://<ref>.supabase.co/rest/v1/v_daily_sales?select=*" -H "apikey: <anon o publishable key>"
curl -s "https://<ref>.supabase.co/rest/v1/currencies?select=code" -H "apikey: <anon o publishable key>"
```

Lo esperado en las dos es un error de permiso (`42501`, «permission denied»). Un `[]` en la
primera o la lista de monedas en la segunda significa que `anon` tiene `select`: está pasando R2/R3.

Por último, Vercel → el deploy → **Runtime Logs**: cero errores 500 en las rutas de arriba.

### G) Volver atrás si algo sale mal (unos 10 min)

La base no tiene datos reales, así que volver atrás no pierde nada.

1. **Lo más rápido:** Vercel → Deployments → el último deploy de producción **anterior** a las variables → **Instant Rollback** (o «Promote to Production»). Ese build se hizo sin variables y vuelve el aviso de `/login`.
2. **Lo definitivo:** Settings → Environment Variables → borrar de Production `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, y `SUPABASE_SERVICE_ROLE_KEY` si se cargó. `NEXT_PUBLIC_SITE_URL` puede quedar: sin las otras dos no tiene efecto. Después, **Redeploy** sin caché. Sin esas dos variables, `hasSupabaseEnv()` es falso (`src/lib/env.ts:5-7`) y `/login` vuelve al aviso.
3. El proyecto de Supabase puede quedar como está. En el plan Free se pausa solo tras unos 7 días sin actividad. Si se filtró alguna llave, rotarla en API Keys antes de volver a encender.

## 3. Variables

Todas las que lee el código (`grep process.env` en `src/`, `middleware.ts` y `next.config.mjs`):

| Variable | Pública o servidor | De dónde se copia | Entornos de Vercel |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública (va al build). Se lee en `env.ts:6`, `supabase/server.ts:12` y `:38`, `client.ts:8` y `supabase/middleware.ts:11` | Supabase → Project Settings → Data API (Project URL) o **Connect** | Production. No en Preview (ver nota) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública. Se lee en `env.ts:6`, `server.ts:13`, `client.ts:9` y `supabase/middleware.ts:12` | Supabase → Project Settings → API Keys: la legacy `anon`, o la publishable `sb_publishable_…` (ver R6) | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | **Servidor.** Solo `server.ts:39`, que solo usa `registerAction` (`actions.ts:80`), y esa acción no la importa nadie | Supabase → API Keys: la legacy `service_role` o la secret `sb_secret_…` | Recomendación: **no cargarla todavía** (R8). Si se carga: solo Production y marcada sensible |
| `NEXT_PUBLIC_SITE_URL` | Pública. `dashboard/tables/page.tsx:21-22` (URL de los QR por mesa; el valor por defecto es `http://localhost:3000`) | Se escribe a mano: `https://datafud.com` | Production |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Servidor (`app/actions.ts:61` y `:70`, `contact.ts:69`) | Resend | Sin cambios en este paso (opcionales) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Pública y servidor (`turnstile.ts:10`, `:15` y `:20`) | Cloudflare | Sin cambios (opcionales) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Pública (`site.ts:137`) | Meta | Sin cambios (solo si se pauta) |

Notas:
- **Preview y Development.** Con las variables de Supabase en Preview, cada rama apuntaría a la base de producción. Sin ellas, los previews se comportan como hoy: aviso en `/login`. Para el trabajo local se usa `.env.local`, que el `.gitignore` excluye; Development en Vercel solo sirve con `vercel env pull`.
- **Comparación con `.env.example`.** Las 10 variables del código están en `.env.example` y ninguna sobra. Lo único desfasado es un comentario de `.env.example`, líneas 20-21: dice que sin Resend la sección de contacto «ofrece solo WhatsApp y correo», pero desde D-039 no se muestra ningún correo. Hay que corregirlo en la sesión de código.
- **Comparación con `Cuentas-y-Accesos.md`.** Su tabla de variables coincide con el código. No falta ninguna.

## 4. SQL del super admin

Se corre en el SQL Editor después de crear el usuario en Authentication → Users (paso E1). Sin
contraseñas: la contraseña vive solo en Auth y en el gestor.

```sql
-- 1) Confirmar que el usuario existe y está confirmado.
select id, email, email_confirmed_at
from auth.users
where email = '<correo>';

-- 2) Crear (o corregir) su perfil como super admin. Opción por correo:
insert into public.profiles (id, tenant_id, role, full_name)
select u.id, null, 'super_admin', 'Steven Galo'
from auth.users u
where u.email = '<correo>'
on conflict (id) do update
  set role = 'super_admin', tenant_id = null;

-- 2b) Misma operación por UUID (si se prefiere copiarlo de la lista de usuarios):
insert into public.profiles (id, tenant_id, role, full_name)
values ('<uuid>', null, 'super_admin', 'Steven Galo')
on conflict (id) do update
  set role = 'super_admin', tenant_id = null;

-- 3) Comprobar. Esperado: una fila con role = super_admin y tenant_id vacío.
select u.email, p.role, p.tenant_id
from auth.users u
join public.profiles p on p.id = u.id
where p.role = 'super_admin';
```

El SQL Editor corre como `postgres`, que es dueño de las tablas, así que la inserción no depende
de RLS. `profiles` no tiene política de escritura (`schema.sql:325-327`) y a propósito no la debe
tener (postura de `Seguridad.md`).

## 5. Riesgos y recomendación sobre S1 y S3

### Riesgos

| # | Prioridad | Riesgo | Evidencia |
|---|---|---|---|
| R1 | **P0** | **Proyecto nuevo sin permisos de la Data API.** Desde el 2026-05-30, los proyectos nuevos no dan `select/insert/update/delete` sobre tablas nuevas de `public` a `anon`, `authenticated` ni `service_role`. Lo mismo pasa con las vistas: «a new view is born without `select` for the API roles». `schema.sql` solo da permisos de ejecución sobre las dos RPC. Consecuencias: el login funciona, pero leer `profiles` falla, así que `loginAction` manda a `/dashboard` y `getTenantContext` devuelve a `/login`. El super admin no entra, Configuración no lista monedas y Reportes queda vacío. Las RPC `get_menu` y `place_order` sí funcionan, porque son `security definer` con `grant execute` explícito | `schema.sql:459-460` y `:531-532` (los únicos `grant`); `actions.ts:37-42`; `tenant-context.ts:20-26`; changelog de Supabase 45329 |
| R2 | **P0** (antes del primer dato real) | **S1.** Las tres vistas se crean sin `security_invoker`, así que corren con los permisos de su dueño y se saltan RLS. Reportes no filtra por tenant. Si `authenticated` tiene `select` sobre ellas, un restaurante ve las ventas de otro. Si también `anon` lo tiene (proyecto con «exponer tablas automáticamente»), cualquiera con la anon key las lee por la API. Hoy, sin datos, no hay nada que filtrar | `schema.sql:541-573`; `dashboard/reports/page.tsx:27-34`; `Seguridad.md` S1 (reproducido el 2026-09-20) |
| R3 | P1 | **S3.** `currencies` no tiene RLS: no está en la lista de `schema.sql:308-311`. Con permisos amplios, `anon` podría insertar, cambiar o borrar monedas por la API | `schema.sql:43-48` y `:305-315` |
| R4 | P1 | **Middleware muerto.** `middleware.ts` está en la raíz y la app en `src/`. Nadie refresca la sesión ni graba las cookies nuevas: el cliente de servidor ignora `setAll` en Server Components y deja eso al middleware. Esperable: sesiones que se caen al vencer el token de acceso, y la protección de rutas privadas que queda solo en los guardas del servidor (que sí existen). No verificado en producción | `middleware.ts:1-13`; `supabase/server.ts:24-26`; `supabase/middleware.ts:36-43`; `CLAUDE.md`, «Trampas conocidas» |
| R5 | P1 | **Registro público de Auth abierto** por defecto: cualquiera con la anon key crea usuarios en `auth.users` y gasta el cupo de 2 correos por hora. Se cierra en C1 | Postura de `actions.ts:83` (solo la API de administrador) |
| R6 | P1 | **Llaves nuevas contra SDK viejo.** El repo usa `@supabase/ssr ^0.5.2` y `@supabase/supabase-js ^2.45.4`. Supabase deprecia `anon` y `service_role` a fines de 2026, y las llaves nuevas (`sb_publishable_…` y `sb_secret_…`) no son JWT y se mandan en el encabezado `apikey`. No se pudo verificar desde qué versión del SDK funcionan bien. Recomendación: usar la **legacy `anon`** si el proyecto la ofrece; si no, probar primero en local con `.env.local` (login del super admin y `get_menu`) antes de cargarla en Vercel | `package.json`; documentación de API keys de Supabase |
| R7 | P1 | **Plan Free:** sin backups automáticos (se recomienda `db dump` propio), pausa por inactividad de unos 7 días, 500 MB de base y 2 proyectos gratis por organización. Sin clientes no importa. Con un primer local con pedidos, una pausa tumba sus `/m/...`, así que hay que pasar a Pro o tener backups antes | Documentación de facturación, backups y pausa de Supabase |
| R8 | P2 | **`service_role` innecesaria hoy.** Su único uso es `registerAction`, y esa acción no la importa nadie. `/register` redirige y Next 15 no expone el ID de una Server Action que no se usa. Cargarla ahora suma una llave que puede filtrarse sin dar nada a cambio. La necesitará el alta de local desde el super admin (S10), y para eso hay que preguntar primero (regla 5 del `CLAUDE.md`) | `actions.ts:64` y `:80`; `register/page.tsx:14` |
| R9 | P1 | **La contraseña de la cuenta de Supabase está en texto plano en el vault** (`Cuentas-y-Accesos.md`, sección Supabase). La página además pide anotar ahí la contraseña de la base y las llaves. El vault vive en OneDrive. No se copia aquí | `Cuentas-y-Accesos.md` líneas 53-54 |
| R10 | P2 | **`verify.sql` incompleto y solo para `psql`:** no revisa `tenant_charges`, `charge_kind`, permisos ni `security_invoker`, y usa `\echo` | `verify.sql:8-41` |
| R11 | P2 | **`/login` sin rediseño** (paleta `slate`, P1 «re-brandear `/login`») e ignora `?redirect=` | `login-form.tsx:18-24`; `actions.ts:42` |
| R12 | P2 | El nombre viejo «Datfud» sigue en los encabezados de los tres `.sql` | `schema.sql:2`, `verify.sql:2`, `seed.dev.sql:2` |

### Recomendación: S1, S3 y los permisos en el mismo cambio de esquema, antes del redeploy

Se puede encender el backend sin datos reales sin que se filtre nada hoy: no hay tenants ni
órdenes. Aun así, la recomendación es **no redesplegar con las variables hasta que S1, S3 y un
bloque de permisos estén en `schema.sql`**, en una sola sesión de código de unas 4 horas (las
líneas S1 ~3h y S3 ~1h de la cola). Los argumentos:

1. **R1 obliga a escribir permisos de todos modos.** Sin `grant`, el super admin no entra (E5 fallaría). Escribirlos sin S1 dejaría las vistas con `select` para `authenticated` y sin `security_invoker`, que es justo el agujero de S1. Escribirlos con S1 es el mismo bloque.
2. **Ese bloque es la forma más limpia de cumplir la regla 3 del `CLAUDE.md`** («`anon` nunca recibe políticas sobre tablas»): `anon` queda sin ningún permiso sobre tablas ni vistas y solo ejecuta `get_menu` y `place_order`, que ya tienen su `grant` (`schema.sql:460` y `:532`).
3. **S3 incluye mover el middleware**, que es funcional (R4) y además exige un build. Si va en el mismo commit que se publica después de cargar las variables, hay un solo deploy, y su log confirma la línea de Middleware.
4. **S1 dice «antes del primer dato real»,** y el primer dato real llega apenas se dé de alta un local. Dejarlo para «justo después» del encendido abre una ventana donde un alta manual o una prueba con datos verdaderos ya queda expuesta.
5. **El costo de hacerlo antes es bajo:** todo es idempotente (`alter view … set`, `grant` y `revoke`, `drop policy if exists`), y `verify.sql` lo comprueba con las filas nuevas de B2.

Propuesta para la sesión de código. Es un borrador para que entre en `schema.sql` y `verify.sql`
con su revisión; no se pega a mano por separado.

```sql
-- 7) Vistas de reportes: declarar la opción dentro del create, para que un "create or replace"
--    futuro no la pierda.
create or replace view public.v_daily_sales with (security_invoker = true) as ...;   -- igual con las otras dos

-- 6b) S3: currencies de solo lectura para usuarios autenticados.
alter table public.currencies enable row level security;
drop policy if exists currencies_read on public.currencies;
create policy currencies_read on public.currencies for select to authenticated using (true);

-- 11) Permisos de la Data API (proyectos sin exposición automática). Idempotente.
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated, service_role;
-- RLS sigue siendo la frontera: currencies y plans solo tienen políticas de lectura para
-- authenticated; profiles, payments y charges no tienen escritura para el restaurante.
```

En el mismo commit:
- `.eq("tenant_id", tenant.id)` en las dos consultas de `reports/page.tsx` (defensa en profundidad);
- `git mv middleware.ts src/middleware.ts`;
- la consulta de B2 agregada a `verify.sql`;
- «Datfud» → «DataFud» en los tres encabezados (R12).

## 6. Bloque de `docs/vault-sync/` listo para aplicar

Va en un archivo nuevo del puente, por ejemplo `docs/vault-sync/2026-10-03-supabase-produccion.md`.
Se aplica cuando el encendido esté hecho y verificado. Los `<…>` se completan con lo real.

```
### B01 · Supabase en producción (proyecto, esquema, Auth, variables, super admin) · commit <hash de la sesión S1+S3+permisos> · despliegue <dpl_… READY>
**Pendientes.md** — Cerrar en P0: «Supabase + `schema.sql` + `verify.sql` + variables en Vercel (`NEXT_PUBLIC_SITE_URL=https://datafud.com`) + redeploy. Super admin a mano.» (<fecha>, <hash>, deploy <dpl_…>). Cerrar «**S1** vistas con `security_invoker` + filtro por tenant en reportes + revocar `select` a `anon`» y «**S3** RLS de solo lectura en `currencies`. Mover `middleware.ts` a `src/`» si entraron en el mismo commit. Cerrar «Nombre viejo (`datfud`) en los `.sql`» si entró. Nuevos: «P1 · SMTP propio en Supabase Auth (Resend con dominio verificado) antes de que un restaurante necesite recuperar su contraseña»; «P1 · Backups: `db dump` semanal o plan Pro antes del primer local con pedidos»; «P2 · `/login` con `?redirect=`».
Cola `03-Vida-Personal/GaloDeVibes/Pendientes-De-Proyectos.md` (## Datafud → ### Panel de administración listo): marcar `- [x] Supabase, schema.sql, verify.sql y variables en Vercel; super admin a mano · ~2,5h`; marcar también las líneas S1 y S3 si se cerraron, y «Nombre viejo datfud» si entró. Agregar `- [ ] SMTP propio para Auth (Resend) · ~1h` y `- [ ] Backups de la base: dump semanal o plan Pro · ~1h · trámite`.
**Decisiones.md** — D-063 · Encendido del backend (ADR corto: contexto = <primer cliente con pedidos | ensayo previo, según responda Steven>; decisión = proyecto Supabase `<nombre>` en `us-east-1`, plan Free, sin exposición automática de tablas, permisos explícitos en `schema.sql`, registro público de Auth cerrado, variables solo en Production; consecuencias = `/login` con formulario, `/dashboard` y `/admin` activos, D-010 cumplido o adelantado, «Ingresar» sigue fuera del nav hasta la prueba de aislamiento, D-018).
**Seguridad.md** — S1 → Cerrado (<hash>): vistas con `security_invoker`, filtro por tenant en reportes, `anon` sin permisos sobre tablas ni vistas (prueba con curl: 42501). S3 → Cerrado (<hash>): RLS de solo lectura en `currencies`; middleware en `src/` (línea Middleware en el log del build). Postura: «registro público de Auth desactivado»; «permisos de la Data API explícitos (proyecto sin exposición automática)». Security Advisor corrido el <fecha>: <resultado>. Si S1/S3 no entraron, quedan Abiertos con la nota «backend encendido sin datos reales».
**Otras páginas** — `Cuentas-y-Accesos.md` › Supabase: reemplazar «Proyecto: todavía no creado» por nombre `<nombre>`, `project ref` `<ref>`, región `us-east-1`, organización de galodevcr@gmail.com, plan Free, Postgres <versión>, fecha de creación; «la contraseña de la base, la anon/publishable key y la service_role/secret key: en el gestor de contraseñas» (se nombran, no se escriben); sacar de la página la contraseña de la cuenta que hoy está en texto plano. › Vercel: «Variables de entorno: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` en Production (<fecha>)» y el último deploy `<dpl_…>`. › Cuentas de la aplicación: «Super admin creado a mano el <fecha> (correo en el gestor)». `Arquitectura-Y-Base-De-Datos.md`: «Sin proyecto en producción todavía» → «Proyecto `<nombre>` en `us-east-1` desde <fecha>»; `currencies` ya no «Sin RLS (S3)»; quitar el callout de S1 si se cerró; Autenticación punto 1: el middleware ya corre. `Datafud.md` (hub), `Plan-Landing-First.md` (días 1 y 2 hechos) y `Guia-De-Desarrollo.md` (`verify.sql` en el SQL Editor con la consulta única; «responde 500 hasta tener variables» solo vale en local). Repo `CLAUDE.md` › «Etapa actual»: producción ya tiene backend.
**log.md** — `## [<fecha>] ingest | Supabase en producción: proyecto, esquema y super admin` + viñetas: proyecto creado (región, plan, sin exposición automática); `schema.sql` aplicado dos veces sin error y verificación con todas las filas en `ok = true`; Auth con el registro cerrado y las URLs de datafud.com; variables en Production y redeploy `<dpl_…>`; super admin entra por la ruta privada a `/admin`; pruebas de humo de F y curl con 42501.
```

Al aplicarlo, hay que correr
`node ..\obsidian\Cerebro2.0\00-Sistema\scripts\lint-vault.mjs 02-Proyectos/Datafud` y anotar
«Aplicado en vault: sí».

## 7. Preguntas abiertas para Steven

1. ¿El encendido es porque ya cerró un cliente con pedidos (lo que pide D-010) o es un ensayo anticipado? Cambia el texto de D-063 y la urgencia de R7.
2. ¿Hacemos primero la sesión de código S1 + S3 + permisos (unas 4 h) y después el runbook, como se recomienda? ¿O encendemos ya y aceptamos que el super admin no entre hasta esa sesión?
3. ¿Qué correo usa el super admin? Hoy el panel de Supabase está en galodevcr@gmail.com, y Vercel y GitHub en stevengalocr@gmail.com.
4. ¿Tenés `psql` instalado en la compu? Si no, B se hace solo con el SQL Editor y la consulta única.
5. ¿Qué gestor de contraseñas usás? La propuesta es sacar del vault la contraseña de la cuenta de Supabase y no escribir ahí la de la base ni las llaves.
6. ¿Cargamos `SUPABASE_SERVICE_ROLE_KEY` ahora o recién con el alta de local desde el super admin (R8)?
7. Al crear el proyecto, ¿qué pestañas de llaves aparecen (legacy `anon`/`service_role` o solo publishable/secret)? Define R6.
8. ¿SMTP propio con Resend (con el dominio `datafud.com` verificado) entra en este paso o cuando haya un restaurante que necesite recuperar su contraseña?

## Fuentes externas

- Supabase, cambio de permisos por defecto en `public`: https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically y https://github.com/orgs/supabase/discussions/45329
- Supabase, RLS y vistas (`security_invoker`, Postgres 15+): https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase, API keys (publishable/secret, deprecación de las legacy a fines de 2026): https://supabase.com/docs/guides/api/api-keys
- Supabase, SMTP por defecto (2 mensajes por hora, solo el equipo): https://supabase.com/docs/guides/auth/auth-smtp
- Supabase, Redirect URLs y Site URL: https://supabase.com/docs/guides/auth/redirect-urls
- Supabase, backups (el plan Free no tiene backups automáticos): https://supabase.com/docs/guides/platform/backups
- Supabase, pausa de proyectos Free (unos 7 días): https://supabase.com/docs/guides/platform/free-project-pausing
- Supabase, plan Free (2 proyectos, 500 MB, 50 000 MAU, 5 GB de egreso): https://supabase.com/docs/guides/platform/billing-on-supabase
- Supabase, registros y creación de usuarios: https://supabase.com/docs/guides/auth/general-configuration
- Vercel, región por defecto `iad1`: https://vercel.com/docs/functions/configuring-functions/region
- Vercel, variables de entorno (solo aplican a deploys nuevos; Production, Preview y Development): https://vercel.com/docs/environment-variables
