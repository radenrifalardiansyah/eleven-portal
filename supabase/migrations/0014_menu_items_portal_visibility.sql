-- ============================================================
-- The public navbar used to be a manually-curated list
-- (site_settings.nav_links). It's replaced with menu_items rows
-- flagged show_on_portal — the same Struktur Menu admins already
-- manage for the admin sidebar, so the public nav's set of pages
-- stays a reflection of which content modules exist, without a
-- second parallel config to keep in sync.
--
-- portal_href/portal_match_path are separate from href/nothing
-- because href already means "where this points to in the admin
-- sidebar" (e.g. /admin/products) — the public destination for the
-- same row is a different URL (e.g. /#products). portal_sort_order
-- is separate from sort_order for the same reason: reordering the
-- admin sidebar must not silently reorder the public navbar.
-- ============================================================

alter table menu_items
  add column show_on_portal boolean not null default false,
  add column portal_href text,
  add column portal_match_path text,
  add column portal_sort_order int not null default 0,
  -- Overrides `label` for the public navbar only, e.g. admin sidebar says
  -- "Products" (a CRUD list) but the public nav reads "Product" (singular).
  -- Null means "just use label as-is".
  add column portal_label text;

create policy "menu_items_portal_read" on menu_items for select to anon
  using (show_on_portal = true);

update menu_items set show_on_portal = true, portal_href = '/#home', portal_sort_order = 0
  where module_key = 'page_sections' and parent_id is null;
update menu_items set show_on_portal = true, portal_href = '/#services', portal_match_path = '/services', portal_sort_order = 1
  where module_key = 'services' and parent_id is null;
update menu_items set show_on_portal = true, portal_href = '/#case-study', portal_match_path = '/case-study', portal_sort_order = 2
  where module_key = 'projects' and parent_id is null;
update menu_items set show_on_portal = true, portal_href = '/#products', portal_match_path = '/products', portal_sort_order = 3, portal_label = 'Product'
  where module_key = 'products' and parent_id is null;
update menu_items set show_on_portal = true, portal_href = '/#team', portal_match_path = '/team', portal_sort_order = 4
  where module_key = 'team' and parent_id is null;
update menu_items set show_on_portal = true, portal_href = '/#stories', portal_match_path = '/stories', portal_sort_order = 5, portal_label = 'Our Stories'
  where module_key = 'stories' and parent_id is null;
