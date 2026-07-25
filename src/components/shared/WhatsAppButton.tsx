"use client";

import { generalWhatsappUrl } from "@/features/cart/whatsapp";

/** Botón flotante de contacto. Presente en toda la tienda. */
export function WhatsAppButton() {
  return (
    <a
      href={generalWhatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir a AURA FIT por WhatsApp"
      className="whatsapp-fab group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-aura/30 bg-graphite/90 backdrop-blur-md transition-all duration-300 hover:border-aura hover:shadow-[0_0_40px_-8px_rgba(94,168,255,0.8)] md:bottom-8 md:right-8"
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border border-aura/40 opacity-0 transition-opacity group-hover:opacity-100"
      />
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-6 w-6 fill-silver transition-colors group-hover:fill-aura"
      >
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.09 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23a8.18 8.18 0 0 1 5.82 2.42 8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.21-8.24 8.21z" />
      </svg>
    </a>
  );
}
