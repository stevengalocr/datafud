# Vault-sync · Base sólida (1.7.0) · 2026-10-08

> Puente al vault **local** (`..\obsidian\Cerebro2.0\02-Proyectos\Datafud\`). Sesión local: aplicado
> directo a las páginas del nodo. **1.7.0 está en producción desde el 2026-10-08** (release
> `753fe9d`, squash-merge a `main`; Vercel despliega `main` solo, `datafud.com`). Producción anterior:
> 1.6.1 (`main` @ `0cc337b`). **`schema.sql` 1.7.0 lo aplicó Steven en producción el 2026-10-08**, antes
> del merge (comprobado desde afuera: `place_order` acepta `p_client_ref` y `get_menu` con una mesa
> inexistente devuelve vacío); según Steven, `verify.sql` dio las 51 filas en true. Las ramas de
> trabajo `base-solida` y `bs-t*` no se empujaron: el historial público solo tiene el squash.
> Las auditorías (de la app, AA-1 a AA-37, y de seguridad, AS-1 a AS-14) son la fuente del sprint; la
> de seguridad vive solo en el vault y aquí se nombran los arreglos, nunca los vectores. Detalle del
> release en `docs/CHANGELOG.md` `## [1.7.0]`; plan en `docs/plans/2026-10-07-base-solida-1-7-0.md`.

### T1 · Panel del restaurante: órdenes, resumen, reportes y menú · commit 753fe9d · despliegue en producción 2026-10-08 (main @ 753fe9d)
**Pendientes.md** — Cerrar, con fecha 2026-10-08 y su commit, en «P1 · P2 · P3»: **S11** (el estado de una orden solo avanza por los pasos del servicio, con «Deshacer») y, en el detalle, nada más. Sin ítems nuevos. El tablero se divide en «Por atender» y «Cerradas hoy», el Resumen cuenta el día de Costa Rica completo y los reportes son 14 días de calendario.
**Decisiones.md** — ninguna.
**Seguridad.md** — **S11** cerrado (2026-10-08, 1.7.0).
**Otras páginas** — `Producto-Y-Modelo-De-Negocio.md`: la fila «Tablero de comandas» pasa a «Por atender / Cerradas hoy, mesa en cada tarjeta y Deshacer durante un minuto (1.7.0)». `Paneles-Y-Vistas.md`: Órdenes, Menú (agrupado por categoría con buscador) y Reportes con lo nuevo.
**log.md** — ver T6.
Aplicado en vault: sí

### T2 · Carta del comensal y rutas públicas · commit 753fe9d · despliegue en producción 2026-10-08 (main @ 753fe9d)
**Pendientes.md** — Cerrar **S12** (la carta nunca muestra texto de la base). Sin ítems nuevos. La carta conserva el carrito al recargar, reintenta sin duplicar el pedido y está en tres idiomas; `/m/…` lleva el nombre del local como título y no se indexa; hay 404 propia y aviso de código QR dado de baja.
**Decisiones.md** — ninguna.
**Seguridad.md** — **S12** cerrado (2026-10-08, 1.7.0).
**Otras páginas** — `Paneles-Y-Vistas.md`: la ruta `/m/[tenant]/[table]`, `/q/no-disponible` y el 404 de marca.
**log.md** — ver T6.
Aplicado en vault: sí

### T3 · Cuenta, planes y super admin · commit 753fe9d · despliegue en producción 2026-10-08 (main @ 753fe9d)
**Pendientes.md** — Sin cierres propios. Nuevo en el detalle: el dueño puede cambiar su contraseña desde Configuración (la inicial que se manda por WhatsApp ya no queda para siempre).
**Decisiones.md** — **D-064** (un solo pago por local y período; no hay pagos partidos).
**Seguridad.md** — **S19** (rol verificado en cada página de `/admin`; local suspendido o cancelado en solo lectura; el panel ya no dice «listo» sin filas afectadas): cerrado.
**Otras páginas** — `Producto-Y-Modelo-De-Negocio.md`: filas nuevas «Cambiar contraseña desde el panel», «Local suspendido o cancelado: solo lectura con aviso» y «Plan Carta: la carta se muestra sin carrito».
**log.md** — ver T6.
Aplicado en vault: sí

### T4 · Base de datos (schema.sql 1.7.0) · commit 753fe9d · despliegue en producción 2026-10-08 (main @ 753fe9d); `schema.sql` aplicado por Steven el 2026-10-08 antes del merge
**Pendientes.md** — Cerrar, con fecha 2026-10-08: **S13** (rotar el QR de una mesa con «Cambiar QR»), «Tope de almacenamiento por negocio y limpieza de fotos reemplazadas (política SELECT en Storage)» e «Índice order_items (tenant_id, product_id) y filas nuevas de verify.sql para Storage» (sección «Después»). La oleada sigue abierta, con la nota de que el esquema 1.7.0 ya está aplicado y de que para probar pedidos el local «test» tiene que estar en Estándar (el plan Carta, como «test3», ya no recibe pedidos desde la mesa).
**Decisiones.md** — D-064 (ver T3).
**Seguridad.md** — **S13** cerrado (2026-10-08). **S17** cerrado: políticas, permisos de funciones y reglas de datos más estrictos en la base, y `verify.sql` compara la lista exacta de políticas y funciones (51 filas). **S21** cerrado: los topes de `place_order` valen también con pedidos simultáneos.
**Otras páginas** — `Arquitectura-Y-Base-De-Datos.md`: `place_order` con referencia de envío (reintento sin duplicar), solo lectura de locales suspendidos en la base, topes de fotos por plan, `verify.sql` de 51 filas. `Guia-De-Desarrollo.md`: el esquema se aplica antes de desplegar la app.
**log.md** — ver T6.
Aplicado en vault: sí

### T5 · Web, encabezados y marca · commit 753fe9d · despliegue en producción 2026-10-08 (main @ 753fe9d)
**Pendientes.md** — Cerrar **backdrop-blur** (fuera de la carta, regla de marca) y **`seed.dev.sql` con código de error** (P3). Queda i18n de paneles.
**Decisiones.md** — **D-065** (el repo es público: commits y docs nombran arreglos, no vectores; las auditorías de seguridad viven en el vault) y **D-067** (la política de contenido completa sale primero en modo observación).
**Seguridad.md** — **S18** (encabezados de seguridad en todo el sitio y `noindex` en `/m/…`): cerrado en el código; la política de contenido sigue en observación hasta revisarla en producción. **S20** (formulario de contacto con sello de tiempo del servidor y tope de envíos, higiene del cliente de Supabase y de `.env.example`): cerrado.
**Otras páginas** — `Marca-Y-Marketing.md`: nada. `Producto-Y-Modelo-De-Negocio.md`: nada.
**log.md** — ver T6.
Aplicado en vault: sí

### T6 · Demos alineadas, release 1.7.0 y vault · commit 753fe9d · despliegue en producción 2026-10-08 (main @ 753fe9d)
**Pendientes.md** — Cerrar «Alinear `/preview/admin` y `/preview/dashboard` con los paneles nuevos» (Abiertos de la auditoría de paneles); queda el logo transparente para el acceso. Cerrar, con el ruling de D-066, «Logo del local ficticio de la demo (Verde Limón)». **Pendiente de Steven nuevo:** un paso de refuerzo de acceso (detalle en el vault, no en el repo). El estado de `Pendientes.md` se reescribe al 2026-10-08: 1.7.0 en producción; la oleada de pruebas sigue abierta (local «test» en Estándar, «test3» en Carta sin pedidos, foto y logo transparente desde el iPhone, un pedido real, `scripts/prueba-aislamiento.mjs` con test y test3, Security Advisor), más SMTP propio y backups.
**Decisiones.md** — **D-066** («Verde Limón» se queda como marca de la demo).
**Seguridad.md** — **S16** (refuerzo del acceso, AS-1 de la auditoría): **parcialmente abierto**; el detalle y los pasos están en el vault, no en el repo. Sin otros cambios.
**Otras páginas** — `Datafud.md`: versión 1.7.0 (release `753fe9d`, 2026-10-08), 67 decisiones (D-001…D-067), índice y resumen. `index.md`: 1.7.0 y 67. `Seguridad.md`: foto fechada de 1.7.0. `Ficha-Tecnica.md`: «Estado actual» y trampas nuevas (esquema antes que la app, squash para publicar, el conector de Supabase ve una sola cuenta). `Producto-Y-Modelo-De-Negocio.md`: foto fechada de 1.7.0.
**log.md** — `## [2026-10-08] ingest | Base sólida 1.7.0 en producción`
- 1.7.0 (release `753fe9d`, squash-merge a `main`, 2026-10-08) en producción tras aplicar Steven `schema.sql` 1.7.0 (`verify.sql`, 51 filas en true según Steven).
- Entran: panel con órdenes «Por atender» y «Deshacer», resumen y reportes por día de Costa Rica; carta que no se cuelga, sin pedidos duplicados y accesible; cambio de contraseña, solo lectura de locales suspendidos y plan Carta sin pedidos; base con reglas de datos, topes y estados de orden firmes; encabezados de seguridad; demos alineadas con los paneles.
- Cierres: S11, S12, S13 y los hallazgos de la auditoría de seguridad S17 a S21; S16 queda parcial. Decisiones D-064 a D-067.
- Verificado: `typecheck`, `lint` y `build` en verde; el SQL se corrió en una Postgres de prueba (base vacía y base 1.6 con datos); sonda externa tras aplicar el esquema; `lint-vault.mjs` en 0 problemas.
- Sigue abierto: la oleada con Steven, el paso de refuerzo de acceso (S16), SMTP y backups.
Aplicado en vault: sí
