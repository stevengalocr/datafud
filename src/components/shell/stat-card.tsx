import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";

// Cifra de resumen. El número va en la sans de la UI con cifras tabulares: en Young Serif el "0"
// se leía como una "O" y, con todo en cero, el panel parecía decir "O restaurantes".
// No es un enlace, así que no reacciona al pasar el mouse.
export function StatCard({
  label,
  value,
  icon,
  hint,
  accent = "brand",
}: {
  label: string;
  value: string | number;
  icon?: IconName;
  hint?: string;
  accent?: "brand" | "accent" | "slate";
}) {
  const tone = {
    brand: "text-brand-600",
    accent: "text-accent-700",
    slate: "text-stone-500",
  }[accent];

  return (
    <div className="rounded-xl border border-stone-200 bg-white px-5 py-4">
      <p className="flex items-center gap-2 text-sm font-medium text-stone-600">
        {icon && <Icon name={icon} size={16} className={cn("shrink-0", tone)} />}
        {label}
      </p>
      <p className="mt-2 text-[1.75rem] font-semibold leading-none tracking-tight text-brand-950 tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-2 text-xs text-stone-600">{hint}</p>}
    </div>
  );
}
