import React from 'react';
import { Users, Coffee, Soup, Cookie, Moon } from 'lucide-react';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';

export default function MealCount() {
  const { participation } = useAppData();
  const counts = {
    breakfast: participation.filter((p) => p.breakfast).length,
    lunch: participation.filter((p) => p.lunch).length,
    snacks: participation.filter((p) => p.snacks).length,
    dinner: participation.filter((p) => p.dinner).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-extrabold text-navy-950">Meal Count</h2>
        <p className="text-sm text-slate-500">Expected meal participation across all residents today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Breakfast" value={counts.breakfast} icon={<Coffee className="h-5 w-5" />} tone="gold" />
        <StatCard label="Lunch" value={counts.lunch} icon={<Soup className="h-5 w-5" />} tone="navy" />
        <StatCard label="Snacks" value={counts.snacks} icon={<Cookie className="h-5 w-5" />} tone="sky" />
        <StatCard label="Dinner" value={counts.dinner} icon={<Moon className="h-5 w-5" />} tone="emerald" />
      </div>

      <Card padded={false}>
        <div className="p-5 sm:p-6"><CardHeader title="Student Meal Preferences" icon={<Users className="h-4.5 w-4.5" />} /></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Diet</th>
                <th className="px-5 py-3 text-center">Breakfast</th>
                <th className="px-5 py-3 text-center">Lunch</th>
                <th className="px-5 py-3 text-center">Snacks</th>
                <th className="px-5 py-3 text-center">Dinner</th>
              </tr>
            </thead>
            <tbody>
              {participation.map((p) => (
                <tr key={p.studentId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-navy-950">{p.studentName}</p>
                    <p className="text-xs text-slate-400">{p.room}</p>
                  </td>
                  <td className="px-5 py-3.5"><Badge tone="info" dot={false}>{p.diet}</Badge></td>
                  {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map((m) => (
                    <td key={m} className="px-5 py-3.5 text-center">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${p[m] ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
