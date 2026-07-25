import { mockCoupons } from "@/lib/mock-data";
import { BUSINESS } from "@/lib/config";
import type { Coupon } from "@/types";

export async function getCoupons(): Promise<Coupon[]> {
  return [...mockCoupons].sort(
    (a, b) => +new Date(b.expiration) - +new Date(a.expiration),
  );
}

export interface CouponResult {
  valid: boolean;
  discount: number;
  code: string;
  message: string;
}

/**
 * Valida un cupón en el servidor. Nunca confiar en el cliente.
 * Reglas en .claude/business-rules.md
 */
export async function validateCoupon(rawCode: string): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  const invalid = (message: string): CouponResult => ({
    valid: false,
    discount: 0,
    code,
    message,
  });

  if (!code) return invalid("Escribe un código.");

  const coupon = mockCoupons.find((c) => c.code === code);

  if (!coupon) return invalid("Ese código no existe.");
  if (!coupon.active) return invalid("Ese cupón ya no está activo.");

  const now = Date.now();
  if (new Date(coupon.starts_at).getTime() > now)
    return invalid("Ese cupón todavía no es válido.");
  if (new Date(coupon.expiration).getTime() < now)
    return invalid("Ese cupón ya expiró.");

  const discount = Math.min(coupon.discount, BUSINESS.maxCouponDiscount);

  return {
    valid: true,
    discount,
    code,
    message: `Cupón aplicado: ${discount}% de descuento.`,
  };
}

export interface CouponInput {
  code: string;
  discount: number;
  starts_at: string;
  expiration: string;
}

export async function createCoupon(
  input: CouponInput,
): Promise<{ ok: boolean; message: string }> {
  const code = input.code.trim().toUpperCase();

  if (mockCoupons.some((c) => c.code === code)) {
    return { ok: false, message: "Ese código ya existe." };
  }

  mockCoupons.unshift({
    id: `cup-${Date.now()}`,
    code,
    discount: input.discount,
    starts_at: input.starts_at,
    expiration: input.expiration,
    active: true,
  });

  return { ok: true, message: `Cupón ${code} creado.` };
}

export async function toggleCoupon(id: string): Promise<boolean> {
  const coupon = mockCoupons.find((c) => c.id === id);
  if (!coupon) return false;

  coupon.active = !coupon.active;
  return true;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  const index = mockCoupons.findIndex((c) => c.id === id);
  if (index === -1) return false;

  mockCoupons.splice(index, 1);
  return true;
}
