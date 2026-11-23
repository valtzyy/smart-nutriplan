import { describe, expect, it } from "vitest";
import { hitungTargetKalori, targetPerSlot } from "./calories";
import {
  generateMealPlan,
  isEmptySlot,
  swapSlot,
  type GeneratorMenu,
  type PlanItem,
  type PlanSlotResult,
} from "./generator";
import { formatKomponen, formatTakaran } from "./trt";
import type { DietGoal, MealSlot } from "./constants";

const UDANG = 1;
const TELUR = 5;
const SEMUA: DietGoal[] = ["turun", "jaga", "naik"];

function menu(
  id: string,
  kategori: MealSlot,
  kalori: number,
  allergenIds: number[] = [],
  cocokUntuk: DietGoal[] = SEMUA,
): GeneratorMenu {
  return { id, kategori, kalori, protein: 20, karbohidrat: 40, lemak: 10, cocokUntuk, allergenIds };
}

const A = menu("A", "sarapan", 300);
const B = menu("B", "sarapan", 380, [TELUR]);
const C = menu("C", "sarapan", 450);
const SIANG = menu("S1", "makan_siang", 520);
const MALAM = menu("M1", "makan_malam", 450);
const CAMILAN = menu("K1", "camilan", 100);
const FIXTURE = [A, B, C, SIANG, MALAM, CAMILAN];

function slotOf(items: PlanSlotResult[], slot: MealSlot): PlanSlotResult {
  const it = items.find((i) => i.slot === slot);
  if (!it) throw new Error(`slot ${slot} tidak ada`);
  return it;
}

function filled(items: PlanSlotResult[], slot: MealSlot): PlanItem {
  const it = slotOf(items, slot);
  if (isEmptySlot(it)) throw new Error(`slot ${slot} kosong`);
  return it;
}

const base = {
  tujuan: "turun" as DietGoal,
  recentMenuIds: [] as string[],
  seed: "user-1:2026-11-23:0",
  jitter: 0,
};

describe("6.1 target kalori", () => {
  it.each([
    {
      no: 1,
      input: { jenisKelamin: "wanita", usia: 21, beratBadan: 55, tinggiBadan: 160, aktivitas: "sedang", tujuan: "turun" },
      bmr: 1284,
      tdee: 1990.2,
      target: 1490,
      batas: false,
    },
    {
      no: 2,
      input: { jenisKelamin: "pria", usia: 25, beratBadan: 70, tinggiBadan: 175, aktivitas: "ringan", tujuan: "jaga" },
      bmr: 1673.75,
      tdee: 2301.41,
      target: 2300,
      batas: false,
    },
    {
      no: 3,
      input: { jenisKelamin: "pria", usia: 30, beratBadan: 60, tinggiBadan: 165, aktivitas: "jarang", tujuan: "turun" },
      bmr: 1486.25,
      tdee: 1783.5,
      target: 1500,
      batas: true,
    },
    {
      no: 4,
      input: { jenisKelamin: "wanita", usia: 40, beratBadan: 50, tinggiBadan: 150, aktivitas: "jarang", tujuan: "turun" },
      bmr: 1076.5,
      tdee: 1291.8,
      target: 1200,
      batas: true,
    },
    {
      no: 5,
      input: { jenisKelamin: "pria", usia: 20, beratBadan: 65, tinggiBadan: 170, aktivitas: "berat", tujuan: "naik" },
      bmr: 1617.5,
      tdee: 2790.19,
      target: 3190,
      batas: false,
    },
  ] as const)("kasus $no", ({ input, bmr, tdee, target, batas }) => {
    const r = hitungTargetKalori(input);
    expect(r.bmr).toBeCloseTo(bmr, 2);
    expect(Math.abs(r.tdee - tdee)).toBeLessThanOrEqual(0.01);
    expect(r.target).toBe(target);
    expect(r.kenaBatasBawah).toBe(batas);
  });
});

describe("6.2 target slot", () => {
  it("target 1490", () => {
    expect(targetPerSlot(1490)).toEqual({ sarapan: 373, makan_siang: 522, makan_malam: 447, camilan: 149 });
  });
});

describe("6.3 generator", () => {
  it("1. tanpa riwayat, avoid [udang] → A × 1,25 = 375 kkal", () => {
    const r = generateMealPlan({ ...base, target: 1490, avoidAllergenIds: [UDANG], menus: FIXTURE });
    const s = filled(r.items, "sarapan");
    expect(s.menuId).toBe("A");
    expect(s.multiplier).toBe(1.25);
    expect(s.kalori).toBe(375);
    expect(s.labelSelisih).toBe(false);
    expect(s.targetKaloriSlot).toBe(373);
  });

  it("2. avoid [telur] → tetap A, B tidak muncul", () => {
    const r = generateMealPlan({ ...base, target: 1490, avoidAllergenIds: [TELUR], menus: FIXTURE });
    expect(filled(r.items, "sarapan").menuId).toBe("A");
    expect(r.items.some((i) => !isEmptySlot(i) && i.menuId === "B")).toBe(false);
  });

  it("3. A di recentMenuIds → B × 1 = 380 kkal", () => {
    const r = generateMealPlan({
      ...base,
      target: 1490,
      avoidAllergenIds: [UDANG],
      menus: FIXTURE,
      recentMenuIds: ["A"],
    });
    const s = filled(r.items, "sarapan");
    expect(s.menuId).toBe("B");
    expect(s.multiplier).toBe(1);
    expect(s.kalori).toBe(380);
  });

  it("4. semua sarapan beralergen udang → EmptySlot, slot lain tetap terisi", () => {
    const menus = [
      menu("X1", "sarapan", 300, [UDANG]),
      menu("X2", "sarapan", 400, [UDANG, TELUR]),
      SIANG,
      MALAM,
      CAMILAN,
    ];
    const r = generateMealPlan({ ...base, target: 1490, avoidAllergenIds: [UDANG], menus });
    const sarapan = slotOf(r.items, "sarapan");
    expect(isEmptySlot(sarapan)).toBe(true);
    expect(sarapan.targetKaloriSlot).toBe(373);
    expect(filled(r.items, "makan_siang").menuId).toBe("S1");
    expect(filled(r.items, "makan_malam").menuId).toBe("M1");
    expect(filled(r.items, "camilan").menuId).toBe("K1");
    expect(r.totalKalori).toBe(
      filled(r.items, "makan_siang").kalori + filled(r.items, "makan_malam").kalori + filled(r.items, "camilan").kalori,
    );
  });

  it("5. camilan 100 kkal: target 149 → ×1,5 = 150; target 3190 → ×2 = 200 + labelSelisih", () => {
    const r1 = generateMealPlan({ ...base, target: 1490, avoidAllergenIds: [], menus: FIXTURE });
    const c1 = filled(r1.items, "camilan");
    expect(c1.targetKaloriSlot).toBe(149);
    expect(c1.multiplier).toBe(1.5);
    expect(c1.kalori).toBe(150);
    expect(c1.labelSelisih).toBe(false);

    const r2 = generateMealPlan({ ...base, tujuan: "naik", target: 3190, avoidAllergenIds: [], menus: FIXTURE });
    const c2 = filled(r2.items, "camilan");
    expect(c2.targetKaloriSlot).toBe(319);
    expect(c2.multiplier).toBe(2);
    expect(c2.kalori).toBe(200);
    expect(c2.labelSelisih).toBe(true);
  });

  it("6. menu cocok_untuk ['naik'] tidak pernah muncul untuk tujuan turun", () => {
    const naikOnly = menu("N", "sarapan", 373, [], ["naik"]);
    const menus = [naikOnly, ...FIXTURE];
    for (let i = 0; i < 20; i++) {
      const r = generateMealPlan({
        ...base,
        target: 1490,
        avoidAllergenIds: [],
        menus,
        seed: `u:${i}`,
        jitter: 0.5,
      });
      expect(r.items.some((it) => !isEmptySlot(it) && it.menuId === "N")).toBe(false);
    }
    // Untuk tujuan naik, menu N (pas 373 kkal) terpilih.
    const naik = generateMealPlan({ ...base, tujuan: "naik", target: 1490, avoidAllergenIds: [], menus });
    expect(filled(naik.items, "sarapan").menuId).toBe("N");
  });

  it("7. seed sama → hasil identik (dengan jitter)", () => {
    const args = { ...base, target: 1490, avoidAllergenIds: [], menus: FIXTURE, jitter: 0.5, seed: "u:2026-11-23:1" };
    expect(generateMealPlan(args)).toEqual(generateMealPlan(args));
  });

  it("8. satu menu tidak muncul di dua slot", () => {
    // Menu yang sama kategorinya tidak mungkin dua slot, jadi uji dengan banyak menu & seed.
    const menus = [
      ...FIXTURE,
      menu("S2", "makan_siang", 600),
      menu("M2", "makan_malam", 400),
      menu("K2", "camilan", 150),
    ];
    for (let i = 0; i < 30; i++) {
      const r = generateMealPlan({ ...base, target: 1490, avoidAllergenIds: [], menus, seed: `s${i}`, jitter: 1 });
      const ids = r.items.filter((it) => !isEmptySlot(it)).map((it) => (it as PlanItem).menuId);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("buat ulang: currentPlanMenuIds diberi penalti supaya berganti", () => {
    const r = generateMealPlan({
      ...base,
      target: 1490,
      avoidAllergenIds: [TELUR],
      menus: FIXTURE,
      currentPlanMenuIds: ["A"],
    });
    expect(filled(r.items, "sarapan").menuId).toBe("C");
  });
});

describe("6.4 ganti slot", () => {
  const swapBase = {
    slot: "sarapan" as MealSlot,
    otherSlotMenuIds: [] as string[],
    target: 1490,
    tujuan: "turun" as DietGoal,
    avoidAllergenIds: [TELUR],
    menus: FIXTURE,
    recentMenuIds: [] as string[],
    seed: "user-1:2026-11-23",
    jitter: 0,
  };

  it("kandidat terurut [A, C]: current A → C", () => {
    const r = swapSlot({ ...swapBase, currentMenuId: "A" });
    expect(r?.menuId).toBe("C");
    expect(r?.multiplier).toBe(0.75);
    expect(r?.kalori).toBe(338);
  });

  it("current C → A (berputar)", () => {
    expect(swapSlot({ ...swapBase, currentMenuId: "C" })?.menuId).toBe("A");
  });

  it("hanya satu kandidat → null", () => {
    expect(swapSlot({ ...swapBase, currentMenuId: "A", menus: [A, B, SIANG] })).toBeNull();
  });

  it("menu yang dipakai slot lain tidak pernah dipilih", () => {
    const menus = [A, B, C, menu("D", "sarapan", 360)];
    const r = swapSlot({ ...swapBase, currentMenuId: "A", menus, otherSlotMenuIds: ["C"], avoidAllergenIds: [] });
    expect(r?.menuId).not.toBe("C");
    // Putar penuh: tidak pernah C.
    let cur = "A";
    for (let i = 0; i < 6; i++) {
      const next = swapSlot({ ...swapBase, currentMenuId: cur, menus, otherSlotMenuIds: ["C"], avoidAllergenIds: [] });
      expect(next).not.toBeNull();
      expect(next!.menuId).not.toBe("C");
      cur = next!.menuId;
    }
    // Kalau satu-satunya alternatif dipakai slot lain → null.
    expect(swapSlot({ ...swapBase, currentMenuId: "A", otherSlotMenuIds: ["C"] })).toBeNull();
  });
});

describe("6.5 format TRT", () => {
  it.each([
    [1, 0.75, "¾"],
    [1, 1.25, "1½"],
    [2, 1.25, "2½"],
    [0.5, 0.75, "½"],
    [1, 2, "2"],
    [1, 1, "1"],
    [0.5, 1, "½"],
  ])("(%s, %s) → %s", (qty, m, hasil) => {
    expect(formatTakaran(qty, m)).toBe(hasil);
  });

  it("nilai sangat kecil minimal ¼", () => {
    expect(formatTakaran(0.1, 1)).toBe("¼");
  });

  it("format lengkap", () => {
    expect(formatKomponen({ nama: "Nasi putih", qty: 1, satuan: "centong" }, 1.5)).toBe("1½ centong nasi putih");
  });
});
