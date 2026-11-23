-- Smart NutriPlan — 0003: persetujuan ketentuan, kode rujukan, dan masukan/NPS
-- Jalankan SETELAH 0001 dan 0002 (SQL Editor Supabase → tempel → Run). Aman dijalankan ulang.

-- ===== Profil: persetujuan ketentuan & rujukan =====
alter table public.profiles
  add column if not exists setuju_ketentuan_at timestamptz,
  add column if not exists dirujuk_oleh uuid references public.profiles (id) on delete set null,
  add column if not exists kode_rujukan text;

-- Kode rujukan 8 karakter (huruf besar + angka) untuk setiap profil.
create or replace function public.buat_kode_rujukan()
returns text
language sql
volatile
as $$
  select upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

update public.profiles set kode_rujukan = public.buat_kode_rujukan() where kode_rujukan is null;
alter table public.profiles alter column kode_rujukan set default public.buat_kode_rujukan();
alter table public.profiles alter column kode_rujukan set not null;
create unique index if not exists profiles_kode_rujukan_key on public.profiles (kode_rujukan);
create index if not exists profiles_dirujuk_oleh_idx on public.profiles (dirujuk_oleh);

-- Pengguna biasa tidak boleh mengubah kode rujukan, perujuk, atau waktu persetujuan miliknya.
create or replace function public.protect_profile_system_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.kode_rujukan is distinct from old.kode_rujukan
       or new.dirujuk_oleh is distinct from old.dirujuk_oleh
       or new.setuju_ketentuan_at is distinct from old.setuju_ketentuan_at then
      raise exception 'Tidak boleh mengubah kolom sistem profil';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_system_fields on public.profiles;
create trigger profiles_protect_system_fields before update on public.profiles
  for each row execute function public.protect_profile_system_fields();

-- Trigger pendaftaran: simpan nama, perujuk (dari kode `ref`), dan waktu persetujuan ketentuan.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  perujuk uuid;
begin
  select p.id into perujuk
  from public.profiles p
  where p.kode_rujukan = upper(nullif(trim(new.raw_user_meta_data ->> 'ref'), ''))
  limit 1;

  insert into public.profiles (id, nama, dirujuk_oleh, setuju_ketentuan_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nama', ''),
    perujuk,
    case when (new.raw_user_meta_data ->> 'setuju_ketentuan') = 'true' then now() end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ===== Masukan / NPS =====
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  nps smallint not null check (nps between 0 and 10),
  membingungkan text check (char_length(membingungkan) <= 1000),
  disukai text check (char_length(disukai) <= 1000),
  berhenti text check (char_length(berhenti) <= 1000),
  alasan_rekomendasi text check (char_length(alasan_rekomendasi) <= 1000),
  bersedia_bayar text check (bersedia_bayar in ('0', '<10k', '10-20k', '20-50k', '>50k')),
  created_at timestamptz not null default now()
);
create index if not exists feedback_created_at_idx on public.feedback (created_at);

alter table public.feedback enable row level security;

drop policy if exists feedback_insert_own on public.feedback;
create policy feedback_insert_own on public.feedback for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists feedback_select on public.feedback;
create policy feedback_select on public.feedback for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
