# Informe final — Loop de la fachada de venta DataFud

Fecha: 2026-09-19 · Rama de trabajo: `claude/complete-loop-izbij4` · Todo publicado en `main`
(push directo aceptado; cada commit desplegó a producción en Vercel). Estado detallado por
iteración en [`landing-loop-state.md`](./landing-loop-state.md).

## Resumen

En 17 iteraciones (de 35 posibles) la landing de datafud.com pasó de vender un producto que no
existía en producción (registro roto, "tiempo real", "24/7", trial) a una fachada de venta
honesta y completa: WhatsApp como canal principal con mensaje prellenado por origen, formulario
de contacto listo para activarse con una variable, oferta reordenada (Carta en 48 h · sistema
completo en 15 días), sección de hardware de mesa con precios "desde", demo, línea de tiempo de
implementación, confianza, 11 preguntas frecuentes, páginas legales, SEO completo, analítica de
conversión y Lighthouse móvil 95 / 100 / 96 / 100. U15 y U16 se omitieron por CONFIG.

## Unidades

| ID | Unidad | Commit | Despliegue Vercel |
|---|---|---|---|
| — | Estado inicial y prueba de publicación | 398bf74 | READY `dpl_5N48DAZrkunuvgQ8ZgWWN3WsaCYN` |
| U01 | Config central (`site.ts`, `PRICING.hardware`, plazos) | 91df1af | READY `dpl_EkvtvuSQmEUTVFiUMuob2etKFaBr` |
| U02 | Contacto + formulario Resend + puertas cerradas | 34e75a3 | READY `dpl_FynHV9NVoSWdrDAN16CR8zhTqhsJ` |
| U03 | CTAs a WhatsApp + botón flotante | c4acd8d | READY `dpl_4rGKvw2931aCoaRcmUhFwUQKPv4d` |
| U04 | Promesas reales, plan Carta, docs | dc4093d | READY `dpl_5ZvvPVUVmTvRsry7kRGbzmAR1qhX` |
| U05 | Sección #hardware | 1f7ed73 | READY `dpl_2D3hodjJMk8d9iJqHJRdc8BmjNsB` |
| U06 | Sección #demo | 7311a8f | READY `dpl_6VRNLVhPHVyPT1boVzuCzDFX7TSm` |
| U07 | Sección #implementacion | 740a182 | READY `dpl_FfADLZgQXR78bTBv1D7pVNjyb58R` |
| U08 | Sección #confianza | 21571ae | READY `dpl_3HGbCcsSVf4hVkByjAhDefUrrYzi` |
| U09 | Preguntas frecuentes + nav final | 639eea7 | READY `dpl_HwTRMENDNGZeY6eW6td6dTwt4vpm` |
| U10 | /terminos y /privacidad | fd4c98c | READY `dpl_5K2Qm1gNvDKQAnqunz53V8fdCTfQ` |
| U11 | SEO, OG, JSON-LD | ab7fd6c | READY `dpl_JA4xxhYzAejBykgL1CWZf7wwHUNX` |
| U12 | Vercel Analytics + eventos | 94fa50f | READY `dpl_FqNJKLxB5LNjaL9mWM66B9jLHtXW` |
| U13 | Accesibilidad y rendimiento | 980e100 | READY `dpl_6APevQvwUW3skEsKtmE6Mj8RQkKN` |
| U14 | next 15.5.25 + audit | d1533fc | READY `dpl_85iQ4Um43VxCLzux68xE3MNrJPZx` |
| U15 | Carta estática `/c/[slug]` | — | omitida (CONFIG = no) |
| U16 | Redirecciones `/q/[code]` | — | omitida (CONFIG = no) |
| U17 | Pulido (1 pasada, convergió) | 3cb86fe | READY `dpl_J75UF4qRBFLKvcgvuw7gcA3Wh7iF` |
| U18 | Este informe | 167a1ae | READY `dpl_GdfhYA53uFyvaMRe31cvsWziQJC6` (alias datafud.com) |

## Rúbrica final (1–5)

| Criterio | Nota | Evidencia |
|---|---|---|
| Claridad de la oferta | 5 | Qué es, cuánto cuesta, cuánto tarda y cómo pedirlo se leen sin bajar del hero |
| Confianza que transmite | 4 | Compromisos concretos, línea de tiempo con fechas, demo real, legal; falta el primer caso real |
| Fidelidad a la marca | 5 | Tipografías y paleta de BRAND.md, sin emojis, sin texto degradado, sin blur, asimetría editorial |
| Calidad del copy | 4 | Voseo tico natural, frases cortas, sin promesas vacías |
| Responsive | 5 | 375 / 768 / 1024 / 1440 sin desbordes; menú móvil y tablet |
| Accesibilidad | 5 | Lighthouse 100; acordeón y menú por teclado; foco visible; 44 px; contraste AA |
| Rendimiento | 4 | Lighthouse móvil 95–96, LCP 2,7 s, CLS 0 (fotos remotas no medibles en el sandbox) |
| SEO | 5 | Lighthouse 100; sitemap, robots, canonical, OG por página, JSON-LD |
| Honestidad comercial | 5 | 0 frases prohibidas; sin testimonios, logos ni cifras inventadas |
| Calidad del código | 4 | Datos centralizados, componentes acotados, sin `any` ni `eslint-disable` |

## Lighthouse (móvil, `next start` local, Chromium 1194, reduced-motion forzado)

| Ruta | Performance | Accessibility | Best Practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| `/` | 95 | 100 | 96 | 100 | 2,7 s | 0 |
| `/terminos` | 99 | 100 | 96 | 100 | 2,2 s | 0 |

Best Practices no llega a 100 por `errors-in-console`: en el sandbox las fotos de Unsplash y el
script `/_vercel/insights/script.js` no cargan. Ninguno de los dos falla en producción.

## PENDIENTES-STEVEN (checklist)

- [ ] **CONFIG confirmada en la sesión**: WhatsApp 506 7287 4779 y correo galodevcr@gmail.com
      ya están en `src/lib/site.ts`. Si cambian, se editan ahí.
- [ ] **Activar el formulario de contacto**: crear `RESEND_API_KEY` en Vercel (Settings →
      Environment Variables → Production) y **redesplegar** (la landing es estática; la decisión
      de mostrar el formulario se toma en el build). Con el remitente por defecto
      (`onboarding@resend.dev`) Resend solo entrega al correo dueño de la cuenta: crear la
      cuenta de Resend con galodevcr@gmail.com o verificar un dominio y poner
      `RESEND_FROM_EMAIL`. Mientras tanto la sección muestra WhatsApp y correo.
- [ ] **Activar Web Analytics** en el proyecto `datafud` de Vercel (pestaña Analytics → Enable);
      sin eso los eventos `whatsapp_click`, `demo_open` y `contact_submit` no se registran.
- [ ] **Fotos reales del hardware** (TODO-FOTO): stand QR 3D, stand QR 3D + NFC y stand de
      reseñas. Poner el archivo en `public/` y la ruta en `PRICING.hardware[].photo`
      (`src/lib/constants.ts`); las ilustraciones SVG se reemplazan solas.
- [ ] **Revisión legal** de `/terminos` y `/privacidad`: completar los `[REVISAR]` (razón
      social, cédula jurídica, domicilio, jurisdicción, días de gracia, reembolsos, garantía
      del hardware, límite de responsabilidad, plazos de aviso, conservación de datos, PRODHAB)
      y quitar el aviso de borrador en `legal-page.tsx`.
- [ ] **Pedido mínimo del hardware**, si aplica, para publicarlo en `#hardware`.
- [ ] **Prueba en teléfono real**: abrir datafud.com, tocar cada CTA (debe abrir WhatsApp con el
      mensaje prellenado), el menú, el acordeón y la demo.
- [ ] **Primer caso real**: cuando exista, activar el bloque comentado en `trust-section.tsx`
      con permiso del local.
- [ ] Decidir si se unifica el nombre Datfud → DataFud en `package.json` y semillas (fuera del
      alcance de esta etapa).

## TODO-FOTO

| Producto | Hoy | Archivo a tocar |
|---|---|---|
| Stand QR impreso en 3D | Ilustración SVG (`StandQrArt`) | `PRICING.hardware[0].photo` |
| Tarjeta NFC | `public/nfc.png` (render existente) | opcional |
| Stand QR 3D + NFC | Ilustración SVG (`StandQrNfcArt`) | `PRICING.hardware[2].photo` |
| Stand de reseñas de Google | Ilustración SVG (`StandReviewsArt`) | `PRICING.hardware[3].photo` |

## Archivos nuevos (27) y modificados (17)

Nuevos: `docs/plans/landing-loop-state.md`, `docs/plans/landing-loop-report.md`,
`src/lib/{site,seo,faq,contact}.ts`, `src/lib/og.tsx`, `src/app/actions.ts`,
`src/app/{sitemap,robots}.ts`, `src/app/opengraph-image.tsx`,
`src/app/(legal)/{terminos,privacidad}/{page,opengraph-image}.tsx`,
`src/components/marketing/v2/{analytics-events,contact-form,contact-section,demo-section,
faq-section,hardware-art,hardware-section,implementation-section,legal-page,mobile-menu,
site-footer,trust-section,whatsapp-float}.tsx`.

Modificados: `.env.example`, `docs/{CHANGELOG,MARKETING,PRODUCT}.md`, `package.json`,
`package-lock.json`, `src/app/(auth)/{login,register}/page.tsx`, `src/app/{globals.css,
layout.tsx,page.tsx}`, `src/components/marketing/v2/{landing-nav-v2,magnetic-cta,pinned-steps,
pricing-v2}.tsx`, `src/components/ui/icon.tsx`, `src/lib/constants.ts`.

No se tocaron `supabase/`, `src/app/dashboard/`, `src/app/admin/`, `src/app/m/`,
`src/app/preview/`, `src/lib/supabase/`, `src/lib/auth/` ni `middleware.ts`.

Dependencias nuevas: `resend`, `@vercel/analytics`; de desarrollo: `@playwright/test`,
`lighthouse`. `next` y `eslint-config-next` a 15.5.25.

## Riesgos por puertas degradadas

- **Red del sandbox**: sin salida directa a datafud.com ni a images.unsplash.com. La puerta J
  se verificó con la API de Vercel (estado READY y alias datafud.com de cada despliegue) y, al
  cerrar, con una lectura del HTML de producción vía Vercel: 12 enlaces `wa.me`, las 9
  secciones, canonical, OG, JSON-LD, 0 frases prohibidas, 0 enlaces a `/register`,
  `/robots.txt` y `/sitemap.xml` correctos. Las 7 fotos de Unsplash de la landing original no se vieron
  cargadas en las capturas; en producción se sirven desde `remotePatterns` como antes.
- **Lighthouse local**: medido sobre `next start` en el sandbox; el Performance real en Vercel
  (con CDN y las fotos remotas) puede variar unos puntos. Conviene una corrida de PageSpeed
  Insights sobre https://datafud.com desde el teléfono.
- **Formulario**: probado con una clave falsa (render, teclado, validación, estado de error).
  El envío real con Resend queda por probar cuando exista la clave.
- **Analítica**: los eventos se verificaron en la cola local del SDK; el registro real depende
  de activar Web Analytics en Vercel.

## Deuda que queda

- `npm audit --omit=dev`: 1 alta + 1 moderada por el `postcss` que Next 15 empaqueta; solo se
  cierra con Next 16 (salto mayor).
- `/login` conserva estilos `slate-*` y un enlace de 36 px; está fuera de la landing.
- `pricing-v2.tsx` mantiene el nombre heredado "v2".
- El símbolo ₡ del marquee usa una fuente de respaldo.
- El nav completo aparece desde 1024 px; entre 768 y 1023 se usa el menú (decisión para no
  desbordar con cinco secciones).
- Vault de Obsidian (Drive): `Pendientes.md`, `Decisiones.md` y `log.md` no se actualizaron
  desde acá (la regla del vault es escribir solo cuando Steven lo pide). Ítems L1–L7, L9 y
  S2/S6 de Pendientes quedaron hechos; D-014 sigue como propuesta (U15/U16 omitidas).
