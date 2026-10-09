import { getTenantContext } from "@/lib/auth/tenant-context";
import { AppShell, type NavItem } from "@/components/shell/sidebar";
import { ReadOnlyBanner } from "@/components/shell/read-only-banner";

export const dynamic = "force-dynamic";

const nav: NavItem[] = [
  { href: "/dashboard", label: "Resumen", icon: "grid" },
  { href: "/dashboard/menu", label: "Menú", icon: "utensils" },
  { href: "/dashboard/orders", label: "Órdenes", icon: "receipt" },
  { href: "/dashboard/tables", label: "Mesas y QR", icon: "qr" },
  { href: "/dashboard/reports", label: "Reportes", icon: "chart" },
  { href: "/dashboard/settings", label: "Configuración", icon: "settings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant, readOnly } = await getTenantContext();

  return (
    <AppShell brand={tenant.name} subtitle="Panel del restaurante" items={nav}>
      {readOnly && <ReadOnlyBanner status={tenant.status} name={tenant.name} />}
      {children}
    </AppShell>
  );
}
