# Task A: Pulido de código (1.6.1) — informe

Estado: completo, 4 commits en `pulido-1-6-1`, sin push.

## Por ítem
1. T1-m1: `menu-manager.tsx` useEffect sobre `editingProd` (ref `editProdRef`): `scrollIntoView({block:"nearest"})`, `behavior:"auto"` si `prefers-reduced-motion`, foco a `#ep_name_es` con `preventScroll`; se quitó su `autoFocus`.
2. T1-m4: Editar/Eliminar de la fila con `disabled={pending || (editProdForm.pending && editingProd === p.id)}`.
3. T1-m3/m2: IIFE de categoría y de platillo reemplazados por `editingCategory`/`editingProduct` calculados antes del `return`; `actions.ts` nueva `parseProductForm(formData)` usada por `createProduct` y `updateProduct` (mismo schema, mismos campos; el orden de validación id-luego-resto de `updateProduct` no cambia).
4. T2-m3: `image-upload.tsx` escucha `input` en el campo y hace `setPreview(previewable(value))` (solo https válida).
5. T2-m7: botón con `aria-controls` y `aria-describedby` = `targetId`.
6. bitmap.close(): `try/finally` alrededor de `drawImage` y cierre en la rama `!g`.
7. N3/T2-m6: `actions.ts` uploadImage: `apagado` = `/bucket not found/i` en el mensaje, o `statusCode` 404 con "bucket" en el mensaje.
8. T3-rr1: `esRls` solo acepta código 42501 o mensaje `row-level security|permission denied` (sin 403 ni unauthorized genérico). Nota: aplica a todo el script, no solo a Storage; PostgREST también usa 42501 para RLS/permisos, así que no cambia los casos de base de datos.
9. T3-rr3: `limpiar()` en try/catch dentro del `finally`; la excepción se reporta como `aviso` y el resumen y las prioridades de salida (1 > 2 > 3 > 0) siguen igual.
10. N1: `docs/plans/2026-10-04-oleada-de-pruebas.md` describe salidas 0/1/2/3 y cómo borrar el archivo `zz-aislamiento` sobrante.
11. `package.json` y `package-lock.json` (2 sitios) 1.6.1; CHANGELOG `## [1.6.1] — 2026-10-07 · ...` sobre 1.6.0.

## Verificación
- `npm run typecheck`: verde. `npm run lint`: "No ESLint warnings or errors". `npm run build`: verde.
- `node --check scripts/prueba-aislamiento.mjs`: ok; sin variables sale con código 2.
- `git diff --stat --ignore-cr-at-eol`: solo 8 archivos con cambios reales, LF (sin ruido de fin de línea).
- `next dev -p 3111`: GET /dashboard/menu sin sesión -> 307 a `/login?redirect=%2Fdashboard%2Fmenu`, sin errores en el log. Luego maté los procesos node del dev server.

## Preocupaciones
- No se probó en navegador el scroll/foco ni la vista previa (sin sesión ni credenciales); solo tipos, lint, build y redirección.
- `taskkill /IM node.exe` para detener el dev server mata todos los node.exe de la máquina; fue en este cierre y no afecta al repo.
- La detección `statusCode 404` + "bucket" es defensiva: storage-js normalmente devuelve "Bucket not found".

## Ronda de arreglos 1

Cambios (5 Minor de task-A-review.md):
1. `scripts/prueba-aislamiento.mjs:37-39`: el encabezado describe la regla actual de `esRls` (42501 o mensaje de RLS/permisos; un 403 genérico no basta).
2. `src/app/dashboard/image-upload.tsx` (`<Image>` de la vista previa): `onError={() => setPreview("")}`; reaparece al cambiar la URL (el listener `input` vuelve a llamar `setPreview`).
3. `scripts/prueba-aislamiento.mjs` (`sinBucket`, sección 4): "bucket not found", o 404 con "bucket" en el mensaje (misma regla que actions.ts).
4. `src/app/dashboard/actions.ts` (catch de `uploadImage`): `dbFail("uploadImage", ...)` con «No se pudo subir la foto. Probá de nuevo o pegá la dirección.»; solo el bucket inexistente da STORAGE_APAGADO. `docs/CHANGELOG.md` 1.6.1 ajustado (líneas de subida, edición y vista previa).
5. `src/app/dashboard/menu/menu-manager.tsx`: Editar/Eliminar de todas las filas con `disabled={pending || editProdForm.pending}`; el botón "Guardar platillo" de crear con `disabled={editProdForm.pending}`.

Comandos y resultados: `npm run typecheck` ok; `npm run lint` "No ESLint warnings or errors"; `npm run build` ok; `node --check scripts/prueba-aislamiento.mjs` ok; script sin variables de entorno, exit 2; sin CR en los 5 archivos tocados (LF).
