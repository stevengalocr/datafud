// Fechas de los paneles. Los paneles son Server Components y en Vercel el servidor corre en UTC:
// sin zona explícita, una orden de las 8:30 p. m. en San José se mostraba "2:30" del día siguiente.
// Todo se muestra en la hora de Costa Rica, que es donde opera DataFud hoy.
const TZ = "America/Costa_Rica";

/** Marca de tiempo ("2026-10-03T20:30:00Z") como fecha y hora local: "3 oct 2026, 2:30 p. m.". */
export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString("es-CR", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Solo la hora local de una marca de tiempo: "2:30 p. m.". */
export function formatTime(value: string | Date): string {
  return new Date(value).toLocaleTimeString("es-CR", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Fecha corta: "3 oct 2026". Una fecha sin hora ("2026-10-03", columnas `date`) se lee en UTC
 * para que no retroceda un día al pasarla a la zona de Costa Rica.
 */
export function formatDate(value: string | Date): string {
  const dateOnly = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
  return new Date(value).toLocaleDateString("es-CR", {
    timeZone: dateOnly ? "UTC" : TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Clave del día local ("2026-10-03") para comparar si algo pasó hoy en Costa Rica. */
export function localDayKey(value: string | Date = new Date()): string {
  return new Date(value).toLocaleDateString("en-CA", { timeZone: TZ });
}
