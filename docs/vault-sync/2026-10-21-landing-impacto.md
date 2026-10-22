# vault-sync · 2026-10-21 · Landing de impacto (1.10.0)

### L-01 · Landing de impacto: la página que escanea · commit 018de73 · despliegue producción (Vercel)
**Pendientes.md** — ninguno nuevo ni cerrado: el carril de Steven (oleada, aislamiento, SMTP, backups, trámites) sigue igual.
**Decisiones.md** — D-069 · Landing de impacto sin tocar el core. Contexto: Steven, 2026-10-21: «el diseño actual me gusta, nada más que es muy plano»; pidió imagen innovadora (3D, imágenes nuevas, scroll, mouse) sin cambiar colores, tipografía, textos, precios ni funciones, sin mentir sobre el producto y sin afectar rendimiento ni visibilidad. Decisión: portada con video que sigue al scroll (acercamiento al stand desde `renders/ambiente-mesa.webp`; su primer cuadro es el render rotulado, D-050 sigue), visor de escaneo que sigue al mouse, vitrina del panel `#sistema` con los componentes reales y datos de ejemplo (no se animan los paneles reales, elección de Steven), stand en CSS 3D con el QR real, inclinación 3D en planes y hardware, corte de escena nocturno y fotos de producto nuevas. Las guías de SEO toman el lenguaje en versión liviana. Consecuencias: sin JS o con movimiento reducido todo queda quieto y completo; el video (1,7 MB / 0,7 MB) se pide con la primera interacción; toda imagen nueva sigue D-049 a D-051 (QR verificados con un lector); ningún QR junto al CTA de cierre (D-056).
**Seguridad.md** — sin cambios (sin cambios de esquema ni de rutas; la CSP ya permitía `media-src 'self'`).
**Otras páginas**
- `Datafud.md` (hub): producción en 1.10.0 con la landing de impacto.
- `Marca-Y-Marketing.md`: la landing suma la sección `#sistema` (9 secciones) y las firmas de movimiento nuevas.
- `Imagenes-Y-Renders.md`: imágenes nuevas — `portada/escaneo.mp4`, `escaneo-movil.mp4` y sus pósters; `renders/familia-stands.webp`, `noche-soda.webp`, `stand-qr-travertino.webp`, `stand-qr-nfc-travertino.webp`, `stand-resenas-travertino.webp`, `tarjeta-nfc-travertino.webp` (las cuatro últimas reemplazan a las del hardware en `PRICING`). Todas rotuladas «Render ilustrativo» y con QR que decodifica a `/q/demo26`.
**log.md** — `## [2026-10-21] ingest | 1.10.0 · Landing de impacto` + viñetas.
Aplicado en vault: sí

### L-02 · Pie del teléfono de la portada · commit e8ead7d · despliegue producción (Vercel)
**Pendientes.md** — ninguno.
**Decisiones.md** — ninguna.
**Seguridad.md** — sin cambios.
**Otras páginas** — `Datafud.md` (hub): producción en 1.10.1.
**log.md** — una viñeta en la entrada de 1.10.0: 1.10.1 sube el pie del teléfono sobre la etiqueta en teléfono.
Aplicado en vault: sí

### L-03 · La primera pantalla, en todos los tamaños · commit 301a2b2 · despliegue producción (Vercel)
**Pendientes.md** — ninguno.
**Decisiones.md** — ninguna nueva (amplía D-069: en teléfono y tableta vertical la portada es inmersiva).
**Seguridad.md** — sin cambios.
**Otras páginas** — `Datafud.md` (hub): producción en 1.11.0. `Imagenes-Y-Renders.md`: `portada/escaneo-vertical.mp4` (600×800, 0,76 MB) y `escaneo-inicio-vertical.webp` reemplazan a `escaneo-movil.mp4` y `escaneo-inicio-movil.webp`.
**log.md** — `## [2026-10-21] ingest | 1.11.0 · La primera pantalla, en todos los tamaños` + viñetas.
Aplicado en vault: sí

### L-04 · Alta calidad y última revisión · commit bb3b537 · despliegue producción (Vercel)
**Pendientes.md** — ninguno nuevo ni cerrado.
**Decisiones.md** — ninguna nueva (amplía D-069: portada y fotos de producto en 4K; por debajo de 520 px de alto la portada queda quieta).
**Seguridad.md** — sin cambios.
**Otras páginas** — `Datafud.md` (hub): producción en 1.12.0. `Imagenes-Y-Renders.md`: `portada/escaneo-4k.mp4`, `escaneo-vertical-hd.mp4` y los cuatro pósters por tamaño reemplazan a `escaneo.mp4`, `escaneo-vertical.mp4`, `escaneo-inicio.webp` y `escaneo-inicio-vertical.webp`; las seis fotos de producto pasan a versión 4K con QR verificados.
**log.md** — `## [2026-10-21] ingest | 1.12.0 · Alta calidad y última revisión` + viñetas.
Aplicado en vault: sí

### L-05 · Precios iguales para todos · commit f88e45e · despliegue producción (Vercel)
**Pendientes.md** — cerrar: "`founderOffer.remaining = 9` cuando cierre el primer fundador". Cambiar "3 fundadores cerrados → … bajar `founderOffer.remaining`" por "Primeros clientes → permiso por escrito → primer testimonio real".
**Decisiones.md** — D-070 · Sin oferta de fundadores: precios iguales para todos (retira D-037 y D-057 y la parte de fundadores de D-024).
**Seguridad.md** — sin cambios.
**Otras páginas** — `Datafud.md` (hub): producción en 1.13.0; la oferta ya no menciona fundadores.
**log.md** — `## [2026-10-21] ingest | 1.13.0 · Precios iguales para todos` + viñetas.
Aplicado en vault: sí

### L-06 · Portada a pantalla completa y fondos con vida · commit d9fe908 · despliegue pendiente (main local, espera el visto bueno de Steven)
**Pendientes.md** — ninguno nuevo ni cerrado.
**Decisiones.md** — ninguna nueva (amplía D-069: en escritorio la portada también es inmersiva, en 100 vh desde el primer cuadro y sin tarjeta; el menú va transparente sobre ella).
**Seguridad.md** — sin cambios.
**Otras páginas** — `Datafud.md` (hub): 1.14.0 en `main` local, pendiente del push.
**log.md** — `## [2026-10-22] ingest | 1.14.0 · Portada a pantalla completa y fondos con vida` + viñetas.
Aplicado en vault: sí
