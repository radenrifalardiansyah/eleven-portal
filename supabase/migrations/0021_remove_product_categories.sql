-- ============================================================
-- Remove the product_categories feature (added in 0016/0017):
-- products relate directly to a service now, not a free-standing
-- category. Backfill service_id from the existing category ->
-- service name match, then drop category_id/product_categories
-- and their menu/module/permission rows.
-- ============================================================

alter table products add column service_id uuid references services (id);

update products set service_id = s.id
from product_categories pc
join services s on lower(s.title) = lower(pc.name)
where products.category_id = pc.id;

alter table products alter column service_id set not null;
alter table products drop column category_id;

drop table product_categories;

delete from menu_items where module_key = 'product_categories';
delete from role_permissions where module_key = 'product_categories';
delete from modules where key = 'product_categories';
