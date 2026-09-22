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
