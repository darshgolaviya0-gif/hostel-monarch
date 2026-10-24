import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, MessageSquareWarning, Image as ImageIcon, Wrench, Droplets, Sparkles, Sofa, Wifi, Droplet, HelpCircle,
  CheckCircle2, Clock, UserCog,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { useCurrentStudent } from '../../hooks/useCurrentStudent';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { SearchInput, Select, EmptyState, Pagination } from '../../components/ui/Misc';
import type { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../../types';

const CATEGORY_ICON: Record<ComplaintCategory, React.ElementType> = {
  Electrical: Wrench, Plumbing: Droplets, Cleaning: Sparkles, Room: Sofa, Furniture: Sofa, 'Wi-Fi': Wifi, Water: Droplet, Other: HelpCircle,
};
const CATEGORIES: ComplaintCategory[] = ['Electrical', 'Plumbing', 'Cleaning', 'Room', 'Furniture', 'Wi-Fi', 'Water', 'Other'];
const PRIORITIES: ComplaintPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
const STATUSES: ComplaintStatus[] = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
const PAGE_SIZE = 6;

export default function Complaints({ variant }: { variant: 'student' | 'admin' | 'warden' }) {
  const { user } = useAuth();
  const student = variant === 'student' ? useCurrentStudent() : null;
  const { complaints, createComplaint, assignComplaint, updateComplaintStatus } = useAppData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [page, setPage] = useState(1);

  const scoped = variant === 'student' ? complaints.filter((c) => c.studentId === student?.id) : complaints;
  const filtered = scoped.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.ticketNo.toLowerCase().includes(search.toLowerCase()) || c.studentName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-950">{variant === 'student' ? 'My Complaints' : 'Complaint Tickets'}</h2>
          <p className="text-sm text-slate-500">{filtered.length} tickets {statusFilter !== 'all' ? `· ${statusFilter}` : ''}</p>
        </div>
        {variant === 'student' && <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>New Complaint</Button>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by ticket, title or student…" className="sm:w-80" />
        <Select value={statusFilter} onChange={setStatusFilter} ariaLabel="Filter by status" options={[{ value: 'all', label: 'All Status' }, ...STATUSES.map((s) => ({ value: s, label: s }))]} />
      </div>

      {paged.length === 0 ? (
        <EmptyState icon={<MessageSquareWarning className="h-7 w-7" />} title="No complaints found" message="Try a different search or filter, or raise a new complaint." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {paged.map((c) => {
            const Icon = CATEGORY_ICON[c.category];
            return (
              <Card key={c.id} hover className="cursor-pointer" padded={false}>
                <button onClick={() => setSelected(c)} className="block w-full p-5 text-left">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700"><Icon className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm font-bold text-navy-950">#{c.ticketNo} — {c.title}</p>
                        <p className="text-xs text-slate-400">{c.studentName} · {c.room}</p>
                      </div>
                    </div>
                    {c.imageAttached && <ImageIcon className="h-4 w-4 text-slate-300" />}
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-500">{c.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Badge status={c.status} />
                    <Badge status={c.priority} />
                    <span className="text-xs text-slate-400">{c.createdAt}</span>
                  </div>
                </button>
              </Card>
            );
          })}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {variant === 'student' && student && (
        <CreateComplaintModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreate={(c) => {
            createComplaint({ ...c, studentId: student.id, studentName: student.name, room: student.allocation?.room ?? '—' });
            toast.success('Complaint submitted! You will be notified on status updates.');
            setShowCreate(false);
          }}
        />
      )}

      {selected && (
        <ComplaintDetailModal
          complaint={selected}
          canManage={variant !== 'student'}
          onClose={() => setSelected(null)}
          onAssign={(assignee) => { assignComplaint(selected.id, assignee, user!.name); toast.success(`Assigned to ${assignee}`); setSelected(null); }}
          onStatus={(status, note) => { updateComplaintStatus(selected.id, status, note, user!.name); toast.success(`Status updated to ${status}`); setSelected(null); }}
        />
      )}
    </div>
  );
}

function CreateComplaintModal({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void;
  onCreate: (c: { category: ComplaintCategory; priority: ComplaintPriority; title: string; description: string; imageAttached: boolean }) => void;
}) {
  const [form, setForm] = useState({ category: 'Electrical' as ComplaintCategory, priority: 'Medium' as ComplaintPriority, title: '', description: '', imageAttached: false });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Please fill in the title and description.');
      return;
    }
    onCreate(form);
    setForm({ category: 'Electrical', priority: 'Medium', title: '', description: '', imageAttached: false });
  };

  return (
    <Modal open={open} onClose={onClose} title="Raise a Complaint" subtitle="Our maintenance team will respond promptly">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-900">Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="e.g. Fan not working" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-900">Category</label>
            <Select value={form.category} onChange={(v) => setForm({ ...form, category: v as ComplaintCategory })} options={CATEGORIES.map((c) => ({ value: c, label: c }))} className="w-full" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-900">Priority</label>
            <Select value={form.priority} onChange={(v) => setForm({ ...form, priority: v as ComplaintPriority })} options={PRIORITIES.map((c) => ({ value: c, label: c }))} className="w-full" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-900">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="Describe the issue in detail…" />
        </div>
        <button
          type="button"
          onClick={() => setForm({ ...form, imageAttached: !form.imageAttached })}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-4 text-sm font-semibold transition ${
            form.imageAttached ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-500 hover:border-navy-300'
          }`}
        >
          <ImageIcon className="h-4 w-4" /> {form.imageAttached ? 'photo_evidence.jpg attached' : 'Click to attach a photo (optional)'}
        </button>
        <Button type="submit" fullWidth>Submit Ticket</Button>
      </form>
    </Modal>
  );
}

function ComplaintDetailModal({ complaint, canManage, onClose, onAssign, onStatus }: {
  complaint: Complaint; canManage: boolean; onClose: () => void;
  onAssign: (assignee: string) => void; onStatus: (status: ComplaintStatus, note: string) => void;
}) {
  const [note, setNote] = useState('');
  return (
    <Modal open onClose={onClose} title={`#${complaint.ticketNo} — ${complaint.title}`} subtitle={`${complaint.studentName} · ${complaint.room}`} size="lg">
      <div className="flex flex-wrap gap-2">
        <Badge status={complaint.status} />
        <Badge status={complaint.priority} />
        <Badge status={complaint.category} tone="neutral" />
      </div>
      <p className="mt-4 text-sm text-slate-600">{complaint.description}</p>

      <div className="mt-6">
        <p className="mb-3 text-sm font-bold text-navy-950">Progress Timeline</p>
        <ol className="relative space-y-5 border-l-2 border-slate-100 pl-5">
          {complaint.timeline.map((t, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[26px] flex h-4 w-4 items-center justify-center rounded-full bg-navy-700 ring-4 ring-white">
                <CheckCircle2 className="h-2.5 w-2.5 text-white" />
              </span>
              <p className="text-sm font-semibold text-navy-900">{t.stage}</p>
              <p className="text-xs text-slate-400">{t.date} {t.by ? `· ${t.by}` : ''}</p>
              {t.note && <p className="mt-1 rounded-lg bg-slate-50 p-2 text-xs text-slate-500">{t.note}</p>}
            </li>
          ))}
        </ol>
      </div>

      {canManage && complaint.status !== 'Closed' && (
        <div className="mt-6 space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <p className="flex items-center gap-1.5 text-sm font-bold text-navy-950"><UserCog className="h-4 w-4" /> Staff Actions</p>
          {complaint.status === 'Open' && (
            <Button size="sm" onClick={() => onAssign('Suresh Vora')} icon={<Clock className="h-3.5 w-3.5" />}>Assign to Suresh Vora (Maintenance)</Button>
          )}
          {complaint.status !== 'Open' && (
            <>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a progress note…" rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
              <div className="flex flex-wrap gap-2">
                {complaint.status === 'Assigned' && <Button size="sm" onClick={() => onStatus('In Progress', note || 'Technician has started work.')}>Start Work</Button>}
                {complaint.status === 'In Progress' && <Button size="sm" onClick={() => onStatus('Resolved', note || 'Repair completed successfully.')}>Mark Resolved</Button>}
                {complaint.status === 'Resolved' && <Button size="sm" variant="secondary" onClick={() => onStatus('Closed', note || 'Student confirmed resolution.')}>Close Ticket</Button>}
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
