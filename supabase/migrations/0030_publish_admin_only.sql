-- ============================================================
-- "Tampil di Portal" (can_publish) may only ever belong to Admin
-- or Super Admin — every other role must never be able to
-- publish content live. Normalize any stray true values and add
-- a check constraint so this holds even if a future insert
-- bypasses the app layer.
-- ============================================================

update role_permissions set can_publish = false
  where role not in ('admin', 'super_admin') and can_publish = true;

alter table role_permissions
  add constraint role_permissions_publish_admin_only
  check (role in ('admin', 'super_admin') or can_publish = false);
