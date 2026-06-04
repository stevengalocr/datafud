"use client";

import { useState } from "react";
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
    <nav className="flex-1 space-y-1 p-3">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
              active
                ? "bg-brand-50 text-brand-700"
                : "text-slate-600 hover:bg-cream-100 hover:text-slate-900"
            )}
          >
            <Icon
              name={item.icon}
              size={18}
              className={active ? "text-brand-600" : "text-slate-400"}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand({ brand, subtitle }: { brand: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/icono-main.png"
        alt={brand}
        width={36}
        height={36}
        className="h-9 w-9 rounded-lg"
      />
      <div className="min-w-0">
        <p className="truncate font-bold leading-tight text-slate-900">{brand}</p>
        <p className="truncate text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function LogoutButton() {
  return (
    <form action={logoutAction} className="border-t border-stone-100 p-3">
      <button
        type="submit"
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-700"
      >
        <Icon name="logout" size={18} className="text-slate-400" />
        Cerrar sesión
      </button>
    </form>
  );
}

// Shell responsivo: sidebar fijo en escritorio, barra + drawer en móvil.
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

  return (
    <div className="min-h-screen bg-cream-50 lg:flex">
      {/* Sidebar escritorio */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col border-r border-stone-200 bg-white lg:flex">
        <div className="border-b border-stone-100 px-5 py-4">
          <Brand brand={brand} subtitle={subtitle} />
        </div>
        <NavLinks items={items} pathname={pathname} />
        <LogoutButton />
      </aside>

      {/* Barra superior móvil */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-stone-200 bg-white px-4 lg:hidden">
        <Brand brand={brand} subtitle={subtitle} />
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-cream-100"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </header>

      {/* Drawer móvil */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-72 max-w-[80%] flex-col bg-white shadow-xl animate-[fade-in_0.2s_ease]">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <Brand brand={brand} subtitle={subtitle} />
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-cream-100"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <NavLinks items={items} pathname={pathname} onNavigate={() => setOpen(false)} />
            <LogoutButton />
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
