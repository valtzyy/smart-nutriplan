import { z } from "zod";
import { ACTIVITY_LEVELS, DIET_GOALS, GENDERS, MEAL_SLOTS } from "./nutrition/constants";
import { BERSEDIA_BAYAR } from "./types";

export const PESAN = {
  nama: "Nama panggilan 2–30 karakter, ya.",
  email: "Format email belum benar.",
  sandi: "Kata sandi minimal 8 karakter.",
  sandiBeda: "Kata sandi belum sama.",
  usia: "Usia harus bilangan bulat 18–65.",
  usiaInfo:
    "Smart NutriPlan saat ini dirancang untuk usia 18–65 tahun. Untuk usia di luar itu, konsultasikan pola makanmu dengan tenaga kesehatan.",
  jenisKelamin: "Pilih salah satu, ya.",
  bb: "Berat badan antara 30–250 kg.",
  tb: "Tinggi badan antara 120–230 cm.",
  aktivitas: "Pilih tingkat aktivitasmu.",
  tujuan: "Pilih satu tujuan.",
  setuju: "Centang persetujuan dulu, ya.",
  anggaran: "Anggaran antara Rp0–Rp1.000.000, boleh dikosongkan.",
} as const;

/** Ubah input form (string) ke angka; kosong → NaN supaya gagal validasi. */
const angka = (msg: string) =>
  z.preprocess((v) => {
    if (typeof v === "number") return v;
    if (typeof v !== "string" || v.trim() === "") return Number.NaN;
    return Number(v.trim().replace(",", "."));
  }, z.number({ error: msg }).refine((n) => Number.isFinite(n), { message: msg }));

export const namaSchema = z.string().trim().min(2, PESAN.nama).max(30, PESAN.nama);
export const emailSchema = z.string().trim().pipe(z.email(PESAN.email));
export const sandiSchema = z.string().min(8, PESAN.sandi);

export const daftarSchema = z.object({
  nama: namaSchema,
  email: emailSchema,
  password: sandiSchema,
  setuju: z.boolean().refine((v) => v, { message: PESAN.setuju }),
});

/** Kode rujukan dari URL (`?ref=`): 4–16 huruf/angka, dinormalkan ke huruf besar. */
export function normalisasiKodeRujukan(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim().toUpperCase();
  return /^[A-Z0-9]{4,16}$/.test(v) ? v : null;
}
export const masukSchema = z.object({ email: emailSchema, password: z.string().min(1, PESAN.sandi) });
export const lupaSandiSchema = z.object({ email: emailSchema });
export const resetSandiSchema = z
  .object({ password: sandiSchema, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { message: PESAN.sandiBeda, path: ["confirm"] });

export const usiaSchema = angka(PESAN.usia).pipe(z.number().int(PESAN.usia).min(18, PESAN.usia).max(65, PESAN.usia));

/** Usia terisi angka tetapi di luar 18–65 → tampilkan kotak info, bukan error biasa. */
export function usiaDiLuarRentang(raw: string): boolean {
  if (raw.trim() === "") return false;
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) && (n < 18 || n > 65);
}

export const profilTubuhSchema = z.object({
  usia: usiaSchema,
  jenis_kelamin: z.enum(GENDERS, { error: PESAN.jenisKelamin }),
  berat_badan: angka(PESAN.bb).pipe(
    z
      .number()
      .min(30, PESAN.bb)
      .max(250, PESAN.bb)
      .refine((n) => Math.abs(n * 10 - Math.round(n * 10)) < 1e-9, { message: PESAN.bb }),
  ),
  tinggi_badan: angka(PESAN.tb).pipe(z.number().min(120, PESAN.tb).max(230, PESAN.tb)),
  aktivitas_fisik: z.enum(ACTIVITY_LEVELS, { error: PESAN.aktivitas }),
});

export const tujuanSchema = z.object({ tujuan: z.enum(DIET_GOALS, { error: PESAN.tujuan }) });

export const allergenIdsSchema = z.array(z.coerce.number().int().positive()).max(50);

/** Anggaran makan per hari (opsional): "" → null; "25.000" → 25000; 0–1.000.000. */
export const anggaranSchema = z.preprocess(
  (v) => {
    if (v == null) return null;
    const s = String(v).replace(/[.\s]/g, "").replace(/^rp/i, "");
    return s === "" ? null : Number(s);
  },
  z
    .number({ error: PESAN.anggaran })
    .refine((n) => Number.isInteger(n) && n >= 0 && n <= 1_000_000, { message: PESAN.anggaran })
    .nullable(),
);

export const preferensiSchema = z.object({
  allergen_ids: allergenIdsSchema,
  anggaran_harian: anggaranSchema,
});

export const editProfilSchema = profilTubuhSchema.extend({
  nama: namaSchema,
  tujuan: z.enum(DIET_GOALS, { error: PESAN.tujuan }),
  allergen_ids: allergenIdsSchema,
  anggaran_harian: anggaranSchema,
});

export const slotSchema = z.enum(MEAL_SLOTS);

/** Ambil pesan error pertama per field dari hasil zod. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

const porsiSchema = z.object({
  nama: z.string().trim().min(1, "Nama komponen wajib diisi."),
  qty: z.coerce.number().positive("Jumlah harus lebih dari 0."),
  satuan: z.string().trim().min(1, "Satuan wajib diisi."),
});

export const menuFormSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug minimal 2 karakter.")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan tanda hubung."),
  nama: z.string().trim().min(2, "Nama menu minimal 2 karakter.").max(120),
  kategori: z.enum(MEAL_SLOTS, { error: "Pilih kategori." }),
  kalori: z.coerce.number().int("Kalori bilangan bulat.").positive("Kalori harus lebih dari 0."),
  protein: z.coerce.number().min(0).max(999),
  karbohidrat: z.coerce.number().min(0).max(999),
  lemak: z.coerce.number().min(0).max(999),
  porsi: z.array(porsiSchema).min(1, "Tambahkan minimal satu komponen porsi."),
  bahan: z.array(z.string().trim().min(1)).min(1, "Tambahkan minimal satu bahan."),
  langkah: z.array(z.string().trim().min(1)).min(1, "Tambahkan minimal satu langkah."),
  cocok_untuk: z.array(z.enum(DIET_GOALS)).min(1, "Pilih minimal satu tujuan."),
  estimasi_harga: z.coerce.number().int().min(0).nullable(),
  waktu_masak_menit: z.coerce.number().int().min(0).max(1000).nullable(),
  foto_url: z.union([z.url("URL foto belum benar."), z.null()]),
  sumber_gizi: z.string().trim().min(1, "Sumber gizi wajib diisi."),
  dicek_ahli_gizi: z.boolean(),
  status: z.enum(["draft", "aktif"]),
  allergen_ids: allergenIdsSchema,
});

export type MenuFormInput = z.input<typeof menuFormSchema>;
export type MenuFormValues = z.output<typeof menuFormSchema>;

const teksOpsional = z
  .string()
  .trim()
  .max(1000, "Maksimal 1.000 karakter, ya.")
  .transform((s) => (s === "" ? null : s));

/** Formulir masukan closed beta + NPS (KERTAS KERJA minggu 8 & 11). */
export const masukanSchema = z.object({
  // Kosong → NaN (bukan 0) supaya wajib dipilih.
  nps: z.preprocess(
    (v) => (v === "" || v == null ? Number.NaN : Number(v)),
    z
      .number({ error: "Pilih skor 0–10, ya." })
      .refine((n) => Number.isInteger(n) && n >= 0 && n <= 10, { message: "Pilih skor 0–10, ya." }),
  ),
  membingungkan: teksOpsional,
  disukai: teksOpsional,
  berhenti: teksOpsional,
  alasan_rekomendasi: teksOpsional,
  bersedia_bayar: z.union([z.enum(BERSEDIA_BAYAR), z.literal("").transform(() => null)]),
});
