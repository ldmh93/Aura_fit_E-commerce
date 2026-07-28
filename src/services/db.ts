import { createClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { env, isSupabaseConfigured } from "@/lib/env";

/**
 * Acceso a Supabase para la capa de servicios.
 *
 * Dos permisos con propósitos distintos:
 *
 * - `publicDb()`  — llave pública. Respeta las políticas RLS, así que solo
 *   ve lo que vería cualquier visitante. Se usa en toda la tienda.
 *
 * - `adminDb()`   — llave secreta. Omite RLS. Solo para el panel y para
 *   registrar pedidos de clientes anónimos. Nunca llega al navegador.
 *
 * Ver .claude/architecture.md
 */

const MISSING =
  "Supabase no está configurado. Revisa NEXT_PUBLIC_SUPABASE_URL y las llaves en .env.local";

/**
 * Cliente sin cookies.
 *
 * `generateStaticParams` y `sitemap.ts` corren fuera de una petición, donde
 * `cookies()` no existe. Ahí no hay sesión que leer de todos modos: el
 * contenido que se prerenderiza es el público.
 */
function anonDb() {
  if (!isSupabaseConfigured) throw new Error(MISSING);

  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function publicDb() {
  try {
    const db = await createServerSupabase();
    if (db) return db;
  } catch {
    // Fuera de una petición: se sigue con el cliente sin cookies.
  }

  return anonDb();
}

export function adminDb() {
  const db = createAdminClient();
  if (!db) throw new Error(`${MISSING} (falta SUPABASE_SERVICE_ROLE_KEY)`);
  return db;
}
