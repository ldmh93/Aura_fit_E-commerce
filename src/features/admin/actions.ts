"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  type ProductInput,
} from "@/services/products.mutations";
import { updateInventoryQuantity } from "@/services/inventory.service";
import { updateOrderStatus } from "@/services/orders.service";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { mockCoupons } from "@/lib/mock-data";
import type {
  CollectionSlug,
  Gender,
  OrderStatus,
  ProductStatus,
  Size,
} from "@/types";
import { sanitizeText, slugify } from "@/utils";

export interface ActionState {
  ok: boolean;
  message: string;
}

const COLOR_HEX: Record<string, string> = {
  Negro: "#0A0A0A",
  Gris: "#6B7280",
  Azul: "#5EA8FF",
  Plata: "#C7D7E8",
  Blanco: "#FFFFFF",
};

function parseProductForm(formData: FormData): ProductInput {
  const name = sanitizeText(formData.get("name"), 120);
  const slugRaw = sanitizeText(formData.get("slug"), 140);

  const list = (value: FormDataEntryValue | null) =>
    sanitizeText(value, 2000)
      .split(/[\n,]/)
      .map((entry) => entry.trim())
      .filter(Boolean);

  // Las URLs pueden ser largas y solo se separan por salto de línea.
  const images = sanitizeText(formData.get("images"), 6000)
    .split(/\s*\n\s*/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  const colorNames = formData.getAll("colors").map(String);

  return {
    name,
    slug: slugify(slugRaw || name),
    description: sanitizeText(formData.get("description"), 2000),
    features: list(formData.get("features")),
    material: sanitizeText(formData.get("material"), 200),
    price: Math.max(0, Number(formData.get("price")) || 0),
    old_price: formData.get("old_price")
      ? Math.max(0, Number(formData.get("old_price")))
      : null,
    sku: sanitizeText(formData.get("sku"), 40).toUpperCase(),
    images,
    video: sanitizeText(formData.get("video"), 500) || null,
    category_id: sanitizeText(formData.get("category_id"), 60),
    collection: sanitizeText(
      formData.get("collection"),
      40,
    ) as CollectionSlug,
    gender: sanitizeText(formData.get("gender"), 20) as Gender,
    sizes: formData.getAll("sizes").map(String) as Size[],
    colors: colorNames.map((color) => ({
      name: color,
      hex: COLOR_HEX[color] ?? "#888888",
    })),
    featured: formData.get("featured") === "on",
    status: sanitizeText(formData.get("status"), 20) as ProductStatus,
  };
}

export async function createProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const input = parseProductForm(formData);

  if (input.name.length < 3)
    return { ok: false, message: "El nombre es obligatorio." };
  if (!input.sku) return { ok: false, message: "El SKU es obligatorio." };
  if (input.price <= 0)
    return { ok: false, message: "El precio debe ser mayor a cero." };
  if (!input.sizes.length)
    return { ok: false, message: "Selecciona al menos una talla." };
  if (!input.colors.length)
    return { ok: false, message: "Selecciona al menos un color." };

  const ok = await createProduct(input);
  if (!ok) return { ok: false, message: "No se pudo guardar el producto." };

  revalidatePath("/admin/productos");
  revalidatePath("/shop");
  redirect("/admin/productos");
}

export async function updateProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "Producto no identificado." };

  const input = parseProductForm(formData);
  const ok = await updateProduct(id, input);
  if (!ok) return { ok: false, message: "No se pudo actualizar." };

  revalidatePath("/admin/productos");
  revalidatePath(`/producto/${input.slug}`);
  revalidatePath("/shop");

  return { ok: true, message: "Producto actualizado." };
}

export async function deleteProductAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) await deleteProduct(id);
  revalidatePath("/admin/productos");
  revalidatePath("/shop");
}

export async function updateInventoryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const quantity = Number(formData.get("quantity")) || 0;
  if (id) await updateInventoryQuantity(id, quantity);
  revalidatePath("/admin/inventario");
  revalidatePath("/admin");
  revalidatePath("/shop");
}

export async function updateOrderStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (id && status) await updateOrderStatus(id, status);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
}

export async function createCouponAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const code = sanitizeText(formData.get("code"), 40).toUpperCase();
  const discount = Number(formData.get("discount")) || 0;
  const starts_at = String(formData.get("starts_at") ?? "");
  const expiration = String(formData.get("expiration") ?? "");

  if (!code) return { ok: false, message: "Escribe un código." };
  if (discount < 1 || discount > 30)
    return { ok: false, message: "El descuento debe estar entre 1% y 30%." };
  if (!starts_at || !expiration)
    return { ok: false, message: "Define las fechas de vigencia." };

  const payload = {
    code,
    discount,
    starts_at: new Date(starts_at).toISOString(),
    expiration: new Date(expiration).toISOString(),
    product_id: null,
    active: true,
  };

  const supabase = isSupabaseConfigured ? await createServerSupabase() : null;

  if (!supabase) {
    if (mockCoupons.some((c) => c.code === code))
      return { ok: false, message: "Ese código ya existe." };
    mockCoupons.unshift({ id: `cup-${Date.now()}`, ...payload });
  } else {
    const { error } = await supabase.from("coupons").insert(payload);
    if (error) return { ok: false, message: "No se pudo crear el cupón." };
  }

  revalidatePath("/admin/cupones");
  return { ok: true, message: `Cupón ${code} creado.` };
}

export async function toggleCouponAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";

  const supabase = isSupabaseConfigured ? await createServerSupabase() : null;

  if (!supabase) {
    const coupon = mockCoupons.find((c) => c.id === id);
    if (coupon) coupon.active = !active;
  } else {
    await supabase.from("coupons").update({ active: !active }).eq("id", id);
  }

  revalidatePath("/admin/cupones");
}
