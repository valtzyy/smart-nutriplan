import { ChevronRight, Flame, MessageSquareHeart, Moon } from "lucide-react";
import Link from "next/link";
import { BiayaCard } from "@/components/plan/BiayaCard";
import { AllSlotsEmpty, SlotEmpty } from "@/components/plan/SlotEmpty";
import { Avatar } from "@/components/ui/Avatar";
import { BottomNav, BottomNavSpacer } from "@/components/ui/BottomNav";
import { ButtonLink } from "@/components/ui/Button";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { InfoBox } from "@/components/ui/InfoBox";
import { MealCard } from "@/components/ui/MealCard";
import { requireOnboarded } from "@/lib/auth";
import { formatTanggal, nextMealSlot } from "@/lib/date";
import { logEvent } from "@/lib/events";
import { formatAngka, SLOT_LABEL } from "@/lib/labels";
import { loadTodayView } from "@/lib/plan-view";

export const metadata = { title: "Beranda — Smart NutriPlan" };

export default async function BerandaPage() {
  const session = await requireOnboarded();
  const view = await loadTodayView(session);
  logEvent(session.supabase, session.user.id, "plan_viewed", { page: "beranda" });

  const target = view.plan.target_kalori;
  const persen = target > 0 ? Math.min(100, Math.round((view.totals.kalori / target) * 100)) : 0;
  const slotBerikut = nextMealSlot(view.jam);
  const berikut = slotBerikut ? view.items.find((i) => i.item.slot === slotBerikut) : undefined;

  return (
    <>
      <main className="flex flex-1 flex-col gap-6 px-6 pt-6">
        <header className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-small text-text-muted">{formatTanggal(view.tanggal)}</span>
            <h1 className="text-h2-style text-text">Hai, {session.profile.nama || "kamu"}</h1>
          </div>
          <Avatar nama={session.profile.nama || "?"} />
        </header>

        <section className="flex flex-col gap-4 rounded-lg bg-primary-strong p-5 text-on-primary">
          <div className="flex flex-col gap-1">
            <span className="text-small">Target kalori hari ini</span>
            <span className="flex items-baseline gap-2">
              <span className="font-heading text-display font-bold">{formatAngka(target)}</span>
              <span className="text-body">kkal</span>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-caption">
              <span>Rencana hari ini vs target</span>
              <span>{persen}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-on-primary/25"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={persen}
              aria-label="Rencana hari ini vs target"
            >
              <div className="h-full rounded-full bg-accent" style={{ width: `${persen}%` }} />
            </div>
            <span className="flex items-center gap-1.5 text-small">
              <Flame size={16} aria-hidden className="text-accent" />
              Meal plan hari ini {formatAngka(view.totals.kalori)} kkal
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Protein", value: view.totals.protein },
              { label: "Karbo", value: view.totals.karbohidrat },
              { label: "Lemak", value: view.totals.lemak },
            ].map((m) => (
              <div key={m.label} className="flex flex-col items-center rounded-md bg-on-primary/15 px-2 py-3">
                <span className="text-h3-style">{m.value} g</span>
                <span className="text-caption">{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        {view.allEmpty ? (
          <AllSlotsEmpty />
        ) : (
          <section className="flex flex-col gap-3">
            <h2 className="text-h3-style text-text">Makan berikutnya</h2>
            {!slotBerikut ? (
              <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
                <Moon size={22} aria-hidden className="shrink-0 text-primary-strong" />
                <p className="text-body text-text">
                  Selesai untuk hari ini. Meal plan besok dibuat saat kamu membuka aplikasi.
                </p>
              </div>
            ) : berikut?.menu ? (
              <MealCard
                href={`/menu/${berikut.menu.slug}?item=${berikut.item.id}`}
                slotLabel={SLOT_LABEL[berikut.item.slot]}
                nama={berikut.menu.nama}
                porsi={berikut.porsiRingkas}
                kalori={berikut.item.kalori}
                fotoUrl={berikut.menu.foto_url}
                labelSelisih={berikut.item.label_selisih}
              />
            ) : (
              <SlotEmpty slot={slotBerikut} />
            )}
          </section>
        )}

        <ButtonLink href="/meal-plan" variant="secondary">
          Lihat meal plan lengkap
        </ButtonLink>

        {!view.allEmpty && <BiayaCard biaya={view.biaya} />}

        <Link
          href="/masukan"
          className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-colors active:bg-primary-soft/70"
        >
          <MessageSquareHeart size={22} aria-hidden className="shrink-0 text-primary-strong" />
          <span className="flex flex-1 flex-col">
            <span className="text-body font-semibold text-text">Bantu kami jadi lebih baik</span>
            <span className="text-small text-text-muted">Beri masukan, cuma 1 menit</span>
          </span>
          <ChevronRight size={18} aria-hidden className="text-text-muted" />
        </Link>

        <InfoBox variant="tips">Takaran rumah tangga: 1 centong nasi kira-kira 100 gram nasi matang.</InfoBox>
        <Disclaimer className="pb-2" />
        <BottomNavSpacer />
      </main>
      <BottomNav />
    </>
  );
}
