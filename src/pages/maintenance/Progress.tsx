import React from 'react';
import { ClipboardList } from 'lucide-react';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar, EmptyState } from '../../components/ui/Misc';

const STAGE_PROGRESS: Record<string, number> = { Open: 10, Assigned: 35, 'In Progress': 65, Resolved: 90, Closed: 100 };

export default function Progress() {
  const { complaints } = useAppData();
  const active = complaints.filter((c) => c.status === 'Assigned' || c.status === 'In Progress');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-extrabold text-navy-950">Progress Updates</h2>
        <p className="text-sm text-slate-500">Track live progress of all tickets currently being worked on.</p>
      </div>

      {active.length === 0 ? (
        <EmptyState icon={<ClipboardList className="h-7 w-7" />} title="No active work" message="There are no tickets currently in progress." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {active.map((c) => (
            <Card key={c.id} hover>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-navy-950">#{c.ticketNo} — {c.title}</p>
                <Badge status={c.priority} />
              </div>
              <p className="mt-1 text-xs text-slate-400">{c.room} · Assigned to {c.assignedTo}</p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{c.status}</span>
                  <span>{STAGE_PROGRESS[c.status]}%</span>
                </div>
                <div className="mt-1.5"><ProgressBar value={STAGE_PROGRESS[c.status]} tone="gold" /></div>
              </div>
              <div className="mt-4 space-y-1.5">
                {c.timeline.slice(-2).map((t, i) => (
                  <p key={i} className="text-xs text-slate-500"><span className="font-semibold text-navy-800">{t.stage}:</span> {t.note ?? t.date}</p>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
