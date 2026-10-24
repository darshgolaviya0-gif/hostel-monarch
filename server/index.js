// Hostel Monarch — Payment backend
// -----------------------------------------------------------------------------
// This is the ONLY piece of the system allowed to hold the Razorpay Key Secret.
// It never ships to the browser. The frontend only ever talks to it over HTTP.
//
// Endpoints:
//   GET  /api/payment-config        -> tells the frontend whether live payments are configured
//   POST /api/create-order          -> creates a Razorpay order server-side
//   POST /api/verify-payment        -> verifies a completed checkout's signature
//   POST /api/webhook/razorpay      -> Razorpay server-to-server payment confirmation
//
// Run locally:   node server/index.js   (reads server/.env — copy server/.env.example)
// Deploy:        any Node host (Render/Railway/Fly.io/a VPS) works — see LAUNCH_GUIDE.md.
// -----------------------------------------------------------------------------

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import Razorpay from 'razorpay';

const PORT = process.env.PORT || 4000;
const KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

const LIVE_PAYMENTS_ENABLED = Boolean(KEY_ID && KEY_SECRET);

const razorpay = LIVE_PAYMENTS_ENABLED
  ? new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET })
  : null;

const app = express();
app.use(cors());

// Webhook needs the raw request body to verify the HMAC signature, so it must be
// registered BEFORE the global JSON body parser below.
app.post('/api/webhook/razorpay', express.raw({ type: '*/*' }), (req, res) => {
  if (!LIVE_PAYMENTS_ENABLED || !WEBHOOK_SECRET) {
    return res.status(503).json({ error: 'Webhook not configured. Set RAZORPAY_WEBHOOK_SECRET.' });
  }
  const signature = req.headers['x-razorpay-signature'];
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(req.body).digest('hex');

  if (!signature || signature !== expected) {
    console.warn('[webhook] signature mismatch — rejected');
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid webhook payload' });
  }

  // This is the authoritative "payment really happened" signal — in a full production
  // build this is where you'd mark the matching invoice as Paid in your database
  // (idempotently, keyed by payload.payload.payment.entity.order_id), regardless of
  // whether the student's browser was still open. For now we just log it.
  console.log('[webhook] verified event:', payload.event, payload.payload?.payment?.entity?.id);
  return res.status(200).json({ received: true });
});

app.use(express.json());

app.get('/api/payment-config', (_req, res) => {
  res.json({
    liveMode: LIVE_PAYMENTS_ENABLED,
    keyId: LIVE_PAYMENTS_ENABLED ? KEY_ID : null,
  });
});

app.post('/api/create-order', async (req, res) => {
  if (!LIVE_PAYMENTS_ENABLED || !razorpay) {
    return res.status(503).json({ error: 'Payment gateway not configured on the server yet.' });
  }
  try {
    const { amount, invoiceNo, studentId, studentName } = req.body || {};
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({ error: 'A valid amount is required.' });
    }
    // NOTE: in this build the amount is supplied by the authenticated frontend session
    // (there is no persisted server-side invoice table yet — see LAUNCH_GUIDE.md "next step").
    // Before accepting real public traffic, move invoices into Supabase and look the
    // amount up here from the database instead of trusting the request body.
    const order = await razorpay.orders.create({
      amount: Math.round(amountNum * 100), // paise
      currency: 'INR',
      receipt: invoiceNo || `HM-${Date.now()}`,
      notes: { studentId: studentId || '', studentName: studentName || '' },
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: KEY_ID });
  } catch (err) {
    console.error('[create-order]', err);
    res.status(500).json({ error: 'Could not create payment order.' });
  }
});

app.post('/api/verify-payment', (req, res) => {
  if (!LIVE_PAYMENTS_ENABLED) {
    return res.status(503).json({ error: 'Payment gateway not configured on the server yet.' });
  }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment verification fields.' });
  }
  const expected = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expected !== razorpay_signature) {
    return res.status(400).json({ verified: false, error: 'Signature mismatch — payment could not be verified.' });
  }
  res.json({ verified: true, paymentId: razorpay_payment_id, orderId: razorpay_order_id });
});

app.listen(PORT, () => {
  console.log(`[hostel-monarch-payments] listening on :${PORT} — live mode: ${LIVE_PAYMENTS_ENABLED ? 'ON' : 'OFF (no Razorpay keys found)'}`);
});
