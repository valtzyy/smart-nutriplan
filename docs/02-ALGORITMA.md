# 02 — Algoritma kalori & generator meal plan

Semua fungsi di sini adalah fungsi murni di `src/lib/nutrition/` (tanpa akses database, tanpa `Date.now()` —
tanggal dan data dilewatkan sebagai argumen). Server action yang memanggilnya bertugas mengambil data dan menyimpan hasil.

Catatan: angka persentase, faktor, dan batas di bawah adalah usulan awal tim dan wajib dicek ahli gizi. Simpan
semuanya sebagai konstanta di satu file `src/lib/nutrition/constants.ts` agar mudah diubah.

## 1. Target kalori harian

```
BMR pria   = 10 × BB(kg) + 6,25 × TB(cm) − 5 × usia + 5
BMR wanita = 10 × BB(kg) + 6,25 × TB(cm) − 5 × usia − 161      (Mifflin-St Jeor)
TDEE       = BMR × faktor_aktivitas
mentah     = TDEE + penyesuaian_tujuan
target     = bulatkan_ke_10( max(mentah, batas_bawah[jenis_kelamin]) )
```

| aktivitas_fisik (enum) | faktor |
| --- | --- |
| `jarang` | 1,2 |
| `ringan` | 1,375 |
| `sedang` | 1,55 |
| `berat` | 1,725 |
| `sangat_berat` | 1,9 |

| tujuan (enum) | penyesuaian |
| --- | --- |
| `turun` | −500 |
| `jaga` | 0 |
| `naik` | +400 |

Batas bawah: wanita 1.200 kkal, pria 1.500 kkal. `bulatkan_ke_10(x) = Math.round(x / 10) * 10`.
Kembalikan juga `bmr`, `tdee`, dan `kenaBatasBawah: boolean` (UI boleh menampilkan info bila true).

## 2. Target per slot

| slot (enum `meal_slot`) | porsi |
| --- | --- |
| `sarapan` | 25% |
| `makan_siang` | 35% |
| `makan_malam` | 30% |
| `camilan` | 10% |

`target_slot = Math.round(target × porsi)`.

## 3. Generator

Input:
```ts
generateMealPlan({
  target: number,                 // kkal harian
  tujuan: 'turun' | 'jaga' | 'naik',
  avoidAllergenIds: number[],     // alergi + pantangan pengguna
  menus: Menu[],                  // hanya status 'aktif'
  recentMenuIds: string[],        // menu di meal plan 3 hari sebelum tanggal ini
  currentPlanMenuIds?: string[],  // diisi saat "buat ulang", menu yang sedang tampil hari ini
  seed: string,                   // `${userId}:${tanggal}:${regenerateCount}`
  jitter?: number,                // default 0.05; tes memakai 0
})
→ { items: Array<PlanItem | EmptySlot>, totalKalori, totalProtein, totalKarbo, totalLemak }
```

`PlanItem = { slot, menuId, multiplier, kalori, protein, karbohidrat, lemak, targetKaloriSlot, labelSelisih }`
`EmptySlot = { slot, empty: true, targetKaloriSlot }`

Langkah untuk setiap slot, urutan sarapan → makan_siang → makan_malam → camilan:

1. **Kandidat** = menu dengan `kategori === slot`, `cocok_untuk` memuat `tujuan`, tidak punya alergen di
   `avoidAllergenIds`, dan belum terpilih di slot lain hari ini.
2. Kandidat kosong → `EmptySlot`.
3. Untuk tiap kandidat, pilih multiplier dari `[0.75, 1, 1.25, 1.5, 2]` yang meminimalkan
   `|kalori × m − target_slot|`; bila seri, pilih yang paling dekat ke 1.
4. **Skor** (makin kecil makin baik):
   ```
   skor = |kalori × m − target_slot| / target_slot      // selisih relatif
        + 0,01 × |m − 1|                               // utamakan porsi wajar
        + 0,5  jika menu ada di recentMenuIds            // jangan ulang 3 hari terakhir
        + 0,3  jika menu ada di currentPlanMenuIds        // saat buat ulang, usahakan berganti
        + jitter × rng()                                  // variasi, rng deterministik dari seed
   ```
   `rng` = mulberry32 dengan seed hasil hash string (mis. cyrb53/FNV-1a) dari `seed`. Tanpa `Math.random`.
5. Ambil skor terkecil. `kalori_item = Math.round(kalori × m)`; protein/karbo/lemak dibulatkan ke gram bulat.
6. `labelSelisih = |kalori_item − target_slot| / target_slot > 0,10`.

Total = jumlah slot yang terisi.

## 4. Ganti per slot

```
swapSlot({ slot, currentMenuId, otherSlotMenuIds, ...sama seperti generator, seed: `${userId}:${tanggal}` })
```
Urutkan semua kandidat slot (aturan 1 & skor langkah 4, tanpa penalti currentPlanMenuIds) → daftar terurut.
Buang menu di `otherSlotMenuIds`. Ambil kandidat **setelah** `currentMenuId` di daftar itu; bila
`currentMenuId` adalah yang terakhir, kembali ke yang pertama. Kandidat tunggal → kembalikan `null`
(UI menonaktifkan tombol). Seed tanpa hitungan supaya urutan putaran stabil sepanjang hari.

## 5. Format Takaran Rumah Tangga

Tiap menu punya `porsi: [{ nama, qty, satuan }]`, misalnya `{ nama: 'Nasi putih', qty: 1, satuan: 'centong' }`.
Tampilan = `qty × multiplier`, dibulatkan:
- hasil < 1 → kelipatan 0,25 terdekat (minimal 0,25)
- hasil ≥ 1 → kelipatan 0,5 terdekat
- pembulatan memakai `Math.round(x / langkah) * langkah`

Format pecahan: 0,25 → `¼`, 0,5 → `½`, 0,75 → `¾`, 1,5 → `1½`, 2 → `2`, 2,5 → `2½`.
Hasil: `"{angka} {satuan} {nama lowercase}"` mis. `"1½ centong nasi putih"`.

## 6. Kasus uji wajib (vitest)

### 6.1 Target kalori
| # | Input | bmr | tdee | target |
| --- | --- | --- | --- | --- |
| 1 | wanita, 21 th, 55 kg, 160 cm, sedang, turun (Annisa) | 1284 | 1990,2 | **1490** |
| 2 | pria, 25 th, 70 kg, 175 cm, ringan, jaga | 1673,75 | 2301,41 (±0,01) | **2300** |
| 3 | pria, 30 th, 60 kg, 165 cm, jarang, turun | 1486,25 | 1783,5 | **1500** (kena batas bawah) |
| 4 | wanita, 40 th, 50 kg, 150 cm, jarang, turun | 1076,5 | 1291,8 | **1200** (kena batas bawah) |
| 5 | pria, 20 th, 65 kg, 170 cm, berat, naik | 1617,5 | 2790,19 (±0,01) | **3190** |

### 6.2 Target slot
Target 1490 → sarapan 373, makan_siang 522, makan_malam 447, camilan 149.

### 6.3 Generator (fixture kecil di file tes, `jitter: 0`)
Fixture sarapan: A = 300 kkal (tanpa alergen), B = 380 kkal (alergen telur), C = 450 kkal (tanpa alergen);
semua `cocok_untuk` ketiga tujuan. Target 1490.
1. Tanpa riwayat, avoid `[udang]` → sarapan = **A, multiplier 1,25, kalori 375**, `labelSelisih false`.
2. Avoid `[telur]` → tetap A (B tidak boleh muncul).
3. A ada di `recentMenuIds` → terpilih **B, multiplier 1, kalori 380**.
4. Semua menu sarapan beralergen udang, avoid `[udang]` → sarapan `EmptySlot`, slot lain tetap terisi bila ada kandidat.
5. Camilan hanya satu menu 100 kkal, target camilan 149 → multiplier 1,5, kalori 150, `labelSelisih false`;
   untuk target 3190 (camilan 319) → multiplier 2, kalori 200, `labelSelisih true`.
6. Menu dengan `cocok_untuk = ['naik']` tidak pernah muncul untuk tujuan `turun`.
7. Seed sama → hasil identik; seed berbeda dengan `jitter > 0` boleh berbeda (cukup uji determinisme).
8. Satu menu tidak boleh muncul di dua slot pada hari yang sama.

### 6.4 Ganti slot
Kandidat terurut [A, C] (B dibuang karena alergen): current A → C; current C → A; hanya satu kandidat → `null`;
menu yang sedang dipakai slot lain tidak pernah dipilih.

### 6.5 Format TRT
`(1, 0.75)` → `¾`; `(1, 1.25)` → `1½`; `(2, 1.25)` → `2½`; `(0.5, 0.75)` → `½`; `(1, 2)` → `2`;
`(1, 1)` → `1`; `(0.5, 1)` → `½`.

### 6.6 Waktu Jakarta
Fungsi `getJakartaNow(date: Date)` → `{ tanggal: 'YYYY-MM-DD', jam: number }`.
`2026-11-22T17:30:00Z` → tanggal `2026-11-23`, jam 0 (sudah lewat tengah malam WIB).
`nextMealSlot(jam)`: 9 → sarapan, 10 → makan_siang, 15 → camilan, 18 → makan_malam, 22 → `null`.
