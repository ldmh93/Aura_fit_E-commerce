"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { loginAction } from "@/features/admin/auth.actions";
import type { ActionState } from "@/features/admin/actions";

const initial: ActionState = { ok: false, message: "" };

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@aurafit.com"
          required
        />
      </div>

      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      {state.message && !state.ok ? (
        <p className="text-xs text-danger">{state.message}</p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
      {pending ? "Entrando…" : "Entrar"}
    </Button>
  );
}
