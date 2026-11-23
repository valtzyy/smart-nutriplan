# DECISIONS.md — keputusan saat implementasi

Keputusan yang diambil ketika spesifikasi ambigu atau perlu penyesuaian teknis. Urutan prioritas sumber:
PRD > ALGORITMA > DATABASE > DESIGN-SYSTEM.

## Stack & konfigurasi

1. **Next.js 16.4 (stabil terbaru) tanpa `cacheComponents`.** `create-next-app` versi ini menyalakan
   `cacheComponents` + `partialPrefetching` secara default. Keduanya dimatikan supaya semua halaman yang membaca
   sesi (cookie) dirender dinamis secara klasik dan build tidak pernah memanggil Supabase (aturan 10).
2. **`src/proxy.ts`, bukan `middleware.ts`.** Di Next 16 konvensi `middleware` sudah deprecated dan diganti `proxy`.
   Isinya tetap "middleware" sesi Supabase (`src/lib/supabase/middleware.ts`).
3. **Tailwind v4** — token didaftarkan di `@theme` pada `src/app/globals.css` (bukan `tailwind.config`).
   Palet bawaan Tailwind dihapus (`--color-*: initial`) sehingga hanya warna token yang bisa dipakai.
   Satu-satunya hex di luar CSS adalah `THEME_COLOR` di `src/lib/brand.ts` (metadata `theme-color` wajib string).
4. **`@types/node@22`** — vitest 5 menolak `@types/node@20` bawaan scaffold.
5. **Tipe database ditulis manual** di `src/lib/types.ts` (CLI Supabase/akses proyek tidak tersedia di sesi ini).
6. `AGENTS.md` dari scaffold Next 16 disimpan (Next akan menulisnya ulang saat `next dev`).

## Auth & rute

7. **Pengunjung yang membuka `/admin*` mendapat 404**, sama seperti pengguna biasa (PRD: "Hanya admin, selain itu 404"),
   bukan dialihkan ke `/masuk`, agar keberadaan halaman admin tidak terlihat.
8. **Proxy** hanya menangani sesi (rute terlindungi → `/masuk?next=…`, `/reset-sandi` tanpa sesi → `/lupa-sandi`).
   Aturan onboarding & role diperkuat di server component (`src/lib/auth.ts`). Bila env Supabase belum ada,
   proxy melewatkan request dan guard server mengalihkan ke `/masuk`.
9. **Event `sign_up`** dicatat saat daftar bila Supabase langsung memberi sesi (Confirm email OFF, sesuai 05-DEPLOY).
   Bila konfirmasi email aktif, event dicatat di `/auth/callback` (tautan email membawa `ev=sign_up`), karena RLS
   `events` mewajibkan `user_id = auth.uid()`.
10. **Login gagal karena email belum dikonfirmasi** menampilkan "Email belum dikonfirmasi. Cek kotak masuk emailmu, ya."
    (lebih membantu daripada "Email atau kata sandi salah."). Galat lain memakai pesan PRD.
11. **Parameter `next` setelah login** hanya dipakai bila onboarding sudah selesai dan berupa path internal.
12. Tombol kembali di langkah 1 onboarding mengarah ke `/` (yang mengalihkan kembali sesuai status) karena PRD
    mensyaratkan tombol kembali di semua langkah.
13. `/auth/callback` mendukung `code` (PKCE) dan `token_hash` + `type` (template email Supabase) — keduanya umum.

## Meal plan

14. **Seed generator** `${userId}:${tanggal}:${regenerate_count}` dipakai juga untuk pembuatan otomatis (count = 0),
    sehingga dua request bersamaan yang sama-sama melengkapi item menghasilkan baris identik (idempoten).
    Insert meal plan memakai `upsert … ignoreDuplicates` (= `on conflict do nothing`), lalu membaca yang sudah ada.
15. **Ganti per slot**: RNG di-seed `${userId}:${tanggal}:${slot}` (seed PRD + slot) supaya urutan tiap slot stabil
    sepanjang hari dan tidak saling memengaruhi. Bila slot kosong / menu saat ini tidak lagi valid, "Ganti" mengambil
    kandidat terbaik.
16. **Tombol "Ganti"** dinonaktifkan (teks "Belum ada menu lain yang cocok") bila `swapSlot` mengembalikan `null` —
    dihitung di server saat render, tanpa query tambahan.
17. **Buat ulang** memakai *optimistic lock* (`update … where regenerate_count = n`) agar dua klik bersamaan tidak
    melewati batas 3.
18. **Pembuatan ulang karena edit profil** (`profile_update`) memakai target dari profil terbaru, memperbarui
    `meal_plans.target_kalori`, tidak menambah hitungan, dan tidak memberi penalti `currentPlanMenuIds`
    (tujuannya menyesuaikan profil baru, bukan "berganti menu").
19. Jika pengguna memilih **"Nanti saja"**, meal plan hari ini tetap memakai target lama; Beranda/Meal Plan
    menampilkan `meal_plans.target_kalori` (target yang dipakai menyusun plan), sedangkan Profil menampilkan target
    terbaru dari profil.
20. Event `slot_empty` dicatat saat meal plan dibuat/dibuat ulang (sekali per slot kosong), bukan setiap kali halaman dibuka.
21. Event `profile_updated` dicatat saat pengguna memilih di dialog (Ya/Nanti), karena di situlah nilai `regenerated` diketahui.

## Tampilan

22. **Detail menu**: badge "Bebas {alergen}" hanya untuk alergen pengguna yang memang tidak dikandung menu (maks 3).
    "Tinggi protein" memakai protein yang sudah dikali multiplier. Daftar "Bahan" tetap untuk 1 porsi standar
    (bahan berupa teks bebas, tidak bisa diskalakan); porsi TRT dan gizi yang diskalakan.
23. Perkiraan biaya `harga × multiplier` dibulatkan ke Rp100 terdekat.
24. Total & makro di Beranda/Meal Plan hanya menjumlah slot yang terisi.
25. Error ringan (validasi) tampil di bawah field; galat server tampil sebagai toast "Ada kendala, coba lagi sebentar."
    (di halaman Masuk dan Reset sandi ditampilkan inline di atas tombol karena itu satu-satunya umpan balik).

## Admin

26. **Metrik dihitung di aplikasi** (fungsi murni `src/lib/admin-metrics.ts`, diuji) dari `profiles`, `events`, dan
    `meal_plans` yang diambil per 1.000 baris. Tidak perlu migrasi tambahan; cukup untuk skala uji MVP
    (puluhan–ratusan pengguna). Bila data membesar, pindahkan ke fungsi SQL di migrasi `0003_*.sql`.
27. "Meal plan dibuat" per hari = jumlah baris `meal_plans` dengan `tanggal` itu. "Aktif" = punya ≥1 event pada tanggal
    Jakarta itu. Retensi D1 tampil "—" bila belum ada pengguna yang daftar ≥ 1 hari lalu.
28. Form menu admin: slug otomatis dari nama bila dikosongkan; alergen menu disimpan hapus-lalu-insert.

## Tidak ada perubahan skema

29. Tidak ada migrasi baru; `0001_init.sql` dan `0002_seed.sql` dipakai apa adanya.

## Performa & UX (setelah uji di HP)

30. **Region fungsi Vercel = `sin1` (Singapura)** lewat `vercel.json`, sama dengan region Supabase. Sebelumnya fungsi
    berjalan di `iad1` (AS) sehingga tiap query menyeberangi Pasifik (~200–250 ms per query).
31. **`auth.getClaims()`** menggantikan `getUser()` di proxy dan `getSession`: JWT diverifikasi lokal dengan kunci ES256
    (JWKS di-cache), tanpa round-trip ke Auth server di setiap request.
32. **Query paralel**: meal plan + katalog menu + alergen + riwayat diambil dalam satu `Promise.all`; detail menu juga.
    Upsert item mengembalikan baris (`select`) sehingga tidak perlu membaca ulang plan.
33. **Event analitik tidak ditunggu**: insert dimulai lalu dijaga dengan `after()` dari `next/server` (respons tidak
    menunggu). Pengecualian: `logout` ditunggu karena sesi dihapus sesudahnya.
34. **`loading.tsx` per rute** (skeleton berbasis token) supaya navigasi langsung memberi umpan balik; BottomNav menyorot
    tab yang ditekan seketika (`useLinkStatus`).
35. **Umpan balik sentuh**: state `:active` (skala/latar) pada tombol, chip, kartu, tautan; tap-highlight bawaan dimatikan;
    semua tombol submit menampilkan spinner (termasuk "Keluar" dan pilihan di dialog edit profil).

## Penyesuaian dengan KERTAS KERJA BISDIG (Kelompok 7)

36. **Daftar belanja tidak dibuat** (keputusan tim; juga di luar ruang lingkup PRD & KK 7.2). Fitur yang ditunda KK 7.2
    (konsultasi ahli gizi, premium, forum, pelacakan, notifikasi, aplikasi native) tetap tidak dibuat.
37. **Migrasi baru `0003_feedback_referral.sql`** (0001/0002 tidak diubah): kolom profil `kode_rujukan`, `dirujuk_oleh`,
    `setuju_ketentuan_at`; trigger `handle_new_user` diperbarui untuk membaca `ref` & `setuju_ketentuan` dari metadata
    pendaftaran; trigger pelindung agar pengguna tidak bisa mengubah kolom sistem itu sendiri; tabel `feedback` dengan RLS
    (insert milik sendiri, baca milik sendiri/admin). Diuji di Postgres 18 lokal dengan stub skema `auth`.
38. **Aplikasi tetap jalan sebelum 0003 dijalankan**: formulir masukan menampilkan toast galat, bagian "Ajak teman"
    disembunyikan, dan /admin menampilkan peringatan migrasi.
39. **Halaman publik `/tentang` & `/privasi`** (KK 8.4). Kontak masih **dummy** di `src/lib/brand.ts` (`KONTAK`) —
    wajib diganti sebelum dibagikan. Tim ditulis nama panggilan + peran saja (tanpa NIM/nomor HP dari kertas kerja).
40. **Persetujuan ketentuan wajib saat daftar** (checkbox, divalidasi zod di klien & server); waktunya disimpan di
    `profiles.setuju_ketentuan_at`.
41. **Rujukan**: tautan `/?ref=KODE` dari Profil (Salin/Bagikan via Web Share API). Kode dinormalkan huruf besar,
    4–16 alfanumerik; kode tidak dikenal diabaikan.
42. **Masukan/NPS** (minggu 8 & 11): 5 pertanyaan closed beta + skor 0–10; NPS = %promotor(9–10) − %detraktor(0–6).
    Rekap di `/admin/masukan` + CSV.
43. **AARRR di /admin**: Acquisition = pendaftar 7 hari (vs 7 hari sebelumnya); Activation = selesai onboarding **dan**
    membuka ≥1 resep (aksi utama = menerima meal plan lalu membaca resepnya); Retention D7 = pendaftar ≥7 hari lalu yang
    punya event di hari ke-1..7 setelah daftar; Referral = % profil dengan `dirujuk_oleh`; Revenue "—" (belum ada fitur
    berbayar).
44. **Anggaran makan harian** (KK 7.3, memakai kolom `anggaran_harian` yang sudah ada): opsional di onboarding langkah 3
    dan Edit profil. Beranda/Meal Plan menampilkan perkiraan biaya `Σ estimasi_harga × multiplier` (dibulatkan Rp100)
    dibanding anggaran. Anggaran **tidak** memengaruhi pemilihan menu (algoritma 02-ALGORITMA tidak diubah).
45. **Pratinjau tautan & URL email** memakai `VERCEL_PROJECT_PRODUCTION_URL` (domain publik), bukan URL deployment yang
    dilindungi login Vercel; nilai `NEXT_PUBLIC_SITE_URL` berisi localhost diabaikan di Vercel.

## Premium — uji minat tanpa pembayaran

46. **`/premium` hanya uji minat ("Wizard of Oz", KK minggu 7)** — tim belum memakai payment gateway. Halaman berisi
    perbandingan Gratis vs Premium, harga rencana Rp20.000/bulan (KK 5.2), tombol **"Saya tertarik"** (+ pilihan fitur
    yang paling dibutuhkan, opsional) dan **"Chat ahli gizi via WhatsApp"** untuk konsultasi yang dilayani manual. Teks
    menegaskan belum ada pembayaran/biaya.
47. Dicatat sebagai event (tanpa migrasi baru): `premium_viewed`, `premium_interest {fitur[]}`, `premium_chat_clicked`.
    Klik chat lewat route `/premium/chat` supaya tercatat dulu, lalu dialihkan ke `wa.me/<KONTAK.whatsappLink>` dengan
    pesan pembuka; selama nomor masih dummy (kosong) diarahkan ke `/tentang` dan tombolnya berlabel "Hubungi tim".
48. Kartu **Revenue (uji minat)** di /admin = pengguna aktif 7 hari terakhir yang menekan "Saya tertarik" ÷ pengguna aktif
    7 hari (pengganti sementara "konversi berbayar"); ditambah daftar fitur premium paling diminati (dari pilihan terakhir
    tiap pengguna).
49. Fitur premium tetap **belum dibangun** (konsultasi, meal plan kondisi medis, rencana mingguan) — menunggu bukti minat
    dan ahli gizi.
