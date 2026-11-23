/** Env Supabase publik. `null` bila belum diisi (mis. saat build tanpa env). */
export function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super("Supabase belum dikonfigurasi: isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
}
