import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Receipt, Download, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/Modal';
import { EmptyState, Pagination, SearchInput, Select } from '../../components/ui/Misc';
import { formatDateIN, formatINR } from '../../utils/format';
import { exportToCSV } from '../../utils/csv';
import type { Invoice } from '../../types';

const PAGE_SIZE = 8;

export default function Invoices() {
  const { user } = useAuth();
  const { invoices, payInvoice } = useAppData();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [confirmTarget, setConfirmTarget] = useState<Invoice | null>(null);
  const [verifying, setVerifying] = useState(false);

  const filtered = invoices.filter((i) => {
    const matchSearch = i.studentName.toLowerCase().includes(search.toLowerCase()) || i.invoiceNo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'all' || i.status === status;
    return matchSearch && matchStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const confirmVerify = () => {
    if (!confirmTarget) return;
    setVerifying(true);
    setTimeout(() => {
      payInvoice(confirmTarget.id, confirmTarget.amount - confirmTarget.paidAmount, 'Cash', user!.name);
      toast.success('Payment manually verified and recorded.');
      setVerifying(false);
      setConfirmTarget(null);
    }, 800);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-950">Invoices</h2>
          <p className="text-sm text-slate-500">All student fee invoices across the hostel.</p>
        </div>
        <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => { exportToCSV('hostel-monarch-invoices.csv', filtered); toast.success('Invoices exported.'); }}>Export CSV</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={setSearch} placeholder="Search invoice or student…" className="sm:w-80" />
        <Select value={status} onChange={setStatus} ariaLabel="Filter by status" options={[{ value: 'all', label: 'All Status' }, { value: 'Paid', label: 'Paid' }, { value: 'Pending', label: 'Pending' }, { value: 'Partially Paid', label: 'Partially Paid' }, { value: 'Overdue', label: 'Overdue' }]} />
      </div>

      {paged.length === 0 ? (
        <EmptyState icon={<Receipt className="h-7 w-7" />} title="No invoices found" message="Try a different filter." />
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Due</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
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
                    <td className="px-5 py-3.5 font-semibold text-navy-950">{formatINR(inv.amount)}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDateIN(inv.dueDate)}</td>
                    <td className="px-5 py-3.5"><Badge status={inv.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      {inv.status !== 'Paid' && (
                        <Button size="sm" variant="outline" icon={<ShieldCheck className="h-3.5 w-3.5" />} onClick={() => setConfirmTarget(inv)}>Verify Payment</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-5"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
        </Card>
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={confirmVerify}
        title="Verify Payment"
        message={confirmTarget ? `Confirm that ${confirmTarget.studentName} has paid the remaining ${formatINR(confirmTarget.amount - confirmTarget.paidAmount)} for invoice ${confirmTarget.invoiceNo} via offline/cash payment.` : ''}
        confirmLabel="Confirm & Record Payment"
        loading={verifying}
      />
    </div>
  );
}
