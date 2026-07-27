-- ============================================================
-- Client profile: expand testimonial_clients with company info,
-- PIC contact, testimonial quote/rating, and an optional relation
-- to a case study project. Also renames the "Testimonials"
-- menu/module label to "Client" — module_key stays "testimonials"
-- so permissions, RLS policies, and code references are unaffected.
-- ============================================================

alter table testimonial_clients
  add column industry text not null default '',
  add column website text not null default '',
  add column description text not null default '',
  add column contact_name text not null default '',
  add column contact_position text not null default '',
  add column contact_email text not null default '',
  add column contact_phone text not null default '',
  add column testimonial_quote text not null default '',
  add column testimonial_author text not null default '',
  add column testimonial_rating smallint,
  add column project_id uuid references projects (id) on delete set null;

alter table testimonial_clients
  add constraint testimonial_clients_rating_range
  check (testimonial_rating is null or testimonial_rating between 1 and 5);

update modules set label = 'Client' where key = 'testimonials';
update menu_items set label = 'Client' where module_key = 'testimonials';
