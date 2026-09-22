import Link from "next/link";
import Image from "next/image";
import { LandingNavV2 } from "@/components/marketing/v2/landing-nav-v2";
import { Icon } from "@/components/ui/icon";
import { SITE, mailLink } from "@/lib/site";

// Plantilla de las páginas legales (/terminos, /privacidad): layout de marca, versión vigente
// y secciones numeradas.

export type LegalSection = { title: string; paragraphs: string[]; bullets?: string[] };

export const LEGAL_VERSION = "1.0";
export const LEGAL_UPDATED = "22 de setiembre de 2026";

export function LegalPage({
  eyebrow,
  title,
  intro,
  sections,
  sibling,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  sibling: { href: string; label: string };
}) {
  return (
    <div className="min-h-screen bg-cream-50 font-sans text-brand-900 antialiased">
      <LandingNavV2 />

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-14 sm:px-6 sm:pt-20">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">{eyebrow}</p>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.2rem)] leading-[1.08] tracking-tight text-brand-900">{title}</h1>
        <p className="mt-4 text-sm font-semibold text-brand-700/80">
          Versión {LEGAL_VERSION} · vigente desde el {LEGAL_UPDATED}
        </p>

        <p className="mt-10 text-base font-medium leading-relaxed text-brand-800/85">{intro}</p>

        <div className="mt-12 space-y-10">
          {sections.map((s, i) => (
            <section key={s.title} aria-labelledby={`sec-${i + 1}`}>
              <h2 id={`sec-${i + 1}`} className="flex items-baseline gap-3 font-display text-2xl text-brand-900">
                <span className="text-base text-accent-700">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              <div className="mt-4 space-y-4 text-[15px] font-medium leading-relaxed text-brand-800/85">
                {s.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {s.bullets && (
                  <ul className="space-y-2 pl-1">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-500" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-stone-200/80 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-brand-700/80">
            ¿Dudas sobre este documento? Escribinos a{" "}
            <a href={mailLink(`Consulta sobre ${title}`)} className="inline-flex min-h-11 items-center font-bold text-brand-800 underline decoration-accent-400 underline-offset-4 hover:text-brand-900">
              {SITE.email}
            </a>
            .
          </p>
          <Link href={sibling.href} className="inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-800 hover:text-brand-900">
            {sibling.label}
            <Icon name="arrow-right" size={14} />
          </Link>
        </div>
      </main>

      <footer className="border-t border-stone-200/60 bg-cream-100/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link href="/" aria-label="DataFud — inicio" className="inline-flex min-h-11 items-center self-start rounded-xl bg-white px-3 py-2 shadow-sm">
            <Image src="/logo-main.png" alt="DataFud" width={120} height={50} className="h-6 w-auto" />
          </Link>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-6 text-xs font-bold uppercase tracking-[0.14em] text-brand-700/80">
            <Link href="/" className="inline-flex min-h-11 items-center hover:text-brand-900">Inicio</Link>
            <Link href="/#contacto" className="inline-flex min-h-11 items-center hover:text-brand-900">Contacto</Link>
            <Link href="/terminos" className="inline-flex min-h-11 items-center hover:text-brand-900">Términos</Link>
            <Link href="/privacidad" className="inline-flex min-h-11 items-center hover:text-brand-900">Privacidad</Link>
          </nav>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700/75">
            © {new Date().getFullYear()} DataFud · un producto de {SITE.maker}
          </p>
        </div>
      </footer>
    </div>
  );
}
