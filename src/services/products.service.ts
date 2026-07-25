import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import {
  mockCategories,
  mockInventory,
  mockProducts,
} from "@/lib/mock-data";
import type {
  InventoryEntry,
  Product,
  ProductFilters,
  ProductWithInventory,
} from "@/types";

/**
 * Única puerta de acceso a datos de producto.
 * Ningún componente debe hablar con Supabase directamente.
 * Ver .claude/architecture.md
 */

const SELECT =
  "id,name,slug,description,features,material,price,old_price,sku,images,video,category_id,collection,gender,sizes,colors,stock,featured,status,created_at,categories(name)";

type Row = Omit<Product, "category_name"> & {
  categories?: { name: string } | null;
};

function mapRow(row: Row): Product {
  const { categories, ...rest } = row;
  return { ...rest, category_name: categories?.name };
}

function applyFilters(products: Product[], filters: ProductFilters): Product[] {
  let result = products;

  if (filters.category) {
    const category = mockCategories.find((c) => c.slug === filters.category);
    result = result.filter((p) => p.category_id === category?.id);
  }
  if (filters.collection) {
    result = result.filter((p) => p.collection === filters.collection);
  }
  if (filters.gender) {
    result = result.filter((p) => p.gender === filters.gender);
  }
  if (filters.size) {
    result = result.filter((p) => p.sizes.includes(filters.size!));
  }
  if (filters.color) {
    result = result.filter((p) =>
      p.colors.some((c) => c.name === filters.color),
    );
  }
  if (typeof filters.minPrice === "number") {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }
  if (typeof filters.maxPrice === "number") {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters.inStock) {
    result = result.filter((p) => p.stock > 0);
  }
  if (filters.search) {
    const term = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term),
    );
  }

  switch (filters.sort) {
    case "precio-asc":
      return [...result].sort((a, b) => a.price - b.price);
    case "precio-desc":
      return [...result].sort((a, b) => b.price - a.price);
    case "nombre":
      return [...result].sort((a, b) => a.name.localeCompare(b.name, "es"));
    default:
      return [...result].sort(
        (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
      );
  }
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  const supabase = isSupabaseConfigured ? await createServerSupabase() : null;

  if (!supabase) {
    return applyFilters(
      mockProducts.filter((p) => p.status !== "oculto"),
      filters,
    );
  }

  let query = supabase.from("products").select(SELECT).neq("status", "oculto");

  if (filters.collection) query = query.eq("collection", filters.collection);
  if (filters.gender) query = query.eq("gender", filters.gender);
  if (filters.size) query = query.contains("sizes", [filters.size]);
  if (typeof filters.minPrice === "number")
    query = query.gte("price", filters.minPrice);
  if (typeof filters.maxPrice === "number")
    query = query.lte("price", filters.maxPrice);
  if (filters.inStock) query = query.gt("stock", 0);
  if (filters.search) query = query.ilike("name", `%${filters.search}%`);

  switch (filters.sort) {
    case "precio-asc":
      query = query.order("price", { ascending: true });
      break;
    case "precio-desc":
      query = query.order("price", { ascending: false });
      break;
    case "nombre":
      query = query.order("name", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error || !data) return [];

  let products = (data as unknown as Row[]).map(mapRow);

  // Filtros que Postgres no resuelve directamente sobre jsonb / relaciones.
  if (filters.color) {
    products = products.filter((p) =>
      p.colors.some((c) => c.name === filters.color),
    );
  }
  if (filters.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .single();
    if (cat) products = products.filter((p) => p.category_id === cat.id);
  }

  return products;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await getProducts();
  const featured = products.filter((p) => p.featured);
  return (featured.length ? featured : products).slice(0, limit);
}

export async function getNewArrivals(limit = 4): Promise<Product[]> {
  const products = await getProducts({ sort: "nuevo" });
  return products.slice(0, limit);
}

export async function getSaleProducts(limit = 4): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.old_price && p.old_price > p.price).slice(0, limit);
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithInventory | null> {
  const supabase = isSupabaseConfigured ? await createServerSupabase() : null;

  if (!supabase) {
    const product = mockProducts.find((p) => p.slug === slug);
    if (!product) return null;
    return {
      ...product,
      inventory: mockInventory.filter((i) => i.product_id === product.id),
    };
  }

  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  const product = mapRow(data as unknown as Row);

  const { data: inventory } = await supabase
    .from("inventory")
    .select("id,product_id,size,color,quantity")
    .eq("product_id", product.id);

  return { ...product, inventory: (inventory ?? []) as InventoryEntry[] };
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const products = await getProducts({ collection: product.collection });
  const others = products.filter((p) => p.id !== product.id);
  if (others.length >= limit) return others.slice(0, limit);

  const fallback = await getProducts();
  return [
    ...others,
    ...fallback.filter(
      (p) => p.id !== product.id && !others.some((o) => o.id === p.id),
    ),
  ].slice(0, limit);
}

export async function getAllProductSlugs(): Promise<
  { slug: string; created_at: string }[]
> {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug, created_at: p.created_at }));
}

/** Catálogo completo para el panel admin (incluye ocultos). */
export async function getAdminProducts(): Promise<Product[]> {
  const supabase = isSupabaseConfigured ? await createServerSupabase() : null;

  if (!supabase) {
    return [...mockProducts].sort(
      (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
    );
  }

  const { data } = await supabase
    .from("products")
    .select(SELECT)
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as Row[]).map(mapRow);
}
