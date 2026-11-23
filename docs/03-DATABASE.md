# 03 — Database (Supabase Postgres)

Sumber kebenaran: `supabase/migrations/0001_init.sql` (skema + RLS + trigger) dan `0002_seed.sql`
(10 alergen + 20 menu). Kedua file sudah diuji di Postgres 16 dengan stub skema `auth` Supabase.
Jangan ubah file itu; perubahan skema dibuat sebagai migrasi baru `0003_*.sql`.

## Tabel

| Tabel | Isi | Catatan |
| --- | --- | --- |
| `profiles` | 1 baris per user (`id` = `auth.users.id`) | Dibuat otomatis oleh trigger `on_auth_user_created` dari `user_metadata.nama`. Kolom profil null sampai onboarding diisi. `role` hanya bisa diubah admin atau dari SQL Editor |
| `allergens` | Master alergen & pantangan | `kode` dipakai di kode aplikasi, `jenis` membagi grup chip onboarding |
| `profile_allergens` | Alergen yang dihindari pengguna | Simpan dengan hapus-lalu-insert saat onboarding/edit |
| `menus` | Menu & resep | `porsi` jsonb `[{nama, qty, satuan}]`; `cocok_untuk` array `diet_goal`; pengguna hanya melihat `status = 'aktif'` |
| `menu_allergens` | Kandungan alergen per menu | Menu tanpa baris di sini dianggap aman untuk semua |
| `meal_plans` | 1 per user per `tanggal` (Asia/Jakarta) | `unique (user_id, tanggal)`; `regenerate_count` 0–3 |
| `meal_plan_items` | 4 baris per meal plan (satu per `slot`) | `menu_id` null = slot kosong; nilai gizi sudah dikali `multiplier` |
| `events` | Event analitik | Insert hanya untuk `user_id = auth.uid()`, baca hanya admin |

## Enum

- `gender`: `pria`, `wanita`
- `activity_level`: `jarang`, `ringan`, `sedang`, `berat`, `sangat_berat`
- `diet_goal`: `turun`, `jaga`, `naik`
- `meal_slot`: `sarapan`, `makan_siang`, `makan_malam`, `camilan`
- `allergen_kind`: `alergi`, `pantangan`
- `menu_status`: `draft`, `aktif`

Label tampilan Indonesia (buat satu peta konstanta di `src/lib/labels.ts`):
`makan_siang` → "Makan siang", `sangat_berat` → "Sangat berat", `jarang` → "Jarang bergerak", dst.

## Pola akses penting

- **Buat meal plan harian**: `insert ... on conflict (user_id, tanggal) do nothing returning *`; bila tidak ada
  baris kembali, `select` yang sudah ada. Items di-upsert `on conflict (meal_plan_id, slot)`.
- **Riwayat 3 hari**: `meal_plan_items` join `meal_plans` dengan `tanggal` antara `hari_ini - 3` dan `hari_ini - 1`.
- **Ganti slot**: update satu baris `meal_plan_items` (menu_id, multiplier, gizi, label_selisih).
- **Buat ulang**: cek `regenerate_count < 3`, update keempat item, lalu `regenerate_count + 1`.
- **Metrik admin**: query langsung sebagai admin (RLS mengizinkan admin membaca semua). Konversi `created_at`
  ke tanggal Jakarta dengan `(created_at at time zone 'Asia/Jakarta')::date`.

## Menetapkan admin

Jalankan di SQL Editor Supabase setelah akun admin mendaftar lewat aplikasi:
```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'email-admin@contoh.com');
```

## Tipe TypeScript

Hasilkan dengan `supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts` bila CLI
dan akses tersedia; kalau tidak, tulis tipe manual yang sesuai skema di atas.
