import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";
import { PRICING } from "@/lib/constants";
import { formatCrc } from "@/lib/currency/format";

// El OG no puede dibujar "₡" (la fuente dinámica no baja en el build): se escribe "colones".
const crcWords = (n: number) => `${formatCrc(n).replace("₡", "")} colones`;

export const alt = `DataFud: tu carta digital con QR, lista en ${PRICING.delivery.menuHours} horas`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    title: `Tu carta digital con QR, lista en ${PRICING.delivery.menuHours} horas`,
    subtitle: `Menú digital con QR y NFC para sodas y restaurantes de Costa Rica. Te lo montamos nosotros, desde ${crcWords(PRICING.plans.basico.priceCrc)} al mes.`,
  });
}
