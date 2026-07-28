"use client";

import { useState, useTransition } from "react";
import { updateOrderStatusAction } from "@/features/admin/actions";
import { trackPurchase } from "@/lib/analytics";
import { ORDER_STATUS_LABELS } from "@/lib/config";
import type { Order, OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = [
  "pendiente",
  "confirmado",
  "pagado",
  "entregado",
  "cancelado",
];

/** Estados en los que la venta ya cuenta como cerrada. */
const PAID: OrderStatus[] = ["pagado", "entregado"];

/**
 * Cambio de estado del pedido.
 *
 * Al pasar a pagado dispara el evento Purchase, como pide
 * .claude/business-rules.md. Ojo con la limitación: se dispara desde el
 * navegador del administrador, así que la atribución es de este equipo y no
 * del cliente. Para atribución real haría falta la API de Conversiones de
 * Meta, que necesita un token aparte.
 */
export function OrderStatusForm({ order }: { order: Order }) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setMessage(null);

    startTransition(async () => {
      const result = await updateOrderStatusAction({ id: order.id, status });

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      // Solo al entrar a pagado, y solo una vez: si ya estaba cobrado,
      // volver a guardar no debe contar otra venta.
      if (PAID.includes(status) && !PAID.includes(order.status)) {
        trackPurchase(order.order_number, order.total);
      }

      setMessage("Guardado.");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label
        htmlFor={`status-${order.id}`}
        className="text-xs uppercase tracking-[0.14em] text-mist"
      >
        Estado
      </label>

      <select
        id={`status-${order.id}`}
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
        className="rounded-lg border border-white/10 bg-steel px-3 py-2 text-xs text-white focus:border-aura/60 focus:outline-none"
      >
        {STATUSES.map((option) => (
          <option key={option} value={option}>
            {ORDER_STATUS_LABELS[option]}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={save}
        disabled={pending || status === order.status}
        className="rounded-lg border border-white/12 px-3 py-2 text-xs text-mist transition-colors hover:border-aura hover:text-aura disabled:opacity-40"
      >
        {pending ? "Guardando…" : "Guardar"}
      </button>

      {message ? (
        <span
          className={
            message === "Guardado." ? "text-xs text-success" : "text-xs text-danger"
          }
        >
          {message}
        </span>
      ) : null}

      {status !== order.status ? (
        <span className="text-xs text-mist">
          {PAID.includes(status) && !PAID.includes(order.status)
            ? "Se apartarán las piezas del inventario."
            : !PAID.includes(status) &&
                order.status !== "pendiente" &&
                order.status !== "cancelado"
              ? "Se devolverán las piezas al inventario."
              : null}
        </span>
      ) : null}
    </div>
  );
}
