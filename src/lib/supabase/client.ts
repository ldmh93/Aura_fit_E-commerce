"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env, isSupabaseConfigured } from "@/lib/env";

/**
 * Cliente de Supabase para el navegador (anon key).
 * Devuelve `null` si el proyecto aún no está configurado.
 */
export function createClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
