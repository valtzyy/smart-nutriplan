# 05 — Deploy & persiapan sesi Claude Code

Target: aplikasi online di Vercel (`https://<nama>.vercel.app`) dengan database & auth Supabase (paket gratis).

## A. Persiapan sebelum sesi Claude Code (dikerjakan manusia, ±15 menit)

### 1. Repo GitHub
1. Buat repo baru, misalnya `smart-nutriplan` (private boleh).
2. Upload seluruh isi paket ini ke root repo (`CLAUDE.md`, `PROMPT.md`, `docs/`, `supabase/`, `data/`, `public/`,
   `.env.example`, `README.md`), lalu commit ke `main`.
3. Buka Claude Code di web dan pilih repo ini untuk sesi baru.

### 2. Supabase
1. Buat proyek di https://supabase.com (region terdekat: Singapore). Catat kata sandi database.
2. **Jalankan migrasi sekarang** (paling andal): buka SQL Editor → tempel isi `supabase/migrations/0001_init.sql`
   → Run → tempel isi `0002_seed.sql` → Run. Cek Table Editor: ada 20 baris di `menus`.
3. Authentication → Providers → Email: **matikan "Confirm email"** selama masa uji pengguna, agar pendaftar
   langsung bisa masuk. (Layanan email bawaan Supabase dibatasi beberapa email per jam, sehingga konfirmasi
   email akan menghambat uji dengan banyak responden.) Aktifkan lagi nanti bila sudah memasang SMTP sendiri.
4. Authentication → URL Configuration: Site URL sementara `http://localhost:3000`; Redirect URLs tambahkan
   `http://localhost:3000/**` dan `https://*.vercel.app/**`.
5. Project Settings → API: salin **Project URL** dan **anon public key**.

### 3. Vercel
1. Buat akun di https://vercel.com (login dengan GitHub).
2. Account Settings → Tokens → buat token, salin.

### 4. Variabel lingkungan sesi Claude Code
Di pengaturan environment Claude Code (web), isi:

| Variabel | Wajib | Isi |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Ya | Project URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ya | anon public key |
| `NEXT_PUBLIC_SITE_URL` | Opsional | URL situs untuk tautan reset sandi; bila kosong, aplikasi memakai origin request / `VERCEL_URL` |
| `VERCEL_TOKEN` | Untuk deploy otomatis | token Vercel |
| `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` | Opsional | hanya bila migrasi belum dijalankan manual |

Jangan pernah mengisi service role key di sini atau di Vercel; aplikasi tidak membutuhkannya.

Atur juga akses jaringan environment agar boleh menghubungi domain `*.supabase.co`, `vercel.com`, dan
`api.vercel.com` (selain registry npm). Tanpa itu, Claude Code tetap bisa menulis dan mem-build kode, tetapi uji
dengan database sungguhan dan deploy harus dilakukan manual (bagian C).

## B. Yang dilakukan Claude Code (otomatis, sesuai PROMPT.md)
1. Membangun aplikasi, lint, test, build.
2. Bila Supabase terjangkau: uji alur Annisa dengan database sungguhan.
3. Bila `VERCEL_TOKEN` ada:
   ```
   npx vercel link --yes --token $VERCEL_TOKEN --project smart-nutriplan
   npx vercel env add NEXT_PUBLIC_SUPABASE_URL production --token $VERCEL_TOKEN   (nilai dari env)
   npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --token $VERCEL_TOKEN
   npx vercel deploy --prod --yes --token $VERCEL_TOKEN
   ```
4. Menulis `DEPLOY_STATUS.md` berisi URL produksi atau langkah manual yang tersisa.

## C. Deploy manual (bila otomatis tidak bisa)
1. Vercel → Add New → Project → Import repo `smart-nutriplan` (branch hasil kerja Claude Code, atau merge ke `main` dulu).
2. Environment Variables: isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Deploy.

## D. Setelah online
1. Supabase → Authentication → URL Configuration: ganti Site URL ke URL produksi, tambahkan
   `https://<url-produksi>/**` ke Redirect URLs (agar tautan reset sandi mengarah ke situs online).
2. Daftar akun admin lewat aplikasi, lalu jalankan SQL penetapan admin di `03-DATABASE.md`.
3. Jalankan uji alur Annisa di HP sungguhan (lihat TESTING.md buatan Claude Code).
4. Bagikan URL ke responden uji. Pantau `/admin` untuk metrik traksi Minggu 9–11.
