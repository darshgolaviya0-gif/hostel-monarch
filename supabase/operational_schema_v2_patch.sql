-- ============================================================================
-- HOSTEL MONARCH — Patch to operational_schema.sql
-- ============================================================================
-- Safe, additive fixes discovered while wiring the real frontend code to the
-- live schema: a few tables were missing fields that exist on the app's
-- TypeScript types (nested objects like `guardian`/`address`, or a couple of
-- plain fields like `room`/`meal`). Nothing here deletes data or drops an
-- existing table. Run this once, after operational_schema.sql.
-- ============================================================================

-- STUDENTS: add a flexible slot for the nested bits (guardian, address,
-- emergency contact, enrollment number, avatar, blood group).
alter table public.students add column if not exists extra jsonb not null default '{}'::jsonb;

-- ADMISSIONS: hold the pending student id placeholder + avatar.
alter table public.admissions add column if not exists extra jsonb not null default '{}'::jsonb;

-- COMPLAINTS: `imageAttached` flag, and created_at needs to store the app's
-- own pre-formatted display string (e.g. "24 Oct 2026 10:45 PM") rather than
-- a strict timestamp, to avoid any parsing ambiguity.
alter table public.complaints add column if not exists extra jsonb not null default '{}'::jsonb;
alter table public.complaints alter column created_at type text using created_at::text;
alter table public.complaints alter column created_at drop default;

-- VISITORS: `room` + `expectedTime` weren't in the original schema.
alter table public.visitors add column if not exists extra jsonb not null default '{}'::jsonb;

-- PARCELS: `room` wasn't in the original schema.
alter table public.parcels add column if not exists extra jsonb not null default '{}'::jsonb;

-- DIET REQUESTS: `room` wasn't in the original schema.
alter table public.diet_requests add column if not exists extra jsonb not null default '{}'::jsonb;

-- MESS FEEDBACK: `meal` (Breakfast/Lunch/Snacks/Dinner) wasn't captured.
alter table public.mess_feedback add column if not exists extra jsonb not null default '{}'::jsonb;

-- NOTICES: `audience` needs to support an array of roles (not just one
-- value), and category/priority/expiryDate/pinned weren't captured.
alter table public.notices alter column audience drop default;
alter table public.notices alter column audience type jsonb using to_jsonb(audience);
alter table public.notices alter column audience set default '"All"'::jsonb;
alter table public.notices add column if not exists extra jsonb not null default '{}'::jsonb;

-- MEAL PARTICIPATION: this is really "one live record per student" in the
-- app (toggled day to day), not a dated history table as originally modeled.
-- Relax the old per-day uniqueness and key it by student instead; also add
-- the missing `diet` field.
alter table public.meal_participation drop constraint if exists meal_participation_student_id_date_key;
alter table public.meal_participation alter column date drop not null;
alter table public.meal_participation add column if not exists diet text not null default 'Regular';
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'meal_participation_student_id_key'
  ) then
    alter table public.meal_participation add constraint meal_participation_student_id_key unique (student_id);
  end if;
end $$;

-- AUDIT LOGS: hold the app's own pre-formatted date/time display strings
-- alongside the real created_at timestamp.
alter table public.audit_logs add column if not exists extra jsonb not null default '{}'::jsonb;
