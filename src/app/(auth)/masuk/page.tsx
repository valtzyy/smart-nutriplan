import { AuthShell } from "@/components/auth/AuthShell";
import { MasukForm } from "@/components/auth/AuthForms";
import { redirectIfLoggedIn } from "@/lib/auth";
import { safeNextPath } from "@/lib/onboarding";

export const metadata = { title: "Masuk — Smart NutriPlan" };

export default async function MasukPage({ searchParams }: PageProps<"/masuk">) {
  await redirectIfLoggedIn();
  const { next } = await searchParams;
  const safe = safeNextPath(typeof next === "string" ? next : null, "");
  return (
    <AuthShell back="/" title="Selamat datang lagi" subtitle="Masuk untuk melihat meal plan hari ini.">
      <MasukForm next={safe || undefined} />
    </AuthShell>
  );
}
