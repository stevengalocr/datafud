/**
 * Códigos QR y NFC impresos (D-014 · los códigos son permanentes).
 *
 * Todo QR o chip NFC que se manda a imprimir apunta a `https://datafud.com/q/<código>`, nunca
 * directo a la carta. El destino vive acá, así que el día que el local cambie de slug, pase de
 * `/c/<slug>` a `/m/<tenant>/<mesa>` o cierre, se cambia una línea y el material impreso sigue
 * sirviendo. Sin esto habría que reimprimir stands y chips.
 *
 * Formato del código: 6 caracteres en minúscula, sin `0`, `o`, `1`, `l` ni `i` (se confunden al
 * dictarlos por teléfono). **Un código nunca se reutiliza para otro local**, ni siquiera después
 * de que el primero se vaya: el stand viejo puede seguir dando vueltas.
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
