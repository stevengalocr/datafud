import { requireRole } from "@/lib/auth/session";
import { Sidebar, type NavItem } from "@/components/shell/sidebar";

export const dynamic = "force-dynamic";

const nav: NavItem[] = [
  { href: "/admin", label: "Resumen", icon: "▦" },
  { href: "/admin/tenants", label: "Restaurantes", icon: "🏬" },
  { href: "/admin/payments", label: "Pagos", icon: "💳" },
  { href: "/admin/plans", label: "Planes", icon: "✦" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("super_admin");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar brand="DataFud" subtitle="Administración SaaS" items={nav} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
