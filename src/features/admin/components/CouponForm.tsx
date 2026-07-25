"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import {
  createCouponAction,
  type ActionState,
} from "@/features/admin/actions";
import { BUSINESS } from "@/lib/config";

const initial: ActionState = { ok: false, message: "" };

export function CouponForm() {
  const [state, formAction] = useActionState(createCouponAction, initial);

  const today = new Date().toISOString().slice(0, 10);
  const inThreeMonths = new Date(Date.now() + 90 * 86_400_000)
    .toISOString()
    .slice(0, 10);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <Label htmlFor="code">Código</Label>
        <Input
          id="code"
          name="code"
          placeholder="AURA20"
          className="uppercase tracking-widest"
          required
        />
      </div>

      <div>
        <Label htmlFor="discount">
          Descuento (máx. {BUSINESS.maxCouponDiscount}%)
        </Label>
        <Input
          id="discount"
          name="discount"
          type="number"
          min={1}
          max={BUSINESS.maxCouponDiscount}
          defaultValue={10}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="starts_at">Inicia</Label>
          <Input
            id="starts_at"
            name="starts_at"
            type="date"
            defaultValue={today}
            required
          />
        </div>
        <div>
          <Label htmlFor="expiration">Expira</Label>
          <Input
            id="expiration"
            name="expiration"
            type="date"
            defaultValue={inThreeMonths}
            required
          />
        </div>
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
    <Button type="submit" variant="primary" className="w-full" disabled={pending}>
      {pending ? "Creando…" : "Crear cupón"}
    </Button>
  );
}
