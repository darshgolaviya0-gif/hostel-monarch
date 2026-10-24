import React from 'react';
import { Link } from 'react-router-dom';
import { Users, CalendarCheck, UserCheck, MessageSquareWarning, Siren, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Misc';

export default function WardenDashboard() {
  const { user } = useAuth();
  const { students, leaves, visitors, complaints } = useAppData();

  const pendingLeaves = leaves.filter((l) => l.status === 'Requested' || l.status === 'Warden Review');
  const todaysVisitors = visitors.filter((v) => v.visitDate === '2026-10-04');
  const openComplaints = complaints.filter((c) => !['Resolved', 'Closed'].includes(c.status));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-navy-950">Welcome, {user?.name.split(' ')[0]} 👋</h2>
        <p className="mt-1 text-sm text-slate-500">Oversight dashboard for student discipline, leave and welfare.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={students.length} icon={<Users className="h-5 w-5" />} tone="navy" />
        <StatCard label="Pending Leave Requests" value={pendingLeaves.length} icon={<CalendarCheck className="h-5 w-5" />} tone="gold" />
        <StatCard label="Today's Visitors" value={todaysVisitors.length} icon={<UserCheck className="h-5 w-5" />} tone="sky" />
        <StatCard label="Open Complaints" value={openComplaints.length} icon={<MessageSquareWarning className="h-5 w-5" />} tone="rose" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Leave Requests Awaiting Review" action={<Link to="/app/leave-approvals" className="text-xs font-bold text-navy-700 hover:text-gold-600">Review all →</Link>} />
          <div className="space-y-3">
            {pendingLeaves.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5">
                <div className="flex items-center gap-3">
                  <Avatar name={l.studentName} />
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{l.studentName} · {l.room}</p>
                    <p className="text-xs text-slate-400">{l.type} · {l.startDate} to {l.endDate}</p>
                  </div>
                </div>
                <Badge status={l.status} />
              </div>
            ))}
            {pendingLeaves.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No pending leave requests.</p>}
          </div>
        </Card>

        <Card className="border-rose-100 bg-rose-50/30">
          <CardHeader title="Emergency Information" icon={<Siren className="h-4.5 w-4.5 text-rose-600" />} />
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-white p-3.5">
              <p className="font-semibold text-navy-950">Security Desk</p>
              <p className="text-slate-500">+91 90000 99999</p>
            </div>
            <div className="rounded-xl bg-white p-3.5">
              <p className="font-semibold text-navy-950">Nearest Hospital</p>
              <p className="text-slate-500">Surat City Hospital — 3.2 km</p>
            </div>
            <div className="rounded-xl bg-white p-3.5">
              <p className="font-semibold text-navy-950">Fire Safety Officer</p>
              <p className="text-slate-500">Mr. Jignesh Patel — +91 98250 10101</p>
            </div>
          </div>
          <Link to="/app/emergency" className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">
            Open Emergency Console <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>

      <Card>
        <CardHeader title="Today's Visitor Activity" action={<Link to="/app/warden-visitors" className="text-xs font-bold text-navy-700 hover:text-gold-600">View all →</Link>} />
        <div className="space-y-3">
          {todaysVisitors.map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5">
              <div>
                <p className="text-sm font-semibold text-navy-900">{v.visitorName} visiting {v.studentName}</p>
                <p className="text-xs text-slate-400">{v.room} · Expected {v.expectedTime}</p>
              </div>
              <Badge status={v.status} />
            </div>
          ))}
          {todaysVisitors.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No visitors scheduled today.</p>}
        </div>
      </Card>
    </div>
  );
}
