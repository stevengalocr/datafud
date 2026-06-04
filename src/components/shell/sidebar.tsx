"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { logoutAction } from "@/app/(auth)/actions";

export type NavItem = { href: string; label: string; icon: string };

export function Sidebar({
  brand,
  subtitle,
  items,
}: {
  brand: string;
  subtitle: string;
  items: NavItem[];
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
        <Image
          src="/icono-main.png"
          alt={brand}
          width={36}
          height={36}
          className="h-9 w-9 rounded-lg"
        />
        <div>
          <p className="font-bold leading-tight text-slate-900">{brand}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" &&
              item.href !== "/dashboard" &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700"
          >
            <span className="text-base">⎋</span>
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
