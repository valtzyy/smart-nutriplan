# TESTING.md

Tanggal sesi: 23 November 2026. Lingkungan: Windows 11, Node 22.23, Next.js 16.4.6.

## Status singkat

| Pemeriksaan | Hasil |
| --- | --- |
| `npm run lint` | ✅ bersih (0 error, 0 warning) |
| `npm test` (vitest) | ✅ 79 tes lulus, 5 file |
| `npm run build` tanpa env Supabase | ✅ sukses, semua halaman berdata dirender dinamis (ƒ) |
| Uji visual halaman publik di `npm run dev` (lebar 360 px) | ✅ |
| Uji manual alur Annisa dengan Supabase sungguhan | ⏳ **perlu dijalankan setelah deploy** — env Supabase tidak tersedia di sesi ini |

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

## Uji manual alur utama — PERLU DIJALANKAN SETELAH DEPLOY

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
