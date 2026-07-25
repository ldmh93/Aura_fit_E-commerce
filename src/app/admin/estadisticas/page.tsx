import {
  AdminPage,
  DashboardCard,
  EmptyState,
  MiniBar,
  Panel,
  Td,
  Th,
} from "@/features/admin/components/AdminUI";
import {
  CategoryChart,
  MonthlyChart,
  RevenueChart,
} from "@/features/admin/components/charts";
import { getDashboardStats } from "@/services/orders.service";
import { ORDER_STATUS_LABELS } from "@/lib/config";
import { formatAmount, formatPrice } from "@/utils";

export const dynamic = "force-dynamic";

export default async function AdminStatsPage() {
  const stats = await getDashboardStats();

  const maxUnits = Math.max(1, ...stats.topProducts.map((p) => p.units));
  const totalOrders = stats.ordersByStatus.reduce((sum, s) => sum + s.count, 0);
  const delivered =
    stats.ordersByStatus.find((s) => s.status === "entregado")?.count ?? 0;
  const cancelled =
    stats.ordersByStatus.find((s) => s.status === "cancelado")?.count ?? 0;

  const conversion = totalOrders
    ? Math.round((delivered / totalOrders) * 100)
    : 0;
  const cancellation = totalOrders
    ? Math.round((cancelled / totalOrders) * 100)
    : 0;

  return (
    <AdminPage
      title="Estadísticas"
      description="Cómo se está moviendo la tienda. Solo cuentan como venta los pedidos pagados y entregados."
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <DashboardCard
          label="Ventas del mes"
          value={formatPrice(stats.revenueMonth)}
          hint="Mes en curso"
          tone="aura"
        />
        <DashboardCard
          label="Mes anterior"
          value={formatPrice(stats.revenuePrevMonth)}
          hint="Para comparar"
        />
        <DashboardCard
          label="Pedidos entregados"
          value={`${conversion}%`}
          hint={`${delivered} de ${totalOrders} pedidos`}
          tone="success"
        />
        <DashboardCard
          label="Cancelados"
          value={`${cancellation}%`}
          hint={`${cancelled} de ${totalOrders} pedidos`}
          tone={cancellation > 15 ? "danger" : "default"}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel
          title="Ingresos por mes"
          description="Últimos 6 meses"
        >
          <MonthlyChart data={stats.revenueByMonth} />
        </Panel>

        <Panel title="Ingresos por día" description="Últimos 14 días">
          <RevenueChart data={stats.revenueByDay} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Ventas por categoría">
          <CategoryChart data={stats.salesByCategory} />
          {stats.salesByCategory.length ? (
            <ul className="space-y-2 border-t border-white/8 px-5 py-4">
              {stats.salesByCategory.map((row) => (
                <li
                  key={row.category}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-mist">{row.category}</span>
                  <span className="tabular text-white">
                    {formatAmount(row.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </Panel>

        <Panel title="Productos más vendidos" className="lg:col-span-2">
          {stats.topProducts.length === 0 ? (
            <EmptyState message="Todavía no hay ventas registradas." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-lg">
                <thead className="border-b border-white/8">
                  <tr>
                    <Th>Producto</Th>
                    <Th>Piezas</Th>
                    <Th>Ingresos</Th>
                    <Th>Peso</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {stats.topProducts.map((product) => (
                    <tr key={product.name}>
                      <Td className="text-white">{product.name}</Td>
                      <Td className="tabular text-mist">{product.units}</Td>
                      <Td className="tabular text-silver">
                        {formatAmount(product.revenue)}
                      </Td>
                      <Td className="w-32">
                        <MiniBar value={product.units} max={maxUnits} />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Pedidos por estado" className="mt-4">
        <ul className="grid gap-px bg-white/6 sm:grid-cols-3 lg:grid-cols-5">
          {stats.ordersByStatus.map((row) => (
            <li key={row.status} className="bg-graphite px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-mist">
                {ORDER_STATUS_LABELS[row.status]}
              </p>
              <p className="tabular mt-2 text-xl font-semibold text-white">
                {row.count}
              </p>
            </li>
          ))}
        </ul>
      </Panel>
    </AdminPage>
  );
}
