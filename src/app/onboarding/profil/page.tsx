import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { ProfilTubuhForm } from "@/components/onboarding/OnboardingForms";
import { requireOnboardingStep } from "@/lib/auth";

export const metadata = { title: "Kenalan dulu — Smart NutriPlan" };

export default async function OnboardingProfilPage() {
  const { profile: p } = await requireOnboardingStep(1);
  return (
    <OnboardingShell
      step={1}
      back="/"
      title="Kenalan dulu, yuk"
      subtitle="Data ini dipakai untuk menghitung kebutuhan kalori harianmu."
    >
      <ProfilTubuhForm
        initial={{
          usia: p.usia?.toString() ?? "",
          jenis_kelamin: p.jenis_kelamin ?? "",
          berat_badan: p.berat_badan?.toString() ?? "",
          tinggi_badan: p.tinggi_badan?.toString() ?? "",
          aktivitas_fisik: p.aktivitas_fisik ?? "",
        }}
      />
    </OnboardingShell>
  );
}
