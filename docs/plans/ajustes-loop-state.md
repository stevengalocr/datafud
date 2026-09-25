# Estado del loop — Ajustes finales (2026-09-25)

> Octavo bucle autónomo, sobre `main` @ `44f24d6` (1.4.0). Cierra lo que dejaron abiertos los
> revisores del loop "pulido" (`docs/plans/pulido-loop-state.md` → PENDIENTES-STEVEN).
> Prompt maestro: `LOOP-Ajustes-Finales-Datafud.md` (v1), decisiones CERRADAS D-057 a D-062.
> Si la sesión se corta: "Releé docs/plans/ajustes-loop-state.md y continuá el loop".

## Contador

- Iteración actual: 5
- Iteraciones consumidas: 5
- **LOOP COMPLETO** (A01–A05 hechas, ninguna bloqueada)

## Capacidades del entorno

Las mismas del loop "pulido" (ver su estado): Chromium de Playwright, venv temporal con OpenCV y
fontTools en el scratchpad, Vercel por MCP (proyecto `prj_n957iGSeYbe4GbTsDxlP0ytLHJSt`), todo lo
local en `:3177`. Herramientas en `.qa/bin/` (ignorada por git), incluidas `puertas.sh` (puertas
B–G), `faq-ld.mjs`, `glifos.mjs`, `salto.mjs`, `contraste.mjs` y `contraste-texto.mjs`.

### Ajustes al repo (verificación del terreno)

- El repo coincide con el prompt: `main` @ `44f24d6`, 1.4.0, árbol limpio.
- **FAQ en escritorio:** la columna izquierda ya es `lg:sticky lg:top-28`. En una captura de
  página completa el bloque *sticky* queda pintado en una sola posición y el resto de la columna
  se ve vacío: es lo que vio el revisor. A03 lo comprueba con capturas del viewport mientras se
  recorre la lista, no con la de página completa.
- **"≈ US$" en planes:** confirmado a 1440 (`.qa/ajustes/a01-planes-1440-crop.png`): en la Carta
  va en la línea del precio y en Estándar y Empresarial cae a la siguiente.

## Unidades

| ID | Título | Estado | Intentos | Commit | Despliegue | Evidencia |
|---|---|---|---|---|---|---|
| A01 | Estado y línea base | hecho | 1 | `ae568e2` | READY `dpl_Ay1LH5qL…` | Abajo |
| A02 | Condiciones (D-057 a D-061) | hecho | 1 | `96b3527` | READY `dpl_FnuznXxm…` | Abajo |
| A03 | Pulido visual | hecho | 1 | `bef7c02` | READY `dpl_DyNvGYak…` | Abajo |
| A04 | Nombre comercial (D-062) | hecho | 1 | `215a69b` | READY `dpl_2xFANABp…` | Abajo |
| A05 | Verificación, release 1.4.1 y puente | hecho | 1 | `49f8311` | READY `dpl_DbfHPVz2…` | Abajo e informe |

## Línea base (literal)

```
$ npm run build → build=0
$ QA_BASE=http://localhost:3177 npm run qa:landing → qa:landing → OK · 23 avisos
```

Capturas (miradas) en `.qa/ajustes/`: `a01-hero-{375,1440}.png` y
`a01-{demo,planes,hardware,preguntas}-{375,1440}.png`. Lo que se ve y entra en A03:

- Hero a 375: el botón flotante de WhatsApp tapa la esquina inferior derecha del render.
- Planes: "≈ US$" mezclado (en línea en la Carta, abajo en Estándar y Empresarial a 1440).
- `#demo`: el teléfono dice "SODA TICA" bajo "Verde Limón"; la carta real dice "Nuestra carta.".

## PENDIENTES-STEVEN (fuera de este loop, §4)

- Factura electrónica 4.4 → cuando esté confirmada, la respuesta "¿Me dan factura?" del FAQ.
- Fotos reales de los stands en `public/hardware/` (reemplazan los renders borrosos a 1440).
- Redes en `SITE.social`.
- `founderOffer.remaining`.
- **Del revisor de A04 (dueño de soda), para decidir:** "DataFud es una empresa costarricense"
  (D-041, `#confianza`) le hace esperar una S.A. al lado de "el nombre comercial con el que opera
  Steven Galo"; propone "un servicio costarricense". No se cambió porque D-062 dice que D-041 no
  cambia. También pidió una cédula para la factura: no se publica (el repo es público; ver
  `src/lib/site.ts`).

## Informes por unidad

### A01 · Estado y línea base

- Build y `qa:landing` en verde sobre `44f24d6`; capturas de línea base tomadas y miradas.

### A02 · Condiciones (D-057 a D-061)

- **`PRICING`:** `founderOffer.text` y `.short` (D-057, el monto sale de `formatCrc(SETUP_FEE.carta.crc)`);
  `terms.guarantee48h` y `terms.businessDays` (D-060); `terms.hardwarePayment` (D-059);
  `terms.upgradeCredit` y nuevo `terms.upgradeCreditFounder` (D-058). **Montos: 0 líneas
  cambiadas** en `constants.ts` contra `44f24d6`.
- **FAQ (18, sin preguntas nuevas):** primer mes (fundadores en cualquier plan), garantía (material
  + pago, lo que llegue último), "hábiles" (vía `businessDays`), empezar con la Carta (D-058, con
  la línea del fundador mientras la oferta esté activa), hardware (vía `hardwarePayment`).
  `FAQ: 18 visibles · 18 en JSON-LD · 0 diferencias`.
- **Términos 1.2:** descripción y título de la sección con "48 horas hábiles"; plazo desde material
  + pago; "Pasar de la Carta…" con D-058 y la línea del fundador; "Oferta de fundadores" con D-057.
  `/terminos → Versión 1.2`.
- **D-061:** meta description, alt y título de la imagen OG, pie de la imagen OG ("CARTA EN 48
  HORAS HÁBILES · SISTEMA EN 15 DÍAS HÁBILES") y las dos guías que decían "48 horas" / "15 días".
  JSON-LD de los planes ya usaba `deliveryLabel` ("hábiles") desde 1.4.0.
  **Ajuste:** D-061 da por hecho una "línea de garantía debajo" del H1 que no existía; la línea de
  precio del hero pasa de "Te la montamos nosotros" a "Garantía: carta en 48 horas hábiles" (queda
  bajo los botones, no pegada al H1).
- **grep en el HTML servido** (`/`, `/terminos`, `/privacidad`, las 3 guías, `/preview`,
  `/c/ejemplo`; quitando los `<!-- -->` de React): "48 horas" sin "hábiles" solo en
  `/: …lista en 48 horas</span></h1>`. El H1 no tiene `aria-label`. En el código, fuera del H1,
  solo quedan identificadores (`guarantee48h`) y comentarios.
- **Documentos:** `OFERTA.md` (fundadores, pagos, D-057 a D-061 en §5), `PRODUCT.md`,
  `MARKETING.md`, `KIT-PROSPECCION.md` (fundadores, garantía, plazos, mensaje del día 7, objeción
  de pedidos) y `CONTENIDO-30-DIAS.md` (c12).
- **Revisor fresco** (subagente sin contexto, frase por frase contra §2). Corregido: en los términos
  "el plazo empieza cuando lleguen [los materiales]" no mencionaba el pago (ahora "material y pago,
  lo que llegue último"); el FAQ de garantía no decía "lo que llegue último"; la pastilla del hero
  no decía "en cualquier plan". Confirmó 0 "48 horas" sin "hábiles" fuera del H1.
- Capturas miradas: `.qa/ajustes/a02-vista.png` (línea del hero, tarjeta de fundadores e imagen OG).
- Puertas: typecheck 0 errores, lint ✔, build 0, `qa:landing → OK · 23 avisos`,
  `git diff 6b3c231 -- supabase/` vacío.

### A03 · Pulido visual

Capturas antes (build con A02, sin A03) y después, con `.qa/bin/a03-shots.mjs`,
`a03-precios.mjs` y `faq-sticky.mjs`; todas miradas.

- **Botón flotante de WhatsApp (375).** `WhatsAppFloat` pasa a componente de cliente: un
  `IntersectionObserver` sobre el elemento marcado `data-wa-float-despues` (el hero de la landing y
  el encabezado de las guías) lo muestra recién cuando ese bloque sale de la pantalla. Oculto
  lleva `aria-hidden`, `tabIndex={-1}` y `pointer-events: none`; sin marcador se muestra siempre y
  sin JavaScript también (regla `[data-wa-float]` en el `noscript` de `layout.tsx`): nunca queda
  escondido para siempre. Medido:
  ```
  antes    375 arriba: flotante opacity=1 pointer=auto   (tapa la esquina del render)
  después  375 arriba: flotante opacity=0 pointer=none
  después  375 pasado el hero: flotante opacity=1 pointer=auto
  ```
  Captura: `.qa/ajustes/a03-comp-hero.png` (antes, después arriba, después al bajar).
- **"≈ US$".** En los planes y en `PriceTag` de `#hardware` la referencia en dólares va con
  `basis-full` (siempre en su propia línea) y `≈&nbsp;` (no se parte). Recortes de los 7 bloques de
  precio a 375, 768 y 1440: `.qa/ajustes/a03-comp-precios.png`; ninguno la mezcla.
- **FAQ en escritorio: sin cambio de código.** La columna izquierda ya es `lg:sticky lg:top-28`.
  En el viewport real, recorriendo la lista:
  ```
  1440 inicio: título izquierdo a 282px del borde superior · mitad: 140px · final: 140px
  1024 inicio: 268px · mitad: 140px · final: 140px
  ```
  El título y la tarjeta de WhatsApp acompañan toda la lista (`.qa/ajustes/a03-comp-faq.png`).
  La "columna vacía" solo existe en capturas de página completa, que pintan el bloque *sticky*
  en una sola posición.
- **Teléfono de `#demo`.** Bajo "Verde Limón" dice `dict.es.cartaTagline` ("Nuestra carta."), el
  mismo texto que muestra `/c/ejemplo`, en lugar de "SODA TICA". Antes/después:
  `.qa/ajustes/a03-comp-demo-faq.png` (izquierda).
- Puertas: typecheck 0 errores, lint ✔, build 0, `qa:landing → OK · 23 avisos`.

### A04 · Nombre comercial (D-062)

- `tradeNameNotice()` en `src/lib/site.ts`: "DataFud es el nombre comercial con el que opera
  Steven Galo, responsable legal del servicio." (sale de `SITE.name` y `SITE.owner`).
- **`#confianza`:** la línea va bajo el párrafo "DataFud es una empresa costarricense…", en
  semibold (`.qa/ajustes/a04-confianza-{375,1440}.png`, miradas).
- **Términos (siguen en 1.2, mismo día y sin release todavía):** "Quién ofrece el servicio" abre
  con esa línea más el domicilio.
- **Revisor fresco** (dueño de soda, capturas de `#confianza` y de los términos a 375 y 1440):
  "entiendo que le pago a una persona, Steven Galo, que vende con la marca DataFud". Marcó que en
  los términos, después de la línea nueva, seguía "DataFud lo ofrece Steven Galo, que opera bajo el
  nombre comercial GaloDev": dos nombres comerciales para lo mismo. Se reemplazó por una sola
  frase: "DataFud es el nombre comercial con el que opera Steven Galo, responsable legal del
  servicio, con domicilio en Costa Rica." (`SITE.legalResponsible` sigue en privacidad y en
  propiedad intelectual). Lo de "empresa" y la cédula, en PENDIENTES-STEVEN.
- `MARKETING.md` (junto a D-041) y `OFERTA.md` §5 registran D-062.
- Puertas: typecheck 0 errores, lint ✔, build 0, `qa:landing → OK · 23 avisos`.

### A05 · Verificación, release 1.4.1 y puente

- `package.json` y el lockfile → **1.4.1**; CHANGELOG "1.4.1 · Ajustes finales: fundadores en
  cualquier plan, plazos con material + pago, a quién le pagás".
- Informe: `docs/plans/ajustes-loop-report.md`.
- **Puertas en producción** (`sh .qa/bin/puertas.sh https://datafud.com 49f8311`):
  ```
  B  supabase/: 0 líneas · montos de PRICING: 0 líneas cambiadas
  C  6/6 renders → 'https://datafud.com/q/demo26' · cierre 375/768/1440 (y 1440@2x): None
  D  /  mailto:=0 correos=0 €=0 · /c/ejemplo  mailto:=0 correos=0 €=0
  E  peso-carta → OK: 1.41 MB al abrir (límite 2,00 MB) · /c/ejemplo 1112,4 KB a 375, 0 hosts externos
  F  / → 200 · /c/ejemplo → 200 · /q/demo26 → 307 https://datafud.com/c/ejemplo · /terminos → Versión 1.2
  G  FAQ: 18 visibles · 18 en JSON-LD · 0 diferencias
  ```
  Esa corrida pudo empezar mientras el release compilaba (servía `215a69b`, mismo contenido). Con
  el release READY (`dpl_DbfHPVz2…`) se repitieron D, F y G: iguales. En producción: "48 horas"
  sin "hábiles" solo en el H1 (las 6 páginas públicas); la pastilla dice "Primeros 10 locales, en
  cualquier plan: ₡24 900 menos en la implementación y 1 stand QR 3D"; `#confianza` trae la línea
  de D-062; el teléfono de `#demo` dice "Nuestra carta.". La puerta A se corrió en local antes de
  cada commit.
- **Puente** subido al vault: `02-Proyectos/Datafud/Claude-Code/vault-sync-2026-09-25-ajustes.md`
  (aplicado: parcial, como en los loops anteriores).
