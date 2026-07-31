-- ============================================================
-- The combined "Client logos + testimonial quotes" homepage
-- section is now split into two: ClientLogos (still keyed by the
-- existing testimonials_header row) and Testimonials (quote
-- cards), which needs its own header content row.
-- ============================================================

insert into page_sections (page_key, section_key, content) values
('home', 'testimonial_quotes_header', '{"eyebrow": "Testimoni", "title": "Apa Kata Klien Kami"}'::jsonb);
