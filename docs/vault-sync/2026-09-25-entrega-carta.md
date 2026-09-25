# Vault-sync · Cierre de la entrega de la Carta · 2026-09-25

> Cola de entrada para el vault de Obsidian (`02-Proyectos/Datafud/`). Cada unidad del loop
> "cierre de la entrega" agrega su bloque abajo, con el formato exacto del `CLAUDE.md` del repo.
> Se aplica tal cual en `Pendientes.md`, `Decisiones.md`, `Seguridad.md`, las páginas que se
> nombren y el `log.md` del nodo (`## [AAAA-MM-DD] ingest | Título`). El resumen
> "qué cambiar en cada página" se agrega arriba de todo al cerrar el loop (E08).

Aplicado en vault: **no** (se decide en E08, según el conector de Google Drive de la sesión).

---

### E01 · Estado, línea base y fixture de prueba · commit <pendiente> · despliegue —

**Pendientes.md** — ítem nuevo: "Loop cierre de la entrega en curso (E01–E08), estado en
`docs/plans/entrega-loop-state.md`". Ítem nuevo para Steven: "Decidir si `sharp` se declara en
`package.json`: hoy llega como dependencia transitiva de Next y los scripts de entrega de cartas
dependen de ella".

**Decisiones.md** — ninguna nueva en esta unidad. El loop ejecuta D-042 (logo), D-043 (peso de la
carta), D-044 (kit de entrega), D-045 (subtítulo por carta) y D-046 (alta desde CSV), que Steven
dejó cerradas en el prompt maestro del 2026-09-25. Cada una se registra en el bloque de la unidad
que la implementa.

**Seguridad.md** — sin cambios. El loop no toca `supabase/`, RLS, RPC ni los hallazgos S1/S3/S10.

**Otras páginas** — `Guia-De-Desarrollo.md`: anotar que el fixture de prueba de las cartas vive en
`scripts/fixtures/carta-prueba/` y que su material pesado (6 fotos de ~2,4 MB y el logo) **no se
versiona**: se reconstruye con `node scripts/fixtures/carta-prueba/generar.mjs`. Meter imágenes
generadas de 15 MB en el historial de un repo público es basura permanente.

**log.md** — `## [2026-09-25] ingest | Loop cierre de la entrega: línea base y fixture`
- Arranca sobre 1.2.0 (`7b9c4e6`) con la línea base en verde: typecheck limpio, lint sin avisos,
  build con 37 rutas, `qa:landing → OK · 21 avisos`.
- El loop existe porque la revisión independiente de 1.2.0 encontró tres promesas publicadas que
  hoy no se cumplen: el logo no se pinta, las fotos no se optimizan (una carta de prueba pesó
  47 MB) y no hay herramienta para el QR provisional ni para el PDF de respaldo.
- Fixture nuevo "Rancho La Parcela": 14 platillos, 3 categorías, **USD** (para ejercitar los
  decimales, que la demo en colones no toca), bilingüe, con platillos sin foto y sin descripción,
  subtítulo propio de soda que cobra en caja, y 6 fotos de 3200×2400.
- `sharp` 0.35.4 está disponible pero es transitiva de Next: queda anotado como riesgo.
