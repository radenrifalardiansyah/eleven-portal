-- ============================================================
-- "Client" (testimonials) already shows in the admin sidebar and
-- Hak Akses Role like every other content module, but was left
-- out of the 0014 portal-navbar seed since it had no homepage
-- section at the time. It has one now (components/sections/
-- Testimonials.tsx, id="testimonials") — turn on show_on_portal
-- so the public navbar matches the admin menu.
-- ============================================================

update menu_items set show_on_portal = true, portal_href = '/#testimonials'
  where module_key = 'testimonials' and parent_id is null;
