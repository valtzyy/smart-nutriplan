"use server";

import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { PESAN_GALAT } from "@/lib/brand";
import { logEvent } from "@/lib/events";
import { KODE_FITUR_PREMIUM } from "@/lib/premium";
import type { ActionState } from "@/lib/types";

const minatSchema = z.array(z.enum(KODE_FITUR_PREMIUM)).max(KODE_FITUR_PREMIUM.length);

/** "Saya tertarik" — hanya mencatat minat (tanpa pembayaran). */
export async function nyatakanMinat(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const fitur = minatSchema.safeParse(fd.getAll("fitur"));
  if (!fitur.success) return { ok: false, error: PESAN_GALAT };
  try {
    const { supabase, user } = await requireUser();
    // Ditunggu supaya pengguna hanya melihat "terima kasih" bila minat benar-benar tercatat.
    await logEvent(supabase, user.id, "premium_interest", { fitur: [...new Set(fitur.data)] });
    return { ok: true };
  } catch (e) {
    unstable_rethrow(e);
    console.error("[premium]", e);
    return { ok: false, error: PESAN_GALAT };
  }
}
