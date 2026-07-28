import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Refresca la sesión de Supabase y protege /admin.
 *
 * Falla cerrado a propósito: si faltan las variables de entorno o Supabase
 * no responde, se bloquea el acceso en lugar de dejarlo pasar. Antes hacía
 * lo contrario, así que una variable mal puesta en el despliegue habría
 * dejado el panel abierto sin que nada avisara.
 *
 * Esta es la primera capa. Las Server Actions comprueban la sesión por su
 * cuenta (`features/admin/guard.ts`) y RLS protege los datos en la base.
 * Ver .claude/development-rules.md → Seguridad
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login";

  const toLogin = () => {
    if (isLoginRoute) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  };

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return toLogin();

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    // Supabase caído o token ilegible: se trata como sesión inexistente.
    return toLogin();
  }

  if (!user) return toLogin();

  if (isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
