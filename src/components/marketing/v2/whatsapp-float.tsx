import { Icon } from "@/components/ui/icon";
import { hasWhatsApp, waProps } from "@/lib/site";

// Botón flotante de WhatsApp, solo en móvil. Con el número pendiente no se muestra
// (los CTA ya llevan a #contacto). El footer lleva padding extra en móvil para que
// nunca tape el texto final.
export function WhatsAppFloat() {
  if (!hasWhatsApp()) return null;
  return (
    <a
      {...waProps("flotante")}
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-accent-300 bg-brand-600 text-white shadow-[0_16px_40px_-12px_rgba(10,26,19,0.55)] transition-transform duration-300 ease-out-expo hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 md:hidden"
    >
      <Icon name="whatsapp" size={26} />
    </a>
  );
}
