import { AuthShell } from "@/components/auth/AuthShell";
import { LupaSandiForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Lupa kata sandi — Smart NutriPlan" };

export default function LupaSandiPage() {
  return (
    <AuthShell
      back="/masuk"
      title="Lupa kata sandi?"
      subtitle="Tulis email akunmu. Kami kirim tautan untuk membuat kata sandi baru."
    >
      <LupaSandiForm />
    </AuthShell>
  );
}
