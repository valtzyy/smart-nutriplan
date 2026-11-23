# Prompt utama untuk Claude Code

Salin seluruh isi blok di bawah ini ke Claude Code sebagai pesan pertama.

---

```text
Bangun web app Smart NutriPlan sampai siap dipakai online, dalam satu sesi ini.

Konteks:
- Semua spesifikasi ada di repo ini. Baca dulu CLAUDE.md, lalu docs/01-PRD.md, docs/02-ALGORITMA.md,
  docs/03-DATABASE.md, docs/04-DESIGN-SYSTEM.md, docs/05-DEPLOY.md secara utuh sebelum menulis kode.
- Migrasi database sudah jadi di supabase/migrations/ (0001_init.sql = skema + RLS, 0002_seed.sql = alergen
  + 20 menu). Pakai apa adanya; kalau butuh perubahan, buat file migrasi baru.
- Logo ada di public/brand/. Data menu sumber ada di data/seed/menus.json.

Cara kerja:
1. Buat rencana kerja singkat berupa daftar tugas, lalu kerjakan tanpa menunggu konfirmasi saya.
   Kalau ada yang ambigu, ambil keputusan paling sesuai dengan PRD, catat di DECISIONS.md, lanjutkan.
2. Inisialisasi proyek Next.js + TypeScript + Tailwind di root repo ini (jangan timpa folder docs/,
   supabase/, data/, public/brand/, CLAUDE.md, PROMPT.md).
3. Kerjakan berurutan dan pastikan tiap tahap lolos build sebelum lanjut:
   a. Token desain (tema Tailwind) + font @fontsource + komponen UI dasar.
   b. src/lib/nutrition (kalkulasi + generator) + tes vitest dengan SEMUA kasus uji di 02-ALGORITMA.md.
   c. Supabase client/server/middleware + proteksi rute + alur auth (daftar, masuk, lupa & reset sandi).
   d. Onboarding 3 langkah + simpan profil & alergen.
   e. Beranda, Meal Plan (buat otomatis harian, ganti per slot, buat ulang), Detail Menu.
   f. Profil + Edit Profil (dengan dialog perbarui meal plan hari ini).
   g. Empty state, error state, validasi form sesuai PRD.
   h. Pencatatan event analitik + halaman /admin (metrik + kelola menu) untuk role admin.
4. Setelah semua fitur selesai, jalankan: npm run lint, npm test, npm run build. Perbaiki sampai semua bersih.
5. Uji manual alur utama di server lokal (npm run dev) memakai Supabase bila variabel lingkungannya tersedia:
   daftar → onboarding (Annisa: wanita, 21 th, 55 kg, 160 cm, aktivitas sedang, turun BB, alergi udang)
   → Beranda harus menampilkan target 1.490 kkal dan 4 menu tanpa udang → buka detail → ganti satu slot
   → buat ulang → edit profil → keluar → masuk lagi. Catat hasilnya di TESTING.md.
   Kalau Supabase tidak bisa dijangkau dari sesi ini, tulis tes unit/komponen sebanyak mungkin dan
   tandai uji manual sebagai "perlu dijalankan setelah deploy" di TESTING.md.
6. Deploy mengikuti docs/05-DEPLOY.md:
   - Kalau variabel NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY ada dan Supabase bisa
     dijangkau, jalankan migrasi (supabase CLI dengan SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF, atau
     psql dengan SUPABASE_DB_URL).
   - Kalau VERCEL_TOKEN ada, deploy ke Vercel produksi dengan vercel CLI dan set env di Vercel.
   - Kalau salah satu tidak tersedia atau jaringan diblokir, commit dan push ke branch, lalu tulis langkah
     manual yang tersisa, persis dan berurutan, di DEPLOY_STATUS.md.
7. Akhiri dengan ringkasan: URL produksi (kalau ada), apa yang sudah diverifikasi, apa yang tersisa
   untuk saya lakukan secara manual, dan isi DECISIONS.md.

Checklist definisi selesai (verifikasi satu per satu sebelum menyatakan selesai):
[ ] npm run lint bersih, npm test hijau (semua kasus uji 02-ALGORITMA.md), npm run build sukses
[ ] Semua rute di PRD bagian "Rute" ada dan terlindungi sesuai aturan akses
[ ] Pengguna baru tidak bisa membuka /beranda sebelum onboarding selesai
[ ] Target kalori Annisa = 1.490 kkal; tidak ada menu yang mengandung alergen/pantangan pengguna
[ ] Meal plan dibuat otomatis sekali per hari (Asia/Jakarta), ganti slot & buat ulang mematuhi batas di PRD
[ ] Takaran tampil sebagai Takaran Rumah Tangga dengan pecahan ½ / ¼ yang benar
[ ] Empty state "belum ada menu cocok" muncul bila filter mengosongkan satu slot
[ ] Disclaimer kesehatan tampil di 4 layar wajib; label "belum dicek ahli gizi" tampil di detail menu
[ ] Event analitik tercatat dan /admin hanya bisa dibuka role admin
[ ] Tampilan memakai token, font Poppins/Inter, logo dari public/brand, rapi di lebar 360–430px
[ ] DECISIONS.md, TESTING.md, DEPLOY_STATUS.md (atau URL produksi) tersedia
```

---

## Sebelum menempelkan prompt

Ikuti bagian "Persiapan sebelum sesi Claude Code" di `docs/05-DEPLOY.md`. Kalau env Supabase dan Vercel
sudah diisi sebelum sesi dimulai, Claude Code bisa menyelesaikan sampai URL online dalam satu prompt.
Tanpa itu, kodenya tetap selesai dan siap, tetapi langkah database dan deploy harus kamu jalankan manual.
