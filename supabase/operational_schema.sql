-- ============================================================================
-- HOSTEL MONARCH — Operational Data Schema (Phase 3: real database connectivity)
-- ============================================================================
-- Run this AFTER schema.sql (which sets up accounts/profiles).
-- This adds real, persisted tables for every operational module: students,
-- rooms/beds, admissions, fees, complaints, leave & gate passes, visitors,
-- parcels, mess, notices and notifications — replacing the in-memory demo
-- arrays in src/data/*.ts once the app is pointed at a live Supabase project.
--
-- Design notes:
--  * Business IDs (e.g. 'HM-STU-1001', 'INV-014') are kept as TEXT primary
--    keys to match the existing frontend code and seed data exactly, instead
--    of switching everything to generated UUIDs.
--  * Tightly-coupled nested data (bed layout inside a room, documents inside
--    an admission, a QR pass inside a leave request) is stored as JSONB
--    rather than extra join tables — a normal, idiomatic Postgres pattern
--    for this kind of data, and it keeps the migration tractable.
--  * `students.profile_id` links a real authenticated account (from
--    `profiles`, created at signup) to their hostel student record, created
--    once an admin approves/allocates them. Until that link is made, a
--    student's signup can be "approved" as an account without yet having
--    hostel data — an admin links/creates the student record from the admin
--    console.
--  * Safe to re-run (guards on every object).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- STUDENTS
-- ---------------------------------------------------------------------------
create table if not exists public.students (
  id                  text primary key,
  profile_id          uuid unique references public.profiles(id) on delete set null,
  name                text not null,
  email               text not null,
  phone               text,
  gender              text,
  dob                 date,
  course              text,
  college             text,
  year                text,
  semester            text,
  guardian_name       text,
  guardian_phone      text,
  address             text,
  photo_url           text,
  status              text not null default 'Active',
  admission_status    text,
  profile_completion  int not null default 0,
  fee_due             numeric not null default 0,
  allocation          jsonb, -- { building, floor, room, bed, joiningDate, bookingFrom, validTill }
  created_at          timestamptz not null default now()
);
alter table public.students enable row level security;

create or replace function public.my_student_id()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select id from public.students where profile_id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role <> 'student' and status = 'approved'
  );
$$;

drop policy if exists "students_select_own_or_staff" on public.students;
create policy "students_select_own_or_staff" on public.students
  for select using (profile_id = auth.uid() or public.is_staff());

drop policy if exists "students_write_staff" on public.students;
create policy "students_write_staff" on public.students
  for all using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- ROOMS (beds embedded as JSONB array: [{id,label,status,studentId,studentName}])
-- ---------------------------------------------------------------------------
create table if not exists public.rooms (
  id            text primary key,
  building      text not null,
  floor         text not null,
  room_no       text not null,
  type          text not null,
  capacity      int not null,
  monthly_rent  numeric not null,
  amenities     text[] not null default '{}',
  beds          jsonb not null default '[]'::jsonb,
  updated_at    timestamptz not null default now()
);
alter table public.rooms enable row level security;

drop policy if exists "rooms_select_any_authenticated" on public.rooms;
create policy "rooms_select_any_authenticated" on public.rooms
  for select using (auth.uid() is not null);

drop policy if exists "rooms_write_staff" on public.rooms;
create policy "rooms_write_staff" on public.rooms
  for all using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- ADMISSIONS (documents + history embedded as JSONB)
-- ---------------------------------------------------------------------------
create table if not exists public.admissions (
  id                  text primary key,
  application_no      text not null,
  student_name        text not null,
  email               text not null,
  phone               text not null,
  course              text,
  college             text,
  preferred_building  text,
  stage               text not null default 'Applied',
  applied_on          date not null default current_date,
  visit_date          date,
  visit_slot          text,
  visit_note          text,
  documents           jsonb not null default '[]'::jsonb,
  history             jsonb not null default '[]'::jsonb,
  updated_at          timestamptz not null default now()
);
alter table public.admissions enable row level security;

drop policy if exists "admissions_select_staff" on public.admissions;
create policy "admissions_select_staff" on public.admissions
  for select using (public.is_staff());

drop policy if exists "admissions_insert_anyone" on public.admissions;
create policy "admissions_insert_anyone" on public.admissions
  for insert with check (true); -- public "Apply for Admission" form

drop policy if exists "admissions_write_staff" on public.admissions;
create policy "admissions_write_staff" on public.admissions
  for update using (public.is_staff());

-- ---------------------------------------------------------------------------
-- INVOICES & PAYMENTS
-- ---------------------------------------------------------------------------
create table if not exists public.invoices (
  id            text primary key,
  invoice_no    text not null,
  student_id    text not null references public.students(id) on delete cascade,
  student_name  text not null,
  room          text,
  title         text not null,
  amount        numeric not null,
  paid_amount   numeric not null default 0,
  due_date      date not null,
  issued_date   date not null,
  status        text not null default 'Pending',
  period        text,
  semester      text not null default 'Semester 1',
  created_at    timestamptz not null default now()
);
alter table public.invoices enable row level security;

drop policy if exists "invoices_select_own_or_staff" on public.invoices;
create policy "invoices_select_own_or_staff" on public.invoices
  for select using (student_id = public.my_student_id() or public.is_staff());

drop policy if exists "invoices_write_staff" on public.invoices;
create policy "invoices_write_staff" on public.invoices
  for all using (public.is_staff()) with check (public.is_staff());

create table if not exists public.payments (
  id              text primary key,
  transaction_id  text not null,
  invoice_id      text not null references public.invoices(id) on delete cascade,
  invoice_no      text not null,
  student_id      text not null references public.students(id) on delete cascade,
  student_name    text not null,
  amount          numeric not null,
  method          text not null,
  status          text not null default 'Success',
  date            text not null,
  verified_by     text,
  created_at      timestamptz not null default now()
);
alter table public.payments enable row level security;

drop policy if exists "payments_select_own_or_staff" on public.payments;
create policy "payments_select_own_or_staff" on public.payments
  for select using (student_id = public.my_student_id() or public.is_staff());

-- Students are allowed to INSERT their own payment row (completing a real
-- checkout from the Fees page); everything else stays staff-only.
drop policy if exists "payments_insert_own_or_staff" on public.payments;
create policy "payments_insert_own_or_staff" on public.payments
  for insert with check (student_id = public.my_student_id() or public.is_staff());

drop policy if exists "payments_update_staff" on public.payments;
create policy "payments_update_staff" on public.payments
  for update using (public.is_staff());

-- ---------------------------------------------------------------------------
-- COMPLAINTS (timeline embedded as JSONB)
-- ---------------------------------------------------------------------------
create table if not exists public.complaints (
  id            text primary key,
  ticket_no     text not null,
  student_id    text not null references public.students(id) on delete cascade,
  student_name  text not null,
  room          text,
  category      text not null,
  title         text not null,
  description   text,
  priority      text not null default 'Medium',
  status        text not null default 'Open',
  assignee      text,
  created_at    timestamptz not null default now(),
  timeline      jsonb not null default '[]'::jsonb
);
alter table public.complaints enable row level security;

drop policy if exists "complaints_select_own_or_staff" on public.complaints;
create policy "complaints_select_own_or_staff" on public.complaints
  for select using (student_id = public.my_student_id() or public.is_staff());

drop policy if exists "complaints_insert_own_or_staff" on public.complaints;
create policy "complaints_insert_own_or_staff" on public.complaints
  for insert with check (student_id = public.my_student_id() or public.is_staff());

drop policy if exists "complaints_update_staff" on public.complaints;
create policy "complaints_update_staff" on public.complaints
  for update using (public.is_staff());

-- ---------------------------------------------------------------------------
-- LEAVE REQUESTS (QR pass embedded as JSONB) & GATE LOGS
-- ---------------------------------------------------------------------------
create table if not exists public.leave_requests (
  id                  text primary key,
  student_id          text not null references public.students(id) on delete cascade,
  student_name        text not null,
  room                text,
  type                text not null,
  start_date          date not null,
  end_date            date not null,
  reason              text,
  destination         text,
  emergency_contact   text,
  status              text not null default 'Requested',
  applied_on          date not null default current_date,
  reviewed_by         text,
  review_remark       text,
  qr_pass             jsonb
);
alter table public.leave_requests enable row level security;

drop policy if exists "leaves_select_own_or_staff" on public.leave_requests;
create policy "leaves_select_own_or_staff" on public.leave_requests
  for select using (student_id = public.my_student_id() or public.is_staff());

drop policy if exists "leaves_insert_own_or_staff" on public.leave_requests;
create policy "leaves_insert_own_or_staff" on public.leave_requests
  for insert with check (student_id = public.my_student_id() or public.is_staff());

drop policy if exists "leaves_update_staff" on public.leave_requests;
create policy "leaves_update_staff" on public.leave_requests
  for update using (public.is_staff());

create table if not exists public.gate_logs (
  id            text primary key,
  student_id    text not null,
  student_name  text not null,
  pass_id       text not null,
  direction     text not null,
  "timestamp"   text not null,
  verified_by   text not null,
  result        text not null
);
alter table public.gate_logs enable row level security;

drop policy if exists "gate_logs_select_own_or_staff" on public.gate_logs;
create policy "gate_logs_select_own_or_staff" on public.gate_logs
  for select using (student_id = public.my_student_id() or public.is_staff());

drop policy if exists "gate_logs_write_staff" on public.gate_logs;
create policy "gate_logs_write_staff" on public.gate_logs
  for insert with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- VISITORS & PARCELS
-- ---------------------------------------------------------------------------
create table if not exists public.visitors (
  id                text primary key,
  student_id        text not null references public.students(id) on delete cascade,
  student_name      text not null,
  visitor_name      text not null,
  relation          text,
  phone             text,
  id_proof          text,
  purpose           text,
  expected_date     date,
  status            text not null default 'Pending',
  checked_in_at     text,
  checked_out_at    text
);
alter table public.visitors enable row level security;

drop policy if exists "visitors_select_own_or_staff" on public.visitors;
create policy "visitors_select_own_or_staff" on public.visitors
  for select using (student_id = public.my_student_id() or public.is_staff());

drop policy if exists "visitors_insert_own_or_staff" on public.visitors;
create policy "visitors_insert_own_or_staff" on public.visitors
  for insert with check (student_id = public.my_student_id() or public.is_staff());

drop policy if exists "visitors_update_staff" on public.visitors;
create policy "visitors_update_staff" on public.visitors
  for update using (public.is_staff());

create table if not exists public.parcels (
  id              text primary key,
  student_id      text not null references public.students(id) on delete cascade,
  student_name    text not null,
  courier         text,
  tracking_id     text,
  received_at     text,
  status          text not null default 'Received',
  collected_at    text
);
alter table public.parcels enable row level security;

drop policy if exists "parcels_select_own_or_staff" on public.parcels;
create policy "parcels_select_own_or_staff" on public.parcels
  for select using (student_id = public.my_student_id() or public.is_staff());

drop policy if exists "parcels_write_staff" on public.parcels;
create policy "parcels_write_staff" on public.parcels
  for all using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- MESS: MENU, PARTICIPATION, DIET REQUESTS, FEEDBACK
-- ---------------------------------------------------------------------------
create table if not exists public.mess_menu_days (
  date    date primary key,
  meals   jsonb not null default '{}'::jsonb -- { breakfast: [...], lunch: [...], snacks: [...], dinner: [...] }
);
alter table public.mess_menu_days enable row level security;

drop policy if exists "menu_select_any_authenticated" on public.mess_menu_days;
create policy "menu_select_any_authenticated" on public.mess_menu_days
  for select using (auth.uid() is not null);

drop policy if exists "menu_write_staff" on public.mess_menu_days;
create policy "menu_write_staff" on public.mess_menu_days
  for all using (public.is_staff()) with check (public.is_staff());

create table if not exists public.meal_participation (
  id            text primary key,
  student_id    text not null references public.students(id) on delete cascade,
  date          date not null,
  breakfast     boolean not null default true,
  lunch         boolean not null default true,
  snacks        boolean not null default true,
  dinner        boolean not null default true,
  unique (student_id, date)
);
alter table public.meal_participation enable row level security;

drop policy if exists "participation_select_own_or_staff" on public.meal_participation;
create policy "participation_select_own_or_staff" on public.meal_participation
  for select using (student_id = public.my_student_id() or public.is_staff());

drop policy if exists "participation_write_own_or_staff" on public.meal_participation;
create policy "participation_write_own_or_staff" on public.meal_participation
  for all using (student_id = public.my_student_id() or public.is_staff())
  with check (student_id = public.my_student_id() or public.is_staff());

create table if not exists public.diet_requests (
  id            text primary key,
  student_id    text not null references public.students(id) on delete cascade,
  student_name  text not null,
  request_type  text not null,
  reason        text,
  status        text not null default 'Pending',
  requested_on  date not null default current_date,
  reviewed_by   text
);
alter table public.diet_requests enable row level security;

drop policy if exists "diet_select_own_or_staff" on public.diet_requests;
create policy "diet_select_own_or_staff" on public.diet_requests
  for select using (student_id = public.my_student_id() or public.is_staff());

drop policy if exists "diet_insert_own_or_staff" on public.diet_requests;
create policy "diet_insert_own_or_staff" on public.diet_requests
  for insert with check (student_id = public.my_student_id() or public.is_staff());

drop policy if exists "diet_update_staff" on public.diet_requests;
create policy "diet_update_staff" on public.diet_requests
  for update using (public.is_staff());

create table if not exists public.mess_feedback (
  id            text primary key,
  student_id    text not null references public.students(id) on delete cascade,
  student_name  text not null,
  date          date not null default current_date,
  rating        int not null check (rating between 1 and 5),
  comment       text
);
alter table public.mess_feedback enable row level security;

drop policy if exists "feedback_select_own_or_staff" on public.mess_feedback;
create policy "feedback_select_own_or_staff" on public.mess_feedback
  for select using (student_id = public.my_student_id() or public.is_staff());

drop policy if exists "feedback_insert_own_or_staff" on public.mess_feedback;
create policy "feedback_insert_own_or_staff" on public.mess_feedback
  for insert with check (student_id = public.my_student_id() or public.is_staff());

-- ---------------------------------------------------------------------------
-- NOTICES & NOTIFICATIONS
-- ---------------------------------------------------------------------------
create table if not exists public.notices (
  id            text primary key,
  title         text not null,
  body          text not null,
  audience      text not null default 'All',
  publish_date  date not null default current_date,
  posted_by     text
);
alter table public.notices enable row level security;

drop policy if exists "notices_select_any_authenticated" on public.notices;
create policy "notices_select_any_authenticated" on public.notices
  for select using (auth.uid() is not null);

drop policy if exists "notices_write_staff" on public.notices;
create policy "notices_write_staff" on public.notices
  for all using (public.is_staff()) with check (public.is_staff());

create table if not exists public.notifications (
  id            text primary key,
  title         text not null,
  message       text not null,
  category      text,
  for_role      text not null,
  for_student_id text references public.students(id) on delete cascade,
  "timestamp"   text not null,
  read          boolean not null default false
);
alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select using (
    for_student_id = public.my_student_id()
    or (for_student_id is null and public.is_staff())
  );

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update using (
    for_student_id = public.my_student_id()
    or (for_student_id is null and public.is_staff())
  );

drop policy if exists "notifications_insert_staff" on public.notifications;
create policy "notifications_insert_staff" on public.notifications
  for insert with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- PUBLIC CONTACT FORM (anyone can submit, only staff can read)
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  message     text not null,
  created_at  timestamptz not null default now()
);
alter table public.contact_messages enable row level security;

drop policy if exists "contact_insert_anyone" on public.contact_messages;
create policy "contact_insert_anyone" on public.contact_messages
  for insert with check (true);

drop policy if exists "contact_select_staff" on public.contact_messages;
create policy "contact_select_staff" on public.contact_messages
  for select using (public.is_staff());

-- ============================================================================
-- SEEDING: a one-time seed script (to be added at src/lib/seedSupabase.ts
-- once a live project is connected) will copy the existing demo data
-- (students, rooms, invoices, etc.) into these real tables, so the app has
-- something to show immediately in live mode instead of starting empty.
-- ============================================================================
