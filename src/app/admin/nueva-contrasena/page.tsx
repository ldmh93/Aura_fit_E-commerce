import { Wordmark } from "@/components/shared/Logo";
import { NewPasswordForm } from "@/features/admin/components/NewPasswordForm";

export const metadata = {
  title: "Nueva contraseña",
  robots: { index: false, follow: false },
};

/**
 * Se llega aquí desde el enlace del correo, ya con sesión de recuperación:
 * el middleware deja pasar porque `/auth/confirmar` la creó antes.
 */
export default function NewPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5">
      <div className="aura-glow left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <Wordmark size="lg" className="justify-center" />
          <p className="eyebrow mt-4">Nueva contraseña</p>
        </div>

        <div className="surface p-6">
          <NewPasswordForm />
        </div>
      </div>
    </div>
  );
}
