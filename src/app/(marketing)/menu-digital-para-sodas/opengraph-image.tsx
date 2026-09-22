import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "Menú digital para sodas · DataFud";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    title: "Menú digital para sodas",
    subtitle: "Carta con QR en colones, cambios por WhatsApp y stands que aguantan el día a día.",
    kicker: "datafud.com/menu-digital-para-sodas",
  });
}
