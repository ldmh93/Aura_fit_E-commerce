import type { Collection, Size } from "@/types";

/**
 * Configuración de marca y negocio.
 * Los valores comerciales están explicados en .claude/business-rules.md
 */

export const SITE = {
  name: "AURA FIT",
  tagline: "Performance Wear",
  slogan: "Eleva tu rendimiento. Supera tus límites.",
  description:
    "AURA FIT — Ropa deportiva premium de alto rendimiento. Tecnología, diseño y evolución personal en cada prenda.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://aurafit.com",
  locale: "es_MX",
  currency: "MXN",
  logo: "/logo/aura-fit-logo.png",
} as const;

export const WHATSAPP = {
  /** Formato internacional sin "+" ni espacios. */
  number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5215500000000",
  greeting: "Hola AURA FIT 👋",
} as const;

export const BUSINESS = {
  /** Envío estándar nacional en MXN. */
  shippingCost: 149,
  /** Compras por encima de este monto llevan envío gratis. */
  freeShippingThreshold: 1499,
  /** Una variante con esta cantidad o menos dispara alerta de stock bajo. */
  lowStockThreshold: 5,
  /** Descuento máximo permitido en cupones (%). */
  maxCouponDiscount: 30,
  returnWindowDays: 30,
  deliveryEstimate: "3 a 5 días hábiles",
  supportHours: "Lunes a sábado, 9:00 – 19:00 (CDMX)",
} as const;

export const SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];

export const COLLECTIONS: Collection[] = [
  {
    slug: "aura-performance",
    name: "AURA PERFORMANCE",
    tagline: "Alto rendimiento",
    description:
      "Prendas técnicas diseñadas para entrenamiento de alta intensidad. Compresión, secado rápido y libertad total de movimiento.",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "aura-street",
    name: "AURA STREET",
    tagline: "Fitness urbano",
    description:
      "La estética del entrenamiento llevada al día a día. Siluetas amplias, materiales premium y acabados metálicos.",
    image:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "aura-women",
    name: "AURA WOMEN",
    tagline: "Línea femenina",
    description:
      "Ingeniería textil pensada para el cuerpo femenino. Soporte, ajuste y una segunda piel que se mueve contigo.",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "aura-essential",
    name: "AURA ESSENTIAL",
    tagline: "Básicos premium",
    description:
      "Lo esencial, ejecutado a nivel premium. Los cortes que usas todos los días, con la calidad de una marca de rendimiento.",
    image:
      "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "limited-edition",
    name: "LIMITED EDITION",
    tagline: "Tiraje corto",
    description:
      "Piezas numeradas, producción limitada y sin restock. Cuando se agotan, no vuelven.",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
  },
];

export const NAV_LINKS = [
  { href: "/shop", label: "Tienda" },
  { href: "/colecciones/aura-performance", label: "Performance" },
  { href: "/colecciones/aura-women", label: "Women" },
  { href: "/colecciones/limited-edition", label: "Limited" },
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
      ["XXL", "115 – 122", "100 – 108", "76"],
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
      ["XXL", "94 – 101", "113 – 120", "105"],
    ],
  },
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  pagado: "Pagado",
  enviado: "Enviado",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};
