# Paneles con sesión que fallan en Vercel — RESUELTO (2026-10-03, noche)

> **Causa raíz:** `src/lib/og.tsx` leía dos fuentes TTF con `readFileSync` **al importarse**.
> Next importa cada `opengraph-image` (la raíz, las guías y los legales) para armar los metadatos
> de **toda ruta dinámica** (`/admin/*`, `/dashboard/*`, `/m/*`). En Vercel la función de esas
> rutas no lleva esos archivos, la lectura fallaba y los metadatos quedaban en error
> (`{"metadata":"$undefined","error":"$Z"}` en el payload RSC). En la carga completa no se notaba;
> al navegar con el menú lateral, el router lanzaba ese error dentro del segmento de la página y
> caía en `error.tsx` («Esta página no cargó»), sin `digest` y sin log en el servidor.
>
> **Por qué parecía Supabase:** las páginas estáticas resuelven los metadatos en el build (donde
> los archivos existen). `diag4` (sin imports) se prerenderizaba estática y cargaba; `diag5` usaba
> `cookies()` vía `createClient()`, pasaba a dinámica y fallaba. Supabase no tenía nada que ver:
> `/m/demo/1`, pública y sin sesión, fallaba igual.
>
> **Reproducción local:** `next build` y luego `next start <repo>` **desde otra carpeta** (cambia
> `process.cwd()`, como en Vercel): `/m/demo/1` devuelve `"error":"$Z"`. Desde la carpeta del repo,
> no.
>
> **Arreglo (`6382835`):** las fuentes se leen dentro de `ogImage()`, al dibujar (en el build),
> con caché en memoria. Verificado en local con la misma reproducción y en producción (ver abajo).
> **Regla:** ningún módulo que importen los metadatos (`opengraph-image`, `icon`, layouts) hace
> E/S al importarse.

---

## Historia del diagnóstico (tal como quedó al cierre del 2026-10-03)

## Síntoma

- En producción (`datafud.com`), **toda página de `/admin` que crea el cliente de Supabase del
  servidor** muestra «Esta página no cargó» (el `error.tsx` del panel). En la consola del navegador:
  `Error: An error occurred in the Server Components render…` desde el chunk `1255-*.js`.
- La barra lateral (el layout de `/admin`) **sí** se dibuja: `requireRole("super_admin")` corre bien
  en el servidor (lee la sesión y `profiles`).
- En los logs de Vercel cada falla aparece solo como `render /admin (server-rendering) · digest …`,
  vía `src/instrumentation.ts` (`onRequestError`). **No hay ningún error con renderSource
  `react-server-components`**: el servidor no registra el error original.
- Último deploy con el error confirmado: `dpl_5DrTXAoQuw6MHANn9mqHd4sFvXER` (`fb79b92`), 00:26 del
  2026-10-04 (hora UTC), digest `3266770860`.

## Lo que se probó y su resultado

| Prueba | Resultado |
|---|---|
| Páginas de diagnóstico en producción (ya borradas en `fb79b92`) | `diag4` (página **sin imports**): **carga**. `diag5` (solo `await createClient()` de `@/lib/supabase/server`, sin consultas): **falla**. `diag` (consultas y componentes, cada uno con su error boundary): el código del servidor corrió (logs: `tenants 200`, `payments 200`, usuario reconocido) y aun así la página entera falla, sin que ningún boundary interno lo atrape |
| Mismo código, mismas variables, `next dev` local con la `anon` | Carga |
| Mismo código, `next build` + `next start` local con la `anon` | Carga (una sola vez falló justo después de arrancar el servidor; después, siempre cargó) |
| Llave equivocada | En `.env.local` y por un rato en Vercel, `NEXT_PUBLIC_SUPABASE_ANON_KEY` tuvo la `service_role`. Ya corregido y verificado por el rol del JWT: hoy es la `anon`, y la `service_role` vive solo en `SUPABASE_SERVICE_ROLE_KEY`. Ningún JS público contenía llaves (revisado en el deploy `dpl_7x36…`) |
| `@supabase/ssr` 0.5.2 → 0.12.7 y `supabase-js` 2.107 → 2.117 (`fb79b92`) | El build quedó sin advertencias, pero **no resolvió** el error |
| Versión de Node | Vercel corre 24.x, igual que local (24.15) |
| Permisos de la base | `verify.sql` en `ok` en todas las filas (después del arreglo de `anon` sobre los helpers, `22dc3a4`) |

## Hipótesis para mañana (sin verificar)

1. **Escritura de cookies después de responder.** Crear el cliente arranca la inicialización de
   Auth en segundo plano; si guarda la sesión (`setAll` → `cookies().set`) cuando el render ya
   terminó, en Vercel puede cortar el stream sin log. Prueba: un cliente de **solo lectura** para
   Server Components (`setAll` vacío; el middleware es el único que refresca la sesión) y
   `auth: { autoRefreshToken: false, persistSession: false }` en ese cliente.
2. **Middleware en Edge que reescribe cookies del request.** En local el middleware corre en el
   mismo proceso; en Vercel corre en Edge y reenvía las cookies con encabezados `x-middleware-*`.
   Prueba: registrar en el middleware si llama a `setAll` y cuántas cookies reescribe; probar sin
   reescribir las del request.
3. **Concurrencia de Fluid compute.** Cada carga de `/admin` dispara al mismo tiempo los prefetch
   de Restaurantes, Pagos, Cargos y Planes, que caen en la misma instancia. Prueba: `prefetch={false}`
   en el menú lateral, o desactivar Fluid compute en el proyecto, y comparar.
4. **Ver el mensaje real.** Desplegar a Preview con `NODE_ENV` de producción no muestra el mensaje;
   alternativa: capturar el error en el `onError` de React vía un wrapper, o reproducir con
   `next start` dentro de un contenedor Linux con las mismas variables.

## Qué funciona hoy en producción

La landing, las guías, `/c/<slug>`, `/q/<código>`, `/preview`, `/login` y la entrada privada
(formulario e inicio de sesión: el `POST` responde 303 a `/admin`). Lo que falla es el contenido de
las páginas con sesión (`/admin/*` y, por la misma causa, previsiblemente `/dashboard/*`; no
verificado con un usuario de restaurante).

## Qué quedó hecho en código (verificado en local y con un Supabase falso, no en producción)

Alta de local desde el super admin (S10), errores visibles en todas las acciones, editar
categorías, tablero de órdenes que se refresca cada 15 s, formularios que no pierden lo escrito,
confirmaciones con la marca y movimiento de los paneles. La base de producción sí tiene aplicados
S1, S3, S4 y el cierre de `anon` (`verify.sql` en `ok`).
