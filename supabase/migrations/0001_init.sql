-- ============================================================
-- Eleven Digital CMS — initial schema, roles & RLS
-- Run this in the Supabase SQL editor (or `supabase db push`)
-- ============================================================

create extension if not exists "pgcrypto";

create type user_role as enum ('super_admin', 'admin', 'editor', 'employee', 'finance');

-- ------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  role user_role not null default 'employee',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.current_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.is_staff_writer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() in ('super_admin', 'admin', 'editor');
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() in ('super_admin', 'admin');
$$;

create function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() = 'super_admin';
$$;

-- auto-create a profile row (default role: employee) whenever a new
-- auth user signs up; promote the first Super Admin manually via SQL.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table profiles enable row level security;

create policy "profiles_select_own_or_staff"
  on profiles for select
  to authenticated
  using (id = auth.uid() or public.current_role() is not null);

create policy "profiles_update_own_basic_fields"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_super_admin_manage_all"
  on profiles for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- ------------------------------------------------------------
-- Shared trigger to keep updated_at current
-- ------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Content tables
-- ------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  price text not null,
  description text not null,
  long_description text not null,
  features text[] not null default '{}',
  gallery text[] not null default '{}',
  image text not null,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  long_description text not null,
  benefits text[] not null default '{}',
  icon text not null,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table stories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  label text not null,
  label_color text not null default 'blue' check (label_color in ('yellow', 'blue')),
  description text not null,
  content text[] not null default '{}',
  image text not null,
  author text not null,
  author_image text not null,
  date date not null,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table team_members (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  position text not null,
  bio text not null,
  long_bio text not null,
  email text not null,
  socials jsonb not null default '{}',
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  year text not null,
  image text not null,
  href text not null,
  description text not null,
  long_description text not null,
  services text[] not null default '{}',
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table testimonial_clients (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  logo text not null,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table page_sections (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  section_key text not null,
  content jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  unique (page_key, section_key)
);

create table site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on products
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on services
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on stories
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on team_members
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on projects
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on testimonial_clients
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on page_sections
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on site_settings
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- RLS: public read of published rows, staff read everything,
-- writes restricted to super_admin / admin / editor
-- ------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['products', 'services', 'stories', 'team_members', 'projects', 'testimonial_clients']
  loop
    execute format('alter table %I enable row level security', t);

    execute format(
      'create policy "%1$s_public_read_published" on %1$s for select to anon, authenticated using (is_published = true)',
      t
    );
    execute format(
      'create policy "%1$s_staff_read_all" on %1$s for select to authenticated using (public.current_role() is not null)',
      t
    );
    execute format(
      'create policy "%1$s_staff_write" on %1$s for insert to authenticated with check (public.is_staff_writer())',
      t
    );
    execute format(
      'create policy "%1$s_staff_update" on %1$s for update to authenticated using (public.is_staff_writer()) with check (public.is_staff_writer())',
      t
    );
    execute format(
      'create policy "%1$s_staff_delete" on %1$s for delete to authenticated using (public.is_staff_writer())',
      t
    );
  end loop;
end $$;

alter table page_sections enable row level security;
create policy "page_sections_public_read" on page_sections for select to anon, authenticated using (true);
create policy "page_sections_admin_write" on page_sections for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table site_settings enable row level security;
create policy "site_settings_public_read" on site_settings for select to anon, authenticated using (true);
create policy "site_settings_admin_write" on site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
