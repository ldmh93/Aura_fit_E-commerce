import { Wordmark } from "@/components/shared/Logo";
import { RecoverForm } from "@/features/admin/components/RecoverForm";

export const metadata = {
  title: "Recuperar contraseña",
  robots: { index: false, follow: false },
};

export default function RecoverPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5">
      <div className="aura-glow left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <Wordmark size="lg" className="justify-center" />
          <p className="eyebrow mt-4">Recuperar contraseña</p>
        </div>

        <div className="surface p-6">
          <p className="mb-5 text-sm leading-relaxed text-mist">
            Escribe tu correo y te enviamos un enlace para definir una
            contraseña nueva.
          </p>
          <RecoverForm />
        </div>
      </div>
    </div>
  );
}
