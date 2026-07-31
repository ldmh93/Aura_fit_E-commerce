import { adminDb, publicDb } from "@/services/db";
import { sortSizes } from "@/lib/config";
import type {
  OrderItem,
  Product,
  ProductColor,
  ProductFilters,
  ProductStatus,
  ProductWithInventory,
  Size,
} from "@/types";
import { slugify } from "@/utils";

/**
 * Capa de datos de producto — única puerta al catálogo.
 * Ningún componente habla con Supabase directamente.
 * Ver .claude/architecture.md
 */

const SELECT =
  "id,name,slug,description,features,material,price,old_price,sku,images,video,category_id,fit,sizes,colors,stock,featured,status,created_at,categories(name,slug)";

interface Row {
  id: string;
  name: string;
  slug: string;
  description: string;
  features: string[] | null;
  material: string;
  price: number | string;
  old_price: number | string | null;
  sku: string;
  images: string[] | null;
  video: string | null;
  category_id: string | null;
  fit: Product["fit"];
  sizes: string[] | null;
  colors: ProductColor[] | null;
  stock: number;
  featured: boolean;
  status: ProductStatus;
  created_at: string;
  categories?: { name: string; slug: string } | null;
}

/** Postgres devuelve `numeric` como cadena: hay que convertirlo. */
function toNumber(value: number | string | null): number | null {
  if (value === null) return null;
  return typeof value === "number" ? value : Number(value);
}

function mapRow(row: Row): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    features: row.features ?? [],
    material: row.material ?? "",
    price: toNumber(row.price) ?? 0,
    old_price: toNumber(row.old_price),
    sku: row.sku,
    images: row.images ?? [],
    video: row.video,
    category_id: row.category_id ?? "",
    category_name: row.categories?.name,
    category_slug: row.categories?.slug,
    fit: row.fit,
    sizes: sortSizes((row.sizes ?? []) as Size[]),
    colors: row.colors ?? [],
    stock: row.stock,
    featured: row.featured,
    status: row.status,
    created_at: row.created_at,
  };
}

/** Catálogo público: todo lo que no está oculto. */
export async function getProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  const db = await publicDb();

  // `!inner` hace que se pueda filtrar por la categoría relacionada.
  const select = filters.category
    ? SELECT.replace("categories(", "categories!inner(")
    : SELECT;

  let query = db.from("products").select(select).neq("status", "oculto");

  if (filters.category) query = query.eq("categories.slug", filters.category);
  if (filters.size) query = query.contains("sizes", [filters.size]);
  if (typeof filters.minPrice === "number")
    query = query.gte("price", filters.minPrice);
  if (typeof filters.maxPrice === "number")
    query = query.lte("price", filters.maxPrice);
  if (filters.inStock) query = query.gt("stock", 0);
  if (filters.search) {
    const term = filters.search.replace(/[%,()]/g, "");
    query = query.or(
      `name.ilike.%${term}%,description.ilike.%${term}%,sku.ilike.%${term}%`,
    );
  }

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
  if (error) throw new Error(`No se pudo leer el catálogo: ${error.message}`);

  let products = (data as unknown as Row[]).map(mapRow);

  // El color vive dentro de un jsonb: se filtra aquí, no en Postgres.
  if (filters.color) {
    products = products.filter((p) =>
      p.colors.some((c) => c.name === filters.color),
    );
  }

  return products;
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithInventory | null> {
  const db = await publicDb();

  const { data, error } = await db
    .from("products")
    .select(SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  const product = mapRow(data as unknown as Row);

  const { data: inventory } = await db
    .from("inventory")
    .select("id,product_id,size,color,quantity")
    .eq("product_id", product.id);

  return {
    ...product,
    inventory: (inventory ?? []).map((entry) => ({
      ...entry,
      size: entry.size as Size,
    })),
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
  const db = await publicDb();
  const { data } = await db
    .from("products")
    .select("slug,created_at")
    .neq("status", "oculto");

  return data ?? [];
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
    colors: [...colors.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "es"),
    ),
    sizes: sortSizes([...sizes]),
  };
}

/* ── Checkout ────────────────────────────────────────────────── */

export interface RequestedLine {
  product_id: string;
  size: string;
  color: string;
  quantity: number;
}

export interface PricedCheckout {
  ok: boolean;
  items: OrderItem[];
  subtotal: number;
  error?: string;
}

/**
 * Reconstruye el pedido desde la base de datos.
 *
 * El carrito vive en el navegador, así que nombre, precio y existencia que
 * llegan del cliente son solo una propuesta: aquí se descartan y se vuelven
 * a leer del catálogo. Sin esto, cualquiera podría registrar un pedido con
 * el precio que quisiera o pedir más piezas de las que hay.
 */
export async function priceCheckout(
  lines: RequestedLine[],
): Promise<PricedCheckout> {
  const fail = (error: string): PricedCheckout => ({
    ok: false,
    items: [],
    subtotal: 0,
    error,
  });

  const ids = [...new Set(lines.map((l) => l.product_id))];
  if (!ids.length) return fail("Tu pedido está vacío.");

  const db = await publicDb();

  const [{ data: productRows }, { data: inventoryRows }] = await Promise.all([
    db.from("products").select(SELECT).in("id", ids),
    db
      .from("inventory")
      .select("product_id,size,color,quantity")
      .in("product_id", ids),
  ]);

  const products = new Map(
    ((productRows ?? []) as unknown as Row[])
      .map(mapRow)
      .map((p) => [p.id, p]),
  );

  const stock = new Map(
    (inventoryRows ?? []).map((entry) => [
      `${entry.product_id}__${entry.size}__${entry.color}`,
      entry.quantity as number,
    ]),
  );

  const items: OrderItem[] = [];

  for (const line of lines) {
    const product = products.get(line.product_id);

    // Un producto oculto no se puede pedir aunque quede en el carrito.
    if (!product || product.status === "oculto") {
      return fail("Uno de los productos ya no está disponible.");
    }

    const quantity = Math.floor(line.quantity);
    if (!Number.isFinite(quantity) || quantity < 1) {
      return fail(`Cantidad inválida en “${product.name}”.`);
    }

    const available =
      stock.get(`${line.product_id}__${line.size}__${line.color}`) ?? 0;

    if (available < quantity) {
      return fail(
        available === 0
          ? `“${product.name}” en talla ${line.size} y color ${line.color} se agotó.`
          : `De “${product.name}” talla ${line.size} solo quedan ${available}.`,
      );
    }

    items.push({
      product_id: product.id,
      name: product.name,
      sku: product.sku,
      size: line.size as Size,
      color: line.color,
      quantity,
      unit_price: product.price,
      image: product.images[0] ?? "",
    });
  }

  return {
    ok: true,
    items,
    subtotal: items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0),
  };
}

/* ── Administración ──────────────────────────────────────────── */
/* Usa la llave secreta: el panel necesita ver también los ocultos. */

export async function getAdminProducts(search?: string): Promise<Product[]> {
  const db = adminDb();

  let query = db
    .from("products")
    .select(SELECT)
    .order("created_at", { ascending: false });

  if (search) {
    const term = search.replace(/[%,()]/g, "");
    query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`No se pudo leer el catálogo: ${error.message}`);

  return (data as unknown as Row[]).map(mapRow);
}

/** SKU que ya existen, para calcular el siguiente consecutivo libre. */
export async function getUsedSkus(): Promise<string[]> {
  const db = adminDb();
  const { data } = await db.from("products").select("sku");
  return (data ?? []).map((row) => row.sku as string);
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = adminDb();
  const { data } = await db
    .from("products")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();

  return data ? mapRow(data as unknown as Row) : null;
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
  /**
   * Existencias por variante, con clave `talla__color`.
   * Permite capturar el inventario en el mismo formulario del producto,
   * en vez de guardar primero y pasar después por la pantalla aparte.
   */
  stock?: Record<string, number>;
}

/** Columnas de `products`. `stock` se omite: lo calcula el trigger. */
function toRow(input: ProductInput) {
  return {
    name: input.name,
    slug: slugify(input.slug || input.name),
    description: input.description,
    features: input.features,
    material: input.material,
    price: input.price,
    old_price: input.old_price,
    sku: input.sku,
    images: input.images,
    video: input.video,
    category_id: input.category_id,
    fit: input.fit,
    sizes: input.sizes,
    colors: input.colors,
    featured: input.featured,
    status: input.status,
  };
}

/** Crea el producto y sus variantes de inventario en cero. */
export async function createProduct(input: ProductInput): Promise<boolean> {
  const db = adminDb();

  const { data, error } = await db
    .from("products")
    .insert(toRow(input))
    .select("id")
    .single();

  if (error || !data) return false;

  await syncVariants(data.id as string, input.sizes, input.colors, input.stock);
  return true;
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<boolean> {
  const db = adminDb();

  const { error } = await db.from("products").update(toRow(input)).eq("id", id);
  if (error) return false;

  await syncVariants(id, input.sizes, input.colors, input.stock);
  return true;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = adminDb();
  // El inventario se borra en cascada (ON DELETE CASCADE).
  const { error } = await db.from("products").delete().eq("id", id);
  return !error;
}

/** Alterna entre activo y oculto sin abrir el formulario. */
export async function toggleProductVisibility(id: string): Promise<boolean> {
  const db = adminDb();

  const { data } = await db
    .from("products")
    .select("status,stock")
    .eq("id", id)
    .maybeSingle();

  if (!data) return false;

  const next =
    data.status === "oculto" ? (data.stock > 0 ? "activo" : "agotado") : "oculto";

  const { error } = await db
    .from("products")
    .update({ status: next })
    .eq("id", id);

  return !error;
}

/**
 * Crea las variantes que falten y borra las que ya no aplican.
 * Conserva las cantidades de las combinaciones que siguen existiendo.
 */
async function syncVariants(
  productId: string,
  sizes: Size[],
  colors: ProductColor[],
  stock?: Record<string, number>,
) {
  const db = adminDb();

  const { data: current } = await db
    .from("inventory")
    .select("id,size,color")
    .eq("product_id", productId);

  const wanted = new Set(
    sizes.flatMap((size) => colors.map((color) => `${size}__${color.name}`)),
  );

  const obsolete = (current ?? [])
    .filter((entry) => !wanted.has(`${entry.size}__${entry.color}`))
    .map((entry) => entry.id);

  if (obsolete.length) {
    await db.from("inventory").delete().in("id", obsolete);
  }

  const existing = new Set(
    (current ?? []).map((entry) => `${entry.size}__${entry.color}`),
  );

  const cantidad = (size: Size, color: string) =>
    Math.max(0, Math.floor(stock?.[`${size}__${color}`] ?? 0));

  const missing = sizes.flatMap((size) =>
    colors
      .filter((color) => !existing.has(`${size}__${color.name}`))
      .map((color) => ({
        product_id: productId,
        size,
        color: color.name,
        quantity: cantidad(size, color.name),
      })),
  );

  if (missing.length) {
    await db.from("inventory").insert(missing);
  }

  // Variantes que ya existían: se actualizan solo si el formulario trajo
  // una cantidad para ellas. Así, editar un producto sin tocar el stock no
  // lo pisa con ceros.
  if (stock) {
    const porActualizar = (current ?? []).filter((entry) => {
      const key = `${entry.size}__${entry.color}`;
      return key in stock && wanted.has(key);
    });

    for (const entry of porActualizar) {
      await db
        .from("inventory")
        .update({ quantity: cantidad(entry.size as Size, entry.color) })
        .eq("id", entry.id);
    }
  }
}
