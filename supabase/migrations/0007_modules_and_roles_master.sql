-- ============================================================
-- Master data for menu module keys + roles.
--
-- `module_key` (menu_items, role_permissions) becomes a real FK
-- into `modules` instead of free text.
--
-- `role` stays the existing `user_role` enum (zero risk to the
-- RLS policies that already reference it) but becomes *extensible*:
-- new roles are added via `alter type ... add value` through the
-- add_role_enum_value() helper below, and the `roles` table carries
-- the display metadata + security-tier flags that is_super_admin() /
-- is_admin() / is_staff_writer() now read instead of hardcoding names.
-- "Deleting" a role is a soft-deactivate (is_active = false); Postgres
-- enums can't drop values without cascading through every policy that
-- depends on them, so the enum value is left in place, just unused.
-- ============================================================

create table modules (
  key text primary key,
  label text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table roles (
  key user_role primary key,
  label text not null,
  icon text not null default 'Users',
  sort_order int not null default 0,
  is_super_admin boolean not null default false,
  is_admin_tier boolean not null default false,
  is_staff_writer_tier boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on modules
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on roles
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Seed modules from every module_key already live in menu_items,
-- plus the 2 new master-data pages added below.
-- ------------------------------------------------------------
insert into modules (key, label, sort_order) values
  ('dashboard', 'Dashboard', 0),
  ('page_sections', 'Home', 1),
  ('products', 'Products', 2),
  ('services', 'Services', 3),
  ('stories', 'Stories', 4),
  ('team', 'Team', 5),
  ('projects', 'Case Study', 6),
  ('testimonials', 'Testimonials', 7),
  ('users', 'Pengguna', 8),
  ('role_management', 'Hak Akses Role', 9),
  ('menu_structure', 'Struktur Menu', 10),
  ('modules', 'Modul', 11),
  ('roles', 'Role', 12),
  ('site_settings', 'Site Settings', 13),
  ('account', 'Akun', 14);

alter table menu_items
  add constraint menu_items_module_key_fkey foreign key (module_key) references modules (key) on delete restrict;
alter table role_permissions
  add constraint role_permissions_module_key_fkey foreign key (module_key) references modules (key) on delete restrict;

-- ------------------------------------------------------------
-- Seed roles from the 5 values already used in profiles/role_permissions,
-- with tier flags matching the current hardcoded is_admin()/is_staff_writer() logic.
-- ------------------------------------------------------------
insert into roles (key, label, icon, sort_order, is_super_admin, is_admin_tier, is_staff_writer_tier) values
  ('super_admin', 'Super Admin', 'Crown', 0, true, true, true),
  ('admin', 'Admin', 'ShieldCheck', 1, false, true, true),
  ('editor', 'Editor', 'PenLine', 2, false, false, true),
  ('employee', 'Employee', 'User', 3, false, false, false),
  ('finance', 'Finance', 'Wallet', 4, false, false, false);

-- ------------------------------------------------------------
-- RLS tier functions now read flags off `roles` instead of hardcoding
-- role names. Same name + signature (returns boolean) as before, so
-- this is a plain replace — no cascade, no policy rewrites needed.
-- ------------------------------------------------------------
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_super_admin from public.roles where key = public.current_role()), false);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin_tier from public.roles where key = public.current_role()), false);
$$;

create or replace function public.is_staff_writer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_staff_writer_tier from public.roles where key = public.current_role()), false);
$$;

-- ------------------------------------------------------------
-- Adds a new value to the user_role enum. Must run as its own
-- statement/transaction, separate from any insert that uses the
-- new value (Postgres forbids using a freshly-added enum value
-- inside the same transaction that added it).
-- ------------------------------------------------------------
create function public.add_role_enum_value(p_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  execute format('alter type user_role add value if not exists %L', p_key);
end;
$$;

-- ------------------------------------------------------------
-- RLS: read for any authenticated staff member, write gated by
-- has_permission (same pattern as menu_items/menu_groups in 0004).
-- ------------------------------------------------------------
alter table modules enable row level security;
alter table roles enable row level security;

create policy "modules_staff_read" on modules for select to authenticated using (true);
create policy "modules_manage_write" on modules for all to authenticated
  using (public.has_permission('modules', 'edit')) with check (public.has_permission('modules', 'edit'));

create policy "roles_staff_read" on roles for select to authenticated using (true);
create policy "roles_manage_write" on roles for all to authenticated
  using (public.has_permission('roles', 'edit')) with check (public.has_permission('roles', 'edit'));

-- ------------------------------------------------------------
-- Menu entries + permissions for the 2 new admin pages (Sistem group,
-- super_admin only — same gating as users/menu_structure/role_management).
-- ------------------------------------------------------------
-- Sistem group already has Pengguna(0)/Hak Akses Role(1)/Struktur Menu(2)/Site Settings(3) from 0005; append after.
insert into menu_items (group_id, label, href, icon, module_key, sort_order, always_visible, show_bottom_nav)
select id, 'Modul', '/admin/modules', 'Boxes', 'modules', 4, false, false from menu_groups where label = 'Sistem'
union all
select id, 'Role', '/admin/role-master', 'IdCard', 'roles', 5, false, false from menu_groups where label = 'Sistem';

insert into role_permissions (role, module_key, can_view, can_edit, can_delete, can_approve, can_publish) values
  ('super_admin', 'modules', true, true, true, false, false),
  ('super_admin', 'roles', true, true, true, false, false);
