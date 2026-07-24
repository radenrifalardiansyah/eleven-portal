-- ============================================================
-- Auto-provisioning a module_key from the menu-item create form
-- (see app/admin/(dashboard)/menu-struktur/actions.ts) needs to
-- insert into `modules`, but that table's RLS only allows writes
-- to whoever has has_permission('modules', 'edit') — a separate
-- permission from has_permission('menu_structure', 'edit'), which
-- is what actually gates creating a menu item.
--
-- Right now only super_admin holds both, so this isn't a live bug
-- (super_admin bypasses has_permission entirely, see 0009). But if
-- 'menu_structure' edit is ever granted to another role without
-- also granting 'modules' edit, module provisioning would silently
-- fail with an RLS error on menu creation. This security-definer
-- RPC decouples the two: it runs the insert with elevated rights,
-- but only after independently checking 'menu_structure' edit —
-- same pattern as add_role_enum_value() in 0007.
-- ============================================================

create function public.upsert_module(p_key text, p_label text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_permission('menu_structure', 'edit') then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  insert into modules (key, label)
  values (p_key, p_label)
  on conflict (key) do nothing;
end;
$$;
