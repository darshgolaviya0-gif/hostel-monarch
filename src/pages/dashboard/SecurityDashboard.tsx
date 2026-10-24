import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, LogOut, UserCheck, ScanLine, Package, Siren } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';

export default function SecurityDashboard() {
  const { user } = useAuth();
  const { gateLogs, visitors, parcels } = useAppData();

  const todaysLogs = gateLogs.filter((g) => g.timestamp.startsWith('2026-10-04'));
  const entries = todaysLogs.filter((g) => g.direction === 'Entry').length;
  const exits = todaysLogs.filter((g) => g.direction === 'Exit').length;
  const todaysVisitors = visitors.filter((v) => v.visitDate === '2026-10-04');
  const pendingParcels = parcels.filter((p) => p.status === 'Received' || p.status === 'Notified');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-navy-950">Gate Dashboard — {user?.name.split(' ')[0]}</h2>
        <p className="mt-1 text-sm text-slate-500">Monitor gate activity, verify passes and manage visitors in real time.</p>
      </div>

      <Link to="/app/qr-verification" className="block">
        <div className="brand-gradient card-surface flex flex-col items-center justify-center gap-3 rounded-2xl p-10 text-center shadow-lg transition hover:shadow-2xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-400 text-navy-950">
            <ScanLine className="h-8 w-8" />
          </div>
          <h3 className="font-display text-2xl font-extrabold text-white">SCAN QR PASS</h3>
          <p className="text-sm text-navy-200">Tap to open the verification camera and validate a student's gate pass</p>
        </div>
      </Link>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Entries" value={entries} icon={<LogIn className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Today's Exits" value={exits} icon={<LogOut className="h-5 w-5" />} tone="rose" />
        <StatCard label="Today's Visitors" value={todaysVisitors.length} icon={<UserCheck className="h-5 w-5" />} tone="sky" />
        <StatCard label="Parcels Awaiting Pickup" value={pendingParcels.length} icon={<Package className="h-5 w-5" />} tone="gold" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent Gate Activity" action={<Link to="/app/gate-logs" className="text-xs font-bold text-navy-700 hover:text-gold-600">View all →</Link>} />
          <div className="space-y-3">
            {gateLogs.slice(0, 5).map((g) => (
              <div key={g.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${g.direction === 'Entry' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {g.direction === 'Entry' ? <LogIn className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{g.studentName}</p>
                    <p className="text-xs text-slate-400">{g.timestamp}</p>
                  </div>
                </div>
                <Badge status={g.result} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-rose-100 bg-rose-50/30">
          <CardHeader title="Emergency Alerts" icon={<Siren className="h-4.5 w-4.5 text-rose-600" />} />
          <div className="rounded-xl bg-white p-4 text-sm text-slate-500">
            No active emergency alerts. Gate systems and CCTV are operating normally.
          </div>
          <Link to="/app/emergency" className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">
            Open Emergency Console
          </Link>
        </Card>
      </div>
    </div>
  );
}
