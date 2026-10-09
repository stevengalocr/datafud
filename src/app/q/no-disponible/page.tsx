import type { Metadata } from "next";
import { CartaUnavailable } from "@/components/carta/unavailable";

// Destino de un código impreso que no existe o que se dio de baja (AA-11, D-014). Antes mandaba
// a la landing sin decir nada. La ruta estática gana sobre `/q/[code]`, así que no hay bucle.
export const metadata: Metadata = {
  title: "Código no disponible",
  robots: { index: false, follow: false },
};

export default function QrNoDisponible() {
  return <CartaUnavailable kind="qr" />;
}
