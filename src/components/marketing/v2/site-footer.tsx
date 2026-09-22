import Link from "next/link";
import Image from "next/image";
import { RevealOnView } from "@/components/marketing/v2/reveal";
import { MagneticCta } from "@/components/marketing/v2/magnetic-cta";
import { Icon } from "@/components/ui/icon";
import { PRICING } from "@/lib/constants";
import { formatCrc } from "@/lib/currency/format";
import { SITE, hasWhatsApp, mailLink, socialLinks, waProps, whatsappDisplay } from "@/lib/site";

// Cierre oscuro (CTA final) + footer de la landing.
const explore = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#sistema", label: "El sistema" },
  { href: "#hardware", label: "Hardware de mesa" },
  { href: "#implementacion", label: "Implementación" },
  { href: "#planes", label: "Planes y precios" },
  { href: "#demo", label: "Demo en vivo" },
  { href: "#preguntas", label: "Preguntas" },
  { href: "#contacto", label: "Contacto" },
];

export function SiteFooter() {
  return (
      <footer className="relative isolate overflow-hidden bg-brand-950 text-cream-100">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px]">
          <Image src="/cta-bg.png" alt="" fill sizes="100vw" className="object-cover object-center" />
          <div className="absolute inset-0 bg-brand-950/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-900/55 via-brand-950/90 to-brand-950" />
          <div className="qr-grid absolute inset-0 opacity-[0.05]" />
        </div>
        <div className="pointer-events-none absolute left-1/2 top-24 -z-10 h-72 w-[36rem] max-w-[88%] -translate-x-1/2 rounded-full bg-accent-500/10 blur-3xl" />

        <RevealOnView className="relative">
          <div className="reveal-up mx-auto max-w-2xl px-5 pb-16 pt-24 text-center sm:px-6 sm:pb-20 sm:pt-32">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-200">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
              Empezá hoy
            </span>
            <h2 className="mt-7 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.08] text-accent-100">
              Llevá la carta de tu local al siguiente nivel
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm font-medium leading-relaxed text-cream-100/80">
              Contanos cómo es tu local y te proponemos la carta, el hardware de mesa
              y el plan que le calzan. Sin compromiso.
            </p>
            <MagneticCta
              {...waProps("cierre")}
              className="mt-10 inline-flex h-12 items-center justify-center gap-2.5 whitespace-nowrap rounded-lg border border-accent-300 bg-accent-500 px-8 text-xs font-bold uppercase tracking-[0.18em] text-brand-950 shadow-md transition-colors duration-300 ease-out-expo hover:bg-accent-400"
            >
              <Icon name="whatsapp" size={18} />
              Hablemos por WhatsApp
            </MagneticCta>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-cream-100/50">
              Carta lista en {PRICING.delivery.menuHours} horas · desde {formatCrc(PRICING.plans.basico.priceCrc)}/mes
            </p>
          </div>

          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>

          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-16">
            <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
              <div className="flex max-w-sm flex-col items-start">
                <span className="inline-flex items-center rounded-xl bg-white px-3 py-2 shadow-sm">
                  <Image src="/logo-main.png" alt="DataFud" width={140} height={58} className="h-7 w-auto" />
                </span>
                <p className="mt-6 text-[13px] font-medium leading-relaxed text-cream-100/70">
                  Menú digital por QR y NFC, pedidos desde la mesa y reportes de venta
                  para sodas, cafeterías y restaurantes de Latinoamérica.
                </p>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-300/80">Explorar</h3>
                <nav aria-label="Explorar" className="mt-4 flex flex-col items-start text-xs font-bold uppercase tracking-[0.16em] text-cream-100/75">
                  {explore.map((l) => (
                    <a key={l.href} href={l.href} className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-white">
                      {l.label}
                    </a>
                  ))}
                </nav>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-300/80">Contacto</h3>
                <div className="mt-4 flex flex-col items-start text-xs font-semibold text-cream-100/80">
                  {hasWhatsApp() && (
                    <a {...waProps("footer")} className="inline-flex min-h-11 items-center gap-2 transition-colors duration-200 hover:text-white">
                      <Icon name="whatsapp" size={14} className="text-accent-400" /> {whatsappDisplay()}
                    </a>
                  )}
                  <a href={mailLink()} className="inline-flex min-h-11 items-center gap-2 transition-colors duration-200 hover:text-white">
                    <Icon name="mail" size={14} className="text-accent-400" /> {SITE.email}
                  </a>
                  <p className="flex min-h-11 items-center gap-2"><Icon name="pin" size={14} className="text-accent-400" /> {SITE.region}</p>
                  {/* Redes: solo las que tienen URL en SITE.social (hoy ninguna). */}
                  {socialLinks().map((l) => (
                    <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 transition-colors duration-200 hover:text-white">
                      <Icon name="globe" size={14} className="text-accent-400" /> {l.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pb-16 pt-8 text-[10px] md:pb-0 font-bold uppercase tracking-[0.16em] text-cream-100/50 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} DATAFUD · UN PRODUCTO DE <span className="text-accent-400">GALODEV</span></p>
              <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-5">
                <Link href="/terminos" className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-white">Términos</Link>
                <Link href="/privacidad" className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-white">Privacidad</Link>
                <span className="inline-flex min-h-11 items-center">Hecho en Latinoamérica</span>
              </nav>
            </div>
          </div>
        </RevealOnView>
      </footer>
  );
}
