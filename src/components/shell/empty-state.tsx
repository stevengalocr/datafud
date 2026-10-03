import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";

// Estado vacío de los paneles: dice qué falta y qué hacer, no solo "no hay nada". Alineado a la
// izquierda, como el resto del panel, con la retícula QR de la marca muy tenue de fondo.
export function EmptyState({
  icon,
  title,
  children,
  action,
  className,
}: {
  icon: IconName;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "qr-grid flex flex-col items-start gap-4 rounded-xl border border-dashed border-stone-300 bg-cream-50 px-5 py-8 sm:flex-row sm:items-center sm:px-6",
        className
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-brand-600">
        <Icon name={icon} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-brand-900">{title}</p>
        {children && (
          <div className="mt-1 max-w-[62ch] text-sm leading-relaxed text-stone-600">{children}</div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
