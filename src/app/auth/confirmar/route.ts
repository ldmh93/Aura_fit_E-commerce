import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Punto de llegada de los enlaces que envía Supabase por correo.
 *
 * El enlace trae un código de un solo uso; aquí se canjea por una sesión y
 * se manda al usuario a donde toque. Vive fuera de `/admin` a propósito:
 * quien llega todavía no tiene sesión y el middleware lo rebotaría.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  // Solo rutas internas: un "next" externo convertiría esto en un
  // redirector abierto para campañas de phishing.
  const destination = next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/admin";

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=enlace`);
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.redirect(`${origin}/admin/login?error=config`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/admin/login?error=expirado`);
  }

  return NextResponse.redirect(`${origin}${destination}`);
}
