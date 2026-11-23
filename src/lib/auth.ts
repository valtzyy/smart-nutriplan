import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { homePathFor, isComplete, langkah1Lengkap, langkah2Lengkap } from "./onboarding";
import { getSupabaseEnv } from "./supabase/env";
import { createClient } from "./supabase/server";
import type { CompleteProfile, ProfileRow } from "./types";

export interface Session {
  supabase: SupabaseClient;
  user: User;
  profile: ProfileRow;
}

/** Sesi saat ini (di-cache per request). `null` bila belum login. */
export const getSession = cache(async (): Promise<Session | null> => {
  // Selalu dinamis (tidak pernah diprerender saat build), dengan atau tanpa env Supabase.
  await connection();
  if (!getSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
  if (error) throw new Error(error.message);
  const p: ProfileRow =
    (profile as ProfileRow | null) ??
    ({
      id: data.user.id,
      nama: (data.user.user_metadata?.nama as string) ?? "",
      role: "user",
      usia: null,
      jenis_kelamin: null,
      berat_badan: null,
      tinggi_badan: null,
      aktivitas_fisik: null,
      tujuan: null,
      anggaran_harian: null,
      onboarding_selesai: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } satisfies ProfileRow);
  // numeric Postgres dikembalikan sebagai number oleh PostgREST, tapi jaga-jaga string.
  if (p.berat_badan != null) p.berat_badan = Number(p.berat_badan);
  if (p.tinggi_badan != null) p.tinggi_badan = Number(p.tinggi_badan);
  return { supabase, user: data.user, profile: p };
});

/** Halaman publik (/, /daftar, /masuk): alihkan bila sudah login. */
export async function redirectIfLoggedIn(): Promise<void> {
  const s = await getSession();
  if (s) redirect(homePathFor(s.profile));
}

export async function requireUser(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/masuk");
  return s;
}

export type OnboardedSession = Session & { profile: CompleteProfile };

/** Butuh login + onboarding selesai; selain itu alihkan ke langkah onboarding yang kurang. */
export async function requireOnboarded(): Promise<OnboardedSession> {
  const s = await requireUser();
  if (!s.profile.onboarding_selesai || !isComplete(s.profile)) redirect(homePathFor(s.profile));
  return s as OnboardedSession;
}

/** Guard tiap langkah onboarding. */
export async function requireOnboardingStep(step: 1 | 2 | 3): Promise<Session> {
  const s = await requireUser();
  const p = s.profile;
  if (p.onboarding_selesai && isComplete(p)) redirect("/beranda");
  if (step >= 2 && !langkah1Lengkap(p)) redirect("/onboarding/profil");
  if (step >= 3 && !langkah2Lengkap(p)) redirect("/onboarding/tujuan");
  return s;
}

/** Hanya admin; selain itu 404. */
export async function requireAdmin(): Promise<Session> {
  const s = await getSession();
  if (!s || s.profile.role !== "admin") notFound();
  return s;
}
