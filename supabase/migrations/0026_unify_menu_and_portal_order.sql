-- ============================================================
-- portal_sort_order used to let the public navbar/homepage-section
-- order diverge from the admin sidebar order (sort_order), by
-- design — but in practice staff expect "reorder it once in
-- Struktur Menu" to be the single source of truth everywhere.
-- Drop the separate column; the public navbar and homepage
-- sections now order by the same sort_order the admin sidebar
-- and Hak Akses Role already use.
-- ============================================================

alter table menu_items drop column portal_sort_order;
