# Informe · Loop "lista para vender" (2026-09-22)

> Tercer loop autónomo. Estado detallado y evidencia en `docs/plans/venta-loop-state.md`;
> puente al vault en `docs/vault-sync/2026-09-22-lista-para-vender.md`. Versión 1.1.0.

## Resumen

datafud.com quedó lista para salir a prospectar en Costa Rica:
- La oferta se muestra en colones primero, con la implementación y el primer pago de cada plan.
- El hero dice qué es, para quién, cuánto cuesta y en cuánto tiempo, sin prometer lo que la Carta no incluye.
- Los legales son publicables (versión 1.0).
- La confianza se apoya en datos reales: fundador con nombre, renders etiquetados y cero testimonios inventados.
- La FAQ responde las 15 dudas de un dueño tico.
- La demo ya no tiene errores y tiene un QR real.
- La página es un 30 % más corta.
- La medición tiene UTMs y un píxel opcional.
- Hay tres guías de SEO local y un kit de prospección con plan de contenido.

Las 13 unidades están publicadas en `main` y todos los despliegues de producción quedaron READY.

## Unidades

| ID | Título | Commit | Despliegue (producción) |
|---|---|---|---|
| V01 | Estado, línea base y puente | 875c017 | READY `dpl_EhfVfzZ1CAa3cNzqvjrUKmMuNc1z` |
| V02 | Oferta y precios en colones | c3ad02c | READY `dpl_EqvNfLhFP2UGTfQ7CJQn9LVfohtQ` |
| V03 | Hero y mensaje | 274abf7 | READY `dpl_CEMYv7PzHcfd66UVFhdtZNSCwaNS` |
| V04 | Legales publicables | 7b50cda | READY `dpl_55LGJTwWgSFEAdkEVysVHW8Bm8hx` |
| V05 | Confianza real | b4979c6 | READY `dpl_GGT76vGphEBPxPf8XMGhqxdiEhDT` |
| V06 | Preguntas de Costa Rica | 394b55d | READY `dpl_9RSzRnvzTetj1XSu3xEESC3uwkPW` |
| V07 | Demo sin errores y QR | 296c27d | READY `dpl_4kxYAgqsXtY6PRefLnJWXc86hXtg` |
| V08 | Página más corta y coherente | 1d4df0f | READY `dpl_34r4rJtFx2oNk3qf8D5yFxNFXikz` |
| V09 | Medición y contacto | 3e033d9 | READY `dpl_DU9Y8riYKNP92U869DVsZQbg4AKS` |
| V10 | SEO local | b9f6828 | READY `dpl_53vLK2ijMkuV3awaN5KNSrsbmxcE` |
| V11 | Kit de prospección y contenido | 85e9308 | READY `dpl_4Fa6FBao5fXimPtFGit6k1gze4ya` |
| V12 | Verificación final (5 pasadas) | 53a3dc7 · 12b5cd3 · d8e53ad · 23e6894 · ddaa54c | READY (las cuatro primeras); ddaa54c en cola al escribir este informe |
| V13 | Informe y cierre del puente | commit de este informe | ver bitácora del estado |

## Antes → después

| Medida | Antes (ddba8cc) | Después |
|---|---|---|
| Alto de `/` a 375 px | 21 174 px | 14 782 px (−30,2 %) |
| Secciones | 12 | 8 (hero → cómo funciona → demo → planes → hardware → por qué DataFud → preguntas → contacto) |
| "48" / "15 días" en texto visible | 10 / 6 | 3 / 3 |
| Textos < 12 px | 49 | 0 |
| Lighthouse móvil (local) | 61 / 100 / 96 / 100 | 95 / 100 / 96 / 100 (guías: 96 / 100 / 96 / 100) |
| Precio de la Carta | "$29/mes" + "$249" de implementación (US$278 de primer pago, ₡30 000–60 000 al año en la competencia) | ₡14 900/mes + ₡24 900 = **₡39 800** de primer pago; anual ₡149 000 |
| Hero | "El menú digital que abre apetito y cierra ventas" | "Tu carta digital con QR, lista en 48 horas" + "Desde ₡14 900/mes" |
| FAQ | 11 preguntas genéricas, "1 año de soporte" | 15 preguntas de Costa Rica (SINPE, factura, contrato, garantía, envíos, Uber Eats/PedidosYa, por qué cuesta más que el autoservicio…) |
| Legales | "Borrador" + 9 `[REVISAR]` | Versión 1.0, cifras desde `PRICING` |
| Demo | ₡2800,00 · MESA MESA 1 · top sin ordenar · admin público | ₡2 800 · Mesa 1 · ordenado · admin con noindex · QR real |
| Medición | Eventos de Vercel sin atribución | UTMs en los eventos + Meta Pixel opcional (Lead / ViewContent) |
| SEO local | Sin páginas por nicho | 3 guías + LocalBusiness + FAQPage/Breadcrumb |

## Rúbrica final (pasada 5, revisor independiente)

| Criterio | Nota | Evidencia |
|---|---|---|
| Claridad de la oferta | 5 | H1, subtítulo por plan y "sin pedidos en mesa" en la Carta |
| Precio entendible en colones | 5 | ₡ primero, implementación y primer pago por plan, anual |
| Confianza | 4 | Fundador con nombre y WhatsApp, términos claros, renders etiquetados; faltan fotos reales |
| Marca | 4 | Paleta y serif consistentes, íconos SVG, sin degradado en texto ni blur |
| Copy | 4 | Voseo parejo y directo |
| Responsive | 4 | Probado en 375, 768 y 1440 (qa:landing, capturas) |
| Accesibilidad | 4 | Lighthouse 100; acordeón ARIA y teclado; todo visible sin JS |
| SEO local | 4 | 3 guías, OG y Twitter por página, FAQPage, Breadcrumb, sitemap |
| Honestidad comercial | 4 | 0 frases vetadas, garantía literal, lo no decidido va como pendiente |
| Calidad del código | 4 | Montos desde `PRICING`, degrada sin variables, typecheck y lint limpios |
| Medición | 4 | UTM + Lead/ViewContent verificados con Playwright |

## Lo que no se pudo verificar y por qué

- **Producción en navegador:** el sandbox no tiene salida a datafud.com (proxy 403). Se verificó por la API de Vercel (todos los despliegues READY) y leyendo `robots.txt` y `sitemap.xml` servidos.
- **Fotos remotas (Unsplash):** no cargan en el sandbox (403). Quedaron como aviso en `qa:landing`, no como fallo.
- **Lighthouse en producción:** se midió en local con la CPU del contenedor. La cifra de Performance es orientativa.
- **Píxel real de Meta:** solo con un ID falso (la cola de `fbq` recibe `Lead` y `ViewContent`). No hay píxel creado.
- **Eventos propios de Vercel:** no se comprobó si el plan del proyecto los registra.
- **Formulario con Resend:** sin clave en este entorno. Se verificó que sin la variable el formulario no aparece.
- **V12:** llegó al tope de 5 pasadas. La última encontró 1 hallazgo medio de redacción, que se corrigió y se verificó puntualmente, pero no hubo una sexta pasada completa.

## PENDIENTES-STEVEN (ordenados)

1. **Vercel:** `RESEND_API_KEY` y `RESEND_FROM_EMAIL` (de un dominio verificado en Resend). Si se va a pautar, `NEXT_PUBLIC_META_PIXEL_ID`. Activar Web Analytics, confirmar que el plan registra eventos propios y **redesplegar**.
2. **Decisiones de oferta:**
   - si los precios incluyen IVA;
   - tope de categorías y mesas de la Carta (hoy 5 y 8) y `full_branding` de la semilla Básico;
   - si la garantía de 48 h aplica también a la implementación del sistema;
   - qué significa "48 horas hábiles" y si los "15 días" son hábiles o naturales;
   - condiciones de la oferta de fundadores;
   - cuándo se paga el hardware;
   - si al pasar de Carta a Estándar se descuenta lo ya pagado.
3. **Fotos:** `public/equipo/steven.webp` y `public/hardware/<código>.webp`. Se detectan en el build: subirlas y redesplegar.
4. **Correo:** crear `hola@datafud.com` y cambiar `SITE.email` (una línea en `src/lib/site.ts`).
5. **Redes:** crear Instagram, Facebook o TikTok y cargar las URL en `SITE.social`.
6. **Google Business Profile** con área de servicio Costa Rica, sin dirección pública.
7. **Oferta de fundadores:** apagar `PRICING.founderOffer.enabled` al llenarse los 10 cupos.
8. **Primer testimonio real** con permiso por escrito (`TESTIMONIALS`; ver `docs/MARKETING.md`).
9. **Revisión legal por un abogado** cuando haya ingresos: límite de responsabilidad de 3 meses, retención de datos y Ley 8968.
10. **Prueba en un teléfono real y salir a vender** con `docs/ventas/`.
