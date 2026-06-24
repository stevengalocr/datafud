import Link from "next/link";

const links = [
  { href: "/preview/cliente", label: "Menú cliente" },
  { href: "/preview/dashboard", label: "Panel restaurante" },
  { href: "/preview/admin", label: "Super admin" },
];

export function PreviewBanner({ active }: { active?: string }) {
  return (
    <div className="sticky top-0 z-50 border-b border-brand-800/40 bg-brand-950 text-cream-100">
      <div className="mx-auto flex h-[41px] max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 text-sm">
        <span className="flex items-center gap-2 rounded-full bg-accent-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-950">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-950" />
          Modo demo
        </span>
        <span className="hidden text-xs text-cream-100/60 sm:inline">Verde Limón · datos de ejemplo</span>
        <nav className="ml-auto flex flex-wrap items-center gap-4 text-[11px] font-bold uppercase tracking-widest">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                active === l.href
                  ? "text-accent-300"
                  : "text-cream-100/70 transition-colors hover:text-white"
              }
            >
              {l.label}
            </Link>
          ))}
          <Link href="/" className="text-cream-100/50 transition-colors hover:text-white">
            ← Landing
          </Link>
        </nav>
      </div>
    </div>
  );
}
