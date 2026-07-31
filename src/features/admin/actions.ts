"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProduct,
  deleteProduct,
  toggleProductVisibility,
  updateProduct,
  type ProductInput,
} from "@/services/products.service";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/services/categories.service";
import {
  adjustInventoryQuantity,
  updateInventoryQuantity,
} from "@/services/inventory.service";
import {
  updateOrderDetails,
  updateOrderStatus,
} from "@/services/orders.service";
import {
  createCoupon,
  deleteCoupon,
  toggleCoupon,
} from "@/services/coupons.service";
import { saveSettings } from "@/services/settings.service";
import { getUsedSkus } from "@/services/products.service";
import { getCategories } from "@/services/categories.service";
import { buildSkuBase, nextSku } from "./sku";
import { DENIED, isAdmin } from "./guard";
import { ONE_SIZE, colorHex, sortSizes } from "@/lib/config";
import type { OrderStatus, Product, ProductStatus, Size } from "@/types";
import { sanitizePhone, sanitizeText, slugify } from "@/utils";

export interface ActionState {
  ok: boolean;
  message: string;
}

/** Estados válidos de un pedido. Se valida contra esta lista, no a ciegas. */
const ORDER_STATUSES: OrderStatus[] = [
  "pendiente",
  "confirmado",
  "pagado",
  "entregado",
  "cancelado",
];

/** Revalida todo lo que depende del catálogo. */
function revalidateCatalog() {
  revalidatePath("/", "layout");
}

/* ── Productos ───────────────────────────────────────────────── */

const FITS: Product["fit"][] = ["superior", "inferior", "conjunto"];

function parseFit(value: FormDataEntryValue | null): Product["fit"] {
  const fit = String(value ?? "");
  return FITS.includes(fit as Product["fit"])
    ? (fit as Product["fit"])
    : "superior";
}

function parseProductForm(formData: FormData): ProductInput {
  const name = sanitizeText(formData.get("name"), 120);

  const lines = (value: FormDataEntryValue | null, max = 4000) =>
    sanitizeText(value, max)
      .split(/\s*\n\s*/)
      .map((entry) => entry.trim())
      .filter(Boolean);

  const colorNames = formData.getAll("colors").map(String);

  return {
    name,
    slug: slugify(sanitizeText(formData.get("slug"), 140) || name),
    description: sanitizeText(formData.get("description"), 2000),
    features: lines(formData.get("features")),
    material: sanitizeText(formData.get("material"), 200),
    price: Math.max(0, Number(formData.get("price")) || 0),
    old_price: formData.get("old_price")
      ? Math.max(0, Number(formData.get("old_price")))
      : null,
    sku: sanitizeText(formData.get("sku"), 40).toUpperCase(),
    images: lines(formData.get("images"), 6000),
    video: sanitizeText(formData.get("video"), 500) || null,
    category_id: sanitizeText(formData.get("category_id"), 60),
    fit: parseFit(formData.get("fit")),
    sizes: sortSizes(formData.getAll("sizes").map(String) as Size[]),
    colors: colorNames.map((color) => ({ name: color, hex: colorHex(color) })),
    featured: formData.get("featured") === "on",
    status: sanitizeText(formData.get("status"), 20) as ProductStatus,
    stock: parseStock(formData),
  };
}

/** Casillas `stock__talla__color` que manda la rejilla del formulario. */
function parseStock(formData: FormData): Record<string, number> {
  const stock: Record<string, number> = {};

  for (const [campo, valor] of formData.entries()) {
    if (!campo.startsWith("stock__")) continue;
    const clave = campo.slice("stock__".length);
    if (!clave.includes("__")) continue;
    stock[clave] = Math.max(0, Math.floor(Number(valor) || 0));
  }

  return stock;
}

/**
 * Sugiere un SKU a partir del nombre y la categoría.
 * Lo llama el formulario mientras se escribe, y también sirve de respaldo
 * cuando el campo se envía vacío.
 */
export async function suggestSkuAction(
  name: string,
  categoryId: string,
): Promise<string> {
  if (!(await isAdmin())) return "";

  const limpio = sanitizeText(name, 120);
  if (limpio.length < 2) return "";

  const [categories, usados] = await Promise.all([
    getCategories(true),
    getUsedSkus(),
  ]);

  const categoria = categories.find((c) => c.id === categoryId);
  return nextSku(buildSkuBase(limpio, categoria?.name), usados);
}

function validateProduct(input: ProductInput): string | null {
  if (input.name.length < 3) return "El nombre es obligatorio.";
  if (input.price <= 0) return "El precio debe ser mayor a cero.";
  if (input.old_price && input.old_price <= input.price)
    return "El precio anterior debe ser mayor que el precio actual.";
  if (!input.category_id) return "Elige una categoría.";
  if (!input.sizes.length) return "Selecciona al menos una talla.";
  if (input.sizes.includes(ONE_SIZE) && input.sizes.length > 1)
    return `“${ONE_SIZE}” no se combina con otras tallas: o el producto se talla, o no.`;
  if (!input.colors.length) return "Selecciona al menos un color.";
  if (!input.images.length) return "Sube al menos una foto.";
  return null;
}

export async function createProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAdmin())) return DENIED;

  const input = parseProductForm(formData);

  const error = validateProduct(input);
  if (error) return { ok: false, message: error };

  if (!input.sku) {
    input.sku = await suggestSkuAction(input.name, input.category_id);
  }

  const ok = await createProduct(input);
  if (!ok)
    return { ok: false, message: "Ya existe un producto con esa dirección." };

  revalidateCatalog();
  redirect("/admin/productos");
}

export async function updateProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAdmin())) return DENIED;

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "Producto no identificado." };

  const input = parseProductForm(formData);

  const error = validateProduct(input);
  if (error) return { ok: false, message: error };

  if (!input.sku) {
    input.sku = await suggestSkuAction(input.name, input.category_id);
  }

  const ok = await updateProduct(id, input);
  if (!ok) return { ok: false, message: "No se pudo actualizar." };

  revalidateCatalog();
  return { ok: true, message: "Producto actualizado." };
}

export async function deleteProductAction(formData: FormData) {
  if (!(await isAdmin())) return;

  const id = String(formData.get("id") ?? "");
  if (id) await deleteProduct(id);
  revalidateCatalog();
}

export async function toggleProductAction(formData: FormData) {
  if (!(await isAdmin())) return;

  const id = String(formData.get("id") ?? "");
  if (id) await toggleProductVisibility(id);
  revalidateCatalog();
}

/* ── Categorías ──────────────────────────────────────────────── */

export async function saveCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAdmin())) return DENIED;

  const id = String(formData.get("id") ?? "");
  const name = sanitizeText(formData.get("name"), 60);

  if (name.length < 2) return { ok: false, message: "Escribe un nombre." };

  const input = {
    name,
    slug: slugify(sanitizeText(formData.get("slug"), 80) || name),
    description: sanitizeText(formData.get("description"), 300),
    image: sanitizeText(formData.get("image"), 600),
    active: formData.get("active") === "on",
    sort_order: Number(formData.get("sort_order")) || 99,
  };

  const ok = id
    ? await updateCategory(id, input)
    : await createCategory(input);

  if (!ok)
    return {
      ok: false,
      message: id
        ? "No se pudo actualizar la categoría."
        : "Ya existe una categoría con esa dirección.",
    };

  revalidateCatalog();
  return {
    ok: true,
    message: id ? "Categoría actualizada." : `Categoría ${name} creada.`,
  };
}

export async function deleteCategoryAction(formData: FormData) {
  if (!(await isAdmin())) return;

  const id = String(formData.get("id") ?? "");
  if (id) await deleteCategory(id);
  revalidateCatalog();
}

/* ── Inventario ──────────────────────────────────────────────── */

export async function updateInventoryAction(formData: FormData) {
  if (!(await isAdmin())) return;

  const id = String(formData.get("id") ?? "");
  const quantity = Number(formData.get("quantity")) || 0;
  if (id) await updateInventoryQuantity(id, quantity);
  revalidateCatalog();
}

export async function adjustInventoryAction(formData: FormData) {
  if (!(await isAdmin())) return;

  const id = String(formData.get("id") ?? "");
  const delta = Number(formData.get("delta")) || 0;
  if (id && delta) await adjustInventoryQuantity(id, delta);
  revalidateCatalog();
}

/* ── Pedidos ─────────────────────────────────────────────────── */

/**
 * Cambia el estado del pedido. Devuelve el resultado para que la pantalla
 * pueda reaccionar —por ejemplo, disparar el evento de compra.
 */
export async function updateOrderStatusAction(input: {
  id: string;
  status: OrderStatus;
}): Promise<ActionState> {
  if (!(await isAdmin())) return DENIED;

  const status = sanitizeText(input.status, 20) as OrderStatus;
  if (!input.id || !ORDER_STATUSES.includes(status)) {
    return { ok: false, message: "Estado no válido." };
  }

  const ok = await updateOrderStatus(input.id, status);
  if (!ok) return { ok: false, message: "No se pudo actualizar el pedido." };

  // El inventario cambió: la tienda tiene que reflejarlo.
  revalidateCatalog();

  return { ok: true, message: "Pedido actualizado." };
}

export async function updateOrderDetailsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAdmin())) return DENIED;

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "Pedido no identificado." };

  await updateOrderDetails(id, {
    meeting_point: sanitizeText(formData.get("meeting_point"), 200),
    notes: sanitizeText(formData.get("notes"), 500),
  });

  revalidatePath("/admin/pedidos");
  return { ok: true, message: "Pedido actualizado." };
}

/* ── Cupones ─────────────────────────────────────────────────── */

export async function createCouponAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAdmin())) return DENIED;

  const code = sanitizeText(formData.get("code"), 40).toUpperCase();
  const discount = Number(formData.get("discount")) || 0;
  const startsAt = String(formData.get("starts_at") ?? "");
  const expiration = String(formData.get("expiration") ?? "");

  if (!code) return { ok: false, message: "Escribe un código." };
  if (discount < 1 || discount > 30)
    return { ok: false, message: "El descuento debe estar entre 1% y 30%." };
  if (!startsAt || !expiration)
    return { ok: false, message: "Define las fechas de vigencia." };
  if (new Date(expiration) <= new Date(startsAt))
    return { ok: false, message: "La fecha de expiración debe ser posterior." };

  const result = await createCoupon({
    code,
    discount,
    starts_at: new Date(startsAt).toISOString(),
    expiration: new Date(expiration).toISOString(),
  });

  revalidatePath("/admin/cupones");
  return result;
}

export async function toggleCouponAction(formData: FormData) {
  if (!(await isAdmin())) return;

  const id = String(formData.get("id") ?? "");
  if (id) await toggleCoupon(id);
  revalidatePath("/admin/cupones");
}

export async function deleteCouponAction(formData: FormData) {
  if (!(await isAdmin())) return;

  const id = String(formData.get("id") ?? "");
  if (id) await deleteCoupon(id);
  revalidatePath("/admin/cupones");
}

/* ── Ajustes ─────────────────────────────────────────────────── */

export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAdmin())) return DENIED;

  const whatsappNumber = sanitizePhone(formData.get("whatsappNumber"));

  if (whatsappNumber.length < 10)
    return {
      ok: false,
      message: "El WhatsApp debe incluir código de país. Ej. 524171279042",
    };

  await saveSettings({
    storeName: sanitizeText(formData.get("storeName"), 60),
    tagline: sanitizeText(formData.get("tagline"), 80),
    whatsappNumber,
    whatsappDisplay: sanitizeText(formData.get("whatsappDisplay"), 30),
    meetingPointNote: sanitizeText(formData.get("meetingPointNote"), 300),
    supportHours: sanitizeText(formData.get("supportHours"), 80),
    announcement: sanitizeText(formData.get("announcement"), 120),
    announcementActive: formData.get("announcementActive") === "on",
    lowStockThreshold: Math.max(
      1,
      Number(formData.get("lowStockThreshold")) || 3,
    ),
  });

  revalidateCatalog();
  return { ok: true, message: "Ajustes guardados." };
}
