import type { Metadata } from "next";
import { CartaUnavailable } from "@/components/carta/unavailable";

export const metadata: Metadata = {
  title: "Carta no disponible",
  robots: { index: false, follow: false },
};

// Mesa borrada o inactiva, local suspendido o enlace mal copiado (AA-10). No dice cuál de esas
// es: al comensal no le sirve y no hay por qué contarlo. Next ya le pone noindex al 404.
export default function MenuNotFound() {
  return <CartaUnavailable kind="menu" />;
}
