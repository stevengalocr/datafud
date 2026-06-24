import { requireRole } from "@/lib/auth/session";
import { AppShell, type NavItem } from "@/components/shell/sidebar";

export const dynamic = "force-dynamic";

const nav: NavItem[] = [
  { href: "/admin", label: "Resumen", icon: "grid" },
  { href: "/admin/tenants", label: "Restaurantes", icon: "store" },
  { href: "/admin/payments", label: "Pagos", icon: "card" },
  { href: "/admin/charges", label: "Cargos", icon: "receipt" },
  { href: "/admin/plans", label: "Planes", icon: "sparkles" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("super_admin");

  return (
    <AppShell brand="DataFud" subtitle="Administración SaaS" items={nav}>
      {children}
    </AppShell>
  );
}
