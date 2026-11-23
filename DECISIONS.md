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
