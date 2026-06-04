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
