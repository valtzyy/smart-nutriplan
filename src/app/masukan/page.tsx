import { MasukanForm } from "@/components/MasukanForm";
import { TopBar } from "@/components/ui/TopBar";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Beri masukan — Smart NutriPlan" };

export default async function MasukanPage() {
  await requireUser();
  return (
    <main className="flex flex-1 flex-col gap-6 px-6 pt-6 pb-12">
      <TopBar href="/beranda" />
      <div className="flex flex-col gap-2">
        <h1 className="text-h2-style text-text">Bantu kami jadi lebih baik</h1>
        <p className="text-body text-text-muted">
          Cuma sekitar 1 menit. Jawab sejujurnya, ya — kritik paling membantu kami.
        </p>
      </div>
      <MasukanForm />
    </main>
  );
}
