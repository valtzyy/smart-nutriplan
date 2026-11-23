// Uji generator dengan 20 menu sungguhan dari data/seed/menus.json (sama dengan 0002_seed.sql).
import { describe, expect, it } from "vitest";
import seed from "../../../data/seed/menus.json";
import { hitungTargetKalori } from "./calories";
import { DIET_GOALS, MEAL_SLOTS, type DietGoal, type MealSlot } from "./constants";
import { generateMealPlan, isEmptySlot, swapSlot, type GeneratorMenu, type PlanItem } from "./generator";
import { formatKomponen } from "./trt";

const allergenId = new Map(seed.allergens.map((a, i) => [a.kode, i + 1]));
const menus: GeneratorMenu[] = seed.menus.map((m) => ({
  id: m.slug,
  kategori: m.kategori as MealSlot,
  kalori: m.kalori,
  protein: m.protein,
  karbohidrat: m.karbohidrat,
  lemak: m.lemak,
  cocokUntuk: m.cocok_untuk as DietGoal[],
  allergenIds: m.alergen.map((k) => allergenId.get(k)!),
}));
const menuBySlug = new Map(seed.menus.map((m) => [m.slug, m]));

describe("alur Annisa dengan data seed", () => {
  const target = hitungTargetKalori({
    jenisKelamin: "wanita",
    usia: 21,
    beratBadan: 55,
    tinggiBadan: 160,
    aktivitas: "sedang",
    tujuan: "turun",
  }).target;
  const udang = allergenId.get("udang")!;

  it("target 1.490 kkal", () => expect(target).toBe(1490));

  it("4 menu terisi, tidak ada yang mengandung udang, tidak ada yang ganda", () => {
    for (let hari = 0; hari < 30; hari++) {
      const plan = generateMealPlan({
        target,
        tujuan: "turun",
        avoidAllergenIds: [udang],
        menus,
        recentMenuIds: [],
        seed: `annisa:2026-11-${String(hari + 1).padStart(2, "0")}:0`,
      });
      expect(plan.items).toHaveLength(4);
      expect(plan.items.map((i) => i.slot)).toEqual(MEAL_SLOTS);
      const filled = plan.items.filter((i): i is PlanItem => !isEmptySlot(i));
      expect(filled).toHaveLength(4);
      for (const it of filled) expect(menuBySlug.get(it.menuId)!.alergen).not.toContain("udang");
      expect(new Set(filled.map((i) => i.menuId)).size).toBe(4);
    }
  });

  it("ganti slot berputar tanpa udang dan kembali ke awal", () => {
    const plan = generateMealPlan({ target, tujuan: "turun", avoidAllergenIds: [udang], menus, recentMenuIds: [], seed: "a:0" });
    const items = plan.items as PlanItem[];
    for (const slot of MEAL_SLOTS) {
      const start = items.find((i) => i.slot === slot)!.menuId;
      const others = items.filter((i) => i.slot !== slot).map((i) => i.menuId);
      let cur = start;
      const seen = new Set<string>();
      for (let n = 0; n < 10; n++) {
        const next = swapSlot({
          slot,
          currentMenuId: cur,
          otherSlotMenuIds: others,
          target,
          tujuan: "turun",
          avoidAllergenIds: [udang],
          menus,
          recentMenuIds: [],
          seed: "annisa:2026-11-23",
        });
        if (!next) break;
        expect(menuBySlug.get(next.menuId)!.alergen).not.toContain("udang");
        expect(others).not.toContain(next.menuId);
        seen.add(next.menuId);
        cur = next.menuId;
        if (cur === start) break;
      }
      expect(cur).toBe(start); // putaran kembali ke menu awal
      expect(seen.size).toBeGreaterThan(0);
    }
  });
});

describe("filter alergen/pantangan untuk semua kode seed", () => {
  for (const a of seed.allergens) {
    it(`tidak pernah memilih menu ber-${a.kode}`, () => {
      for (const tujuan of DIET_GOALS) {
        for (const target of [1200, 1490, 2300, 3190]) {
          const plan = generateMealPlan({
            target,
            tujuan,
            avoidAllergenIds: [allergenId.get(a.kode)!],
            menus,
            recentMenuIds: [],
            seed: `${a.kode}:${tujuan}:${target}`,
          });
          for (const it of plan.items) {
            if (isEmptySlot(it)) continue;
            expect(menuBySlug.get(it.menuId)!.alergen).not.toContain(a.kode);
          }
        }
      }
    });
  }
});

describe("takaran seluruh menu seed", () => {
  it("setiap komponen porsi menghasilkan teks TRT valid untuk semua multiplier", () => {
    for (const m of seed.menus) {
      for (const mult of [0.75, 1, 1.25, 1.5, 2]) {
        for (const p of m.porsi) {
          expect(formatKomponen(p, mult)).toMatch(/^(\d+)?[¼½¾]?\s\S/);
          expect(formatKomponen(p, mult)).not.toMatch(/\d\.\d/);
        }
      }
    }
  });
});
