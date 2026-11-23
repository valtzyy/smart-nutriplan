import { AuthShell } from "@/components/auth/AuthShell";
import { DaftarForm } from "@/components/auth/AuthForms";
import { redirectIfLoggedIn } from "@/lib/auth";

export const metadata = { title: "Buat akun — Smart NutriPlan" };

export default async function DaftarPage() {
  await redirectIfLoggedIn();
  return (
    <AuthShell back="/" title="Buat akun" subtitle="Supaya meal plan-mu tersimpan dan bisa dibuka lagi kapan saja.">
      <DaftarForm />
    </AuthShell>
  );
}
