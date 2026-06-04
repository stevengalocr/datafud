"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

// Revela su contenido al entrar en viewport. Los hijos con la clase
// "reveal-up" se animan (y escalonan vía nth-child) cuando aparece .in-view.
export function RevealOnView({
  children,
  className,
  threshold = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={cn(inView && "in-view", className)}>
      {children}
    </div>
  );
}
