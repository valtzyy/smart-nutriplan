import { AuthShell } from "@/components/auth/AuthShell";
import { DaftarForm } from "@/components/auth/AuthForms";
import { redirectIfLoggedIn } from "@/lib/auth";
import { normalisasiKodeRujukan } from "@/lib/validation";

export const metadata = { title: "Buat akun — Smart NutriPlan" };

export default async function DaftarPage({ searchParams }: PageProps<"/daftar">) {
  await redirectIfLoggedIn();
  const { ref } = await searchParams;
  const kodeRujukan = normalisasiKodeRujukan(ref) ?? undefined;
  return (
    <AuthShell back="/" title="Buat akun" subtitle="Supaya meal plan-mu tersimpan dan bisa dibuka lagi kapan saja.">
      <DaftarForm kodeRujukan={kodeRujukan} />
    </AuthShell>
  );
}
