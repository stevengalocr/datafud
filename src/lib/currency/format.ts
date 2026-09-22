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

const ZERO_DECIMAL = new Set(["CLP", "PYG"]);

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

/** Dólares de referencia: "US$29". */
export function formatUsd(amount: number): string {
  return `US$${groupCr(amount).replace(/ /g, ",")}`;
}

export function formatMoney(
  amount: number,
  currencyCode: string = "USD",
  currency?: Currency
): string {
  const symbol = currency?.symbol ?? SYMBOLS[currencyCode] ?? "$";
  const digits =
    currency?.decimal_digits ?? (ZERO_DECIMAL.has(currencyCode) ? 0 : 2);
  const formatted = amount.toLocaleString("es", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${symbol}${formatted}`;
}
