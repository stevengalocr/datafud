# Vault-sync · Landing lista para vender · 2026-09-22

> Cola de entrada para el vault de Obsidian (`02-Proyectos/Datafud/`). Cada unidad del loop
> "lista para vender" agrega su bloque abajo. Se aplica tal cual en Pendientes, Decisiones,
> Seguridad, las páginas que se nombren y el log del nodo (formato del `CLAUDE.md` del vault:
> `## [AAAA-MM-DD] ingest | Título`). El resumen "qué cambiar en cada página" se agrega arriba
> de todo al cerrar el loop (V13).

Aplicado en vault: **parcial**. El conector de Google Drive de esta sesión solo crea archivos y
cambia título/carpeta (no edita el contenido de los `.md` existentes), así que este puente se subió
completo como archivo nuevo al nodo Datafud del vault (`vault-sync-2026-09-22-lista-para-vender.md`, id de Drive `10sc7LqtPcAkjgpuQZ_hVl4zujXt1mvQ9`).
Las páginas se actualizan con "sincronizá el vault" desde Cowork usando el resumen de abajo.

## Resumen · qué cambiar en cada página (aplicar tal cual)

**Pendientes.md**
- L (fachada de venta), marcar cerrados (2026-09-22) los hallazgos de Analisis-Venta-Y-Competencia:
  - legales con "Borrador" y [REVISAR];
  - cero prueba real;
  - Carta a $597 el primer año y todo en USD;
  - el hero promete panel y comandas;
  - formulario oculto, correo @gmail, sin redes (parcial: queda lo de Steven);
  - sin Meta Pixel ni UTMs;
  - faltan preguntas de Costa Rica;
  - errores de la demo;
  - sin QR para la demo;
  - página de ~26 pantallas;
  - SEO local débil;
  - sin material para prospectar.
- Agregar como cerrado: "Loop lista para vender (V01–V13), informe en `docs/plans/venta-loop-report.md`, versión 1.1.0".
- "Datos que esperan a Steven", agregar:
  - variables de Vercel (Resend con dominio verificado, píxel si se pauta, Web Analytics) y **redeploy**;
  - decidir IVA;
  - decidir el tope de 5 categorías y 8 mesas de la Carta y `full_branding` de la semilla;
  - confirmar el alcance de la garantía (hoy solo la implementación de la Carta);
  - aclarar "48 horas hábiles" y si los "15 días" son hábiles o naturales;
  - condiciones de fundadores, cuándo se paga el hardware y si se descuenta la implementación al pasar a Estándar;
  - foto `public/equipo/steven.webp` y fotos `public/hardware/<código>.webp`;
  - buzón hola@datafud.com (cambiar `SITE.email`);
  - redes (`SITE.social`);
  - Google Business Profile;
  - apagar `founderOffer.enabled` al llenar 10 cupos;
  - primer testimonio con permiso;
  - revisión legal por abogado.
- "Ventas", agregar: imprimir el stand de muestra con el QR `utm_source=visita`; grabar c01, c03 y c11; salir a prospectar con `docs/ventas/`.

**Decisiones.md**
- D-023 a D-027 pasan de propuesta a **aceptada** (oferta en colones, fundadores, garantía/soporte/cambios/permanencia, H1 y salida de "cierra ventas", legal).
- Agregar las nuevas D-028 a D-032; el texto de cada una está en los bloques V07, V08, V09, V10 y V12:
  - D-028: colones sin decimales en toda la app;
  - D-029: landing de 8 secciones;
  - D-030: píxel solo en marketing y con variable;
  - D-031: tres guías de SEO local;
  - D-032: lectura conservadora de lo no decidido.

**Seguridad.md** — sin hallazgos nuevos. S8: además, /preview/admin con noindex y sin enlaces públicos.

**Producto-Y-Modelo-De-Negocio** — reemplazar la tabla de precios por la de `docs/PRODUCT.md` §8:
- Carta ₡14 900 / Estándar ₡24 900 / Empresarial ₡49 900 al mes.
- Implementación: ₡24 900 la Carta, ₡125 000 el sistema.
- Primer pago: ₡39 800 / ₡149 900 / ₡174 900. Anual de la Carta: ₡149 000.
- Carta: 2 idiomas, 60 platillos, 5 categorías, 8 mesas. Estándar: 150 platillos.
- Hardware: ₡6 000 / ₡7 500 / ₡10 000 / ₡10 000, sin mínimo, GAM gratis, Correos fuera, en 3 a 5 días hábiles.
- Quitar "1 año de soporte técnico" y poner "soporte por WhatsApp mientras el plan esté activo".

**Marca-Y-Marketing**:
- Eslogan: "Tu carta digital con QR, lista en 48 horas".
- Microcopy: "Desde ₡14 900/mes · Te la montamos nosotros · Cambios por WhatsApp".
- CTA: "Quiero mi carta".
- Cierre: "Tu carta, montada por nosotros" y "Hecho en Costa Rica".
- Confianza: "Por qué DataFud" con la firma de Steven Galo.
- Redes: todavía ninguna.
- Enlazar `docs/ventas/`, con la convención de UTM `utm_source=<canal>&utm_medium=prospeccion|social|stand-muestra&utm_campaign=<zona o id>`.

**Paneles-Y-Vistas**:
- Landing de 8 secciones: `#como-funciona`, `#demo`, `#planes`, `#hardware`, `#confianza`, `#preguntas`, `#contacto`. Ya no existen `#sistema` ni `#implementacion`.
- Rutas nuevas: `/menu-digital-costa-rica`, `/menu-digital-para-sodas`, `/menu-qr-restaurantes-turisticos`.
- `/terminos` y `/privacidad` pasan a la versión 1.0.
- /preview muestra 2 vistas; /preview/admin con noindex.
- QR de la demo en la landing.
- La landing se ve completa sin JS.

**Cuentas-y-Accesos**:
- Agregar `NEXT_PUBLIC_META_PIXEL_ID` (opcional, pública).
- `RESEND_FROM_EMAIL` debe ser de un dominio verificado.
- `SITE.email` se cambia en una línea.

**Plan-Landing-First** — la estructura nueva y "lista para vender (1.1.0)".

**Analisis-Venta-Y-Competencia**:
- Todos los hallazgos del 2026-09-22 cerrados en el repo; quedan solo los pendientes de Steven de arriba.
- Rúbrica final: claridad 5, precio 5, resto 4.
- Alto −30 %; Lighthouse móvil de 61 a 95.

**log.md** — aplicar los bloques V01 a V13 de abajo, en orden.

---

### V01 · Estado, línea base y puente · commit 875c017 · despliegue READY
**Pendientes.md** — agregar en L (fachada de venta): "Loop 'lista para vender' 2026-09-22 (V01–V13) en curso, estado en `docs/plans/venta-loop-state.md`".
**Decisiones.md** — ninguna.
**Seguridad.md** — sin cambios.
**Otras páginas** — ninguna.
**log.md** — `## [2026-09-22] ingest | Loop lista para vender: línea base`
- Estado del loop y puente de vault-sync creados.
- Línea base en `main` @ ddba8cc: typecheck, lint, build y `qa:landing` en verde.
- Móvil 375: 21 174 px de alto, 12 secciones, "48" ×10 y "15 días" ×6 en texto visible.
- Lighthouse móvil local: 61 / 100 / 96 / 100.

### V02 · Oferta y precios en colones · commit c3ad02c · despliegue READY
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

### V03 · Hero y mensaje · commit 274abf7 · despliegue READY
**Pendientes.md** — cerrar: "El hero promete panel y comandas junto a 'desde $29'" y "Decidir si el eslogan 'abre apetito y cierra ventas' se mantiene" (resuelto por D-026).
**Decisiones.md** — D-026 pasa de propuesta a aceptada: H1 "Tu carta digital con QR, lista en 48 horas"; "cierra ventas" sale de todo el sitio; "abre apetito" queda disponible como frase secundaria de marca.
**Seguridad.md** — sin cambios.
**Otras páginas** — Marca-Y-Marketing: eslogan principal → "Tu carta digital con QR, lista en 48 horas"; microcopy → "Desde ₡14 900/mes · Te la montamos nosotros · Cambios por WhatsApp"; CTA principal → "Quiero mi carta". Plan-Landing-First: el hero ya no muestra la comanda de cocina.
**log.md** — `## [2026-09-22] ingest | Hero nuevo`
- H1, etiqueta en español, subtítulo con Costa Rica y CTA de WhatsApp con mensaje de Carta.
- Línea de precio en colones y pastilla de fundadores.
- Title, description y OG con "menú digital", "QR" y "Costa Rica".
- Verificado con captura a 375×812: todo lo clave sin scroll.

### V04 · Legales publicables · commit 7b50cda · despliegue READY
**Pendientes.md** — cerrar: "Legales con 'Borrador' y 9 marcadores [REVISAR] visibles" y "Confirmar razón social, domicilio y jurisdicción de los legales". Mantener: "Revisión legal por un abogado cuando haya ingresos" (el límite de responsabilidad de 3 meses y la retención sin plazo fijo quedan para esa revisión).
**Decisiones.md** — D-027 pasa de propuesta a aceptada: responsable "Steven Galo, que opera bajo el nombre comercial GaloDev", domicilio "Costa Rica", sin cédula ni dirección exacta; ley y tribunales de Costa Rica; reembolso del 100 % de la implementación si se cancela antes de empezar (10 días hábiles); implementación no reembolsable una vez publicada salvo garantía de 48 h; mensualidades no se prorratean; garantía de hardware de 3 meses por defectos de fabricación; versión 1.0 vigente desde el 2026-09-22.
**Seguridad.md** — sin cambios (el repo público no expone cédula ni dirección).
**Otras páginas** — Paneles-Y-Vistas: `/terminos` y `/privacidad` pasan de "borrador con [REVISAR]" a "versión 1.0 vigente". Cuentas-y-Accesos: la privacidad menciona el píxel de Meta solo si `NEXT_PUBLIC_META_PIXEL_ID` existe en el build.
**log.md** — `## [2026-09-22] ingest | Legales 1.0`
- Términos y privacidad reescritos en voseo, sin aviso de borrador ni marcadores.
- Cifras de los términos generadas desde `PRICING`.
- Privacidad con Ley 8968, Vercel Web Analytics, Resend y píxel de Meta condicionado.
- Verificado: grep = 0, ambas rutas 200, captura 375 legible.

### V05 · Confianza real · commit b4979c6 · despliegue READY
**Pendientes.md** — cerrar: "Cero prueba real: fotos de stock, renders, sin fundador ni clientes" (parcial: queda lo que depende de Steven). Nuevos en "Datos que esperan a Steven": "Subir foto propia a `public/equipo/steven.webp`", "Subir fotos reales de los stands a `public/hardware/<código>.webp`", "Cargar el primer testimonio real con permiso por escrito (`TESTIMONIALS`)", "Crear redes y cargar sus URL en `SITE.social`".
**Decisiones.md** — ninguna nueva (aplica D-027 para el nombre del fundador).
**Seguridad.md** — sin cambios.
**Otras páginas** — Marca-Y-Marketing: la sección de confianza ahora es "Por qué DataFud" (te la montamos nosotros · bilingüe · stands 3D y NFC hechos acá · cambios por WhatsApp) con firma "Steven Galo, ingeniero en sistemas, en Costa Rica"; los renders llevan "Render ilustrativo"; redes: ninguna publicada todavía.
**log.md** — `## [2026-09-22] ingest | Confianza real`
- Firma del fundador con avatar "SG" (foto automática si se sube el archivo).
- Testimonios: componente listo, lista vacía, no se renderiza.
- Renders etiquetados; stock con alt honesto; redes solo con URL.
- Verificado: HTML sin testimonios, capturas mirada, qa:landing OK.

### V06 · Preguntas de Costa Rica · commit 394b55d · despliegue READY
**Pendientes.md** — cerrar: "Faltan preguntas de Costa Rica: SINPE, factura, apps de delivery, envíos, mínimo".
**Decisiones.md** — ninguna nueva (aplica las respuestas de D-025 y D-027).
**Seguridad.md** — sin cambios.
**Otras páginas** — Marca-Y-Marketing / Producto-Y-Modelo-De-Negocio: la FAQ pública tiene 15 preguntas: primer mes, implementación, cómo pago (SINPE Móvil o transferencia), factura (comprobante; electrónica se coordina), contrato, plazos, garantía 48 h, cambios, empezar con la carta, pedido mínimo, envíos fuera de la GAM, clientes y turistas, facturación del restaurante, Uber Eats/PedidosYa (sin integración), si algo falla.
**log.md** — `## [2026-09-22] ingest | FAQ de Costa Rica`
- 15 preguntas ordenadas por lo que pregunta primero un dueño de soda.
- Respuestas desde `PRICING` y las decisiones cerradas; sin "1 año de soporte".
- Verificado: JSON-LD FAQPage idéntico a lo visible (Playwright).

### V07 · Demo sin errores y QR · commit 296c27d · despliegue READY
**Pendientes.md** — cerrar: "Errores de la demo: ₡2800,00, MESA MESA, top sin ordenar, tuteo, /preview/admin" y "No hay QR para escanear la demo desde la compu".
**Decisiones.md** — D-028 (nueva): colones siempre sin decimales en toda la app. Contexto: la BD guarda CRC con 2 decimales y la demo mostraba "₡2800,00". Decisión: `formatMoney` usa `formatCrc` para CRC ("₡2 800"), sin tocar la BD. Consecuencia: el panel y la carta real también muestran colones sin decimales; las demás monedas siguen igual.
**Seguridad.md** — S8 (ruta privada): sin cambios; además /preview/admin (vista demo del super admin) queda con `noindex` y sin enlaces públicos.
**Otras páginas** — Paneles-Y-Vistas: /preview ahora muestra dos vistas (carta del comensal y panel del restaurante); /preview/admin existe pero no se enlaza ni se indexa. La sección demo de la landing tiene un QR real a https://datafud.com/preview/cliente desde tablet en adelante.
**log.md** — `## [2026-09-22] ingest | Demo sin errores y QR`
- Colones sin decimales, "Mesa 1" sin duplicar, top ordenado, voseo.
- /preview/admin fuera del recorrido público y con noindex.
- QR real generado con `qrcode` en el build.
- `qa:landing` ahora cubre la demo y verifica el QR contra la URL esperada.

### V08 · Página más corta y coherente · commit 1d4df0f · despliegue READY
**Pendientes.md** — cerrar: "Página de ~26 pantallas en móvil, claims repetidos, incoherencias" (ahora ~18 pantallas: 14 754 px a 375).
**Decisiones.md** — D-029 (nueva): estructura de la landing en 8 secciones (hero → cómo funciona → demo → planes → hardware → por qué DataFud → preguntas → contacto). Contexto: 21 174 px en móvil y plazos repetidos 10 veces. Decisión: fuera tira de monedas, stats, "El sistema", ambiente y paso a paso con fotos; plazos en una sola línea de tiempo en días. Consecuencia: "48" y "15 días" como máximo 3 veces cada uno; la landing ya no muestra "18 monedas" ni "Latinoamérica" como origen.
**Seguridad.md** — sin cambios.
**Otras páginas** — Paneles-Y-Vistas (landing): secciones `#como-funciona`, `#demo`, `#planes`, `#hardware`, `#confianza` (Por qué DataFud), `#preguntas`, `#contacto`; desaparecen `#sistema` e `#implementacion`. Marca-Y-Marketing: cierre de marca "Hecho en Costa Rica" (antes "Hecho en Latinoamérica"). Plan-Landing-First: estructura nueva.
**log.md** — `## [2026-09-22] ingest | Landing más corta`
- De 21 174 a 14 754 px en móvil (−30,3 %) y de 12 a 8 secciones.
- Plazos en una línea de tiempo; "48" y "15 días" ×3 cada uno.
- Textos mínimos de 12 px; "Hecho en Costa Rica".
- Lighthouse móvil local 96 / 100 / 96 / 100.

### V09 · Medición y contacto · commit 3e033d9 · despliegue READY
**Pendientes.md** — cerrar: "Sin Meta Pixel ni UTMs para campañas" y "Formulario oculto" (queda condicionado a la variable, documentado). Nuevos en "Datos que esperan a Steven": "Verificar el dominio datafud.com en Resend y cargar `RESEND_API_KEY` + `RESEND_FROM_EMAIL` en Vercel, luego redesplegar", "Si se va a pautar: crear el píxel y cargar `NEXT_PUBLIC_META_PIXEL_ID`, luego redesplegar".
**Decisiones.md** — D-030 (nueva): el píxel de Meta solo en páginas de marketing y solo con variable. Contexto: se quieren medir campañas sin poner rastreo publicitario en la carta de los comensales ni en los paneles. Decisión: `MetaPixel` se monta en `/` y en las páginas de nicho; sin `NEXT_PUBLIC_META_PIXEL_ID` no se carga nada y la privacidad dice que hoy no se usa. Consecuencia: activarlo exige variable + redeploy, y la privacidad cambia sola.
**Seguridad.md** — sin cambios (sin secretos nuevos; la variable del píxel es pública por diseño).
**Otras páginas** — Cuentas-y-Accesos: agregar `NEXT_PUBLIC_META_PIXEL_ID` (opcional, pública) a la tabla de variables; nota en `RESEND_FROM_EMAIL`: "debe ser de un dominio verificado; con onboarding@resend.dev solo llega al dueño de la cuenta". Marca-Y-Marketing: eventos `whatsapp_click`, `demo_open`, `contact_submit` llevan `utm_source/medium/campaign`.
**log.md** — `## [2026-09-22] ingest | Medición con UTMs y píxel opcional`
- UTMs guardados en la sesión y sumados a los eventos de Vercel y Meta.
- Meta Pixel con snippet oficial solo con variable; Lead y ViewContent.
- Verificado con Playwright: 0 requests a facebook.net sin variable; con ID falso, Lead en la cola.

### V10 · SEO local · commit b9f6828 · despliegue READY
**Pendientes.md** — cerrar: "SEO local débil: H1 sin Costa Rica, sin páginas por nicho, sin LocalBusiness". Nuevo en "Datos que esperan a Steven": "Crear el Google Business Profile de DataFud (área de servicio Costa Rica, sin dirección pública) y enlazarlo a datafud.com".
**Decisiones.md** — D-031 (nueva): tres guías de SEO local. Contexto: la landing sola no posiciona búsquedas como "menú digital para sodas". Decisión: `/menu-digital-costa-rica` (pilar), `/menu-digital-para-sodas` y `/menu-qr-restaurantes-turisticos`, estáticas, con precios desde PRICING y sin nombrar competidores. Consecuencia: todo cambio de oferta se refleja solo; cada guía nueva debe aportar contenido propio (no duplicado).
**Seguridad.md** — sin cambios.
**Otras páginas** — Paneles-Y-Vistas: agregar las tres rutas públicas nuevas y el bloque "Guías" del footer. Marca-Y-Marketing: JSON-LD con Organization + LocalBusiness (sin dirección postal) y FAQPage/BreadcrumbList en las guías. Analisis-Venta-Y-Competencia: hallazgo de SEO local cerrado.
**log.md** — `## [2026-09-22] ingest | SEO local`
- LocalBusiness y Organization con datos reales, sin dirección.
- Tres guías de 650 a 840 palabras con precios desde PRICING y CTA de WhatsApp propio.
- Sitemap, canonical y OG por página.
- Verificado: build estático, un h1 por página, qa:landing en 3 viewports.

### V11 · Kit de prospección y contenido · commit 85e9308 · despliegue READY
**Pendientes.md** — cerrar: "Sin material para prospectar ni para contenido". Nuevos en "Ventas": "Imprimir un stand de muestra con el QR `utm_source=visita` del kit", "Grabar c01, c03 y c11 del plan de 30 días".
**Decisiones.md** — ninguna.
**Seguridad.md** — sin cambios.
**Otras páginas** — Marca-Y-Marketing: enlazar `docs/ventas/KIT-PROSPECCION.md` y `docs/ventas/CONTENIDO-30-DIAS.md`; convención de UTM `utm_source=<canal>&utm_medium=prospeccion|social|stand-muestra&utm_campaign=<zona o id>`.
**log.md** — `## [2026-09-22] ingest | Kit de prospección y contenido`
- Kit con UTMs, 3 mensajes de primer contacto, seguimientos, cierre, guion de 60 s y objeciones.
- Plan de 12 publicaciones sin clientes ni cifras inventados.
- Verificado: grep cruzado de cifras contra PRICING y de frases vetadas = 0.

### V12 · Verificación final (5 pasadas) · commit 53a3dc7 · 12b5cd3 · d8e53ad · 23e6894 · ddaa54c · despliegue READY
**Pendientes.md** — nuevos en "Datos que esperan a Steven": "Decidir si los precios incluyen IVA", "Decidir el tope de categorías y mesas de la Carta (hoy 5 y 8) y alinear `full_branding` de la semilla Básico", "Confirmar alcance de la garantía de 48 h (hoy: solo implementación de la Carta)", "Aclarar '48 horas hábiles' y si los '15 días' son hábiles o naturales", "Condiciones de la oferta de fundadores, momento de pago del hardware y si se descuenta la implementación de la Carta al pasar a Estándar", "Confirmar que el plan de Vercel registra eventos propios de Web Analytics".
**Decisiones.md** — D-032 (nueva): lectura conservadora de lo no decidido. Contexto: la revisión encontró huecos (IVA, alcance de la garantía, aviso tardío). Decisión: lo que no está en D-023…D-027 no se inventa; se publica la lectura más estricta para DataFud (garantía solo sobre la implementación de la Carta; aviso tardío = se cobra un período más) y el resto queda como pendiente de Steven. Consecuencia: cualquier cambio de criterio se hace en `PRICING.terms` y se refleja solo en planes, FAQ y términos.
**Seguridad.md** — sin cambios.
**Otras páginas** — Analisis-Venta-Y-Competencia: rúbrica final (claridad 5, precio 5, resto 4) y medidas antes → después (alto −30 %, Lighthouse móvil 61 → 95). Paneles-Y-Vistas: la landing se ve completa sin JavaScript.
**log.md** — `## [2026-09-22] ingest | Verificación final de la landing`
- 5 pasadas: 1 propia y 4 de revisores independientes con contexto fresco.
- Altos 3 → 0; el último medio (redacción de la cancelación) se corrigió y verificó.
- Topes de la Carta publicados, contenido visible sin JS, garantía y cancelación sin ambigüedad.
- Lighthouse móvil 95/100/96/100; qa:landing en verde en 10 rutas × 3 viewports.

### V13 · Informe final y cierre del puente · commit de3f93a · despliegue READY (docs y versión)
**Pendientes.md** — ver el resumen de arriba.
**Decisiones.md** — ninguna nueva.
**Seguridad.md** — sin cambios.
**Otras páginas** — Datafud (hub): versión 1.1.0; informe en `docs/plans/venta-loop-report.md`.
**log.md** — `## [2026-09-22] ingest | Loop lista para vender completo`
- 13 unidades publicadas en `main`, todos los despliegues de producción READY.
- Informe con antes → después, rúbrica y pendientes ordenados.
- CHANGELOG 1.1.0, `package.json` 1.1.0, `CLAUDE.md` con mapa y etapa actualizados.
- Puente con resumen por página, listo para "sincronizá el vault".
