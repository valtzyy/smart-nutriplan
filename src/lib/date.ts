import type { MealSlot } from "./nutrition/constants";

export const ZONA_WAKTU = "Asia/Jakarta";

const fmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_WAKTU,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
});

/** Tanggal (YYYY-MM-DD) dan jam di Asia/Jakarta untuk `date`. */
export function getJakartaNow(date: Date): { tanggal: string; jam: number } {
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return { tanggal: `${parts.year}-${parts.month}-${parts.day}`, jam: Number(parts.hour) % 24 };
}

/** Tanggal Jakarta dari timestamp ISO (mis. `created_at`). */
export function tanggalJakarta(iso: string | Date): string {
  return getJakartaNow(typeof iso === "string" ? new Date(iso) : iso).tanggal;
}

/** Tambah/kurangi hari pada string YYYY-MM-DD (tanpa efek zona waktu). */
export function tambahHari(tanggal: string, n: number): string {
  const [y, m, d] = tanggal.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

/** Selisih hari b − a untuk string YYYY-MM-DD. */
export function selisihHari(a: string, b: string): number {
  const toUtc = (t: string) => {
    const [y, m, d] = t.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/** "2026-11-23" → "Senin, 23 November". */
export function formatTanggal(tanggal: string): string {
  const [y, m, d] = tanggal.split("-").map(Number);
  const hari = HARI[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${hari}, ${d} ${BULAN[m - 1]}`;
}

/** Slot "makan berikutnya" untuk jam Jakarta; `null` setelah 22:00. */
export function nextMealSlot(jam: number): MealSlot | null {
  if (jam < 10) return "sarapan";
  if (jam < 15) return "makan_siang";
  if (jam < 18) return "camilan";
  if (jam < 22) return "makan_malam";
  return null;
}
