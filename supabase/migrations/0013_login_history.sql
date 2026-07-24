-- ============================================================
-- Login history for the "Riwayat Login" list on the Pengaturan
-- Profil page. Supabase Auth only keeps last_sign_in_at (a single
-- timestamp, no device info), so successful logins are recorded
-- here instead, one row per sign-in, capturing the raw user-agent
-- (device type is derived from it in the app layer). History only
-- starts accumulating from this migration onward — there's nothing
-- to backfill.
-- ============================================================

create table login_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  user_agent text,
  created_at timestamptz not null default now()
);

create index login_history_user_id_created_at_idx
  on login_history (user_id, created_at desc);

alter table login_history enable row level security;

create policy "login_history_select_own_or_staff"
  on login_history for select
  to authenticated
  using (user_id = auth.uid() or public.current_role() is not null);

create policy "login_history_insert_own"
  on login_history for insert
  to authenticated
  with check (user_id = auth.uid());
