// QR de las mesas (AA-19). La vista previa es chica; lo que se descarga es para imprimir: PNG de
// 1024 px y SVG (se imprime a cualquier tamaño), con la zona silenciosa de 4 módulos que pide la
// norma y corrección de errores M (aguanta una mancha o un doblez). Las descargas se generan a
// pedido en `[id]/qr/route.ts`, así la página no carga un PNG grande por mesa.

export const QR_PRINT = { margin: 4, errorCorrectionLevel: "M" } as const;

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** URL que graba el QR de una mesa. */
export function tableMenuUrl(slug: string, token: string): string {
  return `${siteUrl()}/m/${slug}/${token}`;
}

/** Nombre de archivo a partir de la etiqueta de la mesa: "Terraza 2" -> "qr-terraza-2". */
export function qrFileBase(label: string): string {
  const slug = label
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `qr-${slug || "mesa"}`;
}
