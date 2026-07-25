"use client";

import type { CartItem, Product } from "@/types";

/**
 * Eventos de Meta Pixel y GA4.
 * Si los IDs no están configurados, las funciones no hacen nada.
 * Ver .claude/business-rules.md → Marketing
 */

type FbqArgs = [string, string, Record<string, unknown>?];

declare global {
  interface Window {
    fbq?: (...args: FbqArgs) => void;
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

function track(
  pixelEvent: string,
  gaEvent: string,
  payload: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  window.fbq?.("track", pixelEvent, payload);
  window.gtag?.("event", gaEvent, payload);
}

export function trackViewContent(product: Product) {
  track("ViewContent", "view_item", {
    content_ids: [product.sku],
    content_name: product.name,
    content_type: "product",
    value: product.price,
    currency: "MXN",
  });
}

export function trackAddToCart(item: Omit<CartItem, "key">) {
  track("AddToCart", "add_to_cart", {
    content_ids: [item.sku],
    content_name: item.name,
    content_type: "product",
    value: item.unit_price * item.quantity,
    currency: "MXN",
    quantity: item.quantity,
  });
}

export function trackInitiateCheckout(items: CartItem[], total: number) {
  track("InitiateCheckout", "begin_checkout", {
    content_ids: items.map((i) => i.sku),
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value: total,
    currency: "MXN",
  });
}

/**
 * `Purchase` se dispara desde el panel admin al marcar el pedido como pagado,
 * no al enviar el WhatsApp. Ver .claude/business-rules.md
 */
export function trackPurchase(orderNumber: string, total: number) {
  track("Purchase", "purchase", {
    transaction_id: orderNumber,
    value: total,
    currency: "MXN",
  });
}
