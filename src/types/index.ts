/**
 * Tipos de dominio de AURA FIT.
 * Fuente única de verdad — no redefinir estas formas en features.
 * Ver .claude/database-schema.md
 *
 * La tienda maneja UNA sola taxonomía: categorías (Hombre / Mujer).
 * No hay colecciones ni campo de género: sería la misma información dos veces.
 */

export type ProductStatus = "activo" | "oculto" | "agotado";

/** No hay envíos: los pedidos se entregan en punto de encuentro. */
export type OrderStatus =
  | "pendiente"
  | "confirmado"
  | "pagado"
  | "entregado"
  | "cancelado";

export type Size = "XS" | "S" | "M" | "L" | "XL";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  features: string[];
  material: string;
  price: number;
  old_price: number | null;
  sku: string;
  images: string[];
  video: string | null;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  /** Tipo de prenda: define qué tabla de medidas se muestra. */
  fit: "superior" | "inferior";
  sizes: Size[];
  colors: ProductColor[];
  stock: number;
  featured: boolean;
  status: ProductStatus;
  created_at: string;
}

export interface InventoryEntry {
  id: string;
  product_id: string;
  size: Size;
  color: string;
  quantity: number;
}

/** Producto con su inventario desglosado por variante. */
export interface ProductWithInventory extends Product {
  inventory: InventoryEntry[];
}

export interface CartItem {
  /** `${productId}__${size}__${color}` — identifica la variante. */
  key: string;
  product_id: string;
  name: string;
  slug: string;
  sku: string;
  image: string;
  size: Size;
  color: string;
  quantity: number;
  unit_price: number;
  max_quantity: number;
}

export interface OrderItem {
  product_id: string;
  name: string;
  sku: string;
  size: Size;
  color: string;
  quantity: number;
  unit_price: number;
  image: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  status: OrderStatus;
  /** Punto de encuentro acordado con el cliente. */
  meeting_point: string | null;
  notes: string | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  starts_at: string;
  expiration: string;
  active: boolean;
}

export interface ProductFilters {
  category?: string;
  size?: Size;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sort?: "nuevo" | "precio-asc" | "precio-desc" | "nombre";
}

/** Ajustes editables desde /admin/ajustes. */
export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  meetingPointNote: string;
  supportHours: string;
  announcement: string;
  announcementActive: boolean;
  lowStockThreshold: number;
  updated_at: string;
}

export interface DashboardStats {
  revenueMonth: number;
  revenuePrevMonth: number;
  ordersMonth: number;
  ordersPending: number;
  averageTicket: number;
  unitsSoldMonth: number;
  activeProducts: number;
  hiddenProducts: number;
  outOfStockProducts: number;
  lowStockVariants: number;
  inventoryUnits: number;
  inventoryValue: number;
  revenueByDay: { date: string; total: number }[];
  revenueByMonth: { month: string; total: number }[];
  ordersByStatus: { status: OrderStatus; count: number }[];
  salesByCategory: { category: string; units: number; revenue: number }[];
  topProducts: { name: string; units: number; revenue: number }[];
}
