-- Add indexes to improve search optimization and list fetching
CREATE INDEX IF NOT EXISTS farmers_created_at_idx ON public.farmers (created_at DESC);
CREATE INDEX IF NOT EXISTS farmers_full_name_idx ON public.farmers USING btree (full_name text_pattern_ops);
CREATE INDEX IF NOT EXISTS farmers_mobile_idx ON public.farmers (mobile);

-- Add indexes for announcements to speed up the dashboard fetch
CREATE INDEX IF NOT EXISTS announcements_created_at_active_idx ON public.announcements (is_active, created_at DESC);

-- Add index for seed inspections for faster dashboard counts and lists
CREATE INDEX IF NOT EXISTS seed_inspections_created_at_idx ON public.seed_inspections (created_at DESC);
CREATE INDEX IF NOT EXISTS seed_inspections_is_passed_idx ON public.seed_inspections (is_passed);
