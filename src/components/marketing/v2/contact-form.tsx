"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";
import { trackEvent } from "@/components/marketing/v2/tracking";
import { sendContactAction } from "@/app/actions";
import { BUSINESS_TYPES, type ContactState } from "@/lib/contact";
import { TurnstileWidget } from "@/components/marketing/v2/turnstile-widget";

const field =
  "h-12 w-full rounded-lg border border-stone-250 bg-cream-50 px-4 text-sm font-medium text-brand-900 placeholder:text-brand-700/45 transition-colors duration-200 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-accent-400/60";
const label = "mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-brand-800";

const initial: ContactState = { status: "idle" };

// Formulario de contacto. Solo se monta cuando el servidor confirmó que hay RESEND_API_KEY.
export function ContactForm({ whatsappHref, turnstileSiteKey }: { whatsappHref: string; turnstileSiteKey?: string | null }) {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(sendContactAction, initial);
  const formRef = useRef<HTMLFormElement>(null);
  // Trampa de tiempo: se mide en el cliente (sin depender del reloj del servidor ni del build).
  const mountedAt = useRef<number>(Date.now());
  const elapsedRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const id = useId();

  useEffect(() => {
    if (state.status === "ok") {
      formRef.current?.reset();
      mountedAt.current = Date.now();
    }
    if (state.status !== "idle") {
      statusRef.current?.focus();
      trackEvent("contact_submit", { resultado: state.status });
    }
  }, [state]);

  const isExternal = whatsappHref.startsWith("http");

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={() => {
        if (elapsedRef.current) elapsedRef.current.value = String(Date.now() - mountedAt.current);
      }}
      noValidate={false}
      className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_24px_60px_-28px_rgba(34,80,58,0.28)] sm:p-8"
      aria-describedby={`${id}-status`}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className={label}>Tu nombre</label>
          <input id={`${id}-name`} name="name" autoComplete="name" required minLength={2} maxLength={80} placeholder="Ana Rodríguez" className={field} />
        </div>
        <div>
          <label htmlFor={`${id}-business`} className={label}>Nombre del local</label>
          <input id={`${id}-business`} name="business" autoComplete="organization" required minLength={2} maxLength={120} placeholder="Soda La Esquina" className={field} />
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className={label}>WhatsApp o teléfono</label>
          <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" inputMode="tel" required minLength={8} maxLength={25} placeholder="+506 8888 8888" className={field} />
        </div>
        <div>
          <label htmlFor={`${id}-type`} className={label}>Tipo de negocio</label>
          <div className="relative">
            <select id={`${id}-type`} name="businessType" required defaultValue="" className={cn(field, "appearance-none pr-11")}>
              <option value="" disabled>Elegí una opción</option>
              {BUSINESS_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <Icon name="chevron-down" size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-700" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-message`} className={label}>
            Mensaje <span className="font-semibold normal-case tracking-normal text-brand-700/75">(opcional)</span>
          </label>
          <textarea id={`${id}-message`} name="message" rows={4} maxLength={1500} placeholder="Contanos cuántas mesas tenés, si ya usás carta digital o qué te gustaría resolver." className={cn(field, "h-auto py-3 leading-relaxed")} />
        </div>
      </div>

      {/* Tiempo de llenado en ms; lo escribe onSubmit. Sin JS queda vacío y el servidor lo descarta. */}
      <input ref={elapsedRef} type="hidden" name="elapsedMs" defaultValue="" />

      {turnstileSiteKey && (
        <div className="mt-6">
          <TurnstileWidget siteKey={turnstileSiteKey} />
        </div>
      )}

      {/* Honeypot: fuera de la vista y del orden de tabulación. */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Sitio web</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-accent-400 bg-brand-600 px-8 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-sm transition-colors duration-300 ease-out-expo hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 disabled:cursor-progress disabled:opacity-70"
        >
          {pending ? "Enviando…" : "Enviar mensaje"}
          {!pending && <Icon name="arrow-right" size={16} />}
        </button>
        <p className="text-xs font-medium leading-relaxed text-brand-700/70">
          Te respondemos por WhatsApp o teléfono, en horario de oficina de Costa Rica.
        </p>
      </div>

      <p
        id={`${id}-status`}
        ref={statusRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          "mt-5 rounded-lg px-4 py-3 text-sm font-medium leading-relaxed outline-none",
          state.status === "idle" && "sr-only",
          state.status === "ok" && "border border-brand-200 bg-brand-50 text-brand-800",
          state.status === "error" && "border border-accent-300 bg-accent-50 text-accent-800"
        )}
      >
        {pending && "Enviando tu mensaje…"}
        {!pending && state.status === "ok" && "Recibimos tu mensaje. Te escribimos pronto para conocer tu local."}
        {!pending && state.status === "error" && (
          <>
            {state.message}{" "}
            <a
              href={whatsappHref}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="font-bold underline decoration-accent-500 underline-offset-4 hover:text-brand-900"
            >
              Abrir WhatsApp
            </a>
          </>
        )}
      </p>
    </form>
  );
}
