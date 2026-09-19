import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "Términos del servicio de DataFud";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    title: "Términos del servicio",
    subtitle: "Lo que podés esperar de DataFud y lo que esperamos de vos, en lenguaje claro.",
    kicker: "datafud.com/terminos",
  });
}
