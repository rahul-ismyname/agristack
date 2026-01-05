-- DEBUGGING SCRIPT: DISABLE SECURITY verify if RLS is the problem
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Verify the row exists (for your own sanity, check the output in Supabase)
SELECT * FROM public.profiles WHERE email = 'rahulkr096522@gmail.com' OR id = '3be8d005-6cf7-480f-99dc-e22af305aa11';
