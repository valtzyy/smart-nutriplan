/**
 * Smart NutriPlan Premium — UJI MINAT (strategi "Wizard of Oz", KERTAS KERJA minggu 7).
 * Belum ada pembayaran: halaman hanya mencatat minat & mengarahkan konsultasi manual via WhatsApp.
 */

/** Harga rencana (KK 5.2). */
export const HARGA_PREMIUM_BULANAN = 20_000;

export const FITUR_PREMIUM = [
  { kode: "konsultasi", label: "Konsultasi chat dengan ahli gizi" },
  { kode: "kondisi_medis", label: "Meal plan untuk kondisi kesehatan (mis. GERD, diabetes), diperiksa ahli gizi" },
  { kode: "mingguan", label: "Rencana makan mingguan sekaligus" },
  { kode: "menu_dicek", label: "Semua menu dengan nilai gizi yang sudah dicek ahli gizi" },
] as const;

export type KodeFiturPremium = (typeof FITUR_PREMIUM)[number]["kode"];

export const KODE_FITUR_PREMIUM = FITUR_PREMIUM.map((f) => f.kode) as [KodeFiturPremium, ...KodeFiturPremium[]];

/** Baris perbandingan paket: [fitur, gratis, premium]. */
export const PERBANDINGAN: Array<[string, boolean, boolean]> = [
  ["Meal plan harian otomatis dari masakan lokal", true, true],
  ["Takaran rumah tangga, kalori & makro", true, true],
  ["Filter alergi & pantangan", true, true],
  ["Ganti menu & buat ulang meal plan", true, true],
  ["Konsultasi chat dengan ahli gizi", false, true],
  ["Meal plan untuk kondisi kesehatan", false, true],
  ["Rencana makan mingguan", false, true],
  ["Menu dengan gizi yang sudah dicek ahli gizi", false, true],
];

/** Pesan pembuka chat WhatsApp untuk konsultasi (diproses manual oleh tim). */
export function pesanChatPremium(nama: string): string {
  const sapaan = nama.trim() ? `Halo, aku ${nama.trim()}` : "Halo";
  return `${sapaan} dari Smart NutriPlan. Aku tertarik konsultasi dengan ahli gizi (Premium). Boleh info lebih lanjut?`;
}
