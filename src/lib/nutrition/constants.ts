// Semua angka di sini adalah usulan awal tim dan WAJIB dicek ahli gizi (lihat docs/02-ALGORITMA.md).

export type Gender = "pria" | "wanita";
export type ActivityLevel = "jarang" | "ringan" | "sedang" | "berat" | "sangat_berat";
export type DietGoal = "turun" | "jaga" | "naik";
export type MealSlot = "sarapan" | "makan_siang" | "makan_malam" | "camilan";

export const ACTIVITY_LEVELS: ActivityLevel[] = ["jarang", "ringan", "sedang", "berat", "sangat_berat"];
export const DIET_GOALS: DietGoal[] = ["turun", "jaga", "naik"];
export const GENDERS: Gender[] = ["pria", "wanita"];

/** Urutan slot dipakai generator dan tampilan. */
export const MEAL_SLOTS: MealSlot[] = ["sarapan", "makan_siang", "makan_malam", "camilan"];

export const FAKTOR_AKTIVITAS: Record<ActivityLevel, number> = {
  jarang: 1.2,
  ringan: 1.375,
  sedang: 1.55,
  berat: 1.725,
  sangat_berat: 1.9,
};

export const PENYESUAIAN_TUJUAN: Record<DietGoal, number> = {
  turun: -500,
  jaga: 0,
  naik: 400,
};

export const BATAS_BAWAH_KALORI: Record<Gender, number> = {
  wanita: 1200,
  pria: 1500,
};

export const PORSI_SLOT: Record<MealSlot, number> = {
  sarapan: 0.25,
  makan_siang: 0.35,
  makan_malam: 0.3,
  camilan: 0.1,
};

export const MULTIPLIERS = [0.75, 1, 1.25, 1.5, 2] as const;

export const BOBOT_PORSI_WAJAR = 0.01;
export const PENALTI_RIWAYAT = 0.5;
export const PENALTI_PLAN_SAAT_INI = 0.3;
export const JITTER_DEFAULT = 0.05;

/** Badge "Kalori sedikit berbeda dari target" bila selisih relatif melebihi angka ini. */
export const AMBANG_LABEL_SELISIH = 0.1;

/** Jumlah hari riwayat yang dihindari generator. */
export const HARI_RIWAYAT = 3;

/** Batas "Buat ulang meal plan" per hari. */
export const MAKS_BUAT_ULANG = 3;

/** Protein (g) minimum untuk badge "Tinggi protein". */
export const AMBANG_TINGGI_PROTEIN = 25;
