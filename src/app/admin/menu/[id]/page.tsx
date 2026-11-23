import { notFound } from "next/navigation";
import { MenuForm, type MenuFormState } from "@/components/admin/MenuForm";
import { TopBar } from "@/components/ui/TopBar";
import { loadAllergens } from "@/lib/allergens";
import { requireAdmin } from "@/lib/auth";
import type { MenuRow } from "@/lib/types";

export const metadata = { title: "Edit menu — Smart NutriPlan" };

export default async function MenuEditPage({ params }: PageProps<"/admin/menu/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [{ data }, allergens] = await Promise.all([
    supabase.from("menus").select("*, menu_allergens(allergen_id)").eq("id", id).maybeSingle(),
    loadAllergens(supabase),
  ]);
  if (!data) notFound();
  const m = data as MenuRow & { menu_allergens: { allergen_id: number }[] };
  const str = (n: number | null) => (n == null ? "" : String(n));
  const initial: MenuFormState = {
    slug: m.slug,
    nama: m.nama,
    kategori: m.kategori,
    kalori: str(m.kalori),
    protein: str(m.protein),
    karbohidrat: str(m.karbohidrat),
    lemak: str(m.lemak),
    porsi: m.porsi.map((p) => ({ nama: p.nama, qty: String(p.qty), satuan: p.satuan })),
    bahan: m.bahan,
    langkah: m.langkah,
    cocok_untuk: m.cocok_untuk,
    estimasi_harga: str(m.estimasi_harga),
    waktu_masak_menit: str(m.waktu_masak_menit),
    foto_url: m.foto_url ?? "",
    sumber_gizi: m.sumber_gizi,
    dicek_ahli_gizi: m.dicek_ahli_gizi,
    status: m.status,
    allergen_ids: m.menu_allergens.map((a) => a.allergen_id),
  };
  return (
    <main className="flex flex-col gap-6 px-6 py-6">
      <TopBar href="/admin/menu" title="Edit menu" />
      <MenuForm id={m.id} initial={initial} allergens={allergens} />
    </main>
  );
}
