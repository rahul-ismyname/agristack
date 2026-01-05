-- Security Fix: Prevent RLS recursion by using a Security Definer function
-- This function runs with SUPERUSER privileges (bypassing RLS) to check if a user is an admin.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. DROP old potentially recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;

-- 2. CREATE new safe policies using the function
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can manage announcements" ON public.announcements
FOR ALL USING (is_admin());

-- 3. ENSURE PERMISSIONS (Fixes 'Access Denied' even if RLS is okay)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.announcements TO authenticated;

-- 4. Re-enable Security (if it was disabled, or just to be sure)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
