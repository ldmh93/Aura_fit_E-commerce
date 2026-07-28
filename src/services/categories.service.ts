import { adminDb, publicDb } from "@/services/db";
import type { Category } from "@/types";
import { slugify } from "@/utils";

/**
 * Categorías de la tienda. Es la única taxonomía del catálogo.
 * Arranca con Hombre y Mujer; el administrador puede agregar más.
 */

const SELECT = "id,name,slug,description,image,active,sort_order,created_at";

export interface CategoryWithCount extends Category {
  product_count: number;
}

export async function getCategories(
  includeInactive = false,
): Promise<Category[]> {
  // Las inactivas solo se ven desde el panel.
  const db = includeInactive ? adminDb() : await publicDb();

  let query = db.from("categories").select(SELECT).order("sort_order");
  if (!includeInactive) query = query.eq("active", true);

  const { data, error } = await query;
  if (error) throw new Error(`No se pudieron leer las categorías: ${error.message}`);

  return (data ?? []) as Category[];
}

export async function getCategoriesWithCount(): Promise<CategoryWithCount[]> {
  const db = adminDb();

  const { data, error } = await db
    .from("categories")
    .select(`${SELECT},products(count)`)
    .order("sort_order");

  if (error) throw new Error(`No se pudieron leer las categorías: ${error.message}`);

  type Row = Category & { products?: { count: number }[] };

  return ((data ?? []) as unknown as Row[]).map(({ products, ...category }) => ({
    ...category,
    product_count: products?.[0]?.count ?? 0,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const db = await publicDb();
  const { data } = await db
    .from("categories")
    .select(SELECT)
    .eq("slug", slug)
    .maybeSingle();

  return (data as Category) ?? null;
}

export interface CategoryInput {
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
  sort_order: number;
}

export async function createCategory(input: CategoryInput): Promise<boolean> {
  const db = adminDb();
  const { error } = await db
    .from("categories")
    .insert({ ...input, slug: slugify(input.slug || input.name) });

  return !error;
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
): Promise<boolean> {
  const db = adminDb();

  const payload = input.slug
    ? { ...input, slug: slugify(input.slug) }
    : { ...input };

  const { error } = await db.from("categories").update(payload).eq("id", id);
  return !error;
}

/** No se borra una categoría que todavía tiene productos. */
export async function deleteCategory(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const db = adminDb();

  const { count } = await db
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  const used = count ?? 0;
  if (used > 0) {
    return {
      ok: false,
      message: `No se puede eliminar: tiene ${used} producto${used === 1 ? "" : "s"} asignado${used === 1 ? "" : "s"}.`,
    };
  }

  const { error } = await db.from("categories").delete().eq("id", id);
  if (error) return { ok: false, message: "No se pudo eliminar la categoría." };

  return { ok: true, message: "Categoría eliminada." };
}
