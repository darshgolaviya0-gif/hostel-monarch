import React, { useState } from 'react';
import { History as HistoryIcon } from 'lucide-react';
import { useAppData } from '../../store/AppDataContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState, SearchInput } from '../../components/ui/Misc';

export default function History() {
  const { complaints } = useAppData();
  const [search, setSearch] = useState('');
  const resolved = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').filter((c) => c.title.toLowerCase().includes(search.toLowerCase()) || c.ticketNo.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-extrabold text-navy-950">Resolution History</h2>
        <p className="text-sm text-slate-500">Archive of all resolved and closed maintenance tickets.</p>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search resolved tickets…" className="sm:w-80" />

      {resolved.length === 0 ? (
        <EmptyState icon={<HistoryIcon className="h-7 w-7" />} title="No resolved tickets yet" message="Resolved tickets will appear here." />
      ) : (
        <div className="space-y-3">
          {resolved.map((c) => (
            <Card key={c.id} hover>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-navy-950">#{c.ticketNo} — {c.title}</p>
                  <p className="text-xs text-slate-400">{c.room} · {c.category} · Resolved by {c.assignedTo}</p>
                </div>
                <Badge status={c.status} />
              </div>
              <p className="mt-2 text-sm text-slate-500">{c.timeline[c.timeline.length - 1]?.note ?? 'Issue resolved successfully.'}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
