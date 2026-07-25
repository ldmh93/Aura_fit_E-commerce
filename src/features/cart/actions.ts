"use server";

import { validateCoupon } from "@/services/coupons.service";
import { createOrder } from "@/services/orders.service";
import type { CartItem } from "@/types";
import { sanitizePhone, sanitizeText, isValidPhone } from "@/utils";

/** Valida el cupón en el servidor. Nunca confiar en el cliente. */
export async function applyCouponAction(code: string) {
  return validateCoupon(sanitizeText(code, 40));
}

export interface CheckoutInput {
  customerName: string;
  phone: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
}

export interface CheckoutResult {
  ok: boolean;
  orderNumber: string | null;
  error?: string;
}

/**
 * Registra el pedido antes de abrir WhatsApp.
 * Si no hay backend configurado devuelve ok con orderNumber null:
 * el checkout por WhatsApp funciona igual.
 */
export async function checkoutAction(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  const customerName = sanitizeText(input.customerName, 80);
  const phone = sanitizePhone(input.phone);

  if (customerName.length < 2) {
    return { ok: false, orderNumber: null, error: "Escribe tu nombre." };
  }
  if (!isValidPhone(phone)) {
    return {
      ok: false,
      orderNumber: null,
      error: "Escribe un teléfono válido a 10 dígitos.",
    };
  }
  if (!input.items.length) {
    return { ok: false, orderNumber: null, error: "Tu carrito está vacío." };
  }

  // El total se recalcula en el servidor: el del cliente es solo referencia.
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );

  const coupon = input.couponCode
    ? await validateCoupon(input.couponCode)
    : null;

  const discount = coupon?.valid
    ? Math.round((subtotal * coupon.discount) / 100)
    : 0;

  const orderNumber = await createOrder({
    customer_name: customerName,
    phone,
    items: input.items.map((item) => ({
      product_id: item.product_id,
      name: item.name,
      sku: item.sku,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unit_price: item.unit_price,
      image: item.image,
    })),
    subtotal,
    discount,
    total: subtotal - discount,
    coupon_code: coupon?.valid ? coupon.code : null,
  });

  return { ok: true, orderNumber };
}
