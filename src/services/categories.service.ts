import { mockCategories, mockProducts } from "@/lib/mock-data";
import type { Category } from "@/types";
import { slugify } from "@/utils";

/**
 * Categorías de la tienda. Es la única taxonomía del catálogo.
 * Arranca con Hombre y Mujer; el administrador puede agregar más.
 */

export interface CategoryWithCount extends Category {
  product_count: number;
}

export async function getCategories(
  includeInactive = false,
): Promise<Category[]> {
  const list = includeInactive
    ? mockCategories
    : mockCategories.filter((c) => c.active);

  return [...list].sort((a, b) => a.sort_order - b.sort_order);
}

export async function getCategoriesWithCount(): Promise<CategoryWithCount[]> {
  const categories = await getCategories(true);

  return categories.map((category) => ({
    ...category,
    product_count: mockProducts.filter((p) => p.category_id === category.id)
      .length,
  }));
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  return mockCategories.find((c) => c.slug === slug) ?? null;
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
  const slug = slugify(input.slug || input.name);
  if (mockCategories.some((c) => c.slug === slug)) return false;

  mockCategories.push({
    ...input,
    slug,
    id: `cat-${Date.now()}`,
    created_at: new Date().toISOString(),
  });

  return true;
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
): Promise<boolean> {
  const index = mockCategories.findIndex((c) => c.id === id);
  if (index === -1) return false;

  const current = mockCategories[index]!;
  mockCategories[index] = {
    ...current,
    ...input,
    slug: input.slug ? slugify(input.slug) : current.slug,
  };

  return true;
}

/** No se borra una categoría que todavía tiene productos. */
export async function deleteCategory(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const used = mockProducts.filter((p) => p.category_id === id).length;
  if (used > 0) {
    return {
      ok: false,
      message: `No se puede eliminar: tiene ${used} producto${used === 1 ? "" : "s"} asignado${used === 1 ? "" : "s"}.`,
    };
  }

  const index = mockCategories.findIndex((c) => c.id === id);
  if (index === -1) return { ok: false, message: "Categoría no encontrada." };

  mockCategories.splice(index, 1);
  return { ok: true, message: "Categoría eliminada." };
}
