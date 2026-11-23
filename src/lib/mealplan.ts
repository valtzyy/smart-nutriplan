import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { tambahHari } from "./date";
import { logEvents } from "./events";
import {
  generateMealPlan,
  hitungTargetKalori,
  HARI_RIWAYAT,
  isEmptySlot,
  MAKS_BUAT_ULANG,
  MEAL_SLOTS,
  swapSlot,
  type GeneratorMenu,
  type MealSlot,
  type PlanSlotResult,
} from "./nutrition";
import type { CompleteProfile, EventName, MealPlanItemRow, MealPlanRow, MenuRow } from "./types";

export type PlanSource = "auto" | "onboarding" | "regenerate" | "profile_update";

export interface PlanWithItems {
  plan: MealPlanRow;
  items: MealPlanItemRow[];
}

type MenuWithAllergens = MenuRow & { menu_allergens: { allergen_id: number }[] };

export interface MenuCatalog {
  generatorMenus: GeneratorMenu[];
  byId: Map<string, MenuRow>;
}

/** Semua menu aktif + alergennya. */
export async function loadMenuCatalog(supabase: SupabaseClient): Promise<MenuCatalog> {
  const { data, error } = await supabase
    .from("menus")
    .select("*, menu_allergens(allergen_id)")
    .eq("status", "aktif")
    .order("slug");
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as MenuWithAllergens[];
  const byId = new Map<string, MenuRow>();
  const generatorMenus: GeneratorMenu[] = rows.map((r) => {
    const { menu_allergens, ...menu } = r;
    byId.set(menu.id, menu);
    return {
      id: menu.id,
      kategori: menu.kategori,
      kalori: Number(menu.kalori),
      protein: Number(menu.protein),
      karbohidrat: Number(menu.karbohidrat),
      lemak: Number(menu.lemak),
      cocokUntuk: menu.cocok_untuk,
      allergenIds: menu_allergens.map((a) => a.allergen_id),
    };
  });
  return { generatorMenus, byId };
}

export async function loadAvoidAllergenIds(supabase: SupabaseClient, userId: string): Promise<number[]> {
  const { data, error } = await supabase.from("profile_allergens").select("allergen_id").eq("profile_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: { allergen_id: number }) => r.allergen_id);
}

/** Menu di meal plan 3 hari sebelum `tanggal`. */
export async function loadRecentMenuIds(supabase: SupabaseClient, userId: string, tanggal: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("meal_plans")
    .select("tanggal, meal_plan_items(menu_id)")
    .eq("user_id", userId)
    .gte("tanggal", tambahHari(tanggal, -HARI_RIWAYAT))
    .lte("tanggal", tambahHari(tanggal, -1));
  if (error) throw new Error(error.message);
  const ids = new Set<string>();
  for (const p of (data ?? []) as { meal_plan_items: { menu_id: string | null }[] }[]) {
    for (const it of p.meal_plan_items) if (it.menu_id) ids.add(it.menu_id);
  }
  return [...ids];
}

export async function loadPlan(supabase: SupabaseClient, userId: string, tanggal: string): Promise<PlanWithItems | null> {
  const { data, error } = await supabase
    .from("meal_plans")
    .select("*, meal_plan_items(*)")
    .eq("user_id", userId)
    .eq("tanggal", tanggal)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const { meal_plan_items, ...plan } = data as MealPlanRow & { meal_plan_items: MealPlanItemRow[] };
  const items = meal_plan_items
    .map((i) => ({ ...i, multiplier: Number(i.multiplier) }))
    .sort((a, b) => MEAL_SLOTS.indexOf(a.slot) - MEAL_SLOTS.indexOf(b.slot));
  return { plan, items };
}

function targetDari(profile: CompleteProfile): number {
  return hitungTargetKalori({
    jenisKelamin: profile.jenis_kelamin,
    usia: profile.usia,
    beratBadan: Number(profile.berat_badan),
    tinggiBadan: Number(profile.tinggi_badan),
    aktivitas: profile.aktivitas_fisik,
    tujuan: profile.tujuan,
  }).target;
}

function keBaris(planId: string, it: PlanSlotResult) {
  if (isEmptySlot(it)) {
    return {
      meal_plan_id: planId,
      slot: it.slot,
      menu_id: null,
      multiplier: 1,
      kalori: 0,
      protein: 0,
      karbohidrat: 0,
      lemak: 0,
      target_kalori_slot: it.targetKaloriSlot,
      label_selisih: false,
    };
  }
  return {
    meal_plan_id: planId,
    slot: it.slot,
    menu_id: it.menuId,
    multiplier: it.multiplier,
    kalori: it.kalori,
    protein: it.protein,
    karbohidrat: it.karbohidrat,
    lemak: it.lemak,
    target_kalori_slot: it.targetKaloriSlot,
    label_selisih: it.labelSelisih,
  };
}

async function simpanItems(supabase: SupabaseClient, planId: string, items: PlanSlotResult[]) {
  const { error } = await supabase
    .from("meal_plan_items")
    .upsert(items.map((it) => keBaris(planId, it)), { onConflict: "meal_plan_id,slot" });
  if (error) throw new Error(error.message);
}

function eventGenerasi(source: PlanSource, items: PlanSlotResult[]) {
  const events: Array<{ nama: EventName; meta?: Record<string, unknown> }> = [
    { nama: "plan_generated", meta: { source } },
  ];
  for (const it of items) if (isEmptySlot(it)) events.push({ nama: "slot_empty", meta: { slot: it.slot } });
  return events;
}

/**
 * Pastikan meal plan `tanggal` ada (dibuat sekali per hari). Aman terhadap request bersamaan:
 * insert `on conflict do nothing`, lalu baca yang sudah ada. Item dibuat deterministik dari seed,
 * jadi dua request yang sama-sama melengkapi item menghasilkan baris identik.
 */
export async function ensurePlan(
  supabase: SupabaseClient,
  profile: CompleteProfile,
  tanggal: string,
  source: PlanSource,
): Promise<PlanWithItems> {
  const existing = await loadPlan(supabase, profile.id, tanggal);
  if (existing && existing.items.length === MEAL_SLOTS.length) return existing;

  const target = existing?.plan.target_kalori ?? targetDari(profile);
  let plan = existing?.plan ?? null;
  let created = false;
  if (!plan) {
    const { data, error } = await supabase
      .from("meal_plans")
      .upsert(
        { user_id: profile.id, tanggal, target_kalori: target },
        { onConflict: "user_id,tanggal", ignoreDuplicates: true },
      )
      .select();
    if (error) throw new Error(error.message);
    plan = ((data ?? []) as MealPlanRow[])[0] ?? null;
    created = plan != null;
    if (!plan) {
      const again = await loadPlan(supabase, profile.id, tanggal);
      if (!again) throw new Error("Meal plan tidak ditemukan setelah dibuat.");
      if (again.items.length === MEAL_SLOTS.length) return again;
      plan = again.plan;
    }
  }

  const [catalog, avoid, recent] = await Promise.all([
    loadMenuCatalog(supabase),
    loadAvoidAllergenIds(supabase, profile.id),
    loadRecentMenuIds(supabase, profile.id, tanggal),
  ]);
  const result = generateMealPlan({
    target: plan.target_kalori,
    tujuan: profile.tujuan,
    avoidAllergenIds: avoid,
    menus: catalog.generatorMenus,
    recentMenuIds: recent,
    seed: `${profile.id}:${tanggal}:${plan.regenerate_count}`,
  });
  await simpanItems(supabase, plan.id, result.items);
  if (created) await logEvents(supabase, profile.id, eventGenerasi(source, result.items));

  const final = await loadPlan(supabase, profile.id, tanggal);
  if (!final) throw new Error("Meal plan tidak ditemukan.");
  return final;
}

export class RegenerateLimitError extends Error {
  constructor() {
    super("Batas buat ulang hari ini sudah habis. Coba ganti per menu.");
  }
}

/**
 * Buat ulang keempat slot. `regenerate` menambah hitungan (maks 3/hari);
 * `profile_update` memakai target profil terbaru dan tidak menambah hitungan.
 */
export async function regeneratePlan(
  supabase: SupabaseClient,
  profile: CompleteProfile,
  tanggal: string,
  source: "regenerate" | "profile_update",
): Promise<void> {
  const current = await loadPlan(supabase, profile.id, tanggal);
  if (!current) {
    await ensurePlan(supabase, profile, tanggal, source === "profile_update" ? "profile_update" : "auto");
    return;
  }
  const { plan, items } = current;
  if (source === "regenerate" && plan.regenerate_count >= MAKS_BUAT_ULANG) throw new RegenerateLimitError();

  const nextCount = source === "regenerate" ? plan.regenerate_count + 1 : plan.regenerate_count;
  const target = source === "profile_update" ? targetDari(profile) : plan.target_kalori;

  // Klaim hitungan dulu (optimistic lock) supaya dua klik bersamaan tidak melewati batas.
  const { data: claimed, error: claimErr } = await supabase
    .from("meal_plans")
    .update({ regenerate_count: nextCount, target_kalori: target })
    .eq("id", plan.id)
    .eq("regenerate_count", plan.regenerate_count)
    .select("id");
  if (claimErr) throw new Error(claimErr.message);
  if (!claimed || claimed.length === 0) {
    if (source === "regenerate") throw new RegenerateLimitError();
  }

  const [catalog, avoid, recent] = await Promise.all([
    loadMenuCatalog(supabase),
    loadAvoidAllergenIds(supabase, profile.id),
    loadRecentMenuIds(supabase, profile.id, tanggal),
  ]);
  const result = generateMealPlan({
    target,
    tujuan: profile.tujuan,
    avoidAllergenIds: avoid,
    menus: catalog.generatorMenus,
    recentMenuIds: recent,
    currentPlanMenuIds:
      source === "regenerate" ? items.map((i) => i.menu_id).filter((x): x is string => x != null) : undefined,
    seed:
      source === "regenerate"
        ? `${profile.id}:${tanggal}:${nextCount}`
        : `${profile.id}:${tanggal}:${nextCount}:${Date.parse(profile.updated_at) || 0}`,
  });
  await simpanItems(supabase, plan.id, result.items);
  await logEvents(supabase, profile.id, eventGenerasi(source, result.items));
}

/** Ganti satu slot ke kandidat berikutnya. Mengembalikan `false` bila tidak ada menu lain. */
export async function swapPlanSlot(
  supabase: SupabaseClient,
  profile: CompleteProfile,
  tanggal: string,
  slot: MealSlot,
): Promise<boolean> {
  const current = await loadPlan(supabase, profile.id, tanggal);
  if (!current) throw new Error("Meal plan hari ini belum ada.");
  const item = current.items.find((i) => i.slot === slot);
  if (!item) throw new Error("Slot tidak ditemukan.");

  const [catalog, avoid, recent] = await Promise.all([
    loadMenuCatalog(supabase),
    loadAvoidAllergenIds(supabase, profile.id),
    loadRecentMenuIds(supabase, profile.id, tanggal),
  ]);
  const next = swapSlot({
    slot,
    currentMenuId: item.menu_id,
    otherSlotMenuIds: current.items
      .filter((i) => i.slot !== slot && i.menu_id)
      .map((i) => i.menu_id as string),
    target: current.plan.target_kalori,
    tujuan: profile.tujuan,
    avoidAllergenIds: avoid,
    menus: catalog.generatorMenus,
    recentMenuIds: recent,
    seed: `${profile.id}:${tanggal}`,
  });
  if (!next) return false;

  await simpanItems(supabase, current.plan.id, [next]);
  await logEvents(supabase, profile.id, [
    {
      nama: "menu_swapped",
      meta: {
        slot,
        from: item.menu_id ? (catalog.byId.get(item.menu_id)?.slug ?? item.menu_id) : null,
        to: catalog.byId.get(next.menuId)?.slug ?? next.menuId,
      },
    },
  ]);
  return true;
}

/** Slot mana yang punya alternatif untuk tombol "Ganti" (tanpa I/O tambahan). */
export function swappableSlots(
  plan: PlanWithItems,
  profile: CompleteProfile,
  catalog: MenuCatalog,
  avoid: number[],
  recent: string[],
  tanggal: string,
): Record<MealSlot, boolean> {
  const out = {} as Record<MealSlot, boolean>;
  for (const it of plan.items) {
    out[it.slot] =
      swapSlot({
        slot: it.slot,
        currentMenuId: it.menu_id,
        otherSlotMenuIds: plan.items.filter((o) => o.slot !== it.slot && o.menu_id).map((o) => o.menu_id as string),
        target: plan.plan.target_kalori,
        tujuan: profile.tujuan,
        avoidAllergenIds: avoid,
        menus: catalog.generatorMenus,
        recentMenuIds: recent,
        seed: `${profile.id}:${tanggal}`,
      }) !== null;
  }
  return out;
}
