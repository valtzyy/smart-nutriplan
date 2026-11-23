"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireOnboarded } from "@/lib/auth";
import { PESAN_GALAT } from "@/lib/brand";
import { getJakartaNow } from "@/lib/date";
import { RegenerateLimitError, regeneratePlan, swapPlanSlot } from "@/lib/mealplan";
import type { ActionState } from "@/lib/types";
import { slotSchema } from "@/lib/validation";

export async function gantiSlotAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const slot = slotSchema.safeParse(fd.get("slot"));
  if (!slot.success) return { ok: false, error: PESAN_GALAT };
  try {
    const { supabase, profile } = await requireOnboarded();
    const ok = await swapPlanSlot(supabase, profile, getJakartaNow(new Date()).tanggal, slot.data);
    revalidatePath("/meal-plan");
    revalidatePath("/beranda");
    return ok ? { ok: true } : { ok: false, error: "Belum ada menu lain yang cocok" };
  } catch (e) {
    unstable_rethrow(e);
    console.error("[ganti slot]", e);
    return { ok: false, error: PESAN_GALAT };
  }
}

export async function buatUlangAction(): Promise<ActionState> {
  try {
    const { supabase, profile } = await requireOnboarded();
    await regeneratePlan(supabase, profile, getJakartaNow(new Date()).tanggal, "regenerate");
    revalidatePath("/meal-plan");
    revalidatePath("/beranda");
    return { ok: true };
  } catch (e) {
    unstable_rethrow(e);
    if (e instanceof RegenerateLimitError) return { ok: false, error: e.message };
    console.error("[buat ulang]", e);
    return { ok: false, error: PESAN_GALAT };
  }
}

