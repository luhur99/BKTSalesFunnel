-- Disable RLS for custom_labels so inserts work without auth
alter table public.custom_labels disable row level security;
