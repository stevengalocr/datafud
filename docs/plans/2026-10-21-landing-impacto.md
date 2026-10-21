# Landing de impacto — 2026-10-21

Pedido de Steven (2026-10-21): «el diseño actual me gusta, nada más que es muy plano». Darle a la landing una imagen innovadora (animaciones 3D, imágenes nuevas, scroll, animación del mouse, detalles distintivos) **sin tocar el core**: colores, tipografía, textos de venta, precios, condiciones y toda la funcionalidad quedan igual. Sin saturar, sin afectar rendimiento ni visibilidad en buscadores, sin mentir sobre el producto. 100 % responsive. Decisiones de Steven: la vitrina del panel va dentro de la landing (no se animan los paneles reales), las tres guías de SEO toman el lenguaje visual en versión liviana, créditos de generación sin tope fijo y publicación directa a producción al terminar (no hay clientes todavía).

## Concepto: «de la mesa al panel»

La página cuenta el recorrido de un QR: el comensal escanea, se abre la carta, el pedido llega al panel. Cada sección es un paso de ese viaje.

## Piezas

1. **Portada que escanea.** Escena fija de alto largo. El video (acercamiento de cámara al stand sobre una mesa, generado desde `public/renders/ambiente-mesa.webp`) avanza con el scroll. Al final, un visor dorado encuadra el QR del stand, pasa la línea de escaneo y sube el teléfono con la carta real de la demo. **Hecho así:** el QR del propio video decodifica a `https://datafud.com/q/demo26` en todos los cuadros (D-051, comprobado con un lector en nueve cuadros), así que no hace falta posar otro encima. El h1, la bajada, los CTA y la línea de precio son los de hoy y vienen visibles en el HTML del servidor. Sin JS o con movimiento reducido: el render quieto de hoy. El video se pide con la primera interacción, nunca en la carga, con una versión liviana para teléfono.
2. **Visor de escaneo (mouse).** Cuatro esquinas de visor que siguen al puntero con inercia y que, sobre un botón o un enlace, lo enmarcan. Solo con mouse y sin movimiento reducido; el cursor del sistema sigue visible. Decorativo (`aria-hidden`), solo `transform`.
3. **Cómo funciona.** Los mismos pasos, con una línea que se llena con el scroll y los pasos que se encienden al alcanzarla.
4. **Demo.** El teléfono gira levemente en 3D con el scroll y con el mouse; la carta de adentro se desplaza sola, despacio.
5. **El sistema completo, en acción (nuevo).** Vitrina del panel con los componentes reales del sistema y los datos de la demo: el pedido sale de la mesa, entra en «Por atender», pasa a listo y el reporte del día se dibuja. Rotulada «Panel de demostración · datos de ejemplo». Sin «tiempo real» ni promesas de resultado (CLAUDE.md, regla 10).
6. **Planes.** Tarjetas con inclinación 3D y una luz que sigue al mouse; el contenido no cambia.
7. **Hardware en 3D.** Un stand en CSS 3D (prisma con la cara del QR real y la del NFC) que gira con el scroll y se puede arrastrar; los renders de hoy en una galería con profundidad.
8. **Corte de escena nocturno.** **Hecho así:** en lugar de oscurecer el contacto (donde D-056 no quiere ningún QR junto al CTA de WhatsApp), un corte de escena entre Hardware y Por qué DataFud con la soda de noche, parallax y la fila de píxeles que se ensambla; sus dos líneas son textos que ya estaban en la página. Por qué, preguntas y contacto quedan como estaban.
9. **Guías de SEO.** El visor de escaneo, las entradas y el mismo tratamiento del encabezado; sus textos no cambian.

## Reglas

- Marca: `docs/BRAND.md` y `.impeccable.md`. Sin `backdrop-blur`, sin texto con degradado, sin emojis, íconos SVG.
- Imágenes: D-049 a D-051 (sin texto, personas, comida generada ni marcas inventadas; renders rotulados «Render ilustrativo»; todo QR dibujado decodifica a `/q/demo26`). Vara «Sin marca y sin cara de IA» del vault (Contenido).
- Movimiento: solo `transform` y `opacity`; ninguna entrada arranca invisible; todo se neutraliza con `prefers-reduced-motion`.
- Rendimiento: el LCP sigue siendo el h1 de texto; nada pesado en la carga inicial; sin dependencias nuevas de animación.
- Funcionalidad intacta: `npm run typecheck`, `lint`, las tres pruebas, `build` y `qa:landing` en verde, más una pasada por `/preview/*`, `/c/ejemplo`, `/login`, el formulario y los CTA de WhatsApp.
