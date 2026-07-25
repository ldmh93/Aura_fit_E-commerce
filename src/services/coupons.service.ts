import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { mockCoupons } from "@/lib/mock-data";
import { BUSINESS } from "@/lib/config";
import type { Coupon } from "@/types";

const SELECT = "id,code,discount,starts_at,expiration,product_id,active";

export async function getCoupons(): Promise<Coupon[]> {
  const supabase = isSupabaseConfigured ? await createServerSupabase() : null;
  if (!supabase) return mockCoupons;

  const { data } = await supabase
    .from("coupons")
    .select(SELECT)
    .order("expiration", { ascending: false });

  return (data ?? []) as Coupon[];
}

export interface CouponResult {
  valid: boolean;
  discount: number;
  code: string;
  message: string;
}

/**
 * Valida un cupón en el servidor.
 * Las reglas comerciales están en .claude/business-rules.md
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

  const supabase = isSupabaseConfigured ? await createServerSupabase() : null;

  const coupon = supabase
    ? ((
        await supabase.from("coupons").select(SELECT).eq("code", code).single()
      ).data as Coupon | null)
    : (mockCoupons.find((c) => c.code === code) ?? null);

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
