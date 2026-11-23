-- Smart NutriPlan — skema awal + Row Level Security
-- Jalankan di Supabase (SQL Editor atau `supabase db push`). Idempoten untuk proyek kosong.

create extension if not exists pgcrypto;

-- ===== Tipe =====
create type public.gender as enum ('pria', 'wanita');
create type public.activity_level as enum ('jarang', 'ringan', 'sedang', 'berat', 'sangat_berat');
create type public.diet_goal as enum ('turun', 'jaga', 'naik');
create type public.meal_slot as enum ('sarapan', 'makan_siang', 'makan_malam', 'camilan');
create type public.allergen_kind as enum ('alergi', 'pantangan');
create type public.menu_status as enum ('draft', 'aktif');

-- ===== Tabel =====
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nama text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  usia smallint check (usia between 18 and 65),
  jenis_kelamin public.gender,
  berat_badan numeric(5, 1) check (berat_badan between 30 and 250),
  tinggi_badan numeric(5, 1) check (tinggi_badan between 120 and 230),
  aktivitas_fisik public.activity_level,
  tujuan public.diet_goal,
  anggaran_harian integer check (anggaran_harian is null or anggaran_harian >= 0),
  onboarding_selesai boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.allergens (
  id smallint generated always as identity primary key,
  kode text not null unique,
  nama text not null,
  jenis public.allergen_kind not null,
  urutan smallint not null default 0
);

create table public.profile_allergens (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  allergen_id smallint not null references public.allergens (id) on delete cascade,
  primary key (profile_id, allergen_id)
);

create table public.menus (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nama text not null,
  kategori public.meal_slot not null,
  kalori integer not null check (kalori > 0),
  protein numeric(5, 1) not null check (protein >= 0),
  karbohidrat numeric(5, 1) not null check (karbohidrat >= 0),
  lemak numeric(5, 1) not null check (lemak >= 0),
  -- [{ "nama": "Nasi putih", "qty": 1, "satuan": "centong" }]
  porsi jsonb not null default '[]'::jsonb check (jsonb_typeof(porsi) = 'array'),
  bahan text[] not null default '{}',
  langkah text[] not null default '{}',
  cocok_untuk public.diet_goal[] not null default '{turun,jaga,naik}',
  estimasi_harga integer check (estimasi_harga is null or estimasi_harga >= 0),
  waktu_masak_menit smallint,
  foto_url text,
  sumber_gizi text not null default 'Estimasi tim (TKPI)',
  dicek_ahli_gizi boolean not null default false,
  status public.menu_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index menus_kategori_status_idx on public.menus (kategori, status);

create table public.menu_allergens (
  menu_id uuid not null references public.menus (id) on delete cascade,
  allergen_id smallint not null references public.allergens (id) on delete cascade,
  primary key (menu_id, allergen_id)
);

create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  tanggal date not null,
  target_kalori integer not null,
  regenerate_count smallint not null default 0 check (regenerate_count between 0 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tanggal)
);

create table public.meal_plan_items (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references public.meal_plans (id) on delete cascade,
  slot public.meal_slot not null,
  menu_id uuid references public.menus (id) on delete set null, -- null = slot kosong
  multiplier numeric(3, 2) not null default 1,
  kalori integer not null default 0,
  protein integer not null default 0,
  karbohidrat integer not null default 0,
  lemak integer not null default 0,
  target_kalori_slot integer not null,
  label_selisih boolean not null default false,
  unique (meal_plan_id, slot)
);

create table public.events (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete set null,
  nama text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index events_created_at_idx on public.events (created_at);
create index events_user_idx on public.events (user_id, created_at);

-- ===== Fungsi bantu =====
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger menus_touch before update on public.menus
  for each row execute function public.touch_updated_at();
create trigger meal_plans_touch before update on public.meal_plans
  for each row execute function public.touch_updated_at();

-- Pengguna biasa tidak boleh mengubah role miliknya sendiri
create or replace function public.protect_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() null = dijalankan dari SQL Editor / service role (boleh, untuk menetapkan admin)
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Tidak boleh mengubah role';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_role();

-- Buat baris profiles otomatis saat user mendaftar
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nama)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nama', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== Row Level Security =====
alter table public.profiles enable row level security;
alter table public.allergens enable row level security;
alter table public.profile_allergens enable row level security;
alter table public.menus enable row level security;
alter table public.menu_allergens enable row level security;
alter table public.meal_plans enable row level security;
alter table public.meal_plan_items enable row level security;
alter table public.events enable row level security;

-- profiles
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- allergens: baca publik, tulis admin
create policy allergens_select on public.allergens for select to anon, authenticated using (true);
create policy allergens_admin on public.allergens for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- profile_allergens: milik sendiri
create policy profile_allergens_own on public.profile_allergens for all to authenticated
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid());

-- menus: pengguna lihat yang aktif, admin semua
create policy menus_select on public.menus for select to authenticated
  using (status = 'aktif' or public.is_admin());
create policy menus_admin on public.menus for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy menu_allergens_select on public.menu_allergens for select to authenticated using (true);
create policy menu_allergens_admin on public.menu_allergens for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- meal_plans & items: milik sendiri
create policy meal_plans_own on public.meal_plans for all to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

create policy meal_plan_items_own on public.meal_plan_items for all to authenticated
  using (exists (
    select 1 from public.meal_plans mp
    where mp.id = meal_plan_id and (mp.user_id = auth.uid() or public.is_admin())
  ))
  with check (exists (
    select 1 from public.meal_plans mp
    where mp.id = meal_plan_id and mp.user_id = auth.uid()
  ));

-- events: tulis milik sendiri, baca admin
create policy events_insert on public.events for insert to authenticated
  with check (user_id = auth.uid());
create policy events_select_admin on public.events for select to authenticated
  using (public.is_admin());
