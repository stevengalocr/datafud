import Image from "next/image";
import { Parallax } from "@/components/marketing/v2/parallax";
import { RevealOnView } from "@/components/marketing/v2/reveal";

// Corte de escena entre Hardware y «Por qué DataFud»: la soda de noche con el stand en la mesa,
// a todo el ancho y con parallax. Render nuevo (2026-10-21), etiquetado; su QR decodifica a
// /q/demo26 (D-051). No va en el cierre a propósito: ahí la única llamada es WhatsApp (D-056).
// La fila de píxeles de arriba se ensambla al entrar, como el QR de la marca.

const PIXELES = Array.from({ length: 28 }, (_, i) => i);

export function ActoNoche() {
  return (
    <section aria-label="Stands 3D y NFC hechos acá" className="relative isolate overflow-hidden bg-brand-950 text-cream-50">
      <Parallax strength={60} className="absolute inset-x-0 -inset-y-16 -z-10">
        <Image
          src="/renders/noche-soda.webp"
          alt="Render ilustrativo de una soda costarricense de noche, con luces cálidas y un stand de mesa DataFud sobre una mesa de madera"
          fill
          sizes="(min-width: 1024px) 140vw, (min-width: 640px) 215vw, 360vw"
          className="object-cover object-[35%_60%]"
        />
      </Parallax>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/90 via-brand-950/55 to-brand-950/10" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-brand-950/80 to-transparent" />

      <RevealOnView className="pixeles absolute inset-x-0 top-0 flex h-3 overflow-hidden" threshold={0.05}>
        {PIXELES.map((i) => (
          <span key={i} className="pixel" style={{ transitionDelay: `${(i % 7) * 45 + Math.floor(i / 7) * 30}ms` }} />
        ))}
      </RevealOnView>

      <div className="mx-auto flex min-h-[78svh] max-w-6xl items-end px-5 pb-16 pt-32 sm:px-6 sm:pb-24 lg:min-h-[86vh] lg:items-center lg:pb-16">
        <RevealOnView className="max-w-xl">
          {/* Sin texto de venta nuevo: la etiqueta y la frase son las de Hardware y Por qué DataFud. */}
          <p className="reveal-up text-xs font-bold uppercase tracking-[0.2em] text-accent-300">Hardware de mesa</p>
          <p className="reveal-up mt-4 font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.02] tracking-tight text-cream-50">
            Stands 3D y NFC <span className="italic text-accent-200">hechos acá.</span>
          </p>
        </RevealOnView>
      </div>
      <span className="absolute bottom-4 right-4 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-800 shadow-sm">
        Render ilustrativo
      </span>
    </section>
  );
}
