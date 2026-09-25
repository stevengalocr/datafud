# Estado del loop — Cierre de la entrega de la Carta (2026-09-25)

> Quinto bucle autónomo, sobre `main` @ `7b9c4e6` (1.2.0). Cierra la distancia entre lo que la
> web promete y lo que hoy se puede entregar: logo en la carta, fotos que abran con datos
> móviles, kit de QR y PDF, subtítulo por local y alta desde CSV.
> Prompt maestro: `LOOP-Cierre-Entrega-Carta-Datafud.md` (v1), decisiones CERRADAS D-042 a D-046.
> Si la sesión se corta: "Releé docs/plans/entrega-loop-state.md y continuá el loop".

## Contador

- Iteración actual: 1
- Iteraciones consumidas: 1 / 16

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
| E01 | Estado, línea base y fixture | en curso | 1 | — | — | Línea base abajo |
| E02 | Alta desde CSV (D-046) | pendiente | 0 | — | — | — |
| E03 | Fotos optimizadas (D-043) | pendiente | 0 | — | — | — |
| E04 | Logo en la cabecera (D-042) | pendiente | 0 | — | — | — |
| E05 | Subtítulo por carta (D-045) | pendiente | 0 | — | — | — |
| E06 | Kit de entrega: QR y PDF (D-044) | pendiente | 0 | — | — | — |
| E07 | Plan de 15 días honesto y guía con fuente | pendiente | 0 | — | — | — |
| E08 | Verificación final y release 1.3.0 | pendiente | 0 | — | — | — |

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
