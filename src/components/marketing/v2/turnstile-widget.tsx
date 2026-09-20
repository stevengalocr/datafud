"use client";

import Script from "next/script";
import { TURNSTILE_SCRIPT_URL } from "@/lib/turnstile";

// Widget de Cloudflare Turnstile en modo declarativo: el script oficial renderiza el desafío
// dentro de .cf-turnstile y agrega el campo oculto cf-turnstile-response al formulario.
// Solo se monta cuando hay NEXT_PUBLIC_TURNSTILE_SITE_KEY.
export function TurnstileWidget({ siteKey }: { siteKey: string }) {
  return (
    <>
      <Script src={TURNSTILE_SCRIPT_URL} strategy="lazyOnload" />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-theme="light"
        data-language="es"
        data-appearance="always"
      />
    </>
  );
}
