/**
 * Lectura centralizada de variables de entorno.
 *
 * La app está diseñada para arrancar SIN configuración: si faltan las
 * credenciales de Supabase, la capa de servicios cae a `lib/mock-data.ts`.
 * Ver .claude/architecture.md → "Fallback sin Supabase".
 */

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  /** Solo servidor. Nunca exponer al cliente. */
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
  gaId: process.env.NEXT_PUBLIC_GA_ID ?? "",
} as const;

/** ¿Hay credenciales suficientes para hablar con Supabase? */
export const isSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseAnonKey,
);

export const hasServiceRole = Boolean(
  isSupabaseConfigured && env.supabaseServiceKey,
);
