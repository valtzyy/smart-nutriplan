import "server-only";
import { loadAllergens, pilihAlergen } from "./allergens";
import type { OnboardedSession } from "./auth";
import { getJakartaNow } from "./date";
import { ensurePlan, loadPlanAndContext, swappableSlots, type PlanWithItems } from "./mealplan";
import { ringkasPorsi } from "./nutrition/trt";
import type { AllergenRow, MealPlanItemRow, MenuRow } from "./types";

export interface ViewItem {
  item: MealPlanItemRow;
  menu: MenuRow | null;
  porsiRingkas: string;
  canSwap: boolean;
}

export interface TodayView {
  tanggal: string;
  jam: number;
  plan: PlanWithItems["plan"];
  items: ViewItem[];
  totals: { kalori: number; protein: number; karbohidrat: number; lemak: number };
  userAllergens: AllergenRow[];
  allEmpty: boolean;
}

/**
 * Data halaman Beranda / Meal Plan: memastikan meal plan hari ini (Asia/Jakarta) sudah ada.
 * Semua query baca berjalan paralel; plan baru hanya ditulis bila belum ada.
 */
export async function loadTodayView(session: OnboardedSession, now = new Date()): Promise<TodayView> {
  const { supabase, profile } = session;
  const { tanggal, jam } = getJakartaNow(now);
  const [loaded, allergens] = await Promise.all([
    loadPlanAndContext(supabase, profile.id, tanggal),
    loadAllergens(supabase),
  ]);
  const plan = await ensurePlan(supabase, profile, tanggal, "auto", loaded);
  const { ctx } = loaded;
  const swappable = swappableSlots(plan, profile, ctx, tanggal);

  const items: ViewItem[] = plan.items.map((item) => {
    const menu = item.menu_id ? (ctx.catalog.byId.get(item.menu_id) ?? null) : null;
    return {
      item,
      menu,
      porsiRingkas: menu ? ringkasPorsi(menu.porsi, item.multiplier) : "",
      canSwap: swappable[item.slot] ?? false,
    };
  });

  const totals = { kalori: 0, protein: 0, karbohidrat: 0, lemak: 0 };
  for (const { item, menu } of items) {
    if (!menu) continue;
    totals.kalori += item.kalori;
    totals.protein += item.protein;
    totals.karbohidrat += item.karbohidrat;
    totals.lemak += item.lemak;
  }

  return {
    tanggal,
    jam,
    plan: plan.plan,
    items,
    totals,
    userAllergens: pilihAlergen(allergens, ctx.avoid),
    allEmpty: items.every((i) => !i.menu),
  };
}
