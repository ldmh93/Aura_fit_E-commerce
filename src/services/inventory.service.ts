import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { mockInventory, mockProducts } from "@/lib/mock-data";
import { BUSINESS } from "@/lib/config";
import type { InventoryEntry } from "@/types";

export interface InventoryRow extends InventoryEntry {
  product_name: string;
  product_slug: string;
  sku: string;
}

export async function getInventory(): Promise<InventoryRow[]> {
  const supabase = isSupabaseConfigured ? await createServerSupabase() : null;

  if (!supabase) {
    return mockInventory
      .map((entry) => {
        const product = mockProducts.find((p) => p.id === entry.product_id);
        return {
          ...entry,
          product_name: product?.name ?? "—",
          product_slug: product?.slug ?? "",
          sku: product?.sku ?? "",
        };
      })
      .sort(
        (a, b) =>
          a.product_name.localeCompare(b.product_name, "es") ||
          a.size.localeCompare(b.size),
      );
  }

  const { data } = await supabase
    .from("inventory")
    .select("id,product_id,size,color,quantity,products(name,slug,sku)")
    .order("quantity", { ascending: true });

  type Joined = InventoryEntry & {
    products?: { name: string; slug: string; sku: string } | null;
  };

  return ((data ?? []) as unknown as Joined[]).map(({ products, ...rest }) => ({
    ...rest,
    product_name: products?.name ?? "—",
    product_slug: products?.slug ?? "",
    sku: products?.sku ?? "",
  }));
}

export async function getLowStockRows(): Promise<InventoryRow[]> {
  const rows = await getInventory();
  return rows.filter((row) => row.quantity <= BUSINESS.lowStockThreshold);
}

export async function updateInventoryQuantity(
  id: string,
  quantity: number,
): Promise<boolean> {
  const safeQuantity = Math.max(0, Math.floor(quantity));
  const supabase = isSupabaseConfigured ? await createServerSupabase() : null;

  if (!supabase) {
    const entry = mockInventory.find((i) => i.id === id);
    if (!entry) return false;
    entry.quantity = safeQuantity;
    const product = mockProducts.find((p) => p.id === entry.product_id);
    if (product) {
      product.stock = mockInventory
        .filter((i) => i.product_id === product.id)
        .reduce((sum, i) => sum + i.quantity, 0);
      if (product.status !== "oculto") {
        product.status = product.stock > 0 ? "activo" : "agotado";
      }
    }
    return true;
  }

  const { error } = await supabase
    .from("inventory")
    .update({ quantity: safeQuantity })
    .eq("id", id);

  return !error;
}
