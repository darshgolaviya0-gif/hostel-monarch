-- ============================================================================
-- HOSTEL MONARCH — Live Mode Schema (run once in Supabase SQL Editor)
-- ============================================================================
-- This sets up real account signup + admin approval for staff and students.
-- It intentionally keeps scope to identity/accounts for the first phase —
-- operational modules (rooms, fees, complaints, mess, etc.) still run on
-- demo data until a later migration. Safe to re-run (uses IF NOT EXISTS /
-- OR REPLACE / DROP ... IF EXISTS guards).
-- ============================================================================

-- 1. PROFILES ----------------------------------------------------------------
-- One row per authenticated person (staff or student). Created automatically
-- the moment someone signs up, starting in 'pending' status.

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null,
  phone       text,
  role        text not null check (role in ('student','admin','warden','security','maintenance','mess','accounts')),
  status      text not null default 'pending' check (status in ('pending','approved','rejected','suspended')),
  -- flexible per-role extra info captured at signup, e.g. for students:
  -- { "course": "...", "year": "...", "guardianName": "...", "guardianPhone": "..." }
  -- for staff: { "designation": "..." }
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  rejected_reason text
);

alter table public.profiles enable row level security;

-- Helper function (security definer avoids RLS recursion issues).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'approved'
  );
$$;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin());

-- 2. AUTO-CREATE PROFILE ON SIGNUP -------------------------------------------
-- Reads full_name / phone / role / meta out of the signUp() call's
-- options.data payload (see src/contexts/AuthContext.tsx -> signUp()).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, role, status, meta)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    'pending',
    coalesce(new.raw_user_meta_data->'meta', '{}'::jsonb)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. AUDIT LOG (optional, mirrors the in-app Audit Trail) --------------------

create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references auth.users(id),
  actor_name  text not null,
  role        text not null,
  action      text not null,
  module      text not null,
  status      text not null default 'Success',
  created_at  timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

drop policy if exists "audit_insert_authenticated" on public.audit_logs;
create policy "audit_insert_authenticated" on public.audit_logs
  for insert with check (auth.uid() is not null);

drop policy if exists "audit_select_admin" on public.audit_logs;
create policy "audit_select_admin" on public.audit_logs
  for select using (public.is_admin());

-- ============================================================================
-- BOOTSTRAP: create your first admin account
-- ============================================================================
-- 1. Run the app in live mode and sign up normally picking the
--    "Administration" role at /signup. Your account will be created with
--    status = 'pending' (nobody can approve themselves yet).
-- 2. Come back here to the SQL editor and run the following command,
--    replacing the email with the one you just signed up with:
--
--    update public.profiles
--    set role = 'admin', status = 'approved', approved_at = now()
--    where email = 'you@example.com';
--
-- 3. Log back in — you're now an approved administrator and can approve
--    every future staff/student signup from the in-app "Account Approvals"
--    screen without ever touching SQL again.
-- ============================================================================
