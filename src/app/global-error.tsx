"use client";

/**
 * Último recurso: se muestra si falla el propio layout raíz.
 * Reemplaza al `<html>` completo, así que no puede usar los componentes ni
 * los estilos del proyecto — de ahí que lleve los colores a mano.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es-MX">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050505",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "26rem", textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#5EA8FF",
              margin: 0,
            }}
          >
            AURA FIT
          </p>
          <h1
            style={{
              fontSize: "1.5rem",
              textTransform: "uppercase",
              marginTop: "1rem",
            }}
          >
            La página no está disponible
          </h1>
          <p
            style={{
              color: "#8A93A0",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              marginTop: "1rem",
            }}
          >
            Estamos teniendo un problema técnico. Intenta de nuevo en un
            momento.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              height: "2.75rem",
              padding: "0 1.75rem",
              borderRadius: "999px",
              border: "none",
              backgroundColor: "#C7D7E8",
              color: "#050505",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
