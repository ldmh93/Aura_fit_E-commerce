import { LoginForm } from "@/features/admin/components/LoginForm";
import { Wordmark } from "@/components/shared/Logo";
import { isSupabaseConfigured } from "@/lib/env";

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5">
      <div className="aura-glow left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <Wordmark size="lg" className="justify-center" />
          <p className="eyebrow mt-4">Panel administrativo</p>
        </div>

        <div className="surface p-6">
          <LoginForm />
        </div>

        {!isSupabaseConfigured ? (
          <p className="mt-5 text-center text-xs leading-relaxed text-mist">
            Supabase todavía no está configurado. En modo local el panel se
            abre sin autenticación para que puedas revisarlo.
          </p>
        ) : null}
      </div>
    </div>
  );
}
