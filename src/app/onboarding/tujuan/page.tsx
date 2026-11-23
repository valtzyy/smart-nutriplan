import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { TujuanForm } from "@/components/onboarding/OnboardingForms";
import { requireOnboardingStep } from "@/lib/auth";

export const metadata = { title: "Tujuan — Smart NutriPlan" };

export default async function OnboardingTujuanPage() {
  const { profile } = await requireOnboardingStep(2);
  return (
    <OnboardingShell
      step={2}
      back="/onboarding/profil"
      title="Apa tujuan pola makanmu?"
      subtitle="Pilih satu. Kamu bisa menggantinya kapan saja di Profil."
    >
      <TujuanForm initial={profile.tujuan ?? ""} />
    </OnboardingShell>
  );
}
