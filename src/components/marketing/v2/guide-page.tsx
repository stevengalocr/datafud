import Link from "next/link";
import { LandingNavV2 } from "@/components/marketing/v2/landing-nav-v2";
import { SiteFooter } from "@/components/marketing/v2/site-footer";
import { WhatsAppFloat } from "@/components/marketing/v2/whatsapp-float";
import { AnalyticsEvents } from "@/components/marketing/v2/analytics-events";
import { MetaPixel } from "@/components/marketing/v2/meta-pixel";
import { MagneticCta } from "@/components/marketing/v2/magnetic-cta";
import { Icon } from "@/components/ui/icon";
import { PLAN_CODES, PRICING, hardwareBy, setupFeeFor } from "@/lib/constants";
import { formatCrc, formatUsd } from "@/lib/currency/format";
import { SITE, waProps, type WaOrigin } from "@/lib/site";
import { organizationJsonLd } from "@/lib/seo";

// Plantilla de las guías de SEO local (/menu-digital-costa-rica, /menu-digital-para-sodas,
// /menu-qr-restaurantes-turisticos): mismo nav y footer que la landing, un solo h1, secciones de
// texto, resumen de precios leído de PRICING, preguntas propias y enlaces internos.

export type GuideSection = { title: string; paragraphs: string[]; bullets?: string[]; lang?: "en" };
export type GuideFaq = { q: string; a: string };

export function GuidePage({
  path,
  eyebrow,
  title,
  intro,
  sections,
  faqs,
  origin,
  ctaTitle,
  related,
}: {
  path: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: GuideSection[];
  faqs: GuideFaq[];
  origin: WaOrigin;
  ctaTitle: string;
  related: { href: string; label: string }[];
}) {
  const jsonLd = [
    organizationJsonLd(),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE.name, item: `${SITE.url}/` },
        { "@type": "ListItem", position: 2, name: title, item: `${SITE.url}${path}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <div className="min-h-screen bg-cream-50 font-sans text-brand-900 antialiased">
      <script
        type="application/ld+json"
        // JSON generado por nosotros desde constantes y textos fijos: no hay entrada del usuario.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <LandingNavV2 />

      <main>
        <header className="relative overflow-hidden border-b border-stone-200/60">
          <div className="qr-grid pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative mx-auto max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
            <nav aria-label="Ruta" className="text-sm font-semibold text-brand-700/85">
              <Link href="/" className="inline-flex min-h-11 items-center underline decoration-accent-400 underline-offset-4 hover:text-brand-900">
                Inicio
              </Link>
              <span className="mx-2" aria-hidden="true">/</span>
              <span>{eyebrow}</span>
            </nav>
            <h1 className="mt-4 font-display text-[clamp(2rem,5.5vw,3.3rem)] leading-[1.06] tracking-tight text-brand-900">{title}</h1>
            <p className="mt-5 text-base font-medium leading-relaxed text-brand-800/85 sm:text-lg">{intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <MagneticCta
                {...waProps(origin)}
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-lg border border-accent-400 bg-brand-600 px-7 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-sm transition-colors duration-300 ease-out-expo hover:bg-brand-700"
              >
                <Icon name="whatsapp" size={18} />
                Cotizar por WhatsApp
              </MagneticCta>
              <Link
                href="/preview/cliente"
                data-demo-open={`guia-${path.slice(1)}`}
                className="inline-flex h-12 items-center justify-center rounded-lg border border-stone-300 bg-white/70 px-7 text-xs font-bold uppercase tracking-[0.16em] text-brand-800 transition-colors hover:border-stone-400 hover:bg-cream-100"
              >
                Ver la carta demo
              </Link>
            </div>
          </div>
        </header>

        <article className="mx-auto max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
          <div className="space-y-12">
            {sections.map((s) => (
              <section key={s.title} lang={s.lang}>
                <h2 className="font-display text-2xl leading-tight text-brand-900 sm:text-3xl">{s.title}</h2>
                <div className="mt-4 space-y-4 text-base font-medium leading-relaxed text-brand-800/85">
                  {s.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                  {s.bullets && (
                    <ul className="space-y-2.5">
                      {s.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3">
                          <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-500" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}

            <PriceSummary />

            <section>
              <h2 className="font-display text-2xl leading-tight text-brand-900 sm:text-3xl">Preguntas</h2>
              <dl className="mt-5 divide-y divide-stone-200/80 border-y border-stone-200/80">
                {faqs.map((f) => (
                  <div key={f.q} className="py-5">
                    <dt className="font-display text-lg text-brand-900">{f.q}</dt>
                    <dd className="mt-2 text-base font-medium leading-relaxed text-brand-800/85">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="rounded-3xl bg-brand-950 p-7 text-cream-100 sm:p-10">
              <h2 className="font-display text-2xl leading-tight text-accent-100 sm:text-3xl">{ctaTitle}</h2>
              <p className="mt-3 text-base font-medium leading-relaxed text-cream-100/80">
                Contanos cómo es tu local y te respondemos con una propuesta clara. Sin compromiso.
              </p>
              <a
                {...waProps(origin)}
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2.5 rounded-lg border border-accent-300 bg-accent-500 px-7 text-xs font-bold uppercase tracking-[0.16em] text-brand-950 transition-colors hover:bg-accent-400"
              >
                <Icon name="whatsapp" size={18} />
                Escribinos por WhatsApp
              </a>
            </section>

            <nav aria-label="Seguí leyendo">
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-accent-700">Seguí leyendo</h2>
              <ul className="mt-3 flex flex-col">
                {related.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href} className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-brand-800 underline decoration-accent-400 underline-offset-4 hover:text-brand-900">
                      {r.label}
                      <Icon name="arrow-right" size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </article>
      </main>

      <SiteFooter />
      <WhatsAppFloat />
      <AnalyticsEvents />
      <MetaPixel />
    </div>
  );
}

/** Resumen de precios de DataFud, siempre leído de PRICING. */
function PriceSummary() {
  return (
    <section>
      <h2 className="font-display text-2xl leading-tight text-brand-900 sm:text-3xl">Cuánto cuesta DataFud</h2>
      <div className="mt-5 overflow-hidden rounded-2xl border border-stone-200/80 bg-white">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Planes de DataFud en colones</caption>
          <thead className="bg-cream-100 text-xs font-bold uppercase tracking-[0.1em] text-brand-800">
            <tr>
              <th scope="col" className="px-4 py-3">Plan</th>
              <th scope="col" className="px-4 py-3">Mensualidad</th>
              <th scope="col" className="hidden px-4 py-3 sm:table-cell">Implementación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200/70 font-medium text-brand-800">
            {PLAN_CODES.map((code) => {
              const p = PRICING.plans[code];
              return (
                <tr key={code}>
                  <th scope="row" className="px-4 py-3 font-display text-base font-normal text-brand-900">
                    {p.marketingName}
                    <span className="block font-sans text-xs font-medium text-brand-700/85">{p.tableOrdering ? "con pedidos y panel" : "carta digital"}</span>
                  </th>
                  <td className="px-4 py-3">
                    <span className="font-bold text-brand-900">{formatCrc(p.priceCrc)}</span>
                    <span className="block text-xs text-brand-700/85">≈ {formatUsd(p.priceUsd)}</span>
                    <span className="mt-1 block text-xs text-brand-700/85 sm:hidden">Implementación: {formatCrc(setupFeeFor(code).crc)}</span>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">{formatCrc(setupFeeFor(code).crc)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm font-medium leading-relaxed text-brand-700/85">
        Stand QR 3D desde {formatCrc(hardwareBy("stand-qr-3d").priceCrc)} y tarjeta NFC a {formatCrc(hardwareBy("tarjeta-nfc").priceCrc)} por
        unidad. {PRICING.terms.permanence}{" "}
        <Link href="/#planes" className="font-semibold text-brand-800 underline decoration-accent-400 underline-offset-4 hover:text-brand-900">
          Ver los planes completos
        </Link>
        .
      </p>
    </section>
  );
}
