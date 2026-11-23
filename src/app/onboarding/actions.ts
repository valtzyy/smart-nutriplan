"use server";

import { redirect } from "next/navigation";
import { requireOnboardingStep } from "@/lib/auth";
import { PESAN_GALAT } from "@/lib/brand";
import { getJakartaNow } from "@/lib/date";
import { logEvent, logEvents } from "@/lib/events";
import { ensurePlan } from "@/lib/mealplan";
import { isComplete } from "@/lib/onboarding";
import type { ActionState, ProfileRow } from "@/lib/types";
import { allergenIdsSchema, fieldErrors, profilTubuhSchema, tujuanSchema } from "@/lib/validation";

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "");

export async function simpanProfilTubuh(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = profilTubuhSchema.safeParse({
    usia: s(fd, "usia"),
    jenis_kelamin: s(fd, "jenis_kelamin"),
    berat_badan: s(fd, "berat_badan"),
    tinggi_badan: s(fd, "tinggi_badan"),
    aktivitas_fisik: s(fd, "aktivitas_fisik"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const { supabase, user } = await requireOnboardingStep(1);
  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
  if (error) return { ok: false, error: PESAN_GALAT };
  logEvent(supabase, user.id, "onboarding_step_completed", { step: 1 });
  redirect("/onboarding/tujuan");
}

export async function simpanTujuan(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = tujuanSchema.safeParse({ tujuan: s(fd, "tujuan") });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const { supabase, user } = await requireOnboardingStep(2);
  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
  if (error) return { ok: false, error: PESAN_GALAT };
  logEvent(supabase, user.id, "onboarding_step_completed", { step: 2 });
  redirect("/onboarding/preferensi");
}

export async function simpanPreferensi(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = allergenIdsSchema.safeParse(fd.getAll("allergen_ids"));
  if (!parsed.success) return { ok: false, error: PESAN_GALAT };
  const { supabase, user } = await requireOnboardingStep(3);
  const ids = [...new Set(parsed.data)];

  const del = await supabase.from("profile_allergens").delete().eq("profile_id", user.id);
  if (del.error) return { ok: false, error: PESAN_GALAT };
  if (ids.length > 0) {
    const ins = await supabase
      .from("profile_allergens")
      .insert(ids.map((allergen_id) => ({ profile_id: user.id, allergen_id })));
    if (ins.error) return { ok: false, error: PESAN_GALAT };
  }

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({ onboarding_selesai: true })
    .eq("id", user.id)
    .select("*")
    .single();
  if (error || !updated) return { ok: false, error: PESAN_GALAT };
  const profile = updated as ProfileRow;
  if (!isComplete(profile)) redirect("/onboarding/profil");

  logEvents(supabase, user.id, [
    { nama: "onboarding_step_completed", meta: { step: 3 } },
    { nama: "onboarding_completed" },
  ]);
  try {
    await ensurePlan(supabase, profile, getJakartaNow(new Date()).tanggal, "onboarding");
  } catch (e) {
    // Beranda akan mencoba membuat ulang otomatis.
    console.error("[onboarding] gagal membuat meal plan:", e);
  }
  redirect("/beranda");
}
