"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { logoutAction } from "@/app/(auth)/actions";
import { Icon, type IconName } from "@/components/ui/icon";

export type NavItem = { href: string; label: string; icon: IconName };

function isActive(pathname: string, href: string) {
  return (
    pathname === href ||
    (href !== "/admin" && href !== "/dashboard" && pathname.startsWith(href))
  );
}

function NavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Secciones del panel" className="flex-1 overflow-y-auto p-3">
      <ul className="space-y-1">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150",
                  active
                    ? "bg-brand-600 text-cream-50"
                    : "text-stone-700 hover:bg-cream-100 hover:text-brand-900"
                )}
              >
                <Icon
                  name={item.icon}
                  size={18}
                  className={cn("shrink-0", active ? "text-accent-300" : "text-stone-500")}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Brand({ brand, subtitle }: { brand: string; subtitle: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Image
        src="/icono-main.png"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-lg"
      />
      <div className="min-w-0">
        <p className="truncate font-display text-[1.0625rem] leading-tight text-brand-900">{brand}</p>
        <p className="truncate text-xs text-stone-600">{subtitle}</p>
      </div>
    </div>
  );
}

function LogoutButton() {
  return (
    <form action={logoutAction} className="border-t border-stone-200 p-3">
      <button
        type="submit"
        className="group flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium text-stone-700 transition-colors duration-150 hover:bg-rose-50 hover:text-rose-800"
      >
        <Icon name="logout" size={18} className="shrink-0 text-stone-500 group-hover:text-rose-700" />
        Cerrar sesión
      </button>
    </form>
  );
}

// Shell responsivo: sidebar fijo en escritorio, barra + panel lateral en el teléfono.
export function AppShell({
  brand,
  subtitle,
  items,
  children,
}: {
  brand: string;
  subtitle: string;
  items: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Panel abierto: Escape lo cierra, el foco entra al panel y la página de atrás no se desplaza.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  return (
    <div className="min-h-screen bg-cream-50 text-stone-900 lg:flex">
      <a
        href="#contenido"
        className="sr-only z-[60] rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-cream-50 focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Saltar al contenido
      </a>

      {/* Sidebar escritorio */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col border-r border-stone-200 bg-white lg:flex">
        <div className="border-b border-stone-200 px-5 py-4">
          <Brand brand={brand} subtitle={subtitle} />
        </div>
        <NavLinks items={items} pathname={pathname} />
        <LogoutButton />
      </aside>

      {/* Barra superior móvil */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 lg:hidden">
        <Brand brand={brand} subtitle={subtitle} />
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="menu-panel"
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-brand-900 hover:bg-cream-100"
        >
          <Icon name="menu" size={22} />
        </button>
      </header>

      {/* Panel lateral móvil */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brand-950/50" onClick={close} aria-hidden="true" />
          <div
            id="menu-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú del panel"
            className="drawer-in absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-white shadow-[8px_0_32px_-12px_rgba(10,26,19,0.35)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-3.5">
              <Brand brand={brand} subtitle={subtitle} />
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar menú"
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-stone-700 hover:bg-cream-100"
              >
                <Icon name="x" size={20} />
              </button>
            </div>
            <NavLinks items={items} pathname={pathname} onNavigate={() => setOpen(false)} />
            <LogoutButton />
          </div>
        </div>
      )}

      <main id="contenido" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 focus:outline-none sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
