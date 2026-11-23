import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { TopBar } from "@/components/ui/TopBar";
import { loadAllergens } from "@/lib/allergens";
import { requireOnboarded } from "@/lib/auth";
import { loadAvoidAllergenIds } from "@/lib/mealplan";

export const metadata = { title: "Edit profil — Smart NutriPlan" };

export default async function EditProfilPage() {
  const { supabase, profile: p } = await requireOnboarded();
  const [allergens, ids] = await Promise.all([loadAllergens(supabase), loadAvoidAllergenIds(supabase, p.id)]);
  return (
    <main className="flex flex-1 flex-col gap-6 px-6 pt-6 pb-10">
      <TopBar href="/profil" title="Edit profil" />
      <EditProfileForm
        allergens={allergens}
        initial={{
          nama: p.nama,
          usia: String(p.usia),
          jenis_kelamin: p.jenis_kelamin,
          berat_badan: String(p.berat_badan),
          tinggi_badan: String(p.tinggi_badan),
          aktivitas_fisik: p.aktivitas_fisik,
          tujuan: p.tujuan,
          allergen_ids: ids,
          anggaran_harian: p.anggaran_harian,
        }}
      />
    </main>
  );
}
