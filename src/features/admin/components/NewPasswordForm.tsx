"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { updatePasswordAction } from "@/features/admin/auth.actions";
import type { ActionState } from "@/features/admin/actions";

const initial: ActionState = { ok: false, message: "" };

export function NewPasswordForm() {
  const [state, formAction] = useActionState(updatePasswordAction, initial);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <Label htmlFor="password">Nueva contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="Al menos 8 caracteres"
          required
        />
      </div>

      <div>
        <Label htmlFor="confirm">Repítela</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      {state.message ? (
        <p className="text-xs leading-relaxed text-danger">{state.message}</p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="primary"
      size="lg"
      className="w-full"
      disabled={pending}
    >
      {pending ? "Guardando…" : "Cambiar contraseña"}
    </Button>
  );
}
