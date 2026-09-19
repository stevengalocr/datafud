import Link from "next/link";
import Image from "next/image";
import { ScrollProgress } from "@/components/marketing/v2/scroll-progress";
import { MobileMenu } from "@/components/marketing/v2/mobile-menu";
import { Icon } from "@/components/ui/icon";
import { waProps } from "@/lib/site";

// Cada ítem apunta a una sección que ya existe en la landing (regla 11). Rutas absolutas
// para que el nav también funcione desde /terminos y /privacidad.
const links = [
  { href: "/#como-funciona", label: "Producto" },
  { href: "/#hardware", label: "Hardware" },
  { href: "/#planes", label: "Planes" },
  { href: "/#demo", label: "Demo" },
  { href: "/#preguntas", label: "Preguntas" },
];

export function LandingNavV2() {
  const wa = waProps("nav");
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/40 bg-cream-50/85 backdrop-blur-md">
      <div className="relative mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link
          href="/"
          aria-label="DataFud — inicio"
          className="group flex items-center transition-transform duration-200 active:scale-[0.98]"
        >
          <Image
            src="/logo-main.png"
            alt="DataFud"
            width={150}
            height={62}
            priority
            className="h-8 w-auto transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>

        <nav aria-label="Secciones" className="hidden items-center gap-8 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-700/80 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="link-underline py-2 transition-colors duration-300 ease-out-expo hover:text-brand-900"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/login"
            className="hidden py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-700/70 transition-colors duration-300 ease-out-expo hover:text-brand-900 lg:inline"
          >
            Ingresar
          </Link>
          <a
            {...wa}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-accent-300 bg-brand-600 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm transition-all duration-300 ease-out-expo hover:border-accent-400 hover:bg-brand-700 active:scale-[0.98] sm:px-5"
          >
            <Icon name="whatsapp" size={16} />
            <span className="hidden sm:inline">Hablemos</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
          <MobileMenu links={links} />
        </div>
      </div>
      <ScrollProgress />
    </header>
  );
}
