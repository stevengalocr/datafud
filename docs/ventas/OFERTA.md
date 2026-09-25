# La oferta de DataFud · qué vendemos y qué entregamos (2026-09-25)

> Documento interno de venta. Todo número sale de `PRICING` (`src/lib/constants.ts`); si cambia
> un precio o un plazo, se cambia ahí y se actualiza este archivo en el mismo commit. Nada de lo
> que está acá puede prometer más de lo que la web promete: ver regla 10 de `CLAUDE.md`.
>
> §5 son las **decisiones comerciales cerradas** el 2026-09-25 (D-034 a D-038, D-047 y D-048), ya
> publicadas en la web (planes, FAQ y términos 1.1). Lo único que sigue abierto es la factura
> electrónica 4.4: no se promete hasta que Steven la confirme.

---

## 1. Quiénes somos y por dónde nos hablan

DataFud es una empresa costarricense que hace cartas digitales con QR y NFC para sodas,
cafeterías y restaurantes. Montamos la carta nosotros: el local manda el menú, las fotos y el
logo, y nosotros diseñamos, cargamos, traducimos y publicamos.

**Canal único: WhatsApp, +506 7287 4779 (D-039).** No publicamos ningún correo. El correo existe
solo como destino interno de los mensajes del formulario de la web. Si un prospecto pide correo,
se le dice que todo se maneja por WhatsApp: se responde más rápido y queda el historial.

**Cómo hablamos (D-041).** En plural y a nombre de la empresa: "le escribimos de DataFud",
"necesitamos", "te mandamos". En visita presencial la persona se presenta por su nombre y su
papel ("soy <nombre>, asesor de DataFud"). Nunca "proyecto chico", nunca firma personal.

Lo que sí somos, sin adornos: una empresa nueva, que atiende en Costa Rica y cobra en colones.
Si preguntan cuántos clientes tenemos, se responde con la verdad.

---

## 2. Qué recibe el cliente

### Plan Carta — ₡14 900 al mes + ₡24 900 de implementación (primer pago ₡39 800)

Es lo que se entrega **en 48 horas hábiles** y lo que se vende primero. Incluye:

- Carta digital en su propia dirección web, con el nombre, el logo y los colores del local.
- Hasta **60 platillos**, **5 categorías** y **8 mesas** con QR.
- **Español e inglés**, con cambio de idioma de un toque desde el teléfono del comensal.
- Fotos de los platillos y precios en colones.
- **Cambios de precios y platillos por WhatsApp incluidos**, sin reimprimir nada.
- Soporte por WhatsApp mientras el plan esté activo.
- **La carta pesa menos de 2 MB al abrirla** (D-043), así abre con datos móviles en la mesa.
- **Garantía:** si la carta no está publicada en 48 horas hábiles desde que recibimos menú, fotos
  y logo, no se paga la implementación; si ya se pagó, se devuelve completa. La garantía de plazo
  cubre solo la implementación de la Carta (D-038).

**Pago anual: ₡149 000 al año** — dos meses gratis y la implementación incluida. Mes a mes el
primer año sale ₡203 700, así que el anual ahorra ₡54 700.

En el plan Carta **no hay pedidos desde la mesa**: el comensal mira la carta y ordena con el
salonero, como siempre. Eso se dice de frente; es lo que separa Carta de Estándar.

### Plan Estándar — ₡24 900 al mes + ₡125 000 de implementación (primer pago ₡149 900)

Todo lo de Carta, más:

- **Pedidos desde la mesa**: el comensal arma la orden y la manda a cocina.
- **Panel del local**: comandas, menú editable, ventas del día y platillos más vendidos.
- Hasta **150 platillos**, **20 categorías** y **30 mesas**.
- Plazo: **sistema completo en 15 días hábiles**.

### Plan Empresarial — ₡49 900 al mes + ₡125 000 de implementación (primer pago ₡174 900)

Todo lo de Estándar, más:

- **Sin límite** de platillos, categorías ni mesas.
- **Portugués** además de español e inglés.
- Plazo: **sistema completo en 15 días hábiles**.

### Hardware de mesa

| Producto | Precio | Qué resuelve |
|---|---|---|
| Stand QR impreso en 3D | desde ₡6 000 c/u | El QR en relieve, con el logo y los colores del local. No se arruga ni se mancha. |
| Tarjeta NFC | ₡7 500 c/u | El comensal acerca el teléfono y la carta se abre sola. Sin cámara, sin apps. |
| Stand QR 3D + NFC | desde ₡10 000 c/u | El mismo stand con chip adentro: escanea o toca, como prefiera. |
| Stand de reseñas de Google | desde ₡10 000 c/u | Lleva al comensal directo a la ficha de Google del local para dejar la reseña. |

Sin pedido mínimo, desde 1 unidad. Entrega gratis en la GAM, en persona; fuera de la GAM, por
Correos de Costa Rica con el costo de la tarifa, que se cotiza por WhatsApp. De 3 a 5 días
hábiles desde que se aprueba el diseño. El diseño 100 % personalizado (forma, colores, logo) se
cotiza aparte.

**Los QR y NFC que se imprimen son permanentes (D-014).** Todo código impreso apunta a
`https://datafud.com/q/<código>` y el destino vive en `src/content/qr.ts`. Si el local cambia de
dirección, o pasa de la Carta al sistema con pedidos, se cambia una línea y el stand impreso
sigue sirviendo. Un código no se reutiliza nunca para otro local.

### Cupos de fundadores

Mientras la oferta esté activa (`PRICING.founderOffer.enabled`): a los **primeros 10 locales, en
el plan que elijan** (D-057). En la Carta, la implementación sin costo; en Estándar o Empresarial,
**₡24 900 menos** en la implementación del sistema. En los dos casos, **1 stand QR 3D incluido**, a
cambio de dejarnos mostrar el local como caso. El local da ese permiso por WhatsApp (nombre, logo y capturas de su carta) y
puede retirarlo cuando quiera sin perder el beneficio (D-037). Cuando se llenen, se apaga en el
código y desaparece de la web. La web no dice cuántos cupos quedan (`remaining: null`) hasta que
cierre el primero.

### Pagos y permanencia

**Precios finales en colones, IVA incluido** (D-047). SINPE Móvil o transferencia. La
implementación se paga al aprobar la propuesta; **la mensualidad arranca el día que la carta queda
publicada** (D-035). El hardware se paga completo por adelantado: con la implementación o, si se
pide después, al aprobar el diseño; salvo el stand de fundadores (D-036, D-059). Los plazos corren
desde que están el material y el pago de la implementación, lo que llegue último (D-060). **Sin contrato de
permanencia:** se cancela con 15 días de aviso por WhatsApp y el servicio sigue hasta el final del
período ya pagado. Con menos de 15 días de aviso se cobra un período más y el servicio sigue
activo hasta que termine. Si se cancela antes de empezar la implementación, se devuelve dentro de
los 10 días. El hardware tiene 3 meses de garantía por defectos de fábrica.

---

## 3. Qué NO incluye

Se dice antes de cobrar, no después:

- **No es un sistema de facturación.** DataFud no emite la factura electrónica del restaurante ni
  la reemplaza: convive con el sistema que el local ya usa.
- **No es un POS.** No cobra, no maneja caja, no lleva la contabilidad.
- **No conecta con Uber Eats, PedidosYa ni Rappi.** Es la carta del local, no un canal de delivery.
- **No incluye sesión de fotos.** Trabajamos con las fotos que el local tenga. Si no tiene, se
  publica la carta sin fotos o con las de los platillos que sí tenga.
- **En el plan Carta no hay pedidos desde la mesa ni panel.** Eso empieza en Estándar.

---

## 4. Cómo se entrega

### Una Carta, en 48 horas hábiles (hoy, sin backend)

Producción todavía no tiene base de datos: la Carta se publica desde el repo (D-040). El alta no
se escribe a mano — con 60 platillos es lento y se cuelan erratas en los precios — sino desde una
hoja de cálculo (D-046). Los pasos:

1. **Pasar el menú a una hoja.** `entregas/<slug>/menu.csv` con las columnas
   `categoria,nombre_es,nombre_en,desc_es,desc_en,precio,foto`. La categoría acepta
   `Entradas|Starters` para traducirla. Se exporta desde Excel o Google Sheets tal cual (el
   script acepta separador `,` o `;` y el BOM de Excel).
2. **Los datos del local.** `entregas/<slug>/carta.json` con `nombre`, `moneda` (CRC o USD),
   `color_primario`, `color_acento`, `idiomas`, `tagline_es?`, `tagline_en?`, `logo?` y
   `codigo_qr?`. Las fotos que mandó el local van en `entregas/<slug>/fotos/`, como vinieron.
3. **Un comando.** `node scripts/carta-nueva.mjs <slug>` valida el CSV (precios, categorías,
   fotos que falten, límites del plan Carta), optimiza las fotos, escribe
   `src/content/cartas/<slug>.ts`, lo agrega a `CARTAS` y, si hay `codigo_qr`, pone la línea en
   `src/content/qr.ts`. Con `--dry-run` valida sin escribir nada.
4. **Build y despliegue.** `npm run typecheck`, `lint` y `build` en verde; push a `main`; esperar
   el despliegue en READY. `entregas/` está en `.gitignore`: se commitean el `.ts` y las fotos
   optimizadas de `public/cartas/<slug>/`, nunca las fuentes que mandó el local.
5. **Kit para el local.** `node scripts/carta-kit.mjs <slug>` genera el QR en PNG, la hoja de QR
   para recortar y el PDF de la carta en español e inglés.
6. **Prueba en un teléfono de verdad**, no solo en el navegador de la compu: abrir `/c/<slug>`,
   revisar fotos, precios, el cambio a inglés y que el QR impreso caiga donde debe.

Recién ahí se le manda el enlace al cliente.

**Antes de la primera vez, ensayalo.** Hay un local de prueba armado en
`scripts/fixtures/carta-prueba/` (14 platillos, bilingüe, con y sin foto). Las fotos y el logo no
se versionan porque pesan; se generan con `node scripts/fixtures/carta-prueba/generar.mjs`.
Después: copiá esa carpeta a `entregas/ensayo/`, cambiale el `codigo_qr` por uno libre y seguí los
pasos de arriba. Al terminar, `node scripts/carta-borrar.mjs ensayo --fixture` deja el repo como
estaba.

Tres cosas que hacen perder tiempo la primera vez:

- **`next start` no recoge una carta nueva si quedó levantado desde antes del `build`.** El
  síntoma es un 404 en `/c/<slug>` con el build recién hecho, y parece un error del alta cuando es
  del servidor. Matá ese proceso y volvé a levantarlo.
- **Para armar el kit sin haber desplegado**, usá `--servidor`, no `--base`:
  `node scripts/carta-kit.mjs <slug> --servidor http://localhost:3177`. `--base` es lo que se
  **graba dentro del QR** y siempre tiene que ser `https://datafud.com`; el script rechaza
  cualquier otra cosa, porque un código impreso que apunta a una máquina de desarrollo no lo abre
  nadie.
- **La baja de un local deja un cambio en `src/content/qr.ts` y ese cambio se commitea.** No es
  suciedad: es el código del local comentado, reservado para que no se le dé a otro (D-014). Solo
  en un ensayo se usa `--fixture`, que lo borra del todo porque nunca se imprimió.

### El sistema completo, cuando cierre el primer cliente con pedidos

El backend se enciende con el primer cliente de un plan con pedidos. Plan de **15 días hábiles**
desde que se cobra:

| Día | Qué se hace |
|---|---|
| 1 | Montar Supabase: correr `schema.sql`, `verify.sql` y cargar las variables en Vercel. |
| 2 | Cerrar los hallazgos P0 de seguridad **antes** de que entre un dato real: S1 (las tres vistas de reportes sin `security_invoker`) y S3. Mover `middleware.ts` a `src/` y comprobar en el log del build que aparece "Middleware". |
| 3–4 | **Desarrollo: alta de local desde el super admin.** Hoy no existe: `src/app/admin/actions.ts` solo tiene `setTenantStatus`, `registerPayment` y `registerCharge`. Hay que escribir la acción que crea el negocio con su plan, moneda e idiomas, y su formulario. Valida con Zod y devuelve estado (hallazgo S10). |
| 5 | Alta del local real con esa pantalla, y su primer usuario. |
| 6–7 | **Desarrollo: editar un platillo desde el panel.** Hoy `src/app/dashboard/actions.ts` crea, oculta y borra (`createProduct`, `toggleProductAvailability`, `deleteProduct`), pero **no edita**: para cambiarle el precio a un platillo hay que borrarlo y volverlo a crear. Falta `updateProduct` y su formulario. |
| 8 | Cargar el menú real y probar editarlo: cambiarle el precio a un platillo y verlo en la carta. |
| 9 | Storage de Supabase para las fotos de los platillos y el logo. |
| 10 | Tablero de comandas que se refresca cada 15–20 segundos. |
| 11 | Migrar la carta de `/c/<slug>` a `/m/<tenant>/<mesa>` y apuntar el `/q/<código>` al destino nuevo. El stand impreso no se toca. |
| 12 | QR por mesa desde el panel, con `NEXT_PUBLIC_SITE_URL=https://datafud.com`. |
| 13 | Pruebas de punta a punta: pedido real desde un teléfono, aislamiento entre negocios, límites de plan. |
| 14 | Capacitación del local: una sesión con quien va a usar el panel, más el manual. |
| 15 | Salida en vivo, acompañando el primer servicio. |

Los dos bloques marcados como **desarrollo** son código que todavía no existe, no configuración.
Están puestos con su nombre para que no se prometa una demostración de algo que no se puede
demostrar: hasta que se escriban, el panel no permite ni dar de alta un local ni corregirle el
precio a un platillo.

Dos cosas que **no** se saltan: los hallazgos P0 antes del primer dato real, y la prueba desde un
teléfono de verdad antes de decirle al cliente que está listo.

---

## 5. Decisiones cerradas (2026-09-25)

Las cerró Steven el 2026-09-25 y ya están en la web: línea bajo los planes, FAQ y términos 1.1.
Los textos salen de `PRICING.terms`. **Numeración del vault:** hasta el 2026-09-25 este documento
llamaba D-032 y D-033 a las dos primeras (referencia histórica); en el vault, que manda en la
numeración, son **D-047** y **D-048**. Donde un documento viejo diga D-032/D-033 para IVA y plazos
hábiles, léase D-047/D-048.

- **D-047 · IVA incluido.** Todos los precios publicados son finales, con IVA incluido. En la web
  se dice en una línea junto a los planes y en el FAQ: "Precios finales en colones, IVA incluido".
  Motivo: el dueño de una soda compara el precio que ve contra lo que paga; si el 13 % aparece
  después, se siente engañado. **La factura electrónica 4.4 no se promete** hasta que Steven la
  confirme con Hacienda o su contador (entonces es un cambio de una línea en el FAQ).
- **D-048 · "Hábiles".** "48 horas hábiles" y "15 días hábiles" cuentan de lunes a viernes, sin
  feriados. El reloj arranca cuando llega **todo** el material: menú, fotos y logo. Se escribe así
  en los términos, en el FAQ y en las etiquetas de plazo de los planes.
- **D-034 · De Carta a sistema.** Si un local sube a Estándar o Empresarial dentro de los primeros
  6 meses, se le descuenta de la implementación del sistema (₡125 000) lo que pagó por la de la
  Carta (₡24 900). Va en el FAQ ("¿Puedo empezar solo con la carta y sumar pedidos después?") y en
  los términos.
- **D-035 · Inicio de la mensualidad.** La mensualidad arranca el día que la carta queda publicada,
  no el día que se aprueba la propuesta ni el día que se paga la implementación. Va en la línea
  bajo los planes, en el FAQ y en los términos.
- **D-036 · Hardware.** Se paga completo por adelantado, junto con la implementación, porque hay
  costo de material antes de entregar. Excepción: el stand incluido en la oferta de fundadores.
  Va en el FAQ y en los términos.
- **D-037 · Fundadores.** El local acepta por WhatsApp que DataFud muestre su nombre, su logo y
  capturas de su carta. Puede retirar ese permiso cuando quiera; el beneficio (implementación de la
  Carta sin costo + 1 stand) no se le quita. Va en los términos y acá. `founderOffer.remaining`
  se queda en `null`: "Quedan 10 de 10" le avisa al prospecto que nadie compró todavía; Steven lo
  pasa a 9 cuando cierre el primer fundador.
- **D-038 · Garantía del sistema: no se extiende por ahora.** Solo la Carta tiene garantía de
  plazo. Motivo: el backend todavía no existe y S1 sigue abierto; una garantía sobre algo sin
  construir es un riesgo que no vale la pena. Se revisa después de entregar el primer sistema
  completo. Los 15 días hábiles del sistema son un compromiso de trabajo, sin devolución.
- **D-043 · Redacción final.** "La carta pesa menos de 2 MB al abrirla" (no "recorrida entera":
  una carta de 60 platillos recorrida completa pasa de 3 MB, y lo que importa en la mesa es lo que
  baja al abrir).

**Cerradas después, el mismo 2026-09-25 (loop "ajustes", términos 1.2):**

- **D-057 · Fundadores en cualquier plan.** En la Carta, implementación sin costo y 1 stand QR 3D;
  en Estándar o Empresarial, ₡24 900 menos en la implementación del sistema y 1 stand QR 3D. Va en
  la pastilla del hero, la tarjeta de fundadores, el FAQ y los términos.
- **D-058 · Detalle de D-034.** Se descuenta lo que el local **pagó** por la implementación de la
  Carta: ₡24 900 con pago mensual y también con pago anual (es el valor de la implementación
  incluida); un fundador pagó ₡0, así que no hay descuento (ya recibió el beneficio). Los 6 meses
  cuentan desde el día en que la carta quedó publicada.
- **D-059 · Hardware posterior.** El que se pide después de la implementación también se paga por
  adelantado, al aprobar el diseño.
- **D-060 · El plazo corre con material + pago.** El de 48 horas hábiles (y el de 15 días hábiles)
  corre desde que tenemos todo el material y el pago de la implementación, lo que llegue último.
  Va en los términos, en el FAQ de "hábiles" y en la garantía.
- **D-061 · "Hábiles" en los títulos.** El H1 se queda ("lista en 48 horas": es el gancho) y la
  línea de precio de abajo dice "Garantía: carta en 48 horas hábiles". En `<title>`, meta
  description, OG, JSON-LD y guías se dice "48 horas hábiles".

---

## 6. De dónde sale cada cifra

| Cifra | Fuente en el código |
|---|---|
| ₡14 900 · ₡24 900 · ₡49 900 (mensualidades) | `PRICING.plans.*.priceCrc` |
| ₡24 900 · ₡125 000 (implementación) | `PRICING.setupFee.carta.crc` / `.sistema.crc` |
| ₡39 800 · ₡149 900 · ₡174 900 (primer pago) | `firstPaymentFor()` |
| ₡149 000 al año · ₡203 700 mes a mes · ₡54 700 de ahorro | `PRICING.annualCarta.crc` y `firstYearMonthly("basico")` |
| ₡6 000 · ₡7 500 · ₡10 000 (hardware) | `PRICING.hardware[*].priceCrc` |
| 60 platillos · 5 categorías · 8 mesas (Carta) | `PRICING.plans.basico.maxProducts/maxCategories/maxTables` |
| 150 · 20 · 30 (Estándar) | `PRICING.plans.estandar.*` |
| 48 horas hábiles · 15 días hábiles | `PRICING.delivery.menuHours` / `.fullSystemDays` (D-048) |
| 3 a 5 días hábiles (hardware) | `PRICING.hardwareDelivery.leadTime` |
| 15 días de aviso · 10 días de reembolso · 3 meses de garantía | `PRICING.terms.noticeDays` / `.refundDays` / `.hardwareWarrantyMonths` |
| 10 cupos de fundadores | `PRICING.founderOffer.spots` |
