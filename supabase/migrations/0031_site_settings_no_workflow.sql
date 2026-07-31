-- ============================================================
-- site_settings has no draft/pending/published workflow (it's a
-- single always-live settings object, unlike products/services/
-- stories/team/projects/testimonials) and its actions never check
-- "approve" or "publish" permission — those checkboxes in Hak
-- Akses Role were dead toggles left over from the original seed.
-- Clear them so the module shows "—" for both, consistent with
-- Users/Menu Struktur/Role Management which also have no workflow.
-- ============================================================

update role_permissions set can_approve = false, can_publish = false
  where module_key = 'site_settings' and role in ('super_admin', 'admin');
