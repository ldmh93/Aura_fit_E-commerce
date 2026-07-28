import { createServerSupabase } from "@/lib/supabase/server";
import type { ActionState } from "./actions";

/**
 * Autorización del panel.
 *
 * Las Server Actions son endpoints HTTP reales: cualquiera puede intentar
 * invocarlas. El middleware protege las *rutas* de `/admin`, pero eso no
 * basta como única defensa —si el matcher cambia, si una acción se importa
 * desde una ruta pública o si fallan las variables de entorno, la
 * protección desaparece sin que nada avise.
 *
 * Por eso toda acción que escriba datos comprueba la sesión aquí, y además
 * usa la llave secreta que omite RLS. Sin esta comprobación, un visitante
 * podría borrar el catálogo entero.
 */

/** Sesión válida de administrador, o `null`. */
export async function getAdminUser() {
  try {
    const db = await createServerSupabase();
    if (!db) return null;

    // getUser() valida el token contra Supabase; getSession() solo lee la
    // cookie y se puede falsificar.
    const {
      data: { user },
    } = await db.auth.getUser();

    return user;
  } catch {
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdminUser()) !== null;
}

export const DENIED: ActionState = {
  ok: false,
  message: "Tu sesión expiró. Vuelve a iniciar sesión para continuar.",
};
