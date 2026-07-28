import { adminDb, publicDb } from "@/services/db";
import { BUSINESS } from "@/lib/config";
import type { Coupon } from "@/types";

const SELECT = "id,code,discount,starts_at,expiration,active";

/** Todos los cupones, incluidos los inactivos: es vista de panel. */
export async function getCoupons(): Promise<Coupon[]> {
  const db = adminDb();
  const { data, error } = await db
    .from("coupons")
    .select(SELECT)
    .order("expiration", { ascending: false });

  if (error) throw new Error(`No se pudieron leer los cupones: ${error.message}`);

  return (data ?? []) as Coupon[];
}

export interface CouponResult {
  valid: boolean;
  discount: number;
  code: string;
  message: string;
}

/**
 * Valida un cupón en el servidor. Nunca confiar en el cliente.
 * Usa la llave pública a propósito: si RLS lo esconde, no es válido.
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

  const db = await publicDb();
  const { data } = await db
    .from("coupons")
    .select(SELECT)
    .eq("code", code)
    .maybeSingle();

  const coupon = data as Coupon | null;

  if (!coupon) return invalid("Ese código no existe o ya no es válido.");
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
  const db = adminDb();
  const code = input.code.trim().toUpperCase();

  const { error } = await db.from("coupons").insert({
    code,
    discount: input.discount,
    starts_at: input.starts_at,
    expiration: input.expiration,
    active: true,
  });

  if (error) {
    // 23505 = violación de índice único
    if (error.code === "23505")
      return { ok: false, message: "Ese código ya existe." };
    return { ok: false, message: "No se pudo crear el cupón." };
  }

  return { ok: true, message: `Cupón ${code} creado.` };
}

export async function toggleCoupon(id: string): Promise<boolean> {
  const db = adminDb();

  const { data } = await db
    .from("coupons")
    .select("active")
    .eq("id", id)
    .maybeSingle();

  if (!data) return false;

  const { error } = await db
    .from("coupons")
    .update({ active: !data.active })
    .eq("id", id);

  return !error;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  const db = adminDb();
  const { error } = await db.from("coupons").delete().eq("id", id);
  return !error;
}
