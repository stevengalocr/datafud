import { z } from "zod";

// Esquema y tipos del formulario de contacto de la landing. La acción de servidor vive
// en src/app/actions.ts (un archivo "use server" solo puede exportar funciones async).

export const BUSINESS_TYPES = [
  "Restaurante",
  "Soda",
  "Cafetería",
  "Bar",
  "Food truck",
  "Hotel",
  "Otro",
] as const;

/**
 * Trampa de tiempo: un humano tarda más de 3 s en llenar el formulario. El sello vale 45 min desde
 * el primer toque (si vence, el servidor manda otro y lo escrito se conserva). Se mide con el reloj
 * del servidor (sello firmado de src/lib/contact-guard.ts).
 */
export const MIN_FILL_MS = 3_000;
export const MAX_FILL_MS = 45 * 60 * 1000;
/** Más de 2 enlaces en el mensaje es spam en la práctica. */
export const MAX_URLS_IN_MESSAGE = 2;

const URL_PATTERN = /(https?:\/\/|www\.)/gi;

export function countUrls(text: string): number {
  return (text.match(URL_PATTERN) ?? []).length;
}

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Contanos tu nombre.").max(80, "El nombre es muy largo."),
  business: z
    .string()
    .trim()
    .min(2, "Contanos el nombre de tu local.")
    .max(120, "El nombre del local es muy largo."),
  phone: z
    .string()
    .trim()
    .min(8, "Dejanos un WhatsApp o teléfono para responderte.")
    .max(25, "El número es muy largo.")
    .regex(/^[+\d][\d\s().-]{6,}$/, "Revisá el número: solo dígitos, espacios o +."),
  businessType: z.enum(BUSINESS_TYPES, { message: "Elegí el tipo de negocio." }),
  message: z
    .string()
    .trim()
    .max(1500, "El mensaje es muy largo (máximo 1500 caracteres).")
    .refine((m) => countUrls(m) <= MAX_URLS_IN_MESSAGE, {
      message: "Tu mensaje tiene demasiados enlaces. Dejanos máximo dos o escribinos por WhatsApp.",
    })
    .optional(),
  // Honeypot: los humanos no lo ven ni lo llenan.
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactState =
  | { status: "idle" }
  | { status: "ok" }
  // `stamp`: sello nuevo para reenviar (el formulario lo reemplaza). `values`: lo que la persona
  // escribió, para que React no lo borre al reiniciar el formulario después del error.
  | { status: "error"; message: string; stamp?: string; values?: ContactValues };

/** Lo escrito en el formulario, devuelto tal cual (recortado) cuando hay error. */
export type ContactValues = {
  name: string;
  business: string;
  phone: string;
  businessType: string;
  message: string;
};

/** El formulario existe solo si el servidor tiene la clave de Resend. */
export function isContactFormEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}
