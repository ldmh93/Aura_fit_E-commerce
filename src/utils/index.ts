import clsx, { type ClassValue } from "clsx";

/** Une clases condicionales. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** `$1,398 MXN` */
export function formatPrice(value: number): string {
  return `${mxn.format(value)} MXN`;
}

/** `$1,398` — sin sufijo de moneda, para tablas del admin. */
export function formatAmount(value: number): string {
  return mxn.format(value);
}

export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Porcentaje de descuento entre precio anterior y actual. */
export function discountPercent(
  price: number,
  oldPrice: number | null,
): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

// Control chars excepto el salto de linea (\u000A), que si se conserva.
const CONTROL_CHARS = /[\u0000-\u0009\u000B-\u001F\u007F]/g;
// Espacios horizontales repetidos: no toca los saltos de linea.
const EXTRA_SPACES = /[^\S\n]{2,}/g;
const HTML_TAGS = /<[^>]*>/g;

/** Limpia texto libre antes de guardarlo o enviarlo a WhatsApp. */
export function sanitizeText(value: unknown, maxLength = 500): string {
  if (typeof value !== "string") return "";
  return value
    .replace(CONTROL_CHARS, " ")
    .replace(HTML_TAGS, "")
    .replace(EXTRA_SPACES, " ")
    .trim()
    .slice(0, maxLength);
}

/** Deja solo dígitos de un teléfono. */
export function sanitizePhone(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\D/g, "").slice(0, 15);
}

export function isValidPhone(value: string): boolean {
  const digits = sanitizePhone(value);
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Clave única de variante en el carrito.
 * Separador doble para que un color con guion no genere colisiones.
 */
export function variantKey(
  productId: string,
  size: string,
  color: string,
): string {
  return `${productId}__${size}__${color}`;
}
