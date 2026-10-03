# Vault-sync · Movimiento, sombras y blindaje de los paneles · 2026-10-03

> Puente al vault **local** (`..\obsidian\Cerebro2.0\02-Proyectos\Datafud\`). Esta unidad la hizo
> un agente en un worktree aislado, sin acceso al vault: la sesión local que integre la rama lo
> aplica y cambia la última línea a «sí».

### P01 · Movimiento, sombras y blindaje de los paneles · commit d86b458 · despliegue pendiente (rama sin integrar)
**Pendientes.md** — Cerrar «P3-5 · `window.confirm` sin la marca» como *primitiva lista* (`useConfirm` en `src/components/ui/confirm-dialog.tsx`); queda pendiente adoptarla en Restaurantes, Menú, Mesas y Órdenes. Nuevos: «P1 · Formularios de Menú, Mesas, Pagos, Cargos y Configuración: pasar a `useFormSubmit` + `SubmitButton` (con un fallo, React 19 vacía los campos)», «P2 · `DeleteTableButton` no atrapa el error de `deleteTable`», «P3 · «×» de eliminar categoría a 44 px en el teléfono».
**Decisiones.md** — ninguna nueva. Criterios anotables en `Paneles-Y-Vistas.md`: ninguna animación de entrada parte de `opacity: 0`; sin `animation-fill-mode` en elementos fijos; hover solo con mouse fino (`hov:`); sombras de los paneles tintadas con el verde de marca (escala `panel-xs/sm/md/lg`).
**Seguridad.md** — sin cambios. Nota: el login ya no puede enviarse dos veces y, si el JavaScript no cargó, el formulario sigue yendo por POST (nunca por GET con la contraseña en la URL).
**Otras páginas** — `Paneles-Y-Vistas.md`: agregar «Movimiento de los paneles: entrada de 6 px al cambiar de sección, cascada de 40 ms en las cifras, cajón de 24 px con velo, diálogo de confirmación nativo con la marca; presión a 0.97 en todo lo que se toca». `Marca-Y-Marketing.md` (sección de motion): «En los paneles, solo `transform`, nunca desde opacidad 0; sombras tintadas de verde, nunca gris». `Guia-De-Desarrollo.md`: «Formularios de los paneles: `useFormSubmit` + `SubmitButton` (no `<form action>` a secas: React 19 vacía los campos aunque la acción falle)».
**log.md** — `## [2026-10-03] ingest | Movimiento, sombras y blindaje de los paneles`
- Escala de sombras de marca y variantes `hov:` / `user-invalid:` en Tailwind; botones a 0.97 en 160 ms y 44 px en el teléfono.
- Entradas solo con `transform` (página, cifras, cajón, diálogo, avisos); medido que todo termina en `transform: none` y opacidad 1.
- Primitivas `SubmitButton`, `useFormSubmit` y `useConfirm` para los formularios; login que conserva el correo y no envía dos veces.
- Textos extremos sin scroll lateral en 375 px (Órdenes desbordaba 351 px).
- Verificado con un Supabase falso: 42 capturas antes y 42 después, estilos computados, typecheck, lint y build en verde.
Aplicado en vault: no
