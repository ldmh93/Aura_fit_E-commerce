import { mockCategories, mockOrders, mockProducts } from "@/lib/mock-data";
import { getInventorySummary, getLowStockRows } from "@/services/inventory.service";
import type { DashboardStats, Order, OrderItem, OrderStatus } from "@/types";

/** Pedidos. Llegan por WhatsApp y se administran desde /admin/pedidos. */

/** Estados que cuentan como venta cerrada. */
const PAID: OrderStatus[] = ["pagado", "entregado"];

export async function getOrders(options?: {
  status?: OrderStatus;
  search?: string;
}): Promise<Order[]> {
  let orders = [...mockOrders];

  if (options?.status) {
    orders = orders.filter((o) => o.status === options.status);
  }

  if (options?.search) {
    const term = options.search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.customer_name.toLowerCase().includes(term) ||
        o.phone.includes(term) ||
        o.order_number.toLowerCase().includes(term),
    );
  }

  return orders.sort(
    (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
  );
}

export async function getOrderById(id: string): Promise<Order | null> {
  return mockOrders.find((o) => o.id === id) ?? null;
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

/** Registra el pedido antes de abrir WhatsApp. Devuelve el número. */
export async function createOrder(order: NewOrder): Promise<string> {
  const next = mockOrders.length + 121;
  const orderNumber = `AF-${String(next).padStart(6, "0")}`;

  mockOrders.unshift({
    ...order,
    id: `ord-${Date.now()}`,
    order_number: orderNumber,
    status: "pendiente",
    meeting_point: null,
    notes: null,
    created_at: new Date().toISOString(),
  });

  return orderNumber;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<boolean> {
  const order = mockOrders.find((o) => o.id === id);
  if (!order) return false;

  order.status = status;
  return true;
}

/** Guarda el punto de encuentro acordado y las notas internas. */
export async function updateOrderDetails(
  id: string,
  details: { meeting_point?: string | null; notes?: string | null },
): Promise<boolean> {
  const order = mockOrders.find((o) => o.id === id);
  if (!order) return false;

  if (details.meeting_point !== undefined) {
    order.meeting_point = details.meeting_point || null;
  }
  if (details.notes !== undefined) {
    order.notes = details.notes || null;
  }

  return true;
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
  const orders = await getOrders();
  const [inventory, lowStock] = await Promise.all([
    getInventorySummary(),
    getLowStockRows(),
  ]);

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

  // Ingresos por día — últimos 14 días
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

  // Ingresos por mes — últimos 6 meses
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

  // Ventas por producto y por categoría
  const byProduct = new Map<string, { units: number; revenue: number }>();
  const byCategory = new Map<string, { units: number; revenue: number }>();

  for (const order of paidOrders) {
    for (const item of order.items) {
      const product = byProduct.get(item.name) ?? { units: 0, revenue: 0 };
      product.units += item.quantity;
      product.revenue += item.quantity * item.unit_price;
      byProduct.set(item.name, product);

      const catalogEntry = mockProducts.find((p) => p.id === item.product_id);
      const categoryName =
        mockCategories.find((c) => c.id === catalogEntry?.category_id)?.name ??
        "Sin categoría";

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
    activeProducts: mockProducts.filter((p) => p.status === "activo").length,
    hiddenProducts: mockProducts.filter((p) => p.status === "oculto").length,
    outOfStockProducts: mockProducts.filter((p) => p.stock <= 0).length,
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
