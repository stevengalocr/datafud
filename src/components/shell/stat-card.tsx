import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";

export function StatCard({
  label,
  value,
  icon,
  accent = "brand",
}: {
  label: string;
  value: string | number;
  icon: IconName;
  accent?: "brand" | "accent" | "slate";
}) {
  const tone = {
    brand: "bg-brand-50 text-brand-600",
    accent: "bg-accent-50 text-accent-600",
    slate: "bg-stone-100 text-stone-600",
  }[accent];

  return (
    <div className="rounded-2xl border border-stone-200/70 bg-white p-5 transition-shadow duration-200 hover:shadow-[0_8px_30px_rgba(34,80,58,0.06)]">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tone)}>
          <Icon name={icon} size={18} />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl text-slate-900">{value}</p>
    </div>
  );
}
