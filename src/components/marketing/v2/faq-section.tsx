"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";
import { RevealOnView } from "@/components/marketing/v2/reveal";
import { FAQ_ITEMS } from "@/lib/faq";
import { waProps } from "@/lib/site";

// Acordeón accesible: cada pregunta es un <button> con aria-expanded y aria-controls; el
// panel es una región con aria-labelledby. Flechas, Home y End mueven el foco entre
// preguntas. Sin animar altura: solo opacidad y transform en el contenido.
export function FaqSection() {
  const baseId = useId();
  const [open, setOpen] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const wa = waProps("preguntas");

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = FAQ_ITEMS.length;
    let next: number | null = null;
    if (e.key === "ArrowDown") next = (i + 1) % n;
    if (e.key === "ArrowUp") next = (i - 1 + n) % n;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = n - 1;
    if (next !== null) {
      e.preventDefault();
      buttons.current[next]?.focus();
    }
  };

  return (
    <section id="preguntas" className="scroll-mt-24 border-b border-stone-200/60 bg-cream-50">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-28">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <RevealOnView className="lg:sticky lg:top-28 lg:self-start">
            <div className="reveal-up">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">Preguntas frecuentes</p>
              <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight text-brand-900">
                Lo que nos preguntan antes de decir que sí
              </h2>
              <p className="mt-5 max-w-md text-base font-medium leading-relaxed text-brand-800/80">
                Respuestas directas, sin letra chica. Si tu duda no está acá, escribinos y te
                la contestamos en persona.
              </p>
              <a
                {...wa}
                className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-5 text-xs font-bold uppercase tracking-[0.16em] text-brand-800 transition-all duration-300 ease-out-expo hover:border-stone-400 hover:bg-cream-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2"
              >
                <Icon name="whatsapp" size={16} />
                Preguntar por WhatsApp
              </a>
            </div>
          </RevealOnView>

          <RevealOnView>
            <div className="reveal-up divide-y divide-stone-200/80 border-y border-stone-200/80">
              {FAQ_ITEMS.map((item, i) => {
                const expanded = open === item.id;
                const btnId = `${baseId}-q-${item.id}`;
                const panelId = `${baseId}-a-${item.id}`;
                return (
                  <div key={item.id}>
                    <h3>
                      <button
                        ref={(el) => {
                          buttons.current[i] = el;
                        }}
                        id={btnId}
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={panelId}
                        onClick={() => setOpen(expanded ? null : item.id)}
                        onKeyDown={(e) => onKeyDown(e, i)}
                        className="group flex w-full items-start justify-between gap-6 py-4 text-left transition-colors duration-200 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 sm:py-6"
                      >
                        <span className="flex items-baseline gap-4">
                          <span className="hidden w-6 font-display text-sm text-accent-700 sm:inline">{String(i + 1).padStart(2, "0")}</span>
                          <span className="font-display text-base leading-snug text-brand-900 sm:text-xl">{item.q}</span>
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-300 ease-out-expo",
                            expanded
                              ? "rotate-45 border-accent-400 bg-brand-600 text-white"
                              : "border-stone-250 bg-white text-brand-700 group-hover:border-stone-400"
                          )}
                          aria-hidden="true"
                        >
                          <Icon name="plus" size={16} />
                        </span>
                      </button>
                    </h3>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={btnId}
                      hidden={!expanded}
                      className="pb-5 pr-2 sm:pl-10"
                    >
                      <p className="faq-answer max-w-2xl text-sm font-medium leading-relaxed text-brand-700/85 sm:text-[15px]">
                        {item.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </RevealOnView>
        </div>
      </div>
    </section>
  );
}
