"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Pantalla de error del panel.
 * Aquí sí conviene mostrar el mensaje técnico: quien la ve es el
 * administrador y necesita saber qué falló para poder reportarlo.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error en el panel:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="surface max-w-lg p-7">
        <p className="eyebrow mb-3">Error</p>
        <h1 className="text-xl font-semibold uppercase tracking-tight text-white">
          No se pudo cargar esta pantalla
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-mist">
          Suele ser un problema de conexión con la base de datos. Reintenta;
          si persiste, revisa que las variables de entorno de Supabase sigan
          configuradas.
        </p>

        <pre className="mt-5 max-h-40 overflow-auto rounded-xl border border-white/8 bg-void px-4 py-3 text-xs leading-relaxed text-mist">
          {error.message}
          {error.digest ? `\n\nReferencia: ${error.digest}` : ""}
        </pre>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-full bg-silver px-6 text-sm font-medium text-void transition-colors hover:bg-white"
          >
            Reintentar
          </button>
          <Link
            href="/admin"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-6 text-sm text-white transition-colors hover:border-white/35"
          >
            Ir al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
