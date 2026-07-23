-- ============================================================
-- Seed menu_groups / menu_items (ports lib/auth/nav.ts) and
-- role_permissions (ports the old hardcoded MATRIX)
-- ============================================================

insert into menu_groups (label, sort_order) values
  ('Utama', 0),
  ('Konten Website', 1),
  ('Sistem', 2),
  ('Akun', 3);

insert into menu_items (group_id, label, href, icon, module_key, sort_order, always_visible, show_bottom_nav)
select id, 'Dashboard', '/admin', 'LayoutDashboard', 'dashboard', 0, true, true from menu_groups where label = 'Utama'
union all
select id, 'Home', '/admin/page-sections', 'FileText', 'page_sections', 0, false, false from menu_groups where label = 'Konten Website'
union all
select id, 'Products', '/admin/products', 'Package', 'products', 1, false, true from menu_groups where label = 'Konten Website'
union all
select id, 'Services', '/admin/services', 'Layers', 'services', 2, false, true from menu_groups where label = 'Konten Website'
union all
select id, 'Stories', '/admin/stories', 'Newspaper', 'stories', 3, false, true from menu_groups where label = 'Konten Website'
union all
select id, 'Team', '/admin/team', 'Users', 'team', 4, false, false from menu_groups where label = 'Konten Website'
union all
select id, 'Case Study', '/admin/projects', 'Briefcase', 'projects', 5, false, false from menu_groups where label = 'Konten Website'
union all
select id, 'Testimonials', '/admin/testimonials', 'Quote', 'testimonials', 6, false, false from menu_groups where label = 'Konten Website'
union all
select id, 'Pengguna', '/admin/users', 'ShieldCheck', 'users', 0, false, false from menu_groups where label = 'Sistem'
union all
select id, 'Hak Akses Role', '/admin/roles', 'Lock', 'role_management', 1, false, false from menu_groups where label = 'Sistem'
union all
select id, 'Struktur Menu', '/admin/menu-struktur', 'ListTree', 'menu_structure', 2, false, false from menu_groups where label = 'Sistem'
union all
select id, 'Site Settings', '/admin/site-settings', 'Settings', 'site_settings', 3, false, false from menu_groups where label = 'Sistem'
union all
select id, 'Pengaturan Profil', '/admin/profile', 'UserCog', 'account', 0, true, false from menu_groups where label = 'Akun';

-- role_permissions: (role, module_key, view, edit, delete, approve, publish)
insert into role_permissions (role, module_key, can_view, can_edit, can_delete, can_approve, can_publish) values
-- super_admin: full control everywhere, including system modules
('super_admin', 'products', true, true, true, true, true),
('super_admin', 'services', true, true, true, true, true),
('super_admin', 'stories', true, true, true, true, true),
('super_admin', 'team', true, true, true, true, true),
('super_admin', 'projects', true, true, true, true, true),
('super_admin', 'testimonials', true, true, true, true, true),
('super_admin', 'page_sections', true, true, true, true, true),
('super_admin', 'site_settings', true, true, true, true, true),
('super_admin', 'users', true, true, true, false, false),
('super_admin', 'menu_structure', true, true, true, false, false),
('super_admin', 'role_management', true, true, true, false, false),

-- admin: same content/site access as super_admin, no user/role/menu management
('admin', 'products', true, true, true, true, true),
('admin', 'services', true, true, true, true, true),
('admin', 'stories', true, true, true, true, true),
('admin', 'team', true, true, true, true, true),
('admin', 'projects', true, true, true, true, true),
('admin', 'testimonials', true, true, true, true, true),
('admin', 'page_sections', true, true, true, true, true),
('admin', 'site_settings', true, true, true, true, true),

-- editor: can create/edit/delete content, but cannot approve/publish — goes to review queue
('editor', 'products', true, true, true, false, false),
('editor', 'services', true, true, true, false, false),
('editor', 'stories', true, true, true, false, false),
('editor', 'team', true, true, true, false, false),
('editor', 'projects', true, true, true, false, false),
('editor', 'testimonials', true, true, true, false, false),

-- employee: read-only across content + page content
('employee', 'products', true, false, false, false, false),
('employee', 'services', true, false, false, false, false),
('employee', 'stories', true, false, false, false, false),
('employee', 'team', true, false, false, false, false),
('employee', 'projects', true, false, false, false, false),
('employee', 'testimonials', true, false, false, false, false),
('employee', 'page_sections', true, false, false, false, false),

-- finance: read-only, products only (pricing visibility)
('finance', 'products', true, false, false, false, false);
