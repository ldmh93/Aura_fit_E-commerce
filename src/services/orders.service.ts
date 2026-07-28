import { adminDb } from "@/services/db";
import { getInventoryOverview } from "@/services/inventory.service";
import type {
  DashboardStats,
  Order,
  OrderItem,
  OrderStatus,
  Product,
} from "@/types";

/**
 * Pedidos. Llegan por WhatsApp y se administran desde /admin/pedidos.
 *
 * Todo pasa por la llave secreta: los pedidos llevan datos de clientes y
 * RLS los oculta al público a propósito.
 */

const SELECT =
  "id,order_number,customer_name,phone,items,subtotal,discount,total,coupon_code,status,meeting_point,notes,created_at";

/** Estados que cuentan como venta cerrada. */
const PAID: OrderStatus[] = ["pagado", "entregado"];

function mapRow(row: Record<string, unknown>): Order {
  return {
    ...(row as unknown as Order),
    items: (row.items ?? []) as OrderItem[],
    subtotal: Number(row.subtotal ?? 0),
    discount: Number(row.discount ?? 0),
    total: Number(row.total ?? 0),
  };
}

export async function getOrders(options?: {
  status?: OrderStatus;
  search?: string;
}): Promise<Order[]> {
  const db = adminDb();

  let query = db
    .from("orders")
    .select(SELECT)
    .order("created_at", { ascending: false });

  if (options?.status) query = query.eq("status", options.status);

  if (options?.search) {
    const term = options.search.replace(/[%,()]/g, "");
    query = query.or(
      `customer_name.ilike.%${term}%,phone.ilike.%${term}%,order_number.ilike.%${term}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(`No se pudieron leer los pedidos: ${error.message}`);

  return (data ?? []).map(mapRow);
}

export interface NewOrder {
  customer_name: string;
  phone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon_code: string | null;
}

/**
 * Registra el pedido antes de abrir WhatsApp.
 * El cliente es anónimo, así que se usa la llave secreta desde el servidor.
 * Devuelve el número de pedido, o null si no se pudo guardar: el pedido por
 * WhatsApp debe salir igual aunque falle el registro.
 */
export async function createOrder(order: NewOrder): Promise<string | null> {
  try {
    const db = adminDb();
    const { data, error } = await db
      .from("orders")
      .insert({ ...order, status: "pendiente" })
      .select("order_number")
      .single();

    if (error || !data) return null;
    return data.order_number as string;
  } catch {
    return null;
  }
}

/**
 * Cambia el estado y mueve el inventario en consecuencia.
 *
 * Confirmar un pedido aparta las piezas; cancelarlo o devolverlo a
 * pendiente las libera. Lo hace una función de Postgres para que estado e
 * inventario cambien juntos o no cambien: si se hiciera desde aquí en dos
 * pasos, un fallo entre ambos dejaría el stock descuadrado.
 *
 * Si la función todavía no está instalada (migración 0003), se cae al
 * cambio de estado simple para no dejar el panel inservible.
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<boolean> {
  const db = adminDb();

  const { error } = await db.rpc("set_order_status", {
    p_order_id: id,
    p_status: status,
  });

  if (!error) return true;

  // PGRST202: PostgREST no encuentra la función. 42883: Postgres tampoco.
  // Pasa mientras la migración 0003 no se haya ejecutado.
  const missingFunction =
    error.code === "PGRST202" ||
    error.code === "42883" ||
    /could not find the function|does not exist/i.test(error.message ?? "");

  if (missingFunction) {
    const fallback = await db.from("orders").update({ status }).eq("id", id);
    return !fallback.error;
  }

  return false;
}

/** Guarda el punto de encuentro acordado y las notas internas. */
export async function updateOrderDetails(
  id: string,
  details: { meeting_point?: string | null; notes?: string | null },
): Promise<boolean> {
  const db = adminDb();

  const payload: Record<string, string | null> = {};
  if (details.meeting_point !== undefined)
    payload.meeting_point = details.meeting_point || null;
  if (details.notes !== undefined) payload.notes = details.notes || null;

  if (!Object.keys(payload).length) return true;

  const { error } = await db.from("orders").update(payload).eq("id", id);
  return !error;
}

/* ── Estadísticas ────────────────────────────────────────────── */

const monthFormatter = new Intl.DateTimeFormat("es-MX", {
  month: "short",
  year: "2-digit",
});
const dayFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
});

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = adminDb();

  const [orders, overview] = await Promise.all([
    getOrders(),
    getInventoryOverview(),
  ]);
  const { summary: inventory, lowStock } = overview;

  const { data: productRows } = await db
    .from("products")
    .select("id,status,stock,category_id,categories(name)");

  type ProductRow = Pick<Product, "id" | "status" | "stock" | "category_id"> & {
    categories?: { name: string } | null;
  };

  const products = (productRows ?? []) as unknown as ProductRow[];
  const categoryOf = new Map(
    products.map((p) => [p.id, p.categories?.name ?? "Sin categoría"]),
  );

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const inRange = (order: Order, from: Date, to?: Date) => {
    const date = new Date(order.created_at);
    return date >= from && (!to || date < to);
  };

  const paidOrders = orders.filter((o) => PAID.includes(o.status));
  const monthOrders = orders.filter((o) => inRange(o, monthStart));
  const monthPaid = paidOrders.filter((o) => inRange(o, monthStart));
  const prevPaid = paidOrders.filter((o) =>
    inRange(o, prevMonthStart, monthStart),
  );

  const revenueMonth = monthPaid.reduce((sum, o) => sum + o.total, 0);
  const unitsSoldMonth = monthPaid.reduce(
    (sum, o) => sum + o.items.reduce((n, item) => n + item.quantity, 0),
    0,
  );

  const revenueByDay = Array.from({ length: 14 }, (_, index) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (13 - index));
    const key = day.toISOString().slice(0, 10);
    return {
      date: dayFormatter.format(day),
      total: paidOrders
        .filter((o) => o.created_at.slice(0, 10) === key)
        .reduce((sum, o) => sum + o.total, 0),
    };
  });

  const revenueByMonth = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    return {
      month: monthFormatter.format(month),
      total: paidOrders
        .filter((o) => inRange(o, month, next))
        .reduce((sum, o) => sum + o.total, 0),
    };
  });

  const statuses: OrderStatus[] = [
    "pendiente",
    "confirmado",
    "pagado",
    "entregado",
    "cancelado",
  ];

  const byProduct = new Map<string, { units: number; revenue: number }>();
  const byCategory = new Map<string, { units: number; revenue: number }>();

  for (const order of paidOrders) {
    for (const item of order.items) {
      const product = byProduct.get(item.name) ?? { units: 0, revenue: 0 };
      product.units += item.quantity;
      product.revenue += item.quantity * item.unit_price;
      byProduct.set(item.name, product);

      const categoryName = categoryOf.get(item.product_id) ?? "Sin categoría";
      const category = byCategory.get(categoryName) ?? { units: 0, revenue: 0 };
      category.units += item.quantity;
      category.revenue += item.quantity * item.unit_price;
      byCategory.set(categoryName, category);
    }
  }

  return {
    revenueMonth,
    revenuePrevMonth: prevPaid.reduce((sum, o) => sum + o.total, 0),
    ordersMonth: monthOrders.length,
    ordersPending: orders.filter((o) => o.status === "pendiente").length,
    averageTicket: monthPaid.length
      ? Math.round(revenueMonth / monthPaid.length)
      : 0,
    unitsSoldMonth,
    activeProducts: products.filter((p) => p.status === "activo").length,
    hiddenProducts: products.filter((p) => p.status === "oculto").length,
    outOfStockProducts: products.filter((p) => p.stock <= 0).length,
    lowStockVariants: lowStock.filter((row) => row.quantity > 0).length,
    inventoryUnits: inventory.units,
    inventoryValue: inventory.value,
    revenueByDay,
    revenueByMonth,
    ordersByStatus: statuses.map((status) => ({
      status,
      count: orders.filter((o) => o.status === status).length,
    })),
    salesByCategory: [...byCategory.entries()]
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.revenue - a.revenue),
    topProducts: [...byProduct.entries()]
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 6),
  };
}
