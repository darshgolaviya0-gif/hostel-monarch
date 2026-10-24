# Hostel Monarch — Going Live: Real Accounts, Real Payments, Real Launch

This is your roadmap to take Hostel Monarch from "demo app" to a real product used by real staff and
real students, with real money moving through it. It's organized as phases — do them roughly in order,
but Phases A–C can run in parallel with nothing else blocking you.

Your two big technical facts to remember throughout:
1. **Auth is already real** — the app has a working Supabase-based signup/login/approval system
   (see `LIVE_MODE.md`). It's just switched off because there's no `.env` file yet. Flipping it on
   is mostly configuration, not new code.
2. **Payments cannot be "real" with frontend code alone.** A payment gateway's *secret key* must never
   sit in browser-shipped code — if it did, anyone could mint their own "successful payments". Real
   payments require a small server-side piece (a couple of serverless functions) in addition to the
   gateway account itself. This is why it needs its own phase below.

---

## Phase A — Business & legal basics (start this first — it has the longest lead time)

Payment gateways (Razorpay, Cashfree, PayU, etc.) are RBI-regulated and **must KYC you** before handing
over live keys. Typical requirements:

- **A legal identity to register as**: easiest is a **Sole Proprietorship** (you, trading as "Hostel
  Monarch") — no separate incorporation needed. A Pvt Ltd/LLP is more credible/scalable but adds cost
  and compliance; not required to start.
- **PAN** (personal PAN is fine for a proprietorship).
- **A bank account** in the business/proprietor's name where settlements will land. A current account
  is preferred but some gateways accept a savings account for proprietorships under their "Individual/
  Proprietorship" KYC tier.
- **GST registration** — only mandatory once turnover crosses the threshold (currently ₹20L/yr for
  services in most states) or if you want to issue GST invoices. Not required just to activate a
  payment gateway in most cases — check the specific gateway's current tier requirements.
- **Address proof** for the business/proprietor.

👉 Action this week: decide proprietorship vs company, get PAN + bank account ready, and gather address
proof scans. This typically unlocks everything else.

---

## Phase B — Domain name & business email

1. Buy a domain (e.g. `hostelmonarch.in` or `.com`) via Namecheap, GoDaddy, or BigRock (~₹500–1500/yr).
2. Set up a professional inbox for it — Zoho Mail (free tier) or Google Workspace — e.g.
   `support@hostelmonarch.in`. Gateways and users expect a working business email + phone number.

---

## Phase C — Mandatory legal pages on the live site

Before any gateway will approve live keys, your **public website must already have live, linked**:

- Privacy Policy
- Terms & Conditions
- Refund / Cancellation Policy (hostel fee refund rules, deposit rules, etc.)
- Contact Us (real email, phone, address — "Surat, Gujarat" can stay as the placeholder address
  until you have a finalized one)

I can draft all four of these for you as real pages in the app once you're ready — just ask.

---

## Phase D — Real authentication go-live (mostly flipping switches)

1. Create a free Supabase project at supabase.com.
2. In the SQL editor, run the existing `supabase/schema.sql` from this repo — it already defines the
   `profiles` table, roles, RLS policies, and the `handle_new_user` trigger.
3. In Supabase → Authentication → URL Configuration, set **Site URL** and **Redirect URLs** to your
   real production domain (you'll finalize this after Phase F).
4. (Recommended once you have real users) Connect a custom SMTP provider (Resend, Postmark, SendGrid —
   all have generous free tiers) under Authentication → SMTP Settings, so confirmation/reset emails
   don't hit Supabase's low default sending limits.
5. Create your `.env` file locally (and the equivalent env vars in your hosting provider — see Phase F)
   with:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
   This is the exact switch documented in `LIVE_MODE.md` that takes the app out of Demo Mode.
6. Sign up normally as yourself, then promote your account to admin with the one-time SQL in
   `LIVE_MODE.md`:
   ```sql
   update profiles set role='admin', status='approved' where email='you@example.com';
   ```
7. From then on, real staff and students self-register and admins approve them from the Approvals page
   — exactly as already built.

**Nothing in the current codebase needs to change for this phase** — it's configuration only.

---

## Phase E — Real payments ✅ backend already built, just needs your keys

### E.1 What's already in this repo
A real payment backend now lives in `server/index.js` (a small Express server), with the frontend already
wired to use it automatically. You don't need to write any more code for this — you just need a Razorpay
account and to drop your keys into one file.

- `GET /api/payment-config` — tells the frontend whether live keys are configured.
- `POST /api/create-order` — creates a real Razorpay order server-side.
- `POST /api/verify-payment` — recomputes the HMAC signature server-side so a payment can't be faked.
- `POST /api/webhook/razorpay` — verifies Razorpay's server-to-server payment confirmation.

The **Key Secret never reaches the browser** — only `server/index.js` ever sees it, read from
`server/.env` (copy `server/.env.example` to get started).

`src/pages/student/Fees.tsx` already auto-detects the backend's config on load:
- **No keys configured** (today's state): the page shows a "Demo Payment Mode" badge and keeps the
  existing demo QR/confirm flow exactly as before — nothing breaks.
- **Keys configured**: the page automatically switches to a real Razorpay Checkout popup, verifies the
  payment server-side, and only then marks the invoice Paid. No further code changes needed — it's a
  pure config flip.

### E.2 What you need to do
1. Choose a gateway — **Razorpay** is the standard pick for an India-based hostel (UPI, cards, netbanking,
   wallets, straightforward proprietorship KYC). Cashfree/PayU/Instamojo are reasonable alternatives but
   the code above is Razorpay-specific.
2. Sign up at razorpay.com. You get **Test Mode keys immediately**, before KYC finishes — good enough to
   fully test the real flow end-to-end right now.
3. Copy `server/.env.example` to `server/.env` and paste in `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`
   from Dashboard → Settings → API Keys.
4. Run the backend alongside the app: `npm run server` (keep it running in its own terminal/process,
   alongside `npm run dev`).
5. Reload the Fees page — the badge should flip to "Razorpay Test Mode" and "Pay Now" will open the real
   Razorpay Checkout widget (using test card/UPI numbers from Razorpay's docs — no real money moves in
   test mode).
6. Once KYC is approved, swap the test keys in `server/.env` for your live keys (`rzp_live_...`) — same
   file, same restart, nothing else changes. That's the moment real money starts flowing.
7. For the webhook (`RAZORPAY_WEBHOOK_SECRET`): once your backend has a real public URL (Phase F), create
   a webhook in Razorpay Dashboard → Account & Settings → Webhooks pointing at
   `https://your-backend-domain/api/webhook/razorpay`, and paste the secret it gives you into `server/.env`.

### E.3 One honest limitation to know about
Right now, invoice amounts are only tracked in the app's in-memory demo data (there is no persisted
invoices database yet — see Phase D for what *is* persisted, which is just accounts). The payment
backend currently trusts the amount sent by the logged-in student's browser when creating an order. This
is fine for testing and even for a careful soft-launch, but **before trusting this with a large volume of
real strangers' money**, the next hardening step is to move `invoices`/`payments` into real Supabase
tables so the backend can look up the authoritative amount itself instead of trusting the request. Ask me
to do this whenever you're ready — it's a contained, well-scoped piece of work (two tables + rewiring the
fee-related functions in `AppDataContext.tsx`), not a rewrite of the whole app.

---

## Phase F — Deployment (frontend + backend are two separate little deployments)

Because the payment backend (`server/index.js`) is a small standalone Express server (not a Vercel-style
serverless function), the simplest real-world setup is: **frontend on Vercel/Netlify, backend on a small
Node host.**

**Frontend:**
1. Push this repo to a **private GitHub repository** (double-check `.env` and `server/.env` are
   gitignored — they already are).
2. Import the repo into **Vercel** or **Netlify**. Build command `npm run build`, output directory `dist`.
3. Add the Phase D env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the host's dashboard.
4. Add your custom domain (Phase B) and update DNS at your registrar. HTTPS is automatic.

**Backend (`server/`):**
1. Deploy it to a small Node host — **Render** or **Railway** both have simple free/cheap tiers that are
   a good fit for this (point them at the `server/` folder, start command `node index.js`).
2. Set its environment variables there (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
   `RAZORPAY_WEBHOOK_SECRET`) — never in the frontend host, never in git.
3. Note the backend's public URL (e.g. `https://hostel-monarch-api.onrender.com`).
4. On the frontend host, add a rewrite/proxy so requests to `/api/*` forward to that backend URL (Vercel:
   a `rewrites` rule in `vercel.json`; Netlify: a redirect rule in `netlify.toml`) — this keeps the
   frontend code unchanged (it already just calls relative `/api/...` paths).
5. Point the Razorpay webhook (Phase E.2 step 7) at the backend's real public URL.
6. Go back to Supabase Auth settings and point Site URL / Redirect URLs at the final frontend domain.

⚠️ Note: Vercel's/Netlify's free tiers restrict usage to personal/non-commercial projects. For a paid,
commercial hostel product, budget for a paid plan (Vercel Pro ~$20/mo or equivalent) before public launch.

---

## Phase G — Pre-launch testing checklist

- [ ] Full signup → admin approval → login flow works on the real domain (not just localhost).
- [ ] Password reset email actually arrives and works end-to-end.
- [ ] Full fee payment flow works in Razorpay **test mode**: pay → webhook fires → invoice flips to
      Paid in Supabase → receipt downloadable.
- [ ] Confirm a student can only ever see their own data (RLS policies), not another student's.
- [ ] Mobile responsiveness check (the UI is already responsive, but test on a real phone).
- [ ] Legal pages (Phase C) are live and linked from the footer/signup flow.

## Phase H — Go live

1. Swap Razorpay test keys for **live keys** in Vercel's env vars only after KYC is approved.
2. Do one real ₹1–₹10 test transaction yourself before telling anyone else to use it.
3. Set up basic monitoring: Vercel's built-in analytics/logs, and optionally Sentry for error alerts.
4. Set up Supabase backups (automatic on paid plans; otherwise schedule manual exports).
5. Put a real support contact (phone/WhatsApp/email) somewhere visible for payment issues.
6. Roll out to a small group first (e.g., one floor/batch) before the whole hostel, and watch the first
   batch of real transactions closely.

---

## Rough ongoing costs (India, small-to-mid scale)

| Item | Approx. cost |
|---|---|
| Domain | ₹500–1500/yr |
| Supabase | Free to start → $25/mo Pro as data/usage grows |
| Vercel | Free (personal) → $20/mo Pro (required for commercial use) |
| Razorpay | No monthly fee, ~2% per transaction |
| Transactional email (Resend/Postmark) | Free tier covers early-stage volume |
| GST registration | Only if/when turnover requires it |

---

## Current status (updated)

- ✅ Legal pages (Privacy, Terms, Refund Policy) are live at `/privacy`, `/terms`, `/refund-policy` and
  linked from the site footer.
- ✅ Real payment backend is built (`server/index.js`) and the Fees page auto-switches between demo and
  real Razorpay Checkout based on whether keys are configured. See Phase E.2 for the exact steps to turn
  it on.
- ✅ Real account creation (Supabase auth/signup/approval) is fully built — it only needs a Supabase
  project + `.env` (Phase D) to switch on. This is a 5–10 minute task on supabase.com.
- ⏳ Still needed from you: a Supabase project (free), a Razorpay account (free to sign up, test keys
  instant), and — before real public launch — the business/KYC/domain/legal items in Phases A–C.

## Suggested order of operations starting today

1. **Today, 10 minutes:** Create a free Supabase project, run `supabase/schema.sql` in its SQL editor,
   and either send me the Project URL + anon key or drop them into `.env` yourself (Phase D). This turns
   on real student/staff signup and admin approval immediately, in this same preview.
2. **Today, 5 minutes:** Sign up at razorpay.com and grab your **test-mode** keys (no KYC needed yet).
   Drop them into `server/.env` and run `npm run server` — the Fees page will instantly start using real
   Razorpay Checkout in test mode.
3. **This week:** Decide proprietorship vs company, gather PAN/bank/address docs (Phase A). Buy a domain
   (Phase B).
4. Once KYC clears and the domain/hosting is ready, we do Phase F–H together to actually flip the switch
   to the public internet with live (real-money) keys.

Just come back whenever you're ready for the next concrete step (e.g., "here are my Supabase keys" or
"migrate invoices into Supabase next") and I'll pick up exactly from there.
