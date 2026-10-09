"use server";

import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { headers } from "next/headers";
import { contactSchema, type ContactState, type ContactValues } from "@/lib/contact";
import { isTurnstileEnabled } from "@/lib/turnstile";
import {
  allowContactAttempt,
  checkFormStamp,
  clientIp,
  consumeFormStamp,
  issueFormStamp,
  verifyTurnstileToken,
} from "@/lib/contact-guard";
import { fail, ok, type ActionResult } from "@/lib/action-result";

const FALLBACK_ERROR = "No pudimos enviar tu mensaje. Probá de nuevo o escribinos por WhatsApp.";

/**
 * Sello firmado del formulario de contacto: el cliente lo pide al empezar a llenarlo y lo manda
 * con el envío. Sin RESEND_API_KEY devuelve un error amable (el formulario tampoco se muestra).
 */
export async function startContactAction(): Promise<ActionResult<{ stamp: string }>> {
  const stamp = issueFormStamp();
  return stamp ? ok({ stamp }) : fail("El formulario no está disponible en este momento.");
}

const field = (formData: FormData, key: string, max: number) => {
  const v = formData.get(key);
  return typeof v === "string" ? v.slice(0, max) : "";
};

/** Lo escrito, para devolverlo con el error: React 19 reinicia el formulario después de la acción. */
function typedValues(formData: FormData): ContactValues {
  return {
    name: field(formData, "name", 80),
    business: field(formData, "business", 120),
    phone: field(formData, "phone", 25),
    businessType: field(formData, "businessType", 40),
    message: field(formData, "message", 1500),
  };
}

const RELOAD = "No pudimos validar el formulario. Recargá la página y volvé a enviar el mensaje.";

// Formulario de contacto de la landing. Sin RESEND_API_KEY el formulario no se renderiza
// (lo decide el servidor en contact-section.tsx); esta acción además responde con un
// error amable si llegara a llamarse sin la clave.
// Anti-abuso sin infraestructura: honeypot, sello de tiempo firmado por el servidor (el tiempo
// de llenado se mide con el reloj del servidor, y cada sello sirve para un envío), tope de enlaces
// en el mensaje, tope de envíos por IP y, si está configurado, Cloudflare Turnstile atado a
// nuestro dominio. Solo el honeypot recibe un éxito silencioso; todo lo demás le dice a la persona
// qué hacer y conserva lo que escribió.
export async function sendContactAction(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const values = typedValues(formData);
  const failWith = (message: string, freshStamp = false): ContactState => ({
    status: "error",
    message,
    values,
    stamp: freshStamp ? (issueFormStamp() ?? undefined) : undefined,
  });

  const raw = formData.get("stamp");
  const stamp = typeof raw === "string" ? raw : "";
  const stampCheck = stamp ? checkFormStamp(stamp) : "missing";
  if (stampCheck === "missing") {
    return failWith(
      "No pudimos preparar el formulario. Esperá unos segundos y volvé a enviar; si sigue, recargá la página o escribinos por WhatsApp."
    );
  }
  if (stampCheck === "invalid" || stampCheck === "used") {
    console.info(`[contacto] sello ${stampCheck === "used" ? "repetido" : "inválido"}`);
    return failWith(RELOAD, true);
  }
  if (stampCheck === "too-fast") return failWith("Esperá unos segundos y volvé a enviar.");
  if (stampCheck === "expired") {
    return failWith("La página llevaba mucho rato abierta. Volvé a enviar el mensaje.", true);
  }

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
    if (parsed.error.issues.some((i) => i.path[0] === "website")) {
      console.info("[contacto] descartado por honeypot");
      return { status: "ok" };
    }
    // El sello no se gastó: sigue sirviendo para corregir y reenviar.
    return failWith(parsed.error.issues[0]?.message ?? "Revisá los datos del formulario.");
  }

  // De acá en adelante el sello ya se usó: cada error manda uno nuevo para poder reenviar.
  consumeFormStamp(stamp);

  const ip = clientIp(await headers());
  if (!allowContactAttempt(ip)) {
    return failWith(
      "Recibimos varios mensajes seguidos desde tu conexión. Esperá unos minutos o escribinos por WhatsApp.",
      true
    );
  }

  if (isTurnstileEnabled()) {
    const token = formData.get("cf-turnstile-response");
    const valid = await verifyTurnstileToken(typeof token === "string" ? token : null, ip);
    if (!valid) {
      return failWith("No pudimos confirmar que sos una persona. Probá de nuevo o escribinos por WhatsApp.", true);
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return failWith("El formulario no está disponible en este momento. Escribinos por WhatsApp y te respondemos.");
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
      to: [SITE.leadsEmail],
      subject: `Nuevo contacto desde datafud.com: ${business}`,
      text,
    });
    if (error) {
      console.error("[contacto] Resend devolvió error:", error.message);
      return failWith(FALLBACK_ERROR, true);
    }
    return { status: "ok" };
  } catch (err) {
    console.error("[contacto] Falló el envío:", err);
    return failWith(FALLBACK_ERROR, true);
  }
}
