import type { Metadata } from "next";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { CartaNotice } from "@/components/carta/unavailable";

// 404 de todo el sitio (AA-10): con la marca, en español y con una línea en inglés, porque acá
// también caen los turistas que abren el enlace de una carta que ya no está. Sin E/S al importar.
export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <CartaNotice
      icon="x"
      title={["No encontramos esta página", "We couldn't find this page"]}
      body={[
        "Puede que el enlace esté incompleto o que la carta ya no esté activa. Si estás en un local, pedile la carta al personal.",
        "The link may be incomplete or the menu may no longer be active. If you are at a restaurant, please ask the staff for the menu.",
      ]}
    >
      <Link href="/" className={buttonClasses("primary", "md")}>
        Ir a DataFud
      </Link>
    </CartaNotice>
  );
}
