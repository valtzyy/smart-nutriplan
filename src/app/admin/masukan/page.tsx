import { CsvButton } from "@/components/admin/CsvButton";
import { Badge } from "@/components/ui/Badge";
import { hitungNps } from "@/lib/admin-metrics";
import { requireAdmin } from "@/lib/auth";
import { tanggalJakarta } from "@/lib/date";
import type { FeedbackRow } from "@/lib/types";

export const metadata = { title: "Masukan pengguna — Smart NutriPlan" };

const KOLOM = [
  ["alasan_rekomendasi", "Alasan skor"],
  ["disukai", "Paling disukai"],
  ["membingungkan", "Paling membingungkan"],
  ["berhenti", "Yang membuat berhenti"],
] as const;

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default async function AdminMasukanPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("feedback")
    .select("*, profiles(nama)")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <main className="flex flex-col gap-4 px-6 py-6">
        <h1 className="text-h2-style text-text">Masukan pengguna</h1>
        <p className="rounded-md bg-accent-soft px-4 py-3 text-small text-text">
          Tabel masukan belum tersedia. Jalankan migrasi <code>supabase/migrations/0003_feedback_referral.sql</code> di
          Supabase → SQL Editor, lalu muat ulang halaman ini.
        </p>
      </main>
    );
  }

  const rows = (data ?? []) as (FeedbackRow & { profiles: { nama: string } | null })[];
  const nps = hitungNps(rows);
  const csv = [
    "tanggal,nama,nps,alasan,disukai,membingungkan,berhenti,bersedia_bayar",
    ...rows.map((r) =>
      [
        tanggalJakarta(r.created_at),
        r.profiles?.nama,
        r.nps,
        r.alasan_rekomendasi,
        r.disukai,
        r.membingungkan,
        r.berhenti,
        r.bersedia_bayar,
      ]
        .map(csvCell)
        .join(","),
    ),
  ].join("\n");

  return (
    <main className="flex flex-col gap-5 px-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-h2-style text-text">Masukan pengguna</h1>
        <CsvButton csv={csv} filename="nutriplan-masukan.csv" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4">
          <span className="text-h2-style text-text">{nps.skor ?? "—"}</span>
          <span className="text-small text-text-muted">Skor NPS</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4">
          <span className="text-h2-style text-text">{nps.jumlah}</span>
          <span className="text-small text-text-muted">
            Jawaban · {nps.promotor} promotor · {nps.pasif} pasif · {nps.detraktor} detraktor
          </span>
        </div>
      </div>

      {rows.length === 0 && <p className="text-body text-text-muted">Belum ada masukan.</p>}
      <ul className="flex flex-col gap-3">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-body font-semibold text-text">{r.profiles?.nama || "Pengguna"}</span>
              <span className="text-caption text-text-muted">{tanggalJakarta(r.created_at)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={r.nps >= 9 ? "primary" : "accent"}>NPS {r.nps}</Badge>
              {r.bersedia_bayar && <Badge variant="accent">Bayar: {r.bersedia_bayar}</Badge>}
            </div>
            <dl className="flex flex-col gap-1 text-small">
              {KOLOM.filter(([k]) => r[k]).map(([k, label]) => (
                <div key={k}>
                  <dt className="text-text-muted">{label}</dt>
                  <dd className="text-text">{r[k]}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </main>
  );
}
