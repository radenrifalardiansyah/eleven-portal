-- ============================================================
-- Replace is_published boolean with a draft/pending/published
-- status column across all 6 content tables (approval workflow)
-- ============================================================

do $$
declare
  t text;
begin
  foreach t in array array['products', 'services', 'stories', 'team_members', 'projects', 'testimonial_clients']
  loop
    execute format(
      'alter table %I add column status text not null default ''published'' check (status in (''draft'',''pending'',''published''))',
      t
    );
    execute format('update %I set status = case when is_published then ''published'' else ''draft'' end', t);
    execute format('drop policy "%1$s_public_read_published" on %1$s', t);
    execute format(
      'create policy "%1$s_public_read_published" on %1$s for select to anon, authenticated using (status = ''published'')',
      t
    );
    execute format('alter table %I drop column is_published', t);
  end loop;
end $$;
