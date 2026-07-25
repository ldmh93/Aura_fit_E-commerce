"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { ActionState } from "./actions";

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password)
    return { ok: false, message: "Escribe tu correo y contraseña." };

  const supabase = isSupabaseConfigured ? await createServerSupabase() : null;

  if (!supabase) {
    // Modo demo local: sin Supabase no hay sesión que crear.
    redirect("/admin");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { ok: false, message: "Credenciales incorrectas." };

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function logoutAction() {
  const supabase = isSupabaseConfigured ? await createServerSupabase() : null;
  await supabase?.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}
