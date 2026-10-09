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

/**
 * Costa Rica está en UTC−6 todo el año (sin horario de verano desde 1992). Con eso, el inicio de
 * un día local se puede pasar a UTC sin depender del ICU del entorno.
 */
const CR_OFFSET = "-06:00";

/** Clave del día local de hace `daysAgo` días ("2026-09-24" si hoy es 2026-10-07 y `daysAgo` = 13). */
export function localDayKeyDaysAgo(daysAgo: number, from: Date = new Date()): string {
  const [y, m, d] = localDayKey(from).split("-").map(Number);
  // Aritmética de calendario en UTC (mediodía para no cruzar de día): la clave ya es la local.
  const date = new Date(Date.UTC(y, m - 1, d, 12) - daysAgo * 86_400_000);
  return date.toISOString().slice(0, 10);
}

/**
 * Inicio del día de Costa Rica, en ISO UTC, para filtrar marcas de tiempo por rango:
 * `startOfLocalDayIso()` a las 7 p. m. del 7 de octubre en San José da "2026-10-07T06:00:00.000Z".
 */
export function startOfLocalDayIso(daysAgo = 0, from: Date = new Date()): string {
  return new Date(`${localDayKeyDaysAgo(daysAgo, from)}T00:00:00${CR_OFFSET}`).toISOString();
}
