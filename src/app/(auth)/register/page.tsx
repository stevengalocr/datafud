import { redirect } from "next/navigation";

// El autoservicio está cerrado en esta etapa (decisión D-011): la conversión pasa por
// WhatsApp y el formulario de contacto de la landing.
export default function RegisterPage() {
  redirect("/#contacto");
}
