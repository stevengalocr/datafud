import type { Metadata } from "next";
import { PreviewBanner } from "@/components/preview/preview-banner";
import { MenuClient } from "@/app/m/[tenant]/[table]/menu-client";
import { ejemplo } from "@/content/cartas/ejemplo";

export const metadata: Metadata = {
  title: "Demo: plan Carta",
  description:
    "La carta digital del plan Carta, tal como la ve el comensal: fotos, precios en colones y cambio entre español e inglés. Sin pedidos desde la mesa.",
  alternates: { canonical: "/preview/carta" },
};

// Demo del plan Carta: lo primero que se le enseña a un prospecto. Misma carta que /c/ejemplo,
// con el banner de modo demo encima. Sin carrito: en el plan Carta se ordena como siempre.
export default function PreviewCarta() {
  return (
    <div>
      <PreviewBanner active="/preview/carta" />
      <MenuClient data={ejemplo.menu} slug={ejemplo.slug} token="" demo ordering={false} tagline={ejemplo.tagline} />
    </div>
  );
}
