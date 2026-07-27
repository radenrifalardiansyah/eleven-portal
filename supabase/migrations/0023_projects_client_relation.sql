-- ============================================================
-- Flip the Case Study <-> Client relation: a case study now picks
-- its client (projects.client_id), not the other way around. The
-- old testimonial_clients.project_id was still unused placeholder
-- data (all null), so there's nothing to backfill.
-- ============================================================

alter table projects add column client_id uuid references testimonial_clients (id) on delete set null;
alter table testimonial_clients drop column project_id;
