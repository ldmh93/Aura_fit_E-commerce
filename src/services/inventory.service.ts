import { mockInventory, mockProducts } from "@/lib/mock-data";
import { recalculateStock } from "@/services/products.service";
import { getSettings } from "@/services/settings.service";
import type { InventoryEntry } from "@/types";

/** Inventario por variante: producto + talla + color. */

export interface InventoryRow extends InventoryEntry {
  product_name: string;
  product_slug: string;
  sku: string;
  unit_price: number;
}

export async function getInventory(search?: string): Promise<InventoryRow[]> {
  let rows = mockInventory.map((entry) => {
    const product = mockProducts.find((p) => p.id === entry.product_id);
    return {
      ...entry,
      product_name: product?.name ?? "—",
      product_slug: product?.slug ?? "",
      sku: product?.sku ?? "",
      unit_price: product?.price ?? 0,
    };
  });

  if (search) {
    const term = search.toLowerCase();
    rows = rows.filter(
      (row) =>
        row.product_name.toLowerCase().includes(term) ||
        row.sku.toLowerCase().includes(term) ||
        row.color.toLowerCase().includes(term),
    );
  }

  return rows.sort(
    (a, b) =>
      a.product_name.localeCompare(b.product_name, "es") ||
      a.size.localeCompare(b.size),
  );
}

export async function getLowStockRows(): Promise<InventoryRow[]> {
  const [rows, settings] = await Promise.all([getInventory(), getSettings()]);
  return rows
    .filter((row) => row.quantity <= settings.lowStockThreshold)
    .sort((a, b) => a.quantity - b.quantity);
}

export async function updateInventoryQuantity(
  id: string,
  quantity: number,
): Promise<boolean> {
  const entry = mockInventory.find((i) => i.id === id);
  if (!entry) return false;

  entry.quantity = Math.max(0, Math.floor(quantity));
  recalculateStock(entry.product_id);

  return true;
}

/** Suma o resta unidades sin escribir la cantidad completa. */
export async function adjustInventoryQuantity(
  id: string,
  delta: number,
): Promise<boolean> {
  const entry = mockInventory.find((i) => i.id === id);
  if (!entry) return false;

  entry.quantity = Math.max(0, entry.quantity + Math.floor(delta));
  recalculateStock(entry.product_id);

  return true;
}

export interface InventorySummary {
  units: number;
  value: number;
  variants: number;
  lowStock: number;
  outOfStock: number;
}

export async function getInventorySummary(): Promise<InventorySummary> {
  const [rows, settings] = await Promise.all([getInventory(), getSettings()]);

  return {
    units: rows.reduce((sum, row) => sum + row.quantity, 0),
    value: rows.reduce((sum, row) => sum + row.quantity * row.unit_price, 0),
    variants: rows.length,
    lowStock: rows.filter(
      (row) => row.quantity > 0 && row.quantity <= settings.lowStockThreshold,
    ).length,
    outOfStock: rows.filter((row) => row.quantity === 0).length,
  };
}
