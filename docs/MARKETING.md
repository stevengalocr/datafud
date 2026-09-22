# DataFud — Línea de venta y marketing

> La biblia comercial del producto. Define **qué vendemos, a quién, con qué mensajes y a
> qué precio**. La landing (`/`, `src/app/page.tsx` + `src/components/marketing/v2/`) debe
> ser 100% congruente con este documento. Contexto de producto en
> [`PRODUCT.md`](./PRODUCT.md).

---

## 1. Propuesta de valor (una frase)

> **Tu carta digital con QR, lista en 48 horas.** Para sodas, cafeterías y restaurantes de
> Costa Rica: te la montamos nosotros con tu marca, en español e inglés, y tus comensales la
> abren con un QR o una tarjeta NFC en la mesa. Pedidos y panel, con el sistema completo
> (15 días). "Abre apetito" puede usarse como frase secundaria de marca; "cierra ventas" salió
> de todo el sitio (D-021, D-026).

> **Etapa actual (2026-09-19, decisión D-010): landing primero.** No hay backend en
> producción; la landing vende la carta digital, el hardware de mesa (QR impreso en 3D, NFC,
> stand de reseñas) y la implementación llave en mano. Conversión por **WhatsApp** y
> formulario de contacto. No se promete nada que no se pueda entregar en el plazo.

## 2. Posicionamiento

- **Categoría:** menú digital QR + comandas + analíticas para gastronomía.
- **Mercado:** Latinoamérica (origen Costa Rica). Hecho para sodas, cafeterías y
  restaurantes locales — no un template SaaS genérico importado.
- **Personalidad de marca:** cálida · artesanal · premium con confianza. Se siente como una
  marca gastronómica editorial, no como software corporativo frío.
- **Diferenciador estético:** dirección *Editorial Culinary* — serif editorial, neutros
  crema tibios, fotografía apetitosa, y el motivo de marca "D de píxeles QR + tenedor".
  Huye del look indigo/glassmorphism de la mayoría del SaaS.

## 3. Público objetivo (a quién le vendemos)

**Comprador / decisor:** dueño o encargado de soda, cafetería o restaurante independiente
en Latam. Quiere modernizar el servicio, reducir costos de carta impresa y entender sus
ventas, sin volverse un experto en tecnología.

**Usuario final (no compra, pero define el producto):** el comensal — con hambre, en la
mesa, desde su teléfono, a veces turista. Necesita que sea **rápido, claro y apetitoso**.

**Motivadores de compra:** ahorro (no reimprimir cartas), imagen moderna, rapidez de
servicio, datos del negocio, atención a clientes extranjeros.

## 4. Mensajes clave (pilares de la landing)

1. **Pide desde la mesa, sin fricción.** QR o NFC → carta al instante, sin apps ni cuentas.
2. **Control total desde un panel.** Platos, comandas y reportes en un solo lugar.
3. **Listo para Latam.** 3 idiomas (ES·EN·PT) y monedas de toda la región.
4. **Carta lista en 48 horas; sistema completo en 15 días.** Implementación llave en mano, sin curva técnica.
5. **A tu marca.** Colores, logo y fotos de tus platillos.

## 5. Estructura de la landing (embudo AIDA)

| Sección | Objetivo | Copy ancla |
|---|---|---|
| **Hero** | Enganchar + CTA | "Tu carta digital con QR, *lista en 48 horas*" · CTA "Quiero mi carta" (WhatsApp) / "Ver la demo" · "Desde ₡14 900/mes · Te la montamos nosotros · Cambios por WhatsApp" |
| **Barra de highlights** | Prueba rápida de valor | Carta lista en 48 h · Sistema completo en 15 días · 3 idiomas · monedas Latam |
| **Cómo funciona** | Educar (4 pasos) | Nosotros montamos tu carta → QR y NFC en tus mesas → Recibís los pedidos → Medís tu negocio |
| **El sistema** | Mostrar las 2 caras | Servicio al comensal + Operación del negocio |
| **Planes y precios** | Convertir | Implementación única + 3 planes (con su plazo) + add-on NFC |
| **Contacto** | Capturar | WhatsApp + correo + formulario (solo con `RESEND_API_KEY`) |
| **Cierre (CTA + footer)** | Última conversión | "Llevá la carta de tu local al siguiente nivel" · "Hablemos por WhatsApp" |

## 6. Oferta y precios (línea de venta canónica)

> Fuente única: `PRICING` en `src/lib/constants.ts` (D-023 a D-025, 2026-09-22). **Colones
> primero** con formato es-CR ("₡14 900", sin decimales); USD como referencia ("≈ US$29").

### Planes mensuales

| | Carta (Básico) | Estándar ⭐ | Empresarial |
|---|---|---|---|
| Mensualidad | **₡14 900** (≈ US$29) | **₡24 900** (≈ US$49) | **₡49 900** (≈ US$99) |
| Implementación (pago único) | ₡24 900 (≈ US$49) | ₡125 000 (≈ US$249) | ₡125 000 (≈ US$249) |
| Primer pago | ₡39 800 | ₡149 900 | ₡174 900 |
| Qué es | Carta digital por QR/NFC, sin pedidos en mesa | Carta + pedidos desde la mesa + panel | Todo, sin límites de platillos, categorías ni mesas |
| Entrega | **48 horas** | **15 días** | **15 días** |
| Idiomas | Español e inglés | Español e inglés | Español, inglés y portugués |
| Platillos | Hasta 60 | Hasta 150 | Ilimitados |
| Pedidos desde la mesa | — | ✓ | ✓ |
| Reportes | — | Panel de comandas + reportes de venta | Ventas por día, ticket promedio y platillos más vendidos |

⭐ **Estándar** es el plan destacado ("Recomendado").

- **Todos los planes:** te la montamos nosotros; cambios de precios y platillos por WhatsApp
  incluidos; soporte por WhatsApp incluido mientras tengás el plan activo.
- **Pago anual de la Carta:** ₡149 000/año (≈ US$290), 2 meses gratis, implementación incluida.
- **Oferta de fundadores** (`founderOffer.enabled`): "Primeros 10 locales: implementación de la
  Carta sin costo y 1 stand QR 3D incluido, a cambio de dejarnos mostrar tu local como caso."
- **Garantía de 48 h** (único uso permitido de la idea de garantía): "Si tu carta no está
  publicada en 48 horas hábiles desde que recibimos menú, fotos y logo, no pagás la implementación."
- **Permanencia:** sin contrato; se cancela con aviso de 15 días por WhatsApp o correo.
- **Pagos:** SINPE Móvil o transferencia. Implementación al aprobar la propuesta; mensualidad por
  adelantado. Comprobante de cada pago; factura electrónica se coordina si se avisa antes.

### Hardware de mesa (add-ons, D-013) — fuente: `PRICING.hardware`

| Producto | Precio publicado | Referencia |
|---|---|---|
| Stand QR impreso en 3D | desde ₡6 000 / unidad | US$12 |
| Tarjeta NFC | ₡7 500 / unidad | US$15 |
| Stand QR 3D + NFC | desde ₡10 000 / unidad | US$20 |
| Stand de reseñas de Google (QR + NFC) | desde ₡10 000 / unidad | US$20 |

Sin pedido mínimo (desde 1 unidad). Entrega gratis en la GAM, en persona; fuera de la GAM,
Correos de Costa Rica con el costo de la tarifa. Plazo: de 3 a 5 días hábiles desde que se aprueba
el diseño. Mensaje fijo: **"Todo es 100 % personalizable: forma, colores, tamaño y tu logo en
relieve. Cotizá tu diseño por WhatsApp."** El stand de reseñas se describe por lo que hace, nunca
por resultados.

> En esta etapa **no hay prueba de autoservicio**: la prueba es la demo (`/preview`) y una demo
> guiada por WhatsApp.

## 7. Diferenciadores frente a alternativas

- **vs. carta impresa / PDF:** editable al instante, multi-idioma, con datos de venta.
- **vs. apps de delivery:** el comensal pide en mesa, el negocio no paga comisión por orden.
- **vs. SaaS genérico de menús:** diseño editorial premium a la marca, hecho para Latam
  (monedas locales, español nativo, soporte por WhatsApp), implementación llave en mano.

## 8. Manejo de objeciones

| Objeción | Respuesta comercial |
|---|---|
| "Es complicado / no soy técnico" | Te la montamos nosotros: carta en 48 h y sistema en 15 días |
| "¿Y si no me sirve?" | Demo en vivo gratis y sin contratos atados: si un mes no le sirve, lo deja |
| "Mis clientes no sabrán usarlo" | Solo escanear o tocar — sin apps ni cuentas |
| "Ya tengo carta" | La digital se actualiza sola, te da datos y no se reimprime |
| "Tengo clientes extranjeros" | Carta en ES/EN/PT automáticamente |

## 9. Tono y voz

- **Idioma:** español de Latam, cercano pero profesional. Inglés/portugués en el producto,
  no necesariamente en el marketing.
- **Voz:** cálida, apetitosa, segura. Verbos de acción. Frases cortas.
- **Léxico de marca:** "comensal", "carta", "soda", "llave en mano", "en tu marca".
- **Evitar:** jerga corporativa fría, promesas vagas, anglicismos innecesarios y **promesas de
  resultado** ("más ventas", "más estrellas", "llená tus mesas"): la landing describe lo que
  el producto hace, no lo que va a lograr.
- **Reglas visuales (de `.impeccable.md`):** sin emojis como iconos (solo SVG), sin texto
  con degradado, sin glassmorphism, fotografía de comida real, oro como acento del 10%.

## 10. CTAs y conversión

- **CTA primario:** "Hablemos por WhatsApp" → `wa.me` con mensaje prellenado según el origen
  (`src/lib/site.ts`, `waProps`). Botón flotante en móvil.
- **CTA secundario:** "Ver demo en vivo" → `/preview` (demo navegable sin backend).
- **Alternativa:** formulario en `#contacto` (Resend; solo se muestra con `RESEND_API_KEY`).
- **Microcopy de confianza:** "Desde ₡14 900/mes · Te la montamos nosotros · Cambios por WhatsApp".
- **Embudo:** Landing → WhatsApp o formulario → llamada y plan elegido → implementación
  (carta en 48 h; sistema completo en 15 días) → cliente activo (mensualidad). `/register`
  redirige a `/#contacto`.

## 11. Identidad

- **Producto:** DataFud · **dominio:** datafud.com · **fabricante:** GaloDev.
- **Tagline:** "QR Menus. Orders. Analytics."
- **Cierre de marca:** "© DATAFUD · UN PRODUCTO DE GALODEV · HECHO EN LATINOAMÉRICA".

> Si cambias un precio o límite aquí, actualízalo también en la landing
> (`pricing-v2.tsx`), en `src/lib/constants.ts` (`PRICING`) y en `supabase/schema.sql`.
> Ver [`PRODUCT.md` §8](./PRODUCT.md#8-planes-y-precios-fuente-de-verdad-la-landing).
