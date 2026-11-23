"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv, SupabaseNotConfiguredError } from "./env";

/** Client Supabase untuk browser. Hanya anon key — jangan pernah service role key. */
export function createClient() {
  const env = getSupabaseEnv();
  if (!env) throw new SupabaseNotConfiguredError();
  return createBrowserClient(env.url, env.anonKey);
}
