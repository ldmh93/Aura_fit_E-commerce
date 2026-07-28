import { adminDb } from "@/services/db";
import { getSettings } from "@/services/settings.service";
import type { InventoryEntry, Size } from "@/types";

/**
 * Inventario por variante: producto + talla + color.
 * `products.stock` lo recalcula un trigger de Postgres, no este código.
 */

export interface InventoryRow extends InventoryEntry {
  product_name: string;
  product_slug: string;
  sku: string;
  unit_price: number;
}

interface Row {
  id: string;
  product_id: string;
  size: string;
  color: string;
  quantity: number;
  products?: {
    name: string;
    slug: string;
    sku: string;
    price: number | string;
  } | null;
}

function mapRow(row: Row): InventoryRow {
  return {
    id: row.id,
    product_id: row.product_id,
    size: row.size as Size,
    color: row.color,
    quantity: row.quantity,
    product_name: row.products?.name ?? "—",
    product_slug: row.products?.slug ?? "",
    sku: row.products?.sku ?? "",
    unit_price: Number(row.products?.price ?? 0),
  };
}

export async function getInventory(search?: string): Promise<InventoryRow[]> {
  const db = adminDb();

  const { data, error } = await db
    .from("inventory")
    .select("id,product_id,size,color,quantity,products(name,slug,sku,price)");

  if (error) throw new Error(`No se pudo leer el inventario: ${error.message}`);

  let rows = (data as unknown as Row[]).map(mapRow);

  // La búsqueda cruza campos de dos tablas: se resuelve aquí.
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
  return (await getInventoryOverview()).lowStock;
}

export async function updateInventoryQuantity(
  id: string,
  quantity: number,
): Promise<boolean> {
  const db = adminDb();
  const { error } = await db
    .from("inventory")
    .update({ quantity: Math.max(0, Math.floor(quantity)) })
    .eq("id", id);

  return !error;
}

/** Suma o resta unidades sin escribir la cantidad completa. */
export async function adjustInventoryQuantity(
  id: string,
  delta: number,
): Promise<boolean> {
  const db = adminDb();

  const { data } = await db
    .from("inventory")
    .select("quantity")
    .eq("id", id)
    .maybeSingle();

  if (!data) return false;

  return updateInventoryQuantity(id, data.quantity + Math.floor(delta));
}

export interface InventorySummary {
  units: number;
  value: number;
  variants: number;
  lowStock: number;
  outOfStock: number;
}

export interface InventoryOverview {
  rows: InventoryRow[];
  summary: InventorySummary;
  lowStock: InventoryRow[];
  threshold: number;
}

/**
 * Todo el panorama del inventario en una sola lectura.
 *
 * El dashboard necesitaba resumen y alertas a la vez, y cada uno pedía por
 * su cuenta el inventario completo y los ajustes: cuatro consultas para
 * responder lo mismo. Ahora se lee una vez y se deriva el resto.
 */
export async function getInventoryOverview(): Promise<InventoryOverview> {
  const [rows, settings] = await Promise.all([getInventory(), getSettings()]);
  const threshold = settings.lowStockThreshold;

  return {
    rows,
    threshold,
    lowStock: rows
      .filter((row) => row.quantity <= threshold)
      .sort((a, b) => a.quantity - b.quantity),
    summary: {
      units: rows.reduce((sum, row) => sum + row.quantity, 0),
      value: rows.reduce((sum, row) => sum + row.quantity * row.unit_price, 0),
      variants: rows.length,
      lowStock: rows.filter(
        (row) => row.quantity > 0 && row.quantity <= threshold,
      ).length,
      outOfStock: rows.filter((row) => row.quantity === 0).length,
    },
  };
}

export async function getInventorySummary(): Promise<InventorySummary> {
  return (await getInventoryOverview()).summary;
}
