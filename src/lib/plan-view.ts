import "server-only";
import { loadAllergens, pilihAlergen } from "./allergens";
import type { OnboardedSession } from "./auth";
import { getJakartaNow } from "./date";
import {
  ensurePlan,
  loadAvoidAllergenIds,
  loadMenuCatalog,
  loadRecentMenuIds,
  swappableSlots,
  type PlanWithItems,
} from "./mealplan";
import type { MealSlot } from "./nutrition";
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

/** Data halaman Beranda / Meal Plan: memastikan meal plan hari ini (Asia/Jakarta) sudah ada. */
export async function loadTodayView(session: OnboardedSession, now = new Date()): Promise<TodayView> {
  const { supabase, profile } = session;
  const { tanggal, jam } = getJakartaNow(now);
  const plan = await ensurePlan(supabase, profile, tanggal, "auto");
  const [catalog, avoid, recent, allergens] = await Promise.all([
    loadMenuCatalog(supabase),
    loadAvoidAllergenIds(supabase, profile.id),
    loadRecentMenuIds(supabase, profile.id, tanggal),
    loadAllergens(supabase),
  ]);
  const swappable: Record<MealSlot, boolean> = swappableSlots(plan, profile, catalog, avoid, recent, tanggal);

  const items: ViewItem[] = plan.items.map((item) => {
    const menu = item.menu_id ? (catalog.byId.get(item.menu_id) ?? null) : null;
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
    userAllergens: pilihAlergen(allergens, avoid),
    allEmpty: items.every((i) => !i.menu),
  };
}
