-- ============================================================
-- Case study (projects) relates to a product now, not a free-text
-- category. Existing category text (e.g. "Web Development - Visual
-- Interaktif") doesn't map cleanly to any single product, so
-- product_id starts nullable — staff assign the right product per
-- case study from the admin UI.
-- ============================================================

alter table projects add column product_id uuid references products (id);
alter table projects drop column category;
