import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { after } from "next/server";
import type { EventName } from "./types";

type EventInput = { nama: EventName; meta?: Record<string, unknown> };

/**
 * Catat event analitik tanpa memblokir respons (PRD bagian 7): insert dimulai sekarang,
 * lalu `after()` menjaga fungsi tetap hidup sampai selesai. Tidak pernah melempar galat.
 */
export function logEvents(supabase: SupabaseClient, userId: string, events: EventInput[]): Promise<void> {
  if (events.length === 0) return Promise.resolve();
  const task = (async () => {
    try {
      const { error } = await supabase
        .from("events")
        .insert(events.map((e) => ({ user_id: userId, nama: e.nama, meta: e.meta ?? {} })));
      if (error) console.warn("[events] gagal mencatat:", error.message);
    } catch (e) {
      console.warn("[events] gagal mencatat:", e);
    }
  })();
  try {
    after(task);
  } catch {
    // Di luar scope request (mis. tes): biarkan promise berjalan sendiri.
  }
  return task;
}

export function logEvent(
  supabase: SupabaseClient,
  userId: string,
  nama: EventName,
  meta: Record<string, unknown> = {},
): Promise<void> {
  return logEvents(supabase, userId, [{ nama, meta }]);
}
