import Link from "next/link";
import { MapPin, MessageCircle, StickyNote } from "lucide-react";
import {
  AdminPage,
  EmptyState,
  Panel,
} from "@/features/admin/components/AdminUI";
import { SearchBox } from "@/features/admin/components/SearchBox";
import { OrderDetailsForm } from "@/features/admin/components/OrderDetailsForm";
import { Badge } from "@/components/ui/Badge";
import { updateOrderStatusAction } from "@/features/admin/actions";
import { getOrders } from "@/services/orders.service";
import { ORDER_STATUS_LABELS } from "@/lib/config";
import type { OrderStatus } from "@/types";
import { cn, formatAmount, formatDateTime } from "@/utils";

export const dynamic = "force-dynamic";

const STATUSES: OrderStatus[] = [
  "pendiente",
  "confirmado",
  "pagado",
  "entregado",
  "cancelado",
];

function toneFor(status: OrderStatus) {
  if (status === "pendiente") return "warning" as const;
  if (status === "cancelado") return "danger" as const;
  if (status === "entregado") return "success" as const;
  return "aura" as const;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string }>;
}) {
  const { estado, q } = await searchParams;
  const filter = STATUSES.includes(estado as OrderStatus)
    ? (estado as OrderStatus)
    : undefined;

  const orders = await getOrders({ status: filter, search: q });

  return (
    <AdminPage
      title="Pedidos"
      description="Los pedidos llegan por WhatsApp. Aquí confirmas, registras el punto de encuentro y cierras la venta."
    >
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/pedidos"
            className={cn(
              "rounded-full border px-4 py-2 text-xs transition-colors",
              !filter
                ? "border-aura bg-aura/10 text-aura"
                : "border-white/10 text-mist hover:text-white",
            )}
          >
            Todos
          </Link>
          {STATUSES.map((status) => (
            <Link
              key={status}
              href={`/admin/pedidos?estado=${status}`}
              className={cn(
                "rounded-full border px-4 py-2 text-xs transition-colors",
                filter === status
                  ? "border-aura bg-aura/10 text-aura"
                  : "border-white/10 text-mist hover:text-white",
              )}
            >
              {ORDER_STATUS_LABELS[status]}
            </Link>
          ))}
        </div>

        <SearchBox placeholder="Buscar cliente, teléfono o pedido…" />
      </div>

      {orders.length === 0 ? (
        <Panel>
          <EmptyState message="No hay pedidos con ese filtro." />
        </Panel>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Panel key={order.id}>
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tabular text-xs text-silver">
                        {order.order_number}
                      </span>
                      <Badge tone={toneFor(order.status)}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                    <h2 className="mt-1.5 text-lg font-medium text-white">
                      {order.customer_name}
                    </h2>
                    <a
                      href={`https://wa.me/52${order.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1.5 text-sm text-mist transition-colors hover:text-aura"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {order.phone}
                    </a>
                    <p className="mt-1 text-xs text-mist">
                      {formatDateTime(order.created_at)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="tabular text-xl font-semibold text-white">
                      {formatAmount(order.total)}
                    </p>
                    {order.discount > 0 ? (
                      <p className="tabular text-xs text-success">
                        −{formatAmount(order.discount)}
                        {order.coupon_code ? ` · ${order.coupon_code}` : ""}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Artículos */}
                <ul className="mt-5 space-y-2 rounded-xl bg-white/3 px-4 py-3">
                  {order.items.map((item, index) => (
                    <li
                      key={`${order.id}-${index}`}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 text-mist">
                        <span className="text-white">{item.quantity}×</span>{" "}
                        {item.name}{" "}
                        <span className="text-xs">
                          · {item.size} · {item.color}
                        </span>
                      </span>
                      <span className="tabular shrink-0 text-mist">
                        {formatAmount(item.unit_price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Punto de encuentro y notas */}
                {order.meeting_point || order.notes ? (
                  <div className="mt-4 space-y-2">
                    {order.meeting_point ? (
                      <p className="flex items-start gap-2 text-sm text-silver">
                        <MapPin
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-aura"
                          aria-hidden
                        />
                        {order.meeting_point}
                      </p>
                    ) : null}
                    {order.notes ? (
                      <p className="flex items-start gap-2 text-sm text-mist">
                        <StickyNote
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          aria-hidden
                        />
                        {order.notes}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {/* Acciones */}
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/8 pt-4">
                  <form
                    action={updateOrderStatusAction}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="id" value={order.id} />
                    <label
                      htmlFor={`status-${order.id}`}
                      className="text-xs uppercase tracking-[0.14em] text-mist"
                    >
                      Estado
                    </label>
                    <select
                      id={`status-${order.id}`}
                      name="status"
                      defaultValue={order.status}
                      className="rounded-lg border border-white/10 bg-steel px-3 py-2 text-xs text-white focus:border-aura/60 focus:outline-none"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {ORDER_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-lg border border-white/12 px-3 py-2 text-xs text-mist transition-colors hover:border-aura hover:text-aura"
                    >
                      Guardar
                    </button>
                  </form>
                </div>

                <details className="mt-3">
                  <summary className="cursor-pointer text-xs uppercase tracking-[0.14em] text-aura hover:underline">
                    Punto de encuentro y notas
                  </summary>
                  <div className="mt-4">
                    <OrderDetailsForm order={order} />
                  </div>
                </details>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </AdminPage>
  );
}
