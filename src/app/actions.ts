"use server";

import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { contactSchema, type ContactState } from "@/lib/contact";

const FALLBACK_ERROR = "No pudimos enviar tu mensaje. Probá de nuevo o escribinos por WhatsApp.";

// Formulario de contacto de la landing. Sin RESEND_API_KEY el formulario no se renderiza
// (lo decide el servidor en contact-section.tsx); esta acción además responde con un
// error amable si llegara a llamarse sin la clave.
export async function sendContactAction(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    business: formData.get("business"),
    phone: formData.get("phone"),
    businessType: formData.get("businessType"),
    message: formData.get("message") || undefined,
    website: formData.get("website") || undefined,
  });

  if (!parsed.success) {
    // Un honeypot lleno se trata como éxito silencioso: no le damos pistas al bot.
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return { status: "ok" };
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Revisá los datos del formulario.",
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      status: "error",
      message: "El formulario no está disponible en este momento. Escribinos por WhatsApp y te respondemos.",
    };
  }

  const { name, business, phone, businessType, message } = parsed.data;
  const from = process.env.RESEND_FROM_EMAIL || "DataFud <onboarding@resend.dev>";
  const text = [
    `Nombre: ${name}`,
    `Local: ${business}`,
    `Tipo de negocio: ${businessType}`,
    `WhatsApp / teléfono: ${phone}`,
    "",
    message ? `Mensaje:\n${message}` : "Sin mensaje adicional.",
    "",
    `Enviado desde ${SITE.url}#contacto`,
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [SITE.email],
      subject: `Nuevo contacto desde datafud.com: ${business}`,
      text,
    });
    if (error) {
      console.error("[contacto] Resend devolvió error:", error.message);
      return { status: "error", message: FALLBACK_ERROR };
    }
    return { status: "ok" };
  } catch (err) {
    console.error("[contacto] Falló el envío:", err);
    return { status: "error", message: FALLBACK_ERROR };
  }
}
