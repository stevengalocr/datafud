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
>
> **Canal único (D-039):** el único contacto público es WhatsApp, +506 7287 4779. Ningún correo
> se muestra en ninguna página, ni en JSON-LD, ni en enlaces `mailto:`. El correo existe solo
> como destino interno del formulario (`SITE.leadsEmail`).
>
> **Voz de empresa (D-041):** DataFud habla como empresa costarricense, en plural. Fuera
> "proyecto chico", la firma del fundador y "un producto de GaloDev". Eso no autoriza a inventar
> sociedad, cédula jurídica, equipo ni dirección: los legales siguen nombrando al responsable
> legal real.

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

1. **La carta en el celular, sin fricción.** QR o NFC → carta al instante, sin apps ni cuentas (pedidos en mesa con el sistema completo).
2. **Control total desde un panel.** Platos, comandas y reportes en un solo lugar.
3. **Bilingüe.** Español e inglés en todos los planes; portugués en Empresarial.
4. **Carta lista en 48 horas hábiles; sistema completo en 15 días hábiles.** Implementación llave en mano, sin curva técnica.
5. **A tu marca.** Colores, logo y fotos de tus platillos.

## 5. Estructura de la landing (embudo AIDA)

| Sección | Objetivo | Copy ancla |
|---|---|---|
| **Hero** | Enganchar + CTA | "Tu carta digital con QR, *lista en 48 horas*" (el gancho se queda, D-061) · "Quiero mi carta" / "Ver la demo" · "Desde ₡14 900/mes · Garantía: carta en 48 horas hábiles" |
| **Cómo funciona** (`#como-funciona`) | Educar con plazos | Línea de tiempo Día 0 → Plazo de la Carta → de 3 a 5 días hábiles (stands) → Día 15 + "Lo que hacemos nosotros" / "Lo que ponés vos" |
| **Demo** (`#demo`) | Probar sin hablar con nadie | "Probalo vos mismo" · QR real desde tablet |
| **Planes y precios** (`#planes`) | Convertir | CRC primero, implementación y primer pago por plan, garantía, fundadores |
| **Hardware** (`#hardware`) | Vender lo que va en la mesa | Precios en colones, sin mínimo, entrega GAM/Correos |
| **Por qué DataFud** (`#confianza`) | Confianza verificable | 4 puntos + tarjeta "Atención DataFud" con el WhatsApp |
| **Preguntas** (`#preguntas`) | Resolver objeciones | 18 preguntas de Costa Rica (IVA, inicio de la mensualidad, "hábiles" y pago del hardware desde 1.4.0) |
| **Contacto + cierre** | Capturar | WhatsApp (canal único) + formulario (solo con `RESEND_API_KEY`) |

Regla de repetición (V08): "48" y "15 días" aparecen como máximo 3 veces cada uno en el texto
visible de `/` (hero, planes y FAQ); la línea de tiempo no repite el plazo de la carta ("Plazo de la Carta").

## 6. Oferta y precios (línea de venta canónica)

> Fuente única: `PRICING` en `src/lib/constants.ts` (D-023 a D-025, 2026-09-22). **Colones
> primero** con formato es-CR ("₡14 900", sin decimales); USD como referencia ("≈ US$29").

### Planes mensuales

| | Carta (Básico) | Estándar ⭐ | Empresarial |
|---|---|---|---|
| Mensualidad | **₡14 900** (≈ US$29) | **₡24 900** (≈ US$49) | **₡49 900** (≈ US$99) |
| Implementación (pago único) | ₡24 900 (≈ US$49) | ₡125 000 (≈ US$249) | ₡125 000 (≈ US$249) |
| Primer pago | ₡39 800 | ₡149 900 | ₡174 900 |
| Categorías / mesas con QR | 5 / 8 | 20 / 30 | Sin límite |
| Qué es | Carta digital por QR/NFC, sin pedidos en mesa | Carta + pedidos desde la mesa + panel | Todo, sin límites de platillos, categorías ni mesas |
| Entrega | **48 horas hábiles** | **15 días hábiles** | **15 días hábiles** |
| Idiomas | Español e inglés | Español e inglés | Español, inglés y portugués |
| Platillos | Hasta 60 | Hasta 150 | Ilimitados |
| Pedidos desde la mesa | — | ✓ | ✓ |
| Reportes | — | Panel de comandas + ventas por día, ticket promedio y más vendidos | Todo lo de Estándar |

⭐ **Estándar** es el plan destacado ("Recomendado").

- **Todos los planes:** te la montamos nosotros; cambios de precios y platillos por WhatsApp
  incluidos; soporte por WhatsApp incluido mientras tengás el plan activo.
- **Pago anual de la Carta:** ₡149 000/año (≈ US$290), 2 meses gratis, implementación incluida.
- **Oferta de fundadores** (`founderOffer.enabled`), en cualquier plan (D-057): en la Carta,
  implementación sin costo; en Estándar o Empresarial, ₡24 900 menos en la implementación del
  sistema; en los dos casos 1 stand QR 3D, a cambio de dejarnos mostrar el local como caso.
- **Garantía de 48 h** (único uso permitido de la idea de garantía): "Si tu carta no está
  publicada en 48 horas hábiles desde que recibimos menú, fotos y logo, no pagás la implementación."
- **Permanencia:** sin contrato; se cancela con aviso de 15 días por WhatsApp.
- **Pagos:** SINPE Móvil o transferencia. Implementación al aprobar la propuesta; mensualidad por
  adelantado, desde el día que la carta queda publicada (D-035). Precios finales, IVA incluido
  (D-047). Comprobante de cada pago; la factura electrónica no se promete en la web ni en la venta
  hasta que Steven la confirme.

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

### Prueba social real (V05)

- **Fundador:** `SITE.founder` en `src/lib/site.ts`. Si existe `public/equipo/steven.webp`, la
  sección "Por qué DataFud" usa esa foto; si no, un avatar con "SG". Se decide en el build: subir la
  foto y redesplegar.
- **Fotos del hardware:** `public/hardware/<código>.webp` con los códigos de `PRICING.hardware`
  (`stand-qr-3d`, `tarjeta-nfc`, `stand-qr-3d-nfc`, `stand-resenas`). Mientras no existan, se muestran
  los renders con la etiqueta visible **"Render ilustrativo"**.
- **Imágenes de la web (D-049 a D-051):** ninguna muestra texto, precios, monedas, marcas
  inventadas, personas ni comida generada. Todo render de IA lleva la etiqueta "Render
  ilustrativo" (también el del hero, `public/renders/ambiente-mesa.webp`) y todo QR dibujado en
  una imagen decodifica a `https://datafud.com/q/demo26`: un QR inventado por la IA se reemplaza o
  no se publica. Los renders viven en `public/renders/`, nunca en `public/hardware/`.
- **Redes:** `SITE.social` (instagram, facebook, tiktok) vacías; el footer muestra solo las que tengan
  una URL `https://`.
- **Cómo cargar un testimonio** (`TESTIMONIALS` en `src/lib/constants.ts`, hoy vacío = la sección no
  aparece): solo de un local que ya usa DataFud, con **permiso por escrito** (un WhatsApp que
  diga que acepta que se publique). Campos: nombre del local, persona (nombre y rol), ciudad, la cita
  textual tal como la dijo (sin retocar el sentido) y, opcional, una **foto propia** del local o del
  stand en su mesa en `public/clientes/`. Nunca stock, nunca inventado, nunca cifras que no se
  puedan mostrar. Guardar el permiso fuera del repo.
- **Fotos de stock** (Unsplash o Pexels, alojadas en `public/demo/`, D-053): solo la demo; sus `alt` dicen "Foto ilustrativa" y nunca se
  presentan como clientes.

## 7. Diferenciadores frente a alternativas

- **vs. carta impresa / PDF:** se lee bien en el celular, bilingüe y se actualiza sin reimprimir (reportes de venta con el sistema completo).
- **vs. apps de delivery:** el comensal pide en mesa, el negocio no paga comisión por orden.
- **vs. SaaS genérico de menús:** diseño editorial premium a la marca, hecho para Latam
  (monedas locales, español nativo, soporte por WhatsApp), implementación llave en mano.

## 8. Manejo de objeciones

| Objeción | Respuesta comercial |
|---|---|
| "Es complicado / no soy técnico" | Te la montamos nosotros: carta en 48 horas hábiles y sistema en 15 días hábiles (D-048) |
| "¿Y si no me sirve?" | Demo sin hablar con nadie y sin permanencia: cancelás con 15 días de aviso |
| "Mis clientes no sabrán usarlo" | Solo escanear o tocar — sin apps ni cuentas |
| "Ya tengo carta" | La digital se lee mejor en el celular y los cambios no requieren reimprimir; con el sistema completo, además, reportes de venta |
| "Tengo clientes extranjeros" | Carta en español e inglés en todos los planes (la traducción la hacemos nosotros); portugués en Empresarial |
| "¿Eso lleva IVA?" | No, ya está incluido: precios finales en colones, IVA incluido (D-047) |
| "¿Cuándo empiezo a pagar?" | La mensualidad arranca el día que la carta queda publicada (D-035) |

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
- **CTA secundario:** "Ver la demo" → `/preview/carta` (demo del plan Carta, sin backend y sin
  carrito). La versión con pedidos en mesa queda de segunda, en `/preview/cliente`.
- **Alternativa:** formulario en `#contacto` (Resend; solo se muestra con `RESEND_API_KEY`).
- **Microcopy de confianza:** "Desde ₡14 900/mes · Te la montamos nosotros · Cambios por WhatsApp".
- **Embudo:** Landing → WhatsApp o formulario → llamada y plan elegido → implementación
  (carta en 48 h; sistema completo en 15 días) → cliente activo (mensualidad). `/register`
  redirige a `/#contacto`.

## 11. Identidad

- **Producto:** DataFud · **dominio:** datafud.com · **titular legal:** ver `SITE.legalResponsible`
  (solo aparece en términos y privacidad; la cara pública habla como DataFud).
- **Tagline:** "QR Menus. Orders. Analytics."
- **Cierre de marca:** "© DATAFUD · UN PRODUCTO DE GALODEV · HECHO EN COSTA RICA".

> Si cambias un precio o límite aquí, actualízalo también en la landing
> (`pricing-v2.tsx`), en `src/lib/constants.ts` (`PRICING`) y en `supabase/schema.sql`.
> Ver [`PRODUCT.md` §8](./PRODUCT.md#8-planes-y-precios-fuente-de-verdad-la-landing).
