"use client";

import { useEffect } from "react";

// En la landing, el menú va transparente sobre la portada a pantalla completa y vuelve a su
// fondo crema cuando la portada termina de pasar por debajo. Solo marca `data-solido` en el
// <header>; el aspecto vive en globals.css (.nav-landing). En páginas sin portada no hace nada.
export function NavSobreHero() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-nav]");
    const hero = document.querySelector<HTMLElement>(".he");
    if (!header || !hero) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const solido = hero.getBoundingClientRect().bottom <= header.offsetHeight + 1;
      header.toggleAttribute("data-solido", solido);
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
  }, []);
  return null;
}
