import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "Política de privacidad de DataFud";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    title: "Política de privacidad",
    subtitle: "Qué datos recogemos, para qué los usamos y cómo podés controlarlos.",
    kicker: "datafud.com/privacidad",
  });
}
