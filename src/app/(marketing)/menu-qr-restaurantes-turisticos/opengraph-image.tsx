import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "Menú QR para restaurantes turísticos · DataFud";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    title: "Menú QR para restaurantes turísticos",
    subtitle: "Carta en español e inglés, con ingredientes, alérgenos y NFC en la mesa.",
    kicker: "datafud.com/menu-qr-restaurantes-turisticos",
  });
}
