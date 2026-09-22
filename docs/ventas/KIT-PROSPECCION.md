# Kit de prospección · DataFud (Costa Rica)

> Material para salir a vender la carta digital. Todo precio y plazo sale de `PRICING`
> (`src/lib/constants.ts`) y coincide con la landing, la FAQ y los términos al 2026-09-22.
> Si cambia la oferta, actualizá este archivo en el mismo commit. Voseo, sin prometer
> resultados, sin inventar clientes ni cifras.

## Datos de la oferta (para tener a mano)

| Concepto | Monto |
|---|---|
| Carta (sin pedidos en mesa) | ₡14 900/mes + ₡24 900 de implementación → primer pago ₡39 800 |
| Carta, pago anual | ₡149 000/año (2 meses gratis, implementación incluida) |
| Estándar (pedidos + panel) | ₡24 900/mes + ₡125 000 → primer pago ₡149 900 |
| Empresarial (sin límites, + portugués) | ₡49 900/mes + ₡125 000 → primer pago ₡174 900 |
| Stand QR 3D | desde ₡6 000 c/u |
| Tarjeta NFC | ₡7 500 c/u |
| Stand QR 3D + NFC / stand de reseñas | desde ₡10 000 c/u |

- Plazos: carta en 48 horas; sistema completo en 15 días; stands de 3 a 5 días hábiles desde que se aprueba el diseño.
- Garantía: si la carta no está publicada en 48 horas hábiles desde que recibimos menú, fotos y logo, no se paga la implementación.
- Fundadores (mientras `founderOffer.enabled`): primeros 10 locales, implementación de la Carta sin costo y 1 stand QR 3D incluido, a cambio de mostrar el local como caso.
- Pagos: SINPE Móvil o transferencia. Sin contrato de permanencia (15 días de aviso).
- Hardware: sin pedido mínimo; entrega gratis en la GAM; fuera, Correos de Costa Rica con el costo de la tarifa.

## Enlaces con UTM listos

Reemplazá `<zona>` por la zona o campaña, en minúsculas y sin tildes (ej. `heredia-centro`,
`tamarindo`, `sanpedro`). Así cada contacto queda medido en Vercel (y en Meta, si el píxel está activo).

| Canal | Enlace |
|---|---|
| WhatsApp (prospección) | `https://datafud.com/?utm_source=whatsapp&utm_medium=prospeccion&utm_campaign=<zona>` |
| WhatsApp, directo a la demo | `https://datafud.com/preview/cliente?utm_source=whatsapp&utm_medium=prospeccion&utm_campaign=<zona>` |
| Instagram (bio o historia) | `https://datafud.com/?utm_source=instagram&utm_medium=social&utm_campaign=<zona>` |
| Facebook (publicación o grupo) | `https://datafud.com/?utm_source=facebook&utm_medium=social&utm_campaign=<zona>` |
| Visita presencial (QR impreso en el stand de muestra) | `https://datafud.com/preview/cliente?utm_source=visita&utm_medium=stand-muestra&utm_campaign=<zona>` |
| Guía para sodas | `https://datafud.com/menu-digital-para-sodas?utm_source=whatsapp&utm_medium=prospeccion&utm_campaign=<zona>` |
| Guía para turísticos | `https://datafud.com/menu-qr-restaurantes-turisticos?utm_source=whatsapp&utm_medium=prospeccion&utm_campaign=<zona>` |

> Nota: la analítica guarda los UTM de la visita de entrada. Si una misma persona entra dos veces
> con enlaces distintos, vale el último.

## Primer contacto por WhatsApp (máximo 5 líneas)

**1 · Soda o cafetería**

> Hola, ¿qué tal? Soy Steven, de DataFud, acá en Costa Rica.
> Montamos cartas digitales con QR para sodas: la carta en el celular del cliente, en colones y con fotos.
> Cuando cambia un precio, nos escribís y lo actualizamos, sin reimprimir.
> Mirá cómo se ve una soda de ejemplo: https://datafud.com/preview/cliente?utm_source=whatsapp&utm_medium=prospeccion&utm_campaign=<zona>
> Desde ₡14 900 al mes. ¿Te interesa que te cuente más?

**2 · Restaurante turístico**

> Hola, soy Steven, de DataFud. Hacemos cartas digitales con QR en español e inglés para restaurantes con turistas.
> El cliente la abre en su teléfono y cambia de idioma con un toque; también podemos anotar alérgenos en cada platillo.
> Te la montamos nosotros y queda lista en 48 horas.
> Ejemplo: https://datafud.com/menu-qr-restaurantes-turisticos?utm_source=whatsapp&utm_medium=prospeccion&utm_campaign=<zona>
> ¿Te paso los precios?

**3 · Local con carta vieja o en PDF**

> Hola, soy Steven, de DataFud. Vi que la carta de ustedes está en PDF (o impresa) y quería mostrarles otra opción.
> Una carta digital que se lee bien en el celular, con fotos y categorías, y que se actualiza sin reimprimir.
> La montamos nosotros con su marca, y los cambios por WhatsApp están incluidos.
> Así se ve: https://datafud.com/preview/cliente?utm_source=whatsapp&utm_medium=prospeccion&utm_campaign=<zona>
> ¿Les interesa?

## Seguimientos

**Día 3**

> Hola, ¿pudiste ver la carta de ejemplo? Si querés, te armo una muestra con 3 o 4 platillos de tu
> menú para que veás cómo quedaría la tuya. Solo mandame una foto de la carta actual.

**Día 7**

> Hola de nuevo. Te cuento que tenemos cupos de fundadores: a los primeros 10 locales la
> implementación de la Carta les sale sin costo y les damos un stand QR 3D, a cambio de mostrar
> el local como caso. Si te sirve, te aparto uno.

(Usar el día 7 solo mientras la oferta de fundadores esté activa. Si no, reemplazar por: "Si en
algún momento querés actualizar la carta, acá estoy. Te dejo mi contacto guardado".)

**Cierre**

> Perfecto. Para arrancar necesito: el menú con precios (foto o PDF), fotos de los platillos que
> tengás y el logo. La implementación se paga por SINPE Móvil o transferencia al aprobar la
> propuesta, y en 48 horas hábiles desde que tengo todo, tu carta está publicada. Si no, no pagás
> la implementación. ¿Te mando la propuesta?

## Guion de 60 segundos (visita presencial, con el stand en la mano)

1. **(10 s) Presentación.** "Hola, soy Steven, de DataFud. Hacemos cartas digitales para locales de acá. ¿Tiene un minuto?"
2. **(15 s) Mostrar.** Poner el stand en la mesa: "Escanee este código con su celular." Dejar que lo abra (carta demo de Verde Limón).
3. **(15 s) Explicar.** "Así se vería su carta: con fotos, en colones, en español e inglés. Nosotros la montamos; usted solo nos pasa el menú y el logo. Si cambia un precio, me escribe y lo actualizo."
4. **(10 s) Precio.** "Desde ₡14 900 al mes, con ₡24 900 de implementación. Sin contrato de permanencia."
5. **(10 s) Siguiente paso.** "¿Le dejo mi WhatsApp y le mando una muestra con su propio menú?" Dejar tarjeta o escanear el QR de contacto.

(En visita, el trato es de "usted" hasta que la persona pase a "vos". En WhatsApp, voseo.)

## Respuestas a objeciones

- **"Hay gratis."** "Sí, hay opciones donde vos mismo armás la carta. Si tenés el tiempo, te sirven. Lo nuestro es que te la montamos nosotros, en español e inglés, con tus fotos y tu marca, y los cambios por WhatsApp están incluidos: no tenés que aprender nada."
- **"Ya tengo menú en PDF."** "El PDF se ve pequeño en el celular y cada cambio es volver a diseñarlo. La carta digital se lee cómoda, tiene categorías, fotos y cambio de idioma, y los precios se actualizan sin tocar el QR."
- **"¿Y la factura?"** "Recibís comprobante de cada pago. Si tu negocio necesita factura electrónica, avisame antes de contratar y lo coordinamos. Ojo: DataFud no reemplaza tu sistema de facturación, convive con el que ya usás."
- **"Está caro."** "El plan Carta es ₡14 900 al mes, y si pagás el año son ₡149 000 con dos meses gratis y la implementación incluida. Incluye el montaje, la traducción y los cambios. Si la carta no está publicada en 48 horas hábiles desde que tengo tu material, no pagás la implementación."
- **"Mis clientes no escanean."** "Para eso está la tarjeta NFC (₡7 500): el cliente acerca el teléfono y la carta se abre sola, sin cámara. También hay stand con QR y NFC juntos, desde ₡10 000."
- **"¿Y si no me gusta?"** "No hay contrato de permanencia: cancelás con 15 días de aviso. Y antes de decidir podés ver la carta demo desde tu celular."

## Qué no decir nunca

Promesas de resultado (sobre ventas, reseñas u ocupación del local), superlativos, comparaciones de
precio con la competencia, tiempos de respuesta del soporte, cifras de clientes o testimonios que no
existan. La lista completa de frases vetadas está en `docs/MARKETING.md` §9 y en la regla 10 de
`CLAUDE.md`. Si preguntan cuántos clientes tenemos, se responde con la verdad.

## Grep cruzado (verificación del 2026-09-22)

| Cifra en este kit | Fuente |
|---|---|
| ₡14 900 · ₡24 900 · ₡49 900 | `PRICING.plans.*.priceCrc` |
| ₡24 900 · ₡125 000 (implementación) | `PRICING.setupFee.carta.crc` / `.sistema.crc` |
| ₡39 800 · ₡149 900 · ₡174 900 | `firstPaymentFor()` (mismas cifras en la FAQ "¿Cuánto pago en total el primer mes?") |
| ₡149 000/año | `PRICING.annualCarta.crc` |
| ₡6 000 · ₡7 500 · ₡10 000 | `PRICING.hardware[*].priceCrc` |
| 48 horas · 15 días · 3 a 5 días hábiles · 15 días de aviso | `PRICING.delivery`, `hardwareDelivery.leadTime`, `terms.noticeDays` |
