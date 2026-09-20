"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";

type NavLink = { href: string; label: string };

// Menú móvil del nav: botón con aria-expanded/aria-controls, panel debajo del header,
// se cierra con Escape, al tocar un enlace o al pasar a escritorio (lg). El CTA de WhatsApp
// ya está en el header, así que el panel solo lista las secciones. Hasta 1023 px el
// nav completo no cabe con cinco secciones, así que tablet también usa el menú.
export function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-lg border border-stone-200/70 bg-white/70 text-brand-800 transition-colors duration-200 hover:bg-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
      >
        <Icon name={open ? "x" : "menu"} size={20} />
      </button>

      <div
        id={id}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-stone-200/60 bg-cream-50 shadow-[0_24px_48px_-24px_rgba(17,42,32,0.35)]"
      >
        <nav aria-label="Secciones" className="mx-auto flex max-w-6xl flex-col px-5 py-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center justify-between border-b border-stone-200/60 text-sm font-bold uppercase tracking-[0.16em] text-brand-800 last:border-b-0 hover:text-brand-900"
            >
              {l.label}
              <Icon name="arrow-right" size={16} className="text-accent-700" />
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
