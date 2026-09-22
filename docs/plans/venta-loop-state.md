# Estado del loop — Landing lista para vender (2026-09-22)

> Tercer bucle autónomo. Deja datafud.com lista para prospectar en Costa Rica y publicar
> contenido. Prompt maestro: vault `Datafud/Claude-Code/Loop-Lista-Para-Vender.md` (v2), con
> las DECISIONES CERRADAS D-023 a D-027 delegadas por Steven el 2026-09-22.
> Si la sesión se corta: "Releé docs/plans/venta-loop-state.md y continuá el loop".

## Contador

- Iteración actual: 8
- Iteraciones consumidas: 8 / 30

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
| V02 | Oferta y precios en colones | hecho | 1 | c3ad02c | READY (`dpl_EqvNfLhFP2UGTfQ7CJQn9LVfohtQ`) | typecheck/lint/build ok; qa:landing OK · 3 avisos (fotos remotas); grep `$249\|$29/mes\|1 año de soporte` en landing = 0; capturas planes 375 y 1440 miradas: CRC grande, ≈ US$ chico, implementación por plan, primer pago ₡39 800 / ₡149 900 / ₡174 900, anual y garantía bajo la Carta, fundadores arriba; JSON-LD Product con offers CRC y USD; schema.sql diff = 2 líneas de semillas |$29/mes\|1 año de soporte` en landing = 0; captura planes 375 y 1440 mirada: CRC grande, ≈ US$ chico, implementación por plan, primer pago ₡39 800 / ₡149 900 / ₡174 900, anual y garantía bajo la Carta, fundadores arriba; JSON-LD Product con offers CRC y USD; schema.sql diff = 2 líneas de semillas |
| V03 | Hero y mensaje | hecho | 1 | 274abf7 | READY (producción, ver lista de Vercel) | Captura 375×812 mirada: sin scroll se leen etiqueta 'Menú digital QR · Costa Rica', H1 'Tu carta digital con QR, lista en 48 horas', para quién (sodas, cafeterías y restaurantes de Costa Rica), 'Quiero mi carta' (WhatsApp), 'Ver la demo', 'Desde ₡14 900/mes · Te la montamos nosotros · Cambios por WhatsApp' y la pastilla de fundadores. Chip 'Orden #18 · Recibida en cocina' reemplazado por 'Carta publicada · Español · English' (el hero no promete pedidos). Title/description con menú digital, QR y Costa Rica; OG renderizado y mirado (sin ₡: la fuente dinámica no baja en el build). grep 'cierra ventas' = 0 en src y docs vivos |
| V04 | Legales publicables | hecho | 1 | 7b50cda | READY (producción) | grep -rn 'REVISAR\ |Borrador' src/app/(legal) src/components/marketing = 0; curl /terminos y /privacidad → 200, 0 'REVISAR/Borrador' en el HTML; captura /terminos 375 completa mirada (15 secciones legibles, versión 1.0 vigente desde el 22 de setiembre de 2026); montos de términos generados desde PRICING (₡14 900, ₡24 900, ₡49 900, ₡24 900, ₡125 000, ₡149 000); privacidad: Ley 8968 sin afirmar inscripción, Vercel Web Analytics, Resend, píxel de Meta según variable ('hoy no lo usamos' sin ella); qa:landing OK |
| V05 | Confianza real | hecho | 1 | b4979c6 | READY (producción) | HTML servido de /: 0 'data-testimonials' y 0 '<blockquote>' con TESTIMONIALS vacío; 'Render ilustrativo' visible en los 4 productos (sin public/hardware/); fotos de stock con alt 'Foto ilustrativa…'; avatar 'SG' (sin public/equipo/steven.webp); SITE.social vacío → 0 enlaces de redes; capturas confianza 1440 y hardware 375 miradas; qa:landing OK; gates E/F/L = 0 |
| V06 | Preguntas de Costa Rica | hecho | 1 | 394b55d | READY (producción) | Playwright sobre / : 15 preguntas visibles = 15 en JSON-LD FAQPage, preguntas y respuestas idénticas 1:1 (qMatch/aMatch true); orden precio → incluye → pago → factura → contrato → plazos → cambios → hardware → lo demás; '1 año de soporte' = 0; cifras de primer mes generadas con firstPaymentFor (₡39 800 / ₡149 900 / ₡174 900) = planes; contrato y cancelación = términos (15 días); qa:landing OK |
| V07 | Demo sin errores y QR | hecho | 1 | 296c27d | READY (producción) | Capturas /preview/cliente y /preview/dashboard a 375 miradas: '₡2 800', 'Menú · Mesa 1', ranking 86/71/64/58/29; qa:landing (con /preview, /preview/cliente, /preview/dashboard) sin '₡…,00', sin 'MESA MESA', sin '[REVISAR'; /preview/admin: 0 enlaces desde /, /preview, cliente y dashboard, meta noindex, fuera del sitemap; QR: SVG servido == qrcode.toString('https://datafud.com/preview/cliente') (misma ruta de módulos), visible desde md (captura 1440), oculto en móvil; formatMoney: CRC → formatCrc siempre (16 usos revisados: dashboard/menu-manager 1, orders 2, dashboard 2, reports 3, m/menu-client 4, preview/dashboard 4; ninguno depende de los decimales de CRC; demás monedas sin cambio) |
| V08 | Página más corta y coherente | hecho | 1 | (este commit) | ver V09 | Medición 375×812 (Playwright): alto 21 174 → 14 754 px (69,7 %); secciones 12 → 8 (hero, cómo funciona, demo, planes, hardware, por qué, preguntas, contacto); texto visible '48' 10 → 3 y '15 días' 6 → 3; textos < 12 px 49 → 0 (maqueta del teléfono de la demo queda aria-hidden y oculta en móvil). Lighthouse móvil local 12.8.2: 96 / 100 / 96 / 100 (base 61 / 100 / 96 / 100; el único error de consola son fotos remotas 403 del entorno). '18 monedas' y tira de monedas fuera; 'Hecho en Costa Rica'; 'Multi-idioma' = 0. qa:landing OK; nav a 1024 y 'Cómo funciona' a 375 mirados |
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
- **It. 3 · V03.** Plan: H1 y etiqueta en español, subtítulo con Costa Rica y lo que da la Carta, CTA "Quiero mi carta" con mensaje de Carta, "Ver la demo" directo a /preview/cliente, línea de precio en CRC, pastilla de fundadores, barra de highlights sin repetir plazos, title/description/OG. Padding superior del hero en móvil de 64 a 32 px para que todo entre en 812. Hecho.
- **It. 4 · V04.** Plan: quitar el aviso de borrador y el resaltado `[REVISAR]` de `legal-page.tsx`; reescribir términos (responsable, planes desde PRICING, plazos y reloj, garantía 48 h, pagos SINPE/transferencia, cancelación 15 días, reembolsos, hardware 3 meses, entrega, contenido del cliente, disponibilidad sin porcentaje, límite de responsabilidad, ley y tribunales de Costa Rica) y privacidad (Ley 8968, Vercel Web Analytics, Resend, píxel condicionado a la variable, UTMs, derechos). Datos sin decisión (días de atraso, meses de retención, plazo de respuesta) redactados sin cifra. `metaPixelId()` vive en `site.ts` (no se crean archivos nuevos en `src/lib`). Hecho.
- **It. 5 · V05.** Plan: `SITE.founder` y `SITE.social` (tres claves vacías + `socialLinks()`), `TESTIMONIALS` vacío con componente que no se renderiza, foto del fundador y fotos del hardware detectadas con `existsSync` en el build, etiqueta "Render ilustrativo", alt "Foto ilustrativa" en stock, sección #confianza como "Por qué DataFud" (4 puntos verificables + 3 compromisos). Documentado en MARKETING §6 cómo cargar un testimonio. Hecho.
- **It. 6 · V06.** Plan: reescribir `faq.ts` con 15 preguntas y respuestas solo desde PRICING y D-023…D-027; fusionar "¿Y si no me sirve?" en "¿Hay contrato?", "clientes extranjeros" en "¿Mis clientes van a saber usarlo? ¿Y los turistas?", "internet en el local" en "¿Qué pasa si algo falla?"; sacar "ya tengo carta" y "tipos de negocio" (los cubren el hero y las páginas de nicho de V10). Hecho.
- **It. 7 · V07.** Plan: `formatMoney` → `formatCrc` para CRC (la BD tiene `decimal_digits = 2` para CRC, así que se fuerza por código); etiqueta de mesa "1" en `mock.ts` (la UI de `src/app/m/` antepone "Mesa", sin tocarla); top de platillos ordenado; límites de planes del mock alineados a V02; voseo en /preview; /preview/admin fuera del índice y del banner, con `noindex`; QR SVG con `qrcode` en el servidor. Se tocó `src/components/preview/preview-banner.tsx` (solo lo usa /preview) para sacar el enlace al admin. `qa-landing.mjs` suma rutas de la demo, chequeos de ",00", "MESA MESA", "[REVISAR"/"Borrador", /preview/admin y QR; fotos remotas directas pasan a aviso y los carruseles con scroll propio no cuentan como desborde. Hecho.
- **It. 8 · V08.** Plan: sacar tira de monedas + stats, "El sistema" (dos caras con fotos de stock), bloque de ambiente y el paso a paso con fotos; `ImplementationSection` pasa a `#como-funciona` como única línea de tiempo (Día 0 → Día 2 → Días 3 a 5 → Día 15) con "nosotros / vos"; orden hero → cómo funciona → demo → planes → hardware → por qué → preguntas → contacto; barra de highlights y puente al hardware fuera (repetían); paddings de sección en móvil 96 → 64 px; imágenes del hardware 5:2 en móvil; textos de 9–11 px a 12 px. La pregunta de la garantía pasa a "¿Qué pasa si no cumplen el plazo?" y el título del bloque a "Garantía de entrega" para dejar "48" en 3 apariciones visibles. Se borran `pinned-steps.tsx` y `count-up.tsx` (sin uso). Hecho en 1 intento (4 rondas de recorte medidas).
