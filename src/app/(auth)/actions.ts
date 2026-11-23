"use server";

import { redirect } from "next/navigation";
import { PESAN_GALAT } from "@/lib/brand";
import { logEvent } from "@/lib/events";
import { homePathFor, safeNextPath } from "@/lib/onboarding";
import { getSiteUrl } from "@/lib/site-url";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { ActionState, ProfileRow } from "@/lib/types";
import { daftarSchema, fieldErrors, lupaSandiSchema, masukSchema, resetSandiSchema } from "@/lib/validation";

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

function belumSiap(): ActionState {
  return { ok: false, error: PESAN_GALAT };
}

export async function daftarAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = daftarSchema.safeParse({ nama: str(fd, "nama"), email: str(fd, "email"), password: str(fd, "password") });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  if (!getSupabaseEnv()) return belumSiap();

  const { nama, email, password } = parsed.data;
  const supabase = await createClient();
  const site = await getSiteUrl();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nama },
      emailRedirectTo: `${site}/auth/callback?next=/onboarding/profil&ev=sign_up`,
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (error.code === "user_already_exists" || msg.includes("already registered") || msg.includes("already exists")) {
      return { ok: false, fieldErrors: { email: "Email ini sudah terdaftar. Coba masuk." } };
    }
    if (error.code === "weak_password") return { ok: false, fieldErrors: { password: PESAN_SANDI_LEMAH } };
    return { ok: false, error: PESAN_GALAT };
  }
  // Konfirmasi email aktif + email sudah ada: Supabase mengembalikan user tanpa identitas.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { ok: false, fieldErrors: { email: "Email ini sudah terdaftar. Coba masuk." } };
  }
  if (data.session && data.user) {
    logEvent(supabase, data.user.id, "sign_up");
    redirect("/onboarding/profil");
  }
  redirect("/cek-email");
}

const PESAN_SANDI_LEMAH = "Kata sandi terlalu mudah ditebak. Coba kombinasi huruf dan angka.";

export async function masukAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = masukSchema.safeParse({ email: str(fd, "email"), password: str(fd, "password") });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  if (!getSupabaseEnv()) return belumSiap();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    if (error?.code === "email_not_confirmed") {
      return { ok: false, error: "Email belum dikonfirmasi. Cek kotak masuk emailmu, ya." };
    }
    if (error && error.status && error.status >= 500) return { ok: false, error: PESAN_GALAT };
    return { ok: false, error: "Email atau kata sandi salah." };
  }
  logEvent(supabase, data.user.id, "login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
  const home = homePathFor(profile as ProfileRow | null);
  const next = safeNextPath(str(fd, "next"), "");
  // `next` hanya dipakai bila onboarding sudah selesai (kalau belum, guard tetap mengalihkan).
  redirect(home === "/beranda" && next ? next : home);
}

export async function lupaSandiAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = lupaSandiSchema.safeParse({ email: str(fd, "email") });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  if (!getSupabaseEnv()) return belumSiap();

  const supabase = await createClient();
  const site = await getSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${site}/auth/callback?next=/reset-sandi`,
  });
  // Jangan bocorkan apakah email terdaftar; hanya galat server/limit yang ditampilkan.
  if (error && error.status === 429) {
    return { ok: false, error: "Terlalu banyak permintaan. Coba lagi beberapa menit lagi, ya." };
  }
  return { ok: true };
}

export async function resetSandiAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = resetSandiSchema.safeParse({ password: str(fd, "password"), confirm: str(fd, "confirm") });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  if (!getSupabaseEnv()) return belumSiap();

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: "Tautan reset sudah kedaluwarsa. Minta tautan baru, ya." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") {
      return { ok: false, fieldErrors: { password: "Kata sandi baru harus berbeda dari yang lama." } };
    }
    if (error.code === "weak_password") return { ok: false, fieldErrors: { password: PESAN_SANDI_LEMAH } };
    return { ok: false, error: PESAN_GALAT };
  }
  redirect("/beranda");
}

export async function keluarAction(): Promise<void> {
  if (getSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) await logEvent(supabase, data.user.id, "logout"); // ditunggu: sesi dihapus sesudahnya
    await supabase.auth.signOut();
  }
  redirect("/");
}
