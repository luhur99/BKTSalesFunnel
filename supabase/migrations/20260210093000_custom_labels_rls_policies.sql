-- Add authenticated RLS policies for custom_labels
drop policy if exists "custom_labels_select_authenticated" on public.custom_labels;
create policy "custom_labels_select_authenticated" on public.custom_labels
  for select
  to authenticated
  using (true);

drop policy if exists "custom_labels_update_authenticated" on public.custom_labels;
create policy "custom_labels_update_authenticated" on public.custom_labels
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "custom_labels_delete_authenticated" on public.custom_labels;
create policy "custom_labels_delete_authenticated" on public.custom_labels
  for delete
  to authenticated
  using (true);