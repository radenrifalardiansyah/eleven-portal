-- ============================================================
-- show_on_portal only controls the public navbar link. There was
-- no separate switch for the matching homepage showcase section
-- (e.g. the "Produk yang Kami Jual" block on /) — it always
-- rendered unconditionally. show_section_on_portal adds that,
-- independent of the navbar toggle: a module can be linked in the
-- navbar without a homepage section (or vice versa).
-- Defaults to true so existing homepage sections keep rendering
-- until a staff member explicitly turns one off.
-- ============================================================

alter table menu_items
  add column show_section_on_portal boolean not null default true;

drop policy "menu_items_portal_read" on menu_items;
create policy "menu_items_portal_read" on menu_items for select to anon
  using (show_on_portal = true or show_section_on_portal = true);
