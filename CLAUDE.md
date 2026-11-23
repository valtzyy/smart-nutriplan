# Smart NutriPlan — aturan proyek untuk Claude Code

Smart NutriPlan adalah web app (mobile-first) yang membuat meal plan harian dari masakan lokal Indonesia,
dipersonalisasi dari profil tubuh, tujuan, alergi, dan pantangan pengguna. Tagline: "Porsi Tepat, Hidup Sehat".

Baca semua file di `docs/` sebelum menulis kode. Urutan baca: `01-PRD.md` → `02-ALGORITMA.md` →
`03-DATABASE.md` → `04-DESIGN-SYSTEM.md` → `05-DEPLOY.md`. Kalau ada yang bertentangan, urutan prioritas:
PRD > ALGORITMA > DATABASE > DESIGN-SYSTEM.

## Stack (jangan diganti)

- Next.js (App Router, versi stabil terbaru) + TypeScript `strict`
- Tailwind CSS, ikon `lucide-react`
- Font lewat paket npm `@fontsource/poppins` dan `@fontsource/inter` — JANGAN pakai `next/font/google`
  (build di lingkungan tanpa akses Google Fonts akan gagal)
- Supabase: Auth (email + password) dan Postgres, lewat `@supabase/ssr` dan `@supabase/supabase-js`
- Validasi form: `zod`
- Tes: `vitest` untuk semua fungsi di `src/lib/nutrition/`
- Deploy: Vercel

## Struktur folder yang diharapkan

```
src/
  app/                    # rute (lihat PRD bagian Rute)
  components/ui/          # Button, Input, Chip, OptionCard, MealCard, Badge, BottomNav, Stepper, EmptyState
  components/             # komponen per fitur
  lib/nutrition/          # kalkulasi kalori + generator meal plan (fungsi murni, tanpa I/O)
  lib/supabase/           # client browser, client server, middleware helper
  lib/date.ts             # "hari ini" dan jam di zona Asia/Jakarta
  lib/events.ts           # pencatatan event analitik
supabase/migrations/      # SQL, sudah disediakan — jangan ubah file 0001/0002, buat file baru bila perlu
data/seed/menus.json      # sumber data menu (sudah dimuat ke 0002_seed.sql)
public/brand/             # logo-horizontal.png, logo-icon.png
```

## Aturan wajib

1. Semua teks antarmuka dalam Bahasa Indonesia yang akrab dan menyemangati, sapaan "kamu".
   Jangan ada body shaming, jangan menakut-nakuti soal berat badan.
2. Takaran selalu ditampilkan sebagai Takaran Rumah Tangga (centong, potong, mangkok), bukan gram.
3. Disclaimer kesehatan wajib tampil di Welcome, onboarding Tujuan, onboarding Preferensi, dan Beranda:
   "Rekomendasi bersifat perkiraan, bukan pengganti saran ahli gizi atau dokter."
4. Menu yang `dicek_ahli_gizi = false` tetap boleh tampil, tetapi halaman detailnya wajib menampilkan label
   "Estimasi gizi — belum dicek ahli gizi".
5. Logika kalori dan generator HARUS berupa fungsi murni di `src/lib/nutrition/` dan lolos semua kasus uji
   di `docs/02-ALGORITMA.md`. Tidak boleh ada kalkulasi kalori di komponen UI.
6. Keamanan: andalkan Row Level Security dari migrasi. Jangan pernah memakai service role key di kode yang
   berjalan di browser. Data BB, TB, dan alergi adalah data sensitif.
7. "Hari ini" dan jam selalu dihitung di zona `Asia/Jakarta`, bukan zona server.
8. Mobile-first: lebar konten maksimum 480px, di layar lebar ditampilkan di tengah dengan latar `bg`.
9. Warna, radius, spacing, dan tipografi hanya dari token di `docs/04-DESIGN-SYSTEM.md`
   (daftarkan sebagai tema Tailwind). Tidak ada hex lepas di komponen.
10. Aplikasi harus bisa `npm run build` TANPA variabel lingkungan Supabase (halaman yang butuh data
    dirender dinamis). Jangan memanggil Supabase saat build.

## Perintah

- `npm run dev` — server lokal
- `npm run build` — wajib lolos sebelum selesai
- `npm run lint` — wajib bersih
- `npm test` — vitest, wajib hijau

## Definisi selesai

Lihat checklist di akhir `PROMPT.md`. Jangan menyatakan selesai sebelum semua butir terverifikasi.
