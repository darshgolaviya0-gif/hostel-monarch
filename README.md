# HOSTEL MONARCH

**Smart Living. Seamless Management.**

A production-quality hostel management web app for Indian student hostels —
admissions, room/bed allocation, fees & payments (Razorpay), complaints,
leave & QR gate passes, visitors, parcels, mess management, notices, and
role-based dashboards for students, admins, wardens, security, maintenance,
mess staff and accounts.

Built with React + TypeScript + Vite + Tailwind CSS, with an optional
Supabase backend for real accounts/database and an Express backend for real
Razorpay payments. Runs fully standalone in **demo mode** with no setup at
all — perfect for trying it out immediately.

---

## Quick start (demo mode — no setup needed)

Demo mode uses realistic in-memory mock data and instant "demo login"
buttons for every role. Nothing to configure.

```bash
npm install
npm run dev
```

Open the printed `http://localhost:5173` URL. On the login page, pick a role
and click "Use Demo Account" (or sign in with any of the demo credentials
below — all passwords are `Demo@123`):

| Role | Username |
|---|---|
| Student | `aarav.patel` |
| Administration | `meera.admin` |
| Warden | `rajesh.warden` |
| Security | `bhavesh.security` |
| Maintenance | `suresh.maintenance` |
| Mess | `kavita.mess` |
| Accounts | `nilesh.accounts` |

## Running with a real database (live mode)

To switch from demo data to a real Supabase-backed database with real
sign-ups and admin approvals, see **`SUPABASE_SETUP_GUIDE.md`** — copy
`.env.example` to `.env` and fill in your Supabase project's URL + anon key.
Once `.env` has those values, `npm run dev` automatically switches the whole
app into live mode (demo login buttons are disabled in this mode — real
accounts only, by design).

## Running the payment backend (optional, for real Razorpay payments)

The `server/` folder is a small standalone Express server that creates and
verifies Razorpay orders server-side (the secret key never touches the
browser). Without it, the Fees page runs an entirely simulated/demo payment
flow — nothing required to try the app.

```bash
cd server
npm install
cp .env.example .env   # fill in real Razorpay keys if/when you have them
node index.js
```

## Deploying permanently

See **`DEPLOYMENT_GUIDE.md`** for step-by-step instructions to deploy the
frontend to Vercel, the payment backend to Render, and connect both to your
Supabase project — giving you a permanent, shareable URL.

## Project structure

```
src/
  components/   Shared UI (layout, cards, charts, forms)
  contexts/     Auth context (demo + real Supabase auth)
  store/        AppDataContext — the app's central data layer
  lib/          Supabase client, live data access layer, payments client
  data/         Seed/demo data (students, rooms, fees, etc.)
  pages/        Route-level pages, grouped by audience:
    public/     Marketing site, Apply for Admission, Contact
    auth/       Login, Signup, Reset Password, Account Status
    student/    Student portal (dashboard, fees, complaints, leave, mess…)
    admin/ ...  Role-specific dashboards for staff
server/         Standalone Express payment backend (Razorpay)
supabase/       SQL schema (accounts + all operational tables + RLS)
```

## Other docs in this repo

- `LAUNCH_GUIDE.md` — full go-live roadmap (legal pages, business KYC, hosting, checklist)
- `SUPABASE_SETUP_GUIDE.md` — step-by-step Supabase project setup
- `DEPLOYMENT_GUIDE.md` — step-by-step permanent deployment (Vercel + Render)
- `LIVE_MODE.md` — what changes in the app once Supabase credentials are set
