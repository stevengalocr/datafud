# Vault-sync · Cierre de la entrega de la Carta · 2026-09-25

> Cola de entrada para el vault de Obsidian (`02-Proyectos/Datafud/`). Cada unidad del loop
> "cierre de la entrega" agrega su bloque abajo, con el formato exacto del `CLAUDE.md` del repo.
> Se aplica tal cual en `Pendientes.md`, `Decisiones.md`, `Seguridad.md`, las páginas que se
> nombren y el `log.md` del nodo (`## [AAAA-MM-DD] ingest | Título`). El resumen
> "qué cambiar en cada página" se agrega arriba de todo al cerrar el loop (E08).

Aplicado en vault: **no** (se decide en E08, según el conector de Google Drive de la sesión).

---

### E01 · Estado, línea base y fixture de prueba · commit <pendiente> · despliegue —

**Pendientes.md** — ítem nuevo: "Loop cierre de la entrega en curso (E01–E08), estado en
`docs/plans/entrega-loop-state.md`". Ítem nuevo para Steven: "Decidir si `sharp` se declara en
`package.json`: hoy llega como dependencia transitiva de Next y los scripts de entrega de cartas
dependen de ella".

**Decisiones.md** — ninguna nueva en esta unidad. El loop ejecuta D-042 (logo), D-043 (peso de la
carta), D-044 (kit de entrega), D-045 (subtítulo por carta) y D-046 (alta desde CSV), que Steven
dejó cerradas en el prompt maestro del 2026-09-25. Cada una se registra en el bloque de la unidad
que la implementa.

**Seguridad.md** — sin cambios. El loop no toca `supabase/`, RLS, RPC ni los hallazgos S1/S3/S10.

**Otras páginas** — `Guia-De-Desarrollo.md`: anotar que el fixture de prueba de las cartas vive en
`scripts/fixtures/carta-prueba/` y que su material pesado (6 fotos de ~2,4 MB y el logo) **no se
versiona**: se reconstruye con `node scripts/fixtures/carta-prueba/generar.mjs`. Meter imágenes
generadas de 15 MB en el historial de un repo público es basura permanente.

**log.md** — `## [2026-09-25] ingest | Loop cierre de la entrega: línea base y fixture`
- Arranca sobre 1.2.0 (`7b9c4e6`) con la línea base en verde: typecheck limpio, lint sin avisos,
  build con 37 rutas, `qa:landing → OK · 21 avisos`.
- El loop existe porque la revisión independiente de 1.2.0 encontró tres promesas publicadas que
  hoy no se cumplen: el logo no se pinta, las fotos no se optimizan (una carta de prueba pesó
  47 MB) y no hay herramienta para el QR provisional ni para el PDF de respaldo.
- Fixture nuevo "Rancho La Parcela": 14 platillos, 3 categorías, **USD** (para ejercitar los
  decimales, que la demo en colones no toca), bilingüe, con platillos sin foto y sin descripción,
  subtítulo propio de soda que cobra en caja, y 6 fotos de 3200×2400.
- `sharp` 0.35.4 está disponible pero es transitiva de Next: queda anotado como riesgo.

---

### E02 · Alta desde CSV · commit `3723d94` · despliegue READY

**Pendientes.md** — cerrar: "el alta de una carta es escribir un .ts a mano". Ítem nuevo: "Al dar
de alta un local, las fuentes (`menu.csv`, `carta.json`, `fotos/`) van en `entregas/<slug>/`, que
no se versiona; lo que se commitea es el `.ts` y las fotos optimizadas".

**Decisiones.md** — **D-046 · Alta de una carta desde CSV.**
*Contexto:* escribir a mano el `.ts` de una carta de 60 platillos es lento y deja erratas en los
precios, que es donde más caro salen.
*Decisión:* el alta se hace desde `entregas/<slug>/menu.csv` + `carta.json` + `fotos/` con
`node scripts/carta-nueva.mjs <slug>`. El `.ts` resultante se commitea; las fuentes no.
*Consecuencias:* el menú se le puede pedir al local como hoja de cálculo; el script valida
precios, categorías, fotos y los límites del plan **leyéndolos de `PRICING`**, no copiados. Para
cambiar un precio se edita el CSV y se vuelve a correr, así el `.ts` y el CSV no se separan.

**Seguridad.md** — sin cambios. Los scripts corren en la máquina de quien entrega, no en
producción, y no tocan la BD.

**Otras páginas** — `Guia-De-Desarrollo.md`: el flujo de alta y de baja de una carta, y que un
código de QR **reservado** (el de un local que se fue) queda comentado en `qr.ts` y el alta
también lo mira, para que no se reutilice.

**log.md** — `## [2026-09-25] ingest | Alta de cartas desde CSV`
- `scripts/carta-nueva.mjs` da de alta una carta desde una hoja de cálculo; `carta-borrar.mjs` la
  da de baja dejando el código impreso reservado.
- Dos errores del repo que salieron al escribir el validador: la regla de los códigos prohibía la
  `o` pero el propio `demo26` la usa (la regla estaba mal planteada: sin el dígito `0`, la `o` no
  se confunde con nada), y el chequeo de duplicados no veía los códigos reservados, así que se
  podía reutilizar el de un local que se fue.
- Verificados los caminos de error: precio no numérico con la fila señalada, categoría vacía,
  foto que falta, código ambiguo, código en uso, código reservado, slug repetido y límites.

### E03 · Fotos optimizadas · commit `b5f2833` · despliegue READY

**Pendientes.md** — cerrar: "las fotos no se optimizan; una carta de prueba pesó 47 MB". Ítem
nuevo para Steven: "Decidir si se ajusta D-043: su objetivo de '< 2 MB con 60 platillos' no se
puede cumplir recorriendo la carta entera; lo que se cumple es '< 2 MB al abrir'".

**Decisiones.md** — **D-043 · Peso de la carta**, con un matiz que salió de medir.
*Contexto:* las fotos que manda un local salen del teléfono: 3000 px y varios MB. Servidas tal
cual, una carta de 6 platillos pesaba 15,07 MB y con datos móviles no abre en la mesa.
*Decisión:* toda foto de `public/cartas/**` es `.webp` de máximo 800 px y ≤ 150 KB (logo ≤ 60 KB),
y un chequeo lo hace cumplir en cada `build`. **Añadido:** el presupuesto por foto se reparte
según cuántas tenga la carta, porque 60 × 150 KB son 9 MB.
*Consecuencias:* con 6 fotos se usan los 150 KB del techo; con 60, 51 KB cada una. Medido: una
carta de 60 platillos pasó de 3,65 MB a 1,69 MB al abrir, y de 8,04 MB a 3,34 MB recorrida
entera. **El objetivo de D-043 se cumple "al abrir", no "recorrida entera"**, y así queda escrito
para que nadie lo prometa de más.

**Seguridad.md** — sin cambios.

**Otras páginas** — `Guia-De-Desarrollo.md`: `npm run check:cartas` corre antes de cada `next
build` y rebota cualquier archivo de `public/cartas` que no sea webp/png o que pase del límite,
aunque lo haya copiado alguien a mano.

**log.md** — `## [2026-09-25] ingest | Fotos que abren con datos móviles`
- `carta-fotos.mjs` recomprime con `sharp`, respeta la orientación EXIF y baja primero el ancho
  (de 800 a 640 px no se nota: la foto se ve en un cuadro de 288 px en un teléfono de 3×) y
  después la calidad.
- `check-cartas.mjs` en el `build`; verificado con un JPEG a mano, un webp de 1415 KB y un logo
  de 7670 KB.
- `MenuClient` reserva el hueco de la foto (`width`/`height`) y difiere la carga salvo en la
  primera categoría.
- La carta del fixture pasó de 15,07 MB a 1,20 MB.

### E04 · Logo en la cabecera · commit `68b039c` · despliegue READY

**Pendientes.md** — cerrar: "el logo no aparece en la carta".

**Decisiones.md** — **D-042 · Logo del local en la carta.**
*Contexto:* la tarjeta del plan Carta promete "carta a tu marca: colores, logo y fotos" y
`OFERTA.md` "el nombre, el logo y los colores del local", pero `MenuClient` nunca pintaba
`settings.logo_url`.
*Decisión:* si `logo_url` existe, el logo va arriba a la izquierda de la cabecera, a 52 px, sobre
fondo blanco redondeado y con el nombre del local como `alt`. Sin logo, la cabecera queda como
estaba.
*Consecuencias:* vale para `/c`, `/m` y `/preview` porque los tres usan el mismo componente. El
fondo blanco no es decorativo: casi todos los logos son PNG con transparencia pensados para fondo
claro y sobre la cabecera oscura se perderían.

**Seguridad.md** — sin cambios.

**Otras páginas** — `Marca-Y-Marketing.md`: la demo del restaurante ficticio ahora tiene logo
propio; era la única carta que no enseñaba la promesa que vende.

**log.md** — `## [2026-09-25] ingest | El logo del local se pinta`
- El logo viajaba en el payload y no se pintaba: 0 `<img>` de logo en la página.
- Logo a 52 px sobre blanco, con el nombre del local como texto alternativo.
- La demo estrena logo, con el monograma ocupando casi todo el cuadro: a 52 px una marca con
  detalles finos es una mancha.
- Arreglado de paso un desborde del banner de la demo que entró al sumarle el tercer enlace en el
  loop anterior: a 375 px se partía en tres líneas dentro de una barra de 41 px y se montaba sobre
  la carta.

### E05 · Subtítulo por carta · commit `525ebb7` · despliegue READY

**Pendientes.md** — cerrar: "el subtítulo fijo no sirve para sodas que piden en caja".

**Decisiones.md** — **D-045 · Subtítulo propio por local.**
*Contexto:* la carta decía "Consultá a tu salonero para ordenar", que en una soda que cobra en
caja le dice al comensal que haga algo que ahí no se hace.
*Decisión:* `CartaEstatica.tagline` (es/en/pt opcional) gana sobre el del diccionario, y el del
diccionario deja de suponer cómo se ordena: "Nuestra carta." / "Our menu." / "Nosso cardápio.".
*Consecuencias:* el subtítulo va por prop y no en el payload porque es de la Carta, no del formato
de `get_menu`: `/m/[tenant]/[table]` y `/preview/cliente` no lo pasan y siguen igual.

**Seguridad.md** — sin cambios.

**Otras páginas** — `Marca-Y-Marketing.md`: en la descripción del plan Carta tampoco se supone
salonero; se dice "se ordena como siempre en tu local, en la mesa o en caja".

**log.md** — `## [2026-09-25] ingest | Subtítulo propio por local`
- El subtítulo del local llega por prop y gana sobre el del diccionario.
- Verificado en navegador en los dos idiomas, y que una carta sin subtítulo propio cae al genérico.

### E06 · Kit de entrega: QR y PDF · commit `dbdcf94` · despliegue READY

**Pendientes.md** — cerrar: "no hay herramienta para el QR provisional ni para el PDF de
respaldo". Ítem nuevo para Steven: "Escanear con un teléfono de verdad el QR impreso de un kit
antes de entregarle el primero a un cliente: la comprobación automática lee los píxeles del PNG,
no reemplaza la prueba real".

**Decisiones.md** — **D-044 · Kit de entrega por carta.**
*Contexto:* la línea de tiempo promete "un QR provisional para usarla ese mismo día" y la FAQ "te
mandamos un PDF de tu carta". Las dos eran trabajo manual improvisado.
*Decisión:* `scripts/carta-kit.mjs <slug>` genera en `entregas/<slug>/` el QR en PNG a 2000 px con
corrección H, una hoja tamaño carta con 4 QR para recortar, y el PDF de la carta en español y en
inglés. Sin código impreso, el script se niega.
*Consecuencias:* el PDF sale de la misma página `/c/<slug>` con `@media print`, así que no hay una
vista aparte que se desincronice. Lo que se manda a imprimir apunta siempre a `/q/<código>`.

**Seguridad.md** — sin cambios.

**Otras páginas** — `Guia-De-Desarrollo.md`: dos trampas del PDF, encontradas mirándolo y no
escribiéndolo — un degradado con transparencia puede salir de otro color según el visor (en papel
va color plano), y Chromium reencodifica los `.webp` sin pérdida, así que las fotos se pasan a
JPEG de 240 px justo antes de imprimir (5,88 MB → 212 KB).

**log.md** — `## [2026-09-25] ingest | Kit de entrega: QR y PDF`
- Cuatro archivos por carta; el PNG decodificado módulo por módulo da `/q/<código>` y falla contra
  cualquier otra URL.
- Los tres PDF renderizados con pdf.js y mirados uno por uno.
- Sin código impreso el script se niega: un QR con la URL final queda congelado en el stand.

### E07 · Plan de 15 días honesto y guía con fuente · commit `ad25cba` · despliegue READY

**Pendientes.md** — cerrar: "el plan de 15 días da por hechas dos funciones que no existen".
Ítems nuevos para Steven:
- Guardar el respaldo de los rangos de precio de la competencia que publica
  `/menu-digital-costa-rica` (qué proveedores, qué precios, qué fecha).
- Actualizar `founderOffer.remaining` con cada fundador que cierre; con 0 la oferta se apaga sola.
Ítems nuevos de desarrollo, que el plan ahora nombra: **alta de local desde el super admin** y
**editar un platillo desde el panel**.

**Decisiones.md** — ninguna nueva.

**Seguridad.md** — sin cambios de estado, pero queda anotado en el plan que las dos acciones
nuevas tienen que validar con Zod y devolver estado (hallazgo **S10**), y que **S1 y S3 se cierran
antes de que entre el primer dato real**.

**Otras páginas** — `Plan-Landing-First.md`: el plan de 15 días hábiles actualizado, con los dos
desarrollos nombrados y el archivo donde se ve que hoy no están.

**log.md** — `## [2026-09-25] ingest | El plan de 15 días deja de prometer lo que no existe`
- Grep del plan contra el código: `updateProduct` y el alta de local no existen.
- El plan los nombra como desarrollo y sigue entrando en 15 días hábiles.
- `founderOffer.remaining`: con `null` no se dice cuántos cupos quedan, con un número se dice, con
  0 la oferta se apaga sola. Verificados los tres estados.
- Los rangos de precio de la competencia dicen de dónde salen; la redacción se ajustó a lo que
  Steven afirmó y no más, porque una fuente inventada sería peor que el número sin fuente.
