import type { ActivityLevel, DietGoal, Gender, MealSlot } from "./nutrition/constants";

export const SLOT_LABEL: Record<MealSlot, string> = {
  sarapan: "Sarapan",
  makan_siang: "Makan siang",
  makan_malam: "Makan malam",
  camilan: "Camilan",
};

export const GENDER_LABEL: Record<Gender, string> = {
  pria: "Pria",
  wanita: "Wanita",
};

export const AKTIVITAS_LABEL: Record<ActivityLevel, string> = {
  jarang: "Jarang bergerak",
  ringan: "Ringan",
  sedang: "Sedang",
  berat: "Berat",
  sangat_berat: "Sangat berat",
};

export const AKTIVITAS_DESKRIPSI: Record<ActivityLevel, string> = {
  jarang: "kuliah/kerja banyak duduk",
  ringan: "olahraga 1–3x/minggu",
  sedang: "olahraga 3–5x/minggu",
  berat: "olahraga 6–7x/minggu",
  sangat_berat: "atlet atau kerja fisik berat",
};

export const TUJUAN_LABEL: Record<DietGoal, string> = {
  turun: "Turunkan berat badan",
  jaga: "Jaga berat badan",
  naik: "Naikkan berat badan",
};

export const TUJUAN_DESKRIPSI: Record<DietGoal, string> = {
  turun: "Defisit sekitar 500 kkal per hari",
  jaga: "Kalori sesuai kebutuhan harianmu",
  naik: "Surplus sekitar 400 kkal, cocok untuk bulking",
};

export const STATUS_MENU_LABEL = { draft: "Draft", aktif: "Aktif" } as const;

const angka = new Intl.NumberFormat("id-ID");
/** 1490 → "1.490". */
export function formatAngka(n: number): string {
  return angka.format(n);
}

/** Gabungkan daftar nama: "udang", "udang dan susu", "udang, susu, dan telur". */
export function gabungDaftar(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} dan ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, dan ${items[items.length - 1]}`;
}

export function inisial(nama: string): string {
  const parts = nama.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}
