# Vault-sync · Oferta sólida, Carta entregable y solo WhatsApp · 2026-09-25

> Cola de entrada para el vault de Obsidian (`02-Proyectos/Datafud/`). Cada unidad del loop
> "oferta sólida" agrega su bloque abajo, con el formato exacto del `CLAUDE.md` del repo.
> Se aplica tal cual en `Pendientes.md`, `Decisiones.md`, `Seguridad.md`, las páginas que se
> nombren y el `log.md` del nodo (`## [AAAA-MM-DD] ingest | Título`). El resumen
> "qué cambiar en cada página" se agrega arriba de todo al cerrar el loop (O09).

Aplicado en vault: **no** (se decide en O09, según el conector de Google Drive de la sesión).

---

### O01 · Estado, línea base y puente · commit <pendiente> · despliegue —

**Pendientes.md** — nada que cerrar todavía. Ítem nuevo: "Loop oferta sólida en curso
(O01–O09), estado en `docs/plans/oferta-loop-state.md`".

**Decisiones.md** — ninguna nueva en esta unidad; el loop ejecuta D-014, D-039, D-040 y D-041,
que Steven dejó cerradas en el prompt maestro del 2026-09-25. Se registran en el bloque de la
unidad que las implementa (O03, O05, O02 y O06 respectivamente).

**Seguridad.md** — sin cambios. El loop no toca `supabase/`, RLS, RPC ni los hallazgos S1/S3/S10.

**Otras páginas** — `Guia-De-Desarrollo.md`: agregar que en la máquina de Steven el puerto 3000
puede estar ocupado por otro proyecto y que `qa:landing` se corre con
`QA_BASE=http://localhost:3177`, porque el script da por bueno cualquier servidor que responda
en ese puerto y verificaría el sitio equivocado.

**log.md** — `## [2026-09-25] ingest | Loop oferta sólida: línea base`
- Repo clonado en `main` @ `19d3b66`, la base exacta que declara el prompt.
- Línea base verde: `typecheck` limpio, `lint` sin avisos, `build` con 34 rutas,
  `qa:landing` OK con 18 avisos preexistentes de área táctil.
- El parche `datafud-oferta-solida.patch` no aparece por ningún lado: cada unidad O02–O07 se
  implementa desde su especificación, con commit propio.
- Esta sesión sí tiene red directa a `datafud.com` (curl → 200), a diferencia del loop anterior:
  las puertas B, C, D y E se pueden verificar contra producción sin pasar por la API de Vercel.
