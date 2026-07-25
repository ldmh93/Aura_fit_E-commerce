import type { Size } from "@/types";

/**
 * Configuración de marca y negocio.
 * El porqué de cada valor está en .claude/business-rules.md
 *
 * Los valores que el administrador puede editar desde /admin/ajustes
 * viven en `src/services/settings.service.ts`. Esto de aquí es la base.
 */

export const SITE = {
  name: "AURA FIT",
  tagline: "Performance Wear",
  slogan: "Eleva tu rendimiento. Supera tus límites.",
  description:
    "AURA FIT — Ropa deportiva de alto rendimiento. Selección corta y cuidada. Pide por WhatsApp y te la entregamos en un punto de encuentro.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://aurafit.com",
  locale: "es_MX",
  currency: "MXN",
  logo: "/logo/aura-fit-logo.png",
} as const;

export const WHATSAPP = {
  /** Formato internacional sin "+" ni espacios. México: 52 + 10 dígitos. */
  number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "524171279042",
  /** Para mostrar en pantalla. */
  display: "417 127 9042",
  greeting: "Hola AURA FIT 👋",
} as const;

/**
 * No hay envíos a domicilio ni paqueterías.
 * La entrega se acuerda por WhatsApp en un punto de encuentro.
 */
export const DELIVERY = {
  method: "Punto de encuentro",
  short: "Entrega en punto de encuentro",
  headline: "Entregamos en punto de encuentro",
  description:
    "Las entregas se realizan únicamente en un punto de encuentro previamente acordado por WhatsApp. No manejamos envíos a domicilio ni paqueterías.",
  steps: [
    "Elige tus prendas y envía el pedido por WhatsApp.",
    "Confirmamos disponibilidad, total y forma de pago.",
    "Acordamos día, hora y punto de encuentro para la entrega.",
  ],
} as const;

export const BUSINESS = {
  /** Una variante con esta cantidad o menos dispara alerta de stock bajo. */
  lowStockThreshold: 3,
  /** Descuento máximo permitido en cupones (%). */
  maxCouponDiscount: 30,
  changeWindowDays: 7,
  supportHours: "Lunes a sábado, 10:00 – 20:00",
} as const;

export const SIZES: Size[] = ["XS", "S", "M", "L", "XL"];

/** Colores disponibles en el catálogo. */
export const COLOR_PALETTE = [
  { name: "Negro", hex: "#0A0A0A" },
  { name: "Gris", hex: "#6B7280" },
  { name: "Azul", hex: "#5EA8FF" },
  { name: "Plata", hex: "#C7D7E8" },
  { name: "Blanco", hex: "#F5F5F5" },
] as const;

export const NAV_LINKS = [
  { href: "/categoria/hombre", label: "Hombre" },
  { href: "/categoria/mujer", label: "Mujer" },
  { href: "/shop", label: "Todo" },
  { href: "/como-comprar", label: "Cómo comprar" },
] as const;

/** Guía de medidas por tipo de prenda (cm). */
export const SIZE_GUIDES = {
  superior: {
    label: "Parte superior",
    columns: ["Talla", "Pecho", "Cintura", "Largo"],
    rows: [
      ["XS", "85 – 90", "70 – 75", "66"],
      ["S", "90 – 95", "75 – 80", "68"],
      ["M", "95 – 100", "80 – 86", "70"],
      ["L", "100 – 108", "86 – 93", "72"],
      ["XL", "108 – 115", "93 – 100", "74"],
    ],
  },
  inferior: {
    label: "Parte inferior",
    columns: ["Talla", "Cintura", "Cadera", "Largo"],
    rows: [
      ["XS", "66 – 70", "88 – 92", "95"],
      ["S", "70 – 75", "92 – 96", "97"],
      ["M", "75 – 80", "96 – 101", "99"],
      ["L", "80 – 87", "101 – 107", "101"],
      ["XL", "87 – 94", "107 – 113", "103"],
    ],
  },
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  pagado: "Pagado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};
