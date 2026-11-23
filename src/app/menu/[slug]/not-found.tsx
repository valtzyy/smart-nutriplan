import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function MenuNotFound() {
  return (
    <main className="flex flex-1 flex-col justify-center gap-6 px-6 py-10">
      <EmptyState
        title="Menu tidak ditemukan"
        text="Mungkin menu ini sudah tidak tersedia. Yuk, kembali ke meal plan-mu."
        action={<ButtonLink href="/meal-plan">Kembali ke Meal Plan</ButtonLink>}
      />
    </main>
  );
}
