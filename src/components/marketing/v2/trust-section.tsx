import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { Icon, type IconName } from "@/components/ui/icon";
import { RevealOnView } from "@/components/marketing/v2/reveal";
import { TESTIMONIALS } from "@/lib/constants";
import { SITE, hasWhatsApp, waProps, whatsappDisplay } from "@/lib/site";

// Sección #confianza: "Por qué DataFud" en cuatro puntos verificables + firma del fundador.
// Sin testimonios, logos ni cifras inventadas: los testimonios solo aparecen si TESTIMONIALS
// tiene entradas reales, y la foto del fundador solo si el archivo existe en public/.

type Point = { icon: IconName; title: string; desc: string };

const points: Point[] = [
  {
    icon: "utensils",
    title: "Te la montamos nosotros",
    desc: "Nos pasás el menú, las fotos y el logo; nosotros diseñamos, cargamos y publicamos la carta. No tenés que aprender ningún sistema.",
  },
  {
    icon: "globe",
    title: "Bilingüe desde el primer plan",
    desc: "Todos los planes incluyen español e inglés, y el comensal cambia de idioma con un toque. Empresarial suma portugués.",
  },
  {
    icon: "printer",
    title: "Stands 3D y NFC hechos acá",
    desc: "Los diseñamos e imprimimos en Costa Rica, con tu logo y tus colores. Sin pedido mínimo.",
  },
  {
    icon: "whatsapp",
    title: "Cambios por WhatsApp",
    desc: "¿Subió el precio del casado? Nos escribís y lo cambiamos, sin reimprimir nada. Incluido en todos los planes.",
  },
];

const promises = ["Tu menú, tus fotos y tu marca son tuyos", "Te atiende una persona, no un bot"];

// Se evalúa en el build (la landing es estática): subir la foto y redesplegar la activa.
const founderPhoto = existsSync(path.join(process.cwd(), "public", SITE.founder.photo)) ? SITE.founder.photo : null;

export function TrustSection() {
  const wa = waProps("confianza");
  return (
    <section id="confianza" className="scroll-mt-24 border-y border-stone-200/60 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-28">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <RevealOnView className="lg:sticky lg:top-28 lg:self-start">
            <div className="reveal-up">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">Por qué DataFud</p>
              <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight text-brand-900">
                Lo que te llevás, dicho sin vueltas
              </h2>
              <p className="mt-5 max-w-md text-base font-medium leading-relaxed text-brand-800/80">
                Somos un equipo chico en Costa Rica: sabés quién te atiende, qué pagás y qué pasa
                si un día querés irte.
              </p>
            </div>

            {/* Firma del fundador */}
            <div className="reveal-up mt-9 flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-cream-50/70 p-5">
              {founderPhoto ? (
                <Image
                  src={founderPhoto}
                  alt={`${SITE.founder.name}, fundador de DataFud`}
                  width={64}
                  height={64}
                  className="h-16 w-16 flex-shrink-0 rounded-2xl object-cover"
                />
              ) : (
                <span
                  className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-accent-300 bg-brand-600 font-display text-2xl text-accent-100"
                  aria-hidden="true"
                >
                  {SITE.founder.initials}
                </span>
              )}
              <div className="min-w-0">
                <p className="font-display text-xl leading-tight text-brand-900">{SITE.founder.name}</p>
                <p className="text-sm font-medium text-brand-700/85">
                  {SITE.founder.role} · {SITE.maker}
                </p>
                {hasWhatsApp() && (
                  <a {...wa} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-brand-700 underline decoration-accent-400 underline-offset-4 transition-colors hover:text-brand-900">
                    <Icon name="whatsapp" size={14} />
                    {whatsappDisplay()}
                  </a>
                )}
              </div>
            </div>

            <ul className="reveal-up mt-6 space-y-2">
              {promises.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-sm font-semibold text-brand-800">
                  <Icon name="check" size={14} className="text-accent-700" />
                  {p}
                </li>
              ))}
            </ul>
          </RevealOnView>

          <RevealOnView>
            <dl className="divide-y divide-stone-200/80 border-y border-stone-200/80">
              {points.map((p, i) => (
                <div key={p.title} className="reveal-up py-5 sm:py-8">
                  <dt className="flex items-center gap-4 sm:grid sm:grid-cols-[3rem_1fr] sm:gap-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200/60 bg-cream-100 text-brand-650">
                      <Icon name={p.icon} size={20} />
                    </span>
                    <span className="flex items-baseline gap-3 font-display text-xl text-brand-900 sm:text-2xl">
                      <span className="text-sm text-accent-700">{String(i + 1).padStart(2, "0")}</span>
                      {p.title}
                    </span>
                  </dt>
                  <dd className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-brand-700/85 sm:ml-[4.5rem] sm:text-[15px]">{p.desc}</dd>
                </div>
              ))}
            </dl>

            <Testimonials />
          </RevealOnView>
        </div>
      </div>
    </section>
  );
}

/** Testimonios reales. Con la lista vacía no se renderiza nada (ni un contenedor). */
function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;
  return (
    <div className="mt-10 grid gap-6" data-testimonials>
      {TESTIMONIALS.map((t) => (
        <figure key={t.business} className="reveal-up rounded-3xl border border-accent-300/50 bg-accent-50/60 p-7 sm:p-9">
          <blockquote className="font-display text-xl leading-snug text-brand-900 sm:text-2xl">“{t.quote}”</blockquote>
          <figcaption className="mt-5 flex items-center gap-3">
            {t.photo && <Image src={t.photo} alt={`${t.business}, ${t.city}`} width={48} height={48} className="h-12 w-12 rounded-xl object-cover" />}
            <span className="text-sm font-bold text-accent-800">
              {t.person} · {t.business} · {t.city}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
