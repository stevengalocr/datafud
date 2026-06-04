import Link from "next/link";
import Image from "next/image";

export function LandingNavV2() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/30 bg-cream-50/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/v2" className="group flex items-center transition-transform duration-200 active:scale-[0.98]">
          <Image
            src="/logo-main.png"
            alt="DataFud"
            width={150}
            height={62}
            priority
            className="h-9 w-auto transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>
        
        <nav className="hidden items-center gap-9 text-xs font-semibold uppercase tracking-widest text-brand-700/80 md:flex">
          <a href="#como-funciona" className="transition-colors duration-250 ease-out-expo hover:text-brand-900">
            Cómo funciona
          </a>
          <a href="#vistas" className="transition-colors duration-250 ease-out-expo hover:text-brand-900">
            El sistema
          </a>
          <a href="#planes" className="transition-colors duration-250 ease-out-expo hover:text-brand-900">
            Planes
          </a>
        </nav>
        
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-xs font-semibold uppercase tracking-widest text-brand-700/70 transition-colors duration-250 ease-out-expo hover:text-brand-900"
          >
            Ingresar
          </Link>
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-accent-300 bg-brand-600 px-5 text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-all duration-300 ease-out-expo hover:bg-brand-700 hover:border-accent-400 active:scale-[0.98]"
          >
            Empezar
          </Link>
        </div>
      </div>
    </header>
  );
}
