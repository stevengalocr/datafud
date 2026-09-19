"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

// Eventos de conversión de la landing por delegación de clics:
//  - whatsapp_click {origen}  → cualquier <a data-wa-origin> (lo pone waProps)
//  - demo_open {vista}        → <a data-demo-open> (sección #demo)
// contact_submit {resultado} se dispara desde el formulario. Sin Vercel, track() no envía nada.
export function AnalyticsEvents() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const el = target?.closest<HTMLElement>("a[data-wa-origin], a[data-demo-open]");
      if (!el) return;
      if (el.dataset.waOrigin) track("whatsapp_click", { origen: el.dataset.waOrigin });
      if (el.dataset.demoOpen) track("demo_open", { vista: el.dataset.demoOpen });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
