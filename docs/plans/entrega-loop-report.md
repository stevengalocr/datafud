# Informe del loop — Cierre de la entrega de la Carta (2026-09-25)

> Quinto bucle autónomo sobre `main`, de `7b9c4e6` (1.2.0) a la versión **1.3.0**.
> Estado detallado: `docs/plans/entrega-loop-state.md`. Puente al vault:
> `docs/vault-sync/2026-09-25-entrega-carta.md`.

## Resumen

El loop anterior dejó la web coherente con lo que se vende. Este cierra la distancia entre lo que
la web **promete** y lo que se podía **entregar**. La revisión independiente de 1.2.0 había
encontrado tres promesas publicadas que no se cumplían, y las tres están cerradas:

| Promesa publicada | Antes | Ahora |
|---|---|---|
| "Carta a tu marca: colores, logo y fotos" | El logo viajaba en el payload y **nadie lo pintaba** | Se pinta en la cabecera, a 52 px sobre fondo blanco |
| Una carta que abra en la mesa | 6 fotos de teléfono = **15,07 MB** | **1,20 MB**. Con 60 platillos, 1,69 MB al abrir |
| "Un QR provisional" y "te mandamos un PDF de tu carta" | Trabajo manual, sin herramienta | `carta-kit.mjs`: QR en PNG, hoja de 4 QR para recortar y PDF en los dos idiomas |

Además: dar de alta una carta dejó de ser escribir un `.ts` a mano y pasó a ser una hoja de
cálculo más un comando; el subtítulo dejó de suponer que el local tiene saloneros; y el plan de
15 días del sistema completo dejó de dar por hechas dos funciones que no existen.

## Unidades

| ID | Título | Estado | Commit |
|---|---|---|---|
| E01 | Estado, línea base y fixture | hecho | `a90e21a` |
| E02 | Alta desde CSV (D-046) | hecho | `3723d94` |
| E03 | Fotos optimizadas (D-043) | hecho | `b5f2833` |
| E04 | Logo en la cabecera (D-042) | hecho | `68b039c` |
| E05 | Subtítulo por carta (D-045) | hecho | `525ebb7` |
| E06 | Kit de entrega: QR y PDF (D-044) | hecho | `dbdcf94` |
| E07 | Plan de 15 días honesto y guía con fuente | hecho | `ad25cba` |
| E08 | Verificación final y release 1.3.0 | hecho | `e1c242b` + release |

Ocho unidades, un intento cada una, ninguna bloqueada. 8 iteraciones de las 16 del tope.

## Cuánto tarda dar de alta una carta

Alguien con contexto fresco lo hizo **siguiendo solo la documentación**, cronometrando: **≈ 5,7
minutos** en total, de los cuales 2,5 fueron tropiezos que ya están corregidos. El trabajo real de
comandos son unos **2 minutos**.

**Ese número no es el tiempo de entrega de un cliente.** El fixture ya venía con el menú pasado a
CSV, las fotos elegidas, las traducciones escritas y los colores decididos: eso es lo que se lleva
las horas de una entrega de verdad. Lo que el ensayo prueba es que **la parte técnica dejó de ser
el cuello de botella** dentro de las 48 horas prometidas.

## Lo que encontró el ensayo

Nueve tropiezos, todos corregidos o documentados en `e1c242b`. Los dos que importaban:

1. **El kit grababa la URL del servidor local dentro del QR.** Al armar un kit sin haber
   desplegado, lo natural era pasar `--base http://localhost:PORT`, y eso queda impreso en el
   stand para siempre. No rompía nada visible: habría salido a imprenta. Ahora `--base` solo
   acepta una dirección pública y el error manda a `--servidor`, que es lo que hacía falta.
2. **Los precios en inglés salían con coma decimal** (`$8,50`). Un turista que leyó el resto de la
   carta en inglés lee esa coma como separador de miles, y el precio es lo único de una carta que
   no puede prestarse a una segunda lectura.

Los otros siete: el error del kit no ofrecía salida; `carta-borrar` dejaba `public/cartas/` vacío
y `git status` engañaba; y cuatro cosas que costaban tiempo y no estaban escritas (el fixture de
ensayo, que `next start` sirve el build que había cuando arrancó, que la baja deja a propósito un
cambio en `qr.ts` que se commitea, y cómo ensayar en local).

También destapó **un error mío**: el commit de E02 decía haber actualizado el comentario de
`src/content/cartas/index.ts` y no era cierto — el cambio se perdió en un `git checkout` que hice
depurando, y no lo volví a comprobar. Quedó reaplicado.

## Puertas (§5)

| Puerta | Estado |
|---|---|
| **A** typecheck · lint · build (con el chequeo de peso) · qa:landing | ✅ `qa:landing → OK · 21 avisos` |
| **B** Carta del fixture: logo, subtítulo propio, ES/EN, < 2 MB, sin "Agregar" | ✅ 1,21 MB al abrir |
| **C** Kit: PNG y PDF del QR a `/q/<código>`, PDF de la carta ES y EN | ✅ el PNG decodificado da `/q/prub26`; los 3 PDF mirados |
| **D** Producción: `/c/ejemplo` 200, `/q/demo26` 307, `/preview/cliente` con pedidos | ✅ |
| **E** 0 cartas de prueba publicadas | ✅ cinco slugs de prueba → 404 |
| **F** `supabase/` y `constants.ts` sin cambios salvo `founderOffer.remaining` | ✅ |
| **G** 0 "salonero", 0 correo, 0 "proyecto chico" en rutas públicas | ✅ 11 rutas |

La evidencia literal de cada una está en `docs/plans/entrega-loop-state.md`.

## Lo que no se pudo verificar

- **Que un teléfono de verdad escanee el stand impreso.** La comprobación automática lee los
  píxeles del PNG y los compara con la matriz que genera la misma librería: detecta un archivo
  corrupto o una URL equivocada, no un error del codificador. Es el primer PENDIENTE.
- **Que los rangos de precio de la competencia sean correctos.** Es un dato que no está en el
  repo. La redacción se ajustó a lo que Steven afirmó y nada más: cambiar un número sin fuente por
  una fuente inventada habría sido peor que el problema original.
- **El objetivo de D-043 tal como está escrito.** Pide ≤ 150 KB por foto y "< 2 MB con 60
  platillos", y las dos cosas juntas no se pueden: 60 × 150 KB son 9 MB. Medido, una carta de 60
  platillos quedó en **1,69 MB al abrir y 3,34 MB recorrida entera**. Lo que se cumple, y es lo
  que decide si la carta sirve en la mesa, es "< 2 MB al abrir".

## PENDIENTES-STEVEN

Siguen los del loop anterior (ver `docs/plans/oferta-loop-report.md`), más:

1. **Escanear con un teléfono** el QR impreso de un kit antes de entregarle el primero a un
   cliente.
2. **Imprimir el stand de muestra** con `https://datafud.com/q/demo26`.
3. **Guardar el respaldo de los rangos de precio** de la competencia que publica
   `/menu-digital-costa-rica`: qué proveedores, qué precios, qué fecha.
4. **Decidir si se ajusta D-043** a "< 2 MB al abrir", que es lo que se puede cumplir y medir.
5. **Decidir si `sharp` se declara en `package.json`.** Hoy llega como dependencia transitiva de
   Next y los scripts de entrega dependen de ella.
6. **Actualizar `founderOffer.remaining`** con cada fundador que cierre; con 0 se apaga sola.
7. Decidir el IVA y la factura electrónica 4.4; confirmar D-033 a D-038 de `OFERTA.md` §5;
   WhatsApp Business; fotos reales de los 4 stands; redes y Google Business Profile.

## Vault

El puente `docs/vault-sync/2026-09-25-entrega-carta.md` está completo, con los hashes reales de
las ocho unidades, y se subió al vault de Obsidian como archivo nuevo en
`02-Proyectos/Datafud/Claude-Code/vault-sync-2026-09-25-entrega-carta.md`. El conector de Drive de
esta sesión crea archivos pero no edita el contenido de los `.md` que ya existen, así que las
páginas del vault se actualizan con "sincronizá el vault", aplicando el resumen que encabeza el
archivo subido.
