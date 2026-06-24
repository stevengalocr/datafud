"use client";

import { useEffect, useRef } from "react";

// Barra fina superior que se llena conforme avanza el scroll de la página.
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.setProperty("--progress", max > 0 ? (scrolled / max).toFixed(4) : "0");
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

  return (
    <div
      ref={ref}
      className="scroll-progress absolute inset-x-0 bottom-0 h-0.5 bg-accent-500"
      aria-hidden="true"
    />
  );
}
