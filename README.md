# Smart NutriPlan — paket awal untuk Claude Code

Paket ini berisi semua yang dibutuhkan Claude Code untuk membangun web app Smart NutriPlan dan memasangnya online.

| File | Fungsi |
| --- | --- |
| `PROMPT.md` | Prompt utama yang ditempel ke Claude Code |
| `CLAUDE.md` | Aturan proyek yang otomatis dibaca Claude Code |
| `docs/01-PRD.md` | Fitur, rute, aturan bisnis, spesifikasi tiap layar, event analitik |
| `docs/02-ALGORITMA.md` | Rumus kalori, generator meal plan, format takaran, kasus uji |
| `docs/03-DATABASE.md` | Penjelasan skema & cara menetapkan admin |
| `docs/04-DESIGN-SYSTEM.md` | Token warna, tipografi, komponen |
| `docs/05-DEPLOY.md` | Persiapan Supabase/Vercel dan langkah deploy |
| `supabase/migrations/` | SQL skema + RLS dan data awal (sudah diuji) |
| `data/seed/menus.json` | 20 menu lokal + 10 alergen (nilai gizi = estimasi) |
| `public/brand/` | Logo |

## Urutan pakai
1. Ikuti `docs/05-DEPLOY.md` bagian A (repo GitHub, Supabase + migrasi, Vercel, env Claude Code).
2. Buka sesi Claude Code pada repo ini, tempel prompt dari `PROMPT.md`.
3. Setelah selesai, ikuti `docs/05-DEPLOY.md` bagian D.

Nilai gizi menu adalah estimasi tim dan belum dicek ahli gizi; aplikasi menampilkan label itu di detail menu.
