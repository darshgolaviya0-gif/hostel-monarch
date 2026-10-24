import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, BadgeIndianRupee, AlertTriangle, Receipt, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { CollectionAreaChart } from '../../components/charts/Charts';
import { MONTHLY_COLLECTION } from '../../data/fees';
import { formatINR } from '../../utils/format';

export default function AccountsDashboard() {
  const { user } = useAuth();
  const { invoices, payments } = useAppData();

  const totalCollection = payments.reduce((a, p) => a + p.amount, 0);
  const pending = invoices.reduce((a, i) => a + (i.amount - i.paidAmount), 0);
  const overdue = invoices.filter((i) => i.status === 'Overdue').reduce((a, i) => a + (i.amount - i.paidAmount), 0);
  const todaysPayments = payments.filter((p) => p.date.startsWith('2026-10-04'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-navy-950">Accounts Dashboard — {user?.name.split(' ')[0]}</h2>
        <p className="mt-1 text-sm text-slate-500">Monitor fee collection, dues and payment verification.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Collection" value={formatINR(totalCollection)} icon={<Wallet className="h-5 w-5" />} tone="emerald" trend={8.4} trendLabel="this term" />
        <StatCard label="Pending Fees" value={formatINR(pending)} icon={<BadgeIndianRupee className="h-5 w-5" />} tone="gold" />
        <StatCard label="Overdue Amount" value={formatINR(overdue)} icon={<AlertTriangle className="h-5 w-5" />} tone="rose" />
        <StatCard label="Today's Payments" value={todaysPayments.length} icon={<Receipt className="h-5 w-5" />} tone="sky" />
      </div>

      <Card>
        <CardHeader title="Collection vs Target" subtitle="Monthly trend (₹)" action={<Link to="/app/accounts-reports" className="text-xs font-bold text-navy-700 hover:text-gold-600">Full reports →</Link>} />
        <CollectionAreaChart data={MONTHLY_COLLECTION} />
      </Card>

      <Card>
        <CardHeader title="Recent Payments" action={<Link to="/app/payments" className="text-xs font-bold text-navy-700 hover:text-gold-600">View all →</Link>} />
        <div className="space-y-3">
          {payments.slice(0, 5).map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5">
              <div>
                <p className="text-sm font-semibold text-navy-900">{p.studentName} · {formatINR(p.amount)}</p>
                <p className="text-xs text-slate-400">{p.transactionId} · {p.method} · {p.date}</p>
              </div>
              <Badge status={p.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
