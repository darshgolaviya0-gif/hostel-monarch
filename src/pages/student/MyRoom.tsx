import React from 'react';
import { DoorOpen, Users, Wifi, BedDouble, History, CalendarClock, Clock3, CalendarCheck2, AlarmClock } from 'lucide-react';
import { useCurrentStudent } from '../../hooks/useCurrentStudent';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/Misc';
import { cn } from '../../utils/cn';
import { formatDateIN, formatINR } from '../../utils/format';
import { ALLOCATION_HISTORY } from '../../data/analytics';

const DEMO_NOW = new Date('2026-10-04T22:45:00');

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function monthsBetween(a: Date, b: Date) {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

export default function MyRoom() {
  const student = useCurrentStudent();
  const { rooms } = useAppData();
  const room = rooms.find((r) => r.roomNo === student.allocation?.room);
  const history = ALLOCATION_HISTORY.filter((h) => h.studentId === student.id);

  if (!student.allocation || !room) {
    return <Card><p className="text-sm text-slate-400">No active room allocation found.</p></Card>;
  }

  const { joiningDate } = student.allocation;
  const bookingFrom = student.allocation.bookingFrom ?? joiningDate;
  const bookingTillDate = (() => {
    const d = new Date(bookingFrom);
    d.setFullYear(d.getFullYear() + 1);
    return d;
  })();
  const validTill = student.allocation.validTill ?? bookingTillDate.toISOString().slice(0, 10);

  const fromD = new Date(bookingFrom);
  const tillD = new Date(validTill);
  const totalDays = Math.max(1, daysBetween(fromD, tillD));
  const elapsedDays = Math.min(totalDays, Math.max(0, daysBetween(fromD, DEMO_NOW)));
  const remainingDays = Math.max(0, totalDays - elapsedDays);
  const progressPct = Math.round((elapsedDays / totalDays) * 100);
  const expiringSoon = remainingDays > 0 && remainingDays <= 45;
  const expired = DEMO_NOW > tillD;
  const residentMonths = Math.max(0, monthsBetween(new Date(joiningDate), DEMO_NOW));
  const residentYears = Math.floor(residentMonths / 12);
  const residentMonthsRem = residentMonths % 12;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="brand-gradient flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-navy-300">{student.allocation.building} · {student.allocation.floor}</p>
            <h2 className="font-display text-3xl font-extrabold text-white">{room.roomNo}</h2>
            <p className="mt-1 text-sm text-navy-200">{room.type} · Your bed: {student.allocation.bed}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white">
            <DoorOpen className="h-4 w-4 text-gold-400" /> Joined {formatDateIN(student.allocation.joiningDate)}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardHeader title="Booking Duration" subtitle="How long your current hostel stay is booked for" icon={<CalendarClock className="h-4.5 w-4.5" />} />
          <Badge tone={expired ? 'danger' : expiringSoon ? 'warning' : 'success'} dot={false}>
            {expired ? 'Renewal Overdue' : expiringSoon ? 'Renewal Due Soon' : 'Active Booking'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400"><CalendarCheck2 className="h-3.5 w-3.5" /> Booking Period</div>
            <p className="mt-1.5 text-sm font-bold text-navy-950">{formatDateIN(bookingFrom)} – {formatDateIN(validTill)}</p>
            <p className="mt-0.5 text-xs text-slate-400">{Math.round(totalDays / 30)} months total</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400"><AlarmClock className="h-3.5 w-3.5" /> {expired ? 'Overdue By' : 'Days Remaining'}</div>
            <p className={cn('mt-1.5 text-sm font-bold', expired ? 'text-rose-600' : expiringSoon ? 'text-amber-600' : 'text-navy-950')}>
              {expired ? `${Math.abs(remainingDays - totalDays)} days` : `${remainingDays} days`}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">until {formatDateIN(validTill)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" /> Resident Since</div>
            <p className="mt-1.5 text-sm font-bold text-navy-950">{formatDateIN(joiningDate)}</p>
            <p className="mt-0.5 text-xs text-slate-400">{residentYears > 0 ? `${residentYears} yr ${residentMonthsRem} mo` : `${residentMonthsRem} months`} at Hostel Monarch</p>
          </div>
        </div>

        <div className="mt-1">
          <div className="mb-1.5 flex items-center justify-between text-xs text-slate-400">
            <span>Booking cycle progress</span>
            <span>{progressPct}% elapsed</span>
          </div>
          <ProgressBar value={progressPct} tone={expired || expiringSoon ? 'gold' : 'emerald'} />
        </div>

        {(expiringSoon || expired) && (
          <div className={cn('mt-4 flex items-start gap-2 rounded-xl p-3 text-xs', expired ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700')}>
            <AlarmClock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              {expired
                ? 'Your hostel booking cycle has ended. Please contact the warden/accounts office to renew your stay.'
                : `Your current booking ends in ${remainingDays} day${remainingDays === 1 ? '' : 's'}. Please renew before ${formatDateIN(validTill)} to avoid interruption.`}
            </span>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Bed Layout" subtitle={`${room.capacity} total beds in this room`} icon={<BedDouble className="h-4.5 w-4.5" />} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {room.beds.map((bed) => (
              <div
                key={bed.id}
                className={cn(
                  'rounded-2xl border p-4 text-center',
                  bed.studentId === student.id ? 'border-gold-300 bg-gold-50 ring-2 ring-gold-300' : 'border-slate-100'
                )}
              >
                <BedDouble className={cn('mx-auto h-7 w-7', bed.status === 'Occupied' ? 'text-navy-700' : 'text-slate-300')} />
                <p className="mt-2 text-xs font-bold text-navy-950">{bed.label}</p>
                <p className="mt-0.5 truncate text-[11px] text-slate-500">{bed.studentName ?? 'Vacant'}</p>
                <Badge status={bed.status} className="mt-2" />
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-400">Monthly Rent</p>
              <p className="mt-1 text-sm font-bold text-navy-950">{formatINR(room.monthlyRent)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-400">Room Type</p>
              <p className="mt-1 text-sm font-bold text-navy-950">{room.type}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-400">Capacity</p>
              <p className="mt-1 flex items-center justify-center gap-1 text-sm font-bold text-navy-950"><Users className="h-3.5 w-3.5" /> {room.capacity}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-400">Wi-Fi</p>
              <p className="mt-1 flex items-center justify-center gap-1 text-sm font-bold text-navy-950"><Wifi className="h-3.5 w-3.5" /> Active</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Room Amenities" />
          <div className="flex flex-wrap gap-2">
            {room.amenities.map((a) => (
              <Badge key={a} tone="info" dot={false}>{a}</Badge>
            ))}
          </div>

          <div className="mt-6">
            <CardHeader title="Allocation History" icon={<History className="h-4.5 w-4.5" />} />
            <div className="space-y-2">
              {history.length ? history.map((h) => (
                <div key={h.id} className="rounded-xl border border-slate-100 p-3 text-sm">
                  <p className="font-semibold text-navy-900">{h.action} — {h.room} / {h.bed}</p>
                  <p className="text-xs text-slate-400">{formatDateIN(h.date)} · by {h.by}</p>
                </div>
              )) : <p className="text-sm text-slate-400">No transfer history.</p>}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
