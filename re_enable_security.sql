-- RESTORE SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Double check that the policies are actually active
-- This query confirms RLS is ON for profiles
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';
