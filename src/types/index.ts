/**
 * Tipos de dominio de AURA FIT.
 * Fuente única de verdad — no redefinir estas formas en features.
 * Ver .claude/database-schema.md
 */

export type ProductStatus = "activo" | "oculto" | "agotado";

export type OrderStatus =
  | "pendiente"
  | "confirmado"
  | "pagado"
  | "enviado"
  | "finalizado"
  | "cancelado";

export type Gender = "hombre" | "mujer" | "unisex";

export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export type CollectionSlug =
  | "aura-performance"
  | "aura-street"
  | "aura-women"
  | "aura-essential"
  | "limited-edition";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  created_at?: string;
}

export interface Collection {
  slug: CollectionSlug;
  name: string;
  tagline: string;
  description: string;
  image: string;
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
  collection: CollectionSlug;
  gender: Gender;
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
  /** `${productId}-${size}-${color}` — identifica la variante. */
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
  notes: string | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  starts_at: string;
  expiration: string;
  product_id: string | null;
  active: boolean;
}

export interface ProductFilters {
  category?: string;
  collection?: string;
  gender?: Gender;
  size?: Size;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sort?: "nuevo" | "precio-asc" | "precio-desc" | "nombre";
}

export interface DashboardStats {
  monthRevenue: number;
  monthOrders: number;
  activeProducts: number;
  outOfStockProducts: number;
  pendingOrders: number;
  lowStockVariants: number;
  revenueByDay: { date: string; total: number }[];
  ordersByStatus: { status: OrderStatus; count: number }[];
  topProducts: { name: string; units: number }[];
}
