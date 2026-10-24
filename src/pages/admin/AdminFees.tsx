import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Wallet, BadgeIndianRupee, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SearchInput, Select, Pagination } from '../../components/ui/Misc';
import { CollectionAreaChart } from '../../components/charts/Charts';
import { MONTHLY_COLLECTION } from '../../data/fees';
import { formatDateIN, formatINR } from '../../utils/format';
import { exportToCSV } from '../../utils/csv';

const PAGE_SIZE = 7;

export default function AdminFees() {
  const { invoices } = useAppData();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [semester, setSemester] = useState('all');
  const [page, setPage] = useState(1);

  const totalCollected = invoices.reduce((a, i) => a + i.paidAmount, 0);
  const totalDue = invoices.reduce((a, i) => a + (i.amount - i.paidAmount), 0);
  const overdueCount = invoices.filter((i) => i.status === 'Overdue').length;
  const paidCount = invoices.filter((i) => i.status === 'Paid').length;
  const semesterOptions = [...new Set(invoices.map((i) => i.semester))].sort();

  const filtered = invoices.filter((i) => {
    const matchSearch = i.studentName.toLowerCase().includes(search.toLowerCase()) || i.invoiceNo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'all' || i.status === status;
    const matchSemester = semester === 'all' || i.semester === semester;
    return matchSearch && matchStatus && matchSemester;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-950">Fees Overview</h2>
          <p className="text-sm text-slate-500">Hostel-wide fee collection and dues tracking.</p>
        </div>
        <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => { exportToCSV('hostel-monarch-invoices.csv', filtered); toast.success('Invoices exported to CSV.'); }}>
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Collected" value={formatINR(totalCollected)} icon={<Wallet className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Total Due" value={formatINR(totalDue)} icon={<BadgeIndianRupee className="h-5 w-5" />} tone="gold" />
        <StatCard label="Overdue Invoices" value={overdueCount} icon={<AlertTriangle className="h-5 w-5" />} tone="rose" />
        <StatCard label="Fully Paid" value={paidCount} icon={<CheckCircle2 className="h-5 w-5" />} tone="sky" />
      </div>

      <Card>
        <CardHeader title="Collection Trend" subtitle="Monthly collected vs target" />
        <CollectionAreaChart data={MONTHLY_COLLECTION} />
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by student or invoice no…" className="sm:w-80" />
        <Select value={status} onChange={setStatus} ariaLabel="Filter by status" options={[{ value: 'all', label: 'All Status' }, { value: 'Paid', label: 'Paid' }, { value: 'Pending', label: 'Pending' }, { value: 'Partially Paid', label: 'Partially Paid' }, { value: 'Overdue', label: 'Overdue' }]} />
        <Select value={semester} onChange={setSemester} ariaLabel="Filter by semester" options={[{ value: 'all', label: 'All Semesters' }, ...semesterOptions.map((s) => ({ value: s, label: s }))]} />
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Semester</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Paid</th>
                <th className="px-5 py-3">Due Date</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-navy-950">{inv.invoiceNo}</p>
                    <p className="text-xs text-slate-400">{inv.title}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{inv.studentName} <span className="text-xs text-slate-400">({inv.room})</span></td>
                  <td className="px-5 py-3.5"><Badge tone="info" dot={false}>{inv.semester}</Badge></td>
                  <td className="px-5 py-3.5 font-semibold text-navy-950">{formatINR(inv.amount)}</td>
                  <td className="px-5 py-3.5 text-slate-500">{formatINR(inv.paidAmount)}</td>
                  <td className="px-5 py-3.5 text-slate-500">{formatDateIN(inv.dueDate)}</td>
                  <td className="px-5 py-3.5"><Badge status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-5"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
      </Card>
    </div>
  );
}
