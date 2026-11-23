import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AllergenRow } from "./types";

export async function loadAllergens(supabase: SupabaseClient): Promise<AllergenRow[]> {
  const { data, error } = await supabase.from("allergens").select("*").order("urutan");
  if (error) throw new Error(error.message);
  return (data ?? []) as AllergenRow[];
}

/** Alergen pengguna (objek lengkap) dari daftar id. */
export function pilihAlergen(all: AllergenRow[], ids: number[]): AllergenRow[] {
  const set = new Set(ids);
  return all.filter((a) => set.has(a.id));
}
