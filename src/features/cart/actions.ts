"use server";

import { validateCoupon } from "@/services/coupons.service";
import { priceCheckout } from "@/services/products.service";
import { createOrder } from "@/services/orders.service";
import type { OrderItem } from "@/types";
import { isValidPhone, sanitizePhone, sanitizeText } from "@/utils";

/** Valida el cupón en el servidor. Nunca se confía en el cliente. */
export async function applyCouponAction(code: string) {
  return validateCoupon(sanitizeText(code, 40));
}

/** Solo lo que hace falta del carrito: el resto se lee del catálogo. */
export interface CheckoutLine {
  product_id: string;
  size: string;
  color: string;
  quantity: number;
}

export interface CheckoutInput {
  customerName: string;
  phone: string;
  items: CheckoutLine[];
  couponCode: string | null;
}

export interface CheckoutResult {
  ok: boolean;
  orderNumber: string | null;
  error?: string;
  /** Pedido tal como quedó registrado: precios y nombres del catálogo. */
  items?: OrderItem[];
  subtotal?: number;
  discount?: number;
  total?: number;
  couponCode?: string | null;
}

const MAX_LINES = 50;

/**
 * Registra el pedido antes de abrir WhatsApp.
 *
 * Nada de lo que manda el navegador se toma como cierto: los precios, los
 * nombres y las existencias se releen de la base, y el descuento se
 * recalcula. El mensaje de WhatsApp se arma con este resultado, no con el
 * carrito local.
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
      error: "Escribe un WhatsApp válido a 10 dígitos.",
    };
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { ok: false, orderNumber: null, error: "Tu pedido está vacío." };
  }
  if (input.items.length > MAX_LINES) {
    return {
      ok: false,
      orderNumber: null,
      error: "Demasiados artículos. Escríbenos por WhatsApp para un pedido grande.",
    };
  }

  const priced = await priceCheckout(
    input.items.map((item) => ({
      product_id: String(item.product_id ?? ""),
      size: String(item.size ?? ""),
      color: String(item.color ?? ""),
      quantity: Number(item.quantity) || 0,
    })),
  );

  if (!priced.ok) {
    return { ok: false, orderNumber: null, error: priced.error };
  }

  const coupon = input.couponCode
    ? await validateCoupon(sanitizeText(input.couponCode, 40))
    : null;

  const discount = coupon?.valid
    ? Math.round((priced.subtotal * coupon.discount) / 100)
    : 0;

  const total = priced.subtotal - discount;

  const orderNumber = await createOrder({
    customer_name: customerName,
    phone,
    items: priced.items,
    subtotal: priced.subtotal,
    discount,
    total,
    coupon_code: coupon?.valid ? coupon.code : null,
  });

  return {
    ok: true,
    orderNumber,
    items: priced.items,
    subtotal: priced.subtotal,
    discount,
    total,
    couponCode: coupon?.valid ? coupon.code : null,
  };
}
