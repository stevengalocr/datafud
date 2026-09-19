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
    .optional(),
  // Honeypot: los humanos no lo ven ni lo llenan.
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string };

/** El formulario existe solo si el servidor tiene la clave de Resend. */
export function isContactFormEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}
