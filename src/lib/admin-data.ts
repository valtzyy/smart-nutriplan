import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const PAGE = 1000;

/** Ambil semua baris (PostgREST membatasi 1000 baris per permintaan). RLS: hanya admin yang membaca semua. */
export async function fetchAll<T>(
  supabase: SupabaseClient,
  table: string,
  columns: string,
  filter?: { column: string; gte: string },
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    let q = supabase.from(table).select(columns).order("id", { ascending: true }).range(from, from + PAGE - 1);
    if (filter) q = q.gte(filter.column, filter.gte);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}
