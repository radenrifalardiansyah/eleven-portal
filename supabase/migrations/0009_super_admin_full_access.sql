-- ============================================================
-- Super Admin: always full access, including for modules added
-- after this migration.
--
-- Previously has_permission() only consulted role_permissions,
-- so a brand-new module/menu silently locked super_admin out
-- until someone remembered to insert a matching role_permissions
-- row (see the manual inserts at the bottom of 0007). Short-
-- circuiting on is_super_admin() here means new modules never
-- need that manual step again.
-- ============================================================

create or replace function public.has_permission(p_module_key text, p_action text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_super_admin()
    or coalesce(
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
