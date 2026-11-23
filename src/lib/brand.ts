/** Nilai token yang perlu dipakai di luar CSS (metadata). Harus sama dengan `--color-primary-strong`. */
export const THEME_COLOR = "#4F6B49";

export const APP_NAME = "Smart NutriPlan";
export const APP_TITLE = "Smart NutriPlan — Porsi Tepat, Hidup Sehat";
export const DISCLAIMER = "Rekomendasi bersifat perkiraan, bukan pengganti saran ahli gizi atau dokter.";
export const PESAN_GALAT = "Ada kendala, coba lagi sebentar.";

/**
 * Kontak resmi untuk halaman Tentang Kami & Privasi.
 * ⚠️ MASIH DUMMY — ganti dengan WhatsApp/email tim yang benar-benar dipantau sebelum dibagikan ke publik.
 */
export const KONTAK = {
  email: "halo@example.com",
  whatsapp: "+62 800-0000-0000",
  /** Nomor dalam format wa.me (angka saja, tanpa +). Kosongkan bila belum ada. */
  whatsappLink: "",
  instagram: "@smartnutriplan.id",
  jamOperasional: "Senin–Jumat, 09.00–17.00 WIB",
} as const;

/** Tim (KERTAS KERJA BISDIG — Kelompok 7). */
export const TIM = [
  { nama: "Salwa", peran: "CEO" },
  { nama: "Kanaya", peran: "CTO" },
  { nama: "Intan", peran: "CTO" },
  { nama: "Nakia", peran: "CMO" },
  { nama: "Fudhla", peran: "CFO" },
] as const;

/** Tanggal berlaku Ketentuan & Privasi. */
export const KETENTUAN_BERLAKU = "23 November 2026";
