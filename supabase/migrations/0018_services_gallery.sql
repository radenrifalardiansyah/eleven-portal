-- ============================================================
-- Services: add a gallery (multiple photos), same shape as
-- products.gallery — the icon field stays as-is for the small
-- brand icon used in lists/cards.
-- ============================================================

alter table services add column gallery text[] not null default '{}';
