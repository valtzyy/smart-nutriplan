"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOnboarded } from "@/lib/auth";
import { PESAN_GALAT } from "@/lib/brand";
import { getJakartaNow } from "@/lib/date";
import { logEvent } from "@/lib/events";
import { regeneratePlan } from "@/lib/mealplan";
import { isComplete } from "@/lib/onboarding";
import type { ActionState, ProfileRow } from "@/lib/types";
import { editProfilSchema, fieldErrors } from "@/lib/validation";

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "");

export async function simpanEditProfil(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = editProfilSchema.safeParse({
    nama: s(fd, "nama"),
    usia: s(fd, "usia"),
    jenis_kelamin: s(fd, "jenis_kelamin"),
    berat_badan: s(fd, "berat_badan"),
    tinggi_badan: s(fd, "tinggi_badan"),
    aktivitas_fisik: s(fd, "aktivitas_fisik"),
    tujuan: s(fd, "tujuan"),
    allergen_ids: fd.getAll("allergen_ids"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  try {
    const { supabase, user } = await requireOnboarded();
    const { allergen_ids, ...profil } = parsed.data;
    const { error } = await supabase.from("profiles").update(profil).eq("id", user.id);
    if (error) return { ok: false, error: PESAN_GALAT };
    const del = await supabase.from("profile_allergens").delete().eq("profile_id", user.id);
    if (del.error) return { ok: false, error: PESAN_GALAT };
    const ids = [...new Set(allergen_ids)];
    if (ids.length > 0) {
      const ins = await supabase
        .from("profile_allergens")
        .insert(ids.map((allergen_id) => ({ profile_id: user.id, allergen_id })));
      if (ins.error) return { ok: false, error: PESAN_GALAT };
    }
    return { ok: true };
  } catch (e) {
    unstable_rethrow(e);
    console.error("[edit profil]", e);
    return { ok: false, error: PESAN_GALAT };
  }
}

/** Pilihan dialog setelah simpan: perbarui meal plan hari ini atau berlaku mulai besok. */
export async function selesaiEditProfil(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const regenerate = fd.get("regenerate") === "1";
  try {
    const { supabase, user } = await requireOnboarded();
    if (regenerate) {
      // Baca profil terbaru (bukan cache request) untuk target kalori baru.
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      const profile = data as ProfileRow | null;
      if (!profile || !isComplete(profile)) return { ok: false, error: PESAN_GALAT };
      await regeneratePlan(supabase, profile, getJakartaNow(new Date()).tanggal, "profile_update");
    }
    await logEvent(supabase, user.id, "profile_updated", { regenerated: regenerate });
  } catch (e) {
    unstable_rethrow(e);
    console.error("[selesai edit profil]", e);
    return { ok: false, error: PESAN_GALAT };
  }
  revalidatePath("/beranda");
  revalidatePath("/meal-plan");
  revalidatePath("/profil");
  redirect("/beranda");
}
