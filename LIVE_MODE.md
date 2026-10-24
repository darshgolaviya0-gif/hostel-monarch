# Going Live: Real Staff & Student Accounts

By default Hostel Monarch runs in **Demo Mode** — everything (users, students,
rooms, fees…) is simulated in your browser with the shared password
`Demo@123`. This guide switches on **Live Mode**, where real people create
their own accounts with their own password, and an administrator approves
each one before it becomes active.

> Live Mode currently covers **accounts, login, and admin approvals**. The
> rest of the operational data (rooms, fees, complaints, mess, etc.) still
> runs on demo data — migrating those to the same database is a natural next
> phase once this is working for your hostel.

## 1. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up / log in.
2. Click **New Project**, give it a name (e.g. "hostel-monarch"), choose a
   region close to your users, and set a database password (store it safely —
   you won't need it day-to-day).
3. Wait ~2 minutes for the project to finish provisioning.

## 2. Run the database schema

1. In your Supabase project, open **SQL Editor** (left sidebar).
2. Open `supabase/schema.sql` from this project, copy its full contents,
   paste into the SQL editor, and click **Run**.
3. This creates the `profiles` table (one row per real user, starting
   `status = 'pending'`), an `audit_logs` table, and all the security
   policies that keep each role's data properly isolated.

## 3. Connect the app to your project

1. In Supabase, open **Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. In this project, copy `.env.example` to a new file named `.env`.
4. Paste your values in:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
5. Restart the dev server (or redeploy). The app automatically detects these
   variables and switches into Live Mode — you'll notice the demo "Use Demo
   Account" shortcuts disappear and a real **"Create an account"** link
   appears on the login page.

## 4. Create your own admin account

Live Mode starts with **zero admins**, so the very first one must be
promoted manually (every account after this can be approved from inside the
app):

1. Go to `/signup`, choose the **Administration** role, and sign up with
   your own real email and a password.
2. If your Supabase project has email confirmation enabled (the default),
   check your inbox and click the verification link.
3. Back in the Supabase **SQL Editor**, run:
   ```sql
   update public.profiles
   set role = 'admin', status = 'approved', approved_at = now()
   where email = 'you@example.com';
   ```
4. Log in at `/login` with the Administration role — you're now an approved
   administrator.

## 5. Everyone else signs up normally

From here on:

- **Staff** (warden, security, maintenance, mess, accounts) go to `/signup`,
  pick their role, and fill in their details.
- **Students** go to `/signup`, pick **Student**, and fill in their details
  (name, email, phone, course).
- Every new signup starts as **Pending** and sees an "awaiting approval"
  screen if they try to log in before being approved.
- You (the admin) open **Account Approvals** in the sidebar, review each
  application, and click **Approve** or **Reject**. Approved accounts can
  log in immediately with the password they chose at signup.

## Notes & limits of this phase

- Passwords, sessions and email verification are handled entirely by
  Supabase Auth — no passwords are ever stored in this app's own code.
- Row Level Security (RLS) policies mean the anon key is safe to ship in the
  frontend: users can only ever read/update their own profile, and only
  approved admins can see/manage everyone else's.
- Forgot-password now sends a real email via Supabase when Live Mode is on.
- Rooms, fees, complaints, leave/QR passes, mess, notices, etc. are still
  demo data shared in-memory per browser tab. A real hostel would want these
  migrated into the same Supabase database next — ask if you'd like that
  built out.
