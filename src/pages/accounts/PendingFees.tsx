import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, BellRing } from 'lucide-react';
import { useAppData } from '../../store/AppDataContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar, EmptyState } from '../../components/ui/Misc';
import { formatDateIN, formatINR } from '../../utils/format';

export default function PendingFees() {
  const { invoices } = useAppData();
  const pending = invoices.filter((i) => i.status !== 'Paid').sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-extrabold text-navy-950">Pending Fees</h2>
        <p className="text-sm text-slate-500">All students with outstanding dues, sorted by urgency.</p>
      </div>

      {pending.length === 0 ? (
        <EmptyState icon={<AlertTriangle className="h-7 w-7" />} title="All fees collected" message="No pending dues at this time." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {pending.map((inv) => (
            <Card key={inv.id} hover className={inv.status === 'Overdue' ? 'border-rose-200 bg-rose-50/30' : ''}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={inv.studentName} />
                  <div>
                    <p className="text-sm font-bold text-navy-950">{inv.studentName}</p>
                    <p className="text-xs text-slate-400">{inv.room} · {inv.invoiceNo}</p>
                  </div>
                </div>
                <Badge status={inv.status} />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-500">Due {formatDateIN(inv.dueDate)}</span>
                <span className="font-display font-extrabold text-rose-600">{formatINR(inv.amount - inv.paidAmount)}</span>
              </div>
              <Button size="sm" variant="outline" className="mt-3" icon={<BellRing className="h-3.5 w-3.5" />} onClick={() => toast.success(`Reminder sent to ${inv.studentName}.`)}>
                Send Reminder
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
