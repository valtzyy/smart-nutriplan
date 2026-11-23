# 01 — PRD Smart NutriPlan (MVP web)

## 1. Ringkasan

Smart NutriPlan membantu orang dewasa muda (mahasiswa dan pekerja, 18–35 tahun) yang sedang mengatur pola makan
mendapat **meal plan harian** dari masakan lokal: 4 waktu makan (sarapan, makan siang, makan malam, camilan),
lengkap dengan kalori, makro, porsi Takaran Rumah Tangga (TRT), bahan, dan cara memasak. Menu otomatis
menghindari alergen dan pantangan pengguna.

Masalah yang divalidasi (15 responden): 100% bingung menentukan menu sesuai tujuan; 53% kesulitan menghitung
kalori masakan lokal; mereka menolak pencatatan manual setiap selesai makan dan lebih suka takaran awam
("1 centong nasi") daripada gram.

Persona utama: **Annisa**, mahasiswi 21 tahun, aktif olahraga, ingin turun berat badan, alergi udang.

## 2. Ruang lingkup

**Masuk MVP**
1. Akun: daftar, masuk, keluar, lupa & reset kata sandi (email + password, Supabase Auth).
2. Onboarding 3 langkah: profil tubuh → tujuan → alergi & pantangan.
3. Generator meal plan harian otomatis + ganti menu per slot + buat ulang.
4. Beranda (ringkasan target dan makan berikutnya), halaman Meal Plan, Detail Menu & Resep.
5. Profil dan Edit Profil.
6. Halaman admin: metrik traksi dan kelola menu.
7. Pencatatan event analitik untuk metrik traksi.

**Tidak masuk MVP** (jangan dibuat): daftar belanja, premium/pembayaran, konsultasi ahli gizi, forum,
pelacakan makanan yang sudah dimakan, notifikasi, filter kondisi kesehatan (GERD, diabetes, dsb.),
aplikasi native, login Google.

## 3. Peran

| Peran | Cara dapat | Akses |
| --- | --- | --- |
| Pengunjung | Belum login | Welcome, Daftar, Masuk, Lupa/Reset sandi |
| Pengguna | Daftar | Onboarding, Beranda, Meal Plan, Detail Menu, Profil — hanya data miliknya |
| Admin | `role = 'admin'` di tabel `profiles` (di-set manual lewat SQL, lihat 05-DEPLOY) | Semua akses pengguna + `/admin/*` |

## 4. Rute

| Rute | Layar | Aturan akses & pengalihan |
| --- | --- | --- |
| `/` | Welcome | Publik. Sudah login + onboarding selesai → `/beranda`; sudah login + belum onboarding → `/onboarding/profil` |
| `/daftar` | Registrasi | Publik. Sudah login → alihkan seperti `/` |
| `/masuk` | Login | Publik. Sudah login → alihkan seperti `/` |
| `/cek-email` | Info konfirmasi email | Publik |
| `/lupa-sandi` | Minta tautan reset | Publik |
| `/reset-sandi` | Atur sandi baru (dari tautan email) | Butuh sesi recovery dari Supabase |
| `/auth/callback` | Route handler tukar `code` → sesi | Teknis |
| `/onboarding/profil` | Langkah 1 | Login. Onboarding sudah selesai → `/beranda` |
| `/onboarding/tujuan` | Langkah 2 | Login. Langkah 1 belum lengkap → `/onboarding/profil` |
| `/onboarding/preferensi` | Langkah 3 | Login. Langkah 1–2 belum lengkap → langkah yang kurang |
| `/beranda` | Dashboard | Login + onboarding selesai, selain itu → onboarding |
| `/meal-plan` | Meal plan hari ini | Sama dengan `/beranda` |
| `/menu/[slug]` | Detail menu & resep | Sama dengan `/beranda`. Query opsional `?item=<meal_plan_item_id>` untuk porsi yang sudah diskalakan |
| `/profil` | Ringkasan profil | Sama dengan `/beranda` |
| `/profil/edit` | Edit profil | Sama dengan `/beranda` |
| `/admin` | Metrik traksi | Hanya admin, selain itu 404 |
| `/admin/menu` | Daftar menu | Hanya admin |
| `/admin/menu/baru`, `/admin/menu/[id]` | Form menu | Hanya admin |

Proteksi dilakukan di middleware (sesi) dan diperkuat di server component/action (onboarding & role).

## 5. Aturan bisnis

### 5.1 Target kalori
Dihitung dengan rumus di `02-ALGORITMA.md` dari usia, jenis kelamin, BB, TB, aktivitas, dan tujuan.
Selalu dihitung ulang dari profil terbaru; disalin ke `meal_plans.target_kalori` saat meal plan dibuat.

### 5.2 Siklus meal plan harian
- Satu meal plan per pengguna per tanggal (zona Asia/Jakarta).
- **Dibuat otomatis** saat pengguna membuka `/beranda` atau `/meal-plan` dan belum ada meal plan untuk hari ini.
  Harus aman terhadap dua request bersamaan (constraint unik `user_id, tanggal`; bila bentrok, baca yang sudah ada).
- Langkah terakhir onboarding langsung membuat meal plan hari ini.
- Meal plan hari-hari sebelumnya disimpan (dipakai aturan "tidak mengulang menu 3 hari terakhir").
- Halaman Meal Plan hanya menampilkan **hari ini**.

### 5.3 Ganti dan buat ulang
- **Ganti** (per slot, tombol di kartu menu halaman Meal Plan): pilih kandidat terbaik berikutnya untuk slot itu,
  selain menu yang sedang tampil dan menu di slot lain hari ini. Tidak dibatasi; kalau kandidat habis, berputar
  dari awal. Kalau hanya ada 1 kandidat, tombol nonaktif dengan teks bantuan "Belum ada menu lain yang cocok".
- **Buat ulang meal plan** (tombol di bawah daftar): membuat ulang keempat slot. Maksimal **3 kali per hari**
  (`meal_plans.regenerate_count`). Setelah batas, tombol nonaktif dengan teks "Batas buat ulang hari ini sudah
  habis. Coba ganti per menu."
- Pembuatan ulang karena edit profil **tidak** menambah hitungan.

### 5.4 Edit profil
Setelah simpan di `/profil/edit`, target kalori dihitung ulang dan muncul dialog:
"Profilmu sudah diperbarui. Perbarui meal plan hari ini juga?" — **Ya, perbarui** (buat ulang hari ini,
sumber `profile_update`) atau **Nanti saja** (berlaku mulai besok). Arahkan ke `/beranda`.

### 5.5 Validasi input
| Field | Aturan | Pesan error |
| --- | --- | --- |
| Nama panggilan | 2–30 karakter | "Nama panggilan 2–30 karakter, ya." |
| Email | format email | "Format email belum benar." |
| Kata sandi | ≥ 8 karakter | "Kata sandi minimal 8 karakter." |
| Usia | bilangan bulat 18–65 | Di luar rentang, tampilkan kotak info (bukan sekadar error): "Smart NutriPlan saat ini dirancang untuk usia 18–65 tahun. Untuk usia di luar itu, konsultasikan pola makanmu dengan tenaga kesehatan." Tombol Lanjut nonaktif. |
| Jenis kelamin | wajib, pria/wanita | "Pilih salah satu, ya." (dipakai rumus kalori) |
| Berat badan | 30–250 kg, boleh 1 desimal | "Berat badan antara 30–250 kg." |
| Tinggi badan | 120–230 cm | "Tinggi badan antara 120–230 cm." |
| Aktivitas fisik | wajib | "Pilih tingkat aktivitasmu." |
| Tujuan | wajib | "Pilih satu tujuan." |
| Alergi/pantangan | opsional | — |

Error tampil di bawah field, warna aksen gelap, bukan merah mencolok. Validasi dengan zod di klien dan server.

### 5.6 "Makan berikutnya" (Beranda), zona Asia/Jakarta
| Jam | Tampilkan |
| --- | --- |
| 00:00–09:59 | Sarapan |
| 10:00–14:59 | Makan siang |
| 15:00–17:59 | Camilan |
| 18:00–21:59 | Makan malam |
| 22:00–23:59 | Teks "Selesai untuk hari ini. Meal plan besok dibuat saat kamu membuka aplikasi." + kartu sarapan hari ini disembunyikan |

### 5.7 Keadaan kosong & galat
- Satu slot tanpa kandidat setelah filter → slot tetap muncul sebagai kartu EmptyState:
  "Belum ada menu {slot} yang cocok dengan pantanganmu." + tombol "Ubah pantangan" → `/profil/edit`.
  Kejadian ini dicatat event `slot_empty`.
- Semua slot kosong → halaman EmptyState penuh dengan pesan sama + tombol.
- Kalori menu terpilih meleset > 10% dari target slot → kartu menampilkan badge "Kalori sedikit berbeda dari target".
- Galat jaringan/server → toast "Ada kendala, coba lagi sebentar." Tombol aksi kembali aktif.
- Halaman `/menu/[slug]` dengan slug tidak ada → 404 dengan tombol kembali ke Meal Plan.

## 6. Spesifikasi layar

Semua layar: lebar maksimum 480px, latar `bg`, status bar tidak perlu dibuat (web). Desain acuan:
Figma "Smart NutriPlan — Prototype MVP (Mobile)" https://www.figma.com/design/GcZuI7uDAF14vyCCt5EVnX
(halaman Prototype & Design System). Kalau Figma tidak bisa diakses, cukup ikuti spesifikasi ini.

### 6.1 Welcome `/`
- Panel hero hijau muda (`primary-soft`) dengan sudut bawah membulat 32px: logo horizontal (190×80)
  di atas, lalu ilustrasi piring sederhana (lingkaran bertumpuk warna token, SVG inline).
- Judul H1 "Porsi tepat, hidup sehat". Paragraf: "Isi profil sekali, lalu dapatkan meal plan harian dari
  masakan lokal, lengkap dengan kalori dan takaran rumah tangga."
- Tombol utama "Mulai Perjalanan Sehatmu" → `/daftar`. Tombol ghost "Saya sudah punya akun" → `/masuk`.
- Disclaimer kecil di bawah.

### 6.2 Daftar `/daftar`
Tombol kembali, judul "Buat akun", subjudul "Supaya meal plan-mu tersimpan dan bisa dibuka lagi kapan saja."
Field: Nama panggilan, Email, Kata sandi (dengan tombol tampil/sembunyi). Tombol "Daftar". Teks
"Sudah punya akun? Masuk". Nama disimpan di `user_metadata.nama` (trigger membuat baris `profiles`).
Bila Supabase mengembalikan sesi → `/onboarding/profil`; bila perlu konfirmasi email → `/cek-email`.
Email sudah terdaftar → "Email ini sudah terdaftar. Coba masuk."

### 6.3 Masuk `/masuk`
Judul "Selamat datang lagi". Email, Kata sandi, tautan "Lupa kata sandi?", tombol "Masuk", teks
"Belum punya akun? Daftar". Gagal → "Email atau kata sandi salah."

### 6.4 Lupa & reset sandi
`/lupa-sandi`: field email, tombol "Kirim tautan reset", setelah kirim selalu tampilkan
"Kalau email terdaftar, tautan reset sudah kami kirim." `/reset-sandi`: sandi baru + ulangi, tombol
"Simpan sandi baru" → `/beranda`.

### 6.5 Onboarding (stepper "Langkah X dari 3" + bar 3 segmen, tombol kembali)
**Langkah 1 Profil** — judul "Kenalan dulu, yuk", sub "Data ini dipakai untuk menghitung kebutuhan kalori
harianmu." Usia (satuan "tahun"), Jenis kelamin (chip Pria/Wanita), BB (kg) & TB (cm) berdampingan,
Aktivitas fisik (chip, dengan deskripsi singkat pilihan aktif):
Jarang bergerak ("kuliah/kerja banyak duduk"), Ringan ("olahraga 1–3x/minggu"), Sedang ("olahraga 3–5x/minggu"),
Berat ("olahraga 6–7x/minggu"), Sangat berat ("atlet atau kerja fisik berat"). Tombol "Lanjut".

**Langkah 2 Tujuan** — judul "Apa tujuan pola makanmu?", sub "Pilih satu. Kamu bisa menggantinya kapan saja
di Profil." Option card: Turunkan berat badan ("Defisit sekitar 500 kkal per hari"), Jaga berat badan
("Kalori sesuai kebutuhan harianmu"), Naikkan berat badan ("Surplus sekitar 400 kkal, cocok untuk bulking").
Kotak info: "Demi keamanan, target kalori tidak akan di bawah 1.200 kkal (wanita) atau 1.500 kkal (pria)."
Disclaimer. Tombol "Lanjut".

**Langkah 3 Preferensi** — judul "Ada yang perlu dihindari?", sub "Menu yang mengandung bahan ini tidak akan
muncul di meal plan-mu." Grup "Alergi makanan" dan "Pantangan atau tidak suka" dari tabel `allergens`
(multi-pilih chip). Kotak info: "Punya kondisi medis seperti GERD atau diabetes? Konsultasikan dulu ke ahli gizi.
Filter kondisi kesehatan hadir di versi berikutnya." Disclaimer. Tombol "Buat Rencana Makanku" →
simpan, set `onboarding_selesai = true`, buat meal plan hari ini, → `/beranda`.

Data tiap langkah disimpan ke `profiles` saat menekan Lanjut, sehingga refresh melanjutkan dari langkah yang benar.

### 6.6 Beranda `/beranda`
- Salam: tanggal ("Senin, 23 November") + "Hai, {nama}" + avatar inisial.
- Kartu target (latar `primary-strong`, teks putih): "Target kalori hari ini", angka besar "1.490 kkal",
  bar dengan label "Rencana hari ini vs target", teks "Meal plan hari ini {total} kkal", 3 kotak makro
  (Protein, Karbo, Lemak — total gram meal plan hari ini).
- "Makan berikutnya" sesuai 5.6: satu MealCard (klik → detail).
- Tombol sekunder "Lihat meal plan lengkap" → `/meal-plan`.
- Kotak tips: "Takaran rumah tangga: 1 centong nasi kira-kira 100 gram nasi matang."
- Disclaimer. Bottom nav (Beranda aktif).

### 6.7 Meal Plan `/meal-plan`
Judul "Meal plan hari ini" + tanggal. Badge "Target {x} kkal" dan "Total {y} kkal". Empat MealCard berurutan
sarapan → makan siang → makan malam → camilan; tiap kartu: foto/placeholder, label slot, nama, ringkasan porsi
TRT, kalori, tombol ikon "Ganti". Klik kartu → `/menu/[slug]?item=<id>`. Teks "Semua menu bebas {daftar alergen
pengguna}, sesuai preferensimu." (sembunyikan bila tidak ada). Tombol "Buat ulang meal plan" + sisa kuota
("Sisa 2 kali hari ini"). Bottom nav (Meal Plan aktif).

### 6.8 Detail menu `/menu/[slug]`
Tombol kembali, foto (atau placeholder), nama (H2), meta "{slot} · {kalori} kkal · ±{waktu} menit", badge
"Bebas {alergen pengguna}" untuk tiap alergen pengguna (maks 3) + badge "Tinggi protein" bila protein ≥ 25 g,
4 kotak gizi (Kalori, Protein, Karbo, Lemak — sudah dikali multiplier bila ada `?item`), bagian
"Porsi (takaran rumah tangga)" (daftar komponen × multiplier, format pecahan), "Bahan", "Cara memasak"
(langkah bernomor), catatan sumber: "Estimasi gizi berdasarkan {sumber_gizi}. Perkiraan biaya bahan
±Rp{harga×multiplier} untuk 1 porsi." + label "Estimasi gizi — belum dicek ahli gizi" bila belum dicek.

### 6.9 Profil `/profil` dan `/profil/edit`
`/profil`: avatar + nama + email, ringkasan (usia, BB, TB, aktivitas, tujuan, target kalori, alergen),
tombol "Edit profil", tombol "Keluar", tautan kecil "Tentang data kesehatanmu" (modal: data hanya dipakai
untuk menghitung meal plan dan tidak dibagikan). Bottom nav (Profil aktif).
`/profil/edit`: satu halaman berisi semua field onboarding (sudah terisi) + nama. Tombol "Simpan" → aturan 5.4.

### 6.10 Admin
`/admin`: kartu metrik — Total pengguna, Selesai onboarding, Aktif hari ini, Aktif 7 hari terakhir,
Retensi D1 (% pengguna yang punya event pada hari setelah tanggal daftar, dari pengguna yang daftar ≥ 1 hari lalu),
Meal plan dibuat hari ini, Resep dibuka 7 hari terakhir, Slot kosong 7 hari terakhir. Tabel 14 hari terakhir:
tanggal, pengguna baru, pengguna aktif, meal plan dibuat. "Aktif" = punya minimal 1 event pada tanggal itu
(Asia/Jakarta). Tombol "Unduh CSV" untuk tabel.
`/admin/menu`: tabel menu (nama, kategori, kalori, status, dicek ahli gizi) dengan filter kategori & status,
tombol "Tambah menu". Form: semua kolom tabel `menus`, porsi sebagai baris dinamis (nama, qty, satuan),
bahan & langkah sebagai daftar baris, alergen multi-pilih, cocok_untuk multi-pilih, toggle status & dicek ahli gizi.

## 7. Event analitik (tabel `events`)

| nama | kapan | meta |
| --- | --- | --- |
| `sign_up` | daftar berhasil | — |
| `login` | masuk berhasil | — |
| `onboarding_step_completed` | tiap langkah onboarding tersimpan | `{ step: 1|2|3 }` |
| `onboarding_completed` | langkah 3 selesai | — |
| `plan_generated` | meal plan dibuat | `{ source: 'auto'|'onboarding'|'regenerate'|'profile_update' }` |
| `plan_viewed` | buka `/beranda` atau `/meal-plan` | `{ page }` |
| `menu_swapped` | ganti per slot | `{ slot, from, to }` |
| `recipe_viewed` | buka detail menu | `{ slug }` |
| `slot_empty` | slot tanpa kandidat | `{ slot }` |
| `profile_updated` | simpan edit profil | `{ regenerated: boolean }` |
| `logout` | keluar | — |

Pencatatan dari server (server action / route handler), tidak memblokir UI bila gagal.
