import { Icon } from "@/components/ui/icon";
import { RevealOnView } from "@/components/marketing/v2/reveal";
import { ContactForm } from "@/components/marketing/v2/contact-form";
import { isContactFormEnabled } from "@/lib/contact";
import { turnstileSiteKey } from "@/lib/turnstile";
import { hasWhatsApp, waProps, whatsappDisplay } from "@/lib/site";

// Sección #contacto. Server Component: decide en el servidor si existe RESEND_API_KEY.
// Sin la clave, el formulario no se renderiza y queda solo WhatsApp.
//
// D-039: el único canal público es WhatsApp. El correo existe solo como destino interno del
// formulario (SITE.leadsEmail) y no se muestra en ninguna parte.
export function ContactSection() {
  const formEnabled = isContactFormEnabled();
  const wa = waProps("contacto");
  const showWhatsApp = hasWhatsApp();

  const checklist = [
    "El nombre de tu local y qué tipo de negocio es.",
    "Cuántas mesas tenés y si ya usás alguna carta digital.",
    "Si te interesa solo la carta o el sistema completo con pedidos.",
    "Si querés stands QR 3D o tarjetas NFC para las mesas.",
  ];

  return (
    <section id="contacto" className="relative scroll-mt-24 border-t border-stone-200/60 bg-cream-100/60">
      <div className="qr-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-28">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <RevealOnView className="flex flex-col">
            <div className="reveal-up">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">Contacto</p>
              <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight text-brand-900">
                Hablemos de tu local
              </h2>
              <p className="mt-5 max-w-md text-base font-medium leading-relaxed text-brand-800/80">
                Contanos qué tenés hoy y qué querés lograr. Te respondemos con una propuesta
                clara: carta, hardware de mesa y el plan que le calza a tu local, sin compromiso.
              </p>
            </div>

            <div className="reveal-up mt-9 flex flex-col gap-3">
              {showWhatsApp && (
                <a
                  {...wa}
                  className="group flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-white px-5 py-4 transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-accent-300/70 hover:shadow-[0_16px_40px_-24px_rgba(34,80,58,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-accent-300 bg-brand-600 text-white">
                    <Icon name="whatsapp" size={20} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent-700">WhatsApp</span>
                    <span className="font-display text-lg leading-tight text-brand-900">{whatsappDisplay()}</span>
                    <span className="mt-0.5 text-xs font-medium text-brand-700/70">Cotizaciones, dudas y soporte. Respondemos en horario de oficina.</span>
                  </span>
                  <Icon name="arrow-right" size={18} className="ml-auto text-brand-700/75 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              )}
            </div>

          </RevealOnView>

          <RevealOnView className="relative">
            {formEnabled ? (
              <div className="reveal-up relative">
                <ContactForm whatsappHref={wa.href} turnstileSiteKey={turnstileSiteKey()} />
              </div>
            ) : (
              <div className="reveal-up relative rounded-2xl border border-stone-200/80 bg-white p-7 sm:p-9">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-700">Para responderte rápido</p>
                <h3 className="mt-2 font-display text-2xl text-brand-900">Contanos esto en tu mensaje</h3>
                <ul className="mt-6 space-y-4">
                  {checklist.map((item, i) => (
                    <li key={item} className="flex items-start gap-4 text-sm font-medium leading-relaxed text-brand-800/85">
                      <span className="font-display text-xl leading-none text-accent-700">{String(i + 1).padStart(2, "0")}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </RevealOnView>
        </div>
      </div>
    </section>
  );
}
