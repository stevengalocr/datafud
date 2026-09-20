# Estado del loop — Correcciones post-revisión (2026-09-20)

> Archivo de estado del segundo bucle autónomo. Cierra los hallazgos de la revisión
> independiente del 2026-09-20 sobre la fachada publicada por el loop anterior
> (`landing-loop-state.md`, `landing-loop-report.md`). Si la sesión se corta: "Releé
> docs/plans/correcciones-loop-state.md y continuá el loop".

## Contador

- Iteración actual: 1
- Iteraciones consumidas: 1 / 25

## Capacidades del entorno

| Capacidad | Estado | Evidencia |
|---|---|---|
| Navegador real | Sí | Chromium 1194 en `/opt/pw-browsers`, `@playwright/test` 1.63 |
| Red a datafud.com | Parcial | Sin salida directa; se lee producción vía la herramienta `web_fetch` de Vercel y la API de despliegues |
| Red a images.unsplash.com | No | En `next start` local las fotos remotas devuelven 500 (solo en el sandbox) |
| Publicar en main | Sí | Push directo aceptado en el loop anterior (18 commits) |
| Google Drive (vault) | Sí, lectura y escritura por MCP | El puente `docs/vault-sync/…` se escribe siempre; la aplicación directa al vault se hace al cerrar (C09) |
| Base de datos | No | No hay proyecto Supabase: `seed.dev.sql` no se puede ejecutar acá |

## Unidades

| ID | Título | Estado | Intentos | Commit | Despliegue | Evidencia |
|---|---|---|---|---|---|---|
| C01 | Acceso cerrado con dignidad (sin "Ingresar"; /login con aviso sin backend) | pendiente | 0 | | | |
| C02 | Ruta privada fuera de robots + noindex | pendiente | 0 | | | |
| C03 | Credenciales fuera del repo (`seed.dev.sql`) | pendiente | 0 | | | |
| C04 | Formulario anti-abuso (trampa de tiempo, URLs, Turnstile opcional) | pendiente | 0 | | | |
| C05 | Copy honesto | pendiente | 0 | | | |
| C06 | QA sin peso en producción (`qa:landing`) | pendiente | 0 | | | |
| C07 | `CLAUDE.md` en el repo | pendiente | 0 | | | |
| C08 | Verificación final y pulido (mín. 2 pasadas) | pendiente | 0 | | | |
| C09 | Informe final y cierre de vault-sync | pendiente | 0 | | | |

## PENDIENTES-STEVEN

- Los del informe anterior siguen vigentes: `RESEND_API_KEY` + redeploy, Web Analytics en Vercel, fotos del hardware, revisión legal, prueba en teléfono real.
- Se agregan los que salgan de este loop (ver bitácora).

## Línea base (iteración 1, `main` @ f90bfd7)

- `npm run typecheck` → 0 errores · `npm run lint` → 0 warnings · `npm run build` → ok.
- Lectura: README, BRAND, .impeccable.md, los dos documentos del loop anterior, nav/menú
  móvil/footer, login, ruta privada, robots/sitemap, `schema.sql` sección 10 (líneas 628–766),
  `verify.sql`, USER_MANUAL/PRODUCT/README/specs/plans (menciones de la contraseña semilla:
  10 líneas en 6 archivos), `actions.ts`, `contact.ts`, `contact-form.tsx`, `constants.ts`,
  `faq.ts`, `seo.ts`. Vault: `CLAUDE.md` del vault (formato de frontmatter y de log) y
  `Seguridad.md` (S1–S13).

## Bitácora

### Iteración 1 — arranque y prueba de publicación

- Estado y `docs/vault-sync/2026-09-20-correcciones.md` creados. Prueba de publicación con
  estos dos archivos por el procedimiento oficial.
