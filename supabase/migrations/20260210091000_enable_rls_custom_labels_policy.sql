-- Re-enable RLS and allow authenticated users to insert custom labels
alter table public.custom_labels enable row level security;

drop policy if exists "custom_labels_insert_authenticated" on public.custom_labels;
create policy "custom_labels_insert_authenticated" on public.custom_labels
  for insert
  to authenticated
  with check (true);
