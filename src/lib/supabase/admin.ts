import { createClient } from "@supabase/supabase-js";
import { env, hasServiceRole } from "@/lib/env";

/**
 * Cliente con service role — omite RLS.
 * SOLO para Server Actions del panel administrativo y creación de pedidos.
 * NUNCA importar desde código que llegue al navegador.
 */
export function createAdminClient() {
  if (!hasServiceRole) return null;

  return createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
