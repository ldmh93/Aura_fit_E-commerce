import type { ProductColor, Size } from "@/types";

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
  /** Logotipo vectorial: nítido a cualquier tamaño y pesa 6 KB. */
  logo: "/logo/aura-fit-logo.svg",
  /** Versión en mapa de bits para Open Graph: las redes no leen SVG. */
  logoImage: "/logo/aura-fit-logo.png",
  logoWidth: 1622,
  logoHeight: 1130,
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

/** Tallas que se pueden asignar a un producto. */
export const SIZES: Size[] = ["XS", "S", "M", "L", "XL", "Unitalla"];

/** Talla para prendas y accesorios que no se tallan. */
export const ONE_SIZE: Size = "Unitalla";

/** Orden fijo para mostrar tallas, sin importar cómo se guardaron. */
const SIZE_ORDER: Record<Size, number> = {
  XS: 1,
  S: 2,
  M: 3,
  L: 4,
  XL: 5,
  Unitalla: 6,
};

export function sortSizes(sizes: Size[]): Size[] {
  return [...sizes].sort((a, b) => SIZE_ORDER[a] - SIZE_ORDER[b]);
}

/**
 * Paleta de colores de producto.
 *
 * Ojo con la diferencia: la **interfaz** es negra, plata y azul y eso no
 * cambia (ver .claude/design-system.md). Esto son los colores de la **ropa**,
 * que sí pueden ser cálidos o vivos.
 *
 * Para agregar un color nuevo, basta con añadirlo aquí: aparece solo en el
 * formulario del panel y en los filtros de la tienda.
 */
export const COLOR_GROUPS: { label: string; colors: ProductColor[] }[] = [
  {
    label: "Neutros",
    colors: [
      { name: "Negro", hex: "#0A0A0A" },
      { name: "Grafito", hex: "#2E2E33" },
      { name: "Gris", hex: "#6B7280" },
      { name: "Gris jaspeado", hex: "#A3A8B0" },
      { name: "Plata", hex: "#C7D7E8" },
      { name: "Hueso", hex: "#EDE7DC" },
      { name: "Blanco", hex: "#F5F5F5" },
    ],
  },
  {
    label: "Azules",
    colors: [
      { name: "Azul", hex: "#5EA8FF" },
      { name: "Azul marino", hex: "#1E2A47" },
      { name: "Turquesa", hex: "#2FBFAE" },
    ],
  },
  {
    label: "Verdes",
    colors: [
      { name: "Verde militar", hex: "#4A5340" },
      { name: "Verde menta", hex: "#9FD8B8" },
      { name: "Verde neón", hex: "#B8E62E" },
    ],
  },
  {
    label: "Tierra",
    colors: [
      { name: "Beige", hex: "#D6C7B0" },
      { name: "Camel", hex: "#B08658" },
      { name: "Café", hex: "#5A4433" },
    ],
  },
  {
    label: "Cálidos",
    colors: [
      { name: "Vino", hex: "#6E2438" },
      { name: "Rojo", hex: "#C7343B" },
      { name: "Coral", hex: "#F0705C" },
      { name: "Naranja", hex: "#E8802E" },
      { name: "Amarillo", hex: "#E8C46A" },
    ],
  },
  {
    label: "Otros",
    colors: [
      { name: "Rosa", hex: "#E8A0BF" },
      { name: "Lila", hex: "#A98BD4" },
      { name: "Morado", hex: "#5B3E8E" },
    ],
  },
];

/** Paleta plana — para buscar el hex de un color por su nombre. */
export const COLOR_PALETTE = COLOR_GROUPS.flatMap((group) => group.colors);

export function colorHex(name: string): string {
  return COLOR_PALETTE.find((color) => color.name === name)?.hex ?? "#888888";
}

export const NAV_LINKS = [
  { href: "/categoria/hombre", label: "Hombre" },
  { href: "/categoria/mujer", label: "Mujer" },
  { href: "/shop", label: "Todo" },
  { href: "/como-comprar", label: "Cómo comprar" },
] as const;

/**
 * Guía de medidas por tipo de prenda (cm).
 * Unitalla no aparece: no se talla. La guía se oculta cuando el producto
 * solo tiene esa talla.
 */
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
