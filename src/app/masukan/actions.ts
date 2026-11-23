"use server";

import { unstable_rethrow } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { PESAN_GALAT } from "@/lib/brand";
import { logEvent } from "@/lib/events";
import type { ActionState } from "@/lib/types";
import { fieldErrors, masukanSchema } from "@/lib/validation";

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "");

export async function kirimMasukan(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = masukanSchema.safeParse({
    nps: s(fd, "nps"),
    membingungkan: s(fd, "membingungkan"),
    disukai: s(fd, "disukai"),
    berhenti: s(fd, "berhenti"),
    alasan_rekomendasi: s(fd, "alasan_rekomendasi"),
    bersedia_bayar: s(fd, "bersedia_bayar"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  try {
    const { supabase, user } = await requireUser();
    const { error } = await supabase.from("feedback").insert({ ...parsed.data, user_id: user.id });
    if (error) {
      // 42P01 / PGRST205 = tabel belum ada (migrasi 0003 belum dijalankan).
      console.error("[masukan]", error.code, error.message);
      return { ok: false, error: PESAN_GALAT };
    }
    void logEvent(supabase, user.id, "feedback_submitted", { nps: parsed.data.nps });
    return { ok: true };
  } catch (e) {
    unstable_rethrow(e);
    console.error("[masukan]", e);
    return { ok: false, error: PESAN_GALAT };
  }
}
