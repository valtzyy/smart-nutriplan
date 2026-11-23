# DEPLOY_STATUS.md

## ⚠️ Langkah baru: jalankan migrasi 0003
Supabase → SQL Editor → tempel isi `supabase/migrations/0003_feedback_referral.sql` → **Run** (aman dijalankan ulang).
Tanpa migrasi ini: formulir Masukan gagal tersimpan, bagian "Ajak teman" tidak muncul, dan metrik Rujukan/NPS di /admin kosong.
Lalu ganti kontak dummy di `src/lib/brand.ts` (`KONTAK`) sebelum aplikasi dibagikan.

## ✅ ONLINE — https://smart-nutriplan.vercel.app (23 Nov 2026)
- Penyebab NOT_FOUND sebelumnya: proyek Vercel dibuat saat `main` belum berisi aplikasi, sehingga Framework Preset
  terdeteksi "Other" (hanya folder `public/` yang disajikan). Diperbaiki dengan `vercel.json` (`"framework": "nextjs"`).
- Dicek dari luar: `/` 200 (judul, hero, disclaimer), `/daftar` `/masuk` `/lupa-sandi` `/cek-email` 200;
  `/beranda` `/meal-plan` `/profil` `/onboarding/profil` → `/masuk?next=…` (proxy + env Supabase aktif);
  `/reset-sandi` tanpa sesi → `/lupa-sandi`; `/admin` `/admin/menu` → 404.
- Sisa langkah manual: bagian "4. Setelah online" (Site URL Supabase, penetapan admin, checklist TESTING.md di HP).

## Pembaruan 23 Nov 2026
- Supabase: migrasi 0001 + 0002 sudah jalan, Email provider aktif, Confirm email OFF. Alur Annisa lulus (lihat TESTING.md).
- Branch `claude/smart-nutriplan-mvp` sudah di-merge (fast-forward) ke `main` dan di-push (commit `66f1501`).
- Vercel (proyek `novaldo-putras-projects/smart-nutriplan`) melaporkan build commit itu **success**.
- Tapi belum bisa diakses publik:
  - `https://smart-nutriplan.vercel.app` → `404 NOT_FOUND` dari Vercel (domain ini belum terpasang ke proyek).
  - `https://smart-nutriplan-novaldo-putras-projects.vercel.app` → dialihkan ke login Vercel (Deployment Protection aktif).
- Langkah tersisa:
  1. Vercel → proyek → Settings → **Domains**: pastikan `smart-nutriplan.vercel.app` terpasang ke Production
     (tambahkan bila belum; kalau nama itu dipakai pihak lain, pakai domain yang ditampilkan Vercel).
  2. Settings → **Deployment Protection** → matikan "Vercel Authentication" (atau set ke "Only Preview Deployments")
     supaya responden bisa membuka tanpa akun Vercel.
  3. Settings → Environment Variables: pastikan `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` ada untuk
     Production, lalu Redeploy bila baru ditambahkan.
  4. Lanjut ke bagian "4. Setelah online" di bawah.

**Status: kode siap, BELUM online.** Sesi Claude Code ini tidak punya `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `VERCEL_TOKEN`, maupun token Supabase CLI, sehingga migrasi database dan deploy
Vercel tidak bisa dijalankan otomatis.

Kode sudah di-commit dan di-push ke branch **`claude/smart-nutriplan-mvp`** di
`https://github.com/valtzyy/smart-nutriplan`. Lint, tes (79), dan build tanpa env sudah lolos.

## Langkah manual (kerjakan berurutan)

### 1. Supabase — buat proyek & jalankan migrasi
1. https://supabase.com → New project (region Singapore). Simpan kata sandi database.
2. SQL Editor → tempel isi `supabase/migrations/0001_init.sql` → **Run**.
3. SQL Editor → tempel isi `supabase/migrations/0002_seed.sql` → **Run**.
4. Table Editor → pastikan tabel `menus` berisi **20** baris dan `allergens` **10** baris.
5. Authentication → Sign In / Providers → Email: **matikan "Confirm email"** (selama masa uji).
6. Authentication → URL Configuration:
   - Site URL: `http://localhost:3000` (diganti di langkah 4.1)
   - Redirect URLs: tambahkan `http://localhost:3000/**` dan `https://*.vercel.app/**`
7. Project Settings → API: salin **Project URL** dan **anon public key**. (Jangan pakai service role key.)

### 2. Coba lokal (opsional tapi disarankan)
```
copy .env.example .env.local      # lalu isi URL & anon key dari langkah 1.7
npm install
npm run dev                       # buka http://localhost:3000
```
Jalankan uji alur Annisa di `TESTING.md` (bagian "Uji manual alur utama").

### 3. Vercel — deploy
Pilih salah satu:

**A. Lewat dashboard (paling mudah)**
1. https://vercel.com → Add New → Project → Import `valtzyy/smart-nutriplan`.
2. Production Branch: pilih `claude/smart-nutriplan-mvp` — atau merge branch itu ke `main` dulu
   (GitHub → Pull request → Merge), lalu deploy dari `main`.
3. Framework: Next.js (otomatis). Environment Variables (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key
   - (opsional) `NEXT_PUBLIC_SITE_URL` = URL produksi, mis. `https://smart-nutriplan.vercel.app`
4. Deploy. Catat URL produksinya.

**B. Lewat CLI** (di folder repo, dengan token dari Vercel → Account Settings → Tokens)
```
npx vercel link --yes --token <VERCEL_TOKEN> --project smart-nutriplan
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production --token <VERCEL_TOKEN>
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --token <VERCEL_TOKEN>
npx vercel deploy --prod --yes --token <VERCEL_TOKEN>
```

### 4. Setelah online
1. Supabase → Authentication → URL Configuration: ganti **Site URL** ke URL produksi dan tambahkan
   `https://<url-produksi>/**` ke Redirect URLs (agar tautan reset sandi mengarah ke situs online).
2. Daftar akun admin lewat aplikasi, lalu di SQL Editor:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'email-admin@contoh.com');
   ```
3. Jalankan seluruh checklist "Uji manual alur utama" di `TESTING.md` di HP sungguhan dan isi hasilnya.
4. Bagikan URL ke responden uji; pantau `/admin`.

## Catatan
- Tidak ada migrasi baru (0003) yang perlu dijalankan.
- Build tidak memanggil Supabase; env hanya dibutuhkan saat runtime.
