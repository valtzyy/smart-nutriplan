import type { CompleteProfile, ProfileRow } from "./types";

/** Langkah 1 (profil tubuh) lengkap? */
export function langkah1Lengkap(p: ProfileRow): boolean {
  return (
    p.usia != null &&
    p.jenis_kelamin != null &&
    p.berat_badan != null &&
    p.tinggi_badan != null &&
    p.aktivitas_fisik != null
  );
}

/** Langkah 2 (tujuan) lengkap? */
export function langkah2Lengkap(p: ProfileRow): boolean {
  return p.tujuan != null;
}

export function isComplete(p: ProfileRow): p is CompleteProfile {
  return langkah1Lengkap(p) && langkah2Lengkap(p);
}

/** Tujuan pengalihan untuk pengguna yang sudah login. */
export function homePathFor(p: ProfileRow | null): string {
  if (!p) return "/onboarding/profil";
  if (p.onboarding_selesai && isComplete(p)) return "/beranda";
  if (!langkah1Lengkap(p)) return "/onboarding/profil";
  if (!langkah2Lengkap(p)) return "/onboarding/tujuan";
  return "/onboarding/preferensi";
}

/** Hanya izinkan path relatif internal untuk parameter `next`. */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
