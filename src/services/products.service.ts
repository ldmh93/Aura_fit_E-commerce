import { mockCategories, mockInventory, mockProducts } from "@/lib/mock-data";
import type {
  Product,
  ProductColor,
  ProductFilters,
  ProductStatus,
  ProductWithInventory,
  Size,
} from "@/types";
import { sortSizes } from "@/lib/config";
import { slugify } from "@/utils";

/**
 * Capa de datos de producto — única puerta al catálogo.
 * Ningún componente lee los datos directamente.
 *
 * Hoy los datos viven en `src/lib/mock-data.ts`. Al conectar Supabase solo
 * cambia el interior de estas funciones; la UI no se entera.
 * Ver .claude/architecture.md
 */

function withCategory(product: Product): Product {
  const category = mockCategories.find((c) => c.id === product.category_id);
  return {
    ...product,
    category_name: category?.name,
    category_slug: category?.slug,
  };
}

function applyFilters(products: Product[], filters: ProductFilters): Product[] {
  let result = products;

  if (filters.category) {
    const category = mockCategories.find((c) => c.slug === filters.category);
    result = result.filter((p) => p.category_id === category?.id);
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

/** Catálogo público: todo lo que no está oculto. */
export async function getProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  const visible = mockProducts
    .filter((p) => p.status !== "oculto")
    .map(withCategory);

  return applyFilters(visible, filters);
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const products = await getProducts();
  const featured = products.filter((p) => p.featured);
  return (featured.length ? featured : products).slice(0, limit);
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithInventory | null> {
  const product = mockProducts.find((p) => p.slug === slug);
  if (!product) return null;

  return {
    ...withCategory(product),
    inventory: mockInventory.filter((i) => i.product_id === product.id),
  };
}

/** Otras prendas de la misma categoría. */
export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const all = await getProducts();
  const sameCategory = all.filter(
    (p) => p.id !== product.id && p.category_id === product.category_id,
  );

  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const rest = all.filter(
    (p) => p.id !== product.id && !sameCategory.some((s) => s.id === p.id),
  );

  return [...sameCategory, ...rest].slice(0, limit);
}

export async function getAllProductSlugs(): Promise<
  { slug: string; created_at: string }[]
> {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug, created_at: p.created_at }));
}

/**
 * Colores y tallas que existen de verdad en el catálogo.
 * Los filtros solo muestran esto: ofrecer los 24 colores de la paleta
 * cuando en la tienda hay cuatro es ruido.
 */
export async function getCatalogFacets(category?: string): Promise<{
  colors: ProductColor[];
  sizes: Size[];
}> {
  const products = await getProducts(category ? { category } : {});

  const colors = new Map<string, ProductColor>();
  const sizes = new Set<Size>();

  for (const product of products) {
    for (const color of product.colors) {
      if (!colors.has(color.name)) colors.set(color.name, color);
    }
    for (const size of product.sizes) sizes.add(size);
  }

  return {
    colors: [...colors.values()].sort((a, b) => a.name.localeCompare(b.name, "es")),
    sizes: sortSizes([...sizes]),
  };
}

/* ── Administración ──────────────────────────────────────────── */

/** Catálogo completo, incluye ocultos. */
export async function getAdminProducts(search?: string): Promise<Product[]> {
  let list = mockProducts.map(withCategory);

  if (search) {
    const term = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        (p.category_name ?? "").toLowerCase().includes(term),
    );
  }

  return list.sort(
    (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
  );
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = mockProducts.find((p) => p.id === id);
  return product ? withCategory(product) : null;
}

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
  fit: Product["fit"];
  sizes: Size[];
  colors: ProductColor[];
  featured: boolean;
  status: ProductStatus;
}

/** Crea el producto y sus variantes de inventario en cero. */
export async function createProduct(input: ProductInput): Promise<boolean> {
  const slug = slugify(input.slug || input.name);
  if (mockProducts.some((p) => p.slug === slug)) return false;

  const id = `p-${Date.now()}`;

  mockProducts.unshift({
    ...input,
    slug,
    id,
    stock: 0,
    status: "agotado",
    created_at: new Date().toISOString(),
  });

  syncVariants(id, input.sizes, input.colors);
  return true;
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<boolean> {
  const index = mockProducts.findIndex((p) => p.id === id);
  if (index === -1) return false;

  const current = mockProducts[index]!;
  const slug = slugify(input.slug || input.name);

  mockProducts[index] = {
    ...current,
    ...input,
    slug,
    // El stock lo manda el inventario, nunca el formulario.
    stock: current.stock,
  };

  syncVariants(id, input.sizes, input.colors);
  recalculateStock(id);

  return true;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const index = mockProducts.findIndex((p) => p.id === id);
  if (index === -1) return false;

  mockProducts.splice(index, 1);
  for (let i = mockInventory.length - 1; i >= 0; i -= 1) {
    if (mockInventory[i]?.product_id === id) mockInventory.splice(i, 1);
  }

  return true;
}

/** Alterna entre activo y oculto sin abrir el formulario. */
export async function toggleProductVisibility(id: string): Promise<boolean> {
  const product = mockProducts.find((p) => p.id === id);
  if (!product) return false;

  product.status = product.status === "oculto" ? "activo" : "oculto";
  if (product.status === "activo" && product.stock <= 0) {
    product.status = "agotado";
  }

  return true;
}

/**
 * Crea las variantes que falten y borra las que ya no aplican.
 * Conserva las cantidades de las combinaciones que siguen existiendo.
 */
function syncVariants(
  productId: string,
  sizes: Size[],
  colors: ProductColor[],
) {
  const wanted = new Set(
    sizes.flatMap((size) => colors.map((color) => `${size}__${color.name}`)),
  );

  for (let i = mockInventory.length - 1; i >= 0; i -= 1) {
    const entry = mockInventory[i]!;
    if (entry.product_id !== productId) continue;
    if (!wanted.has(`${entry.size}__${entry.color}`)) {
      mockInventory.splice(i, 1);
    }
  }

  for (const size of sizes) {
    for (const color of colors) {
      const exists = mockInventory.some(
        (entry) =>
          entry.product_id === productId &&
          entry.size === size &&
          entry.color === color.name,
      );
      if (!exists) {
        mockInventory.push({
          id: `inv-${productId}-${size}-${slugify(color.name)}`,
          product_id: productId,
          size,
          color: color.name,
          quantity: 0,
        });
      }
    }
  }
}

/** Recalcula `stock` y el estado a partir del inventario real. */
export function recalculateStock(productId: string) {
  const product = mockProducts.find((p) => p.id === productId);
  if (!product) return;

  product.stock = mockInventory
    .filter((entry) => entry.product_id === productId)
    .reduce((sum, entry) => sum + entry.quantity, 0);

  if (product.status !== "oculto") {
    product.status = product.stock > 0 ? "activo" : "agotado";
  }
}
