# Estado del loop — Ajustes finales (2026-09-25)

> Octavo bucle autónomo, sobre `main` @ `44f24d6` (1.4.0). Cierra lo que dejaron abiertos los
> revisores del loop "pulido" (`docs/plans/pulido-loop-state.md` → PENDIENTES-STEVEN).
> Prompt maestro: `LOOP-Ajustes-Finales-Datafud.md` (v1), decisiones CERRADAS D-057 a D-062.
> Si la sesión se corta: "Releé docs/plans/ajustes-loop-state.md y continuá el loop".

## Contador

- Iteración actual: 1
- Iteraciones consumidas: 1

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
| A01 | Estado y línea base | en curso | 1 | | | Abajo |
| A02 | Condiciones (D-057 a D-061) | pendiente | 0 | | | |
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
