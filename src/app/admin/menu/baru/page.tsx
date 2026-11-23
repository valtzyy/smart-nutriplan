import { MENU_KOSONG, MenuForm } from "@/components/admin/MenuForm";
import { TopBar } from "@/components/ui/TopBar";
import { loadAllergens } from "@/lib/allergens";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Tambah menu — Smart NutriPlan" };

export default async function MenuBaruPage() {
  const { supabase } = await requireAdmin();
  const allergens = await loadAllergens(supabase);
  return (
    <main className="flex flex-col gap-6 px-6 py-6">
      <TopBar href="/admin/menu" title="Tambah menu" />
      <MenuForm id={null} initial={MENU_KOSONG} allergens={allergens} />
    </main>
  );
}
