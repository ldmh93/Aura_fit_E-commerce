import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { mockOrders } from "@/lib/mock-data";
import type { DashboardStats, Order, OrderItem, OrderStatus } from "@/types";

const ORDER_SELECT =
  "id,order_number,customer_name,phone,items,subtotal,discount,total,coupon_code,status,notes,created_at";

export async function getOrders(status?: OrderStatus): Promise<Order[]> {
  const supabase = isSupabaseConfigured ? await createServerSupabase() : null;

  if (!supabase) {
    const orders = status
      ? mockOrders.filter((o) => o.status === status)
      : mockOrders;
    return [...orders].sort(
      (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
    );
  }

  let query = supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data } = await query;
  return (data ?? []) as Order[];
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
 * Se usa el cliente admin porque el cliente final no está autenticado.
 * Devuelve el número de pedido, o null si no hay backend configurado.
 */
export async function createOrder(order: NewOrder): Promise<string | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("orders")
    .insert({ ...order, status: "pendiente" })
    .select("order_number")
    .single();

  if (error || !data) return null;
  return data.order_number as string;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<boolean> {
  const supabase = isSupabaseConfigured ? await createServerSupabase() : null;

  if (!supabase) {
    const order = mockOrders.find((o) => o.id === id);
    if (order) order.status = status;
    return Boolean(order);
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  return !error;
}

/** Métricas del dashboard, calculadas sobre los pedidos del mes en curso. */
export async function getDashboardStats(
  activeProducts: number,
  outOfStockProducts: number,
  lowStockVariants: number,
): Promise<DashboardStats> {
  const orders = await getOrders();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const paidStatuses: OrderStatus[] = ["pagado", "enviado", "finalizado"];
  const monthOrders = orders.filter((o) => new Date(o.created_at) >= monthStart);
  const monthPaid = monthOrders.filter((o) => paidStatuses.includes(o.status));

  const revenueByDay = Array.from({ length: 14 }, (_, index) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (13 - index));
    const key = day.toISOString().slice(0, 10);
    const total = orders
      .filter(
        (o) =>
          paidStatuses.includes(o.status) && o.created_at.slice(0, 10) === key,
      )
      .reduce((sum, o) => sum + Number(o.total), 0);
    return {
      date: new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "short",
      }).format(day),
      total,
    };
  });

  const statuses: OrderStatus[] = [
    "pendiente",
    "confirmado",
    "pagado",
    "enviado",
    "finalizado",
    "cancelado",
  ];

  const unitsByProduct = new Map<string, number>();
  for (const order of orders) {
    for (const item of order.items ?? []) {
      unitsByProduct.set(
        item.name,
        (unitsByProduct.get(item.name) ?? 0) + item.quantity,
      );
    }
  }

  return {
    monthRevenue: monthPaid.reduce((sum, o) => sum + Number(o.total), 0),
    monthOrders: monthOrders.length,
    activeProducts,
    outOfStockProducts,
    pendingOrders: orders.filter((o) => o.status === "pendiente").length,
    lowStockVariants,
    revenueByDay,
    ordersByStatus: statuses.map((status) => ({
      status,
      count: orders.filter((o) => o.status === status).length,
    })),
    topProducts: [...unitsByProduct.entries()]
      .map(([name, units]) => ({ name, units }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 5),
  };
}
