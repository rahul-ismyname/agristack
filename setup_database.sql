-- MASTER SETUP SCRIPT
-- Run this script to set up the entire database schema, security, and storage.
-- It is designed to be safe to run multiple times (idempotent).

-- ==========================================
-- 1. TABLES & COLUMNS
-- ==========================================

-- 1.1 Farmers Table
create table if not exists public.farmers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  gender text,
  dob date,
  mobile text,
  aadhaar text,
  district text,
  block text,
  panchayat text,
  village text,
  ifsc text,
  account_no text,
  khata text,
  khesra text,
  area text,
  registration_id text
);

-- Ensure column exists
alter table public.farmers add column if not exists registration_id text;

-- 1.2 Seed Inspections Table
create table if not exists public.seed_inspections (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  lot_no text,
  crop text,
  variety text,
  sowing_status text,
  inspector_name text,
  officer_mobile text,
  inspection_date date,
  farmer_name text,
  district text,
  village text,
  specific_location text,
  is_passed boolean,
  remarks text,
  photo_url text
);

-- Ensure columns exist (in case table was created with older schema)
alter table public.seed_inspections add column if not exists block text;
alter table public.seed_inspections add column if not exists officer_mobile text;
alter table public.seed_inspections add column if not exists photo_url text;

-- 1.3 Gyan Vahan Table
create table if not exists public.gyan_vahan (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  inspector_name text,
  inspector_role text,
  inspector_mobile text,
  district text,
  block text,
  village text,
  landmark text,
  farmers_count integer,
  remarks text,
  photo_url text
);

-- Ensure columns exist
alter table public.gyan_vahan add column if not exists photo_url text;


-- ==========================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ==========================================

alter table public.farmers enable row level security;
alter table public.seed_inspections enable row level security;
alter table public.gyan_vahan enable row level security;

-- Policies (Drop first to allow updates)
drop policy if exists "Allow all access" on public.farmers;
create policy "Allow all access" on public.farmers for all using (true);

drop policy if exists "Allow all access" on public.seed_inspections;
create policy "Allow all access" on public.seed_inspections for all using (true);

drop policy if exists "Allow all access" on public.gyan_vahan;
create policy "Allow all access" on public.gyan_vahan for all using (true);


-- ==========================================
-- 3. STORAGE
-- ==========================================

-- Create Bucket 'images'
insert into storage.buckets (id, name, public) 
values ('images', 'images', true)
on conflict (id) do nothing;

-- Storage Policies
-- Note: storage.objects usually has RLS enabled by default.
drop policy if exists "Allow all access to images" on storage.objects;
create policy "Allow all access to images"
on storage.objects for all
using ( bucket_id = 'images' )
with check ( bucket_id = 'images' );
