import { AlertTriangle } from "lucide-react";
import {
  AdminPage,
  DashboardCard,
  EmptyState,
  Panel,
  Td,
  Th,
} from "@/features/admin/components/AdminUI";
import { Badge } from "@/components/ui/Badge";
import { updateInventoryAction } from "@/features/admin/actions";
import { getInventory } from "@/services/inventory.service";
import { BUSINESS } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const rows = await getInventory();

  const outOfStock = rows.filter((row) => row.quantity === 0);
  const lowStock = rows.filter(
    (row) => row.quantity > 0 && row.quantity <= BUSINESS.lowStockThreshold,
  );
  const totalUnits = rows.reduce((sum, row) => sum + row.quantity, 0);

  // Agrupa por producto para que la tabla se lea como el almacén real.
  const grouped = rows.reduce<Record<string, typeof rows>>((acc, row) => {
    const key = row.product_name;
    (acc[key] ??= []).push(row);
    return acc;
  }, {});

  return (
    <AdminPage
      title="Inventario"
      description={`Control por producto, talla y color. Alerta de stock bajo en ${BUSINESS.lowStockThreshold} unidades o menos.`}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <DashboardCard
          label="Unidades totales"
          value={totalUnits}
          hint={`${rows.length} variantes`}
        />
        <DashboardCard
          label="Stock bajo"
          value={lowStock.length}
          tone={lowStock.length ? "warning" : "success"}
          hint="Variantes por reponer"
        />
        <DashboardCard
          label="Sin existencia"
          value={outOfStock.length}
          tone={outOfStock.length ? "danger" : "success"}
          hint="Variantes en cero"
        />
      </div>

      {lowStock.length + outOfStock.length > 0 ? (
        <Panel title="Requiere atención" className="mt-6">
          <ul className="divide-y divide-white/6">
            {[...outOfStock, ...lowStock].slice(0, 10).map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-4 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">
                    {row.product_name}
                  </p>
                  <p className="text-xs text-mist">
                    {row.size} · {row.color} · {row.sku}
                  </p>
                </div>
                {row.quantity === 0 ? (
                  <Badge tone="danger">
                    <AlertTriangle className="h-3 w-3" />
                    Sin existencia
                  </Badge>
                ) : (
                  <Badge tone="warning">{row.quantity} pzas</Badge>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {rows.length === 0 ? (
        <Panel className="mt-6">
          <EmptyState message="No hay variantes de inventario todavía." />
        </Panel>
      ) : (
        <div className="mt-6 space-y-4">
          {Object.entries(grouped).map(([productName, variants]) => (
            <Panel key={productName} title={productName}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-lg">
                  <thead className="border-b border-white/8">
                    <tr>
                      <Th>Talla</Th>
                      <Th>Color</Th>
                      <Th>Existencia</Th>
                      <Th>Actualizar</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/6">
                    {variants.map((variant) => (
                      <tr key={variant.id}>
                        <Td className="font-medium text-white">
                          {variant.size}
                        </Td>
                        <Td className="text-mist">{variant.color}</Td>
                        <Td>
                          <span
                            className={
                              variant.quantity === 0
                                ? "tabular text-danger"
                                : variant.quantity <= BUSINESS.lowStockThreshold
                                  ? "tabular text-warning"
                                  : "tabular text-success"
                            }
                          >
                            {variant.quantity}
                          </span>
                        </Td>
                        <Td>
                          <form
                            action={updateInventoryAction}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="hidden"
                              name="id"
                              value={variant.id}
                            />
                            <input
                              type="number"
                              name="quantity"
                              min={0}
                              defaultValue={variant.quantity}
                              aria-label={`Cantidad de ${productName} talla ${variant.size} color ${variant.color}`}
                              className="tabular w-20 rounded-lg border border-white/10 bg-steel px-3 py-1.5 text-sm text-white focus:border-aura/60 focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="rounded-lg border border-white/12 px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-mist transition-colors hover:border-aura hover:text-aura"
                            >
                              Guardar
                            </button>
                          </form>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </AdminPage>
  );
}
