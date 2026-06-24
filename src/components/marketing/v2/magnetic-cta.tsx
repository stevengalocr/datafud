"use client";

import Link from "next/link";
import { useRef } from "react";
import { cn } from "@/lib/utils/cn";

// Botón que atrae sutilmente hacia el cursor (efecto magnético). En dispositivos
// táctiles / reduced-motion simplemente no se mueve. Es un <Link> accesible.
export function MagneticCta({
  href,
  children,
  className,
  strength = 0.3,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const mx = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const my = (e.clientY - (rect.top + rect.height / 2)) * strength;
    el.style.setProperty("--mx", `${mx.toFixed(1)}px`);
    el.style.setProperty("--my", `${my.toFixed(1)}px`);
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", "0px");
    el.style.setProperty("--my", "0px");
  };

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={cn("magnetic", className)}
    >
      {children}
    </Link>
  );
}
