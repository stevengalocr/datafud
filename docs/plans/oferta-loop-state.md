# Estado del loop — Oferta sólida, Carta entregable y solo WhatsApp (2026-09-25)

> Cuarto bucle autónomo. Deja DataFud listo para vender HOY la Carta digital y el sistema
> completo: motor `/c/<slug>` sin backend, QR permanentes `/q/<código>`, un solo canal público
> (WhatsApp) y voz de empresa. Prompt maestro: `LOOP-Oferta-Solida-Datafud.md` (v1), con las
> DECISIONES CERRADAS D-014, D-039, D-040 y D-041.
> Si la sesión se corta: "Releé docs/plans/oferta-loop-state.md y continuá el loop".

## Contador

- Iteración actual: 1
- Iteraciones consumidas: 1 / 20

## Capacidades del entorno

| Capacidad | Estado | Evidencia |
|---|---|---|
| Navegador real | Sí | Chromium headless shell 153.0.8010.12 (playwright v1243), `@playwright/test` 1.63 |
| Red a datafud.com | Sí, directa | `curl -o /dev/null -w "%{http_code}" https://datafud.com/` → `200` |
| Red a images.unsplash.com | No | Fotos remotas fallan en `next start` local (aviso de `qa:landing`, no fallo) |
| gh CLI | Sí | `gh auth status` → `Logged in to github.com account stevengalocr` |
| git push a main | Sí | `origin https://github.com/stevengalocr/datafud.git`, protocolo https con token de gh |
| Vercel | Sí (MCP) | Proyecto `datafud` `prj_n957iGSeYbe4GbTsDxlP0ytLHJSt` |
| Google Drive (vault) | Por confirmar en O09 | Conector presente en la sesión |
| Puerto 3000 | **Ocupado por otro proyecto** | Un servidor ajeno (landing de BilBildin) responde en `:3000`; `qa:landing` y las verificaciones locales corren con `QA_BASE=http://localhost:3177` |

### Ajuste al repo (§4.2 del prompt)

- **El parche `datafud-oferta-solida.patch` no existe** en la raíz del repo ni en `~/Downloads`,
  el escritorio o la carpeta de proyectos. Cada unidad O02–O07 se implementa desde su
  especificación, con commit propio.
- `qa:landing` detecta "hay servidor" con un `fetch` al puerto de `QA_BASE`; como el 3000 estaba
  ocupado por otro proyecto, la primera corrida verificó el sitio equivocado y reventó. Se corre
  siempre con `QA_BASE=http://localhost:3177` y queda anotado acá, no se cambia el script.

## Unidades

| ID | Título | Estado | Intentos | Commit | Despliegue | Evidencia |
|---|---|---|---|---|---|---|
| O01 | Estado, línea base y puente | en curso | 1 | — | — | Línea base abajo |
| O02 | Motor de la Carta `/c/<slug>` y modo Carta | pendiente | 0 | — | — | — |
| O03 | QR permanentes `/q/<código>` (D-014) | pendiente | 0 | — | — | — |
| O04 | La demo abre la Carta primero | pendiente | 0 | — | — | — |
| O05 | Solo WhatsApp (D-039) | pendiente | 0 | — | — | — |
| O06 | Voz de empresa (D-041) | pendiente | 0 | — | — | — |
| O07 | Oferta, kit y documentación | pendiente | 0 | — | — | — |
| O08 | Verificación final | pendiente | 0 | — | — | — |
| O09 | Informe, release y puente | pendiente | 0 | — | — | — |

## Línea base (literal)

Repo clonado en `main` @ `19d3b66` ("docs(loop): registra commits y despliegues de V12 y V13…"),
que es exactamente la base que el prompt declara.

```
$ npm ci
added 401 packages, and audited 402 packages in 34s
found 3 vulnerabilities (1 low, 2 moderate)

$ npm run typecheck
> datfud@1.1.0 typecheck
> tsc --noEmit
(sin salida: limpio)

$ npm run lint
> datfud@1.1.0 lint
> next lint
✔ No ESLint warnings or errors

$ npm run build
✓ Compiled successfully
✓ Generating static pages (34/34)
34 rutas: / · /_not-found · /acceso-galodev-9f3a · /admin (+4) · /dashboard (+5) ·
/login · /m/[tenant]/[table] · 3 guías (+3 opengraph-image) · /opengraph-image ·
/preview (+3) · /privacidad (+og) · /register · /robots.txt · /sitemap.xml · /terminos (+og)
First Load JS compartido: 103 kB

$ QA_BASE=http://localhost:3177 npm run qa:landing
qa:landing → OK · 18 avisos · capturas en …\datafud\.qa
(los 18 avisos son áreas táctiles < 44 px preexistentes en / , /preview/* y las 3 guías)
```

## PENDIENTES-STEVEN (no son del loop)

- Imprimir el stand de muestra con `https://datafud.com/q/demo26`.
- Decidir IVA (propuesta: precios con IVA incluido) y confirmar si puede emitir factura
  electrónica 4.4.
- Confirmar D-033 a D-038 de `docs/ventas/OFERTA.md`.
- WhatsApp Business en +506 7287 4779 (nombre DataFud, logo, catálogo con planes y stands).
- Redes (Instagram, Facebook) → URLs en `SITE.social`; Google Business Profile.
- Fotos reales de los 4 stands en `public/hardware/<código>.webp`.
- Opcional: `RESEND_API_KEY` si se quiere el formulario (sin él, la web funciona solo con WhatsApp).

## Informes por unidad

### O01 · Estado, línea base y puente

1. **Qué se puede hacer ahora que antes no.** El loop tiene estado propio y un puente al vault;
   queda escrito que el parche no existe y que el puerto 3000 no sirve en esta máquina.
2. **Criterios.**
   - ✅ Estado y puente creados y commiteados.
   - ✅ Línea base pegada literal arriba (`npm ci`, typecheck, lint, build con 34 rutas, `qa:landing` OK).
   - ✅ Parche: buscado en repo, `~/Downloads`, escritorio y carpeta de proyectos → no existe.
     Se implementa cada unidad desde la especificación. Nada que borrar.
3. **Commit y despliegue.** Ver la tabla.
4. **Qué quedó fuera.** Nada.
5. **Lo que no se pudo verificar.** Nada.
