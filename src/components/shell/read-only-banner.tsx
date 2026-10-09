import { Icon } from "@/components/ui/icon";
import { waProps } from "@/lib/site";
import type { TenantStatus } from "@/lib/supabase/types";

// Local suspendido o cancelado: el panel se ve, pero las acciones del servidor rechazan todo
// cambio (`writableTenant`). El aviso dice qué pasa y cómo salir de ahí. Lo usan el layout del
// panel y la demo (/preview/dashboard).
export function ReadOnlyBanner({
  status,
  name,
  demo = false,
}: {
  status: TenantStatus;
  name: string;
  /** En la demo el enlace de WhatsApp no manda a ventas un texto que no es de nadie. */
  demo?: boolean;
}) {
  const cancelled = status === "cancelled";
  const wa = waProps(
    "contacto",
    cancelled
      ? `Hola, la cuenta de ${name} en DataFud aparece cancelada y quiero reactivarla.`
      : `Hola, ${name} aparece suspendido en DataFud y quiero reactivarlo.`
  );
  return (
    <div role="status" className="mb-6 rounded-xl border border-accent-200 bg-accent-50 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-900">
          <Icon name="pause" size={18} />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-brand-950">
            {cancelled ? "Tu cuenta está cancelada" : "Tu local está suspendido"}
          </p>
          <p className="mt-1 max-w-[65ch] text-sm leading-relaxed text-stone-700">
            Tu carta no se abre en las mesas y no entran pedidos. El panel quedó en solo lectura:
            podés ver tus datos, pero no guardar cambios. No se borró nada.
          </p>
          {demo ? (
            <span
              className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-800 underline decoration-accent-400 decoration-2 underline-offset-4 hov:text-brand-950"
            >
              <Icon name="whatsapp" size={16} />
              {cancelled ? "Escribinos para reactivarla" : "Escribinos para reactivarlo"}
            </span>
          ) : (
            <a
              {...wa}
              className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-800 underline decoration-accent-400 decoration-2 underline-offset-4 hov:text-brand-950"
            >
              <Icon name="whatsapp" size={16} />
              {cancelled ? "Escribinos para reactivarla" : "Escribinos para reactivarlo"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
