import { AlertTriangle, Minus, Plus } from "lucide-react";
import {
  AdminPage,
  DashboardCard,
  EmptyState,
  Panel,
} from "@/features/admin/components/AdminUI";
import { SearchBox } from "@/features/admin/components/SearchBox";
import { Badge } from "@/components/ui/Badge";
import {
  adjustInventoryAction,
  updateInventoryAction,
} from "@/features/admin/actions";
import {
  getInventory,
  getInventorySummary,
  type InventoryRow,
} from "@/services/inventory.service";
import { getSettings } from "@/services/settings.service";
import { formatPrice } from "@/utils";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const [rows, summary, settings] = await Promise.all([
    getInventory(q),
    getInventorySummary(),
    getSettings(),
  ]);

  const threshold = settings.lowStockThreshold;
  const needsAttention = rows.filter((row) => row.quantity <= threshold);

  // Agrupado por producto: se lee como el almacén real.
  const grouped = rows.reduce<Record<string, InventoryRow[]>>((acc, row) => {
    (acc[row.product_name] ??= []).push(row);
    return acc;
  }, {});

  return (
    <AdminPage
      title="Inventario"
      description={`Existencias por producto, talla y color. Se marca stock bajo con ${threshold} piezas o menos.`}
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <DashboardCard
          label="Piezas totales"
          value={summary.units}
          hint={`${summary.variants} variantes`}
        />
        <DashboardCard
          label="Valor del inventario"
          value={formatPrice(summary.value)}
          hint="A precio de venta"
          tone="aura"
        />
        <DashboardCard
          label="Stock bajo"
          value={summary.lowStock}
          tone={summary.lowStock ? "warning" : "success"}
          hint="Por reponer"
        />
        <DashboardCard
          label="Sin existencia"
          value={summary.outOfStock}
          tone={summary.outOfStock ? "danger" : "success"}
          hint="Variantes en cero"
        />
      </div>

      {needsAttention.length > 0 && !q ? (
        <Panel
          title="Requiere reposición"
          description="Ordenado de menor a mayor existencia"
          className="mt-6"
        >
          <ul className="divide-y divide-white/6">
            {needsAttention.slice(0, 8).map((row) => (
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

      <div className="mt-6 mb-5">
        <SearchBox placeholder="Buscar producto, SKU o color…" />
      </div>

      {rows.length === 0 ? (
        <Panel>
          <EmptyState
            message={
              q
                ? `Ninguna variante coincide con “${q}”.`
                : "No hay variantes de inventario todavía."
            }
          />
        </Panel>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([productName, variants]) => {
            const total = variants.reduce((sum, v) => sum + v.quantity, 0);

            return (
              <Panel
                key={productName}
                title={productName}
                description={`${total} piezas · ${variants.length} variantes`}
              >
                <ul className="divide-y divide-white/6">
                  {variants.map((variant) => (
                    <li
                      key={variant.id}
                      className="flex flex-wrap items-center gap-3 px-4 py-3 sm:gap-4"
                    >
                      <div className="flex min-w-32 items-center gap-2">
                        <span className="rounded-lg border border-white/12 px-2.5 py-1 text-xs font-medium text-white">
                          {variant.size}
                        </span>
                        <span className="text-sm text-mist">
                          {variant.color}
                        </span>
                      </div>

                      <span
                        className={
                          variant.quantity === 0
                            ? "tabular w-16 text-sm text-danger"
                            : variant.quantity <= threshold
                              ? "tabular w-16 text-sm text-warning"
                              : "tabular w-16 text-sm text-success"
                        }
                      >
                        {variant.quantity} pzas
                      </span>

                      <div className="ml-auto flex items-center gap-2">
                        {/* Ajuste rápido de una pieza */}
                        <form action={adjustInventoryAction}>
                          <input type="hidden" name="id" value={variant.id} />
                          <input type="hidden" name="delta" value="-1" />
                          <button
                            type="submit"
                            disabled={variant.quantity === 0}
                            aria-label={`Quitar una pieza de ${productName} ${variant.size} ${variant.color}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 text-mist transition-colors hover:border-white/30 hover:text-white disabled:opacity-30"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                        </form>

                        <form action={adjustInventoryAction}>
                          <input type="hidden" name="id" value={variant.id} />
                          <input type="hidden" name="delta" value="1" />
                          <button
                            type="submit"
                            aria-label={`Agregar una pieza a ${productName} ${variant.size} ${variant.color}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 text-mist transition-colors hover:border-aura hover:text-aura"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </form>

                        {/* Cantidad exacta */}
                        <form
                          action={updateInventoryAction}
                          className="flex items-center gap-2"
                        >
                          <input type="hidden" name="id" value={variant.id} />
                          <input
                            type="number"
                            name="quantity"
                            min={0}
                            defaultValue={variant.quantity}
                            aria-label={`Cantidad exacta de ${productName} talla ${variant.size} color ${variant.color}`}
                            className="tabular w-20 rounded-lg border border-white/10 bg-steel px-3 py-1.5 text-sm text-white focus:border-aura/60 focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-white/12 px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-mist transition-colors hover:border-aura hover:text-aura"
                          >
                            Fijar
                          </button>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              </Panel>
            );
          })}
        </div>
      )}
    </AdminPage>
  );
}
