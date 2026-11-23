import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { logEvent } from "@/lib/events";
import { safeNextPath } from "@/lib/onboarding";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/** Tukar `code` (PKCE) atau `token_hash` dari email Supabase menjadi sesi, lalu alihkan ke `next`. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNextPath(url.searchParams.get("next"), "/");
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const origin = url.origin;

  if (!getSupabaseEnv()) return NextResponse.redirect(`${origin}/masuk`);
  const supabase = await createClient();

  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  }

  if (!ok) {
    const dest = next === "/reset-sandi" ? "/lupa-sandi" : "/masuk";
    return NextResponse.redirect(`${origin}${dest}`);
  }

  if (url.searchParams.get("ev") === "sign_up" || type === "signup") {
    const { data } = await supabase.auth.getUser();
    if (data.user) await logEvent(supabase, data.user.id, "sign_up");
  }
  const dest = type === "recovery" ? "/reset-sandi" : next;
  return NextResponse.redirect(`${origin}${dest}`);
}
