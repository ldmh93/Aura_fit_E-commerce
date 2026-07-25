import Link from "next/link";
import { MessageCircle } from "lucide-react";
import {
  AdminPage,
  EmptyState,
  Panel,
  Td,
  Th,
} from "@/features/admin/components/AdminUI";
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
  "enviado",
  "finalizado",
  "cancelado",
];

function toneFor(status: OrderStatus) {
  if (status === "pendiente") return "warning" as const;
  if (status === "cancelado") return "danger" as const;
  if (status === "finalizado") return "success" as const;
  return "aura" as const;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const filter = STATUSES.includes(estado as OrderStatus)
    ? (estado as OrderStatus)
    : undefined;

  const orders = await getOrders(filter);

  return (
    <AdminPage
      title="Pedidos"
      description="Los pedidos llegan por WhatsApp y se confirman manualmente."
    >
      {/* Filtro por estado */}
      <div className="mb-6 flex flex-wrap gap-2">
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

      <Panel>
        {orders.length === 0 ? (
          <EmptyState message="No hay pedidos con ese filtro." />
        ) : (
          <>
          {/* Móvil: tarjetas. Una tabla de 6 columnas no se lee en un celular. */}
          <ul className="divide-y divide-white/6 md:hidden">
            {orders.map((order) => (
              <li key={order.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="tabular text-xs text-silver">
                      {order.order_number}
                    </p>
                    <p className="truncate font-medium text-white">
                      {order.customer_name}
                    </p>
                    <a
                      href={`https://wa.me/${order.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1.5 text-xs text-mist transition-colors hover:text-aura"
                    >
                      <MessageCircle className="h-3 w-3" />
                      {order.phone}
                    </a>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tabular font-semibold text-white">
                      {formatAmount(order.total)}
                    </p>
                    <p className="text-[11px] text-mist">
                      {formatDateTime(order.created_at)}
                    </p>
                  </div>
                </div>

                <ul className="space-y-1 rounded-xl bg-white/3 px-3 py-2.5">
                  {order.items.map((item, index) => (
                    <li
                      key={`${order.id}-m-${index}`}
                      className="text-xs text-mist"
                    >
                      <span className="text-white">{item.quantity}×</span>{" "}
                      {item.name} · {item.size} · {item.color}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between gap-3">
                  <Badge tone={toneFor(order.status)}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                  <form
                    action={updateOrderStatusAction}
                    className="flex items-center gap-1.5"
                  >
                    <input type="hidden" name="id" value={order.id} />
                    <select
                      name="status"
                      defaultValue={order.status}
                      aria-label={`Cambiar estado del pedido ${order.order_number}`}
                      className="rounded-lg border border-white/10 bg-steel px-2 py-2 text-xs text-white focus:border-aura/60 focus:outline-none"
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
                      OK
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-4xl">
              <thead className="border-b border-white/8">
                <tr>
                  <Th>Pedido</Th>
                  <Th>Cliente</Th>
                  <Th>Artículos</Th>
                  <Th>Total</Th>
                  <Th>Fecha</Th>
                  <Th>Estado</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {orders.map((order) => (
                  <tr key={order.id} className="align-top hover:bg-white/2">
                    <Td className="tabular whitespace-nowrap text-silver">
                      {order.order_number}
                    </Td>
                    <Td>
                      <p className="whitespace-nowrap font-medium text-white">
                        {order.customer_name}
                      </p>
                      <a
                        href={`https://wa.me/${order.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 text-xs text-mist transition-colors hover:text-aura"
                      >
                        <MessageCircle className="h-3 w-3" />
                        {order.phone}
                      </a>
                    </Td>
                    <Td>
                      <ul className="space-y-1">
                        {order.items.map((item, index) => (
                          <li
                            key={`${order.id}-${index}`}
                            className="text-xs text-mist"
                          >
                            <span className="text-white">{item.quantity}×</span>{" "}
                            {item.name} · {item.size} · {item.color}
                          </li>
                        ))}
                      </ul>
                    </Td>
                    <Td className="whitespace-nowrap">
                      <p className="tabular font-medium text-white">
                        {formatAmount(order.total)}
                      </p>
                      {order.discount > 0 ? (
                        <p className="tabular text-xs text-success">
                          −{formatAmount(order.discount)}
                          {order.coupon_code ? ` · ${order.coupon_code}` : ""}
                        </p>
                      ) : null}
                    </Td>
                    <Td className="whitespace-nowrap text-xs text-mist">
                      {formatDateTime(order.created_at)}
                    </Td>
                    <Td>
                      <div className="space-y-2">
                        <Badge tone={toneFor(order.status)}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                        <form
                          action={updateOrderStatusAction}
                          className="flex items-center gap-1.5"
                        >
                          <input type="hidden" name="id" value={order.id} />
                          <select
                            name="status"
                            defaultValue={order.status}
                            aria-label={`Cambiar estado del pedido ${order.order_number}`}
                            className="rounded-lg border border-white/10 bg-steel px-2 py-1.5 text-xs text-white focus:border-aura/60 focus:outline-none"
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {ORDER_STATUS_LABELS[status]}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="rounded-lg border border-white/12 px-2.5 py-1.5 text-xs text-mist transition-colors hover:border-aura hover:text-aura"
                          >
                            OK
                          </button>
                        </form>
                      </div>
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
