-- ============================================================
-- Make `roles` pure master data (key/label/icon only, aside from
-- the permanent is_super_admin flag) by unifying content-table RLS
-- with the same role_permissions data that already drives the
-- Hak Akses Role page and the app-level `can()` checks — instead of
-- a separate is_admin_tier/is_staff_writer_tier toggle per role.
-- ============================================================

-- ------------------------------------------------------------
-- Content tables: replace the blanket is_staff_writer()/current_role()
-- checks with has_permission(module_key, action) — the exact module_key
-- each table's admin UI already uses for requireModule()/can() checks.
-- ------------------------------------------------------------
drop policy "products_staff_read_all" on products;
drop policy "products_staff_write" on products;
drop policy "products_staff_update" on products;
drop policy "products_staff_delete" on products;
create policy "products_staff_read_all" on products for select to authenticated using (public.has_permission('products', 'view'));
create policy "products_staff_write" on products for insert to authenticated with check (public.has_permission('products', 'edit'));
create policy "products_staff_update" on products for update to authenticated
  using (public.has_permission('products', 'edit') or public.has_permission('products', 'approve'))
  with check (public.has_permission('products', 'edit') or public.has_permission('products', 'approve'));
create policy "products_staff_delete" on products for delete to authenticated using (public.has_permission('products', 'delete'));

drop policy "services_staff_read_all" on services;
drop policy "services_staff_write" on services;
drop policy "services_staff_update" on services;
drop policy "services_staff_delete" on services;
create policy "services_staff_read_all" on services for select to authenticated using (public.has_permission('services', 'view'));
create policy "services_staff_write" on services for insert to authenticated with check (public.has_permission('services', 'edit'));
create policy "services_staff_update" on services for update to authenticated
  using (public.has_permission('services', 'edit') or public.has_permission('services', 'approve'))
  with check (public.has_permission('services', 'edit') or public.has_permission('services', 'approve'));
create policy "services_staff_delete" on services for delete to authenticated using (public.has_permission('services', 'delete'));

drop policy "stories_staff_read_all" on stories;
drop policy "stories_staff_write" on stories;
drop policy "stories_staff_update" on stories;
drop policy "stories_staff_delete" on stories;
create policy "stories_staff_read_all" on stories for select to authenticated using (public.has_permission('stories', 'view'));
create policy "stories_staff_write" on stories for insert to authenticated with check (public.has_permission('stories', 'edit'));
create policy "stories_staff_update" on stories for update to authenticated
  using (public.has_permission('stories', 'edit') or public.has_permission('stories', 'approve'))
  with check (public.has_permission('stories', 'edit') or public.has_permission('stories', 'approve'));
create policy "stories_staff_delete" on stories for delete to authenticated using (public.has_permission('stories', 'delete'));

drop policy "team_members_staff_read_all" on team_members;
drop policy "team_members_staff_write" on team_members;
drop policy "team_members_staff_update" on team_members;
drop policy "team_members_staff_delete" on team_members;
create policy "team_members_staff_read_all" on team_members for select to authenticated using (public.has_permission('team', 'view'));
create policy "team_members_staff_write" on team_members for insert to authenticated with check (public.has_permission('team', 'edit'));
create policy "team_members_staff_update" on team_members for update to authenticated
  using (public.has_permission('team', 'edit') or public.has_permission('team', 'approve'))
  with check (public.has_permission('team', 'edit') or public.has_permission('team', 'approve'));
create policy "team_members_staff_delete" on team_members for delete to authenticated using (public.has_permission('team', 'delete'));

drop policy "projects_staff_read_all" on projects;
drop policy "projects_staff_write" on projects;
drop policy "projects_staff_update" on projects;
drop policy "projects_staff_delete" on projects;
create policy "projects_staff_read_all" on projects for select to authenticated using (public.has_permission('projects', 'view'));
create policy "projects_staff_write" on projects for insert to authenticated with check (public.has_permission('projects', 'edit'));
create policy "projects_staff_update" on projects for update to authenticated
  using (public.has_permission('projects', 'edit') or public.has_permission('projects', 'approve'))
  with check (public.has_permission('projects', 'edit') or public.has_permission('projects', 'approve'));
create policy "projects_staff_delete" on projects for delete to authenticated using (public.has_permission('projects', 'delete'));

drop policy "testimonial_clients_staff_read_all" on testimonial_clients;
drop policy "testimonial_clients_staff_write" on testimonial_clients;
drop policy "testimonial_clients_staff_update" on testimonial_clients;
drop policy "testimonial_clients_staff_delete" on testimonial_clients;
create policy "testimonial_clients_staff_read_all" on testimonial_clients for select to authenticated using (public.has_permission('testimonials', 'view'));
create policy "testimonial_clients_staff_write" on testimonial_clients for insert to authenticated with check (public.has_permission('testimonials', 'edit'));
create policy "testimonial_clients_staff_update" on testimonial_clients for update to authenticated
  using (public.has_permission('testimonials', 'edit') or public.has_permission('testimonials', 'approve'))
  with check (public.has_permission('testimonials', 'edit') or public.has_permission('testimonials', 'approve'));
create policy "testimonial_clients_staff_delete" on testimonial_clients for delete to authenticated using (public.has_permission('testimonials', 'delete'));

-- page_sections / site_settings previously used is_admin(); now has_permission directly.
drop policy "page_sections_admin_write" on page_sections;
create policy "page_sections_admin_write" on page_sections for all to authenticated
  using (public.has_permission('page_sections', 'edit')) with check (public.has_permission('page_sections', 'edit'));

drop policy "site_settings_admin_write" on site_settings;
create policy "site_settings_admin_write" on site_settings for all to authenticated
  using (public.has_permission('site_settings', 'edit')) with check (public.has_permission('site_settings', 'edit'));

-- is_admin() has no remaining callers now that page_sections/site_settings use has_permission directly.
drop function public.is_admin();

-- is_staff_writer() is still used by the shared media storage bucket policies (0003),
-- which aren't scoped to one module_key — redefine it as "can edit at least one content
-- module" instead of reading the (now removed) roles.is_staff_writer_tier flag.
create or replace function public.is_staff_writer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_permission('products', 'edit') or
    public.has_permission('services', 'edit') or
    public.has_permission('stories', 'edit') or
    public.has_permission('team', 'edit') or
    public.has_permission('projects', 'edit') or
    public.has_permission('testimonials', 'edit');
$$;

-- ------------------------------------------------------------
-- roles is now pure master data: key/label/icon + the permanent
-- is_super_admin flag. Tier flags are gone — permissions live in
-- role_permissions only.
-- ------------------------------------------------------------
alter table roles drop column is_admin_tier;
alter table roles drop column is_staff_writer_tier;
