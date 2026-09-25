# Vault-sync · Oferta sólida, Carta entregable y solo WhatsApp · 2026-09-25

> Cola de entrada para el vault de Obsidian (`02-Proyectos/Datafud/`). Cada unidad del loop
> "oferta sólida" agrega su bloque abajo, con el formato exacto del `CLAUDE.md` del repo.
> Se aplica tal cual en `Pendientes.md`, `Decisiones.md`, `Seguridad.md`, las páginas que se
> nombren y el `log.md` del nodo (`## [AAAA-MM-DD] ingest | Título`). El resumen
> "qué cambiar en cada página" se agrega arriba de todo al cerrar el loop (O09).

Aplicado en vault: **no** (se decide en O09, según el conector de Google Drive de la sesión).

---

### O01 · Estado, línea base y puente · commit `06b00a7` · despliegue READY

**Pendientes.md** — nada que cerrar todavía. Ítem nuevo: "Loop oferta sólida en curso
(O01–O09), estado en `docs/plans/oferta-loop-state.md`".

**Decisiones.md** — ninguna nueva en esta unidad; el loop ejecuta D-014, D-039, D-040 y D-041,
que Steven dejó cerradas en el prompt maestro del 2026-09-25. Se registran en el bloque de la
unidad que las implementa (O03, O05, O02 y O06 respectivamente).

**Seguridad.md** — sin cambios. El loop no toca `supabase/`, RLS, RPC ni los hallazgos S1/S3/S10.

**Otras páginas** — `Guia-De-Desarrollo.md`: agregar que en la máquina de Steven el puerto 3000
puede estar ocupado por otro proyecto y que `qa:landing` se corre con
`QA_BASE=http://localhost:3177`, porque el script da por bueno cualquier servidor que responda
en ese puerto y verificaría el sitio equivocado.

**log.md** — `## [2026-09-25] ingest | Loop oferta sólida: línea base`
- Repo clonado en `main` @ `19d3b66`, la base exacta que declara el prompt.
- Línea base verde: `typecheck` limpio, `lint` sin avisos, `build` con 34 rutas,
  `qa:landing` OK con 18 avisos preexistentes de área táctil.
- El parche `datafud-oferta-solida.patch` no aparece por ningún lado: cada unidad O02–O07 se
  implementa desde su especificación, con commit propio.
- Esta sesión sí tiene red directa a `datafud.com` (curl → 200), a diferencia del loop anterior:
  las puertas B, C, D y E se pueden verificar contra producción sin pasar por la API de Vercel.

---

### O02 · Motor de la Carta `/c/<slug>` y modo Carta · commit `44c9181` · despliegue READY

**Pendientes.md** — cerrar: "no se puede entregar una carta sin montar Supabase". Ítem nuevo:
"Al dar de alta una carta real, seguir los 4 pasos de `src/content/cartas/index.ts` y probarla
en un teléfono de verdad antes de mandarle el enlace al cliente".

**Decisiones.md** — **D-040 · Entrega de la Carta sin backend.**
*Contexto:* producción no tiene Supabase y el backend se enciende con el primer cliente de un
plan con pedidos, pero la Carta se vende hoy y hay que entregarla en 48 horas.
*Decisión:* la Carta se publica desde `src/content/cartas/` en `/c/<slug>`, estática, con el
mismo formato que devuelve la RPC `get_menu`. `MenuClient` acepta `ordering`; en `false` no
muestra botones de agregar, barra de orden ni carrito.
*Consecuencias:* se puede vender y entregar el plan Carta sin base de datos; el contenido no se
tira cuando el local pase a un plan con pedidos, porque el formato es el mismo; cada alta exige
un commit y un despliegue (no hay panel), y eso queda escrito en `docs/ventas/OFERTA.md` §4.

**Seguridad.md** — sin cambios. La ruta es estática y de solo lectura: no toca la BD ni recibe
entrada del usuario.

**Otras páginas** — `Arquitectura-Y-Base-De-Datos.md`: agregar que `MenuPayload` ahora tiene dos
orígenes, la RPC `get_menu` (en `/m/<tenant>/<mesa>`) y los archivos de `src/content/cartas/`
(en `/c/<slug>`), y que el contrato entre los dos es el que permite migrar sin rehacer la UI.

**log.md** — `## [2026-09-25] ingest | Carta entregable sin backend`
- `/c/<slug>` publica cartas estáticas desde el repo; `/c/ejemplo` ya está en producción.
- `MenuClient` gana `ordering` (default `true`): el modo Carta queda sin carrito.
- El texto fijo del encabezado pasa al diccionario (`orderingTagline` / `cartaTagline`, es/en/pt).
- Verificado en producción: `/c/ejemplo` → 200 con 0 "Agregar"; `/c/no-existe` → 404;
  `/preview/cliente` conserva sus 28 "Agregar" (regresión del modo por defecto).
- Los 14 platillos de la demo suman descripción en inglés: en EN mostraban texto en español.

### O03 · QR permanentes `/q/<código>` · commit `d599456` · despliegue READY

**Pendientes.md** — ítem nuevo para Steven: "Imprimir el stand de muestra con
`https://datafud.com/q/demo26`". Cerrar: "no hay forma de cambiar el destino de un QR impreso".

**Decisiones.md** — **D-014 · QR y NFC impresos permanentes.**
*Contexto:* un QR impreso vive años en una mesa; si apunta directo a la carta, cualquier cambio
de dirección obliga a reimprimir stands y regrabar tarjetas.
*Decisión:* todo código impreso apunta a `https://datafud.com/q/<código>`; el destino vive en
`src/content/qr.ts`. Formato: 6 caracteres en minúscula, sin `0`, `o`, `1`, `l` ni `i`. **Un
código nunca se reutiliza para otro local**, ni después de que el primero se vaya.
*Consecuencias:* se puede mover una carta de `/c` a `/m` sin tocar nada impreso; hay que llevar
el registro de códigos en el repo y no improvisar uno en una visita; la redirección es 307 y no
308 a propósito, para que el destino no quede cacheado como permanente en el teléfono del
comensal.

**Seguridad.md** — sin cambios. `qrDestination()` solo busca en un objeto literal con
`hasOwnProperty` y devuelve rutas internas; no acepta destinos del navegador, así que no hay
redirección abierta.

**Otras páginas** — `Guia-De-Desarrollo.md`: agregar el formato del código y la regla de no
reutilizarlo. `Marca-Y-Marketing.md`: el stand de muestra lleva `/q/demo26`, nunca un enlace con
UTM (un UTM impreso queda congelado y mide una campaña que ya no existe).

**log.md** — `## [2026-09-25] ingest | QR y NFC impresos permanentes`
- `/q/<código>` redirige 307 al destino de `src/content/qr.ts`; `demo26` → `/c/ejemplo`.
- Código desconocido → `/?qr=desconocido`, sin 404 en la cara del comensal.
- Verificado en producción: `/q/demo26` y `/q/DEMO26` → 307 a `https://datafud.com/c/ejemplo`;
  `/q/zzz` → 307 a `/?qr=desconocido`.

### O04 · La demo abre la Carta primero · commit `51e0dd3` · despliegue READY

**Pendientes.md** — cerrar: "la demo enseña pedidos desde la mesa, que son de otro plan".

**Decisiones.md** — ninguna nueva; es la consecuencia visible de D-040.

**Seguridad.md** — sin cambios.

**Otras páginas** — `Marca-Y-Marketing.md` y `Paneles-Y-Vistas.md`: el recorrido demo ahora
arranca en `/preview/carta` (plan Carta, sin carrito); `/preview/cliente` pasa a segundo lugar
como "Carta con pedidos", etiquetada "Estándar y Empresarial". El QR de escritorio de la landing
codifica `https://datafud.com/preview/carta`.

**log.md** — `## [2026-09-25] ingest | La demo abre por el plan Carta`
- `/preview/carta`: misma carta que `/c/ejemplo` con el banner de modo demo.
- El hero, las tres guías, el QR de escritorio y el sitemap apuntan ahí.
- La maqueta del teléfono de `#demo` pierde "Ver orden · 2", los checks y la mesa; el pie dice
  "Carta digital · ES · EN".
- `qa:landing` recorre además `/preview/carta` y `/c/ejemplo`, y comprueba que el SVG del QR
  servido sea exactamente el de la URL nueva.

### O05 · Solo WhatsApp · commit `65ad48d` · despliegue READY

**Pendientes.md** — cerrar: "correo @gmail visible en la web". Ítem nuevo: "WhatsApp Business en
+506 7287 4779 (nombre DataFud, logo, catálogo con planes y stands)". Queda abierto y explícito:
"crear `hola@datafud.com`" deja de ser bloqueante para vender, porque la web ya no muestra correo.

**Decisiones.md** — **D-039 · Canal de contacto único.**
*Contexto:* la web ofrecía WhatsApp y un correo personal de Gmail. Dos canales significan uno sin
atender, y un `@gmail` en la página de una empresa resta credibilidad.
*Decisión:* el único canal público es WhatsApp, +506 7287 4779. El correo queda solo como destino
interno del formulario (`SITE.leadsEmail`) y no se renderiza en ninguna página, en ningún
`mailto:` ni en el JSON-LD.
*Consecuencias:* todo el contacto queda en un hilo con historial; si algún día se quiere volver a
publicar un correo, hay que cambiar la regla 10 de `CLAUDE.md` a propósito, no por descuido. La
línea de privacidad que describe el correo como **dato** que recibimos del formulario se mantiene:
no es un canal.

**Seguridad.md** — sin cambios. Un dato de contacto menos expuesto en el HTML público.

**Otras páginas** — `Cuentas-y-Accesos.md`: anotar que `galodevcr@gmail.com` sigue siendo el
destino de los leads pero ya no es público. `Marca-Y-Marketing.md`: la tarjeta de contacto de la
landing dice "Cotizaciones, dudas y soporte. Respondemos en horario de oficina".

**log.md** — `## [2026-09-25] ingest | Canal único: WhatsApp`
- `SITE.email` → `SITE.leadsEmail`; fuera `hasEmail()` y `mailLink()`.
- Sin tarjeta de correo en `#contacto` ni línea en el footer; legales, FAQ y
  `PRICING.terms.permanence` hablan solo de WhatsApp.
- `seo.ts`: sin `email` en Organization, ContactPoint ni LocalBusiness.
- Verificado en producción sobre 14 rutas públicas: 0 `galodevcr`, 0 `mailto:`, 0 `"email"` en
  JSON-LD.
- `git diff 19d3b66 -- supabase/ src/lib/constants.ts` = 1 línea (`terms.permanence`).

### O06 · Voz de empresa · commit `53b994f` · despliegue READY

**Pendientes.md** — cerrar: "la landing habla como proyecto personal" y "firma del fundador con
foto pendiente" (ya no hace falta la foto: el bloque salió).

**Decisiones.md** — **D-041 · Voz de empresa.**
*Contexto:* la landing decía "somos un proyecto chico", firmaba con el fundador y el footer decía
"un producto de GaloDev". A un restaurante que va a pagar una mensualidad eso le resta confianza.
*Decisión:* DataFud habla como empresa costarricense y en plural. Fuera "proyecto chico", la firma
personal y "un producto de GaloDev" de la cara pública.
*Consecuencias:* **esto no autoriza a inventar sociedad anónima, cédula jurídica, equipo ni
dirección.** Los legales siguen nombrando al responsable legal real (`SITE.legalResponsible`), y
la regla quedó escrita en la regla 10 de `CLAUDE.md` para que no se estire.

**Seguridad.md** — sin cambios.

**Otras páginas** — `Marca-Y-Marketing.md`: el bloque de confianza es ahora "Atención DataFud ·
Ventas y soporte · Costa Rica" con el logo y el WhatsApp, y la tercera promesa es "Precios
publicados, sin letra pequeña ni permanencia". `Cuentas-y-Accesos.md`: `public/equipo/steven.webp`
ya no se usa.

**log.md** — `## [2026-09-25] ingest | DataFud habla como empresa`
- `#confianza`: "DataFud es una empresa costarricense dedicada a sodas, cafeterías y restaurantes".
- La firma del fundador pasa a la tarjeta "Atención DataFud"; fuera `existsSync` y `SITE.founder`.
- Footer y legales: "© 2026 DATAFUD · COSTA RICA".
- `layout.tsx`: `authors`/`creator` salían en el HTML como `<meta name="author" content="GaloDev">`.
- Verificado en producción: 0 "proyecto chico", 0 "GaloDev", 0 "Steven" en `/`, `/preview`,
  `/preview/carta` y las 3 guías; en `/terminos` y `/privacidad` el responsable legal sigue.

### O07 · Oferta, kit y documentación · commit `38fa758` · despliegue READY

**Pendientes.md** — cerrar: "no hay un documento que diga qué se vende y qué no". Ítems nuevos
para Steven: confirmar D-032 (IVA y factura electrónica 4.4) y D-033 a D-038 de
`docs/ventas/OFERTA.md`.

**Decisiones.md** — ninguna cerrada. Quedan **propuestas** D-032 a D-038, escritas en
`docs/ventas/OFERTA.md` §5: IVA incluido, qué significa "hábiles", descuento de Carta a sistema,
cuándo arranca la mensualidad, pago del hardware por adelantado, condiciones de fundadores y
extensión de la garantía al sistema completo. **Ninguna se publica ni se le dice a un cliente
hasta que Steven las confirme.**

**Seguridad.md** — sin cambios.

**Otras páginas** — `Guia-De-Desarrollo.md`: los 4 pasos para dar de alta una carta y la regla de
que se prueba en un teléfono de verdad antes de entregar. `Plan-Landing-First.md`: el plan de 15
días hábiles para encender el backend al cerrar el primer cliente con pedidos, con los hallazgos
P0 (S1 y S3) antes de que entre un dato real.

**log.md** — `## [2026-09-25] ingest | OFERTA.md y kit con voz de empresa`
- `docs/ventas/OFERTA.md`: qué se vende, qué NO incluye, cómo se entrega una Carta en 48 h y el
  plan de 15 días hábiles para el sistema completo.
- El kit pasa a plural y a nombre de la empresa; el stand de muestra usa `/q/demo26`.
- El reel c11 del calendario de contenido dejaba de cumplir D-041 y se reescribió.
- `CLAUDE.md` suma `/c`, `/q`, `src/content/` y `leadsEmail` al mapa, y el canal único y la voz de
  empresa a la regla 10.
- Grep cruzado: las 13 cifras en colones de `docs/ventas/` salen todas de `PRICING`.
