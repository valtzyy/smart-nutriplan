import { RegenerateButton, SwapButton } from "@/components/plan/PlanControls";
import { AllSlotsEmpty, SlotEmpty } from "@/components/plan/SlotEmpty";
import { Badge } from "@/components/ui/Badge";
import { BottomNav, BottomNavSpacer } from "@/components/ui/BottomNav";
import { MealCard } from "@/components/ui/MealCard";
import { requireOnboarded } from "@/lib/auth";
import { formatTanggal } from "@/lib/date";
import { logEvent } from "@/lib/events";
import { formatAngka, gabungDaftar, SLOT_LABEL } from "@/lib/labels";
import { MAKS_BUAT_ULANG } from "@/lib/nutrition/constants";
import { loadTodayView } from "@/lib/plan-view";

export const metadata = { title: "Meal plan hari ini — Smart NutriPlan" };

export default async function MealPlanPage() {
  const session = await requireOnboarded();
  const view = await loadTodayView(session);
  logEvent(session.supabase, session.user.id, "plan_viewed", { page: "meal-plan" });
  const sisa = Math.max(0, MAKS_BUAT_ULANG - view.plan.regenerate_count);
  const alergen = view.userAllergens.map((a) => a.nama.toLowerCase());

  return (
    <>
      <main className="flex flex-1 flex-col gap-5 px-6 pt-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-h2-style text-text">Meal plan hari ini</h1>
          <span className="text-small text-text-muted">{formatTanggal(view.tanggal)}</span>
        </header>
        <div className="flex flex-wrap gap-2">
          <Badge>Target {formatAngka(view.plan.target_kalori)} kkal</Badge>
          <Badge variant="accent">Total {formatAngka(view.totals.kalori)} kkal</Badge>
        </div>

        {view.allEmpty ? (
          <AllSlotsEmpty />
        ) : (
          <ul className="flex flex-col gap-3">
            {view.items.map(({ item, menu, porsiRingkas, canSwap }) => (
              <li key={item.slot}>
                {menu ? (
                  <MealCard
                    href={`/menu/${menu.slug}?item=${item.id}`}
                    slotLabel={SLOT_LABEL[item.slot]}
                    nama={menu.nama}
                    porsi={porsiRingkas}
                    kalori={item.kalori}
                    fotoUrl={menu.foto_url}
                    labelSelisih={item.label_selisih}
                    swap={<SwapButton slot={item.slot} enabled={canSwap} slotLabel={SLOT_LABEL[item.slot]} />}
                  />
                ) : (
                  <SlotEmpty slot={item.slot} />
                )}
              </li>
            ))}
          </ul>
        )}

        {alergen.length > 0 && !view.allEmpty && (
          <p className="text-small text-text-muted">Semua menu bebas {gabungDaftar(alergen)}, sesuai preferensimu.</p>
        )}

        {!view.allEmpty && <RegenerateButton sisa={sisa} />}
        <BottomNavSpacer />
      </main>
      <BottomNav />
    </>
  );
}
