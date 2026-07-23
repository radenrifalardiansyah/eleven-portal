-- ============================================================
-- Dynamic menu structure + editable role permissions
-- ============================================================

create table menu_groups (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  sort_order int not null default 0
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references menu_groups (id) on delete cascade,
  parent_id uuid references menu_items (id) on delete cascade,
  label text not null,
  href text not null,
  icon text not null default 'FileText',
  module_key text not null,
  sort_order int not null default 0,
  always_visible boolean not null default false,
  show_bottom_nav boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table role_permissions (
  role user_role not null,
  module_key text not null,
  can_view boolean not null default false,
  can_edit boolean not null default false,
  can_delete boolean not null default false,
  can_approve boolean not null default false,
  can_publish boolean not null default false,
  primary key (role, module_key)
);

create trigger set_updated_at before update on menu_items
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Permission helpers scoped to the two new "meta" modules
-- ------------------------------------------------------------
create function public.has_permission(p_module_key text, p_action text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select case p_action
        when 'view' then can_view
        when 'edit' then can_edit
        when 'delete' then can_delete
        when 'approve' then can_approve
        when 'publish' then can_publish
        else false
      end
      from role_permissions
      where role = public.current_role() and module_key = p_module_key
    ),
    false
  );
$$;

alter table menu_groups enable row level security;
alter table menu_items enable row level security;
alter table role_permissions enable row level security;

create policy "menu_groups_staff_read" on menu_groups for select to authenticated using (true);
create policy "menu_groups_manage_write" on menu_groups for all to authenticated
  using (public.has_permission('menu_structure', 'edit')) with check (public.has_permission('menu_structure', 'edit'));

create policy "menu_items_staff_read" on menu_items for select to authenticated using (true);
create policy "menu_items_manage_write" on menu_items for all to authenticated
  using (public.has_permission('menu_structure', 'edit')) with check (public.has_permission('menu_structure', 'edit'));

create policy "role_permissions_staff_read" on role_permissions for select to authenticated using (true);
create policy "role_permissions_manage_write" on role_permissions for all to authenticated
  using (public.has_permission('role_management', 'edit')) with check (public.has_permission('role_management', 'edit'));
