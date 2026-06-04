import Link from "next/link";
import Image from "next/image";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-main.png"
            alt="DataFud"
            width={150}
            height={62}
            priority
            className="h-9 w-auto"
          />
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          <a href="#como-funciona" className="hover:text-slate-900">Cómo funciona</a>
          <a href="#vistas" className="hover:text-slate-900">El sistema</a>
          <a href="#planes" className="hover:text-slate-900">Planes</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            Ingresar
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-[transform,background-color] duration-200 ease-out hover:bg-brand-700 active:scale-[0.98]"
          >
            Empezar
          </Link>
        </div>
      </div>
    </header>
  );
}
