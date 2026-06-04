// Tipos de la base de datos Datfud. Reflejan supabase/schema.sql.
// En producción se pueden regenerar con: supabase gen types typescript

export type UserRole = "super_admin" | "restaurant_admin";
export type TenantStatus = "trial" | "active" | "suspended" | "cancelled";
export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "delivered"
  | "paid"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "overdue";

export type Lang = "es" | "en" | "pt";
export type I18nText = Partial<Record<Lang, string>>;

export interface PlanFeatures {
  max_languages: number;
  max_products: number | null;
  max_categories: number | null;
  max_tables: number | null;
  advanced_reports: boolean;
  full_branding: boolean;
}

export interface Plan {
  id: string;
  code: "basico" | "estandar" | "empresarial";
  name: string;
  price_usd: number;
  features: PlanFeatures;
  is_active: boolean;
  sort_order: number;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  plan_id: string | null;
  trial_ends_at: string | null;
  owner_email: string | null;
  owner_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  tenant_id: string | null;
  role: UserRole;
  full_name: string | null;
  created_at: string;
}

export interface SubscriptionPayment {
  id: string;
  tenant_id: string;
  plan_id: string | null;
  amount_usd: number;
  period_start: string;
  period_end: string;
  paid_at: string | null;
  status: PaymentStatus;
  approved_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  tenant_id: string;
  name_i18n: I18nText;
  description_i18n: I18nText;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  category_id: string | null;
  name_i18n: I18nText;
  description_i18n: I18nText;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RestaurantTable {
  id: string;
  tenant_id: string;
  label: string;
  qr_token: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  tenant_id: string;
  table_id: string | null;
  status: OrderStatus;
  currency_code: string | null;
  subtotal: number;
  total: number;
  customer_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  tenant_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
  note: string | null;
}

export interface TenantSettings {
  tenant_id: string;
  currency_code: string;
  default_language: Lang;
  enabled_languages: Lang[];
  theme: Record<string, string>;
  logo_url: string | null;
  restaurant_name: string | null;
  address: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimal_digits: number;
}
