import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { homePathFor, isComplete, langkah1Lengkap, langkah2Lengkap } from "./onboarding";
import { getSupabaseEnv } from "./supabase/env";
import { createClient } from "./supabase/server";
import type { CompleteProfile, ProfileRow } from "./types";

export interface SessionUser {
  id: string;
  email: string | undefined;
}

export interface Session {
  supabase: SupabaseClient;
  user: SessionUser;
  profile: ProfileRow;
}

/** Sesi saat ini (di-cache per request). `null` bila belum login. */
export const getSession = cache(async (): Promise<Session | null> => {
  // Selalu dinamis (tidak pernah diprerender saat build), dengan atau tanpa env Supabase.
  await connection();
  if (!getSupabaseEnv()) return null;
  const supabase = await createClient();
  // getClaims memverifikasi JWT secara lokal (kunci ES256 dari JWKS, di-cache) — tanpa round-trip ke Auth server.
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims?.sub) return null;
  const user: SessionUser = { id: claims.sub, email: claims.email };
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) throw new Error(error.message);
  const p: ProfileRow =
    (profile as ProfileRow | null) ??
    ({
      id: user.id,
      nama: (claims.user_metadata?.nama as string) ?? "",
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
  return { supabase, user, profile: p };
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
