import { BUSINESS, WHATSAPP } from "@/lib/config";
import type { CartItem } from "@/types";
import { formatPrice } from "@/utils";

/**
 * Genera el mensaje de pedido que se envía por WhatsApp.
 * El formato lo lee una persona: debe quedar claro y ordenado.
 */
export function buildOrderMessage({
  items,
  subtotal,
  discount,
  total,
  couponCode,
  customerName,
  orderNumber,
}: {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string | null;
  customerName?: string;
  orderNumber?: string | null;
}): string {
  const lines: string[] = [];

  lines.push(WHATSAPP.greeting);
  lines.push("");
  lines.push("Quiero realizar este pedido:");
  lines.push("");

  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name}`);
    lines.push(`   Talla: ${item.size}`);
    lines.push(`   Color: ${item.color}`);
    lines.push(`   Cantidad: ${item.quantity}`);
    lines.push(`   Precio: ${formatPrice(item.unit_price * item.quantity)}`);
    lines.push(`   SKU: ${item.sku}`);
    lines.push("");
  });

  lines.push(`Subtotal: ${formatPrice(subtotal)}`);

  if (discount > 0) {
    lines.push(`Descuento${couponCode ? ` (${couponCode})` : ""}: -${formatPrice(discount)}`);
  }

  const shipping =
    total >= BUSINESS.freeShippingThreshold ? 0 : BUSINESS.shippingCost;

  lines.push(
    shipping === 0
      ? "Envío: Gratis"
      : `Envío estimado: ${formatPrice(shipping)}`,
  );
  lines.push(`Total: ${formatPrice(total + shipping)}`);
  lines.push("");

  if (customerName) lines.push(`Mi nombre: ${customerName}`);
  if (orderNumber) lines.push(`Pedido: ${orderNumber}`);
  if (customerName || orderNumber) lines.push("");

  lines.push("¿Está disponible?");

  return lines.join("\n");
}

/** URL de WhatsApp lista para abrir. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP.number}?text=${encodeURIComponent(message)}`;
}

/** Mensaje genérico del botón flotante. */
export function generalWhatsappUrl(context?: string): string {
  const message = context
    ? `${WHATSAPP.greeting}\n\nTengo una pregunta sobre: ${context}`
    : `${WHATSAPP.greeting}\n\nMe interesa conocer más sobre sus productos.`;
  return whatsappUrl(message);
}
