import Link from "next/link";

const links = [
  { href: "/preview/admin", label: "Panel SaaS (admin)" },
  { href: "/preview/dashboard", label: "Panel restaurante" },
  { href: "/preview/cliente", label: "Menú cliente (QR)" },
];

export function PreviewBanner({ active }: { active?: string }) {
  return (
    <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 text-sm">
        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
          MODO DEMO
        </span>
        <span className="text-amber-800">Datos de ejemplo · sin base de datos</span>
        <nav className="ml-auto flex flex-wrap gap-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                active === l.href
                  ? "font-semibold text-amber-900 underline"
                  : "text-amber-700 hover:text-amber-900"
              }
            >
              {l.label}
            </Link>
          ))}
          <Link href="/" className="text-amber-700 hover:text-amber-900">
            ← Landing
          </Link>
        </nav>
      </div>
    </div>
  );
}
