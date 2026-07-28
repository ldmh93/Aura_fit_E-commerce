"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { requestPasswordResetAction } from "@/features/admin/auth.actions";
import type { ActionState } from "@/features/admin/actions";

const initial: ActionState = { ok: false, message: "" };

export function RecoverForm() {
  const [state, formAction] = useActionState(
    requestPasswordResetAction,
    initial,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <Label htmlFor="email">Tu correo</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@aurafit.com"
          required
        />
      </div>

      {state.message ? (
        <p
          className={
            state.ok
              ? "rounded-xl border border-success/25 bg-success/5 px-4 py-3 text-xs leading-relaxed text-success"
              : "text-xs text-danger"
          }
        >
          {state.message}
        </p>
      ) : null}

      <SubmitButton />

      <Link
        href="/admin/login"
        className="block text-center text-xs text-mist transition-colors hover:text-white"
      >
        Volver a iniciar sesión
      </Link>
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
      {pending ? "Enviando…" : "Enviar enlace"}
    </Button>
  );
}
