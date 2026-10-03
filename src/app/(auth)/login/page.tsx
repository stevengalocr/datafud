import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { AuthFrame } from "@/components/shell/auth-frame";
import { hasSupabaseEnv } from "@/lib/env";
import { waProps } from "@/lib/site";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Acceso al panel",
  robots: { index: false, follow: false },
};

// Server Component: decide en el servidor si existe backend. Sin variables de Supabase
// (etapa "landing primero") no hay formulario: aviso de marca + WhatsApp + vuelta a la landing.
export default function LoginPage() {
  if (hasSupabaseEnv()) {
    return (
      <LoginForm
        wa={waProps("contacto", "Hola, necesito ayuda para entrar al panel de DataFud de mi local.")}
      />
    );
  }

  const wa = waProps("contacto");
  return (
    <AuthFrame
      eyebrow="Panel de tu local"
      title="El acceso al panel se activa con tu implementación"
      description="Cuando arrancamos con tu local, te entregamos tu usuario y contraseña y te enseñamos a usar el panel. Si todavía no sos cliente, escribinos y te contamos cómo funciona."
    >
      <a
        {...wa}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-lg border border-accent-400 bg-brand-600 px-6 py-3 text-center text-xs font-bold uppercase leading-snug tracking-[0.18em] text-white shadow-sm transition-[transform,background-color,border-color] duration-[160ms] ease-out-expo hov:bg-brand-700 active:scale-[0.98]"
      >
        <Icon name="whatsapp" size={18} />
        Hablemos por WhatsApp
      </a>
      <Link
        href="/"
        className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white text-xs font-bold uppercase tracking-[0.18em] text-brand-800 transition-[transform,background-color,border-color] duration-[160ms] ease-out-expo hov:border-stone-400 hov:bg-cream-100/70 active:scale-[0.98]"
      >
        Volver a la landing
      </Link>
    </AuthFrame>
  );
}
