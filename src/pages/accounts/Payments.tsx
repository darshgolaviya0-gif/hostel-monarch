import React, { useState } from 'react';
import { Wallet, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppData } from '../../store/AppDataContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState, Pagination, SearchInput, Select } from '../../components/ui/Misc';
import { formatINR } from '../../utils/format';
import { exportToCSV } from '../../utils/csv';

const PAGE_SIZE = 8;

export default function Payments() {
  const { payments } = useAppData();
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = payments.filter((p) => {
    const matchSearch = p.studentName.toLowerCase().includes(search.toLowerCase()) || p.transactionId.toLowerCase().includes(search.toLowerCase());
    const matchMethod = method === 'all' || p.method === method;
    return matchSearch && matchMethod;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-950">Payments</h2>
          <p className="text-sm text-slate-500">Complete transaction log of all fee payments.</p>
        </div>
        <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => { exportToCSV('hostel-monarch-payments.csv', filtered); toast.success('Payments exported.'); }}>Export CSV</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by student or transaction ID…" className="sm:w-80" />
        <Select value={method} onChange={setMethod} ariaLabel="Filter by method" options={[{ value: 'all', label: 'All Methods' }, { value: 'UPI', label: 'UPI' }, { value: 'Card', label: 'Card' }, { value: 'Net Banking', label: 'Net Banking' }, { value: 'Razorpay Link', label: 'Razorpay Link' }, { value: 'Cash', label: 'Cash' }]} />
      </div>

      {paged.length === 0 ? (
        <EmptyState icon={<Wallet className="h-7 w-7" />} title="No payments found" message="No payments match this filter." />
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Transaction</th>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{p.transactionId}</td>
                    <td className="px-5 py-3.5 font-semibold text-navy-950">{p.studentName}</td>
                    <td className="px-5 py-3.5 font-semibold text-navy-950">{formatINR(p.amount)}</td>
                    <td className="px-5 py-3.5"><Badge tone="info" dot={false}>{p.method}</Badge></td>
                    <td className="px-5 py-3.5 text-slate-500">{p.date}</td>
                    <td className="px-5 py-3.5"><Badge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-5"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
        </Card>
      )}
    </div>
  );
}
