# Supabase Setup — Step by Step

This gives HOSTEL MONARCH a real, live database and real login accounts
(instead of the built-in demo data). It takes about 10 minutes. No coding
required for your part — just clicking through Supabase's dashboard.

---

## Step 1 — Create a Supabase account

1. Go to **https://supabase.com**
2. Click **"Start your project"** (top right).
3. Sign up with GitHub, Google, or email — it's free, no credit card needed
   for the free tier.

## Step 2 — Create a new project

1. Once logged in, click **"New project"**.
2. Fill in:
   - **Organization**: it'll create a default one for you — fine to use.
   - **Project name**: e.g. `hostel-monarch`
   - **Database password**: generate/choose a strong password and **save it
     somewhere** (a password manager or note) — you likely won't need it
     day-to-day, but you'll want it if you ever connect a DB client directly.
   - **Region**: pick the one closest to you — e.g. **Mumbai (ap-south-1)**
     for lowest latency from India.
   - **Pricing plan**: Free.
3. Click **"Create new project"**.
4. Wait 1–2 minutes while Supabase provisions it (you'll see a progress
   screen).

## Step 3 — Get your API credentials

1. Once the project is ready, in the left sidebar click the **gear icon
   (Project Settings)**.
2. Click **"API"** in the settings menu.
3. You'll see two things you need:
   - **Project URL** — looks like `https://xxxxxxxxxxxx.supabase.co`
   - **Project API keys → `anon` `public`** — a long string starting with
     `eyJ...`
4. Copy both somewhere safe for a moment (Notepad, etc.) — you'll paste them
   into the app next.

   ⚠️ There's also a **`service_role`** key on that same page — **do not use
   that one for the app's `.env`**. It bypasses all security rules and must
   never go into frontend code. We only need the `anon` key.

## Step 4 — Run the database schema

This creates all the tables, security rules, and the auto-profile-creation
trigger the app needs.

1. In the Supabase dashboard, click **"SQL Editor"** in the left sidebar.
2. Click **"New query"**.
3. Open this project's file `supabase/schema.sql`, copy its **entire
   contents**, and paste into the SQL editor.
4. Click **"Run"** (or press Ctrl/Cmd+Enter). You should see
   "Success. No rows returned."
5. Click **"New query"** again, open `supabase/operational_schema.sql`,
   copy its entire contents, paste, and **Run** again.

   (These two files are safe to re-run if you ever need to — they use
   `if not exists` / `or replace` guards throughout.)

## Step 5 — Give me the credentials

Paste me the **Project URL** and **anon public key** from Step 3, and I'll:
- Add them to the app's environment config.
- Restart the app in live mode.
- Verify signup, login, and the admin-approval flow actually work against
  your real project (not just that the code compiles).

If you'd rather not paste secrets into chat, that's completely fine — the
`anon` key is designed to be safe for public/frontend use (it's protected by
the Row Level Security rules in the schema), but if you're cautious, you can
instead:
1. Tell me you've created the project.
2. I'll give you the exact two lines to put into a `.env` file yourself
   (copy of `.env.example`) and you paste the values there directly.

## Step 6 — Make yourself the first admin

Once live mode is on:
1. Go to `/signup` on the running app, sign up with your own email, picking
   the **"Administration"** role.
2. Your account is created with status `pending` (nobody can approve
   themselves — a deliberate security rule).
3. Back in Supabase's **SQL Editor**, run (replacing the email):
   ```sql
   update public.profiles
   set role = 'admin', status = 'approved', approved_at = now()
   where email = 'you@example.com';
   ```
4. Log out and back in — you're now an approved administrator and can
   approve every future student/staff signup from the in-app
   **"Account Approvals"** screen, without ever touching SQL again.

---

### What happens after this

Right now the schema supports real accounts/signups fully, plus tables for
every operational module (students, rooms, fees, complaints, etc.) ready to
receive data. The next step on my side — once you've done Steps 1–4 and
shared credentials — is wiring the app's internal data layer to actually
read/write those tables instead of its current in-memory demo data, starting
with Students/Rooms/Admissions and then Fees/Payments.
