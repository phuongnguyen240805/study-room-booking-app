-- ========================================================
-- VKU Real-time Study Room Booking App - Database Schema
-- ========================================================

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  student_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger for new user signup/login
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    email = coalesce(excluded.email, public.profiles.email),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_new_user();

-- 2. Rooms Table
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  building text not null check (building in ('A', 'B', 'C', 'V')),
  floor integer not null,
  capacity integer not null check (capacity > 0),
  equipment text[] not null default '{}',
  image_url text,
  created_at timestamptz not null default now()
);

-- Index for searching and filtering rooms
create index if not exists idx_rooms_building on public.rooms(building);
create index if not exists idx_rooms_capacity on public.rooms(capacity);

-- 3. Bookings Table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  booking_date date not null,
  slot_id text not null check (slot_id in ('S1', 'S2', 'S3', 'S4')),
  status text not null default 'active' check (status in ('active', 'cancelled')),
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);

-- Indexes for performance
create index if not exists idx_bookings_user_id on public.bookings(user_id);
create index if not exists idx_bookings_lookup on public.bookings(room_id, booking_date, status);

-- CRITICAL: Database-Level Conflict Prevention (Partial Unique Index)
create unique index if not exists unique_active_booking_slot
on public.bookings (
  room_id,
  booking_date,
  slot_id
)
where status = 'active';

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;

-- 5. RLS Policies
-- Profiles: Any authenticated user can read profiles; users can update/insert their own profile
drop policy if exists "Allow authenticated read profiles" on public.profiles;
create policy "Allow authenticated read profiles"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Allow user update own profile" on public.profiles;
create policy "Allow user update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Allow user insert own profile" on public.profiles;
create policy "Allow user insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Rooms: Read-only for mobile clients
drop policy if exists "Allow authenticated read rooms" on public.rooms;
create policy "Allow authenticated read rooms"
  on public.rooms for select
  to authenticated
  using (true);

-- Bookings: Authenticated can read (to know occupied slots), can insert own booking, can cancel own booking
drop policy if exists "Allow authenticated read bookings" on public.bookings;
create policy "Allow authenticated read bookings"
  on public.bookings for select
  to authenticated
  using (true);

drop policy if exists "Allow user insert own booking" on public.bookings;
create policy "Allow user insert own booking"
  on public.bookings for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Allow user cancel own booking" on public.bookings;
create policy "Allow user cancel own booking"
  on public.bookings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6. Supabase Realtime Setup
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bookings'
  ) then
    alter publication supabase_realtime add table public.bookings;
  end if;
end;
$$;
