import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "Menú digital en Costa Rica · DataFud";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    title: "Menú digital en Costa Rica",
    subtitle: "Qué es, cuánto cuesta y qué incluye una carta con QR para tu local.",
    kicker: "datafud.com/menu-digital-costa-rica",
  });
}
