import React from 'react';
import { Link } from 'react-router-dom';
import {
  DoorOpen, Wallet, MessageSquareWarning, UtensilsCrossed, QrCode, UserPlus, FileWarning,
  Megaphone, Clock, ArrowRight, Receipt,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { useCurrentStudent } from '../../hooks/useCurrentStudent';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/Misc';
import { formatINR, formatDateIN, initials } from '../../utils/format';

export default function StudentDashboard() {
  const { user } = useAuth();
  const student = useCurrentStudent();
  const { invoices, complaints, leaves, notices, participation } = useAppData();

  const myInvoices = invoices.filter((i) => i.studentId === student.id);
  const totalDue = myInvoices.reduce((a, i) => a + (i.amount - i.paidAmount), 0);
  const myComplaints = complaints.filter((c) => c.studentId === student.id);
  const openComplaints = myComplaints.filter((c) => !['Resolved', 'Closed'].includes(c.status));
  const activeLeave = leaves.find((l) => l.studentId === student.id && ['Requested', 'Warden Review', 'Approved'].includes(l.status));
  const myParticipation = participation.find((p) => p.studentId === student.id);
  const pinnedNotices = notices.filter((n) => n.pinned).slice(0, 3);

  const quickActions = [
    { label: 'Pay Fees', icon: Wallet, to: '/app/fees', tone: 'bg-navy-900 text-gold-400' },
    { label: 'Apply Leave', icon: QrCode, to: '/app/leave', tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Create Complaint', icon: FileWarning, to: '/app/complaints', tone: 'bg-rose-50 text-rose-700' },
    { label: 'Visitor', icon: UserPlus, to: '/app/visitors', tone: 'bg-sky-50 text-sky-700' },
    { label: 'Mess Menu', icon: UtensilsCrossed, to: '/app/mess', tone: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="card-surface overflow-hidden p-0">
        <div className="brand-gradient flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-navy-300">Welcome back,</p>
            <h2 className="font-display text-2xl font-extrabold text-white">{student.name.split(' ')[0]} 👋</h2>
            <p className="mt-1 text-sm text-navy-200">{student.course} · {student.semester}</p>
          </div>
          {student.avatar ? (
            <img src={student.avatar} alt={student.name} className="h-16 w-16 rounded-2xl object-cover ring-4 ring-white/20" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold text-white ring-4 ring-white/20">
              {initials(student.name)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card hover>
          <div className="flex items-center gap-2 text-slate-400"><DoorOpen className="h-4 w-4" /><p className="text-xs font-semibold uppercase tracking-wide">Room</p></div>
          <p className="mt-2 font-display text-xl font-extrabold text-navy-950">{student.allocation?.room ?? '—'} / {student.allocation?.bed ?? '—'}</p>
          <p className="mt-1 text-xs text-slate-500">{student.allocation?.building}</p>
        </Card>
        <Card hover>
          <div className="flex items-center gap-2 text-slate-400"><Wallet className="h-4 w-4" /><p className="text-xs font-semibold uppercase tracking-wide">Fees</p></div>
          <p className="mt-2 font-display text-xl font-extrabold text-navy-950">{formatINR(totalDue)}</p>
          <Badge status={totalDue > 0 ? 'Pending' : 'Paid'} className="mt-1.5" />
        </Card>
        <Card hover>
          <div className="flex items-center gap-2 text-slate-400"><QrCode className="h-4 w-4" /><p className="text-xs font-semibold uppercase tracking-wide">Leave</p></div>
          <p className="mt-2 font-display text-base font-extrabold text-navy-950">{activeLeave ? activeLeave.type : 'No active request'}</p>
          {activeLeave && <Badge status={activeLeave.status} className="mt-1.5" />}
        </Card>
        <Card hover>
          <div className="flex items-center gap-2 text-slate-400"><MessageSquareWarning className="h-4 w-4" /><p className="text-xs font-semibold uppercase tracking-wide">Complaints</p></div>
          <p className="mt-2 font-display text-xl font-extrabold text-navy-950">{openComplaints.length} In Progress</p>
          <p className="mt-1 text-xs text-slate-500">{myComplaints.length} total raised</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Quick Actions" subtitle="Everything you need, one tap away" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {quickActions.map((a) => (
              <Link key={a.label} to={a.to} className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${a.tone}`}>
                  <a.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-navy-800">{a.label}</span>
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-navy-950">Profile Completion</p>
              <span className="text-sm font-bold text-navy-700">{student.profileCompletion}%</span>
            </div>
            <ProgressBar value={student.profileCompletion} tone="gold" />
            {student.profileCompletion < 100 && (
              <Link to="/app/profile" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy-700 hover:text-gold-600">
                Complete your profile <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Next Meal" icon={<UtensilsCrossed className="h-4.5 w-4.5" />} />
          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4">
            <Clock className="h-8 w-8 text-amber-600" />
            <div>
              <p className="font-display text-base font-extrabold text-navy-950">Dinner — 7:30 PM</p>
              <p className="text-xs text-slate-500">Paneer Butter Masala, Roti, Jeera Rice, Salad</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-xs text-slate-500">
            <p className="font-semibold text-navy-800">Your meal preferences today</p>
            <div className="flex flex-wrap gap-2">
              {myParticipation && (['breakfast', 'lunch', 'snacks', 'dinner'] as const).map((m) => (
                <Badge key={m} tone={myParticipation[m] ? 'success' : 'neutral'} dot={false}>
                  {m[0].toUpperCase() + m.slice(1)}: {myParticipation[m] ? 'Yes' : 'No'}
                </Badge>
              ))}
            </div>
          </div>
          <Link to="/app/mess" className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-navy-800 hover:bg-slate-50">
            Manage Mess Preferences <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent Activity" subtitle="Your latest complaints & requests" />
          <div className="space-y-3">
            {myComplaints.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600"><FileWarning className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">#{c.ticketNo} — {c.title}</p>
                    <p className="text-xs text-slate-400">{c.createdAt}</p>
                  </div>
                </div>
                <Badge status={c.status} />
              </div>
            ))}
            {myInvoices.slice(0, 1).map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700"><Receipt className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{i.invoiceNo} — {i.title}</p>
                    <p className="text-xs text-slate-400">Due {formatDateIN(i.dueDate)}</p>
                  </div>
                </div>
                <Badge status={i.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Pinned Notices" icon={<Megaphone className="h-4.5 w-4.5" />} />
          <div className="space-y-3">
            {pinnedNotices.map((n) => (
              <div key={n.id} className="rounded-xl border border-gold-200 bg-gold-50/50 p-3.5">
                <div className="flex items-center justify-between">
                  <Badge tone="gold" dot={false}>{n.category}</Badge>
                  <span className="text-[11px] text-slate-400">{formatDateIN(n.publishDate)}</span>
                </div>
                <p className="mt-1.5 text-sm font-semibold text-navy-950">{n.title}</p>
              </div>
            ))}
          </div>
          <Link to="/app/notices" className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-navy-800 hover:bg-slate-50">
            View All Notices <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>
    </div>
  );
}
