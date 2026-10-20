# Plan · Doble factor del super admin (resto de S16 / AS-1)

Estado: **propuesto, sin código** (loop «base sólida», 2026-10-19). Se escribió en vez de
implementarlo porque necesita un cambio de `schema.sql` (y por lo tanto un release con el esquema
aplicado antes, regla del repo) y no se puede probar sin un proyecto de Supabase real: el flujo de
inscripción y desafío vive en Supabase Auth.

## Por qué

La cuenta del super admin ve y cambia todos los locales. Hoy entra solo con contraseña. El doble
factor tiene que valer **en la base**, no solo en `/admin`: si solo lo pide la interfaz, la sesión
de un solo factor sigue teniendo el permiso completo por RLS.

## Qué se hace (una rama, un release)

1. **Inscripción en el panel** (`/admin/cuenta`): botón «Activar doble factor» →
   `supabase.auth.mfa.enroll({ factorType: "totp" })` muestra el QR (SVG que devuelve Supabase,
   como `<img>` con `data:`; sumar `data:` a `img-src` de la política de `/admin` si hace falta) y
   la clave para copiar; el código de la app de autenticación se confirma con
   `mfa.challengeAndVerify`. Lista de factores con «Quitar» (pide sesión `aal2`).
2. **Desafío al entrar**: después del login, si `mfa.getAuthenticatorAssuranceLevel()` da
   `nextLevel = aal2` y `currentLevel = aal1`, el super admin va a una pantalla de código fuera de
   `/admin` (dentro del `matcher` del middleware) antes de ver el panel.
3. **Guardas del servidor**: `requireRole("super_admin")` y `superAdmin()` de
   `src/app/admin/actions.ts` rechazan una sesión `aal1` cuando el usuario tiene un factor
   verificado.
4. **Base** (`schema.sql`, sección nueva, idempotente): `is_super_admin()` exige
   `auth.jwt() ->> 'aal' = 'aal2'` **solo si** el usuario tiene un factor verificado en
   `auth.mfa_factors`. Así aplicar el esquema antes de inscribirse no deja a nadie afuera. Fila
   nueva en `verify.sql` (pasa a 52) y caso nuevo en `scripts/prueba-esquema.mjs` (la réplica de
   Supabase suma `auth.jwt()` y `auth.mfa_factors`).
5. Documentar en `docs/USER_MANUAL.md` (sección del super admin) y en el vault (S16).

## Orden de publicación

1. Steven confirma en Supabase → Authentication → MFA que TOTP está habilitado (viene encendido).
2. Steven aplica `schema.sql` y `verify.sql` da 52/52.
3. Squash-merge a `main` (Vercel despliega).
4. Steven se inscribe desde `/admin/cuenta`, cierra sesión y vuelve a entrar con el código.

## Fuera de alcance

Doble factor para los dueños de los locales (opcional, después de la primera venta) y códigos de
recuperación propios: si se pierde el teléfono, el factor se borra desde el panel de Supabase.

## Estimación

~4h de código y revisión + ~30m de Steven (pasos 1, 2 y 4).
