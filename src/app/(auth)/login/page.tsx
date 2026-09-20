import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { hasSupabaseEnv } from "@/lib/env";
import { waProps } from "@/lib/site";
import { LoginForm } from "./login-form";

// Server Component: decide en el servidor si existe backend. Sin variables de Supabase
// (etapa "landing primero") no hay formulario: aviso de marca + WhatsApp + vuelta a la landing.
export default function LoginPage() {
  if (hasSupabaseEnv()) return <LoginForm />;

  const wa = waProps("contacto");
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 px-5 py-10 font-sans text-brand-900 antialiased">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center" aria-label="DataFud — inicio">
          <Image src="/logo-main.png" alt="DataFud" width={170} height={70} priority className="h-11 w-auto" />
        </Link>

        <div className="rounded-2xl border border-stone-200/80 bg-white p-8 shadow-[0_24px_60px_-28px_rgba(34,80,58,0.28)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-700">Panel de tu local</p>
          <h1 className="mt-2 font-display text-3xl leading-tight text-brand-900">
            El acceso al panel se activa con tu implementación
          </h1>
          <p className="mt-4 text-sm font-medium leading-relaxed text-brand-700/80">
            Cuando arrancamos con tu local, te entregamos tu usuario y contraseña y te enseñamos a
            usar el panel. Si todavía no sos cliente, escribinos y te contamos cómo funciona.
          </p>
          <a
            {...wa}
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-lg border border-accent-400 bg-brand-600 px-6 py-3 text-center text-xs font-bold uppercase leading-snug tracking-[0.18em] text-white shadow-sm transition-colors duration-300 ease-out-expo hover:bg-brand-700"
          >
            <Icon name="whatsapp" size={18} />
            Hablemos por WhatsApp
          </a>
          <Link
            href="/"
            className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white text-xs font-bold uppercase tracking-[0.18em] text-brand-800 transition-all duration-300 ease-out-expo hover:border-stone-400 hover:bg-cream-100/70"
          >
            Volver a la landing
          </Link>
        </div>
      </div>
    </div>
  );
}
