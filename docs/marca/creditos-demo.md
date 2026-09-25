# Créditos de las fotos de la demo (D-053)

Las fotos de la carta de muestra (`/c/ejemplo`, `/preview/*` y el teléfono de `#demo` en la
home) son fotos **reales**, con licencia libre, y cada una muestra el platillo que nombra. Se
descargaron una vez, se optimizaron con `scripts/carta-fotos.mjs` (el mismo camino que una carta
real) y se sirven desde `public/demo/`. La demo no pide nada a Unsplash ni a Pexels.

Ninguna es generada por IA (D-049). Donde la foto no calzaba con la descripción que tenía el
platillo, se ajustó la **descripción** a lo que la foto muestra, nunca al revés.

- **Unsplash License** — uso comercial libre, sin atribución obligatoria:
  <https://unsplash.com/license>. Ninguna de estas es de Unsplash+.
- **Pexels License** — uso comercial libre, sin atribución obligatoria:
  <https://www.pexels.com/license/>.

La atribución no es obligatoria, pero se guarda acá para poder rastrear cada foto.

| Archivo | Platillo | Autor | Fuente | Licencia |
|---|---|---|---|---|
| `demo/platos/p-gallo.webp` | Gallo Pinto con maduro | Jonathan Caliguire | <https://unsplash.com/photos/Ycuvvz_Px8c> (recorte cuadrado del plato) | Unsplash |
| `demo/platos/p-panqueques.webp` | Panqueques con miel | Dad hotel | <https://unsplash.com/photos/dQTMhuR4vB4> | Unsplash |
| `demo/platos/p-frutas.webp` | Plato de Frutas | Brenda Godinez | <https://unsplash.com/photos/_Zn_7FzoL1w> | Unsplash |
| `demo/platos/p-casado.webp` | Casado con carne mechada | Nano Erdozain | <https://www.pexels.com/photo/29450679/> | Pexels |
| `demo/platos/p-lomito.webp` | Lomito en salsa | Alex Munsell | <https://unsplash.com/photos/auIbTAcSH6E> | Unsplash |
| `demo/platos/p-bowl.webp` | Bowl Tropical | Anh Nguyen | <https://unsplash.com/photos/kcA-c3f_3FE> | Unsplash |
| `demo/platos/p-hamburguesa.webp` | Hamburguesa de pollo | sk (@rollelflex_graphy726) | <https://unsplash.com/photos/uVPV_nV17Tw> | Unsplash |
| `demo/platos/p-pizza.webp` | Pizza Artesanal | Chad Montano | <https://unsplash.com/photos/MqT0asuoIcU> | Unsplash |
| `demo/platos/p-fresco.webp` | Fresco Natural de Naranja | Abhishek Hajare | <https://unsplash.com/photos/kkrXVKK-jhg> | Unsplash |
| `demo/platos/p-limonada.webp` | Limonada de la casa | Juliet Frías | <https://unsplash.com/photos/WDgN0XclV_w> | Unsplash |
| `demo/platos/p-cafehelado.webp` | Café Helado | Demi DeHerrera | <https://unsplash.com/photos/L-sm1B4L1Ns> | Unsplash |
| `demo/platos/p-cafe.webp` | Café Chorreado | Magali Guimarães | <https://www.pexels.com/photo/6307233/> | Pexels |
| `demo/platos/p-brownie.webp` | Brownie con helado | Kobby Mendez | <https://unsplash.com/photos/idTwDKt2j2o> | Unsplash |
| `demo/platos/p-queque.webp` | Queque de frutos rojos | Anna Tukhfatullina | <https://unsplash.com/photos/Mzy-OjtCI70> | Unsplash |
| `demo/portada.webp` | Portada del local de la demo | new perspectives | <https://www.pexels.com/photo/37347242/> (recorte horizontal de la mesa) | Pexels |

## Notas de honestidad

- **Gallo pinto, casado y café** se eligieron para que se vean ticos: gallo pinto con los
  frijoles negros bien visibles, plátano maduro, aguacate, pico de gallo y tortilla; arroz y frijoles negros con carne mechada y plátano maduro; café colado en bolsita de
  tela, que es como se cuela en un chorreador. La foto del casado está publicada en Pexels como
  plato latinoamericano (rice, beans, plantains, shredded beef): muestra exactamente un casado de
  carne mechada, que es como quedó nombrado en la demo.
- **Nombres y descripciones ajustados a la foto:** gallo pinto "con maduro" (plátano maduro,
  aguacate, pico de gallo y tortilla), panqueques (miel, banano y fresas), frutas (sin granola),
  casado "con carne mechada" (sin ensalada ni picadillo, que no salen en la foto), lomito (sin
  puré), bowl (pollo a la plancha, sin palmito), hamburguesa "de pollo" (la foto es de pollo
  empanizado, no de carne smash) y pizza (pollo, piña y cebolla morada, que es lo que tiene).
- **Revisión a 96 px.** Un revisor sin contexto miró la carta en el teléfono: el primer gallo
  pinto elegido (un desayuno con huevos) no se leía como gallo pinto al tamaño real de la
  miniatura, así que pasó a portada y el gallo pinto usa la foto tica.
- La portada anterior (una terraza frente al mar) no correspondía a una soda de barrio: se
  reemplazó por la foto de una mesa de desayuno con gallo pinto, huevos y café.
- Fotos quitadas en 1.4.0 por mostrar otro plato: el "gallo pinto" era un guiso de pollo, el
  "casado" una ensalada y la "limonada" tres cócteles; los panqueques llevaban una mano (D-049).
