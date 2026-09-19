import { Icon, type IconName } from "@/components/ui/icon";
import { RevealOnView } from "@/components/marketing/v2/reveal";
import { SITE, hasWhatsApp, waProps, whatsappDisplay } from "@/lib/site";

// Sección #confianza: cuatro compromisos concretos + firma de GaloDev. Sin testimonios,
// logos ni cifras inventadas: el bloque del primer caso real queda reservado abajo.

type Pillar = { icon: IconName; title: string; desc: string };

const pillars: Pillar[] = [
  {
    icon: "shield",
    title: "Sin contratos atados",
    desc: "Pagás mes a mes. Si un mes no te sirve, lo dejás. Sin cláusulas de permanencia ni penalidades.",
  },
  {
    icon: "whatsapp",
    title: "Soporte por WhatsApp, con una persona",
    desc: "Le escribís a Steven, de GaloDev, no a un bot. Respondemos en horario de oficina de Costa Rica y priorizamos lo que pase en pleno servicio.",
  },
  {
    icon: "card",
    title: "Tus datos son tuyos",
    desc: "Tu menú, tus fotos y tus ventas son de tu local. Si algún día te vas, te los entregamos en un archivo y listo.",
  },
  {
    icon: "pin",
    title: "Hecho en Costa Rica por GaloDev",
    desc: "Diseñado, programado e impreso en 3D acá. Conocemos la soda de barrio y el restaurante de hotel, y hablamos tu mismo idioma.",
  },
];

export function TrustSection() {
  const wa = waProps("confianza");
  return (
    <section id="confianza" className="scroll-mt-24 border-y border-stone-200/60 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-6 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <RevealOnView className="lg:sticky lg:top-28 lg:self-start">
            <div className="reveal-up">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-600">Confianza</p>
              <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight text-brand-900">
                Lo que te prometemos cabe en cuatro líneas
              </h2>
              <p className="mt-5 max-w-md text-base font-medium leading-relaxed text-brand-800/80">
                Somos un equipo chico y eso es una ventaja: sabés quién te atiende, qué pagás
                y qué pasa si un día querés irte.
              </p>
            </div>

            {/* Firma de GaloDev */}
            <div className="reveal-up mt-9 flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-cream-50/70 p-5">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-accent-300 bg-brand-600 font-display text-lg text-accent-100">
                G
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg leading-tight text-brand-900">{SITE.maker}</p>
                <p className="text-xs font-medium text-brand-700/70">Estudio de software e impresión 3D · {SITE.country}</p>
                {hasWhatsApp() && (
                  <a {...wa} className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 underline decoration-accent-400 underline-offset-4 transition-colors hover:text-brand-900">
                    <Icon name="whatsapp" size={13} />
                    {whatsappDisplay()}
                  </a>
                )}
              </div>
            </div>
          </RevealOnView>

          <RevealOnView>
            <dl className="divide-y divide-stone-200/80 border-y border-stone-200/80">
              {pillars.map((p, i) => (
                <div key={p.title} className="reveal-up grid gap-4 py-7 sm:grid-cols-[3rem_1fr] sm:gap-6 sm:py-8">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200/60 bg-cream-100 text-brand-650">
                    <Icon name={p.icon} size={20} />
                  </span>
                  <div>
                    <dt className="flex items-baseline gap-3 font-display text-xl text-brand-900 sm:text-2xl">
                      <span className="text-sm text-accent-500">{String(i + 1).padStart(2, "0")}</span>
                      {p.title}
                    </dt>
                    <dd className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-brand-700/80 sm:text-[15px]">{p.desc}</dd>
                  </div>
                </div>
              ))}
            </dl>

            {/*
              Bloque reservado para el primer caso real (ver PENDIENTES-STEVEN en
              docs/plans/landing-loop-state.md). Se activa solo con permiso del local:
              nombre, ciudad, tipo de negocio, una cita textual y, si la hay, una foto del
              stand en su mesa. Nunca un testimonio inventado.

              <figure className="mt-10 rounded-3xl border border-accent-300/50 bg-accent-50/60 p-7 sm:p-9">
                <blockquote className="font-display text-xl leading-snug text-brand-900 sm:text-2xl">
                  “…”
                </blockquote>
                <figcaption className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-accent-700">
                  Nombre · Local · Ciudad
                </figcaption>
              </figure>
            */}
          </RevealOnView>
        </div>
      </div>
    </section>
  );
}
