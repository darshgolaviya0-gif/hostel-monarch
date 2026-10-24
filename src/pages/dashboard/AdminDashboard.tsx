import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, BadgeIndianRupee, MessageSquareWarning, ArrowRight, History } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { CollectionAreaChart, DonutChart } from '../../components/charts/Charts';
import { MONTHLY_COLLECTION } from '../../data/fees';
import { COMPLAINT_STATUS_SPLIT } from '../../data/analytics';
import { formatINR } from '../../utils/format';
import { groupIntoBuildings, roomOccupancy } from '../../utils/rooms';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { students, rooms, invoices, complaints, auditLogs } = useAppData();

  const activeStudents = students.filter((s) => s.status === 'Active').length;
  const beds = rooms.flatMap((r) => r.beds);
  const occupied = beds.filter((b) => b.status === 'Occupied').length;
  const occupancyRate = Math.round((occupied / beds.length) * 100);
  const pendingFees = invoices.reduce((a, i) => a + (i.amount - i.paidAmount), 0);
  const openComplaints = complaints.filter((c) => !['Resolved', 'Closed'].includes(c.status)).length;

  const buildings = groupIntoBuildings(rooms);
  const occupancyByBuilding = buildings.map((b) => {
    const allBeds = b.floors.flatMap((f) => f.rooms.flatMap((r) => r.beds));
    return {
      name: b.name.split(' ')[0],
      occupied: allBeds.filter((bd) => bd.status === 'Occupied').length,
      available: allBeds.filter((bd) => bd.status === 'Available').length,
    };
  });
  void roomOccupancy;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-400">{new Date('2026-10-04').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <h2 className="font-display text-2xl font-extrabold text-navy-950">Good morning, {user?.name.split(' ')[0]} 👋</h2>
        <p className="mt-1 text-sm text-slate-500">Here's what's happening across Hostel Monarch today.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={activeStudents} icon={<Users className="h-5 w-5" />} trend={4.2} trendLabel="vs last month" tone="navy" />
        <StatCard label="Room Occupancy" value={`${occupancyRate}%`} icon={<Building2 className="h-5 w-5" />} trend={2.1} trendLabel="vs last month" tone="gold" />
        <StatCard label="Pending Fees" value={formatINR(pendingFees)} icon={<BadgeIndianRupee className="h-5 w-5" />} trend={-3.4} trendLabel="vs last month" tone="rose" />
        <StatCard label="Open Complaints" value={openComplaints} icon={<MessageSquareWarning className="h-5 w-5" />} trend={-6.8} trendLabel="vs last month" tone="sky" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Fee Collection Trend" subtitle="Monthly collected vs target (₹)" />
          <CollectionAreaChart data={MONTHLY_COLLECTION} />
        </Card>
        <Card>
          <CardHeader title="Complaint Status Split" subtitle="All-time tickets" />
          <DonutChart data={COMPLAINT_STATUS_SPLIT} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Building-wise Occupancy" subtitle="Beds occupied vs available" action={<Link to="/app/rooms" className="text-xs font-bold text-navy-700 hover:text-gold-600">Manage Rooms →</Link>} />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {occupancyByBuilding.map((b) => {
              const total = b.occupied + b.available;
              const pct = Math.round((b.occupied / total) * 100);
              return (
                <div key={b.name} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-navy-950">{b.name} Bhavan</p>
                    <span className="text-sm font-bold text-gold-600">{pct}%</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-navy-800" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-slate-500">
                    <span>{b.occupied} Occupied</span>
                    <span>{b.available} Available</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent Activity" icon={<History className="h-4.5 w-4.5" />} action={<Link to="/app/audit-trail" className="text-xs font-bold text-navy-700 hover:text-gold-600">View all</Link>} />
          <div className="space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-2 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-navy-900">{log.action}</p>
                  <p className="text-xs text-slate-400">{log.user} · {log.date}, {log.time}</p>
                </div>
                <Badge status={log.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/app/students" className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-950">
          Manage Students <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/app/admissions" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-navy-800 hover:bg-slate-50">
          Review Admissions <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/app/reports" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-navy-800 hover:bg-slate-50">
          View Full Reports <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
