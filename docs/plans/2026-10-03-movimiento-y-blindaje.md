# Movimiento, sombras y blindaje de los paneles — 2026-10-03

> Segunda pasada sobre las pantallas con sesión después de la auditoría
> (`2026-10-03-auditoria-paneles.md`). Pedido de Steven: «animaciones, sombras… que den
> propiedad y un diseño agradable y moderno; todas las funcionalidades blindadas y el UI/UX
> perfecto». Método: skills `emil-design-eng`, `emil-animate`, `ui-ux-pro-max` e `impeccable`
> (contexto de `.impeccable.md`). Rama del worktree `worktree-agent-a152caa4e9255e734`.

## Alcance

A mitad de la sesión el coordinador acotó el alcance porque otra sesión implementa S10 (acciones
que devuelven estado), el alta de locales, `updateCategory`, el refresco de órdenes y el rate
limit. **No se tocaron**: `src/app/admin/actions.ts`, `src/app/dashboard/actions.ts`,
`src/app/admin/tenants/**`, `src/app/dashboard/menu/**`, `src/app/dashboard/orders/**`,
`payment-form.tsx`, `charge-form.tsx`, `settings-form.tsx`, `table-actions.tsx`, `supabase/**`,
`src/lib/supabase/`, `src/lib/auth/`, `src/middleware.ts`, `src/instrumentation.ts`, ni la
landing. Las páginas de solo lectura cambiaron únicamente clases y formato de cifras: ninguna
consulta ni dato nuevo pasa del servidor al cliente.

Lo que se cambió: primitivas (`src/components/ui/**`), shell (`src/components/shell/**`), tokens
(`tailwind.config.ts`, `globals.css`), las dos pantallas de acceso y las páginas de lectura
(Resumen admin, Planes, listados de Pagos y Cargos, Resumen y Reportes del dashboard). Las
primitivas nuevas quedan listas para que la sesión de S10 las use en los formularios.

## Antes | Después | Por qué

| Antes | Después | Por qué |
| --- | --- | --- |
| Tarjetas sin sombra; tarjeta de acceso y cajón con sombras sueltas escritas a mano | Escala `panel-xs` / `sm` / `md` / `lg` + `btn-primary`, todas tintadas con `#0a1a13` / `#112a20` | Elevación con significado (apoyado, superficie, levantado, encima) y una sola familia de sombras; gris neutro sobre crema se ve sucio |
| Botón primario plano | Brillo interior de 1 px arriba + sombra corta abajo | Se presiona en servicio: tiene que leerse como objeto, no como rectángulo pintado |
| `active:scale-[0.98]` en 150 ms | `active:scale-[0.97]` en 160 ms con `--ease-out`, también en menú, hamburguesa y cerrar sesión (`0.94` en los íconos de 44 px) | Feedback de presión en todo lo que se toca, dentro de 100–160 ms |
| `hover:` en todos los paneles | `hov:` = `@media (hover: hover) and (pointer: fine)` (variante nueva de Tailwind; la landing conserva su `hover:`) | En el teléfono un toque dispara `:hover` y el fondo queda pegado |
| Botones `sm` de 40 px en el teléfono | 44 px en el teléfono, 36 px con mouse | Objetivo táctil mínimo |
| Cambiar de sección: la página aparece de golpe | `.panel-enter`: sube 6 px en 220 ms, con `key={pathname}` | Continuidad al navegar; no corre al refrescar datos tras guardar (decenas de veces al día: tiene que ser casi imperceptible) |
| Cifras del resumen aparecen juntas | `.panel-stagger`: 40 ms entre tarjetas, tope a los 160 ms, `fill-mode: backwards` | Cascada corta; `backwards` aplica el primer fotograma en la espera y al terminar no deja nada puesto |
| Cajón: 16 px, 200 ms; velo aparece de golpe | 24 px en 240 ms, velo que oscurece en 200 ms (`background-color`, no opacidad del panel), sombra `panel-lg` | Entrada con dirección; si se congela, el panel ya está visible |
| Cajón: Tab se escapaba a la página de atrás | Foco atrapado (Tab y Shift+Tab dan la vuelta), Escape cierra y devuelve el foco | `aria-modal` sin trampa de foco es una promesa rota |
| `window.confirm` gris del sistema (P3-5) | `useConfirm()` / `ConfirmDialog`: `<dialog>` nativo, `showModal()`, foco inicial en «Volver», Escape y toque en el velo = volver; entra con `@starting-style` desde `translateY(6px) scale(0.96)` | Marca, capa superior, foco atrapado y devuelto gratis; transición interrumpible, sin opacidad |
| Formularios con `<form action={fn}>` | `useFormSubmit` (onSubmit + `startTransition`) + `SubmitButton` (`useFormStatus`) | React 19 pide el reset del formulario **antes** de correr la acción: medido, un fallo atrapado deja el campo vacío. Con el hook el texto se queda, el doble envío se ignora y el botón vuelve solo |
| Login: con contraseña incorrecta se borraban correo y contraseña | Correo intacto, contraseña vacía y con foco, error con `role="alert"` + `aria-describedby`, `user-invalid` en rosa | Corregir solo lo que está mal |
| Login: Enter repetido mientras carga | Guardia por ref + botón deshabilitado: 1 POST medido con clic + Enter + clic | Doble envío imposible |
| `PendingDots` no existía; «Ingresando…» solo texto | Botón con `pending` / `pendingText`, tres puntos que laten (900 ms, se apagan con movimiento reducido) | El texto dice qué pasa; los puntos dicen que sigue vivo |
| «Intentar de nuevo» en `error.tsx` llamaba solo `reset()` | `router.refresh()` + `reset()` en una transición, con «Cargando…» | `reset()` solo repinta en el navegador: un error del servidor se repetía sin volver a preguntar |
| Órdenes en 375 px con una nota sin espacios: 351 px de scroll lateral; Menú, 9 px | `overflow-wrap: anywhere` en el contenedor del panel; `min-w-0` en cifras y nombres | Red de seguridad para cualquier texto del cliente; parte solo cuando no hay otra salida |
| Cifras de 28 px fijas; «12345» | 24 px en el teléfono, parten línea si hace falta; conteos con `toLocaleString("es-CR")` («12 345») | Números grandes legibles sin romper la grilla |
| Campos sin sombra, error solo con `aria-invalid` | `shadow-panel-xs`, `user-invalid:` y `aria-invalid` en rosa con halo rosa al enfocar | Validación visible en el campo, pero solo después de que la persona lo tocó |
| Cerrar sesión sin estado | «Cerrando sesión…» con `useFormStatus`, deshabilitado | Un viaje al servidor sin señal invitaba a tocar dos veces |

## Primitivas para los formularios (las usa la sesión de S10)

- **`src/components/ui/submit-button.tsx` — `SubmitButton`**: va dentro del `<form>`; lee
  `useFormStatus()` y pasa `pending` al `Button`. Props: las de `Button` menos `type`/`pending`,
  más `pendingText` (por defecto «Guardando…»). Funciona con `<form action>` y con `useFormSubmit`.
- **`src/components/ui/use-form-submit.ts` — `useFormSubmit(handler)`** → `{ onSubmit, pending }`.
  `handler(formData, form)` es async; hacé `form.reset()` solo si salió bien y atrapá el error
  para mostrarlo (si se escapa, sube al `error.tsx`). El navegador valida los `required` antes.
- **`src/components/ui/confirm-dialog.tsx` — `useConfirm()`** → `{ confirm, dialog }`.
  `await confirm({ title, description?, confirmLabel, cancelLabel? = "Volver", tone? = "danger", icon? })`
  devuelve `true`/`false`; renderizá `{dialog}` una vez en el componente.
- **`Button`** acepta `pending` y `pendingText`; `PendingDots` está exportado.

## Verificación

Supabase falso copiado a `scratchpad/movimiento/mock.mjs` (puerto 54341) con datos extremos
(orden de ₡123 456 789 con 1500 unidades y una nota de 90 letras sin espacios, platillo
«Supercalifragilístico…» de ₡99 999 999, mesa con nombre de 50 letras, 12 345 órdenes) y
mutaciones con 1,2 s de demora; `next dev -p 3141`. Carpeta:
`C:\Users\steve\AppData\Local\Temp\claude\C--Users-steve-OneDrive-Desktop-claude-proyectos\c8d27d0f-5a18-4c85-b145-c7245e96e732\scratchpad\movimiento\`
(`antes\`, `despues\`, `verificar.mjs`, `resultado.txt`).

- **Capturas** 21 pantallas × 375 y 1440 px, antes y después: todas 200, sin errores de
  consola. Desborde horizontal antes: Órdenes 351 px (375) y 280 px (1440), Menú 9 px; después:
  0 en las 42. Más `dash-menu-abierto-375.png`, `login-enviando-375.png`,
  `login-error-375.png` y `dialogo-confirmar-375.png`.
- **Estilos computados** (Playwright, `resultado.txt`):
  - Entrada de página a los pocos ms: `transform: matrix(1,0,0,1,0,6)`, `opacity: 1`; al terminar
    `transform: none`, `opacity: 1`. Cascada: las tres cifras en `none` / `1`.
  - Cajón a 30 ms: `translateX(-7.2px)`, `opacity: 1`, `animation-fill-mode: none`; al terminar
    `transform: none`. Tab desde el último elemento vuelve a «Cerrar menú»; Escape cierra y el
    foco vuelve a «Abrir menú».
  - Diálogo a 20 ms: `scale(0.991)`, `opacity: 1`; al terminar `transform: none`, `:modal`,
    foco en «Volver», velo `rgba(10,26,19,0.5)`. Escape → `false` y foco al botón que lo abrió.
  - Botón con el mouse apretado: `matrix(0.97,…)`; soltado: `none`. Sombra del primario medida.
  - Hover con mouse: fondo `rgb(245,243,234)`. En el teléfono emulado
    `matchMedia("(hover: hover) and (pointer: fine)")` es `false`: la regla no aplica.
  - Login con error: correo conservado, contraseña vacía con foco, borde `rgb(225,29,72)`,
    `aria-describedby="acceso-error"`, 1 POST con clic + Enter + clic.
  - `useFormSubmit` con fallo: el campo conserva «Casado con pollo», 1 llamada con tres
    intentos, el botón vuelve habilitado. Vacío: no envía, `:user-invalid`, borde rosa.
    Comparación en el mismo banco con `<form action={fn}>` y el error atrapado: **campo vacío**.
  - Movimiento reducido: `animation-name: none` y `transform: none` en página y cajón.
- `npm run typecheck`, `npm run lint` y `npm run build`: en verde. El banco de pruebas
  (`src/app/probe-movimiento`) se borró antes del commit.

## Queda abierto (para la sesión de S10 / formularios)

1. Los formularios de Menú, Mesas, Pagos, Cargos y Configuración siguen con `<form action={fn}>`:
   con un fallo, React 19 les vacía los campos (medido). Pasarlos a `useFormSubmit` +
   `SubmitButton`. Los de Menú tampoco muestran estado de envío.
2. `DeleteTableButton` (`table-actions.tsx`) no atrapa el error: si `deleteTable` falla, el
   error sube al `error.tsx`. Con S10 debería mostrar el motivo.
3. Las confirmaciones con `window.confirm` (Restaurantes, Menú, Mesas, Órdenes) pueden pasar a
   `useConfirm()` (títulos sugeridos: «¿Suspender a {local}?» / «Suspender local»; «¿Eliminar
   {mesa}?» / «Eliminar mesa»; «¿Cancelar esta orden?» / «Cancelar orden»).
4. La «×» de eliminar categoría mide 40 × 40 en el teléfono (`menu-manager.tsx`); subir a 44.
5. Las tarjetas de orden (`order-board.tsx`) podrían usar `shadow-panel-md` al cambiar de estado
   y `PendingDots` en «Guardando…».
6. El cajón móvil cierra sin animación de salida (instantáneo, a propósito: la salida tiene que
   ser más rápida que la entrada); si se quiere una salida, hace falta desmontar con demora.
7. P3-1 de la auditoría sigue: el logo PNG tiene fondo blanco.
