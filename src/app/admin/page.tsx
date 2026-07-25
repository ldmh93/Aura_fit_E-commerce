import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  Clock,
  Package,
  TrendingUp,
} from "lucide-react";
import {
  AdminPage,
  DashboardCard,
  EmptyState,
  Panel,
  Td,
  Th,
} from "@/features/admin/components/AdminUI";
import {
  RevenueChart,
  TopProductsChart,
} from "@/features/admin/components/DashboardCharts";
import { Badge } from "@/components/ui/Badge";
import { getAdminProducts } from "@/services/products.service";
import { getDashboardStats, getOrders } from "@/services/orders.service";
import { getLowStockRows } from "@/services/inventory.service";
import { ORDER_STATUS_LABELS } from "@/lib/config";
import { formatAmount, formatDate, formatPrice } from "@/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [products, lowStock, orders] = await Promise.all([
    getAdminProducts(),
    getLowStockRows(),
    getOrders(),
  ]);

  const activeProducts = products.filter((p) => p.status === "activo").length;
  const outOfStock = products.filter((p) => p.stock <= 0).length;

  const stats = await getDashboardStats(
    activeProducts,
    outOfStock,
    lowStock.filter((row) => row.quantity > 0).length,
  );

  const recentOrders = orders.slice(0, 6);

  return (
    <AdminPage
      title="Dashboard"
      description="Resumen de la operación de AURA FIT."
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <DashboardCard
          label="Ventas del mes"
          value={formatPrice(stats.monthRevenue)}
          hint={`${stats.monthOrders} pedidos en el mes`}
          tone="aura"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <DashboardCard
          label="Productos activos"
          value={stats.activeProducts}
          hint={`${products.length} en catálogo`}
          icon={<Package className="h-4 w-4" />}
        />
        <DashboardCard
          label="Productos agotados"
          value={stats.outOfStockProducts}
          tone={stats.outOfStockProducts > 0 ? "danger" : "success"}
          hint="Sin existencia en ninguna variante"
          icon={<Boxes className="h-4 w-4" />}
        />
        <DashboardCard
          label="Pedidos pendientes"
          value={stats.pendingOrders}
          tone={stats.pendingOrders > 0 ? "warning" : "default"}
          hint="Esperan confirmación"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Ingresos · últimos 14 días" className="lg:col-span-2">
          <RevenueChart data={stats.revenueByDay} />
        </Panel>

        <Panel title="Pedidos por estado">
          <ul className="divide-y divide-white/6">
            {stats.ordersByStatus.map((row) => (
              <li
                key={row.status}
                className="flex items-center justify-between px-5 py-3.5 text-sm"
              >
                <span className="text-mist">
                  {ORDER_STATUS_LABELS[row.status]}
                </span>
                <span className="tabular font-medium text-white">
                  {row.count}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Más vendidos">
          <TopProductsChart data={stats.topProducts} />
        </Panel>

        <Panel
          title="Alertas de inventario"
          action={
            <Link
              href="/admin/inventario"
              className="text-[11px] uppercase tracking-[0.14em] text-aura hover:underline"
            >
              Ver todo
            </Link>
          }
        >
          {lowStock.length === 0 ? (
            <EmptyState message="Todo el inventario está en niveles saludables." />
          ) : (
            <ul className="max-h-64 divide-y divide-white/6 overflow-y-auto">
              {lowStock.slice(0, 8).map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-4 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">
                      {row.product_name}
                    </p>
                    <p className="text-xs text-mist">
                      {row.size} · {row.color}
                    </p>
                  </div>
                  {row.quantity === 0 ? (
                    <Badge tone="danger">
                      <AlertTriangle className="h-3 w-3" />
                      Agotado
                    </Badge>
                  ) : (
                    <Badge tone="warning">{row.quantity} pzas</Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel
        title="Pedidos recientes"
        className="mt-6"
        action={
          <Link
            href="/admin/pedidos"
            className="text-[11px] uppercase tracking-[0.14em] text-aura hover:underline"
          >
            Ver todos
          </Link>
        }
      >
        {recentOrders.length === 0 ? (
          <EmptyState message="Aún no hay pedidos registrados." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-2xl">
              <thead className="border-b border-white/8">
                <tr>
                  <Th>Pedido</Th>
                  <Th>Cliente</Th>
                  <Th>Fecha</Th>
                  <Th>Total</Th>
                  <Th>Estado</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <Td className="tabular text-silver">
                      {order.order_number}
                    </Td>
                    <Td className="text-white">{order.customer_name}</Td>
                    <Td className="text-mist">{formatDate(order.created_at)}</Td>
                    <Td className="tabular text-white">
                      {formatAmount(order.total)}
                    </Td>
                    <Td>
                      <Badge
                        tone={
                          order.status === "pendiente"
                            ? "warning"
                            : order.status === "cancelado"
                              ? "danger"
                              : order.status === "finalizado"
                                ? "success"
                                : "aura"
                        }
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </AdminPage>
  );
}
