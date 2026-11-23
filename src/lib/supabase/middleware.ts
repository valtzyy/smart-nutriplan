import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

/** Rute yang butuh login (diperkuat lagi di server component untuk aturan onboarding & role). */
const PROTECTED_PREFIXES = ["/onboarding", "/beranda", "/meal-plan", "/menu", "/profil"];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Segarkan sesi Supabase dan alihkan pengunjung dari rute terlindungi. */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  const env = getSupabaseEnv();
  if (!env) return response;

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        if (headers) for (const [k, v] of Object.entries(headers)) response.headers.set(k, v);
      },
    },
  });

  let userId: string | null = null;
  try {
    // Verifikasi JWT lokal (menyegarkan token bila perlu) — jauh lebih cepat daripada getUser().
    const { data } = await supabase.auth.getClaims();
    userId = data?.claims?.sub ?? null;
  } catch {
    // Supabase tidak terjangkau: biarkan halaman menangani (akan tampil galat).
    return response;
  }

  const { pathname, search } = request.nextUrl;
  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    if (path === "/masuk") url.searchParams.set("next", `${pathname}${search}`);
    const res = NextResponse.redirect(url);
    for (const c of response.cookies.getAll()) res.cookies.set(c);
    return res;
  };

  if (!userId && isProtectedPath(pathname)) return redirectTo("/masuk");
  if (!userId && pathname === "/reset-sandi") return redirectTo("/lupa-sandi");

  return response;
}
