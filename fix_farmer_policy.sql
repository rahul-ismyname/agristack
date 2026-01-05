-- 1. Ensure RLS is enabled
alter table public.farmers enable row level security;

-- 2. Drop existing restrictive policies if any
drop policy if exists "Allow all access" on public.farmers;
drop policy if exists "Enable read access for all users" on public.farmers;
drop policy if exists "Enable insert for all users" on public.farmers;
drop policy if exists "Enable update for all users" on public.farmers;
drop policy if exists "Enable delete for all users" on public.farmers;

-- 3. Create a comprehensive permissive policy
create policy "Allow all access"
on public.farmers
for all
using (true)
with check (true);

-- 4. Verify grants (just in case)
grant all on public.farmers to anon;
grant all on public.farmers to authenticated;
grant all on public.farmers to service_role;
