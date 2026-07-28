import { DELIVERY, WHATSAPP } from "@/lib/config";
import type { OrderItem } from "@/types";
import { formatPrice } from "@/utils";

/**
 * Mensaje de pedido que se envía por WhatsApp.
 * Lo lee una persona: tiene que quedar claro y ordenado.
 *
 * No incluye envío ni dirección: la entrega se acuerda en un punto
 * de encuentro. Ver .claude/business-rules.md
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
  /** Líneas confirmadas por el servidor, no el carrito del navegador. */
  items: OrderItem[];
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
    lines.push("");
  });

  if (discount > 0) {
    lines.push(`Subtotal: ${formatPrice(subtotal)}`);
    lines.push(
      `Descuento${couponCode ? ` (${couponCode})` : ""}: -${formatPrice(discount)}`,
    );
  }

  lines.push(`Total: ${formatPrice(total)}`);
  lines.push("");

  if (customerName) lines.push(`Mi nombre: ${customerName}`);
  if (orderNumber) lines.push(`Pedido: ${orderNumber}`);
  if (customerName || orderNumber) lines.push("");

  lines.push(`Entrega: ${DELIVERY.method}`);
  lines.push("¿Está disponible? ¿Dónde nos podemos ver?");

  return lines.join("\n");
}

/** URL de WhatsApp lista para abrir. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP.number}?text=${encodeURIComponent(message)}`;
}

/** Mensaje genérico del botón flotante y de los enlaces de contacto. */
export function generalWhatsappUrl(context?: string): string {
  const message = context
    ? `${WHATSAPP.greeting}\n\nTengo una pregunta sobre: ${context}`
    : `${WHATSAPP.greeting}\n\nMe interesa conocer más sobre sus productos.`;
  return whatsappUrl(message);
}
