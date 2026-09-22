# Estado del loop — Landing lista para vender (2026-09-22)

> Tercer bucle autónomo. Deja datafud.com lista para prospectar en Costa Rica y publicar
> contenido. Prompt maestro: vault `Datafud/Claude-Code/Loop-Lista-Para-Vender.md` (v2), con
> las DECISIONES CERRADAS D-023 a D-027 delegadas por Steven el 2026-09-22.
> Si la sesión se corta: "Releé docs/plans/venta-loop-state.md y continuá el loop".

## Contador

- Iteración actual: 2
- Iteraciones consumidas: 2 / 30

## Capacidades del entorno

| Capacidad | Estado | Evidencia |
|---|---|---|
| Navegador real | Sí | Chromium 1194 en `/opt/pw-browsers`, `@playwright/test` 1.63 |
| Red a datafud.com | No directa | `curl https://datafud.com/` → proxy 403; producción se verifica por la API de Vercel (MCP) |
| Red a images.unsplash.com | No | Fotos remotas 403 en `next start` local (aviso, no fallo) |
| gh CLI | No | Se usa `git push` y el MCP de GitHub |
| Vercel | Sí (MCP) | Proyecto `datafud` `prj_n957iGSeYbe4GbTsDxlP0ytLHJSt`, equipo `team_wie7tIOS71SxsvQxiLaKSs3o` |
| Google Drive (vault) | Lectura y alta de archivos; no edita contenido de `.md` existentes | `search_files` encuentra `Pendientes.md`; `update_file` solo cambia título/carpeta |
| Lighthouse | Sí | `npx lighthouse@12.8.2` con `CHROME_PATH=/opt/pw-browsers/chromium` |

## Unidades

| ID | Título | Estado | Intentos | Commit | Despliegue | Evidencia |
|---|---|---|---|---|---|---|
| V01 | Estado, línea base y puente | hecho | 1 | 875c017 | READY (`dpl_EhfVfzZ1CAa3cNzqvjrUKmMuNc1z`) | Línea base abajo; push directo a main aceptado |
| V02 | Oferta y precios en colones | hecho | 1 | (este commit) | ver V03 | typecheck/lint/build ok; qa:landing OK · 3 avisos (fotos remotas); grep `$249\|$29/mes\|1 año de soporte` en landing = 0; captura planes 375 y 1440 mirada: CRC grande, ≈ US$ chico, implementación por plan, primer pago ₡39 800 / ₡149 900 / ₡174 900, anual y garantía bajo la Carta, fundadores arriba; JSON-LD Product con offers CRC y USD; schema.sql diff = 2 líneas de semillas |
| V03 | Hero y mensaje | pendiente | 0 | | | |
| V04 | Legales publicables | pendiente | 0 | | | |
| V05 | Confianza real | pendiente | 0 | | | |
| V06 | Preguntas de Costa Rica | pendiente | 0 | | | |
| V07 | Demo sin errores y QR | pendiente | 0 | | | |
| V08 | Página más corta y coherente | pendiente | 0 | | | |
| V09 | Medición y contacto | pendiente | 0 | | | |
| V10 | SEO local | pendiente | 0 | | | |
| V11 | Kit de prospección y contenido | pendiente | 0 | | | |
| V12 | Verificación final (≥ 2 pasadas) | pendiente | 0 | | | |
| V13 | Informe final y cierre del puente | pendiente | 0 | | | |

## PENDIENTES-STEVEN

- Foto propia en `public/equipo/steven.webp` (hoy: avatar "SG").
- Fotos reales de los stands en `public/hardware/*.webp` (hoy: renders con "Render ilustrativo").
- Redes sociales (hoy vacías en `SITE.social`; el footer las muestra solas cuando tengan URL).
- Buzón `hola@datafud.com` y cambiar `SITE.email` (una línea en `src/lib/site.ts`).
- Vercel: `RESEND_API_KEY` + `RESEND_FROM_EMAIL` de dominio verificado, `NEXT_PUBLIC_META_PIXEL_ID` si se pauta, Web Analytics y **redeploy**.

## Línea base (iteración 1, `main` @ ddba8cc)

- `npm ci` → ok · `npm run typecheck` → 0 errores · `npm run lint` → "No ESLint warnings or errors" · `npm run build` → ok (28 rutas).
- `npm run qa:landing` → OK · 3 avisos (fotos remotas 403 por red del entorno).
- Medición móvil 375×812 (Playwright, reduced motion), `/`:
  - Alto total: **21 174 px**.
  - Secciones en `<main>`: **12**.
  - Texto visible: "48" aparece **10** veces; "15 días" **6** veces. En el HTML servido: "48" 140 (incluye clases y datos), "15 días" 22.
  - Elementos de texto con fuente < 12 px: **49**.
- Lighthouse móvil (12.8.2, local, CPU del contenedor): Performance **61** · Accessibility **100** · Best Practices **96** (errores de consola = fotos remotas 403) · SEO **100**. Performance local está limitada por la CPU del sandbox y las fotos remotas que fallan; se compara contra este mismo entorno.
- Lectura hecha: CLAUDE.md, BRAND.md, .impeccable.md, MARKETING.md, landing completa (page + 20 componentes), legales, seo/faq/site/constants, demo (mock + preview), qa-landing.mjs, semillas de planes de schema.sql.

## Bitácora

- **It. 1 · V01.** Plan: crear estado y puente, medir línea base, commit y publicar en main para probar la ruta de publicación. Riesgo: push directo a main rechazado → PR por MCP de GitHub.
- **It. 2 · V02.** Plan: extender `PRICING` (CRC por plan, `setupFee` carta/sistema, anual, `founderOffer`, `terms`, hardware CRC y entrega), `formatCrc`/`formatUsd` con separador propio (el ICU "es" no agrupa 4 cifras: "6000"), reescribir `pricing-v2.tsx`, hardware en CRC, JSON-LD con dos ofertas, semillas y docs. Se mantiene `PRICING.setupFeeUsd` (alias del sistema) porque `admin/charges` lo usa y está fuera de alcance. Hecho; FAQ y términos solo retocados para compilar (los reescriben V04 y V06).
