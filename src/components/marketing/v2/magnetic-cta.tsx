"use client";

import Link from "next/link";
import { useRef } from "react";
import { cn } from "@/lib/utils/cn";

type Props = React.ComponentPropsWithoutRef<"a"> & {
  href: string;
  children: React.ReactNode;
  strength?: number;
};

// Botón que atrae sutilmente hacia el cursor (efecto magnético). En dispositivos
// táctiles / reduced-motion simplemente no se mueve. Enlaces externos (WhatsApp)
// se renderizan como <a>; los internos como <Link>.
export function MagneticCta({ href, children, className, strength = 0.3, ...rest }: Props) {
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

  const external = /^(https?:|mailto:|tel:)/.test(href);
  const classes = cn("magnetic", className);

  if (external) {
    return (
      <a ref={ref} href={href} onMouseMove={onMove} onMouseLeave={reset} className={classes} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link ref={ref} href={href} onMouseMove={onMove} onMouseLeave={reset} className={classes} {...rest}>
      {children}
    </Link>
  );
}
