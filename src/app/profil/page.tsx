import { LogOut, Pencil } from "lucide-react";
import Link from "next/link";
import { keluarAction } from "@/app/(auth)/actions";
import { HealthDataInfo } from "@/components/profile/HealthDataInfo";
import { Avatar } from "@/components/ui/Avatar";
import { BottomNav, BottomNavSpacer } from "@/components/ui/BottomNav";
import { Button, ButtonLink } from "@/components/ui/Button";
import { loadAllergens, pilihAlergen } from "@/lib/allergens";
import { requireOnboarded } from "@/lib/auth";
import { AKTIVITAS_LABEL, formatAngka, GENDER_LABEL, TUJUAN_LABEL } from "@/lib/labels";
import { loadAvoidAllergenIds } from "@/lib/mealplan";
import { hitungTargetKalori } from "@/lib/nutrition/calories";

export const metadata = { title: "Profil — Smart NutriPlan" };

export default async function ProfilPage() {
  const { supabase, user, profile: p } = await requireOnboarded();
  const [allergens, ids] = await Promise.all([loadAllergens(supabase), loadAvoidAllergenIds(supabase, p.id)]);
  const alergen = pilihAlergen(allergens, ids);
  const kalori = hitungTargetKalori({
    jenisKelamin: p.jenis_kelamin,
    usia: p.usia,
    beratBadan: p.berat_badan,
    tinggiBadan: p.tinggi_badan,
    aktivitas: p.aktivitas_fisik,
    tujuan: p.tujuan,
  });

  const rows = [
    { label: "Usia", value: `${p.usia} tahun` },
    { label: "Jenis kelamin", value: GENDER_LABEL[p.jenis_kelamin] },
    { label: "Berat badan", value: `${formatAngka(p.berat_badan)} kg` },
    { label: "Tinggi badan", value: `${formatAngka(p.tinggi_badan)} cm` },
    { label: "Aktivitas", value: AKTIVITAS_LABEL[p.aktivitas_fisik] },
    { label: "Tujuan", value: TUJUAN_LABEL[p.tujuan] },
    { label: "Target kalori", value: `${formatAngka(kalori.target)} kkal` },
    { label: "Dihindari", value: alergen.length ? alergen.map((a) => a.nama).join(", ") : "Tidak ada" },
  ];

  return (
    <>
      <main className="flex flex-1 flex-col gap-6 px-6 pt-6">
        <h1 className="text-h2-style text-text">Profil</h1>
        <section className="flex items-center gap-4">
          <Avatar nama={p.nama || "?"} size="lg" />
          <div className="flex min-w-0 flex-col">
            <span className="text-h3-style text-text">{p.nama}</span>
            <span className="truncate text-small text-text-muted">{user.email}</span>
          </div>
        </section>

        <dl className="divide-y divide-border rounded-lg border border-border bg-surface">
          {rows.map((r) => (
            <div key={r.label} className="flex items-start justify-between gap-4 px-4 py-3">
              <dt className="text-small text-text-muted">{r.label}</dt>
              <dd className="text-right text-body font-semibold text-text">{r.value}</dd>
            </div>
          ))}
        </dl>
        {kalori.kenaBatasBawah && (
          <p className="text-caption text-text-muted">
            Target kalorimu memakai batas aman minimum supaya asupan tetap cukup.
          </p>
        )}

        <div className="flex flex-col gap-3">
          <ButtonLink href="/profil/edit">
            <Pencil size={18} aria-hidden />
            Edit profil
          </ButtonLink>
          <form action={keluarAction}>
            <Button type="submit" variant="secondary">
              <LogOut size={18} aria-hidden />
              Keluar
            </Button>
          </form>
          {p.role === "admin" && (
            <Link href="/admin" className="mx-auto min-h-11 py-3 text-small font-semibold text-primary-strong">
              Buka halaman admin
            </Link>
          )}
          <HealthDataInfo />
        </div>
        <BottomNavSpacer />
      </main>
      <BottomNav />
    </>
  );
}
