# Informe del loop — Oferta sólida, Carta entregable y solo WhatsApp (2026-09-25)

> Cuarto bucle autónomo sobre `main`, de `19d3b66` a la versión **1.2.0**.
> Estado detallado: `docs/plans/oferta-loop-state.md`. Puente al vault:
> `docs/vault-sync/2026-09-25-oferta-solida.md`.

## Resumen

Antes de este loop, DataFud podía *vender* la Carta digital pero no podía *entregarla*: el plan
Carta existía en la página de precios y no había ninguna forma de publicar la carta de un local
sin montar antes toda la base de datos. Además la web ofrecía dos canales de contacto (uno de
ellos un Gmail personal), la demo abría por la versión con pedidos —que es de otro plan— y la
página se presentaba como "un proyecto chico".

Hoy las cuatro cosas están resueltas y verificadas en producción:

1. **Una Carta se entrega en 48 horas sin backend.** Se crea un archivo en `src/content/cartas/`,
   se despliega, y el local tiene su carta en `/c/<slug>`. El formato es el mismo que devuelve la
   RPC `get_menu`, así que nada se rehace cuando el local pase a un plan con pedidos.
2. **Los QR y NFC impresos son permanentes.** Todo código impreso entra por `/q/<código>` y su
   destino vive en una línea de `src/content/qr.ts`. Se puede mover una carta sin reimprimir nada.
3. **El único canal público es WhatsApp.** Cero correos en la web, en los legales y en el JSON-LD.
4. **DataFud habla como empresa**, sin firma personal ni "un producto de GaloDev", y sin inventar
   una sociedad: los legales siguen nombrando al responsable legal real.

Además, la demo abre por el plan Carta (lo que de verdad se entrega hoy) y la oferta completa
quedó escrita en `docs/ventas/OFERTA.md`, con lo que sí se vende, **lo que no incluye** y las
siete decisiones que siguen abiertas.

## Unidades

| ID | Título | Estado | Commit | Despliegue |
|---|---|---|---|---|
| O01 | Estado, línea base y puente | hecho | `06b00a7` | READY |
| O02 | Motor de la Carta `/c/<slug>` y modo Carta | hecho | `44c9181` | READY |
| O03 | QR permanentes `/q/<código>` (D-014) | hecho | `d599456` | READY |
| O04 | La demo abre la Carta primero | hecho | `51e0dd3` | READY |
| O05 | Solo WhatsApp (D-039) | hecho | `65ad48d` | READY |
| O06 | Voz de empresa (D-041) | hecho | `53b994f` | READY |
| O07 | Oferta, kit y documentación | hecho | `38fa758` | READY |
| O08 | Verificación final | hecho | `4dda67f` | READY |
| O09 | Informe, release y puente | hecho | `1b534b6` | READY (`dpl_H3S3dcC6n5LDoEXo5UkxCcyUutgC`) |

Ocho unidades, **un intento cada una**, ninguna bloqueada. 9 iteraciones de las 20 del tope.

## Antes → después

| | Antes (`19d3b66`) | Después (1.2.0) |
|---|---|---|
| Entregar una Carta | Imposible sin montar Supabase | Un archivo en `src/content/cartas/` + despliegue |
| QR impreso | Apuntaba directo a la carta: cambiarla obligaba a reimprimir | `/q/<código>` con el destino en una línea del repo |
| Canal de contacto | WhatsApp **y** un Gmail personal, en landing, footer, legales y JSON-LD | Solo WhatsApp. 0 `mailto:`, 0 `galodevcr`, 0 `"email"` en JSON-LD |
| Qué abre "Ver la demo" | `/preview/cliente`: pedidos desde la mesa, que son de Estándar y Empresarial | `/preview/carta`: exactamente lo que se entrega en el plan Carta |
| Cómo se presenta la web | "Somos un proyecto chico", firma del fundador, "un producto de GaloDev" | "DataFud es una empresa costarricense…", tarjeta "Atención DataFud", "DATAFUD · COSTA RICA" |
| La demo en inglés | Nombres en inglés, descripciones en español | Los 14 platillos en los dos idiomas |
| La demo al enviar una orden | "¡Orden enviada! La cocina ya la recibió." (no hay cocina) | "Así se ve cuando mandás la orden. Esto es una demo: no se envió nada." |
| Documento de oferta | No existía | `docs/ventas/OFERTA.md`, con qué NO incluye y las decisiones abiertas |
| Rutas del build | 34 | 37 (`/c/[slug]`, `/q/[code]`, `/preview/carta`) |

## Puertas (§6), verificadas contra producción

| Puerta | Estado |
|---|---|
| **A** typecheck · lint · build · qa:landing | ✅ `qa:landing → OK · 21 avisos` |
| **B** `/c/ejemplo` 200, sin "Agregar", con cambio ES/EN | ✅ verificado en navegador real |
| **C** `/q/demo26` → 307 `/c/ejemplo` | ✅ también `/q/DEMO26` y `/q/zzz` |
| **D** 0 `galodevcr` y 0 `mailto:` | ✅ 14 rutas públicas |
| **E** 0 "proyecto chico", "un producto de GaloDev", "al instante", "tiempo real", "24/7" | ✅ las mismas 14 rutas |
| **F** `/preview/cliente` sigue con pedidos | ✅ 28 "Agregar" |
| **G** `supabase/` y `constants.ts` sin cambios salvo `terms.permanence` | ✅ 1 archivo, 1 línea |
| **H** Despliegue de producción READY con el último commit | ✅ `dpl_H3S3dcC6n5LDoEXo5UkxCcyUutgC` sirviendo `datafud.com` |

La evidencia literal de cada una está en `docs/plans/oferta-loop-state.md`.

## Revisión de contenido con contexto fresco (O08)

Un revisor sin contexto previo leyó las 11 rutas públicas de producción con la regla 10 en la
mano, midió contraste y overflow a 360 y 1280 px, y probó el cambio ES/EN en navegador.

| Dimensión | Nota |
|---|---|
| Claridad | 5 |
| Honestidad | 4 |
| Coherencia de la oferta | 5 |
| Voz de empresa | 5 |
| Responsive | 5 |
| Accesibilidad | 4 |

Todas ≥ 4, que es la condición de salida. Confirmó además, midiendo: 0 `mailto:` y 0 direcciones
de correo en las 11 rutas; "GaloDev" y "Steven" solo en `/terminos` (6) y `/privacidad` (3);
0 imágenes sin `alt`; 0 botones sin nombre accesible; 0 combinaciones de contraste bajo AA en la
landing (54 medidas); 0 overflow horizontal a 360 px en 9 rutas; y que toda la aritmética de
precios cierra entre landing, FAQ, términos y las tres guías.

**Hallazgos corregidos en `4dda67f`:** el mensaje de la demo que afirmaba que la cocina recibió
la orden; "Verde Limon" sin tilde en inglés; el conmutador ES/EN y los chips de categoría por
debajo de 44 px; los botones de idioma sin nombre accesible ni estado; el sitemap que nunca
incluiría una carta `indexable`.

**Hallazgos que quedaron abiertos** (ninguno bloquea la venta; están en PENDIENTES-STEVEN):
los rangos de precio de la competencia sin fuente en `/menu-digital-costa-rica`; la oferta de
fundadores sin fecha de corte ni cupos restantes; la barra de la demo que no traduce; la falta de
enlace "saltar al contenido"; `/preview/dashboard` sin `<main>` y con un rótulo a 4.18:1.

## Lo que no se pudo verificar

- **El envío del formulario a `SITE.leadsEmail`.** Sin `RESEND_API_KEY` en Vercel el formulario
  no se renderiza, así que no hay envío real que probar. El cambio es de una línea y lo cubre el
  `typecheck`.
- **`/m/[tenant]/[table]` en producción.** No hay Supabase: la ruta no se puede abrir. La
  regresión del modo con pedidos se garantiza por el valor por defecto de `ordering` (`true`) y
  porque esa ruta no pasa la prop; en vivo se comprueba con `/preview/cliente`.
- **Las decisiones D-032 a D-038.** Son propuestas: no se publican ni se le dicen a un cliente
  hasta que Steven las confirme.
- **Las fotos remotas de la demo** (`images.unsplash.com`) fallan en el `next start` local por
  falta de red hacia ese host; `qa:landing` las reporta como aviso, no como fallo. En producción
  cargan.

## PENDIENTES-STEVEN

Ordenados por lo que más desbloquea vender:

1. **Imprimir el stand de muestra** con `https://datafud.com/q/demo26`. Ya funciona en producción;
   es lo único que falta para salir a visitar locales con algo en la mano.
2. **WhatsApp Business** en +506 7287 4779: nombre DataFud, logo y catálogo con planes y stands.
   Ahora es el único canal público, así que es la cara de la empresa.
3. **Decidir el IVA** (propuesta: precios con IVA incluido) y confirmar si hoy se puede emitir
   factura electrónica 4.4. Mientras no esté cerrado, en objeciones se responde "te lo confirmamos
   en la propuesta", nunca de memoria.
4. **Confirmar D-033 a D-038** de `docs/ventas/OFERTA.md` §5: qué significa "hábiles", descuento
   de Carta a sistema, cuándo arranca la mensualidad, pago del hardware, condiciones de fundadores
   y si la garantía de plazo se extiende al sistema completo.
5. **Los rangos de precio de la competencia** en `/menu-digital-costa-rica`: decir de dónde salen
   (y publicar la fuente y la fecha) o sacarlos. Es el único dato del sitio que un cliente no
   puede verificar. No se tocó en este loop porque hacía falta un dato que no está en el repo.
6. **Fecha de corte o cupos restantes** para la oferta de fundadores, o apagarla con
   `founderOffer.enabled` cuando se llene.
7. **Fotos reales de los 4 stands** en `public/hardware/<código>.webp`. Hoy los cuatro muestran
   "Render ilustrativo".
8. **Redes** (Instagram, Facebook) → URLs en `SITE.social`, y Google Business Profile.
9. **Opcional: `RESEND_API_KEY`** si se quiere el formulario. Sin ella la web funciona solo con
   WhatsApp, que es lo que D-039 pide igual.

## Vault

El puente `docs/vault-sync/2026-09-25-oferta-solida.md` está completo, con los hashes reales de
las nueve unidades, y se subió al vault de Obsidian como archivo nuevo en
`02-Proyectos/Datafud/Claude-Code/vault-sync-2026-09-25-oferta-solida.md`. El conector de Drive
de esta sesión crea archivos pero no edita el contenido de los `.md` que ya existen, así que las
páginas del vault (`Pendientes.md`, `Decisiones.md`, `Guia-De-Desarrollo.md`,
`Marca-Y-Marketing.md`, `Paneles-Y-Vistas.md`, `Cuentas-y-Accesos.md`,
`Arquitectura-Y-Base-De-Datos.md`, `Plan-Landing-First.md` y `log.md`) se actualizan con
"sincronizá el vault", aplicando el resumen que encabeza el puente.
