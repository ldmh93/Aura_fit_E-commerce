"use client";

import { useEffect } from "react";
import { LinkButton } from "@/components/ui/Button";
import { generalWhatsappUrl } from "@/features/cart/whatsapp";

/**
 * Pantalla de error de la tienda.
 * Sin esto, un fallo de la base de datos mostraba la pantalla genérica de
 * Next, que no ofrece salida ni forma de contactar.
 */
export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error en la tienda:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6">
      <div className="aura-glow left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative max-w-md text-center">
        <p className="eyebrow mb-3">Algo salió mal</p>
        <h1 className="text-2xl font-semibold uppercase tracking-tight text-white md:text-3xl">
          No pudimos cargar esta página
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-mist">
          Puede ser un problema temporal de conexión. Intenta de nuevo; si
          sigue igual, escríbenos por WhatsApp y te atendemos directo.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-full bg-silver px-6 text-sm font-medium text-void transition-colors hover:bg-white"
          >
            Reintentar
          </button>
          <LinkButton href="/" variant="secondary" size="md">
            Volver al inicio
          </LinkButton>
          <LinkButton
            href={generalWhatsappUrl()}
            variant="ghost"
            size="md"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </LinkButton>
        </div>

        {error.digest ? (
          <p className="tabular mt-8 text-xs text-mist/60">
            Referencia: {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
