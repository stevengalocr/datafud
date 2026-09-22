"use client";

import { useEffect } from "react";
import { captureUtm, trackEvent } from "@/components/marketing/v2/tracking";

// Eventos de conversión de la landing por delegación de clics:
//  - whatsapp_click {origen}  → cualquier <a data-wa-origin> (lo pone waProps) · Meta: Lead
//  - demo_open {vista}        → <a data-demo-open>                            · Meta: ViewContent
// contact_submit {resultado} se dispara desde el formulario (Meta: Lead si sale bien).
// Todos llevan los utm_* de la visita si llegó por un enlace de campaña.
export function AnalyticsEvents() {
  useEffect(() => {
    captureUtm();
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const el = target?.closest<HTMLElement>("a[data-wa-origin], a[data-demo-open]");
      if (!el) return;
      if (el.dataset.waOrigin) trackEvent("whatsapp_click", { origen: el.dataset.waOrigin });
      if (el.dataset.demoOpen) trackEvent("demo_open", { vista: el.dataset.demoOpen });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
