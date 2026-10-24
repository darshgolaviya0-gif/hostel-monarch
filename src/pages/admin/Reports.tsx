import React from 'react';
import toast from 'react-hot-toast';
import { Users, Building2, BadgeIndianRupee, MessageSquareWarning, UserCheck, CalendarRange, UtensilsCrossed, BedDouble, Download } from 'lucide-react';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { CollectionAreaChart, DonutChart, AdmissionsLineChart, MealTrendChart } from '../../components/charts/Charts';
import { MONTHLY_COLLECTION } from '../../data/fees';
import { MONTHLY_ADMISSIONS, COMPLAINT_DISTRIBUTION } from '../../data/analytics';
import { MEAL_TREND } from '../../data/mess';
import { formatINR } from '../../utils/format';
import { exportToCSV } from '../../utils/csv';

export default function Reports() {
  const { students, rooms, invoices, complaints, visitors, leaves, participation, auditLogs } = useAppData();

  const beds = rooms.flatMap((r) => r.beds);
  const occupied = beds.filter((b) => b.status === 'Occupied').length;
  const available = beds.filter((b) => b.status === 'Available').length;
  const pendingFees = invoices.reduce((a, i) => a + (i.amount - i.paidAmount), 0);
  const openComplaints = complaints.filter((c) => !['Resolved', 'Closed'].includes(c.status)).length;
  const todaysVisitors = visitors.filter((v) => v.visitDate === '2026-10-04').length;
  const activeLeaves = leaves.filter((l) => l.status === 'Requested' || l.status === 'Warden Review').length;
  const mealParticipationRate = Math.round((participation.filter((p) => p.dinner).length / participation.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-950">Reports & Analytics</h2>
          <p className="text-sm text-slate-500">Hostel-wide performance overview for October 2026.</p>
        </div>
        <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => { exportToCSV('hostel-monarch-audit-log.csv', auditLogs); toast.success('Report exported to CSV.'); }}>
          Export Audit Log CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Students" value={students.length} icon={<Users className="h-5 w-5" />} tone="navy" />
        <StatCard label="Occupied Beds" value={occupied} icon={<BedDouble className="h-5 w-5" />} tone="gold" />
        <StatCard label="Available Beds" value={available} icon={<Building2 className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Pending Fees" value={formatINR(pendingFees)} icon={<BadgeIndianRupee className="h-5 w-5" />} tone="rose" />
        <StatCard label="Open Complaints" value={openComplaints} icon={<MessageSquareWarning className="h-5 w-5" />} tone="sky" />
        <StatCard label="Today's Visitors" value={todaysVisitors} icon={<UserCheck className="h-5 w-5" />} tone="navy" />
        <StatCard label="Active Leave Requests" value={activeLeaves} icon={<CalendarRange className="h-5 w-5" />} tone="gold" />
        <StatCard label="Meal Participation" value={`${mealParticipationRate}%`} icon={<UtensilsCrossed className="h-5 w-5" />} tone="emerald" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Fee Collection Chart" subtitle="Monthly collected vs target (₹)" />
          <CollectionAreaChart data={MONTHLY_COLLECTION} />
        </Card>
        <Card>
          <CardHeader title="Complaint Category Distribution" />
          <DonutChart data={COMPLAINT_DISTRIBUTION} />
        </Card>
        <Card>
          <CardHeader title="Monthly Admissions Chart" />
          <AdmissionsLineChart data={MONTHLY_ADMISSIONS} />
        </Card>
        <Card>
          <CardHeader title="Meal Participation Chart" subtitle="Weekly trend across meals" />
          <MealTrendChart data={MEAL_TREND} />
        </Card>
      </div>
    </div>
  );
}
