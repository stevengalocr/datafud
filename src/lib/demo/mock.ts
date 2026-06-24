// Datos de ejemplo para el MODO DEMO (sin Supabase).
// Restaurante ficticio showcase: "Verde Limón" — soda tica moderna en San José.
// Solo se usan en las rutas /preview para mostrar la app como un cliente real.
import type {
  Category,
  Order,
  OrderItem,
  Plan,
  Product,
  SubscriptionPayment,
  Tenant,
  TenantSettings,
} from "@/lib/supabase/types";
import type { MenuPayload } from "@/app/m/[tenant]/[table]/menu-client";

const now = new Date();
const iso = (daysAgo = 0) =>
  new Date(now.getTime() - daysAgo * 86400000).toISOString();
const minsAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString();
// Foto de stock (Unsplash, licencia libre) lista para usar como imagen de platillo.
const img = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export const RESTAURANT = {
  name: "Verde Limón",
  tagline: "Soda tica · cocina fresca de barrio",
  slug: "verde-limon",
  address: "Barrio Escalante, San José, Costa Rica",
  phone: "+506 2253 7788",
  cover: img("photo-1559339352-11d035aa65de", 1600),
};

export const mockPlans: Plan[] = [
  {
    id: "plan-basico",
    code: "basico",
    name: "Básico",
    price_usd: 29,
    is_active: true,
    sort_order: 1,
    features: { max_languages: 1, max_products: 20, max_categories: 5, max_tables: 8, advanced_reports: false, full_branding: false },
  },
  {
    id: "plan-estandar",
    code: "estandar",
    name: "Estándar",
    price_usd: 49,
    is_active: true,
    sort_order: 2,
    features: { max_languages: 2, max_products: 70, max_categories: 20, max_tables: 30, advanced_reports: true, full_branding: true },
  },
  {
    id: "plan-empresarial",
    code: "empresarial",
    name: "Empresarial",
    price_usd: 99,
    is_active: true,
    sort_order: 3,
    features: { max_languages: 3, max_products: null, max_categories: null, max_tables: null, advanced_reports: true, full_branding: true },
  },
];

export const mockTenants: Tenant[] = [
  {
    id: "t-demo",
    name: "Verde Limón",
    slug: "verde-limon",
    status: "active",
    plan_id: "plan-estandar",
    trial_ends_at: null,
    owner_email: "hola@verdelimon.cr",
    owner_name: "Daniela Castro",
    phone: "+506 2253 7788",
    created_at: iso(120),
    updated_at: iso(0),
  },
  {
    id: "t-2",
    name: "Restaurante La Cosecha",
    slug: "la-cosecha",
    status: "active",
    plan_id: "plan-empresarial",
    trial_ends_at: null,
    owner_email: "info@lacosecha.cr",
    owner_name: "María Jiménez",
    phone: "+506 2222 1111",
    created_at: iso(95),
    updated_at: iso(2),
  },
  {
    id: "t-3",
    name: "Café del Parque",
    slug: "cafe-parque",
    status: "trial",
    plan_id: "plan-basico",
    trial_ends_at: iso(-18),
    owner_email: "hola@cafeparque.com",
    owner_name: "Luis Mora",
    phone: null,
    created_at: iso(12),
    updated_at: iso(1),
  },
  {
    id: "t-4",
    name: "Pizzería Napoli",
    slug: "napoli",
    status: "suspended",
    plan_id: "plan-estandar",
    trial_ends_at: null,
    owner_email: "napoli@gmail.com",
    owner_name: "Marco Rossi",
    phone: null,
    created_at: iso(80),
    updated_at: iso(6),
  },
  {
    id: "t-5",
    name: "Marisquería El Puerto",
    slug: "el-puerto",
    status: "active",
    plan_id: "plan-estandar",
    trial_ends_at: null,
    owner_email: "ventas@elpuerto.cr",
    owner_name: "Sofía Vargas",
    phone: "+506 2630 4040",
    created_at: iso(45),
    updated_at: iso(3),
  },
];

export const mockPayments: SubscriptionPayment[] = [
  { id: "pay-1", tenant_id: "t-demo", plan_id: "plan-estandar", amount_usd: 49, period_start: iso(30).slice(0, 10), period_end: iso(0).slice(0, 10), paid_at: iso(30), status: "paid", approved_by: null, notes: null, created_at: iso(30) },
  { id: "pay-0", tenant_id: "t-demo", plan_id: "plan-estandar", amount_usd: 49, period_start: iso(60).slice(0, 10), period_end: iso(30).slice(0, 10), paid_at: iso(60), status: "paid", approved_by: null, notes: null, created_at: iso(60) },
  { id: "pay-2", tenant_id: "t-2", plan_id: "plan-empresarial", amount_usd: 99, period_start: iso(25).slice(0, 10), period_end: iso(-5).slice(0, 10), paid_at: iso(25), status: "paid", approved_by: null, notes: null, created_at: iso(25) },
  { id: "pay-5", tenant_id: "t-5", plan_id: "plan-estandar", amount_usd: 49, period_start: iso(20).slice(0, 10), period_end: iso(10).slice(0, 10), paid_at: iso(20), status: "paid", approved_by: null, notes: null, created_at: iso(20) },
  { id: "pay-3", tenant_id: "t-4", plan_id: "plan-estandar", amount_usd: 49, period_start: iso(40).slice(0, 10), period_end: iso(10).slice(0, 10), paid_at: null, status: "overdue", approved_by: null, notes: "Pago vencido", created_at: iso(40) },
];

export const mockSettings: TenantSettings = {
  tenant_id: "t-demo",
  currency_code: "CRC",
  default_language: "es",
  enabled_languages: ["es", "en"],
  theme: { primary: "#22503a", accent: "#b8923f" },
  logo_url: null,
  restaurant_name: RESTAURANT.name,
  address: RESTAURANT.address,
  phone: RESTAURANT.phone,
  created_at: iso(120),
  updated_at: iso(0),
};

export const mockCategories: Category[] = [
  { id: "c-desayunos", tenant_id: "t-demo", name_i18n: { es: "Desayunos", en: "Breakfast", pt: "Café da manhã" }, description_i18n: { es: "Para arrancar el día con energía tica" }, image_url: null, sort_order: 1, is_active: true, created_at: iso(120), updated_at: iso(120) },
  { id: "c-fuertes", tenant_id: "t-demo", name_i18n: { es: "Casados & Fuertes", en: "Mains", pt: "Pratos" }, description_i18n: { es: "Lo mejor de la cocina de barrio" }, image_url: null, sort_order: 2, is_active: true, created_at: iso(120), updated_at: iso(120) },
  { id: "c-bocas", tenant_id: "t-demo", name_i18n: { es: "Bocas", en: "Snacks", pt: "Petiscos" }, description_i18n: { es: "Para compartir en la mesa" }, image_url: null, sort_order: 3, is_active: true, created_at: iso(120), updated_at: iso(120) },
  { id: "c-bebidas", tenant_id: "t-demo", name_i18n: { es: "Frescos & Café", en: "Drinks & Coffee", pt: "Bebidas" }, description_i18n: { es: "Naturales, recién hechos" }, image_url: null, sort_order: 4, is_active: true, created_at: iso(120), updated_at: iso(120) },
  { id: "c-postres", tenant_id: "t-demo", name_i18n: { es: "Postres", en: "Desserts", pt: "Sobremesas" }, description_i18n: { es: "El cierre dulce de la casa" }, image_url: null, sort_order: 5, is_active: true, created_at: iso(120), updated_at: iso(120) },
];

const P = (
  id: string,
  category_id: string,
  es: string,
  en: string,
  descEs: string,
  price: number,
  imgId: string | null,
  sort: number,
  available = true
): Product => ({
  id,
  tenant_id: "t-demo",
  category_id,
  name_i18n: { es, en },
  description_i18n: { es: descEs },
  price,
  image_url: imgId ? img(imgId) : null,
  is_available: available,
  is_active: true,
  sort_order: sort,
  created_at: iso(120),
  updated_at: iso(3),
});

export const mockProducts: Product[] = [
  // Desayunos
  P("p-gallo", "c-desayunos", "Gallo Pinto con huevo", "Gallo Pinto & egg", "Arroz con frijoles típico, huevo al gusto, natilla y tortilla.", 2800, "photo-1604908176997-125f25cc6f3d", 1),
  P("p-panqueques", "c-desayunos", "Panqueques con miel", "Honey pancakes", "Torre de panqueques esponjosos con miel de caña y banano.", 3200, "photo-1567620905732-2d1ec7ab7445", 2),
  P("p-frutas", "c-desayunos", "Plato de Frutas", "Fruit plate", "Frutas frescas de temporada con granola y miel.", 2500, "photo-1490474418585-ba9bad8fd0ea", 3),
  // Casados & Fuertes
  P("p-casado", "c-fuertes", "Casado Completo", "Full Casado", "Arroz, frijoles, carne en salsa, plátano maduro, ensalada y picadillo.", 4200, "photo-1543339308-43e59d6b73a6", 1),
  P("p-lomito", "c-fuertes", "Lomito en salsa", "Tenderloin in sauce", "Lomito a la parrilla en salsa de la casa con vegetales y puré.", 6500, "photo-1432139509613-5c4255815697", 2),
  P("p-bowl", "c-fuertes", "Bowl Tropical", "Tropical bowl", "Bowl fresco de vegetales, palmito, maíz dulce y aderezo de la casa.", 3900, "photo-1546069901-ba9599a7e63c", 3),
  // Bocas
  P("p-hamburguesa", "c-bocas", "Hamburguesa Casera", "House burger", "Carne smash, queso, vegetales frescos y papas crocantes.", 4500, "photo-1551782450-a2132b4ba21d", 1),
  P("p-pizza", "c-bocas", "Pizza Artesanal", "Artisan pizza", "Masa madre, salsa de tomate fresco, mozzarella y cilantro.", 5200, "photo-1565299624946-b28f40a0ae38", 2),
  // Frescos & Café
  P("p-fresco", "c-bebidas", "Fresco Natural de Naranja", "Fresh orange juice", "Jugo de naranja recién exprimido, sin azúcar añadida.", 1400, "photo-1600271886742-f049cd451bba", 1),
  P("p-limonada", "c-bebidas", "Limonada de la casa", "House lemonade", "Limonada con hierbabuena, la favorita de Verde Limón.", 1300, "photo-1544145945-f90425340c7e", 2),
  P("p-cafehelado", "c-bebidas", "Café Helado", "Iced coffee", "Café costarricense frío con hielo y un toque de leche.", 1800, "photo-1461023058943-07fcbe16d735", 3),
  P("p-cafe", "c-bebidas", "Café Chorreado", "Brewed coffee", "Café de altura colado a la tica, recién hecho.", 1000, null, 4),
  // Postres
  P("p-brownie", "c-postres", "Brownie con helado", "Brownie à la mode", "Brownie tibio con helado de vainilla y salsa de caramelo.", 2900, "photo-1551024506-0bccd828d307", 1),
  P("p-queque", "c-postres", "Queque de frutos rojos", "Berry cake", "Bizcocho suave con crema y frutos rojos frescos.", 2600, "photo-1565958011703-44f9829ba187", 2),
];

// Comandas en vivo — variedad de estados para el tablero de cocina.
export const mockOrders: Order[] = [
  { id: "o-1", tenant_id: "t-demo", table_id: "tab-3", status: "pending", currency_code: "CRC", subtotal: 8400, total: 8400, customer_note: "Sin cebolla en el casado, por favor", created_at: minsAgo(3), updated_at: minsAgo(3) },
  { id: "o-2", tenant_id: "t-demo", table_id: "tab-1", status: "pending", currency_code: "CRC", subtotal: 4500, total: 4500, customer_note: null, created_at: minsAgo(7), updated_at: minsAgo(7) },
  { id: "o-3", tenant_id: "t-demo", table_id: "tab-5", status: "preparing", currency_code: "CRC", subtotal: 11700, total: 11700, customer_note: "Mesa con niños", created_at: minsAgo(14), updated_at: minsAgo(10) },
  { id: "o-4", tenant_id: "t-demo", table_id: "tab-2", status: "preparing", currency_code: "CRC", subtotal: 3200, total: 3200, customer_note: null, created_at: minsAgo(18), updated_at: minsAgo(12) },
  { id: "o-5", tenant_id: "t-demo", table_id: "tab-4", status: "ready", currency_code: "CRC", subtotal: 6500, total: 6500, customer_note: null, created_at: minsAgo(26), updated_at: minsAgo(4) },
  { id: "o-6", tenant_id: "t-demo", table_id: "tab-6", status: "delivered", currency_code: "CRC", subtotal: 5200, total: 5200, customer_note: null, created_at: minsAgo(48), updated_at: minsAgo(30) },
  { id: "o-7", tenant_id: "t-demo", table_id: "tab-1", status: "paid", currency_code: "CRC", subtotal: 9100, total: 9100, customer_note: null, created_at: minsAgo(75), updated_at: minsAgo(60) },
  { id: "o-8", tenant_id: "t-demo", table_id: "tab-2", status: "paid", currency_code: "CRC", subtotal: 7000, total: 7000, customer_note: null, created_at: iso(1), updated_at: iso(1) },
];

const oi = (id: string, order_id: string, product_id: string, name: string, price: number, qty: number, note: string | null = null): OrderItem => ({
  id, order_id, tenant_id: "t-demo", product_id, product_name_snapshot: name, unit_price_snapshot: price, quantity: qty, line_total: price * qty, note,
});

export const mockOrderItems: Record<string, OrderItem[]> = {
  "o-1": [oi("oi-1", "o-1", "p-casado", "Casado Completo", 4200, 2, "Sin cebolla")],
  "o-2": [oi("oi-3", "o-2", "p-hamburguesa", "Hamburguesa Casera", 4500, 1)],
  "o-3": [oi("oi-4", "o-3", "p-lomito", "Lomito en salsa", 6500, 1), oi("oi-5", "o-3", "p-bowl", "Bowl Tropical", 3900, 1), oi("oi-6", "o-3", "p-limonada", "Limonada de la casa", 1300, 1)],
  "o-4": [oi("oi-7", "o-4", "p-panqueques", "Panqueques con miel", 3200, 1)],
  "o-5": [oi("oi-8", "o-5", "p-lomito", "Lomito en salsa", 6500, 1)],
  "o-6": [oi("oi-9", "o-6", "p-pizza", "Pizza Artesanal", 5200, 1)],
  "o-7": [oi("oi-10", "o-7", "p-casado", "Casado Completo", 4200, 2), oi("oi-11", "o-7", "p-fresco", "Fresco Natural de Naranja", 1400, 1)],
  "o-8": [oi("oi-12", "o-8", "p-casado", "Casado Completo", 4200, 1), oi("oi-13", "o-8", "p-brownie", "Brownie con helado", 2900, 1)],
};

export const mockDailySales = [
  { day: iso(6).slice(0, 10), orders_count: 38, revenue: 196500, currency_code: "CRC" },
  { day: iso(5).slice(0, 10), orders_count: 42, revenue: 221800, currency_code: "CRC" },
  { day: iso(4).slice(0, 10), orders_count: 35, revenue: 178400, currency_code: "CRC" },
  { day: iso(3).slice(0, 10), orders_count: 51, revenue: 268900, currency_code: "CRC" },
  { day: iso(2).slice(0, 10), orders_count: 47, revenue: 243100, currency_code: "CRC" },
  { day: iso(1).slice(0, 10), orders_count: 58, revenue: 312600, currency_code: "CRC" },
  { day: iso(0).slice(0, 10), orders_count: 33, revenue: 174200, currency_code: "CRC" },
];

export const mockTopProducts = [
  { name: "Casado Completo", units: 86, revenue: 361200 },
  { name: "Hamburguesa Casera", units: 64, revenue: 288000 },
  { name: "Gallo Pinto con huevo", units: 58, revenue: 162400 },
  { name: "Fresco Natural de Naranja", units: 71, revenue: 99400 },
  { name: "Lomito en salsa", units: 29, revenue: 188500 },
];

export const mockMenuPayload: MenuPayload = {
  tenant: { id: "t-demo", name: RESTAURANT.name, slug: RESTAURANT.slug },
  table: { id: "tab-1", label: "Mesa 1" },
  settings: {
    currency_code: "CRC",
    default_language: "es",
    enabled_languages: ["es", "en"],
    theme: { primary: "#22503a", accent: "#b8923f" },
    logo_url: null,
    restaurant_name: RESTAURANT.name,
  },
  categories: mockCategories.map((c) => ({ id: c.id, name_i18n: c.name_i18n, sort_order: c.sort_order })),
  products: mockProducts
    .filter((p) => p.is_available)
    .map((p) => ({ id: p.id, category_id: p.category_id, name_i18n: p.name_i18n, description_i18n: p.description_i18n, price: p.price, image_url: p.image_url, sort_order: p.sort_order })),
};
