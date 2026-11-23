import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { PreferensiForm } from "@/components/onboarding/OnboardingForms";
import { requireOnboardingStep } from "@/lib/auth";
import { loadAllergens } from "@/lib/allergens";
import { loadAvoidAllergenIds } from "@/lib/mealplan";

export const metadata = { title: "Preferensi — Smart NutriPlan" };

export default async function OnboardingPreferensiPage() {
  const { supabase, user, profile } = await requireOnboardingStep(3);
  const [allergens, selected] = await Promise.all([loadAllergens(supabase), loadAvoidAllergenIds(supabase, user.id)]);
  return (
    <OnboardingShell
      step={3}
      back="/onboarding/tujuan"
      title="Ada yang perlu dihindari?"
      subtitle="Menu yang mengandung bahan ini tidak akan muncul di meal plan-mu."
    >
      <PreferensiForm allergens={allergens} initial={selected} anggaran={profile.anggaran_harian} />
    </OnboardingShell>
  );
}
