import { getTenantContext } from "@/lib/auth/tenant-context";
import { AppShell, type NavItem } from "@/components/shell/sidebar";

export const dynamic = "force-dynamic";

const nav: NavItem[] = [
  { href: "/dashboard", label: "Resumen", icon: "grid" },
  { href: "/dashboard/menu", label: "Menú", icon: "utensils" },
  { href: "/dashboard/orders", label: "Órdenes", icon: "receipt" },
  { href: "/dashboard/tables", label: "Mesas / QR", icon: "qr" },
  { href: "/dashboard/reports", label: "Reportes", icon: "chart" },
  { href: "/dashboard/settings", label: "Configuración", icon: "settings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant } = await getTenantContext();

  return (
    <AppShell brand={tenant.name} subtitle="Panel del restaurante" items={nav}>
      {children}
    </AppShell>
  );
}
