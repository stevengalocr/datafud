/**
 * Ruta a la que volver después del login, solo si es interna y del panel que le toca al rol
 * (`/dashboard…` o `/admin…`). Cualquier otra cosa devuelve null y se usa la de siempre.
 */
export function safeRedirect(value: unknown, prefix: "/dashboard" | "/admin"): string | null {
  if (typeof value !== "string" || value.length > 300) return null;
  if (!value.startsWith("/") || value.startsWith("//") || /[\\\s]/.test(value)) return null;
  let url: URL;
  try {
    url = new URL(value, "http://interno.local");
  } catch {
    return null;
  }
  if (url.origin !== "http://interno.local") return null;
  const path = url.pathname;
  if (path !== prefix && !path.startsWith(`${prefix}/`)) return null;
  return `${path}${url.search}`;
}

/**
 * A dónde se vuelve después del login cuando venció la sesión en `path`. Casi siempre es la misma
 * página; las descargas de archivos (el QR de una mesa) vuelven a la página que tiene el botón,
 * porque el login no puede aterrizar en un archivo.
 */
export function loginReturnPath(path: string, search: string): string {
  if (/^\/dashboard\/tables\/[^/]+\/qr\/?$/.test(path)) return "/dashboard/tables";
  return `${path}${search}`;
}
