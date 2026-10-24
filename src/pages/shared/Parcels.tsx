import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Package, Truck, CheckCircle2, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { useCurrentStudent } from '../../hooks/useCurrentStudent';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState, SearchInput } from '../../components/ui/Misc';
import { formatDateIN } from '../../utils/format';

export default function Parcels({ variant }: { variant: 'student' | 'security' }) {
  const { user } = useAuth();
  const student = variant === 'student' ? useCurrentStudent() : null;
  const { parcels, updateParcelStatus } = useAppData();
  const [search, setSearch] = useState('');

  const scoped = variant === 'student' ? parcels.filter((p) => p.studentId === student?.id) : parcels;
  const filtered = scoped.filter((p) => p.studentName.toLowerCase().includes(search.toLowerCase()) || p.trackingNo.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    expected: parcels.filter((p) => p.status === 'Expected').length,
    received: parcels.filter((p) => p.status === 'Received').length,
    notified: parcels.filter((p) => p.status === 'Notified').length,
    collected: parcels.filter((p) => p.status === 'Collected').length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-extrabold text-navy-950">{variant === 'student' ? 'My Parcels' : 'Parcel Management'}</h2>
        <p className="text-sm text-slate-500">{variant === 'student' ? 'Track parcels arriving for you at the security desk.' : 'Log, notify and manage student parcel deliveries.'}</p>
      </div>

      {variant === 'security' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Expected" value={counts.expected} icon={<Truck className="h-5 w-5" />} tone="sky" />
          <StatCard label="Received" value={counts.received} icon={<Package className="h-5 w-5" />} tone="gold" />
          <StatCard label="Notified" value={counts.notified} icon={<Bell className="h-5 w-5" />} tone="navy" />
          <StatCard label="Collected" value={counts.collected} icon={<CheckCircle2 className="h-5 w-5" />} tone="emerald" />
        </div>
      )}

      {variant === 'security' && <SearchInput value={search} onChange={setSearch} placeholder="Search by student or tracking number…" className="sm:w-80" />}

      {filtered.length === 0 ? (
        <EmptyState icon={<Package className="h-7 w-7" />} title="No parcels found" message="No parcel records to display." />
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Courier</th>
                  <th className="px-5 py-3">Tracking No.</th>
                  <th className="px-5 py-3">Arrival</th>
                  <th className="px-5 py-3">Status</th>
                  {variant === 'security' && <th className="px-5 py-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-navy-950">{p.studentName}</p>
                      <p className="text-xs text-slate-400">{p.room}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{p.courier}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{p.trackingNo}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDateIN(p.arrivalDate)}</td>
                    <td className="px-5 py-3.5"><Badge status={p.status} /></td>
                    {variant === 'security' && (
                      <td className="px-5 py-3.5 text-right">
                        {p.status === 'Expected' && <Button size="sm" onClick={() => { updateParcelStatus(p.id, 'Received', user!.name); toast.success('Marked as received.'); }}>Mark Received</Button>}
                        {p.status === 'Received' && <Button size="sm" variant="secondary" onClick={() => { updateParcelStatus(p.id, 'Notified', user!.name); toast.success('Student notified: "Your parcel has arrived at Hostel Monarch Security Desk."'); }}>Notify Student</Button>}
                        {p.status === 'Notified' && <Button size="sm" variant="outline" onClick={() => { updateParcelStatus(p.id, 'Collected', user!.name); toast.success('Parcel marked as collected.'); }}>Mark Collected</Button>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
