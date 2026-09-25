# Estado del loop — Cierre de la entrega de la Carta (2026-09-25)

> Quinto bucle autónomo, sobre `main` @ `7b9c4e6` (1.2.0). Cierra la distancia entre lo que la
> web promete y lo que hoy se puede entregar: logo en la carta, fotos que abran con datos
> móviles, kit de QR y PDF, subtítulo por local y alta desde CSV.
> Prompt maestro: `LOOP-Cierre-Entrega-Carta-Datafud.md` (v1), decisiones CERRADAS D-042 a D-046.
> Si la sesión se corta: "Releé docs/plans/entrega-loop-state.md y continuá el loop".

## Contador

- Iteración actual: 8
- Iteraciones consumidas: 8 / 16
- **LOOP COMPLETO** (E01–E08 hechas, ninguna bloqueada)

## Capacidades del entorno

| Capacidad | Estado | Evidencia |
|---|---|---|
| Navegador real | Sí | Chromium headless shell 153.0.8010.12, `@playwright/test` 1.63 |
| Red a datafud.com | Sí, directa | `curl -o /dev/null -w "%{http_code}" https://datafud.com/` → `200` |
| `sharp` | Sí, **transitiva** | 0.35.4, llega por `next`. No está en `package.json`; ver el riesgo abajo |
| `qrcode` | Sí, declarada | `^1.5.4` en `dependencies` |
| gh CLI · git push a `main` | Sí | `gh auth status` → `stevengalocr` |
| Vercel | Sí (MCP) | Proyecto `datafud` `prj_n957iGSeYbe4GbTsDxlP0ytLHJSt` |
| Google Drive (vault) | Crea archivos; no edita `.md` existentes | Loop anterior: subida a `02-Proyectos/Datafud/Claude-Code/` |
| Puerto 3000 | Ocupado por otro proyecto | Todo lo local corre con `QA_BASE=http://localhost:3177` |

### Ajustes al repo (§3.2 del prompt)

- **`sharp` es una dependencia transitiva de `next`, no declarada.** El prompt la da por
  disponible y lo está (0.35.4), pero los scripts de este loop dependen de ella. Riesgo anotado:
  si una actualización de Next deja de arrastrarla, `carta-fotos.mjs` deja de correr. No se
  agrega a `package.json` porque el invariante §1.4 pide no sumar dependencias; queda como
  PENDIENTE-STEVEN para decidir si se declara.
- **El material pesado del fixture no se versiona.** El prompt pide 6 fotos de ≥ 2 MB en
  `scripts/fixtures/carta-prueba/`. Meter ~15 MB de imágenes generadas en un repo público es
  basura permanente en el historial, así que se versiona el **generador**
  (`scripts/fixtures/carta-prueba/generar.mjs`) y las salidas van a `.gitignore`. El fixture se
  reconstruye idéntico con un comando, que es lo que importa para poder repetir la medición.

## Unidades

| ID | Título | Estado | Intentos | Commit | Despliegue | Evidencia |
|---|---|---|---|---|---|---|
| E01 | Estado, línea base y fixture | hecho | 1 | `a90e21a` | READY | Línea base abajo |
| E02 | Alta desde CSV (D-046) | hecho | 1 | `3723d94` | READY | Ver informe |
| E03 | Fotos optimizadas (D-043) | hecho | 1 | `b5f2833` | READY | 15,07 MB → 1,20 MB |
| E04 | Logo en la cabecera (D-042) | hecho | 1 | `68b039c` | READY | Ver informe |
| E05 | Subtítulo por carta (D-045) | hecho | 1 | `525ebb7` | READY | Ver informe |
| E06 | Kit de entrega: QR y PDF (D-044) | hecho | 1 | `dbdcf94` | READY | Ver informe |
| E07 | Plan de 15 días y guía con fuente | hecho | 1 | `ad25cba` | READY | Ver informe |
| E08 | Verificación final y release 1.3.0 | hecho | 1 | `e1c242b` + release | READY | Ensayo cronometrado y puertas abajo |

## Herramientas de verificación del loop

En `.qa/bin/` (ignorada por git: son andamios, no producto). Desde la raíz del repo:

| Script | Qué comprueba |
|---|---|
| `node .qa/bin/peso-carta.mjs <base> /c/<slug>` | Cuánto pesa abrir la carta y recorrerla entera, a 390×844 |
| `node .qa/bin/leer-qr.mjs <png> <url>` | Que el PNG del kit codifique esa URL, módulo por módulo |
| `node .qa/bin/pdf-vista.mjs <pdf> <salida> [n]` | Renderiza páginas del PDF con pdf.js para mirarlas |
| `node .qa/bin/tagline-es-en.mjs <base>` | Subtítulo propio y del diccionario en los dos idiomas |
| `node .qa/bin/precio-idioma.mjs <base>` | Que el precio se escriba según el idioma que se lee |
| `node .qa/bin/gates.mjs https://datafud.com` | Puertas del loop anterior, que siguen aplicando |
| `./.qa/bin/kill-port.sh 3177` | Mata el `next start` local (en Windows `pkill` no lo alcanza) |

## Línea base (literal)

`main` @ `7b9c4e6`, versión 1.2.0.

```
$ npm run typecheck
> datfud@1.2.0 typecheck
> tsc --noEmit
(sin salida: limpio)

$ npm run lint
✔ No ESLint warnings or errors

$ npm run build
✓ Compiled successfully
37 rutas

$ QA_BASE=http://localhost:3177 npm run qa:landing
qa:landing → OK · 21 avisos
```

## Fixture de prueba

`scripts/fixtures/carta-prueba/` — un local ficticio, **Rancho La Parcela**, que estresa los
casos que el fixture del repo (`ejemplo`, la demo) no toca:

| Qué | Detalle |
|---|---|
| `menu.csv` | 14 platillos, 3 categorías (Entradas, Fuertes, Bebidas) |
| Moneda | **USD**, para ejercitar los precios con decimales (`formatMoney`); la demo es CRC y `formatCrc` los tira |
| Bilingüe | ES/EN en nombre y descripción |
| Platillo sin foto | 5 de los 14 (`Sopa negra`, `Olla de carne`, `Vegetariano del día` y las 5 bebidas) |
| Platillo sin descripción | `Sopa negra`, sin `desc_es` ni `desc_en` |
| Subtítulo propio | "Ordená en caja y te llamamos por tu nombre." — una soda que no tiene saloneros |
| Fotos | 6 JPEG de 3200×2400 y ~2,4 MB cada una (~15 MB en total) |
| Logo | `logo.png` de 800×800, 32 KB |
| Código QR | `prub26` |

```
$ node scripts/fixtures/carta-prueba/generar.mjs
ceviche.jpg          3200×2400  2.4 MB
patacones.jpg        3200×2400  2.4 MB
chifrijo.jpg         3200×2400  2.4 MB
casado.jpg           3200×2400  2.4 MB
pescado.jpg          3200×2400  2.5 MB
arroz-camarones.jpg  3200×2400  2.5 MB
logo.png             800×800    32 KB
```

## PENDIENTES-STEVEN

Los del loop anterior siguen abiertos (ver `docs/plans/oferta-loop-report.md`), más:

- Imprimir el stand de muestra con `https://datafud.com/q/demo26`.
- Decidir el IVA (propuesta: incluido) y si se puede emitir factura electrónica 4.4.
- Confirmar D-033 a D-038 (`docs/ventas/OFERTA.md` §5).
- WhatsApp Business (nombre DataFud, logo, catálogo).
- Fotos reales de los 4 stands; redes y Google Business Profile.
- Actualizar `founderOffer.remaining` con cada fundador que cierre.
- **Decidir si `sharp` se declara en `package.json`.** Hoy llega por `next` y los scripts de
  entrega dependen de ella.
- **Escanear con un teléfono de verdad** el QR impreso de un kit antes de entregarle el primero a
  un cliente. La comprobación automática lee los píxeles del PNG; no reemplaza la prueba real.
- **Guardar el respaldo de los rangos de precio de la competencia** que publica
  `/menu-digital-costa-rica`: qué proveedores, qué precios, qué fecha.
- **Decidir si se ajusta D-043.** Su objetivo de "< 2 MB con 60 platillos" no se cumple recorriendo
  la carta entera (son 3,34 MB, medidos); lo que sí se cumple es "< 2 MB al abrir".

## Informes por unidad

### E01 · Estado, línea base y fixture de prueba

1. **Qué se puede hacer ahora que antes no.** Medir. Hasta acá no había con qué probar el alta de
   una carta real: el único contenido del repo es la demo, que ya viene liviana y en colones.
2. **Criterios.**
   - ✅ Línea base pegada literal arriba: typecheck limpio, lint sin avisos, build con 37 rutas,
     `qa:landing → OK · 21 avisos`.
   - ✅ Fixture creado y reproducible con un comando (salida literal arriba).
3. **Commit y despliegue.** Ver la tabla.
4. **Qué quedó fuera y por qué.** Las imágenes del fixture no se versionan; se versiona el
   generador. Ver "Ajustes al repo".
5. **Lo que no se pudo verificar.** Nada.

### E02 · Alta desde CSV (D-046)

1. **Qué se puede hacer ahora que antes no.** Dar de alta una carta desde una hoja de cálculo.
   Antes había que escribir a mano el `.ts` de 60 platillos, que es lento y deja erratas en los
   precios justo donde más caro salen.
2. **Ver fallar primero.**
   ```
   $ node scripts/carta-nueva.mjs prueba --dir scripts/fixtures/carta-prueba
   node:internal/modules/cjs/loader:1479
     throw err;   (Cannot find module … carta-nueva.mjs)
   ```
3. **Criterios.**
   - ✅ Con el fixture, el comando genera un `.ts` que compila (`tsc --noEmit` limpio) y `/c/prueba`
     renderiza los 14 platillos (`grep -o '<article' | wc -l` → `14`), con los precios en USD y
     decimales: `$8,50`, `$14,90`, `$18,75`.
   - ✅ Un CSV con precio `abc` falla señalando la fila:
     ```
     ERROR  …/menu.csv tiene 2 problema(s):
            - fila 6 ("Casado con lomito"): precio "abc" no es un número.
            - fila 11: la categoría está vacía.
     ```
   - ✅ También rebotan: foto que no está, código con caracteres ambiguos, código en uso, código
     reservado, slug repetido y los límites del plan Carta leídos de `PRICING`.
   - ✅ El fixture se saca de `CARTAS` antes del commit (`scripts/carta-borrar.mjs prueba
     --fixture`), y la ida y vuelta deja `index.ts` y `qr.ts` sin un solo cambio de contenido.
4. **Qué quedó fuera y por qué.** Dos cosas del repo que estaban mal y salieron al escribir el
   validador, arregladas acá porque el validador no podía ser coherente con ellas:
   - El comentario de `qr.ts` prohibía la letra `o` en los códigos, pero el propio `demo26` la
     usa. La regla estaba mal planteada: si el dígito `0` no está en el alfabeto, oír "o" no
     tiene con qué confundirse. Ahora se excluyen `0`, `1`, `l` e `i`, con el porqué al lado.
   - El chequeo de códigos repetidos no veía los **reservados**, que quedan comentados al dar de
     baja un local. Se podía reutilizar el código de un local que se fue, que es exactamente lo
     que D-014 prohíbe. Verificado que antes pasaba y ahora falla.
5. **Lo que no se pudo verificar.** Nada.

### E03 · Fotos optimizadas (D-043)

1. **Qué se puede hacer ahora que antes no.** Entregar una carta que abra en la mesa con datos
   móviles.
2. **Ver fallar primero.** Con las fotos servidas tal cual, medido en Playwright a 390×844
   recorriendo la carta entera:
   ```
   image/jpeg    14.62 MB
   TOTAL         15.07 MB
   peso-carta → FALLO: 15.07 MB (límite 2,00 MB)
   ```
   Y el chequeo de peso contra esas mismas fotos: `check:cartas → 6 fallo(s)`, exit 1.
3. **Criterios.**
   - ✅ El chequeo falla con un JPEG de 2,5 MB copiado a mano (`es .jpg`), con un webp de
     1415 KB (`supera el límite de 150 KB`) y con un logo de 7670 KB (`supera el límite de
     60 KB`). El `build` se detiene: no llega a compilar.
   - ✅ Con el fixture procesado, `/c/prueba` pasa de 15,07 MB a **1,20 MB**.
   - ✅ Captura 390 mirada.
4. **Qué quedó fuera y por qué.** **D-043 dice "≤ 150 KB por foto" y "< 2 MB con 60 platillos", y
   las dos cosas juntas no se pueden**: 60 × 150 KB son 9 MB. No es una interpretación, se midió:
   una carta de 60 platillos daba **3,65 MB al abrir y 8,04 MB recorrida entera**. Se repartió un
   presupuesto de 3 MB entre las fotos de cada carta (51 KB con 60 fotos, el techo de 150 KB con
   6) y se baja primero el ancho y después la calidad, porque de 800 a 640 px no se nota nada —la
   foto se muestra en un cuadro de 96 px, o sea 288 px en un teléfono de 3×— y bajar la calidad sí
   se ve en las texturas de la comida. Resultado con 60 platillos: **1,69 MB al abrir y 3,34 MB
   recorrida entera**.
5. **Lo que no se pudo verificar.** Que una carta de 60 platillos quede bajo 2 MB **recorrida
   entera**: son 3,34 MB y no hay forma de bajarlos sin destruir las fotos. Lo que sí se cumple, y
   es lo que decide si la carta sirve en la mesa, es **< 2 MB al abrir**. Queda dicho así para que
   nadie lo lea de más.

### E04 · Logo en la cabecera (D-042)

1. **Qué se puede hacer ahora que antes no.** Cumplir "carta a tu marca: colores, logo y fotos",
   que es texto publicado en la tarjeta del plan Carta.
2. **Ver fallar primero.** `logo_url` viajaba en el payload y no se pintaba:
   ```
   logo_url en el payload:  logo.webp
   <img> de logo en la página:  0
   ```
3. **Criterios.**
   - ✅ Después: `<img src="/cartas/prueba/logo.webp" alt="Rancho La Parcela" width="52"
     height="52" …>` en `/c/prueba`.
   - ✅ `/c/ejemplo` sin logo propio sigue igual; el logo solo aparece cuando `logo_url` existe.
   - ✅ Capturas 390 y 1280 miradas: arriba a la izquierda, sobre fondo blanco redondeado, y el
     conmutador ES/EN no se movió.
4. **Qué quedó fuera y por qué.** Dos añadidos que no estaban en la especificación:
   - La demo tenía `logo_url: null`, así que era justo la carta que **no** enseñaba la promesa que
     vende. Se le hizo un logo al restaurante ficticio, con el monograma ocupando casi todo el
     cuadro porque a 52 px una marca con detalles finos es una mancha (se rehízo tras mirarlo).
   - El banner de la demo desbordaba: al sumarle el tercer enlace en el loop anterior, a 375 px la
     fila se partía en tres líneas dentro de una barra de 41 px fijos y se montaba sobre la
     cabecera de la carta. Las etiquetas pasan a tener dos largos. Medido: alto 41 px y sin
     desborde a 375 y a 1280.
5. **Lo que no se pudo verificar.** Nada.

### E05 · Subtítulo por carta (D-045)

1. **Qué se puede hacer ahora que antes no.** Entregarle una carta a una soda que cobra en caja
   sin decirle al comensal que hable con un salonero que no existe.
2. **Ver fallar primero.** `grep -rn "salonero" src` daba 4 líneas, una de ellas el subtítulo fijo
   de toda carta; y el `tagline` del fixture se ignoraba (visible en las capturas de E03 y E04).
3. **Criterios.**
   - ✅ En navegador: `/c/prueba` ES "Ordená en caja y te llamamos por tu nombre." → EN "Order at
     the counter and we will call your name."; `/c/ejemplo` ES "Nuestra carta." → EN "Our menu.".
   - ✅ `grep -rn "salonero" src` queda en 1: el comentario que explica por qué el texto ya no lo
     dice.
4. **Qué quedó fuera y por qué.** El criterio pedía 0 apariciones de "salonero" en `src`. Dos de
   las que había no eran del producto: una frase de la guía para restaurantes turísticos (donde
   un salonero sí existe) y la descripción del plan Carta en `/preview`. La de `/preview` tenía el
   mismo problema de fondo y se corrigió; la de la guía se reescribió como "alguien del equipo",
   que dice lo mismo sin suponer el puesto.
5. **Lo que no se pudo verificar.** Nada.

### E06 · Kit de entrega: QR y PDF (D-044)

1. **Qué se puede hacer ahora que antes no.** Cumplir dos promesas publicadas que hasta hoy eran
   trabajo manual improvisado: el QR provisional del mismo día y el PDF de respaldo.
2. **Ver fallar primero.** `scripts/carta-kit.mjs` no existía.
3. **Criterios.**
   - ✅ Los cuatro archivos existen para el fixture: `qr-prub26.png`, `qr-prub26.pdf`,
     `carta-prueba.pdf` y `carta-prueba-en.pdf`.
   - ✅ El PNG, decodificado módulo por módulo desde sus píxeles, da exactamente
     `https://datafud.com/q/prub26`: `módulos distintos: 0`. Contra cualquier otra URL, falla.
   - ✅ Los tres PDF renderizados con pdf.js y mirados: la carta con logo, subtítulo, una
     categoría por página y pie con el local, la URL `/q/` y el número de página; la versión en
     inglés íntegra en inglés; la hoja de QR con 4 tarjetas para recortar.
   - ✅ Sin código impreso, el script se niega y explica por qué (D-014).
4. **Qué quedó fuera y por qué.** Dos cosas que solo aparecieron al **mirar** los PDF, no al
   escribirlos:
   - La cabecera salía **rosada**. El degradado de pantalla lleva transparencia y al pasar a PDF
     la mezcla queda a merced del visor; en pantalla y en `@media print` de Chromium se veía
     verde. En papel va el color plano del local.
   - El PDF pesaba **5,88 MB** con 14 platillos, y 5,4 de esos eran las 6 fotos: Chromium no mete
     el `.webp` tal cual, lo reencodifica sin pérdida (medido: sin fotos, 0,17 MB). Pasándolas a
     JPEG de 240 px justo antes de imprimir quedó en **212 KB**, 28 veces menos y sin diferencia
     visible en la captura.
5. **Lo que no se pudo verificar.** Que la librería `qrcode` codifique bien: la matriz de
   referencia sale de la misma librería, así que la comprobación detecta un archivo corrupto o una
   URL equivocada, no un error del codificador. **Escanear el stand impreso con un teléfono de
   verdad sigue siendo la prueba final** y está en PENDIENTES.

### E07 · Plan de 15 días honesto y guía con fuente

1. **Qué se puede hacer ahora que antes no.** Enseñarle el plan del sistema completo a un cliente
   sin prometer una demostración imposible.
2. **Ver fallar primero.** Grep del plan contra el código:
   ```
   setTenantStatus            src/app/admin/actions.ts
   registerPayment            src/app/admin/actions.ts
   registerCharge             src/app/admin/actions.ts
   createProduct              src/app/dashboard/actions.ts
   toggleProductAvailability  src/app/dashboard/actions.ts
   deleteProduct              src/app/dashboard/actions.ts
   updateProduct              NO EXISTE
   createTenant               NO EXISTE
   ```
3. **Criterios.**
   - ✅ El plan nombra los dos desarrollos que faltan, con el archivo donde se ve que no están, y
     entra en los mismos 15 días hábiles. Fuera el "probar editar un platillo" que no se puede.
   - ✅ `founderOffer.remaining` verificado en los tres estados sobre el HTML servido:
     `null` → la oferta se ve y no dice cuántos quedan; `4` → "Quedan 4 de 10";
     `0` → la oferta desaparece entera.
   - ✅ La guía dice de dónde salen los rangos de precio y que una cotización en la mano gana
     sobre el rango.
4. **Qué quedó fuera y por qué.** La redacción de la fuente se ajustó a lo que Steven afirmó en el
   prompt —"precios publicados por proveedores locales en setiembre de 2026"— y no más. Un primer
   intento agregaba detalles de procedencia ("publican en sus propios sitios", "no incluye a los
   que cotizan a pedido") que nadie puede sostener desde el repo: cambiar un número sin fuente por
   una fuente inventada es peor que el problema original. **Queda en PENDIENTES que Steven guarde
   el respaldo de esas cifras.**
5. **Lo que no se pudo verificar.** Que los rangos de precio del mercado sean correctos: es un
   dato que no está en el repo.

### E08 · Verificación final y release 1.3.0

1. **Qué se puede hacer ahora que antes no.** Saber cuánto tarda de verdad dar de alta una carta,
   porque alguien lo hizo y lo cronometró, y saber qué le falta a la documentación por lo que le
   faltó a esa persona.

2. **El ensayo cronometrado.** Alguien con contexto fresco dio de alta la carta `ensayo` con el
   fixture **siguiendo solo `OFERTA.md` §4 y `src/content/cartas/index.ts`**, generó el kit y dejó
   el repo limpio.

   | Etapa | Minutos |
   |---|---|
   | Leer la documentación y ubicar el fixture | 0,5 |
   | Copiar el material, `--dry-run` y alta real | 0,2 |
   | `typecheck` + `lint` + `build` | 0,7 |
   | **Verificar `/c/ensayo` en el navegador** | **2,5** |
   | Kit de entrega | 0,4 |
   | Baja y limpieza | 1,1 |
   | **Total** | **≈ 5,7** |

   **Qué se puede prometer internamente con esto.** El trabajo real de dar de alta una carta ya
   cargada son unos **2 minutos de comandos**; los 2,5 minutos de la verificación fueron casi
   todos tropiezos y ya están corregidos. Pero el número **no** es el tiempo de entrega de un
   cliente: el reloj es de un agente, no de una persona, y sobre todo el fixture ya venía con el
   menú pasado a CSV, las fotos elegidas, las traducciones escritas y los colores decididos. **Eso
   es lo que se lleva las horas de una entrega de verdad.** Lo que este ensayo prueba es que la
   parte técnica dejó de ser el cuello de botella dentro de las 48 h prometidas.

3. **Hallazgos y qué se hizo con cada uno** (commit `e1c242b`):

   | # | Hallazgo | Estado |
   |---|---|---|
   | 1 | Al armar el kit sin desplegar, lo natural era `--base http://localhost:PORT`, **y eso queda grabado dentro del QR**, que después se imprime | Corregido: `--base` solo acepta dirección pública y el error manda a `--servidor` |
   | 2 | Los precios en inglés salían con coma decimal (`$8,50`) | Corregido: el precio se escribe según el idioma que se está leyendo |
   | 3 | `index.ts` seguía describiendo el alta manual de 4 pasos, contradiciendo a `OFERTA.md` | Corregido, y dice que ese archivo lo escribe el script |
   | 4 | El error del kit contra una carta no desplegada no ofrecía salida | Corregido |
   | 5 | `carta-borrar` dejaba `public/cartas/` vacío y `git status` engañaba | Corregido |
   | 6 | La documentación no menciona el fixture ni cómo ensayar en local | Documentado en `OFERTA.md` §4 |
   | 7 | `next start` sirve el build que había cuando arrancó: una carta nueva da 404 hasta reiniciarlo, y parece un error del alta | Documentado en `OFERTA.md` §4 y en las trampas de `CLAUDE.md` |
   | 8 | La baja deja a propósito un cambio en `qr.ts` que se commitea, y eso no estaba escrito | Documentado en los dos lados |
   | 9 | No pudo mirar los PDF: no hay `pdftoppm` en la máquina | Ya verificados en E06 con `pdf.js` (`.qa/bin/pdf-vista.mjs`) |
   | 10 | El puerto 3177 estaba ocupado por otro `next start` del mismo repo que servía un build viejo | Del entorno, no del repo. Ya anotado en las capacidades |

   El hallazgo 1 es el que más importaba: no rompía nada visible y habría salido a imprenta.

4. **Un error mío que el ensayo destapó.** El commit de E02 dice haber documentado el flujo nuevo
   en `src/content/cartas/index.ts`, y no era cierto: el cambio se perdió en un `git checkout` que
   hice mientras depuraba la ida y vuelta del alta y la baja, y no lo volví a comprobar. Quedó
   reaplicado en `e1c242b`. La lección para el próximo loop: después de revertir un archivo para
   depurar, revisar qué más se llevó por delante.

5. **Lo que no se pudo verificar.** Lo mismo que en E06: que la librería que genera los QR
   codifique bien, porque la comprobación usa la misma librería como referencia. **Escanear con un
   teléfono de verdad un stand impreso sigue siendo la prueba final** y está en PENDIENTES.

## Puertas (§5)

| Puerta | Estado | Evidencia |
|---|---|---|
| **A** typecheck · lint · build (con el chequeo de peso) · qa:landing | ✅ | `tsc` limpio; `✔ No ESLint warnings or errors`; `check:cartas → OK` antes de compilar; `qa:landing → OK · 21 avisos` |
| **B** Carta del fixture: logo, subtítulo propio, ES/EN, < 2 MB, sin "Agregar" | ✅ | Logo `<img alt="Rancho La Parcela">`; subtítulo propio en los dos idiomas; **1,21 MB al abrir**; 0 "Agregar" |
| **C** Kit generado: PNG y PDF del QR a `/q/<código>` y PDF de la carta ES y EN | ✅ | 4 archivos; el PNG decodificado da `https://datafud.com/q/prub26` (0 módulos distintos) y falla contra otra URL; los 3 PDF renderizados y mirados |
| **D** Producción: `/c/ejemplo` 200, `/q/demo26` 307, `/preview/cliente` con pedidos | ✅ | 200 · `Location: https://datafud.com/c/ejemplo` · 28 "Agregar" |
| **E** 0 cartas de prueba publicadas | ✅ | `/c/prueba`, `/c/grande`, `/c/ensayo`, `/c/sincodigo`, `/c/otrolocal` → **404** en producción |
| **F** `git diff 7b9c4e6 -- supabase/ src/lib/constants.ts` sin cambios salvo `founderOffer.remaining` | ✅ | `supabase/` sin diferencias; `constants.ts` solo `remaining` y los dos helpers que lo leen. Ningún precio, límite ni plazo |
| **G** 0 "salonero", 0 correo, 0 "proyecto chico" en rutas públicas | ✅ | 11 rutas de producción, todas en 0 |
