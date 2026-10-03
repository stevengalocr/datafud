"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
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
                  // Se presiona como un botón (0.98, 160 ms). El cambio de color no se anima al
                  // llegar a la página: el activo se pinta al instante, es estado, no adorno.
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium [-webkit-tap-highlight-color:transparent] transition-[transform,background-color,color] duration-[160ms] ease-out-expo active:scale-[0.98]",
                  active
                    ? "bg-brand-600 text-cream-50 shadow-btn-primary"
                    : "text-stone-700 hov:bg-cream-100 hov:text-brand-900 active:bg-cream-100"
                )}
              >
                <Icon
                  name={item.icon}
                  size={18}
                  className={cn("shrink-0", active ? "text-accent-300" : "text-stone-500")}
                />
                <span className="min-w-0 truncate">{item.label}</span>
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
      <LogoutSubmit />
    </form>
  );
}

// Cerrar sesión tarda un viaje al servidor: sin estado, un segundo toque lo mandaba dos veces y
// nada decía que estaba pasando.
function LogoutSubmit() {
  const { pending } = useFormStatus();
  return (
    <>
      <button
        type="submit"
        disabled={pending}
        className="group flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium text-stone-700 [-webkit-tap-highlight-color:transparent] transition-[transform,background-color,color] duration-[160ms] ease-out-expo hov:bg-rose-50 hov:text-rose-800 active:scale-[0.98] disabled:cursor-progress disabled:opacity-70"
      >
        <Icon name="logout" size={18} className="shrink-0 text-stone-500 group-hov:text-rose-700" />
        {pending ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>
    </>
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

  // Panel abierto: Escape lo cierra, Tab no se escapa del panel, el foco entra al panel y la
  // página de atrás no se desplaza.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = panelRef.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled])");
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
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
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 shadow-panel-xs lg:hidden">
        <Brand brand={brand} subtitle={subtitle} />
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="menu-panel"
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-brand-900 [-webkit-tap-highlight-color:transparent] transition-[transform,background-color] duration-[160ms] ease-out-expo hov:bg-cream-100 active:scale-[0.94] active:bg-cream-100"
        >
          <Icon name="menu" size={22} />
        </button>
      </header>

      {/* Panel lateral móvil */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="scrim-in absolute inset-0 bg-brand-950/50" onClick={close} aria-hidden="true" />
          <div
            id="menu-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú del panel"
            className="drawer-in absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-white shadow-panel-lg"
          >
            <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-3.5">
              <Brand brand={brand} subtitle={subtitle} />
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar menú"
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-stone-700 [-webkit-tap-highlight-color:transparent] transition-[transform,background-color] duration-[160ms] ease-out-expo hov:bg-cream-100 active:scale-[0.94] active:bg-cream-100"
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
        {/* `key` por ruta: la entrada corre al cambiar de sección, no cuando una acción refresca
            los datos de la misma página. Solo transform (6 px), ver globals.css.
            `overflow-wrap: anywhere` es la red de seguridad de todo el panel: un nombre, una
            nota o un correo sin espacios parte línea en vez de ensanchar la página (en 375 px
            una nota de 90 letras empujaba 351 px de scroll lateral). Solo parte donde no hay
            otra salida; lo que no debe partirse (estados, fechas) lleva `whitespace-nowrap`. */}
        <div key={pathname} className="panel-enter mx-auto w-full max-w-6xl [overflow-wrap:anywhere]">
          {children}
        </div>
      </main>
    </div>
  );
}
