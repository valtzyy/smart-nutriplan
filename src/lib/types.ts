// Tipe baris tabel, ditulis manual sesuai supabase/migrations/0001_init.sql.
import type { ActivityLevel, DietGoal, Gender, MealSlot } from "./nutrition/constants";
import type { PorsiKomponen } from "./nutrition/trt";

export type MenuStatus = "draft" | "aktif";
export type AllergenKind = "alergi" | "pantangan";

export interface ProfileRow {
  id: string;
  nama: string;
  role: "user" | "admin";
  usia: number | null;
  jenis_kelamin: Gender | null;
  berat_badan: number | null;
  tinggi_badan: number | null;
  aktivitas_fisik: ActivityLevel | null;
  tujuan: DietGoal | null;
  anggaran_harian: number | null;
  onboarding_selesai: boolean;
  created_at: string;
  updated_at: string;
}

export interface AllergenRow {
  id: number;
  kode: string;
  nama: string;
  jenis: AllergenKind;
  urutan: number;
}

export interface MenuRow {
  id: string;
  slug: string;
  nama: string;
  kategori: MealSlot;
  kalori: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  porsi: PorsiKomponen[];
  bahan: string[];
  langkah: string[];
  cocok_untuk: DietGoal[];
  estimasi_harga: number | null;
  waktu_masak_menit: number | null;
  foto_url: string | null;
  sumber_gizi: string;
  dicek_ahli_gizi: boolean;
  status: MenuStatus;
  created_at: string;
  updated_at: string;
}

export interface MealPlanRow {
  id: string;
  user_id: string;
  tanggal: string;
  target_kalori: number;
  regenerate_count: number;
  created_at: string;
  updated_at: string;
}

export interface MealPlanItemRow {
  id: string;
  meal_plan_id: string;
  slot: MealSlot;
  menu_id: string | null;
  multiplier: number;
  kalori: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  target_kalori_slot: number;
  label_selisih: boolean;
}

export type EventName =
  | "sign_up"
  | "login"
  | "onboarding_step_completed"
  | "onboarding_completed"
  | "plan_generated"
  | "plan_viewed"
  | "menu_swapped"
  | "recipe_viewed"
  | "slot_empty"
  | "profile_updated"
  | "logout";

/** Profil yang sudah lengkap (setelah onboarding). */
export interface CompleteProfile extends ProfileRow {
  usia: number;
  jenis_kelamin: Gender;
  berat_badan: number;
  tinggi_badan: number;
  aktivitas_fisik: ActivityLevel;
  tujuan: DietGoal;
}

export type ActionState = { ok: boolean; error?: string; fieldErrors?: Record<string, string> } | null;
