# 04 — Design system

Acuan visual: Figma "Smart NutriPlan — Prototype MVP (Mobile)" (halaman Design System & Prototype)
https://www.figma.com/design/GcZuI7uDAF14vyCCt5EVnX — kalau sesi Claude Code punya akses Figma MCP, buka untuk
mencocokkan tampilan; kalau tidak, spesifikasi di bawah sudah cukup.

Kepribadian merek: suportif, cerdas, praktis. Visual masakan lokal/rumahan, hindari merah mencolok.

## Warna (daftarkan sebagai `theme.extend.colors` / CSS variable)

| Token | Hex | Pakai untuk |
| --- | --- | --- |
| `primary` | #7C9A74 | Aksen hijau sage, ilustrasi, ikon dekoratif |
| `primary-strong` | #4F6B49 | Tombol utama, teks tautan, chip terpilih, kartu target (teks putih di atasnya lolos kontras) |
| `primary-soft` | #E8EFE5 | Latar hero, chip terpilih, kotak tips |
| `accent` | #F28500 | Bar progres, ikon api/kalori, sorotan kecil (bukan untuk teks kecil) |
| `accent-soft` | #FDEBD3 | Kotak info/peringatan, badge sekunder, placeholder foto |
| `text` | #333333 | Teks utama |
| `text-muted` | #6E6A63 | Teks sekunder, label |
| `on-primary` | #FFFFFF | Teks di atas `primary-strong` |
| `bg` | #FDFBF7 | Latar halaman |
| `surface` | #FFFFFF | Kartu, input |
| `border` | #E6E1D8 | Garis kartu & input |
| `danger-text` | #9A3412 | Teks error form (oranye gelap, bukan merah terang) |

## Tipografi (`@fontsource/poppins` 600/700, `@fontsource/inter` 400/500/600)

| Style | Font | Ukuran / line-height |
| --- | --- | --- |
| H1 | Poppins Bold | 28 / 36 |
| H2 | Poppins SemiBold | 22 / 30 |
| H3 | Poppins SemiBold | 17 / 24 |
| Body | Inter Regular | 15 / 22 |
| Body Strong | Inter SemiBold | 15 / 22 |
| Body Small | Inter Regular | 13 / 18 |
| Label | Inter Medium | 13 / 18 |
| Caption | Inter Regular | 12 / 16 |

## Spacing & radius
Spacing kelipatan 4/8: 4, 8, 12, 16, 24, 32. Padding horizontal halaman 24. Jarak antar blok 20–24.
Radius: `sm` 8, `md` 12 (tombol, input), `lg` 20 (kartu), `full` (chip, avatar, badge). Tanpa bayangan berat;
kartu memakai border 1px `border`.

## Komponen (`src/components/ui/`)

| Komponen | Spesifikasi |
| --- | --- |
| `Button` | Tinggi 52, lebar penuh default, radius md, Body Strong. Varian: `primary` (bg primary-strong, teks putih), `secondary` (bg surface, border 1.5 border, teks primary-strong), `ghost` (tanpa latar, teks primary-strong). State loading (spinner + nonaktif), disabled (opasitas 50%) |
| `Input` | Label (Label, text-muted) di atas; kotak tinggi 52, bg surface, border 1.5, radius md, padding x 16; sufiks satuan opsional (text-muted); pesan error di bawah (Caption, danger-text); focus ring primary-strong |
| `Chip` | Pill, padding 8/16, Label. Default: surface + border. Terpilih: primary-soft + border primary-strong + ikon centang 16 + teks primary-strong. Bisa single/multi select, aksesibel (role checkbox/radio) |
| `OptionCard` | Kartu radius lg padding 16: judul Body Strong + deskripsi Body Small muted + radio bulat 22 di kanan. Terpilih: primary-soft, border 2 primary-strong, radio terisi |
| `MealCard` | Kartu radius lg padding 12: foto 72×72 radius md (placeholder accent-soft + ikon piring bila `foto_url` null), kolom tengah (label slot Label primary-strong uppercase, nama Body Strong, porsi Body Small muted), kolom kanan (kalori H3 + "kkal" Caption). Badge selisih opsional. Tombol ikon "Ganti" opsional |
| `Badge` | Pill padding 4/12, Label. `primary` (primary-soft / primary-strong), `accent` (accent-soft / text) |
| `BottomNav` | Tetap di bawah, tinggi 72 + safe area, border atas, 3 tab: Beranda (`Home`), Meal Plan (`CalendarDays`), Profil (`User`) dari lucide. Aktif: primary-strong + Label; tidak aktif: text-muted + Caption |
| `Stepper` | Teks "Langkah X dari 3" Caption + 3 segmen bar tinggi 4 radius 2 |
| `InfoBox` | Ikon `Info` 20 + Body Small, padding 16, radius md, latar accent-soft (peringatan) atau primary-soft (tips) |
| `EmptyState` | Ilustrasi sederhana/ikon, judul H3, teks, tombol |
| `TopBar` | Tombol kembali bulat 40 (surface + border, ikon `ArrowLeft` 20) + judul opsional |
| `Toast` | Muncul di atas bottom nav, latar text, teks putih |

## Aset
- `public/brand/logo-horizontal.png` — ikon + wordmark, rasio ±2,37:1. Tampilkan lebar 190px di Welcome.
- `public/brand/logo-icon.png` — ikon saja, persegi. Pakai untuk favicon/app icon (`app/icon.png`), avatar kosong, header admin.
- Ilustrasi piring Welcome: buat SVG inline dari lingkaran bertumpuk (piring surface ber-border, nasi accent-soft,
  sayur primary 85%, lauk accent 80%, garnish primary-strong 70%).
- Metadata: title "Smart NutriPlan — Porsi Tepat, Hidup Sehat", `lang="id"`, theme-color #4F6B49, Open Graph memakai logo horizontal.

## Aksesibilitas
Kontras teks minimal 4.5:1 (jangan taruh teks kecil berwarna `accent` di atas putih). Target sentuh ≥ 44px.
Semua input punya label. Fokus terlihat. Gambar punya `alt`.
