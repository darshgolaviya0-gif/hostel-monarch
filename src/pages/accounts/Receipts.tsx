import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FileCheck2, Printer, Download } from 'lucide-react';
import { useAppData } from '../../store/AppDataContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState, SearchInput } from '../../components/ui/Misc';
import { formatINR } from '../../utils/format';
import type { Payment } from '../../types';

export default function Receipts() {
  const { payments } = useAppData();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Payment | null>(null);
  const filtered = payments.filter((p) => p.studentName.toLowerCase().includes(search.toLowerCase()) || p.transactionId.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-extrabold text-navy-950">Receipts</h2>
        <p className="text-sm text-slate-500">Generate and download official payment receipts for any transaction.</p>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search by student or transaction ID…" className="sm:w-96" />

      {filtered.length === 0 ? (
        <EmptyState icon={<FileCheck2 className="h-7 w-7" />} title="No receipts found" message="No matching payment records." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} hover>
              <div className="flex items-center justify-between">
                <Badge status={p.status} />
                <span className="text-xs text-slate-400">{p.date}</span>
              </div>
              <p className="mt-3 font-display text-lg font-extrabold text-navy-950">{formatINR(p.amount)}</p>
              <p className="text-sm text-slate-500">{p.studentName}</p>
              <p className="mt-1 font-mono text-xs text-slate-400">{p.transactionId}</p>
              <Button size="sm" variant="outline" className="mt-4" icon={<FileCheck2 className="h-3.5 w-3.5" />} onClick={() => setSelected(p)}>View Receipt</Button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Payment Receipt" size="sm">
        {selected && (
          <>
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-4">
                <div>
                  <p className="font-display text-sm font-extrabold text-navy-950">HOSTEL MONARCH</p>
                  <p className="text-[10px] text-slate-400">Smart Living. Seamless Management.</p>
                </div>
                <Badge status={selected.status} />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <Row label="Student Name" value={selected.studentName} />
                <Row label="Invoice Number" value={selected.invoiceNo} />
                <Row label="Payment Date" value={selected.date} />
                <Row label="Amount Paid" value={formatINR(selected.amount)} bold />
                <Row label="Payment Method" value={selected.method} />
                <Row label="Transaction ID" value={selected.transactionId} />
                <Row label="Verified By" value={selected.verifiedBy ?? '—'} />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" fullWidth icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Print</Button>
              <Button fullWidth icon={<Download className="h-4 w-4" />} onClick={() => toast.success('Receipt downloaded (demo).')}>Download PDF</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
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
