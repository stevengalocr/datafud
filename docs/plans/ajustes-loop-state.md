# Estado del loop — Ajustes finales (2026-09-25)

> Octavo bucle autónomo, sobre `main` @ `44f24d6` (1.4.0). Cierra lo que dejaron abiertos los
> revisores del loop "pulido" (`docs/plans/pulido-loop-state.md` → PENDIENTES-STEVEN).
> Prompt maestro: `LOOP-Ajustes-Finales-Datafud.md` (v1), decisiones CERRADAS D-057 a D-062.
> Si la sesión se corta: "Releé docs/plans/ajustes-loop-state.md y continuá el loop".

## Contador

- Iteración actual: 2
- Iteraciones consumidas: 2

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
| A01 | Estado y línea base | hecho | 1 | `ae568e2` | READY | Abajo |
| A02 | Condiciones (D-057 a D-061) | hecho | 1 | (este) | ver bloque | Abajo |
| A03 | Pulido visual | pendiente | 0 | | | |
| A04 | Nombre comercial (D-062) | pendiente | 0 | | | |
| A05 | Verificación, release 1.4.1 y puente | pendiente | 0 | | | |

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
