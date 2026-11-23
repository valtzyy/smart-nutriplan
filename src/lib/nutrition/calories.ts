import {
  BATAS_BAWAH_KALORI,
  FAKTOR_AKTIVITAS,
  MEAL_SLOTS,
  PENYESUAIAN_TUJUAN,
  PORSI_SLOT,
  type ActivityLevel,
  type DietGoal,
  type Gender,
  type MealSlot,
} from "./constants";

export interface CalorieInput {
  jenisKelamin: Gender;
  usia: number;
  beratBadan: number;
  tinggiBadan: number;
  aktivitas: ActivityLevel;
  tujuan: DietGoal;
}

export interface CalorieResult {
  bmr: number;
  tdee: number;
  target: number;
  kenaBatasBawah: boolean;
}

export function bulatkanKe10(x: number): number {
  return Math.round(x / 10) * 10;
}

/** Mifflin-St Jeor. */
export function hitungBmr(input: Pick<CalorieInput, "jenisKelamin" | "usia" | "beratBadan" | "tinggiBadan">): number {
  const dasar = 10 * input.beratBadan + 6.25 * input.tinggiBadan - 5 * input.usia;
  return input.jenisKelamin === "pria" ? dasar + 5 : dasar - 161;
}

export function hitungTargetKalori(input: CalorieInput): CalorieResult {
  const bmr = hitungBmr(input);
  const tdee = bmr * FAKTOR_AKTIVITAS[input.aktivitas];
  const mentah = tdee + PENYESUAIAN_TUJUAN[input.tujuan];
  const batas = BATAS_BAWAH_KALORI[input.jenisKelamin];
  const kenaBatasBawah = mentah < batas;
  return {
    bmr,
    tdee,
    target: bulatkanKe10(Math.max(mentah, batas)),
    kenaBatasBawah,
  };
}

export function targetSlot(target: number, slot: MealSlot): number {
  return Math.round(target * PORSI_SLOT[slot]);
}

export function targetPerSlot(target: number): Record<MealSlot, number> {
  return Object.fromEntries(MEAL_SLOTS.map((s) => [s, targetSlot(target, s)])) as Record<MealSlot, number>;
}
