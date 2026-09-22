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
