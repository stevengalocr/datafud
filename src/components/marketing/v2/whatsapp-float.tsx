"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { hasWhatsApp, waProps } from "@/lib/site";

// Botón flotante de WhatsApp, solo en móvil. Con el número pendiente no se muestra
// (los CTA ya llevan a #contacto). El footer lleva padding extra en móvil para que
// nunca tape el texto final.
//
// Aparece recién cuando el hero (o el encabezado de una guía, marcado con
// `data-wa-float-despues`) sale de la pantalla: arriba, el hero ya tiene su propio botón de
// WhatsApp y el flotante tapaba la esquina del render. Sin ese marcador se muestra siempre, y
// sin JavaScript también (regla `noscript` en layout.tsx): nunca queda escondido para siempre.
export function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const marca = document.querySelector("[data-wa-float-despues]");
    if (!marca) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(([e]) => setVisible(!e.isIntersecting), { threshold: 0 });
    obs.observe(marca);
    return () => obs.disconnect();
  }, []);

  if (!hasWhatsApp()) return null;
  return (
    <a
      {...waProps("flotante")}
      data-wa-float
      aria-label="Escribinos por WhatsApp"
      aria-hidden={visible ? undefined : true}
      tabIndex={visible ? undefined : -1}
      className={`fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-accent-300 bg-brand-600 text-white shadow-[0_16px_40px_-12px_rgba(10,26,19,0.55)] transition-[opacity,transform] duration-300 ease-out-expo hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 md:hidden ${
        visible ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <Icon name="whatsapp" size={26} />
    </a>
  );
}
