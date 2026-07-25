import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  Clock,
  Package,
  Plus,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  AdminPage,
  DashboardCard,
  EmptyState,
  MiniBar,
  Panel,
  Td,
  Th,
} from "@/features/admin/components/AdminUI";
import { RevenueChart } from "@/features/admin/components/charts";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { getDashboardStats, getOrders } from "@/services/orders.service";
import { getLowStockRows } from "@/services/inventory.service";
import { ORDER_STATUS_LABELS } from "@/lib/config";
import { formatAmount, formatDate, formatPrice } from "@/utils";

export const dynamic = "force-dynamic";

function deltaPercent(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export default async function AdminDashboardPage() {
  const [stats, lowStock, orders] = await Promise.all([
    getDashboardStats(),
    getLowStockRows(),
    getOrders(),
  ]);

  const recentOrders = orders.slice(0, 5);
  const maxUnits = Math.max(1, ...stats.topProducts.map((p) => p.units));

  return (
    <AdminPage
      title="Dashboard"
      description="Resumen de la operación de AURA FIT."
      action={
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/admin/productos/nuevo" variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Nuevo producto
          </LinkButton>
          <LinkButton href="/admin/pedidos" variant="secondary" size="sm">
            Ver pedidos
          </LinkButton>
        </div>
      }
    >
      {/* Avisos que requieren acción */}
      {stats.ordersPending > 0 || lowStock.length > 0 ? (
        <div className="mb-6 grid gap-3 md:grid-cols-2">
          {stats.ordersPending > 0 ? (
            <Link
              href="/admin/pedidos?estado=pendiente"
              className="flex items-center gap-3 rounded-xl border border-warning/25 bg-warning/5 px-4 py-3 transition-colors hover:border-warning/50"
            >
              <Clock className="h-4 w-4 shrink-0 text-warning" aria-hidden />
              <p className="text-sm text-silver">
                <span className="font-medium text-white">
                  {stats.ordersPending}
                </span>{" "}
                {stats.ordersPending === 1
                  ? "pedido pendiente por confirmar"
                  : "pedidos pendientes por confirmar"}
              </p>
            </Link>
          ) : null}

          {lowStock.length > 0 ? (
            <Link
              href="/admin/inventario"
              className="flex items-center gap-3 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 transition-colors hover:border-danger/50"
            >
              <AlertTriangle
                className="h-4 w-4 shrink-0 text-danger"
                aria-hidden
              />
              <p className="text-sm text-silver">
                <span className="font-medium text-white">
                  {lowStock.length}
                </span>{" "}
                {lowStock.length === 1
                  ? "variante necesita reposición"
                  : "variantes necesitan reposición"}
              </p>
            </Link>
          ) : null}
        </div>
      ) : null}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <DashboardCard
          label="Ventas del mes"
          value={formatPrice(stats.revenueMonth)}
          delta={deltaPercent(stats.revenueMonth, stats.revenuePrevMonth)}
          hint="vs. mes anterior"
          tone="aura"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <DashboardCard
          label="Pedidos del mes"
          value={stats.ordersMonth}
          hint={`${stats.unitsSoldMonth} piezas vendidas`}
          icon={<Receipt className="h-4 w-4" />}
        />
        <DashboardCard
          label="Ticket promedio"
          value={formatPrice(stats.averageTicket)}
          hint="Pedidos pagados del mes"
          icon={<Wallet className="h-4 w-4" />}
        />
        <DashboardCard
          label="Valor del inventario"
          value={formatPrice(stats.inventoryValue)}
          hint={`${stats.inventoryUnits} piezas en existencia`}
          icon={<Boxes className="h-4 w-4" />}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <DashboardCard
          label="Productos activos"
          value={stats.activeProducts}
          hint={`${stats.hiddenProducts} ocultos`}
          icon={<Package className="h-4 w-4" />}
        />
        <DashboardCard
          label="Agotados"
          value={stats.outOfStockProducts}
          tone={stats.outOfStockProducts > 0 ? "danger" : "success"}
          hint="Sin ninguna variante"
        />
        <DashboardCard
          label="Stock bajo"
          value={stats.lowStockVariants}
          tone={stats.lowStockVariants > 0 ? "warning" : "success"}
          hint="Variantes por reponer"
        />
        <DashboardCard
          label="Pedidos pendientes"
          value={stats.ordersPending}
          tone={stats.ordersPending > 0 ? "warning" : "default"}
          hint="Esperan confirmación"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel
          title="Ingresos · últimos 14 días"
          className="lg:col-span-2"
          action={
            <Link
              href="/admin/estadisticas"
              className="text-[11px] uppercase tracking-[0.14em] text-aura hover:underline"
            >
              Más datos
            </Link>
          }
        >
          <RevenueChart data={stats.revenueByDay} />
        </Panel>

        <Panel title="Más vendidos">
          {stats.topProducts.length === 0 ? (
            <EmptyState message="Todavía no hay ventas registradas." />
          ) : (
            <ul className="space-y-4 p-5">
              {stats.topProducts.map((product) => (
                <li key={product.name}>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm text-white">
                      {product.name}
                    </span>
                    <span className="tabular shrink-0 text-xs text-mist">
                      {product.units} pzas
                    </span>
                  </div>
                  <MiniBar value={product.units} max={maxUnits} />
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
          <>
            <ul className="divide-y divide-white/6 md:hidden">
              {recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {order.customer_name}
                    </p>
                    <p className="tabular text-xs text-mist">
                      {order.order_number} · {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tabular text-sm text-white">
                      {formatAmount(order.total)}
                    </p>
                    <Badge
                      tone={
                        order.status === "pendiente"
                          ? "warning"
                          : order.status === "cancelado"
                            ? "danger"
                            : order.status === "entregado"
                              ? "success"
                              : "aura"
                      }
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
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
                      <Td className="text-mist">
                        {formatDate(order.created_at)}
                      </Td>
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
                                : order.status === "entregado"
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
          </>
        )}
      </Panel>
    </AdminPage>
  );
}
