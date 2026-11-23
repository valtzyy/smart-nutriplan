import { CsvButton } from "@/components/admin/CsvButton";
import { fetchAll, fetchAllOrNull } from "@/lib/admin-data";
import {
  computeAdminMetrics,
  toCsv,
  type MetricEvent,
  type MetricFeedback,
  type MetricPlan,
  type MetricProfile,
} from "@/lib/admin-metrics";
import { requireAdmin } from "@/lib/auth";
import { formatTanggal, getJakartaNow, tambahHari } from "@/lib/date";
import { formatAngka } from "@/lib/labels";

export const metadata = { title: "Admin — Smart NutriPlan" };

export default async function AdminPage() {
  const { supabase } = await requireAdmin();
  const today = getJakartaNow(new Date()).tanggal;
  // Kolom/tabel migrasi 0003 dibaca dengan fallback supaya halaman tetap jalan sebelum migrasi dijalankan.
  const [profilesBaru, events, plans, feedback] = await Promise.all([
    fetchAllOrNull<MetricProfile>(supabase, "profiles", "id, created_at, onboarding_selesai, dirujuk_oleh"),
    fetchAll<MetricEvent>(supabase, "events", "id, user_id, nama, created_at"),
    fetchAll<MetricPlan>(supabase, "meal_plans", "id, tanggal", { column: "tanggal", gte: tambahHari(today, -13) }),
    fetchAllOrNull<MetricFeedback>(supabase, "feedback", "id, nps, created_at"),
  ]);
  const profiles =
    profilesBaru ?? (await fetchAll<MetricProfile>(supabase, "profiles", "id, created_at, onboarding_selesai"));
  const migrasi0003 = profilesBaru !== null && feedback !== null;
  const m = computeAdminMetrics({ profiles, events, plans, feedback: feedback ?? [], today });
  const pct = (v: number | null) => (v == null ? "—" : `${v.toLocaleString("id-ID")}%`);
  const a = m.aarrr;
  const tren = a.akuisisi7Hari - a.akuisisi7HariSebelumnya;
  const aarrr = [
    {
      tahap: "Acquisition",
      label: "Pendaftar baru 7 hari",
      value: formatAngka(a.akuisisi7Hari),
      note: `${tren >= 0 ? "+" : ""}${tren} dari 7 hari sebelumnya`,
    },
    {
      tahap: "Activation",
      label: "Onboarding + buka resep",
      value: pct(a.aktivasi),
      note: `${a.aktivasiJumlah} pengguna · target > 40%`,
    },
    {
      tahap: "Retention",
      label: "Kembali dalam 7 hari (D7)",
      value: pct(a.retensiD7),
      note: "target > 20%",
    },
    {
      tahap: "Referral",
      label: "Datang lewat rujukan",
      value: pct(a.rujukan),
      note: `${a.rujukanJumlah} pengguna · target > 10%`,
    },
    {
      tahap: "NPS",
      label: "Net Promoter Score",
      value: a.nps.skor == null ? "—" : String(a.nps.skor),
      note: `${a.nps.jumlah} jawaban · ${a.nps.promotor} promotor · ${a.nps.detraktor} detraktor`,
    },
    {
      tahap: "Revenue",
      label: "Konversi berbayar",
      value: "—",
      note: "Belum ada fitur berbayar (ditunda, KK 7.2)",
    },
  ];

  const kartu = [
    { label: "Total pengguna", value: formatAngka(m.totalPengguna) },
    { label: "Selesai onboarding", value: formatAngka(m.selesaiOnboarding) },
    { label: "Aktif hari ini", value: formatAngka(m.aktifHariIni) },
    { label: "Aktif 7 hari terakhir", value: formatAngka(m.aktif7Hari) },
    { label: "Retensi D1", value: m.retensiD1 == null ? "—" : `${m.retensiD1.toLocaleString("id-ID")}%` },
    { label: "Meal plan dibuat hari ini", value: formatAngka(m.mealPlanHariIni) },
    { label: "Resep dibuka 7 hari terakhir", value: formatAngka(m.resepDibuka7Hari) },
    { label: "Slot kosong 7 hari terakhir", value: formatAngka(m.slotKosong7Hari) },
  ];

  return (
    <main className="flex flex-col gap-6 px-6 py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-h2-style text-text">Metrik traksi</h1>
        <p className="text-small text-text-muted">Per {formatTanggal(today)} (Asia/Jakarta)</p>
      </div>
      <section className="grid grid-cols-2 gap-3">
        {kartu.map((k) => (
          <div key={k.label} className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4">
            <span className="text-h2-style text-text">{k.value}</span>
            <span className="text-small text-text-muted">{k.label}</span>
          </div>
        ))}
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-h3-style text-text">AARRR</h2>
        {!migrasi0003 && (
          <p className="rounded-md bg-accent-soft px-4 py-3 text-small text-text">
            Rujukan dan NPS butuh migrasi <code>0003_feedback_referral.sql</code>. Jalankan di Supabase → SQL Editor.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          {aarrr.map((k) => (
            <div key={k.tahap} className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4">
              <span className="text-caption font-semibold uppercase text-primary-strong">{k.tahap}</span>
              <span className="text-h2-style text-text">{k.value}</span>
              <span className="text-small text-text">{k.label}</span>
              <span className="text-caption text-text-muted">{k.note}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-h3-style text-text">14 hari terakhir</h2>
          <CsvButton csv={toCsv(m.harian)} filename={`nutriplan-metrik-${today}.csv`} />
        </div>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-small">
            <thead className="bg-primary-soft text-text">
              <tr>
                <th className="px-3 py-2 font-semibold">Tanggal</th>
                <th className="px-3 py-2 text-right font-semibold">Baru</th>
                <th className="px-3 py-2 text-right font-semibold">Aktif</th>
                <th className="px-3 py-2 text-right font-semibold">Meal plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {m.harian.map((r) => (
                <tr key={r.tanggal}>
                  <td className="px-3 py-2 whitespace-nowrap">{r.tanggal}</td>
                  <td className="px-3 py-2 text-right">{r.penggunaBaru}</td>
                  <td className="px-3 py-2 text-right">{r.penggunaAktif}</td>
                  <td className="px-3 py-2 text-right">{r.mealPlanDibuat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
