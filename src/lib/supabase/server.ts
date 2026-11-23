import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv, SupabaseNotConfiguredError } from "./env";

/** Client Supabase untuk server component, server action, dan route handler (memakai anon key + sesi cookie). */
export async function createClient(): Promise<SupabaseClient> {
  const env = getSupabaseEnv();
  if (!env) throw new SupabaseNotConfiguredError();
  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Dipanggil dari server component: cookie tidak bisa ditulis, proxy yang menyegarkan sesi.
        }
      },
    },
  });
}
