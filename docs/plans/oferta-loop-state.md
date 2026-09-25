# Estado del loop — Oferta sólida, Carta entregable y solo WhatsApp (2026-09-25)

> Cuarto bucle autónomo. Deja DataFud listo para vender HOY la Carta digital y el sistema
> completo: motor `/c/<slug>` sin backend, QR permanentes `/q/<código>`, un solo canal público
> (WhatsApp) y voz de empresa. Prompt maestro: `LOOP-Oferta-Solida-Datafud.md` (v1), con las
> DECISIONES CERRADAS D-014, D-039, D-040 y D-041.
> Si la sesión se corta: "Releé docs/plans/oferta-loop-state.md y continuá el loop".

## Contador

- Iteración actual: 8
- Iteraciones consumidas: 8 / 20

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
| O01 | Estado, línea base y puente | hecho | 1 | `06b00a7` | READY (`dpl_8f2uV1PkXcpAf28Nnq3Kf98vtRNP`) | Línea base abajo; el parche no existe en el entorno; push directo a `main` aceptado |
| O02 | Motor de la Carta `/c/<slug>` y modo Carta | hecho | 1 | `44c9181` | READY (`dpl_6EXvCcMWsXYX1CtHEPU1hipDoN2U`) | Ver informe O02 |
| O03 | QR permanentes `/q/<código>` (D-014) | hecho | 1 | `d599456` | READY | Ver informe O03 |
| O04 | La demo abre la Carta primero | hecho | 1 | `51e0dd3` | READY | Ver informe O04 |
| O05 | Solo WhatsApp (D-039) | hecho | 1 | `65ad48d` | READY (`dpl_EMzgQ986gvwuzdY1UfCur6Z62xmS`) | Ver informe O05 |
| O06 | Voz de empresa (D-041) | hecho | 1 | `53b994f` | READY (`dpl_AkVrHsqj9eYWES2NW227RNwvycxe`) | Ver informe O06 |
| O07 | Oferta, kit y documentación | hecho | 1 | `38fa758` | READY (`dpl_Eg5v1cS11KYNYrgHmfUiZ7ZAqT6s`) | Ver informe O07 |
| O08 | Verificación final | en curso | 1 | — | — | Puertas A–H abajo |
| O09 | Informe, release y puente | pendiente | 0 | — | — | — |

## Herramientas de verificación del loop

Viven en `.qa/bin/` (carpeta ignorada por git: son andamios, no producto). Se corren desde la
raíz del repo:

| Script | Qué comprueba |
|---|---|
| `node .qa/bin/gates.mjs https://datafud.com` | Puertas B, C, D, E y F contra producción, más que los legales sigan nombrando al responsable legal |
| `node .qa/bin/switch-es-en.mjs https://datafud.com` | Puerta B en navegador real: `/c/ejemplo` cambia ES→EN y no aparece ningún botón de agregar |
| `node --experimental-strip-types .qa/bin/check-cifras.mjs` | Grep cruzado de O07: toda cifra en colones de `docs/ventas/` sale de `PRICING` |
| `node .qa/bin/shot.mjs <url> <salida> "w=375,h=812[,sel=…][,click=…]"` | Capturas para mirarlas |
| `MSYS_NO_PATHCONV=1 node .qa/bin/texto.mjs <base> <ruta>` | Texto visible de una ruta, para leerla como la lee una persona |
| `./.qa/bin/kill-port.sh 3177` | Mata el `next start` local (en Windows `pkill` no lo alcanza) |

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

### O02 · Motor de la Carta `/c/<slug>` y modo Carta del menú

1. **Qué se puede hacer ahora que antes no.** Entregar una Carta a un cliente sin base de datos:
   se crea un archivo en `src/content/cartas/`, se despliega y el local ya tiene su carta en
   `/c/<slug>`. Antes la única carta que existía era la demo.
2. **Criterios.**
   - ✅ El build lista `● /c/[slug]` con `└ /c/ejemplo` (salida del `next build`).
   - ✅ HTML de `/c/ejemplo` con **0** "Agregar" (`curl … | grep -o Agregar | wc -l` → `0`),
     local y en producción.
   - ✅ `/c/no-existe` → **404** (local y producción).
   - ✅ Regresión: `/preview/cliente` conserva **28** "Agregar" y el texto
     "Armá tu pedido desde la mesa y envialo a la cocina."
   - ✅ Capturas 375 de `/c/ejemplo` miradas en ES y EN: chip solo "MENÚ" (sin mesa), encabezado
     "Nuestra carta. Consultá a tu salonero para ordenar." / "Our menu. Ask your server to
     order.", categorías y platillos traducidos, precios en colones, sin botones de agregar.
3. **Commit y despliegue.** `44c9181` · READY.
4. **Qué quedó fuera y por qué.** Nada de la especificación. Se agregó una cosa que no estaba
   pedida: **descripción en inglés para los 14 platillos de la demo**. La captura en EN mostraba
   nombres en inglés y descripciones en español, y O04 vende justamente el cambio ES/EN
   ("como lo haría un turista"): dejarlo así habría sido vender algo que la demo no cumple.
   Es contenido de demo, no toca `PRICING` ni `schema.sql`.
5. **Lo que no se pudo verificar.** Nada.

### O03 · QR permanentes `/q/<código>` (D-014)

1. **Qué se puede hacer ahora que antes no.** Mandar a imprimir stands y tarjetas sin miedo: el
   destino de un código impreso se cambia editando una línea.
2. **Criterios.** Local y producción, los tres iguales:
   - ✅ `/q/demo26` → `307` a `/c/ejemplo`.
   - ✅ `/q/DEMO26` → `307` a `/c/ejemplo` (no distingue mayúsculas).
   - ✅ `/q/zzz` → `307` a `/?qr=desconocido`.

   En producción: `Location: https://datafud.com/c/ejemplo` y `…/?qr=desconocido`.
3. **Commit y despliegue.** `d599456` · READY.
4. **Qué quedó fuera.** Nada.
5. **Lo que no se pudo verificar.** Nada. El `307` es deliberado y no `308`: el destino de un
   código cambia cuando el local pasa de `/c` a `/m`, así que no debe cachearse como permanente.

### O04 · La demo abre la Carta primero

1. **Qué se puede hacer ahora que antes no.** Enseñarle a un prospecto exactamente lo que le vas
   a entregar. Antes el botón principal abría la carta con pedidos, que es de otro plan.
2. **Criterios.**
   - ✅ `qa:landing` OK (24 avisos, todos de área táctil preexistentes; eran 18 antes de sumar
     `/preview/carta` y `/c/ejemplo` × 3 viewports).
   - ✅ El SVG del QR servido coincide con `qrcode.toString("https://datafud.com/preview/carta")`:
     lo comprueba `qa:landing` comparando el atributo `d` del `<path>`, y no reportó fallo.
   - ✅ Capturas de `#demo` a 375 y 1440 miradas: botón principal "Abrir la carta demo",
     secundario "Ver con pedidos"; la maqueta del teléfono ya no tiene "Ver orden · 2" ni checks,
     el pie dice "CARTA DIGITAL · ES · EN" y el subtítulo perdió "Mesa 1".
   - ✅ En producción el hero abre `/preview/carta` (`href="/preview/carta"` en el HTML servido).
3. **Commit y despliegue.** `51e0dd3` · READY.
4. **Qué quedó fuera.** Nada.
5. **Lo que no se pudo verificar.** Nada.

### O05 · Solo WhatsApp (D-039)

1. **Qué se puede hacer ahora que antes no.** Prospectar con un solo canal: nadie puede escribir
   a un buzón que nadie revisa.
2. **Criterios.**
   - ✅ `grep -rn "SITE.email|mailLink|hasEmail" src` → **0**.
   - ✅ En el HTML servido de `/`, `/terminos`, `/privacidad`, `/preview`, `/preview/carta`,
     `/preview/cliente`, `/c/ejemplo` y las 3 guías: **0** `galodevcr`, **0** `mailto:`,
     **0** `"email"` en JSON-LD. Verificado local y en producción (`.qa/bin/gates.mjs`, 14 rutas).
   - ✅ La línea de privacidad "Correo electrónico: tu dirección y lo que nos escribas" sigue:
     describe un dato que recibimos, no un canal.
   - ✅ Puerta G: `git diff 19d3b66 -- supabase/ src/lib/constants.ts` = 1 línea, la de
     `terms.permanence`. `supabase/` sin tocar.
3. **Commit y despliegue.** `65ad48d` · READY.
4. **Qué quedó fuera.** Nada. Se sumó al README la regla del canal único, para que el próximo que
   toque `site.ts` no vuelva a publicar el correo.
5. **Lo que no se pudo verificar.** Que el formulario siga entregando en `SITE.leadsEmail`: sin
   `RESEND_API_KEY` en Vercel el formulario no se renderiza, así que no hay envío que probar. El
   cambio es de una línea (`to: [SITE.leadsEmail]`) y lo cubre el `typecheck`.

### O06 · Voz de empresa (D-041)

1. **Qué se puede hacer ahora que antes no.** Presentarse ante un restaurante como empresa y no
   como alguien haciendo un proyecto.
2. **Criterios.**
   - ✅ HTML de `/`, `/preview`, `/preview/carta` y las 3 guías: **0** "proyecto chico",
     **0** "GaloDev"/"GALODEV", **0** "Steven".
   - ✅ En `/terminos` y `/privacidad` el responsable legal sigue presente (6 y 3 apariciones de
     "Steven Galo, que opera bajo el nombre comercial GaloDev").
   - ✅ Capturas 375 de `#confianza` y `#contacto` miradas: tarjeta "Atención DataFud · Ventas y
     soporte · Costa Rica" con el logo y el WhatsApp; tres promesas; en contacto solo WhatsApp,
     sin tarjeta de correo.
3. **Commit y despliegue.** `53b994f` · READY.
4. **Qué quedó fuera.** Nada. Dos cosas que la especificación no nombraba y había que arreglar
   igual: `authors`/`creator` de `layout.tsx` salían en el HTML como
   `<meta name="author" content="GaloDev">`, y el bloque `SITE.founder` quedaba sin un solo uso.
5. **Lo que no se pudo verificar.** Nada.

### O07 · Oferta, kit y documentación

1. **Qué se puede hacer ahora que antes no.** Contestar por escrito qué se vende, qué no y cómo se
   entrega, sin improvisar; y saber qué decisiones siguen abiertas antes de prometerlas.
2. **Criterios.**
   - ✅ Grep cruzado (`.qa/bin/check-cifras.mjs`): las **13** cifras en colones de
     `docs/ventas/OFERTA.md` y `docs/ventas/KIT-PROSPECCION.md` salen todas de `PRICING`.
     Salida literal:

     ```
     ₡10 000  ← PRICING.hardware["stand-resenas"].priceCrc
     ₡125 000 ← setupFeeFor("empresarial")
     ₡14 900  ← PRICING.plans.basico.priceCrc
     ₡149 000 ← PRICING.annualCarta.crc
     ₡149 900 ← firstPaymentFor("estandar")
     ₡174 900 ← firstPaymentFor("empresarial")
     ₡203 700 ← firstYearMonthly("basico")
     ₡24 900  ← PRICING.plans.estandar.priceCrc
     ₡39 800  ← firstPaymentFor("basico")
     ₡49 900  ← PRICING.plans.empresarial.priceCrc
     ₡54 700  ← firstYearMonthly("basico") − PRICING.annualCarta
     ₡6 000   ← PRICING.hardware["stand-qr-3d"].priceCrc
     ₡7 500   ← PRICING.hardware["tarjeta-nfc"].priceCrc

     check-cifras → OK, todas salen de PRICING
     ```
   - ✅ **0** "Soy Steven" en `docs/ventas` (los tres archivos).
3. **Commit y despliegue.** `38fa758` · READY.
4. **Qué quedó fuera.** El reel `c11` de `CONTENIDO-30-DIAS.md` no estaba en la especificación,
   pero vendía "DataFud es un proyecto chico" y ponía a Steven como cara de la marca: contradecía
   D-041 en material listo para publicar, así que se reescribió.
5. **Lo que no se pudo verificar.** Las decisiones D-032 a D-038 quedan como propuestas: no se
   publican en la web y no se le dicen a un cliente hasta que Steven las confirme.

## Puertas (§6)

| Puerta | Estado | Evidencia |
|---|---|---|
| **A** typecheck · lint · build · qa:landing | ✅ | `tsc --noEmit` sin salida; `✔ No ESLint warnings or errors`; build `✓ Compiled successfully`; `qa:landing → OK · 24 avisos` |
| **B** `/c/ejemplo` 200, sin "Agregar", con cambio ES/EN | ✅ | Producción: 200 y 0 "Agregar". En navegador real: ES "Nuestra carta…" / "Desayunos" / "Gallo Pinto con huevo" → EN "Our menu…" / "Breakfast" / "Gallo Pinto & egg", con 0 botones de agregar y 0 barra de orden en los dos idiomas |
| **C** `/q/demo26` → 307 `/c/ejemplo` | ✅ | Producción: 307 a `https://datafud.com/c/ejemplo`; `/q/DEMO26` igual; `/q/zzz` → `/?qr=desconocido` |
| **D** 0 `galodevcr` y 0 `mailto:` | ✅ | 14 rutas públicas de producción, incluidos `robots.txt` y `sitemap.xml` |
| **E** 0 "proyecto chico", "un producto de GaloDev", "al instante", "tiempo real", "24/7" | ✅ | Las mismas 14 rutas de producción |
| **F** `/preview/cliente` y `/m/[tenant]/[table]` siguen con pedidos | ✅ | `/preview/cliente` en producción conserva 28 "Agregar" y su texto de pedidos. `/m/[tenant]/[table]` no se puede abrir en producción (no hay Supabase): lo que garantiza la regresión es que `ordering` vale `true` por defecto y que esa ruta no pasa la prop |
| **G** `git diff 19d3b66 -- supabase/ src/lib/constants.ts` | ✅ | 1 archivo, 1 línea: `terms.permanence` ("por WhatsApp o correo" → "por WhatsApp") |
| **H** Despliegue de producción READY con el último commit | ⏳ | Se cierra en O09 |
