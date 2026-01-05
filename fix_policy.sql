-- Enable RLS on seed_inspections if not already enabled
ALTER TABLE public.seed_inspections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow all access for seed_inspections" ON public.seed_inspections;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.seed_inspections;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.seed_inspections;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.seed_inspections;

-- Create a comprehensive policy that allows SELECT, INSERT, UPDATE, DELETE for everyone (for development)
CREATE POLICY "Allow all operations for seed_inspections"
ON public.seed_inspections
FOR ALL
USING (true)
WITH CHECK (true);

-- Ensure the is_passed column exists and is boolean
ALTER TABLE public.seed_inspections 
ADD COLUMN IF NOT EXISTS is_passed boolean DEFAULT NULL;
