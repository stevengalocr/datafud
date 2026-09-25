/**
 * Códigos QR y NFC impresos (D-014 · los códigos son permanentes).
 *
 * Todo QR o chip NFC que se manda a imprimir apunta a `https://datafud.com/q/<código>`, nunca
 * directo a la carta. El destino vive acá, así que el día que el local cambie de slug, pase de
 * `/c/<slug>` a `/m/<tenant>/<mesa>` o cierre, se cambia una línea y el material impreso sigue
 * sirviendo. Sin esto habría que reimprimir stands y chips.
 *
 * Formato del código: 6 caracteres del alfabeto `a-z` + `2-9`, menos las letras `l` e `i`.
 * Fuera los dígitos `0` y `1` porque se confunden con `o` y con `l`; fuera `l` e `i` porque en
 * muchas tipografías se pierden al leer un stand impreso. La `o` se queda: como el dígito `0`
 * no está en el alfabeto, no hay con qué confundirla, y prohibir las dos mitades de cada par
 * sería perder un carácter útil sin ganar nada. Lo hace cumplir `validarCodigoQr()` en
 * `scripts/carta-lib.mjs`, que corre en el alta de cada carta.
 *
 * **Un código nunca se reutiliza para otro local**, ni siquiera después de que el primero se
 * vaya: el stand viejo puede seguir dando vueltas. Cuando un local se da de baja,
 * `scripts/carta-borrar.mjs` deja su código comentado acá en vez de borrarlo, y el alta de una
 * carta nueva también mira los comentados.
 */
export const QR_CODES: Record<string, string> = {
  // Stand de muestra que anda Steven en las visitas.
  demo26: "/c/ejemplo",
};

/** Destino de un código impreso, o `null` si no existe. No distingue mayúsculas. */
export function qrDestination(code: string): string | null {
  const key = code.toLowerCase();
  return Object.prototype.hasOwnProperty.call(QR_CODES, key) ? QR_CODES[key] : null;
}
