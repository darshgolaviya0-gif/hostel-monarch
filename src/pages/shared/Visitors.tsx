import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, UserCheck, Phone, LogIn, LogOut, XCircle, CalendarClock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { useCurrentStudent } from '../../hooks/useCurrentStudent';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Avatar, EmptyState, SearchInput } from '../../components/ui/Misc';
import { formatDateIN } from '../../utils/format';

export default function Visitors({ variant }: { variant: 'student' | 'warden' | 'security' }) {
  const { user } = useAuth();
  const student = variant === 'student' ? useCurrentStudent() : null;
  const { visitors, registerVisitor, updateVisitorStatus } = useAppData();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  const scoped = variant === 'student' ? visitors.filter((v) => v.studentId === student?.id) : visitors;
  const filtered = scoped.filter((v) => v.visitorName.toLowerCase().includes(search.toLowerCase()) || v.studentName.toLowerCase().includes(search.toLowerCase()));
  const today = visitors.filter((v) => v.visitDate === '2026-10-04');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-950">{variant === 'student' ? 'My Visitors' : 'Visitor Management'}</h2>
          <p className="text-sm text-slate-500">{variant === 'security' ? 'Monitor and verify all visitor activity at the gate.' : variant === 'warden' ? 'Oversight of all visitor activity across the hostel.' : 'Pre-register visitors for a smooth gate experience.'}</p>
        </div>
        {variant === 'student' && <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>Pre-register Visitor</Button>}
      </div>

      {variant === 'security' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Today's Visitors" value={today.length} icon={<UserCheck className="h-5 w-5" />} tone="navy" />
          <StatCard label="Expected" value={today.filter((v) => v.status === 'Approved' || v.status === 'Pending').length} icon={<CalendarClock className="h-5 w-5" />} tone="gold" />
          <StatCard label="Checked In" value={today.filter((v) => v.status === 'Checked In').length} icon={<LogIn className="h-5 w-5" />} tone="emerald" />
          <StatCard label="Checked Out" value={today.filter((v) => v.status === 'Checked Out').length} icon={<LogOut className="h-5 w-5" />} tone="sky" />
        </div>
      )}

      {variant !== 'student' && <SearchInput value={search} onChange={setSearch} placeholder="Search visitors or students…" className="sm:w-80" />}

      {filtered.length === 0 ? (
        <EmptyState icon={<UserCheck className="h-7 w-7" />} title="No visitors found" message="No visitor records to display right now." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((v) => (
            <Card key={v.id} hover>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={v.visitorName} />
                  <div>
                    <p className="text-sm font-bold text-navy-950">{v.visitorName}</p>
                    <p className="text-xs text-slate-400">{v.relationship} of {v.studentName} · {v.room}</p>
                  </div>
                </div>
                <Badge status={v.status} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {v.phone}</p>
                <p className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> {formatDateIN(v.visitDate)}, {v.expectedTime}</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">Purpose: {v.purpose}</p>
              {(v.checkInTime || v.checkOutTime) && (
                <p className="mt-1 text-xs text-slate-400">
                  {v.checkInTime && `In: ${v.checkInTime}`} {v.checkOutTime && `· Out: ${v.checkOutTime}`}
                </p>
              )}
              {variant === 'security' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {v.status === 'Pending' && <Button size="sm" onClick={() => { updateVisitorStatus(v.id, 'Approved', user!.name); toast.success('Visitor approved.'); }}>Approve</Button>}
                  {v.status === 'Approved' && <Button size="sm" icon={<LogIn className="h-3.5 w-3.5" />} onClick={() => { updateVisitorStatus(v.id, 'Checked In', user!.name); toast.success('Visitor checked in.'); }}>Check In</Button>}
                  {v.status === 'Checked In' && <Button size="sm" variant="secondary" icon={<LogOut className="h-3.5 w-3.5" />} onClick={() => { updateVisitorStatus(v.id, 'Checked Out', user!.name); toast.success('Visitor checked out.'); }}>Check Out</Button>}
                  {(v.status === 'Pending' || v.status === 'Approved') && <Button size="sm" variant="outline" icon={<XCircle className="h-3.5 w-3.5" />} onClick={() => { updateVisitorStatus(v.id, 'Cancelled', user!.name); toast('Visitor entry cancelled.'); }}>Cancel</Button>}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {variant === 'student' && student && (
        <CreateVisitorModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreate={(v) => {
            registerVisitor({ ...v, studentId: student.id, studentName: student.name, room: student.allocation?.room ?? '—' });
            toast.success('Visitor pre-registered! Security has been notified.');
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

function CreateVisitorModal({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void;
  onCreate: (v: { visitorName: string; phone: string; relationship: string; visitDate: string; expectedTime: string; purpose: string }) => void;
}) {
  const [form, setForm] = useState({ visitorName: '', phone: '', relationship: 'Father', visitDate: '2026-10-06', expectedTime: '04:00 PM', purpose: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.visitorName.trim() || !form.phone.trim() || !form.purpose.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    onCreate(form);
    setForm({ visitorName: '', phone: '', relationship: 'Father', visitDate: '2026-10-06', expectedTime: '04:00 PM', purpose: '' });
  };

  return (
    <Modal open={open} onClose={onClose} title="Pre-register a Visitor">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-900">Visitor Name</label>
            <input value={form.visitorName} onChange={(e) => setForm({ ...form, visitorName: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="e.g. Kiran Patel" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-900">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="+91 98250 11234" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-900">Relationship</label>
          <input value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="e.g. Father" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-900">Visit Date</label>
            <input type="date" value={form.visitDate} onChange={(e) => setForm({ ...form, visitDate: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-900">Expected Time</label>
            <input value={form.expectedTime} onChange={(e) => setForm({ ...form, expectedTime: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="04:00 PM" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-900">Purpose of Visit</label>
          <input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="e.g. General visit" />
        </div>
        <Button type="submit" fullWidth>Pre-register Visitor</Button>
      </form>
    </Modal>
  );
}
