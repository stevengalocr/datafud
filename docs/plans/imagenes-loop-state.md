# Estado del loop — Imágenes nuevas y honestas (2026-09-25)

> Sexto bucle autónomo, sobre `main` @ `a7e9798` (1.3.0). Reemplaza las tres imágenes de la web
> que contradicen las reglas de la marca (texto, euros, marca inventada, personas, comida
> generada) y hace que todo QR dibujado en un render escanee de verdad.
> Prompt maestro: `LOOP-Imagenes-Datafud.md` (v1), decisiones CERRADAS D-049 a D-051.
> Si la sesión se corta: "Releé docs/plans/imagenes-loop-state.md y continuá el loop".

## Contador

- Iteración actual: 1
- Iteraciones consumidas: 1 / 12

## Capacidades del entorno

| Capacidad | Estado | Evidencia |
|---|---|---|
| Navegador real | Sí | Chromium de `@playwright/test` 1.63 |
| Decodificar QR | Sí, **fuera del repo** | OpenCV 5.0 (`cv2.QRCodeDetector`) en un venv temporal del scratchpad; nada entra en `package.json` |
| `sharp` | Sí, transitiva de `next` | Sin cambios respecto del loop anterior |
| gh CLI · git push a `main` | Sí | |
| Vercel | Sí (MCP) | Proyecto `datafud` `prj_n957iGSeYbe4GbTsDxlP0ytLHJSt`; último READY `dpl_HQ8KawyQrn6QmBNTcJF3xBzxaVj8` (`a7e9798`) |
| Puerto 3000 | Ocupado por otro proyecto | Todo lo local corre en `:3177` (`QA_BASE=http://localhost:3177`) |

### Ajustes al repo (§3.2 del prompt)

- **Los renders no estaban en el repo.** El paso previo (subirlos a `public/renders/` por la web
  de GitHub) no se hizo: `origin/main` seguía en `a7e9798` sin esa carpeta. Steven adjuntó las
  tres imágenes en el mensaje que arrancó el loop, así que se tomaron de ahí; **no se generó
  ninguna sustituta**. El render de la mesa es byte a byte el de
  `Downloads/datafud-restaurante-qr-nfc.webp`.
- **Los bytes no coinciden con la tabla §0.** Las imágenes recibidas son más pesadas que las que
  describe el prompt (probablemente la tabla es de otra exportación). Se versionan tal cual las
  entregó Steven: la web las sirve siempre por `next/image`, que las redimensiona, así que el peso
  del original no llega al teléfono. Los tres decodifican a la URL correcta.

| Archivo | Tabla §0 | Recibido | SHA-256 |
|---|---|---|---|
| `ambiente-mesa.webp` | 131 028 | 159 200 | `43dc7988…a32690` |
| `ambiente-piedra.webp` | 128 604 | 208 098 | `aad44acc…fbc723` |
| `tarjeta-nfc.webp` | 109 728 | 183 762 | `99bec071…35a342` |

## Unidades

| ID | Título | Estado | Intentos | Commit | Despliegue | Evidencia |
|---|---|---|---|---|---|---|
| R01 | Estado, línea base y archivos | hecho | 1 | ver puente | ver puente | Abajo |
| R02 | Hero | pendiente | 0 | | | |
| R03 | Tarjeta NFC en `#hardware` | pendiente | 0 | | | |
| R04 | Fondo del cierre (footer) | pendiente | 0 | | | |
| R05 | QR real en los renders de estudio | pendiente | 0 | | | |
| R06 | Auditoría de imágenes públicas | pendiente | 0 | | | |
| R07 | Verificación final, release 1.3.1 y puente | pendiente | 0 | | | |

## Herramientas de verificación del loop

En `.qa/bin/` (ignorada por git) y en el venv temporal:

| Script | Qué comprueba |
|---|---|
| `node .qa/bin/peso-home.mjs <base> / 3` | Peso transferido (encodedDataLength) y LCP de la home a 375×812, DPR 2, 4G lenta y CPU x4; mediana de 3 corridas |
| `python qr.py <imagenes…>` | Decodifica el QR de cada imagen con OpenCV (copia en `.qa/bin/qr.py`) |
| `python pegar-qr.py <in> <out> <qr.json>` | R05: pega el QR real sobre el panel blanco con perspectiva (copia en `.qa/bin/pegar-qr.py`) |

## Línea base (literal)

`main` @ `a7e9798`, versión 1.3.0.

```
$ npm ci                → ci=0
$ npm run typecheck     → tc=0   (tsc --noEmit, sin salida)
$ npm run lint          → ✔ No ESLint warnings or errors
$ npm run build         → build=0 (check-cartas + next build)
$ QA_BASE=http://localhost:3177 npm run qa:landing
qa:landing → OK · 21 avisos
```

Peso de la home (línea base):

```
http://localhost:3177/ a 375×812 (DPR 2, 4G lenta, CPU x4), 3 corridas (mediana):

  LCP                 1040 ms   (1044 / 1032 / 1040)
  elemento LCP        IMG /_next/image?url=/banner.png&w=750&q=75
  bytes imagen LCP    31.6 KB
  AL ABRIR            244.2 KB
  RECORRIDA ENTERA    399.2 KB

  imágenes (recorrida entera):
        49.4 KB  /_next/image?url=/cta-bg.png&w=750&q=75
        31.6 KB  /_next/image?url=/banner.png&w=750&q=75
        19.9 KB  /_next/image?url=/nfc.png&w=750&q=75
        10.4 KB  /_next/image?url=/stand-resenas.webp&w=750&q=75
        10.3 KB  /_next/image?url=/stand-qr-3d.webp&w=750&q=75
        10.1 KB  /_next/image?url=/stand-qr-3d-nfc.webp&w=750&q=75
         4.1 KB  /_next/image?url=/logo-main.png&w=384&q=75
         1.3 KB  /_next/image?url=/icono-main.png&w=96&q=75
```

QR de los renders nuevos (OpenCV 5.0):

```
ambiente-mesa.webp   | 1536x1024 | 159200 B | 'https://datafud.com/q/demo26'
ambiente-piedra.webp | 1536x1024 | 208098 B | 'https://datafud.com/q/demo26'
tarjeta-nfc.webp     | 1536x1024 | 183762 B | 'https://datafud.com/q/demo26'
```

QR de los renders de estudio (antes de R05):

```
stand-qr-3d.webp     | 27692 B | None
stand-qr-3d-nfc.webp | 26986 B | None
stand-resenas.webp   | 25128 B | None
```

Ninguno de los tres de estudio escanea: confirma el hallazgo de §0 y amplía el alcance de R05 a
los tres, no solo a `stand-qr-3d.webp`.

## PENDIENTES-STEVEN

- Fotos reales de los stands impresos → `public/hardware/<código>.webp` (reemplazan la etiqueta).
- Imprimir el stand de muestra con `/q/demo26` y escanearlo.
- IVA y factura 4.4; confirmar propuestas D-034–D-038, D-047, D-048.
- Siguen abiertos los del loop anterior (`docs/plans/entrega-loop-state.md`).

## Informes por unidad

### R01 · Estado, línea base y archivos

- Línea base en verde (typecheck, lint, build, `qa:landing → OK · 21 avisos`).
- Los tres renders nuevos, versionados en `public/renders/`, decodifican a
  `https://datafud.com/q/demo26`. Los tres de estudio no decodifican.
- El LCP de la home en móvil es el `banner.png` del hero (31,6 KB servidos por `next/image`).
