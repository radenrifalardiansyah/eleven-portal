-- ============================================================
-- Section header cards (SectionContentCard) only exposed eyebrow/
-- title/cta_label — the description paragraph under each homepage
-- section title was hardcoded in the component. Add it as an
-- editable field, backfilled with the current hardcoded copy so
-- the admin form isn't blank and the live site doesn't change.
-- ============================================================

update page_sections set content = content || '{"description": "Dari web development, UI/UX design, hingga digital marketing, kami membantu setiap tahap transformasi digital bisnis Anda."}'::jsonb
  where page_key = 'home' and section_key = 'services_header';

update page_sections set content = content || '{"description": "Berbagai paket produk siap pakai untuk membantu bisnis kamu tampil lebih profesional."}'::jsonb
  where page_key = 'home' and section_key = 'products_header';

update page_sections set content = content || '{"description": "Tim inti yang mengarahkan visi dan kualitas kerja di balik setiap proyek Eleven Digital Indonesia."}'::jsonb
  where page_key = 'home' and section_key = 'team_header';

update page_sections set content = content || '{"description": "Wawasan seputar desain, teknologi, dan kreativitas dari tim Eleven Digital Indonesia untuk membantu bisnis Anda terus berkembang."}'::jsonb
  where page_key = 'home' and section_key = 'stories_header';

update page_sections set content = content || '{"description": "Sebagian proyek yang telah kami kerjakan bersama berbagai klien, mulai dari korporasi, kementerian, hingga brand nasional."}'::jsonb
  where page_key = 'home' and section_key = 'casestudy_header';

update page_sections set content = content || '{"description": "Beragam korporasi, kementerian, dan brand nasional telah mempercayakan proyek digital mereka kepada kami."}'::jsonb
  where page_key = 'home' and section_key = 'testimonials_header';

update page_sections set content = content || '{"description": "Pengalaman nyata klien yang telah bekerja sama dengan kami."}'::jsonb
  where page_key = 'home' and section_key = 'testimonial_quotes_header';
