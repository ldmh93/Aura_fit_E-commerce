"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import {
  updateOrderDetailsAction,
  type ActionState,
} from "@/features/admin/actions";
import type { Order } from "@/types";

const initial: ActionState = { ok: false, message: "" };

/** Dónde y cuándo se entrega, más notas internas del pedido. */
export function OrderDetailsForm({ order }: { order: Order }) {
  const [state, formAction] = useActionState(
    updateOrderDetailsAction,
    initial,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={order.id} />

      <div>
        <Label htmlFor={`meeting-${order.id}`}>Punto de encuentro</Label>
        <Input
          id={`meeting-${order.id}`}
          name="meeting_point"
          defaultValue={order.meeting_point ?? ""}
          placeholder="Plaza principal, sábado 18:00"
        />
      </div>

      <div>
        <Label htmlFor={`notes-${order.id}`}>Notas internas</Label>
        <Textarea
          id={`notes-${order.id}`}
          name="notes"
          defaultValue={order.notes ?? ""}
          placeholder="Lo que necesites recordar de este pedido."
          className="min-h-20"
        />
      </div>

      {state.message ? (
        <p className={state.ok ? "text-xs text-success" : "text-xs text-danger"}>
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="secondary" size="sm" disabled={pending}>
      {pending ? "Guardando…" : "Guardar"}
    </Button>
  );
}
