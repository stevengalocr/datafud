import type { Metadata } from "next";
import { redirect } from "next/navigation";

// La ruta responde 307 (sin HTML); el noindex efectivo lo da la cabecera X-Robots-Tag de
// next.config.mjs y el disallow de robots.txt. La metadata queda por coherencia.
export const metadata: Metadata = {
  title: "Contacto",
  robots: { index: false, follow: false },
};

// El autoservicio está cerrado en esta etapa (decisión D-011): la conversión pasa por
// WhatsApp y el formulario de contacto de la landing.
export default function RegisterPage() {
  redirect("/#contacto");
}
