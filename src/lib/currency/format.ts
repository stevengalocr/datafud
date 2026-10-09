import type { Currency } from "@/lib/supabase/types";

// Mapa mínimo de símbolos por si no se pasa la moneda completa.
const SYMBOLS: Record<string, string> = {
  CRC: "₡",
  USD: "$",
  MXN: "$",
  BRL: "R$",
  ARS: "$",
  COP: "$",
  CLP: "$",
  PEN: "S/",
  GTQ: "Q",
  HNL: "L",
  NIO: "C$",
  PAB: "B/.",
  PYG: "₲",
  UYU: "$U",
  VES: "Bs.",
  BOB: "Bs",
  DOP: "RD$",
  CUP: "$",
};

// Monedas que se cobran sin decimales. Son las que `schema.sql` siembra con `decimal_digits = 0`
// (CLP, PYG) más los colones: la BD dice 2, pero DataFud los muestra y los guarda sin céntimos
// (regla 6 de CLAUDE.md, AA-29). Es la única lista: la usan el formato, el panel y las acciones.
const ZERO_DECIMAL = new Set(["CRC", "CLP", "PYG"]);

/** Decimales con los que se escribe y se guarda un monto en esa moneda (0 o 2). */
export function currencyDecimals(currencyCode: string | null | undefined): number {
  return currencyCode && ZERO_DECIMAL.has(currencyCode) ? 0 : 2;
}

/** Redondea un monto a los decimales de su moneda: 3500.5 en CRC da 3501; 8.505 en USD, 8.51. */
export function roundToCurrency(amount: number, currencyCode: string | null | undefined): number {
  const f = 10 ** currencyDecimals(currencyCode);
  return Math.round(amount * f) / f;
}

/** Separador de miles de Costa Rica: espacio que no se corta al final de línea. */
const CR_GROUP = " ";

/** Entero con separador de miles es-CR ("14 900", "6 000"), sin depender del ICU del entorno. */
function groupCr(n: number): string {
  return String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, CR_GROUP);
}

/** Colones con formato es-CR y sin decimales: "₡14 900". Lo usa la landing para toda cifra en CRC. */
export function formatCrc(amount: number): string {
  return `${amount < 0 ? "-" : ""}₡${groupCr(amount)}`;
}

/** Montos en USD de los paneles internos: "US$249", o "US$12.50" cuando hay centavos. */
export function formatUsdAmount(amount: number): string {
  const n = Number(amount) || 0;
  if (Number.isInteger(n)) return `${n < 0 ? "-" : ""}${formatUsd(n)}`;
  return `${n < 0 ? "-" : ""}US$${Math.abs(n).toFixed(2)}`;
}

/** Dólares de referencia: "US$29". */
export function formatUsd(amount: number): string {
  return `US$${groupCr(amount).replace(/ /g, ",")}`;
}

/**
 * `lang` es el idioma en el que el comensal está **leyendo** la carta, no el del local.
 *
 * Importa por los decimales: en español "$8,50" son ocho con cincuenta, pero un turista que leyó
 * el resto de la carta en inglés lee esa coma como separador de miles. El precio es lo único de
 * la carta que no se puede prestar a una segunda lectura.
 *
 * Los colones no dependen del idioma: `formatCrc()` no usa decimales y agrupa con espacio, que
 * no se confunde en ningún idioma (regla 6 de `CLAUDE.md`).
 */
export function formatMoney(
  amount: number,
  currencyCode: string = "USD",
  currency?: Currency,
  lang: string = "es"
): string {
  // Colones: siempre es-CR y sin decimales ("₡2 800"), aunque la BD diga 2 decimales.
  if ((currency?.code ?? currencyCode) === "CRC") return formatCrc(amount);
  const symbol = currency?.symbol ?? SYMBOLS[currencyCode] ?? "$";
  const digits =
    currency?.decimal_digits ?? (ZERO_DECIMAL.has(currencyCode) ? 0 : 2);
  const formatted = amount.toLocaleString(lang, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${symbol}${formatted}`;
}
