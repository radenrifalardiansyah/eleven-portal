-- ============================================================
-- Extended profile fields (phone, position, bio) for the richer
-- Pengaturan Profil page, plus a stored theme_preference for the
-- Sistem tab. theme_preference is only ever read/written on this
-- settings page for now — the admin UI itself has no dark-mode
-- styling yet, so it doesn't change how anything renders.
--
-- Also adds a dedicated "avatars" storage bucket: the existing
-- "media" bucket is gated to is_staff_writer() (super_admin/admin/
-- editor), which would lock employee/finance out of changing their
-- own profile photo. Avatars are scoped per-user by folder instead
-- (<uid>/filename), so anyone can manage only their own.
-- ============================================================

alter table profiles add column phone text;
alter table profiles add column position text;
alter table profiles add column bio text;
alter table profiles add column theme_preference text not null default 'system';
alter table profiles add constraint profiles_theme_preference_check
  check (theme_preference in ('light', 'dark', 'system'));

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'avatars');

create policy "avatars_own_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_own_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_own_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
