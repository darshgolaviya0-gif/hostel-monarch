// Thin client for the payment backend in /server. Mirrors the isLiveMode pattern
// already used for Supabase in src/lib/supabase.ts: the app automatically upgrades
// from the demo payment flow to a real Razorpay checkout the moment the backend
// reports that live keys are configured — no frontend code changes required.
//
// In local dev, Vite proxies `/api` to the backend on localhost:4000 (see
// vite.config.ts), so relative URLs just work. In production the frontend and
// backend are deployed to two different hosts (e.g. Vercel + Render), so
// VITE_API_BASE_URL must be set to the backend's real URL, e.g.
// "https://hostel-monarch-backend.onrender.com".

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export interface PaymentConfig {
  liveMode: boolean;
  keyId: string | null;
}

export async function fetchPaymentConfig(): Promise<PaymentConfig> {
  try {
    const res = await fetch(`${API_BASE}/api/payment-config`);
    if (!res.ok) return { liveMode: false, keyId: null };
    return await res.json();
  } catch {
    // Backend not running/unreachable — fall back to demo mode.
    return { liveMode: false, keyId: null };
  }
}

export interface CreateOrderPayload {
  amount: number;
  invoiceNo: string;
  studentId: string;
  studentName: string;
}

export interface CreateOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
  const res = await fetch(`${API_BASE}/api/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not create payment order.');
  return data;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function verifyPayment(payload: VerifyPaymentPayload): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.verified) throw new Error(data.error || 'Payment could not be verified.');
  return true;
}


let scriptPromise: Promise<boolean> | null = null;

/** Lazily injects Razorpay's Checkout script (loaded from their CDN — requires real network). */
export function loadRazorpayCheckout(): Promise<boolean> {
  if (typeof window !== 'undefined' && (window as any).Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  modal?: { ondismiss?: () => void };
}

export function openRazorpayCheckout(options: RazorpayCheckoutOptions) {
  const RazorpayCtor = (window as any).Razorpay;
  if (!RazorpayCtor) throw new Error('Razorpay checkout script is not loaded.');
  const rzp = new RazorpayCtor(options);
  rzp.open();
}
