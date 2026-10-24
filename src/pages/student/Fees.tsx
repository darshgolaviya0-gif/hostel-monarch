import React, { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  Wallet, Receipt, Download, CheckCircle2, CreditCard, Smartphone, Building, Link2,
  ShieldCheck, Loader2, ArrowLeft, Printer, IndianRupee, GraduationCap, AlertCircle,
} from 'lucide-react';
import { useCurrentStudent } from '../../hooks/useCurrentStudent';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/ui/Misc';
import { cn } from '../../utils/cn';
import { formatDateIN, formatINR } from '../../utils/format';
import { fetchPaymentConfig, createOrder, verifyPayment, loadRazorpayCheckout, openRazorpayCheckout } from '../../lib/payments';
import type { Invoice, Payment, PaymentMethod } from '../../types';

type FlowStep = 'method' | 'qr' | 'processing' | 'success';

export default function StudentFees() {
  const student = useCurrentStudent();
  const { invoices, payInvoice } = useAppData();
  const myInvoices = invoices.filter((i) => i.studentId === student.id);

  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [step, setStep] = useState<FlowStep>('method');
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [gateway, setGateway] = useState<{ liveMode: boolean; keyId: string | null }>({ liveMode: false, keyId: null });
  const [processingLive, setProcessingLive] = useState(false);

  useEffect(() => {
    fetchPaymentConfig().then(setGateway);
  }, []);


  const totalDue = myInvoices.reduce((a, i) => a + (i.amount - i.paidAmount), 0);
  const totalPaid = myInvoices.reduce((a, i) => a + i.paidAmount, 0);
  const nextDue = myInvoices.filter((i) => i.status !== 'Paid').sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  const semesterGroups = useMemo(() => {
    const map = new Map<string, Invoice[]>();
    for (const inv of myInvoices) {
      const key = inv.semester;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(inv);
    }
    const order = (s: string) => {
      if (s === 'One-time') return 999;
      const n = parseInt(s.replace(/\D/g, ''), 10);
      return Number.isNaN(n) ? 500 : n;
    };
    return [...map.entries()]
      .sort((a, b) => order(a[0]) - order(b[0]))
      .map(([semester, invs]) => {
        const billed = invs.reduce((a, i) => a + i.amount, 0);
        const paid = invs.reduce((a, i) => a + i.paidAmount, 0);
        const pending = billed - paid;
        const dueDate = invs.filter((i) => i.status !== 'Paid').sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]?.dueDate;
        const period = invs[0]?.period ?? '';
        const allPaid = pending <= 0;
        return { semester, invs, billed, paid, pending, dueDate, period, allPaid };
      });
  }, [myInvoices]);

  const openPay = (inv: Invoice) => {
    setActiveInvoice(inv);
    setStep('method');
    setMethod('UPI');
  };

  const closeModal = () => setActiveInvoice(null);

  const proceedToQR = () => setStep('qr');

  const simulatePayment = () => {
    if (!activeInvoice) return;
    setStep('processing');
    setTimeout(() => {
      const amount = activeInvoice.amount - activeInvoice.paidAmount;
      const payment = payInvoice(activeInvoice.id, amount, method, student.name);
      setLastPayment(payment);
      setStep('success');
      toast.success('Payment successful! Receipt generated.');
    }, 1800);
  };

  const upiString = activeInvoice
    ? `upi://pay?pa=hostelmonarch@okhdfcbank&pn=HostelMonarch&am=${(activeInvoice.amount - activeInvoice.paidAmount).toFixed(2)}&cu=INR&tn=${activeInvoice.invoiceNo}`
    : '';

  /** Real Razorpay Checkout flow — used automatically whenever the backend reports live keys. */
  const payWithRealGateway = async (inv: Invoice) => {
    const amount = inv.amount - inv.paidAmount;
    setProcessingLive(true);
    const loadingToast = toast.loading('Opening secure checkout…');
    try {
      const order = await createOrder({
        amount,
        invoiceNo: inv.invoiceNo,
        studentId: student.id,
        studentName: student.name,
      });
      const scriptLoaded = await loadRazorpayCheckout();
      toast.dismiss(loadingToast);
      if (!scriptLoaded) {
        toast.error('Could not load the payment gateway. Check your connection and try again.');
        setProcessingLive(false);
        return;
      }
      openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Hostel Monarch',
        description: inv.title,
        prefill: { name: student.name },
        theme: { color: '#1f3366' },
        modal: { ondismiss: () => setProcessingLive(false) },
        handler: async (response) => {
          try {
            await verifyPayment(response);
            const payment = payInvoice(inv.id, amount, 'Razorpay Link', student.name);
            setLastPayment(payment);
            setActiveInvoice(inv);
            setShowReceipt(true);
            toast.success('Payment successful! Receipt generated.');
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Payment verification failed.');
          } finally {
            setProcessingLive(false);
          }
        },
      });
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err instanceof Error ? err.message : 'Could not start payment.');
      setProcessingLive(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2 text-slate-400"><Wallet className="h-4 w-4" /><p className="text-xs font-semibold uppercase">Total Due</p></div>
          <p className="mt-2 font-display text-2xl font-extrabold text-rose-600">{formatINR(totalDue)}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-slate-400"><CheckCircle2 className="h-4 w-4" /><p className="text-xs font-semibold uppercase">Total Paid (Term)</p></div>
          <p className="mt-2 font-display text-2xl font-extrabold text-emerald-600">{formatINR(totalPaid)}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-slate-400"><Receipt className="h-4 w-4" /><p className="text-xs font-semibold uppercase">Next Due Date</p></div>
          <p className="mt-2 font-display text-2xl font-extrabold text-navy-950">{nextDue ? formatDateIN(nextDue.dueDate) : '—'}</p>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Semester-wise Fees"
          subtitle={`How much ${student.semester ?? 'your'} fees cost, split by semester`}
          icon={<GraduationCap className="h-4.5 w-4.5" />}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {semesterGroups.map((g) => (
            <div
              key={g.semester}
              className={cn(
                'rounded-2xl border p-4',
                g.allPaid ? 'border-emerald-100 bg-emerald-50/40' : 'border-slate-200'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-sm font-extrabold text-navy-950">{g.semester}</p>
                  <p className="text-xs text-slate-400">{g.period}</p>
                </div>
                <Badge tone={g.allPaid ? 'success' : g.pending > 0 && g.dueDate && g.dueDate < '2026-10-04' ? 'danger' : 'warning'} dot={false}>
                  {g.allPaid ? 'Fully Paid' : 'Payment Due'}
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-white/70 p-2 ring-1 ring-slate-100">
                  <p className="text-[10px] uppercase text-slate-400">Total Fee</p>
                  <p className="mt-0.5 text-sm font-bold text-navy-950">{formatINR(g.billed)}</p>
                </div>
                <div className="rounded-lg bg-white/70 p-2 ring-1 ring-slate-100">
                  <p className="text-[10px] uppercase text-slate-400">Paid</p>
                  <p className="mt-0.5 text-sm font-bold text-emerald-600">{formatINR(g.paid)}</p>
                </div>
                <div className="rounded-lg bg-white/70 p-2 ring-1 ring-slate-100">
                  <p className="text-[10px] uppercase text-slate-400">To Pay</p>
                  <p className={cn('mt-0.5 text-sm font-bold', g.pending > 0 ? 'text-rose-600' : 'text-slate-400')}>{formatINR(Math.max(0, g.pending))}</p>
                </div>
              </div>

              <div className="mt-3">
                <ProgressBar value={g.billed ? Math.round((g.paid / g.billed) * 100) : 100} tone={g.allPaid ? 'emerald' : 'gold'} />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-400">{[...new Set(g.invs.map((i) => i.title.split(' — ')[0]))].join(' + ')}</span>
                {!g.allPaid && g.dueDate && (
                  <span className="flex items-center gap-1 font-semibold text-slate-500"><AlertCircle className="h-3 w-3" /> Due {formatDateIN(g.dueDate)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-2 p-5 sm:p-6">
          <CardHeader title="My Invoices" subtitle="Hostel & mess fee invoices for the current academic year" />
          <span className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold',
            gateway.liveMode ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
          )}>
            <ShieldCheck className="h-3.5 w-3.5" />
            {gateway.liveMode ? (gateway.keyId?.startsWith('rzp_live_') ? 'Live Payments via Razorpay' : 'Razorpay Test Mode') : 'Demo Payment Mode'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Period</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Paid</th>
                <th className="px-5 py-3">Due Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {myInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-navy-950">{inv.invoiceNo}</p>
                    <p className="text-xs text-slate-400">{inv.title}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{inv.period}</td>
                  <td className="px-5 py-3.5 font-semibold text-navy-950">{formatINR(inv.amount)}</td>
                  <td className="px-5 py-3.5 text-slate-500">{formatINR(inv.paidAmount)}</td>
                  <td className="px-5 py-3.5 text-slate-500">{formatDateIN(inv.dueDate)}</td>
                  <td className="px-5 py-3.5"><Badge status={inv.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    {inv.status === 'Paid' ? (
                      <Button size="sm" variant="outline" icon={<Download className="h-3.5 w-3.5" />} onClick={() => { setLastPayment(null); setActiveInvoice(inv); setShowReceipt(true); }}>
                        Receipt
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        loading={processingLive && activeInvoice?.id === inv.id}
                        onClick={() => {
                          if (gateway.liveMode) {
                            setActiveInvoice(inv);
                            payWithRealGateway(inv);
                          } else {
                            openPay(inv);
                          }
                        }}
                      >
                        Pay Now
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment flow modal */}
      <Modal
        open={!!activeInvoice && !showReceipt}
        onClose={closeModal}
        title={step === 'success' ? 'Payment Successful' : 'Pay Hostel Fee'}
        subtitle={activeInvoice ? `${activeInvoice.invoiceNo} · ${formatINR(activeInvoice.amount - activeInvoice.paidAmount)} due` : ''}
      >
        {activeInvoice && step === 'method' && (
          <div className="space-y-4">
            <div className="rounded-xl bg-navy-50 px-4 py-3 text-xs text-navy-700">
              <ShieldCheck className="mb-1 h-4 w-4" /> Secured by Razorpay (Sandbox/Demo Mode) — no real transaction will be processed.
            </div>
            <p className="text-sm font-semibold text-navy-900">Select Payment Method</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'UPI', label: 'UPI', icon: Smartphone },
                { id: 'Card', label: 'Debit / Credit Card', icon: CreditCard },
                { id: 'Net Banking', label: 'Net Banking', icon: Building },
                { id: 'Razorpay Link', label: 'Razorpay Payment Link', icon: Link2 },
              ] as { id: PaymentMethod; label: string; icon: React.ElementType }[]).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-left text-sm font-semibold transition ${
                    method === m.id ? 'border-navy-700 bg-navy-50 text-navy-900' : 'border-slate-200 text-slate-600 hover:border-navy-200'
                  }`}
                >
                  <m.icon className="h-4.5 w-4.5" /> {m.label}
                </button>
              ))}
            </div>
            <Button fullWidth onClick={proceedToQR} icon={<IndianRupee className="h-4 w-4" />}>
              Continue to Pay {formatINR(activeInvoice.amount - activeInvoice.paidAmount)}
            </Button>
          </div>
        )}

        {activeInvoice && step === 'qr' && (
          <div className="flex flex-col items-center text-center">
            <p className="text-sm font-semibold text-navy-900">Scan & Pay via {method}</p>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <QRCodeSVG value={upiString} size={176} fgColor="#0c1630" />
            </div>
            <p className="mt-3 text-xs text-slate-400">Dynamic payment QR · Demo Razorpay Order ID: ord_DEMO{activeInvoice.id}</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-navy-950">{formatINR(activeInvoice.amount - activeInvoice.paidAmount)}</p>
            <div className="mt-5 flex w-full gap-3">
              <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => setStep('method')}>Back</Button>
              <Button fullWidth onClick={simulatePayment}>I Have Paid — Confirm</Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center py-10 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-navy-700" />
            <p className="mt-4 text-sm font-semibold text-navy-900">Verifying your payment…</p>
            <p className="mt-1 text-xs text-slate-400">Please do not close this window.</p>
          </div>
        )}

        {activeInvoice && step === 'success' && lastPayment && (
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-navy-950">{formatINR(lastPayment.amount)} Paid Successfully</h3>
            <p className="mt-1 text-sm text-slate-500">Transaction ID: {lastPayment.transactionId}</p>
            <div className="mt-5 flex w-full gap-3">
              <Button variant="outline" fullWidth onClick={closeModal}>Close</Button>
              <Button fullWidth icon={<Receipt className="h-4 w-4" />} onClick={() => setShowReceipt(true)}>View Receipt</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Receipt modal */}
      {activeInvoice && (
        <ReceiptModal
          open={showReceipt}
          onClose={() => { setShowReceipt(false); setActiveInvoice(null); }}
          invoice={activeInvoice}
          payment={lastPayment}
          studentName={student.name}
        />
      )}
    </div>
  );
}

function ReceiptModal({ open, onClose, invoice, payment, studentName }: {
  open: boolean; onClose: () => void; invoice: Invoice; payment: Payment | null; studentName: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Payment Receipt" size="sm">
      <div id="receipt" className="rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-4">
          <div>
            <p className="font-display text-sm font-extrabold text-navy-950">HOSTEL MONARCH</p>
            <p className="text-[10px] text-slate-400">Smart Living. Seamless Management.</p>
          </div>
          <Badge tone="success" dot={false}>PAID</Badge>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <Row label="Student Name" value={studentName} />
          <Row label="Invoice Number" value={invoice.invoiceNo} />
          <Row label="Payment Date" value={payment?.date ?? formatDateIN(invoice.dueDate)} />
          <Row label="Amount Paid" value={formatINR(payment?.amount ?? invoice.paidAmount)} bold />
          <Row label="Payment Method" value={payment?.method ?? 'UPI'} />
          <Row label="Transaction ID" value={payment?.transactionId ?? `HM-TXN-${invoice.id}`} />
          <Row label="Status" value="Success" />
        </div>
        <p className="mt-4 border-t border-dashed border-slate-200 pt-3 text-center text-[10px] text-slate-400">
          This is a system-generated demo receipt from Hostel Monarch. No real payment was processed.
        </p>
      </div>
      <div className="mt-5 flex gap-3">
        <Button variant="outline" fullWidth icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Print</Button>
        <Button fullWidth icon={<Download className="h-4 w-4" />} onClick={() => toast.success('Receipt downloaded (demo).')}>Download PDF</Button>
      </div>
    </Modal>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={bold ? 'font-bold text-navy-950' : 'font-medium text-navy-900'}>{value}</span>
    </div>
  );
}
