import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, isSupabaseConfigured } from "@/lib/env";

/**
 * Cliente de Supabase para Server Components y Server Actions.
 * Mantiene la sesión del administrador vía cookies.
 * Devuelve `null` si el proyecto aún no está configurado.
 */
export async function createServerSupabase() {
  if (!isSupabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Llamado desde un Server Component: el middleware refresca la sesión.
        }
      },
    },
  });
}
