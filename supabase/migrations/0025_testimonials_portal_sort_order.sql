-- ============================================================
-- testimonials (Client) never got a portal_sort_order in 0014
-- since it had no navbar entry, so it defaulted to 0 — now that
-- homepage sections are ordered by this same field (see
-- getVisibleHomeSections), that default would jump it to the
-- very front. Set values that preserve the current homepage
-- layout: Home, Services, Case Study, Client, Products, Team, Stories.
-- ============================================================

update menu_items set portal_sort_order = 3 where module_key = 'testimonials' and parent_id is null;
update menu_items set portal_sort_order = 4 where module_key = 'products' and parent_id is null;
update menu_items set portal_sort_order = 5 where module_key = 'team' and parent_id is null;
update menu_items set portal_sort_order = 6 where module_key = 'stories' and parent_id is null;
