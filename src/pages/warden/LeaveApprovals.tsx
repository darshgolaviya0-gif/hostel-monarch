import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarRange, MapPin, Phone, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar, EmptyState } from '../../components/ui/Misc';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { formatDateIN } from '../../utils/format';
import type { LeaveRequest } from '../../types';

export default function LeaveApprovals() {
  const { user } = useAuth();
  const { leaves, reviewLeave } = useAppData();
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [target, setTarget] = useState<{ leave: LeaveRequest; approve: boolean } | null>(null);
  const [remark, setRemark] = useState('');

  const pending = leaves.filter((l) => l.status === 'Requested' || l.status === 'Warden Review');
  const list = tab === 'pending' ? pending : leaves;

  const confirm = () => {
    if (!target) return;
    reviewLeave(target.leave.id, target.approve, user!.name, remark || (target.approve ? 'Approved by warden.' : 'Rejected by warden.'));
    toast.success(target.approve ? 'Leave approved & QR pass generated.' : 'Leave request rejected.');
    setTarget(null);
    setRemark('');
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-extrabold text-navy-950">Leave Approvals</h2>
        <p className="text-sm text-slate-500">Review and approve student leave requests.</p>
      </div>

      <Tabs tabs={[{ id: 'pending', label: 'Pending', badge: pending.length }, { id: 'all', label: 'All Requests' }]} onChange={(id) => setTab(id as 'pending' | 'all')} />

      {list.length === 0 ? (
        <EmptyState icon={<CalendarRange className="h-7 w-7" />} title="No requests to review" message="All leave requests have been processed." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {list.map((l) => (
            <Card key={l.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={l.studentName} />
                  <div>
                    <p className="text-sm font-bold text-navy-950">{l.studentName}</p>
                    <p className="text-xs text-slate-400">{l.room} · {l.type}</p>
                  </div>
                </div>
                <Badge status={l.status} />
              </div>
              <div className="mt-3 space-y-1.5 text-sm text-slate-500">
                <p className="flex items-center gap-1.5"><CalendarRange className="h-3.5 w-3.5" /> {formatDateIN(l.startDate)} – {formatDateIN(l.endDate)}</p>
                <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {l.destination}</p>
                <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {l.emergencyContact}</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">"{l.reason}"</p>
              {(l.status === 'Requested' || l.status === 'Warden Review') && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="danger" icon={<XCircle className="h-4 w-4" />} onClick={() => setTarget({ leave: l, approve: false })}>Reject</Button>
                  <Button size="sm" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => setTarget({ leave: l, approve: true })}>Approve</Button>
                </div>
              )}
              {l.reviewRemark && <p className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-500">{l.reviewRemark}</p>}
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!target} onClose={() => setTarget(null)} title={target?.approve ? 'Approve Leave Request' : 'Reject Leave Request'}>
        <p className="text-sm text-slate-600">
          {target?.approve
            ? `This will approve ${target?.leave.studentName}'s leave and automatically generate a digital QR gate pass.`
            : `This will reject ${target?.leave.studentName}'s leave request.`}
        </p>
        <textarea
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          rows={3}
          placeholder="Add a remark (optional)…"
          className="mt-4 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100"
        />
        <div className="mt-5 flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setTarget(null)}>Cancel</Button>
          <Button fullWidth variant={target?.approve ? 'primary' : 'danger'} onClick={confirm}>
            {target?.approve ? 'Confirm Approval' : 'Confirm Rejection'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
