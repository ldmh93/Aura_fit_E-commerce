import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6">
      <div className="aura-glow left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative text-center">
        <p className="text-metal text-6xl font-semibold tracking-tight md:text-8xl">
          404
        </p>
        <h1 className="mt-6 text-xl font-semibold uppercase tracking-tight text-white md:text-2xl">
          Esta página no existe
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-mist">
          Puede que la pieza se haya agotado o que la dirección esté mal
          escrita.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <LinkButton href="/shop" variant="primary" size="md">
            Ver la tienda
          </LinkButton>
          <LinkButton href="/" variant="secondary" size="md">
            Volver al inicio
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
