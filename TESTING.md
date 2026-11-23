# TESTING.md

Tanggal sesi: 23 November 2026. Lingkungan: Windows 11, Node 22.23, Next.js 16.4.6.

## Status singkat

| Pemeriksaan | Hasil |
| --- | --- |
| `npm run lint` | ✅ bersih (0 error, 0 warning) |
| `npm test` (vitest) | ✅ 79 tes lulus, 5 file |
| `npm run build` tanpa env Supabase | ✅ sukses, semua halaman berdata dirender dinamis (ƒ) |
| Uji visual halaman publik di `npm run dev` (lebar 360 px) | ✅ |
| Uji manual alur Annisa dengan Supabase sungguhan (lokal, `npm run dev`) | ✅ lulus — lihat "Hasil uji alur Annisa" |
| Uji di URL produksi | ⏳ belum — `https://smart-nutriplan.vercel.app` masih `NOT_FOUND` dari Vercel |

## Tes otomatis (vitest)

`src/lib/nutrition/nutrition.test.ts` — semua kasus uji `docs/02-ALGORITMA.md`:
- 6.1 target kalori kasus 1–5 (bmr, tdee ±0,01, target, `kenaBatasBawah`) — termasuk **Annisa = 1.490 kkal**
- 6.2 target slot 1490 → 373 / 522 / 447 / 149
- 6.3 generator kasus 1–8 (fixture A/B/C, `jitter: 0`) + penalti "buat ulang"
- 6.4 ganti slot (A → C, C → A, kandidat tunggal → `null`, menu slot lain tak pernah dipilih)
- 6.5 format TRT ( ¾, 1½, 2½, ½, 2, 1, ½ ) + minimal ¼ + format lengkap "1½ centong nasi putih"

`src/lib/date.test.ts` — 6.6 `getJakartaNow` (`2026-11-22T17:30:00Z` → `2026-11-23`, jam 0), `nextMealSlot`
untuk 9/10/15/18/22 dan batas-batasnya, util tanggal.

`src/lib/nutrition/seed.test.ts` — generator dengan **20 menu sungguhan** dari `data/seed/menus.json`:
- Annisa (1.490 kkal, alergi udang): 30 hari berturut-turut → selalu 4 menu terisi, tidak ada udang, tidak ada menu ganda
- Ganti slot berputar tanpa udang, tidak memakai menu slot lain, kembali ke menu awal
- Untuk setiap kode alergen/pantangan seed × 3 tujuan × 4 target: tidak ada menu yang mengandungnya
- Semua komponen porsi × semua multiplier menghasilkan teks TRT tanpa desimal

`src/lib/validation.test.ts` — pesan validasi PRD 5.5, BB 1 desimal, usia bulat & kotak info 18–65,
pengalihan onboarding (`homePathFor`), `safeNextPath` menolak URL luar.

`src/lib/admin-metrics.test.ts` — metrik admin di zona Jakarta, retensi D1, tabel 14 hari, CSV.

## Uji manual yang sudah dilakukan (tanpa Supabase)

Server `npm run dev`, browser 360×760:
- `/` Welcome: logo horizontal, ilustrasi piring SVG dari token, judul, 2 tombol, disclaimer ✅
- `/daftar` kirim kosong → "Nama panggilan 2–30 karakter, ya." / "Format email belum benar." /
  "Kata sandi minimal 8 karakter." di bawah field, warna `danger-text` ✅
- `/beranda`, `/onboarding/profil` tanpa sesi → dialihkan ke `/masuk` ✅
- `/admin` tanpa sesi → 404 ✅
- Pratinjau komponen (halaman sementara, sudah dihapus): form langkah 1 dengan usia 17 → kotak info usia muncul dan
  tombol "Lanjut" nonaktif; chip aktivitas + deskripsi; MealCard dengan badge "Kalori sedikit berbeda dari target"
  dan tombol Ganti; kartu EmptyState "Belum ada menu camilan yang cocok dengan pantanganmu." + "Ubah pantangan";
  BottomNav — semua rapi di 360 px ✅

## Hasil uji alur Annisa (23 Nov 2026, ±14:55 WIB, lokal → Supabase proyek produksi, viewport 390×800)

Akun uji dibuat dengan email `annisa.uji.<timestamp>@example.com` (kredensial di `.env.test.local`, tidak di-commit).

| # | Langkah | Hasil |
| --- | --- | --- |
| 2 | Daftar "Annisa" → langsung ke `/onboarding/profil` | ✅ |
| 3 | Buka `/beranda` sebelum onboarding → kembali ke `/onboarding/profil` | ✅ |
| 4 | Langkah 1 (21 th, wanita, 55 kg, 160 cm, sedang) → reload langsung ke langkah 2 | ✅ |
| 5 | Langkah 2 "Turunkan berat badan"; kotak info batas kalori + disclaimer tampil | ✅ |
| 6 | Langkah 3 alergi Udang; kotak info GERD + disclaimer → Beranda | ✅ |
| 7 | Beranda: **Target 1.490 kkal**, total 1.495 kkal, makro, "Makan berikutnya" = Makan siang (jam 14 WIB), tips, disclaimer | ✅ |
| 8 | Meal Plan: 4 menu (nasi merah + telur dadar sayur / nasi + ayam bakar + sayur bening / nasi + telur balado + sayur sop / yogurt + buah potong), **tanpa udang**, "Semua menu bebas udang…", "Sisa 3 kali hari ini" | ✅ |
| 9 | Detail yogurt: "Camilan · 150 kkal · ±5 menit", badge "Bebas udang", porsi "½ mangkok buah potong", bahan, langkah, sumber + biaya ±Rp8.000, label "Estimasi gizi — belum dicek ahli gizi" | ✅ |
| 10 | Ganti sarapan → hanya slot sarapan berubah (→ roti gandum + selai kacang + pisang) | ✅ |
| 11 | Buat ulang ×3 → "Sisa 2…", lalu tombol nonaktif + "Batas buat ulang hari ini sudah habis. Coba ganti per menu." | ✅ |
| 12 | Edit profil BB 60 → dialog → "Ya, perbarui" → Beranda **1.570 kkal**; kuota buat ulang tetap habis (tidak bertambah) | ✅ |
| 13 | Semua 10 alergen/pantangan dipilih → plan dibuat ulang tanpa satu pun; sarapan tinggal 1 kandidat → tombol Ganti nonaktif "Belum ada menu lain yang cocok" | ✅ (kartu EmptyState slot tidak bisa dipicu dengan 20 menu seed karena tiap slot selalu punya ≥1 menu bebas semua alergen — tercakup tes unit 6.3-4) |
| 14 | Keluar → Welcome; `/beranda` → `/masuk?next=/beranda` | ✅ |
| 15 | Masuk lagi → `/beranda`, meal plan hari ini sama (target 1.570) | ✅ |
| 16 | Lupa/reset sandi | ⏳ butuh email sungguhan — uji di produksi |
| 17 | Admin | ⏳ butuh SQL penetapan admin — uji di produksi |
| 18 | Tabel `events` | ⏳ hanya admin yang bisa membaca (RLS) — cek di Table Editor Supabase |

Perbaikan kecil dari uji ini: nama aksesibel OptionCard (tujuan), judul tab halaman detail menu, label kotak gizi
("Kalori (kkal)", "7 g / Protein").

Catatan data: porsi "1 butir telur telur dadar sayur" muncul karena satuan seed = "butir telur" dan nama = "Telur dadar
sayur" (format TRT sesuai spesifikasi). Bisa dirapikan lewat `/admin/menu` (mis. satuan "porsi").

## Uji manual alur utama — ulangi di URL produksi setelah deploy

Prasyarat: migrasi 0001 + 0002 sudah dijalankan, "Confirm email" OFF (lihat `DEPLOY_STATUS.md`).
Lakukan di HP (lebar 360–430 px) atau DevTools mode mobile. Centang tiap butir.

1. [ ] Buka `/` → tampil Welcome + disclaimer. Klik "Mulai Perjalanan Sehatmu".
2. [ ] Daftar: nama "Annisa", email baru, sandi ≥ 8 → langsung ke `/onboarding/profil`.
3. [ ] Coba buka `/beranda` lewat address bar → dialihkan kembali ke `/onboarding/profil`.
4. [ ] Langkah 1: usia 21, Wanita, BB 55, TB 160, aktivitas Sedang → Lanjut. Refresh halaman → masuk langkah 2.
5. [ ] Langkah 2: "Turunkan berat badan"; kotak info batas kalori + disclaimer tampil → Lanjut.
6. [ ] Langkah 3: pilih alergi "Udang"; kotak info GERD + disclaimer tampil → "Buat Rencana Makanku".
7. [ ] Beranda: "Target kalori hari ini **1.490 kkal**", bar progres, total + 3 makro, "Makan berikutnya" sesuai jam WIB,
       tips centong, disclaimer.
8. [ ] Meal Plan: 4 kartu urut sarapan → makan siang → makan malam → camilan, **tidak ada menu udang**
       (mis. "Nasi merah + tumis udang brokoli" tidak boleh muncul), teks "Semua menu bebas udang, sesuai preferensimu.",
       "Sisa 3 kali hari ini".
9. [ ] Buka salah satu kartu → detail: meta slot · kkal · menit, badge "Bebas udang", 4 kotak gizi, porsi TRT dengan
       pecahan (½ / ¼ / ¾ / 1½), bahan, langkah bernomor, catatan sumber + biaya, label
       "Estimasi gizi — belum dicek ahli gizi".
10. [ ] Kembali, tekan "Ganti" di satu slot → menu slot itu berubah, slot lain tetap.
11. [ ] "Buat ulang meal plan" → keempat slot dibuat ulang, teks jadi "Sisa 2 kali hari ini". Ulangi sampai 0 →
        tombol nonaktif + "Batas buat ulang hari ini sudah habis. Coba ganti per menu."
12. [ ] Profil → "Edit profil": ubah BB ke 60 → Simpan → dialog "Profilmu sudah diperbarui. Perbarui meal plan hari ini
        juga?" → "Ya, perbarui" → Beranda dengan target baru (1.570 kkal untuk BB 60). Kuota buat ulang tidak berubah.
13. [ ] Edit profil: centang banyak pantangan sampai satu slot kosong → kartu EmptyState slot + tombol "Ubah pantangan".
14. [ ] Profil → "Keluar" → ke Welcome. `/beranda` → dialihkan ke `/masuk`.
15. [ ] Masuk lagi dengan akun Annisa → langsung ke `/beranda`, meal plan hari ini sama (tidak dibuat baru).
16. [ ] Lupa sandi: kirim email → "Kalau email terdaftar, tautan reset sudah kami kirim." → buka tautan →
        `/reset-sandi` → simpan → `/beranda`.
17. [ ] Admin: jalankan SQL penetapan admin (03-DATABASE.md), buka `/admin` → 8 kartu metrik + tabel 14 hari +
        "Unduh CSV"; `/admin/menu` filter kategori/status, edit satu menu, tambah menu baru (status draft tidak muncul
        di meal plan). Akun non-admin membuka `/admin` → 404.
18. [ ] Supabase → Table Editor `events`: ada `sign_up`, `onboarding_step_completed` ×3, `onboarding_completed`,
        `plan_generated` (onboarding/regenerate/profile_update), `plan_viewed`, `recipe_viewed`, `menu_swapped`,
        `profile_updated`, `logout`, `login`.

Catat hasil (✅/❌ + catatan) langsung di daftar ini.

## Penyesuaian KERTAS KERJA (Tentang/Privasi, Masukan+NPS, Rujukan+AARRR, Anggaran)

Otomatis: `npm test` → **96 tes lulus** (tambahan: AARRR/NPS, perkiraan biaya & status anggaran, validasi anggaran,
persetujuan ketentuan, normalisasi kode rujukan). Lint bersih, build tanpa env sukses.

Migrasi `0003_feedback_referral.sql` diuji di Postgres 18 lokal (stub skema `auth`): backfill kode rujukan, pendaftar
dengan `ref` (huruf kecil pun cocok) tercatat `dirujuk_oleh`, kode salah → null, persetujuan tersimpan, pengguna tidak
bisa mengubah kode/perujuk sendiri, RLS feedback (insert milik sendiri; baca milik sendiri/admin), NPS di luar 0–10
ditolak, migrasi bisa dijalankan ulang. ✅

Lokal (`npm run dev`, 390 px, Supabase proyek ini — **0003 belum dijalankan di Supabase**):
- `/tentang`, `/privasi` tampil; tautan di Welcome & Profil ✅
- Edit profil: anggaran "30.000" tersimpan → Beranda "±Rp37.000 … Sekitar Rp7.000 di atas anggaranmu (Rp30.000/hari)";
  Profil "Anggaran makan/hari Rp30.000" ✅
- Masukan: kirim tanpa skor → "Pilih skor 0–10, ya." (juga tanpa JS); kirim skor 9 → toast "Ada kendala…" karena tabel
  `feedback` belum ada (PGRST205) — perilaku yang diharapkan sebelum migrasi ✅
- "Ajak teman" tersembunyi sampai kolom `kode_rujukan` ada ✅

Perlu diuji setelah 0003 dijalankan: kirim masukan → "Terima kasih"; Profil menampilkan "Ajak teman"; daftar lewat
`/?ref=KODE` → admin AARRR "Datang lewat rujukan" bertambah; `/admin/masukan` menampilkan jawaban + skor NPS.

### Setelah migrasi 0003 dijalankan di Supabase (23 Nov 2026)

REST: tabel `feedback` dan kolom `profiles.kode_rujukan` tersedia (HTTP 200; anon melihat 0 baris karena RLS). ✅

Lokal (`npm run dev`, 390 px, Supabase proyek ini):
- Masukan: skor 8 + 2 jawaban bertanda "[UJI CLAUDE]" → layar "Terima kasih atas masukanmu!" ✅
- Profil akun uji Annisa: "Ajak teman" tampil dengan tautan `/?ref=832B6AD1` ✅
- Keluar → Welcome, cookie sesi terhapus ✅ (percobaan pertama tampak gagal hanya karena panel browser uji tersembunyi
  sehingga redirect klien tertahan; diulang dengan panel aktif → berhasil)
- `/?ref=832b6ad1` → tombol "Mulai" mengarah ke `/daftar?ref=832B6AD1` (huruf dinormalkan) ✅
- `/daftar?ref=…` menampilkan "Kamu diajak oleh teman (kode 832B6AD1)" ✅
- Daftar tanpa centang persetujuan → "Centang persetujuan dulu, ya." ✅; dengan centang → akun uji ke-2 ("Budi") terdaftar
  dan masuk onboarding (trigger `handle_new_user` versi 0003 berjalan tanpa galat) ✅
- ✅ Dicek admin (23 Nov 2026): /admin → AARRR "Datang lewat rujukan" = 1 pengguna; /admin/masukan menampilkan jawaban "[UJI CLAUDE]"
  dengan NPS 8.

Akun uji (kredensial di `.env.test.local`, tidak di-commit): `annisa.uji.…@example.com` (perujuk) dan
`budi.rujukan.…@example.com` (dirujuk, onboarding belum diisi). Hapus keduanya di Supabase → Authentication → Users
sebelum menghitung metrik sungguhan; masukan uji ikut terhapus (cascade).

## Premium (uji minat) — lokal, Supabase proyek ini, 390 px
- `/premium`: hero Rp20.000/bulan "Segera hadir", kotak info "belum ada pembayaran", tabel Gratis vs Premium ✅
- Pilih fitur "Konsultasi" + "Mingguan" → "Saya tertarik" → "Terima kasih, minatmu sudah kami catat!" ✅
- "Hubungi tim" → `/premium/chat` (307) → `/tentang` karena nomor WhatsApp masih dummy ✅
- Tidak ada galat server / peringatan `[events]` ✅. Tes unit metrik minat premium (pengguna unik, % pengguna aktif 7 hari,
  fitur teratas dari minat terakhir) ✅ — total **98 tes lulus**.
- ⏳ Cek di /admin: kartu "Revenue (uji minat)" dan daftar "Fitur premium paling diminati" (akun uji Budi: konsultasi, mingguan).
