import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { EventName } from "./types";

/**
 * Catat event analitik. Tidak pernah melempar galat — kegagalan hanya di-log
 * supaya tidak memblokir UI (PRD bagian 7).
 */
export async function logEvent(
  supabase: SupabaseClient,
  userId: string,
  nama: EventName,
  meta: Record<string, unknown> = {},
): Promise<void> {
  try {
    const { error } = await supabase.from("events").insert({ user_id: userId, nama, meta });
    if (error) console.warn(`[events] gagal mencatat ${nama}:`, error.message);
  } catch (e) {
    console.warn(`[events] gagal mencatat ${nama}:`, e);
  }
}

export async function logEvents(
  supabase: SupabaseClient,
  userId: string,
  events: Array<{ nama: EventName; meta?: Record<string, unknown> }>,
): Promise<void> {
  if (events.length === 0) return;
  try {
    const { error } = await supabase
      .from("events")
      .insert(events.map((e) => ({ user_id: userId, nama: e.nama, meta: e.meta ?? {} })));
    if (error) console.warn("[events] gagal mencatat batch:", error.message);
  } catch (e) {
    console.warn("[events] gagal mencatat batch:", e);
  }
}
