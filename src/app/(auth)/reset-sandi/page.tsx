import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetSandiForm } from "@/components/auth/AuthForms";
import { getSession } from "@/lib/auth";

export const metadata = { title: "Atur sandi baru — Smart NutriPlan" };

export default async function ResetSandiPage() {
  // Butuh sesi recovery dari tautan email (ditukar di /auth/callback).
  const s = await getSession();
  if (!s) redirect("/lupa-sandi");
  return (
    <AuthShell back="/masuk" title="Atur sandi baru" subtitle="Buat kata sandi baru minimal 8 karakter.">
      <ResetSandiForm />
    </AuthShell>
  );
}
