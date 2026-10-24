import React, { useState } from 'react';
import { ListChecks, LogIn, LogOut } from 'lucide-react';
import { useAppData } from '../../store/AppDataContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState, SearchInput, Select } from '../../components/ui/Misc';

export default function GateLogs() {
  const { gateLogs } = useAppData();
  const [search, setSearch] = useState('');
  const [direction, setDirection] = useState('all');

  const filtered = gateLogs.filter((g) => {
    const matchSearch = g.studentName.toLowerCase().includes(search.toLowerCase()) || g.passId.toLowerCase().includes(search.toLowerCase());
    const matchDir = direction === 'all' || g.direction === direction;
    return matchSearch && matchDir;
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-extrabold text-navy-950">Gate Activity Logs</h2>
        <p className="text-sm text-slate-500">Complete record of student entry and exit events.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by student or pass ID…" className="sm:w-80" />
        <Select value={direction} onChange={setDirection} ariaLabel="Filter by direction" options={[{ value: 'all', label: 'All' }, { value: 'Entry', label: 'Entry' }, { value: 'Exit', label: 'Exit' }]} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ListChecks className="h-7 w-7" />} title="No gate logs found" message="No activity matches your search." />
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Pass ID</th>
                  <th className="px-5 py-3">Direction</th>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Verified By</th>
                  <th className="px-5 py-3">Result</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => (
                  <tr key={g.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-semibold text-navy-950">{g.studentName}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{g.passId}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${g.direction === 'Entry' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {g.direction === 'Entry' ? <LogIn className="h-3.5 w-3.5" /> : <LogOut className="h-3.5 w-3.5" />} {g.direction}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{g.timestamp}</td>
                    <td className="px-5 py-3.5 text-slate-500">{g.verifiedBy}</td>
                    <td className="px-5 py-3.5"><Badge status={g.result} /></td>
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
