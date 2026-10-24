import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldAlert, ClipboardList, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';

export default function MaintenanceDashboard() {
  const { user } = useAuth();
  const { complaints } = useAppData();

  const myTickets = complaints.filter((c) => c.assignedTo === user?.name || c.status === 'Open');
  const open = complaints.filter((c) => c.status === 'Open').length;
  const urgent = complaints.filter((c) => c.priority === 'Urgent' && c.status !== 'Closed').length;
  const assigned = complaints.filter((c) => c.status === 'Assigned' || c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-navy-950">Maintenance Dashboard — {user?.name.split(' ')[0]}</h2>
        <p className="mt-1 text-sm text-slate-500">Track, update and resolve assigned maintenance tickets.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open Tickets" value={open} icon={<Wrench className="h-5 w-5" />} tone="sky" />
        <StatCard label="Urgent Tickets" value={urgent} icon={<ShieldAlert className="h-5 w-5" />} tone="rose" />
        <StatCard label="Assigned to Me" value={assigned} icon={<ClipboardList className="h-5 w-5" />} tone="gold" />
        <StatCard label="Resolved" value={resolved} icon={<CheckCircle2 className="h-5 w-5" />} tone="emerald" />
      </div>

      <Card>
        <CardHeader title="Priority Queue" subtitle="Urgent & high priority tickets requiring attention" action={<Link to="/app/tickets" className="text-xs font-bold text-navy-700 hover:text-gold-600">View all tickets →</Link>} />
        <div className="space-y-3">
          {myTickets
            .slice()
            .sort((a, b) => (a.priority === 'Urgent' ? -1 : 1))
            .slice(0, 6)
            .map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 p-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-navy-900">#{c.ticketNo} — {c.title}</p>
                    <Badge status={c.priority} />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{c.room} · {c.category} · {c.createdAt}</p>
                </div>
                <Badge status={c.status} />
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
