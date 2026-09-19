import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "DataFud: el menú digital que abre apetito y cierra ventas";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    title: "El menú digital que abre apetito y cierra ventas",
    subtitle: "Carta por QR y NFC, stands impresos en 3D y pedidos desde la mesa para sodas y restaurantes de Latinoamérica.",
  });
}
