"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { SITE } from "@/lib/config";
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

/**
 * Envía el correo con el enlace de recuperación.
 *
 * Responde lo mismo exista o no la cuenta: si dijera "ese correo no está
 * registrado", cualquiera podría averiguar qué direcciones tienen acceso.
 */
export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .slice(0, 160);

  const sent: ActionState = {
    ok: true,
    message:
      "Si esa dirección tiene acceso, te llegará un correo con el enlace para cambiar la contraseña. Revisa también la carpeta de spam.",
  };

  if (!email.includes("@")) {
    return { ok: false, message: "Escribe un correo válido." };
  }

  const supabase = await createServerSupabase();
  if (!supabase) return sent;

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE.url}/auth/confirmar?next=/admin/nueva-contrasena`,
  });

  return sent;
}

/** Define la nueva contraseña. Requiere la sesión que abre el enlace. */
export async function updatePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { ok: false, message: "Usa al menos 8 caracteres." };
  }
  if (password !== confirm) {
    return { ok: false, message: "Las dos contraseñas no coinciden." };
  }

  const supabase = await createServerSupabase();
  if (!supabase)
    return { ok: false, message: "El servicio no está disponible." };

  // Sin sesión de recuperación no hay a quién cambiarle la contraseña.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message:
        "El enlace expiró o ya se usó. Pide uno nuevo desde “Olvidé mi contraseña”.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { ok: false, message: "No se pudo cambiar la contraseña." };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin");
}
