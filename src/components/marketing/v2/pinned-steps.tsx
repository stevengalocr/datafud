"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "@/components/ui/icon";

export type Step = {
  number: string;
  title: string;
  desc: string;
  image: string;
  alt: string;
  icon: IconName;
};

// Sección "cómo funciona": en desktop se fija (sticky) y los pasos avanzan con el
// scroll mientras la imagen hace cross-fade. En móvil cae a una columna simple.
export function PinnedSteps({ steps }: { steps: Step[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [rail, setRail] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const progress = total > 0 ? scrolled / total : 0;
      setRail(progress);
      setActive(Math.min(steps.length - 1, Math.floor(progress * steps.length + 0.0001)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [steps.length]);

  return (
    <section id="como-funciona" className="scroll-mt-24">
      {/* Encabezado */}
      <div className="mx-auto max-w-6xl px-5 pt-24 sm:px-6 sm:pt-32">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-600">
          Paso a paso
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight text-brand-900">
          De cero a operar en tu local, en cuatro movimientos
        </h2>
      </div>

      {/* Desktop: experiencia pinneada */}
      <div
        ref={wrapRef}
        className="relative mt-16 hidden lg:block"
        style={{ height: `${steps.length * 80}vh` }}
      >
        <div className="sticky top-0 flex h-screen items-center">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_1.05fr] items-center gap-16 px-6">
            {/* Lista de pasos + riel */}
            <div className="relative pl-8">
              <div className="absolute left-0 top-1 h-[calc(100%-0.5rem)] w-px bg-stone-250/70" />
              <div className="absolute left-0 top-1 h-[calc(100%-0.5rem)] w-px overflow-hidden">
                <div
                  className="pin-rail-fill h-full w-full bg-accent-500"
                  style={{ ["--rail" as string]: rail }}
                />
              </div>
              <ul className="space-y-9">
                {steps.map((s, i) => {
                  const on = i === active;
                  return (
                    <li
                      key={s.number}
                      className={cn(
                        "transition-all duration-500 ease-out-expo",
                        on ? "opacity-100" : "opacity-35"
                      )}
                    >
                      <div className="flex items-baseline gap-4">
                        <span className="font-display text-2xl leading-none text-accent-500">
                          {s.number}
                        </span>
                        <div>
                          <h3 className="font-display text-2xl text-brand-900">{s.title}</h3>
                          <p
                            className={cn(
                              "mt-2 max-w-md text-sm font-medium leading-relaxed text-brand-700/80 transition-all duration-500 ease-out-expo",
                              on ? "max-h-32 opacity-100" : "max-h-0 overflow-hidden opacity-0"
                            )}
                          >
                            {s.desc}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Stack de imágenes con cross-fade */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-stone-200/70 bg-cream-100 shadow-[0_30px_80px_-20px_rgba(17,42,32,0.35)]">
              {steps.map((s, i) => (
                <div
                  key={s.number}
                  className="img-grade absolute inset-0"
                  data-active={i === active}
                >
                  <div className="pin-frame absolute inset-0" data-active={i === active}>
                    <Image
                      src={s.image}
                      alt={s.alt}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
              {/* Insignia del paso activo */}
              <div className="absolute bottom-5 left-5 z-10 flex items-center gap-3 rounded-full border border-white/20 bg-brand-950/55 px-4 py-2 backdrop-blur-sm">
                <Icon name={steps[active].icon} size={16} className="text-accent-300" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-cream-100">
                  {steps[active].title}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Móvil / tablet: columna simple */}
      <div className="mx-auto mt-12 grid max-w-2xl gap-10 px-5 sm:px-6 lg:hidden">
        {steps.map((s) => (
          <div key={s.number} className="flex flex-col">
            <div className="img-grade relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200/70 bg-cream-100">
              <Image
                src={s.image}
                alt={s.alt}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-xl text-accent-500">{s.number}</span>
              <h3 className="font-display text-xl text-brand-900">{s.title}</h3>
            </div>
            <p className="mt-2 text-sm font-medium leading-relaxed text-brand-700/80">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
