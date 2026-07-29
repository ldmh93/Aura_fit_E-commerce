import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { env, isSupabaseConfigured } from "@/lib/env";

/**
 * Acceso a Supabase para la capa de servicios.
 *
 * Dos permisos con propósitos distintos:
 *
 * - `publicDb()`  — llave pública, sin cookies. Respeta las políticas RLS,
 *   así que solo ve lo que vería cualquier visitante. Toda la tienda.
 *
 * - `adminDb()`   — llave secreta. Omite RLS. Solo para el panel y para
 *   registrar pedidos de clientes anónimos. Nunca llega al navegador.
 *
 * Ver .claude/architecture.md
 */

const MISSING =
  "Supabase no está configurado. Revisa NEXT_PUBLIC_SUPABASE_URL y las llaves en .env.local";

/**
 * Cliente del catálogo público. **No lee cookies a propósito.**
 *
 * Antes usaba el cliente con sesión y eso rompía las fichas de producto:
 * son páginas estáticas con revalidación, y al leer cookies en ejecución
 * Next las detectaba como dinámicas y devolvía error 500
 * ("Page changed from static to dynamic at runtime").
 *
 * El catálogo es el mismo para todos, así que la sesión nunca hizo falta.
 * De paso, sin cookies estas páginas se pueden cachear de verdad.
 */
export async function publicDb() {
  if (!isSupabaseConfigured) throw new Error(MISSING);

  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function adminDb() {
  const db = createAdminClient();
  if (!db) throw new Error(`${MISSING} (falta SUPABASE_SERVICE_ROLE_KEY)`);
  return db;
}
