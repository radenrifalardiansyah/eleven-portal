-- ============================================================
-- Storage bucket for CMS-uploaded media (product galleries, etc.)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

create policy "media_staff_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_staff_writer());

create policy "media_staff_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_staff_writer())
  with check (bucket_id = 'media' and public.is_staff_writer());

create policy "media_staff_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_staff_writer());
