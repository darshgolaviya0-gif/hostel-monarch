import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Wrench, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState, SearchInput, Select } from '../../components/ui/Misc';
import type { Complaint } from '../../types';

export default function Tickets({ priorityOnly = false }: { priorityOnly?: boolean }) {
  const { user } = useAuth();
  const { complaints, assignComplaint, updateComplaintStatus } = useAppData();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [note, setNote] = useState('');

  let list = complaints.filter((c) => c.status !== 'Closed');
  if (priorityOnly) list = list.filter((c) => c.priority === 'Urgent' || c.priority === 'High');
  list = list.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.ticketNo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'all' || c.status === status;
    return matchSearch && matchStatus;
  });
  list.sort((a, b) => (a.priority === 'Urgent' ? -1 : b.priority === 'Urgent' ? 1 : 0));

  const selectedFresh = selected ? complaints.find((c) => c.id === selected.id) ?? null : null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-extrabold text-navy-950">{priorityOnly ? 'Priority Queue' : 'Maintenance Tickets'}</h2>
        <p className="text-sm text-slate-500">{priorityOnly ? 'High and urgent priority tickets needing immediate attention.' : 'All open maintenance tickets across the hostel.'}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={setSearch} placeholder="Search tickets…" className="sm:w-80" />
        <Select value={status} onChange={setStatus} ariaLabel="Filter by status" options={[{ value: 'all', label: 'All Status' }, { value: 'Open', label: 'Open' }, { value: 'Assigned', label: 'Assigned' }, { value: 'In Progress', label: 'In Progress' }, { value: 'Resolved', label: 'Resolved' }]} />
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<Wrench className="h-7 w-7" />} title="No tickets found" message="Great! No pending tickets match this filter." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {list.map((c) => (
            <Card key={c.id} hover padded={false}>
              <button onClick={() => setSelected(c)} className="block w-full p-5 text-left">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-navy-950">#{c.ticketNo} — {c.title}</p>
                    <p className="text-xs text-slate-400">{c.room} · {c.category}</p>
                  </div>
                  <Badge status={c.priority} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">{c.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge status={c.status} />
                  <span className="text-xs text-slate-400">{c.createdAt}</span>
                </div>
              </button>
            </Card>
          ))}
        </div>
      )}

      {selectedFresh && (
        <Modal open onClose={() => setSelected(null)} title={`#${selectedFresh.ticketNo} — ${selectedFresh.title}`} subtitle={`${selectedFresh.studentName} · ${selectedFresh.room}`}>
          <div className="flex flex-wrap gap-2">
            <Badge status={selectedFresh.status} />
            <Badge status={selectedFresh.priority} />
            <Badge status={selectedFresh.category} tone="neutral" />
          </div>
          <p className="mt-4 text-sm text-slate-600">{selectedFresh.description}</p>

          <div className="mt-5">
            <p className="mb-2 text-sm font-bold text-navy-950">Timeline</p>
            <ol className="relative space-y-4 border-l-2 border-slate-100 pl-5">
              {selectedFresh.timeline.map((t, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[26px] flex h-4 w-4 items-center justify-center rounded-full bg-navy-700 ring-4 ring-white"><Clock className="h-2.5 w-2.5 text-white" /></span>
                  <p className="text-sm font-semibold text-navy-900">{t.stage}</p>
                  <p className="text-xs text-slate-400">{t.date}</p>
                  {t.note && <p className="mt-1 rounded-lg bg-slate-50 p-2 text-xs text-slate-500">{t.note}</p>}
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-5 space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Add a progress or resolution note…" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
            <div className="flex flex-wrap gap-2">
              {selectedFresh.status === 'Open' && (
                <Button size="sm" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => { assignComplaint(selectedFresh.id, user!.name, user!.name); toast.success('Ticket accepted and assigned to you.'); }}>
                  Accept Assignment
                </Button>
              )}
              {selectedFresh.status === 'Assigned' && (
                <Button size="sm" icon={<PlayCircle className="h-4 w-4" />} onClick={() => { updateComplaintStatus(selectedFresh.id, 'In Progress', note || 'Technician has started work on site.', user!.name); toast.success('Marked as In Progress.'); }}>
                  Start Work
                </Button>
              )}
              {selectedFresh.status === 'In Progress' && (
                <Button size="sm" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => { updateComplaintStatus(selectedFresh.id, 'Resolved', note || 'Repair completed successfully.', user!.name); toast.success('Marked as Resolved.'); setSelected(null); }}>
                  Mark Resolved
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
