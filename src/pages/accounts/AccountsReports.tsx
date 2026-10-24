import React from 'react';
import toast from 'react-hot-toast';
import { Download, Wallet, TrendingUp, PieChart as PieChartIcon, CreditCard } from 'lucide-react';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { CollectionAreaChart, DonutChart } from '../../components/charts/Charts';
import { MONTHLY_COLLECTION } from '../../data/fees';
import { formatINR } from '../../utils/format';
import { exportToCSV } from '../../utils/csv';

export default function AccountsReports() {
  const { invoices, payments } = useAppData();
  const totalCollection = payments.reduce((a, p) => a + p.amount, 0);
  const avgTicket = Math.round(totalCollection / (payments.length || 1));

  const methodSplit = Object.entries(
    payments.reduce<Record<string, number>>((acc, p) => {
      acc[p.method] = (acc[p.method] ?? 0) + p.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const statusSplit = Object.entries(
    invoices.reduce<Record<string, number>>((acc, i) => {
      acc[i.status] = (acc[i.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-950">Financial Reports</h2>
          <p className="text-sm text-slate-500">Deep-dive into hostel revenue, collection and payment trends.</p>
        </div>
        <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => { exportToCSV('hostel-monarch-financial-report.csv', payments); toast.success('Financial report exported.'); }}>
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Total Collection (Term)" value={formatINR(totalCollection)} icon={<Wallet className="h-5 w-5" />} tone="emerald" trend={8.2} trendLabel="vs last term" />
        <StatCard label="Average Transaction" value={formatINR(avgTicket)} icon={<TrendingUp className="h-5 w-5" />} tone="navy" />
        <StatCard label="Total Transactions" value={payments.length} icon={<CreditCard className="h-5 w-5" />} tone="gold" />
      </div>

      <Card>
        <CardHeader title="Collection vs Target" subtitle="Monthly trend (₹)" />
        <CollectionAreaChart data={MONTHLY_COLLECTION} />
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Payment Method Split" icon={<PieChartIcon className="h-4.5 w-4.5" />} />
          <DonutChart data={methodSplit} />
        </Card>
        <Card>
          <CardHeader title="Invoice Status Split" icon={<PieChartIcon className="h-4.5 w-4.5" />} />
          <DonutChart data={statusSplit} />
        </Card>
      </div>
    </div>
  );
}
