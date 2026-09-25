# Informe del loop — Imágenes nuevas y honestas (2026-09-25)

> Sexto bucle autónomo sobre `main`, de `a7e9798` (1.3.0) a la versión **1.3.1**.
> Estado detallado: `docs/plans/imagenes-loop-state.md`. Puente al vault:
> `docs/vault-sync/2026-09-25-imagenes.md`. Prompt maestro: `LOOP-Imagenes-Datafud.md` (v1).

## Resumen

Tres imágenes de la web contradecían las reglas de la propia marca y ningún QR dibujado en un
render escaneaba. Las tres están reemplazadas y borradas, y los seis QR que hoy aparecen en la web
abren `https://datafud.com/q/demo26`.

| Dónde | Antes | Ahora |
|---|---|---|
| Hero (la primera imagen de la web) | `banner.png`: precios en **euros**, un carrito que la Carta no tiene, "ESCANEA" en tuteo, comida generada | `renders/ambiente-mesa.webp`: stand y tarjeta NFC en una mesa, con "Render ilustrativo" |
| Tarjeta NFC en `#hardware` | `nfc.png`: personas, una mano, comida generada y un disco que **no es el producto** | `renders/tarjeta-nfc.webp`: la tarjeta que se vende, entera en 5/2 y 16/9 |
| Fondo del cierre | `cta-bg.png`: restaurante **inventado** "THE WOODEN OAK", "SCAN FOR MENU", personas | `renders/ambiente-piedra.webp`, decorativo, contraste AA medido |
| QR de los 3 stands de estudio | Dibujados por la IA: **no decodificaban** | QR real (ECC H, el del kit) pegado con perspectiva |
| Sobrantes en `public/` | `hardware-familia.webp` (3 QR falsos) y `libro-marca.png` (texto con errores) servidos en producción | Borrado y movido a `docs/marca/` |

## Unidades

| ID | Título | Estado | Commit | Despliegue |
|---|---|---|---|---|
| R01 | Estado, línea base y archivos | hecho | `ebd5e77` | READY |
| R02 | Hero | hecho | `d5013ba` + `03e47c1` | READY |
| R03 | Tarjeta NFC en `#hardware` | hecho | `be38789` | READY |
| R04 | Fondo del cierre | hecho | `e9c5744` | READY |
| R05 | QR real en los renders de estudio | hecho | `933d8a2` | READY |
| R06 | Auditoría de `public/` | hecho | `d84a8f8` | READY |
| R07 | Verificación final y release 1.3.1 | hecho | release | ver puente |

Siete unidades, un intento cada una, ninguna bloqueada. 7 iteraciones de las 12 del tope.

## Peso de la home (puerta E)

375×812, DPR 2, 4G lenta y CPU ×4. La línea base `a7e9798` se levantó aparte (`:3178`) y se midió
**intercalada** con la final (`:3177`), 3 rondas × 3 corridas:

| | Línea base 1.3.0 | 1.3.1 |
|---|---|---|
| Al abrir | 244,4 KB | **243,6 KB** |
| Recorrida entera | 399,3 / 399,3 / 396,7 KB | **385,5 / 386,9 / 385,5 KB** |
| Imagen LCP | `banner.png` 31,6 KB | `ambiente-mesa.webp` 30,7 KB |
| LCP (mediana de 9) | 1068 ms | **1052 ms** |

El LCP varía ±150 ms entre corridas de una misma build: por eso se midió intercalado y con
mediana de 9. La diferencia de LCP está dentro del ruido; lo que baja sin discusión son los bytes.

## Puertas

| Puerta | Resultado |
|---|---|
| **A** typecheck, lint, build, `qa:landing` | Verde en cada unidad (`qa:landing → OK · 21 avisos`, los mismos de la línea base) |
| **B** `grep -rn "banner.png\|cta-bg.png\|nfc.png" src` | 0 coincidencias; los tres archivos ya no están en `public/` |
| **C** 6 renders con QR | 6 de 6 decodifican a `https://datafud.com/q/demo26` (originales), más las variantes de `next/image` en local y en producción |
| **D** "Render ilustrativo" | Hero + las 4 piezas de `#hardware`, visibles a 375 y 1440; `public/hardware/` no existe |
| **E** peso de la home | 399,3 → 385,5 KB recorrida entera; 244,4 → 243,6 KB al abrir |
| **F** producción | Ver el bloque R07 del puente |
| **G** `git diff a7e9798 -- supabase/` | Vacío; `constants.ts` solo cambia `tarjeta-nfc.photo` |

## Revisión con contexto fresco

Un revisor sin contexto del loop miró la home completa en producción a 375 y 1440, bajó los
originales y respondió las dos preguntas del prompt:

- **¿Alguna imagen promete algo que el plan no da?** Ninguna muestra carrito, pedidos, panel ni
  estadísticas, y no hay euros (92 "₡" en el HTML, ningún "€"). Señaló roces, ninguno bloqueante:
  el hero junta el stand y la tarjeta con "Desde ₡14 900/mes" (el hardware se cobra aparte y eso
  se dice más abajo); las cinco estrellas doradas del stand de reseñas rozan la regla de no
  prometer "más estrellas"; el render del stand QR 3D no muestra el "relieve" ni el logo que
  promete su texto.
- **¿Alguna parece foto real sin serlo?** Todos los renders de producto llevan la etiqueta. El
  fondo del cierre es un render sin etiqueta, decorativo y oscurecido: cumple la regla, pero a
  1440 el QR se reconoce a la derecha del botón.
- Dijo que los QR "probablemente no escanean" porque no tenía lector: **sí escanean**, los seis
  (puerta C).

Hallazgos fuera de este loop que dejó a la vista: las fotos de Unsplash de la demo no
corresponden a sus platillos (el "casado" es una ensalada, la "limonada" son cócteles) y a 13 px
el "₡" del teléfono de la demo se lee como "€". Quedan en PENDIENTES.

## Tropiezos

1. **Un commit salió incompleto** (`d5013ba`): el `git add` falló al nombrar un archivo ya
   borrado y el commit tomó solo el borrado de `banner.png`. Producción sirvió ~20 s un hero que
   pedía `/banner.png`; `03e47c1` lo completó. Desde ahí, `git show --stat HEAD` antes de cada push.
2. **El caché local de `next/image` mintió.** Se indexa por URL y no por contenido, y `next build`
   no lo limpia: tras reemplazar los stands con el mismo nombre, local seguía sirviendo los QR
   falsos. Anotado en `CLAUDE.md` (Trampas conocidas). Producción no tiene el problema.
3. **`object-position` solo no alcanzaba en el cierre.** A 1440 el render se escala por el ancho y
   no hay holgura: el stand quedaba detrás del texto. Se estiró la capa a la derecha.

## PENDIENTES-STEVEN

- Fotos reales de los stands impresos → `public/hardware/<código>.webp` (reemplazan la etiqueta).
- Imprimir el stand de muestra con `/q/demo26` y escanearlo con un teléfono.
- IVA y factura 4.4; confirmar propuestas D-034–D-038, D-047, D-048.
- Decidir si `icono-main.png` (782 KB, favicon sin optimizar) se reexporta a 512 px.
- Confirmar que el logo del local ficticio de la demo ("Verde Limón") puede seguir.
- **Nuevos de la revisión:** cambiar las fotos de Unsplash de la demo por otras que correspondan
  a cada platillo; decidir si el stand de reseñas pierde las cinco estrellas; revisar el "₡" a
  13 px en el teléfono de la demo; decidir si el fondo del cierre se oscurece más o se recorta
  para que el QR no se reconozca.
