-- ====================================================================
-- AGRISTACK ADMIN - COMPLETE MASTER SETUP SCRIPT
-- ====================================================================
-- Description: Sets up all tables, storage, and security policies.
-- Usage: Run this in the Supabase SQL Editor. It is idempotent (safe to run multiple times).

-- ==========================================
-- 1. DATABASE TABLES
-- ==========================================

-- 1.1 Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  mobile TEXT,
  dob DATE,
  district TEXT,
  block TEXT,
  village TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1.2 Farmers Table
CREATE TABLE IF NOT EXISTS public.farmers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  full_name TEXT,
  gender TEXT,
  dob DATE,
  mobile TEXT,
  aadhaar TEXT,
  district TEXT,
  block TEXT,
  panchayat TEXT,
  village TEXT,
  ifsc TEXT,
  account_no TEXT,
  khata TEXT,
  khesra TEXT,
  area TEXT,
  registration_id TEXT
);

-- 1.3 Seed Inspections Table
CREATE TABLE IF NOT EXISTS public.seed_inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  lot_no TEXT,
  crop TEXT,
  variety TEXT,
  sowing_status TEXT,
  inspector_name TEXT,
  officer_mobile TEXT,
  inspection_date DATE,
  farmer_name TEXT,
  district TEXT,
  block TEXT,
  village TEXT,
  specific_location TEXT,
  is_passed BOOLEAN DEFAULT NULL,
  remarks TEXT,
  photo_url TEXT
);

-- 1.4 Gyan Vahan Table (Mobile Awareness Vehicles)
CREATE TABLE IF NOT EXISTS public.gyan_vahan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  inspector_name TEXT,
  inspector_role TEXT,
  inspector_mobile TEXT,
  district TEXT,
  block TEXT,
  village TEXT,
  landmark TEXT,
  farmers_count INTEGER,
  remarks TEXT,
  photo_url TEXT
);

-- ==========================================
-- 2. TABLE SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seed_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyan_vahan ENABLE ROW LEVEL SECURITY;

-- 2.1 Profile Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
CREATE POLICY "System can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- 2.2 Farmers Policies (Public for Development)
DROP POLICY IF EXISTS "Allow all access" ON public.farmers;
CREATE POLICY "Allow all access" ON public.farmers FOR ALL USING (true) WITH CHECK (true);

-- 2.3 Seed Inspections Policies (Public for Development)
DROP POLICY IF EXISTS "Allow all operations for seed_inspections" ON public.seed_inspections;
CREATE POLICY "Allow all operations for seed_inspections" ON public.seed_inspections FOR ALL USING (true) WITH CHECK (true);

-- 2.4 Gyan Vahan Policies (Public for Development)
DROP POLICY IF EXISTS "Allow all access" ON public.gyan_vahan;
CREATE POLICY "Allow all access" ON public.gyan_vahan FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 3. STORAGE CONFIGURATION
-- ==========================================

-- 3.1 Create Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- 3.2 Storage Policies

-- Images Bucket (Inspections & Gyan Vahan)
DROP POLICY IF EXISTS "Allow all access to images" ON storage.objects;
CREATE POLICY "Allow all access to images" ON storage.objects FOR ALL 
USING ( bucket_id = 'images' ) WITH CHECK ( bucket_id = 'images' );

-- Avatars Bucket (Profiles)
DROP POLICY IF EXISTS "Public View Avatars" ON storage.objects;
CREATE POLICY "Public View Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users upload own avatars" ON storage.objects;
CREATE POLICY "Users upload own avatars" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users update own avatars" ON storage.objects;
CREATE POLICY "Users update own avatars" ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users delete own avatars" ON storage.objects;
CREATE POLICY "Users delete own avatars" ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ==========================================
-- 4. GRANTS (Fix Permission Issues)
-- ==========================================
GRANT ALL ON public.farmers TO anon, authenticated, service_role;
GRANT ALL ON public.seed_inspections TO anon, authenticated, service_role;
GRANT ALL ON public.gyan_vahan TO anon, authenticated, service_role;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
