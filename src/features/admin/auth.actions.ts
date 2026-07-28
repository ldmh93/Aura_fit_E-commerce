"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ActionState } from "./actions";

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .slice(0, 160);
  const password = String(formData.get("password") ?? "");

  if (!email || !password)
    return { ok: false, message: "Escribe tu correo y contraseña." };

  const supabase = await createServerSupabase();
  if (!supabase)
    return {
      ok: false,
      message: "El servicio de autenticación no está disponible.",
    };

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  // Mensaje genérico a propósito: distinguir entre "no existe" y
  // "contraseña incorrecta" permitiría enumerar cuentas.
  if (error) return { ok: false, message: "Credenciales incorrectas." };

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createServerSupabase();
  await supabase?.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}
