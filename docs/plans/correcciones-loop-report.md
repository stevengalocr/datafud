# Informe final — Loop de correcciones post-revisión (2026-09-20)

Rama de trabajo `claude/complete-loop-izbij4` · todo publicado en `main` por push directo, un
commit por unidad, con despliegue automático a producción en Vercel. Estado por iteración en
[`correcciones-loop-state.md`](./correcciones-loop-state.md); cola para el vault en
[`../vault-sync/2026-09-20-correcciones.md`](../vault-sync/2026-09-20-correcciones.md).

## Resumen

En 11 iteraciones (de 25) se cerraron los nueve hallazgos de la revisión independiente: la
landing ya no ofrece un "Ingresar" que no podía funcionar y `/login` degrada con un aviso de
marca; la ruta privada del super admin salió de `robots.txt` y las rutas de acceso llevan
noindex; la contraseña semilla desapareció de todos los archivos vigentes y las semillas de
usuarios viven en `seed.dev.sql` con contraseña por variable; el formulario de contacto resiste
bots sin servicios nuevos; el copy no promete resultados; el QA de la landing es un script
versionado y `lighthouse` dejó de pesar en `node_modules`; el repo tiene `CLAUDE.md` con el
protocolo de alineación con el vault; y la verificación final pasó dos pasadas con rúbrica ≥ 4.

## Unidades

| ID | Unidad | Commit | Despliegue Vercel |
|---|---|---|---|
| C00 | Estado inicial + prueba de publicación | 8b788f9 | READY `dpl_3b1euycSdZubyBgkDUEmx8hEZjyD` |
| C01 | Acceso cerrado con dignidad | 6e173b0 | READY `dpl_A83jsKJhZcVBPxDuz4M3sDooh9Wd` |
| C02 | Ruta privada fuera de robots + noindex | 94db3a5 | READY `dpl_BsMyrnuTuMf92ErwqkivJ84U1BsP` |
| C03 | Credenciales fuera del repo (`seed.dev.sql`) | de882b6 | READY `dpl_4bbZkUSq1LfWRdWmr78s19YvXtij` |
| C04 | Formulario anti-abuso | ae1b32a | READY `dpl_6HuYV8MKnkbA9rWWnTTzdu86Hine` |
| C05 | Copy honesto | 236e674 | READY `dpl_87hryu7YvUvfuzP44emUD48zkJee` |
| C06 | QA sin peso en producción | e27fe85 | READY `dpl_8rELmX7LjUHRW8M5rCNG3qCptKMr` |
| C07 | `CLAUDE.md` | af089cb | READY `dpl_9QoATAYw9JCNmAddog5xqJCNwZcM` |
| C08 | Verificación final (2 pasadas) | 3efb23e | READY `dpl_J8Xb9vGxu55RFAxVBr2oyjF3ykGg` |
| C09 | Este informe + CHANGELOG + cierre del vault-sync | (commit de este archivo) | ver estado (it. 11) |

## Rúbrica final (1–5)

| Criterio | Nota | Evidencia |
|---|---|---|
| Claridad de la oferta | 5 | Hero, highlights y planes: qué, cuánto, cuándo y cómo pedirlo |
| Confianza | 4 | Sin enlaces que no funcionan; /login explica; legal; compromisos; falta el primer caso real |
| Marca | 5 | Sin blur ni degradados en la landing; paleta y tipografías de BRAND.md |
| Copy | 5 | Sin promesas de resultado; funciones reales en los planes; voseo |
| Responsive | 5 | `npm run qa:landing` OK en 375/768/1440 |
| Accesibilidad | 5 | Lighthouse 100 en `/` y `/login`; acordeón y menú por teclado |
| Rendimiento | 4 | Lighthouse móvil 95 / 95 (LCP 2,7–2,9 s, CLS 0); fotos remotas no medibles en el sandbox |
| SEO | 5 | 100 en `/`; robots y sitemap limpios; noindex en rutas de acceso |
| Honestidad comercial | 5 | Grep ampliado = 0; el eslogan queda a decisión de Steven |
| Calidad del código | 4 | Sin locals sin uso ni `any`; helpers junto a su dominio; `page.tsx` 410 líneas |
| Seguridad básica | 4 | Sin credenciales vigentes, noindex/robots, anti-abuso; S1/S3/S10 quedan para el encendido del backend |

## Lighthouse (móvil, `next start` local, reduced-motion forzado)

| Ruta | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/` | 95 (dos corridas: 95 / 95) | 100 | 96 | 100 |
| `/login` | 100 | 100 | 96 | 66 (bloqueada a propósito: noindex) |

Una corrida de `/` justo después de `qa:landing` dio 64 por contención de CPU del sandbox; las
dos corridas con la máquina libre dieron 95. Best Practices 96 por `errors-in-console`: fotos de
Unsplash y `/_vercel/insights/script.js` no cargan en el sandbox (en Vercel sí).

## Cambios de copy (antes → después)

| Dónde | Antes | Después |
|---|---|---|
| Stand de reseñas (benefit) | "…Más estrellas, más mesas llenas." | "…llevan al comensal directo a tu ficha de Google para dejar la reseña, sin buscar nada." |
| Stand de reseñas (etiqueta) | "Para subir tus estrellas" | "Para pedir reseñas" |
| Act-break (título) | "Hecho para llenar mesas en Latinoamérica." | "Hecho para las mesas de Latinoamérica." |
| Act-break (texto) | "…una experiencia digital que vende más y opera mejor." | "…una carta digital que se ve mejor, se actualiza sola y habla el idioma de cada cliente." |
| Plan Estándar | "Soporte prioritario por WhatsApp" | "Soporte por WhatsApp en horario de oficina" |
| Plan Empresarial | "Reportes avanzados de venta" | "Ventas por día, ticket promedio y platillos más vendidos" |
| Plan Empresarial | "Soporte dedicado por WhatsApp" | "Soporte por WhatsApp con contacto directo" |
| Plan Empresarial (tagline) | "Sin límites para tu crecimiento" | "Sin límites de platillos, categorías ni mesas" |
| `/login` (nuevo, sin backend) | formulario que no autenticaba | "El acceso al panel se activa con tu implementación" + WhatsApp + volver |

## Lo que NO se pudo verificar y por qué

- **`seed.dev.sql` y `verify.sql` no se ejecutaron**: no hay base de datos ni proyecto Supabase
  de Datafud accesible. Se revisaron línea por línea contra la sección original; la sintaxis de
  psql (`\if :{?var}`, `\set`, `set_config`) es estándar desde psql 10.
- **Envío real por Resend y verificación real de Turnstile**: sin claves en el entorno. Se probó
  con una clave falsa de Resend (la petición llega y falla por la clave) y el widget de Turnstile
  con una site key de prueba (se renderiza; la verificación en servidor no se ejercitó).
- **Producción con carga real**: la puerta J se verificó con la API de Vercel (READY y alias) y, en
  el loop anterior, con una lectura del HTML de producción; en este loop la lectura directa de
  datafud.com quedó fuera del sandbox.
- **Rendimiento con las fotos remotas**: Unsplash no carga en el sandbox; el Performance real en
  Vercel puede variar unos puntos.
- **Aplicación directa al vault**: el conector de Drive de la sesión crea archivos pero no edita el
  contenido de los existentes; el puente se subió como archivo nuevo al nodo y las páginas se
  actualizan con "sincronizá el vault".

## PENDIENTES-STEVEN

- [ ] Decidir si el eslogan "El menú digital que abre apetito y cierra ventas" (hero y OG) se
      mantiene como identidad de marca o se reemplaza por uno sin promesa de resultado.
- [ ] Si alguna vez se corrió el `schema.sql` antiguo en una base real, cambiar la contraseña de
      esas cuentas: la antigua está en el historial público del repo.
- [ ] Decidir si el repo pasa a privado (recomendado en Seguridad.md; no bloquea nada).
- [ ] Opcional: Turnstile (dos variables en Vercel + redeploy) si el formulario recibe spam.
- [ ] Siguen del loop anterior: `RESEND_API_KEY` + redeploy, Web Analytics en Vercel, fotos del
      hardware, revisión legal de `/terminos` y `/privacidad`, prueba en teléfono real.
- [ ] "Sincronizá el vault" desde Cowork con `docs/vault-sync/2026-09-20-correcciones.md`.
