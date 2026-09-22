# Vault-sync · Landing lista para vender · 2026-09-22

> Cola de entrada para el vault de Obsidian (`02-Proyectos/Datafud/`). Cada unidad del loop
> "lista para vender" agrega su bloque abajo. Se aplica tal cual en Pendientes, Decisiones,
> Seguridad, las páginas que se nombren y el log del nodo (formato del `CLAUDE.md` del vault:
> `## [AAAA-MM-DD] ingest | Título`). El resumen "qué cambiar en cada página" se agrega arriba
> de todo al cerrar el loop (V13).

Aplicado en vault: **no** (el conector de Drive de esta sesión no edita el contenido de los `.md`
existentes). Se aplica con "sincronizá el vault" desde Cowork.

---

### V01 · Estado, línea base y puente · commit (ver V02) · despliegue READY (docs)
**Pendientes.md** — agregar en L (fachada de venta): "Loop 'lista para vender' 2026-09-22 (V01–V13) en curso, estado en `docs/plans/venta-loop-state.md`".
**Decisiones.md** — ninguna.
**Seguridad.md** — sin cambios.
**Otras páginas** — ninguna.
**log.md** — `## [2026-09-22] ingest | Loop lista para vender: línea base`
- Estado del loop y puente de vault-sync creados.
- Línea base en `main` @ ddba8cc: typecheck, lint, build y `qa:landing` en verde.
- Móvil 375: 21 174 px de alto, 12 secciones, "48" ×10 y "15 días" ×6 en texto visible.
- Lighthouse móvil local: 61 / 100 / 96 / 100.

### V02 · Oferta y precios en colones · commit (ver V03) · despliegue (ver V03)
**Pendientes.md** — cerrar: "Carta a $597 el primer año y todo en USD" (hallazgo del análisis del 2026-09-22). Nuevo en "Datos que esperan a Steven": "Apagar `PRICING.founderOffer.enabled` cuando se llenen los 10 cupos de fundadores".
**Decisiones.md** — D-023 (precios en colones primero; implementación por tipo: Carta ₡24 900, sistema ₡125 000; Carta a 2 idiomas y 60 platillos, Estándar 150), D-024 (oferta de fundadores, 10 cupos) y D-025 (garantía de 48 h, soporte mientras el plan esté activo, cambios por WhatsApp incluidos, sin permanencia con 15 días de aviso) pasan de propuesta a aceptada. Consecuencia: la Carta cuesta ₡39 800 el primer pago (antes US$278).
**Seguridad.md** — sin cambios.
**Otras páginas** — Producto-Y-Modelo-De-Negocio: reemplazar la tabla de precios por la de `docs/PRODUCT.md` §8 (CRC primero, implementación por tipo, primer pago, anual ₡149 000, hardware ₡6 000 / ₡7 500 / ₡10 000 / ₡10 000, sin mínimo, GAM gratis, Correos fuera, 3 a 5 días hábiles). Quitar "1 año de soporte técnico". Analisis-Venta-Y-Competencia: marcar cerrado el hallazgo de precio de la Carta y USD.
**log.md** — `## [2026-09-22] ingest | Oferta en colones`
- `PRICING` gana CRC por plan, implementación por tipo, anual, fundadores, textos de garantía/soporte/permanencia y entrega del hardware.
- `formatCrc()` en `src/lib/currency/format.ts` ("₡14 900", sin decimales).
- Planes muestran implementación y primer pago por plan; hardware en CRC con USD de referencia.
- Semillas de `schema.sql`: Básico 2 idiomas / 60 platillos, Estándar 150.
- Verificado: typecheck, lint, build, qa:landing, capturas 375/1440 y grep de cifras viejas = 0.

### V03 · Hero y mensaje · commit (ver V04) · despliegue (ver V04)
**Pendientes.md** — cerrar: "El hero promete panel y comandas junto a 'desde $29'" y "Decidir si el eslogan 'abre apetito y cierra ventas' se mantiene" (resuelto por D-026).
**Decisiones.md** — D-026 pasa de propuesta a aceptada: H1 "Tu carta digital con QR, lista en 48 horas"; "cierra ventas" sale de todo el sitio; "abre apetito" queda disponible como frase secundaria de marca.
**Seguridad.md** — sin cambios.
**Otras páginas** — Marca-Y-Marketing: eslogan principal → "Tu carta digital con QR, lista en 48 horas"; microcopy → "Desde ₡14 900/mes · Te la montamos nosotros · Cambios por WhatsApp"; CTA principal → "Quiero mi carta". Plan-Landing-First: el hero ya no muestra la comanda de cocina.
**log.md** — `## [2026-09-22] ingest | Hero nuevo`
- H1, etiqueta en español, subtítulo con Costa Rica y CTA de WhatsApp con mensaje de Carta.
- Línea de precio en colones y pastilla de fundadores.
- Title, description y OG con "menú digital", "QR" y "Costa Rica".
- Verificado con captura a 375×812: todo lo clave sin scroll.

### V04 · Legales publicables · commit (ver V05) · despliegue (ver V05)
**Pendientes.md** — cerrar: "Legales con 'Borrador' y 9 marcadores [REVISAR] visibles" y "Confirmar razón social, domicilio y jurisdicción de los legales". Mantener: "Revisión legal por un abogado cuando haya ingresos" (el límite de responsabilidad de 3 meses y la retención sin plazo fijo quedan para esa revisión).
**Decisiones.md** — D-027 pasa de propuesta a aceptada: responsable "Steven Galo, que opera bajo el nombre comercial GaloDev", domicilio "Costa Rica", sin cédula ni dirección exacta; ley y tribunales de Costa Rica; reembolso del 100 % de la implementación si se cancela antes de empezar (10 días hábiles); implementación no reembolsable una vez publicada salvo garantía de 48 h; mensualidades no se prorratean; garantía de hardware de 3 meses por defectos de fabricación; versión 1.0 vigente desde el 2026-09-22.
**Seguridad.md** — sin cambios (el repo público no expone cédula ni dirección).
**Otras páginas** — Paneles-Y-Vistas: `/terminos` y `/privacidad` pasan de "borrador con [REVISAR]" a "versión 1.0 vigente". Cuentas-y-Accesos: la privacidad menciona el píxel de Meta solo si `NEXT_PUBLIC_META_PIXEL_ID` existe en el build.
**log.md** — `## [2026-09-22] ingest | Legales 1.0`
- Términos y privacidad reescritos en voseo, sin aviso de borrador ni marcadores.
- Cifras de los términos generadas desde `PRICING`.
- Privacidad con Ley 8968, Vercel Web Analytics, Resend y píxel de Meta condicionado.
- Verificado: grep = 0, ambas rutas 200, captura 375 legible.

### V05 · Confianza real · commit (ver V06) · despliegue (ver V06)
**Pendientes.md** — cerrar: "Cero prueba real: fotos de stock, renders, sin fundador ni clientes" (parcial: queda lo que depende de Steven). Nuevos en "Datos que esperan a Steven": "Subir foto propia a `public/equipo/steven.webp`", "Subir fotos reales de los stands a `public/hardware/<código>.webp`", "Cargar el primer testimonio real con permiso por escrito (`TESTIMONIALS`)", "Crear redes y cargar sus URL en `SITE.social`".
**Decisiones.md** — ninguna nueva (aplica D-027 para el nombre del fundador).
**Seguridad.md** — sin cambios.
**Otras páginas** — Marca-Y-Marketing: la sección de confianza ahora es "Por qué DataFud" (te la montamos nosotros · bilingüe · stands 3D y NFC hechos acá · cambios por WhatsApp) con firma "Steven Galo, ingeniero en sistemas, en Costa Rica"; los renders llevan "Render ilustrativo"; redes: ninguna publicada todavía.
**log.md** — `## [2026-09-22] ingest | Confianza real`
- Firma del fundador con avatar "SG" (foto automática si se sube el archivo).
- Testimonios: componente listo, lista vacía, no se renderiza.
- Renders etiquetados; stock con alt honesto; redes solo con URL.
- Verificado: HTML sin testimonios, capturas mirada, qa:landing OK.

### V06 · Preguntas de Costa Rica · commit (ver V07) · despliegue (ver V07)
**Pendientes.md** — cerrar: "Faltan preguntas de Costa Rica: SINPE, factura, apps de delivery, envíos, mínimo".
**Decisiones.md** — ninguna nueva (aplica las respuestas de D-025 y D-027).
**Seguridad.md** — sin cambios.
**Otras páginas** — Marca-Y-Marketing / Producto-Y-Modelo-De-Negocio: la FAQ pública tiene 15 preguntas: primer mes, implementación, cómo pago (SINPE Móvil o transferencia), factura (comprobante; electrónica se coordina), contrato, plazos, garantía 48 h, cambios, empezar con la carta, pedido mínimo, envíos fuera de la GAM, clientes y turistas, facturación del restaurante, Uber Eats/PedidosYa (sin integración), si algo falla.
**log.md** — `## [2026-09-22] ingest | FAQ de Costa Rica`
- 15 preguntas ordenadas por lo que pregunta primero un dueño de soda.
- Respuestas desde `PRICING` y las decisiones cerradas; sin "1 año de soporte".
- Verificado: JSON-LD FAQPage idéntico a lo visible (Playwright).

### V07 · Demo sin errores y QR · commit (ver V08) · despliegue (ver V08)
**Pendientes.md** — cerrar: "Errores de la demo: ₡2800,00, MESA MESA, top sin ordenar, tuteo, /preview/admin" y "No hay QR para escanear la demo desde la compu".
**Decisiones.md** — D-028 (nueva): colones siempre sin decimales en toda la app. Contexto: la BD guarda CRC con 2 decimales y la demo mostraba "₡2800,00". Decisión: `formatMoney` usa `formatCrc` para CRC ("₡2 800"), sin tocar la BD. Consecuencia: el panel y la carta real también muestran colones sin decimales; las demás monedas siguen igual.
**Seguridad.md** — S8 (ruta privada): sin cambios; además /preview/admin (vista demo del super admin) queda con `noindex` y sin enlaces públicos.
**Otras páginas** — Paneles-Y-Vistas: /preview ahora muestra dos vistas (carta del comensal y panel del restaurante); /preview/admin existe pero no se enlaza ni se indexa. La sección demo de la landing tiene un QR real a https://datafud.com/preview/cliente desde tablet en adelante.
**log.md** — `## [2026-09-22] ingest | Demo sin errores y QR`
- Colones sin decimales, "Mesa 1" sin duplicar, top ordenado, voseo.
- /preview/admin fuera del recorrido público y con noindex.
- QR real generado con `qrcode` en el build.
- `qa:landing` ahora cubre la demo y verifica el QR contra la URL esperada.

### V08 · Página más corta y coherente · commit (ver V09) · despliegue (ver V09)
**Pendientes.md** — cerrar: "Página de ~26 pantallas en móvil, claims repetidos, incoherencias" (ahora ~18 pantallas: 14 754 px a 375).
**Decisiones.md** — D-029 (nueva): estructura de la landing en 8 secciones (hero → cómo funciona → demo → planes → hardware → por qué DataFud → preguntas → contacto). Contexto: 21 174 px en móvil y plazos repetidos 10 veces. Decisión: fuera tira de monedas, stats, "El sistema", ambiente y paso a paso con fotos; plazos en una sola línea de tiempo en días. Consecuencia: "48" y "15 días" como máximo 3 veces cada uno; la landing ya no muestra "18 monedas" ni "Latinoamérica" como origen.
**Seguridad.md** — sin cambios.
**Otras páginas** — Paneles-Y-Vistas (landing): secciones `#como-funciona`, `#demo`, `#planes`, `#hardware`, `#confianza` (Por qué DataFud), `#preguntas`, `#contacto`; desaparecen `#sistema` e `#implementacion`. Marca-Y-Marketing: cierre de marca "Hecho en Costa Rica" (antes "Hecho en Latinoamérica"). Plan-Landing-First: estructura nueva.
**log.md** — `## [2026-09-22] ingest | Landing más corta`
- De 21 174 a 14 754 px en móvil (−30,3 %) y de 12 a 8 secciones.
- Plazos en una línea de tiempo; "48" y "15 días" ×3 cada uno.
- Textos mínimos de 12 px; "Hecho en Costa Rica".
- Lighthouse móvil local 96 / 100 / 96 / 100.

### V09 · Medición y contacto · commit (ver V10) · despliegue (ver V10)
**Pendientes.md** — cerrar: "Sin Meta Pixel ni UTMs para campañas" y "Formulario oculto" (queda condicionado a la variable, documentado). Nuevos en "Datos que esperan a Steven": "Verificar el dominio datafud.com en Resend y cargar `RESEND_API_KEY` + `RESEND_FROM_EMAIL` en Vercel, luego redesplegar", "Si se va a pautar: crear el píxel y cargar `NEXT_PUBLIC_META_PIXEL_ID`, luego redesplegar".
**Decisiones.md** — D-030 (nueva): el píxel de Meta solo en páginas de marketing y solo con variable. Contexto: se quieren medir campañas sin poner rastreo publicitario en la carta de los comensales ni en los paneles. Decisión: `MetaPixel` se monta en `/` y en las páginas de nicho; sin `NEXT_PUBLIC_META_PIXEL_ID` no se carga nada y la privacidad dice que hoy no se usa. Consecuencia: activarlo exige variable + redeploy, y la privacidad cambia sola.
**Seguridad.md** — sin cambios (sin secretos nuevos; la variable del píxel es pública por diseño).
**Otras páginas** — Cuentas-y-Accesos: agregar `NEXT_PUBLIC_META_PIXEL_ID` (opcional, pública) a la tabla de variables; nota en `RESEND_FROM_EMAIL`: "debe ser de un dominio verificado; con onboarding@resend.dev solo llega al dueño de la cuenta". Marca-Y-Marketing: eventos `whatsapp_click`, `demo_open`, `contact_submit` llevan `utm_source/medium/campaign`.
**log.md** — `## [2026-09-22] ingest | Medición con UTMs y píxel opcional`
- UTMs guardados en la sesión y sumados a los eventos de Vercel y Meta.
- Meta Pixel con snippet oficial solo con variable; Lead y ViewContent.
- Verificado con Playwright: 0 requests a facebook.net sin variable; con ID falso, Lead en la cola.

### V10 · SEO local · commit (ver V11) · despliegue (ver V11)
**Pendientes.md** — cerrar: "SEO local débil: H1 sin Costa Rica, sin páginas por nicho, sin LocalBusiness". Nuevo en "Datos que esperan a Steven": "Crear el Google Business Profile de DataFud (área de servicio Costa Rica, sin dirección pública) y enlazarlo a datafud.com".
**Decisiones.md** — D-031 (nueva): tres guías de SEO local. Contexto: la landing sola no posiciona búsquedas como "menú digital para sodas". Decisión: `/menu-digital-costa-rica` (pilar), `/menu-digital-para-sodas` y `/menu-qr-restaurantes-turisticos`, estáticas, con precios desde PRICING y sin nombrar competidores. Consecuencia: todo cambio de oferta se refleja solo; cada guía nueva debe aportar contenido propio (no duplicado).
**Seguridad.md** — sin cambios.
**Otras páginas** — Paneles-Y-Vistas: agregar las tres rutas públicas nuevas y el bloque "Guías" del footer. Marca-Y-Marketing: JSON-LD con Organization + LocalBusiness (sin dirección postal) y FAQPage/BreadcrumbList en las guías. Analisis-Venta-Y-Competencia: hallazgo de SEO local cerrado.
**log.md** — `## [2026-09-22] ingest | SEO local`
- LocalBusiness y Organization con datos reales, sin dirección.
- Tres guías de 650 a 840 palabras con precios desde PRICING y CTA de WhatsApp propio.
- Sitemap, canonical y OG por página.
- Verificado: build estático, un h1 por página, qa:landing en 3 viewports.
