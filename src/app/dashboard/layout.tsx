import { getTenantContext } from "@/lib/auth/tenant-context";
import { Sidebar, type NavItem } from "@/components/shell/sidebar";

export const dynamic = "force-dynamic";

const nav: NavItem[] = [
  { href: "/dashboard", label: "Resumen", icon: "▦" },
  { href: "/dashboard/menu", label: "Menú", icon: "🍽️" },
  { href: "/dashboard/orders", label: "Órdenes", icon: "🧾" },
  { href: "/dashboard/tables", label: "Mesas / QR", icon: "🔳" },
  { href: "/dashboard/reports", label: "Reportes", icon: "📊" },
  { href: "/dashboard/settings", label: "Configuración", icon: "⚙️" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant } = await getTenantContext();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar brand={tenant.name} subtitle="Panel del restaurante" items={nav} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
