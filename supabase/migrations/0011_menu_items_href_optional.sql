-- ============================================================
-- Top-level menu items can now be pure categories (a dropdown that
-- only expands its children, like the account menu in the navbar)
-- instead of always linking somewhere. Child items (parent_id set)
-- still require a real href — enforced in the app layer since a
-- plain CHECK can't see sibling rows.
-- ============================================================

alter table menu_items alter column href drop not null;
