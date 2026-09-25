# Informe del loop — Pulido para salir a vender (2026-09-25)

> Séptimo bucle autónomo sobre `main`, de `6b3c231` (1.3.1) a la versión **1.4.0**.
> Estado detallado: `docs/plans/pulido-loop-state.md`. Puente al vault:
> `docs/vault-sync/2026-09-25-pulido.md`. Prompt maestro: `LOOP-Pulido-Salida-Datafud.md` (v1).

## Resumen

La demo y la web quedan listas para mandarle el enlace a un prospecto: cada foto de la carta de
ejemplo muestra el platillo que nombra, "₡" se ve igual en todos los teléfonos, los íconos pesan
lo que tienen que pesar, el optimizador de imágenes dejó de ser un proxy abierto, las condiciones
comerciales cerradas están publicadas y el cierre ya no tiene un QR que compita con WhatsApp.

Además apareció algo que el prompt no sabía: **las fuentes de marca no pintaban en ninguna
página**, tampoco en producción (un `:root` de `globals.css` pisaba a `next/font`). Desde 1.4.0 la
web se ve en Young Serif y Hanken Grotesk, como dice `docs/BRAND.md`.

| Qué | Antes (1.3.1) | Ahora (1.4.0) |
|---|---|---|
| Fotos de la demo | 3 de 13 mostraban otro plato (el gallo pinto era un guiso de pollo, el casado una ensalada, la limonada tres cócteles), 1 llevaba una mano, el café no tenía foto | 14 de 14 muestran su platillo; alojadas en `public/demo/platos/`; créditos en `docs/marca/creditos-demo.md` |
| Requests de `/c/ejemplo` a otros hosts | 13 a `images.unsplash.com` | 0 |
| Peso de `/c/ejemplo` al abrir (390×844, DPR 3) | 1,02 MB | 1,41 MB (límite 2 MB, D-043) |
| `/_next/image?url=https://example.com/x.jpg` | 404 (intentaba bajarla: proxy abierto) | 400 |
| Tipografía | Georgia y la fuente del sistema | Young Serif y Hanken Grotesk |
| "₡" | Lo dibujaba la fuente de cada sistema (Times New Roman, Arial, Roboto…) | Subfuente de Inter con solo U+20A1 (< 1 KB por peso), también en la imagen OG |
| Favicon | `icono-main.png` de 782 KB | `favicon.ico` 6,5 KB + `icon.png` 15,8 KB + `apple-icon.png` 2 KB |
| `logo-main.png` · `icono-main.png` | 840 KB · 782 KB | 43 KB · 28 KB (mismo nombre y tamaño) |
| IVA, "hábiles", mensualidad, hardware, Carta → sistema, fundadores, garantía | Propuestas sin publicar | Cerradas y publicadas: línea bajo los planes, FAQ de 18 preguntas y términos 1.1 |
| Cierre | El panel del stand con su QR se veía junto al botón de WhatsApp | Recorte del render sin el panel: 0 QR decodificables a 5 anchos |
| Tareas sueltas | `sharp` implícito, kit sin Chromium de respaldo, nombre viejo en `package.json`, sin enlace de salto, `/preview/dashboard` sin `<main>` y con textos bajo AA | Todas cerradas |

## Unidades

| ID | Título | Estado | Commit | Despliegue |
|---|---|---|---|---|
| P01 | Estado y línea base | hecho | `3508adb` | READY `dpl_5VhKxyoA…` |
| P02 | Fotos de la demo (D-053, D-054) | hecho | `17e13cd` | READY `dpl_6GGEDs9i…` |
| P03 | El colón se ve como colón (D-052) | hecho | `bcef43e` + `f8e7c6d` | READY `dpl_26hqvz7L…` |
| P04 | Íconos y logo livianos | hecho | `84458e1` | READY `dpl_DnUoYnBR…` |
| P05 | Decisiones comerciales en la web y los documentos | hecho | `fd1049b` | READY `dpl_Hxwq5Yzr…` |
| P06 | Cierre sin QR que compita (D-056) y stand de reseñas (D-055) | hecho | `e78de53` | READY `dpl_GHrsBy6f…` |
| P07 | Tareas sueltas | hecho | `2e47417` | READY `dpl_Cd6gqUvd…` |
| P08 | Verificación final, release 1.4.0 y puente | hecho | ver estado | ver estado |

Iteraciones: 8 de 14. Ninguna unidad bloqueada.

## Fotos de la demo (1.4.0)

| # | Platillo | Foto | ¿Corresponde? |
|---|---|---|---|
| 1 | Gallo Pinto con maduro | Unsplash `Ycuvvz_Px8c`: gallo pinto con frijoles negros, maduro, aguacate, pico de gallo, tortilla | Sí |
| 2 | Panqueques con miel | Unsplash `dQTMhuR4vB4`: torre con cuchara de miel, fresas y banano; sin manos | Sí |
| 3 | Plato de Frutas | Unsplash `_Zn_7FzoL1w` | Sí |
| 4 | Casado con carne mechada | Pexels 29450679: arroz, frijoles negros, carne mechada, maduro | Sí |
| 5 | Lomito en salsa | Unsplash `auIbTAcSH6E` | Sí |
| 6 | Bowl Tropical | Unsplash `kcA-c3f_3FE`: pollo a la plancha, vegetales, maíz, huevo | Sí |
| 7 | Hamburguesa de pollo | Unsplash `uVPV_nV17Tw`: pollo empanizado con papas | Sí |
| 8 | Pizza Artesanal | Unsplash `MqT0asuoIcU`: pollo, piña, cebolla morada | Sí |
| 9 | Fresco Natural de Naranja | Unsplash `kkrXVKK-jhg` | Sí |
| 10 | Limonada de la casa | Unsplash `WDgN0XclV_w`: limonada con hierbabuena | Sí |
| 11 | Café Helado | Unsplash `L-sm1B4L1Ns` | Sí |
| 12 | Café Chorreado | Pexels 6307233: café colado en bolsita de tela | Sí (antes sin foto) |
| 13 | Brownie con helado | Unsplash `idTwDKt2j2o` | Sí |
| 14 | Queque de frutos rojos | Unsplash `Mzy-OjtCI70` | Sí |
| — | Portada | Pexels 37347242: mesa de desayuno con gallo pinto, huevos y café | Sí |

Donde una foto no calzaba con la descripción, se cambió la descripción (y en tres casos el
nombre: gallo pinto "con maduro", casado "con carne mechada", hamburguesa "de pollo"), nunca al
revés. Ninguna foto es generada.

## Revisores sin contexto

- **P05 (texto comercial contra las decisiones):** encontró tres frases que agregaban reglas no
  decididas (quitadas) y dos confusas (aclaradas). Cuatro preguntas necesitan decisión de Steven.
- **P08 (dueño de soda, capturas a 375 y 1440):** marcó que el gallo pinto no se leía como gallo
  pinto a 96 px y que tres descripciones no calzaban con su foto (hamburguesa, pizza, bowl): se
  corrigieron. También "Día 15" frente a "15 días hábiles" (ahora "Día hábil 15"), "¿Cómo pago?"
  (ahora separa implementación y mensualidad) y el "QR provisional" (ahora dice que es una hoja de
  QR con el mismo código de los stands). El resto queda en PENDIENTES-STEVEN.

## Puertas en producción

Ver el bloque de P08 en el estado: A–G en verde sobre el último despliegue.

## PENDIENTES-STEVEN

Ver `docs/plans/pulido-loop-state.md` (se copian ahí con cada unidad).
