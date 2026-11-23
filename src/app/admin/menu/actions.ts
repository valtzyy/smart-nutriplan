"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { PESAN_GALAT } from "@/lib/brand";
import type { ActionState } from "@/lib/types";
import { fieldErrors, menuFormSchema, type MenuFormInput } from "@/lib/validation";

/** Simpan menu (buat baru bila `id` null). Data dikirim sebagai objek JSON dari form klien. */
export async function simpanMenu(id: string | null, input: MenuFormInput): Promise<ActionState> {
  const parsed = menuFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const { supabase } = await requireAdmin();
  const { allergen_ids, ...menu } = parsed.data;

  let menuId = id;
  if (id) {
    const { error } = await supabase.from("menus").update(menu).eq("id", id);
    if (error) return mapError(error);
  } else {
    const { data, error } = await supabase.from("menus").insert(menu).select("id").single();
    if (error || !data) return mapError(error);
    menuId = (data as { id: string }).id;
  }

  const del = await supabase.from("menu_allergens").delete().eq("menu_id", menuId);
  if (del.error) return { ok: false, error: PESAN_GALAT };
  const ids = [...new Set(allergen_ids)];
  if (ids.length > 0) {
    const ins = await supabase.from("menu_allergens").insert(ids.map((allergen_id) => ({ menu_id: menuId, allergen_id })));
    if (ins.error) return { ok: false, error: PESAN_GALAT };
  }
  revalidatePath("/admin/menu");
  redirect("/admin/menu");
}

function mapError(error: { code?: string; message?: string } | null): ActionState {
  if (error?.code === "23505") return { ok: false, fieldErrors: { slug: "Slug ini sudah dipakai menu lain." } };
  return { ok: false, error: PESAN_GALAT };
}
