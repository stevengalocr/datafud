import Link from "next/link";
import { Icon } from "@/components/ui/icon";

// Aviso del panel cuando el plan del local no incluye pedidos desde la mesa (plan Carta). Sale
// en Órdenes y en Mesas y QR, donde la persona esperaría ver o habilitar los pedidos.
export function NoTableOrderingNotice({
  where,
  planHref = "/dashboard/settings",
}: {
  where: "orders" | "tables";
  /** Destino de «Ver tu plan»; la demo lo apunta a su propia sección. */
  planHref?: string;
}) {
  return (
    <div role="note" className="mb-6 flex items-start gap-3 rounded-xl border border-accent-200 bg-accent-50 p-4 text-sm text-brand-900">
      <Icon name="utensils" size={18} className="mt-0.5 shrink-0 text-accent-800" />
      <p className="min-w-0 leading-relaxed">
        {where === "orders"
          ? "Tu plan no incluye pedidos desde la mesa: la carta de cada mesa se ve en el teléfono, pero sin el botón de pedir, y acá no entra ninguna orden. Los comensales piden como siempre, con quien los atiende. Para recibir pedidos acá, hace falta un plan que los incluya."
          : "Tu plan no incluye pedidos desde la mesa: el QR de cada mesa abre la carta para verla, sin el botón de pedir."}{" "}
        <Link
          href={planHref}
          className="font-semibold text-brand-700 underline decoration-accent-400 decoration-2 underline-offset-4 hov:text-brand-900"
        >
          Ver tu plan
        </Link>
      </p>
    </div>
  );
}
