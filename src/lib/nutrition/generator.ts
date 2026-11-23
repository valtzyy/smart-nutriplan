import { targetSlot } from "./calories";
import {
  AMBANG_LABEL_SELISIH,
  BOBOT_PORSI_WAJAR,
  JITTER_DEFAULT,
  MEAL_SLOTS,
  MULTIPLIERS,
  PENALTI_PLAN_SAAT_INI,
  PENALTI_RIWAYAT,
  type DietGoal,
  type MealSlot,
} from "./constants";
import { createRng } from "./random";

export interface GeneratorMenu {
  id: string;
  kategori: MealSlot;
  kalori: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  cocokUntuk: DietGoal[];
  allergenIds: number[];
}

export interface PlanItem {
  slot: MealSlot;
  menuId: string;
  multiplier: number;
  kalori: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  targetKaloriSlot: number;
  labelSelisih: boolean;
}

export interface EmptySlot {
  slot: MealSlot;
  empty: true;
  targetKaloriSlot: number;
}

export type PlanSlotResult = PlanItem | EmptySlot;

export interface MealPlanResult {
  items: PlanSlotResult[];
  totalKalori: number;
  totalProtein: number;
  totalKarbo: number;
  totalLemak: number;
}

export interface GenerateInput {
  target: number;
  tujuan: DietGoal;
  avoidAllergenIds: number[];
  menus: GeneratorMenu[];
  recentMenuIds: string[];
  currentPlanMenuIds?: string[];
  seed: string;
  jitter?: number;
}

export function isEmptySlot(item: PlanSlotResult): item is EmptySlot {
  return "empty" in item && item.empty === true;
}

/** Multiplier yang meminimalkan |kalori × m − target|; seri → paling dekat ke 1. */
export function pilihMultiplier(kalori: number, target: number): number {
  let best: number = MULTIPLIERS[0];
  let bestDiff = Infinity;
  for (const m of MULTIPLIERS) {
    const diff = Math.abs(kalori * m - target);
    const eps = 1e-9;
    if (diff < bestDiff - eps || (Math.abs(diff - bestDiff) <= eps && Math.abs(m - 1) < Math.abs(best - 1))) {
      best = m;
      bestDiff = diff;
    }
  }
  return best;
}

/** Aturan kandidat langkah 1 (tanpa pengecualian slot lain). */
export function kandidatSlot(
  slot: MealSlot,
  menus: GeneratorMenu[],
  tujuan: DietGoal,
  avoidAllergenIds: number[],
): GeneratorMenu[] {
  const avoid = new Set(avoidAllergenIds);
  return menus.filter(
    (m) => m.kategori === slot && m.cocokUntuk.includes(tujuan) && !m.allergenIds.some((a) => avoid.has(a)),
  );
}

interface Scored {
  menu: GeneratorMenu;
  multiplier: number;
  skor: number;
}

function nilaiKandidat(
  kandidat: GeneratorMenu[],
  slotTarget: number,
  recent: Set<string>,
  current: Set<string>,
  jitter: number,
  rng: () => number,
): Scored[] {
  const scored = kandidat.map((menu) => {
    const multiplier = pilihMultiplier(menu.kalori, slotTarget);
    let skor =
      Math.abs(menu.kalori * multiplier - slotTarget) / slotTarget + BOBOT_PORSI_WAJAR * Math.abs(multiplier - 1);
    if (recent.has(menu.id)) skor += PENALTI_RIWAYAT;
    if (current.has(menu.id)) skor += PENALTI_PLAN_SAAT_INI;
    skor += jitter * rng();
    return { menu, multiplier, skor };
  });
  // Urutan stabil: skor, lalu id supaya hasil tidak bergantung urutan input saat seri.
  return scored.sort((a, b) => a.skor - b.skor || (a.menu.id < b.menu.id ? -1 : a.menu.id > b.menu.id ? 1 : 0));
}

function keItem(slot: MealSlot, s: Scored, slotTarget: number): PlanItem {
  const kalori = Math.round(s.menu.kalori * s.multiplier);
  return {
    slot,
    menuId: s.menu.id,
    multiplier: s.multiplier,
    kalori,
    protein: Math.round(s.menu.protein * s.multiplier),
    karbohidrat: Math.round(s.menu.karbohidrat * s.multiplier),
    lemak: Math.round(s.menu.lemak * s.multiplier),
    targetKaloriSlot: slotTarget,
    labelSelisih: Math.abs(kalori - slotTarget) / slotTarget > AMBANG_LABEL_SELISIH,
  };
}

export function hitungTotal(items: PlanSlotResult[]): Omit<MealPlanResult, "items"> {
  let totalKalori = 0;
  let totalProtein = 0;
  let totalKarbo = 0;
  let totalLemak = 0;
  for (const it of items) {
    if (isEmptySlot(it)) continue;
    totalKalori += it.kalori;
    totalProtein += it.protein;
    totalKarbo += it.karbohidrat;
    totalLemak += it.lemak;
  }
  return { totalKalori, totalProtein, totalKarbo, totalLemak };
}

export function generateMealPlan(input: GenerateInput): MealPlanResult {
  const jitter = input.jitter ?? JITTER_DEFAULT;
  const rng = createRng(input.seed);
  const recent = new Set(input.recentMenuIds);
  const current = new Set(input.currentPlanMenuIds ?? []);
  const terpilih = new Set<string>();
  const items: PlanSlotResult[] = [];

  for (const slot of MEAL_SLOTS) {
    const slotTarget = targetSlot(input.target, slot);
    const kandidat = kandidatSlot(slot, input.menus, input.tujuan, input.avoidAllergenIds).filter(
      (m) => !terpilih.has(m.id),
    );
    if (kandidat.length === 0) {
      items.push({ slot, empty: true, targetKaloriSlot: slotTarget });
      continue;
    }
    const [best] = nilaiKandidat(kandidat, slotTarget, recent, current, jitter, rng);
    terpilih.add(best.menu.id);
    items.push(keItem(slot, best, slotTarget));
  }

  return { items, ...hitungTotal(items) };
}

export interface SwapInput {
  slot: MealSlot;
  currentMenuId: string | null;
  otherSlotMenuIds: string[];
  target: number;
  tujuan: DietGoal;
  avoidAllergenIds: number[];
  menus: GeneratorMenu[];
  recentMenuIds: string[];
  /** `${userId}:${tanggal}` — tanpa hitungan supaya urutan putaran stabil sepanjang hari. */
  seed: string;
  jitter?: number;
}

/**
 * Ganti per slot: kandidat setelah `currentMenuId` di daftar terurut (berputar).
 * Mengembalikan `null` bila tidak ada menu lain yang cocok.
 */
export function swapSlot(input: SwapInput): PlanItem | null {
  const jitter = input.jitter ?? JITTER_DEFAULT;
  // RNG khusus per slot supaya urutan tiap slot tidak saling memengaruhi.
  const rng = createRng(`${input.seed}:${input.slot}`);
  const slotTarget = targetSlot(input.target, input.slot);
  const kandidat = kandidatSlot(input.slot, input.menus, input.tujuan, input.avoidAllergenIds);
  const urut = nilaiKandidat(kandidat, slotTarget, new Set(input.recentMenuIds), new Set(), jitter, rng);
  const lain = new Set(input.otherSlotMenuIds);
  const daftar = urut.filter((s) => !lain.has(s.menu.id));

  if (daftar.length === 0) return null;
  const idx = input.currentMenuId ? daftar.findIndex((s) => s.menu.id === input.currentMenuId) : -1;
  if (idx === -1) {
    // Slot kosong atau menu saat ini sudah tidak valid → ambil yang terbaik.
    return keItem(input.slot, daftar[0], slotTarget);
  }
  if (daftar.length === 1) return null;
  const next = daftar[(idx + 1) % daftar.length];
  return keItem(input.slot, next, slotTarget);
}
