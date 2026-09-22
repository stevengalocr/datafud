import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "DataFud: tu carta digital con QR, lista en 48 horas";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    title: "Tu carta digital con QR, lista en 48 horas",
    subtitle: "Menú digital con QR y NFC para sodas y restaurantes de Costa Rica. Te lo montamos nosotros, desde 14 900 colones al mes.",
  });
}
