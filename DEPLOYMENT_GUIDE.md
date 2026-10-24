# Permanent Deployment Guide (with the database connected)

This takes the app from "sandbox preview that dies when the session ends" to a
real, permanent URL anyone can visit — with your live Supabase database
already wired in. Three pieces get deployed:

| Piece | What it is | Where it goes | Cost |
|---|---|---|---|
| Frontend | The React app (everything in this repo except `server/`) | **Vercel** | Free |
| Backend | The small Express server in `server/` (handles Razorpay securely) | **Render** | Free |
| Database | Already done — your Supabase project | *(nothing to do)* | Free |

Total time: ~20 minutes, no credit card needed for either host's free tier.

---

## Step 1 — Get the code onto GitHub

Both Vercel and Render deploy straight from a GitHub repo and auto-redeploy
every time it changes — the standard, low-maintenance way to host this.

1. Go to **https://github.com/new**
2. Repository name: `hostel-monarch` (or anything you like)
3. Leave it **empty** — do NOT check "Add a README" or ".gitignore" (the repo
   already has these)
4. Visibility: **Private** is safer (it's fine either way — no real secrets
   are in the code, but private avoids randoms poking at a student project)
5. Click **Create repository**
6. On the next page, GitHub shows you a remote URL like
   `https://github.com/yourname/hostel-monarch.git` — copy it

Now, two ways to get the code up there:

**Option A — I push it for you (fastest).** Generate a GitHub Personal
Access Token:
1. Go to **https://github.com/settings/tokens/new**
2. Note: "hostel-monarch deploy", Expiration: 7 days is plenty
3. Scope: check **repo** (full control of private repositories)
4. Click **Generate token**, copy it (starts with `ghp_...`)
5. Send me the token + your repo URL and I'll push the code immediately.
   (You can revoke/delete the token afterwards — it's only needed once.)

**Option B — you push it yourself**, if you'd rather not share a token:
download the project files and run, from the project folder:
```bash
git remote add origin https://github.com/yourname/hostel-monarch.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Deploy the frontend to Vercel

1. Go to **https://vercel.com** → sign up (GitHub login is easiest)
2. Click **"Add New" → "Project"**
3. Import the `hostel-monarch` GitHub repo
4. Vercel auto-detects it's a Vite app — leave the defaults:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Before clicking Deploy, open **Environment Variables** and add:
   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://mgciljolzhqhavqvcqtg.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | *(the same publishable/anon key you gave me earlier)* |
   | `VITE_API_BASE_URL` | *(leave blank for now — you'll add this in Step 4)* |
6. Click **Deploy**. In ~1 minute you'll get a real permanent URL like
   `https://hostel-monarch.vercel.app`

---

## Step 3 — Deploy the backend to Render

The Razorpay-handling server needs its own always-on home (Vercel only hosts
the frontend/static site + optional serverless functions, not a long-running
Express server the way this one is built).

1. Go to **https://render.com** → sign up (GitHub login is easiest)
2. Click **"New +" → "Web Service"**
3. Connect the same `hostel-monarch` GitHub repo
4. Configure:
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: Free
5. Add environment variables (optional — only if you have real Razorpay
   keys; leave blank to keep demo payment mode):
   | Name | Value |
   |---|---|
   | `RAZORPAY_KEY_ID` | *(from Razorpay dashboard, once you have one)* |
   | `RAZORPAY_KEY_SECRET` | *(same)* |
   | `RAZORPAY_WEBHOOK_SECRET` | *(same)* |
6. Click **Create Web Service**. You'll get a URL like
   `https://hostel-monarch-backend.onrender.com`

   ⚠️ Free Render services "sleep" after 15 minutes of no traffic and take
   ~30 seconds to wake up on the next request — fine for a student project,
   just know the first payment attempt after a quiet period may feel slow.

---

## Step 4 — Connect the two

1. Back in **Vercel** → your project → **Settings → Environment Variables**
2. Set `VITE_API_BASE_URL` to your Render URL from Step 3, e.g.
   `https://hostel-monarch-backend.onrender.com`
3. Go to **Deployments** → click the "..." on the latest one → **Redeploy**
   (environment variable changes need a redeploy to take effect)

---

## Step 5 — Tell Supabase about the new domain

Real signups use Supabase's email confirmation / password-reset links, which
redirect back to your app's URL. Right now Supabase only knows about
`localhost`.

1. In Supabase: **Authentication → URL Configuration**
2. Set **Site URL** to your Vercel URL, e.g. `https://hostel-monarch.vercel.app`
3. Under **Redirect URLs**, add:
   - `https://hostel-monarch.vercel.app/**`
4. Save

---

## Step 6 — Verify it for real

1. Visit your Vercel URL
2. Sign up for a new account at `/signup`
3. Confirm the Contact form and Apply for Admission form both work
4. Promote yourself to admin via the SQL command from the Supabase setup
   guide, log in, and confirm the dashboard loads real (empty, until you add
   data) records instead of demo data

From this point on: every time you (or I) push a change to the GitHub repo,
Vercel and Render both auto-redeploy within a minute or two — no manual
redeploy steps needed again after this first setup.

---

### What you'll have after this
- A permanent, shareable URL (`https://hostel-monarch.vercel.app` or your
  own custom domain later)
- Real accounts, real database, real admin approval flow
- A payment backend ready for real Razorpay keys whenever your KYC is approved
- Zero ongoing cost on free tiers (fine for a student project / demo; revisit
  if you get real paying users)
