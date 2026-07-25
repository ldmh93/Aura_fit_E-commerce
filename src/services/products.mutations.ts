import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { mockInventory, mockProducts } from "@/lib/mock-data";
import type {
  Product,
  ProductColor,
  ProductStatus,
  Size,
  Gender,
  CollectionSlug,
} from "@/types";

/**
 * Mutaciones de producto del panel admin.
 * En modo mock los cambios viven en memoria durante la sesión del servidor.
 */

export interface ProductInput {
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
  collection: CollectionSlug;
  gender: Gender;
  sizes: Size[];
  colors: ProductColor[];
  featured: boolean;
  status: ProductStatus;
}

export async function createProduct(input: ProductInput): Promise<boolean> {
  const supabase = isSupabaseConfigured ? await createServerSupabase() : null;

  if (!supabase) {
    const id = `p-${Date.now()}`;
    mockProducts.unshift({
      ...input,
      id,
      stock: 0,
      created_at: new Date().toISOString(),
    });
    // Crea las variantes de inventario en cero.
    for (const size of input.sizes) {
      for (const color of input.colors) {
        mockInventory.push({
          id: `inv-${id}-${size}-${color.name}`,
          product_id: id,
          size,
          color: color.name,
          quantity: 0,
        });
      }
    }
    return true;
  }

  const { data, error } = await supabase
    .from("products")
    .insert(input)
    .select("id")
    .single();

  if (error || !data) return false;

  const rows = input.sizes.flatMap((size) =>
    input.colors.map((color) => ({
      product_id: data.id as string,
      size,
      color: color.name,
      quantity: 0,
    })),
  );

  if (rows.length) await supabase.from("inventory").insert(rows);

  return true;
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<boolean> {
  const supabase = isSupabaseConfigured ? await createServerSupabase() : null;

  if (!supabase) {
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index === -1) return false;
    mockProducts[index] = { ...mockProducts[index], ...input } as Product;
    return true;
  }

  const { error } = await supabase.from("products").update(input).eq("id", id);
  return !error;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = isSupabaseConfigured ? await createServerSupabase() : null;

  if (!supabase) {
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index === -1) return false;
    mockProducts.splice(index, 1);
    for (let i = mockInventory.length - 1; i >= 0; i -= 1) {
      if (mockInventory[i]?.product_id === id) mockInventory.splice(i, 1);
    }
    return true;
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  return !error;
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = isSupabaseConfigured ? await createServerSupabase() : null;

  if (!supabase) return mockProducts.find((p) => p.id === id) ?? null;

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  return (data as Product) ?? null;
}
