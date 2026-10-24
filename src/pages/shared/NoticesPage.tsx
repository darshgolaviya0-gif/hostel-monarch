import React, { useState } from 'react';
import { Megaphone, Plus, Pin, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { SearchInput, Select, EmptyState } from '../../components/ui/Misc';
import { formatDateIN } from '../../utils/format';
import type { Notice, NoticeCategory, NoticePriority } from '../../types';

const CATEGORIES: NoticeCategory[] = ['General', 'Emergency', 'Mess', 'Maintenance', 'Events', 'Fees', 'Holiday'];

export default function NoticesPage() {
  const { user } = useAuth();
  const { notices, createNotice } = useAppData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showCreate, setShowCreate] = useState(false);

  const canCreate = user?.role === 'admin' || user?.role === 'warden';

  const filtered = notices.filter((n) => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || n.category === category;
    return matchSearch && matchCat;
  });
  const sorted = [...filtered].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-950">Notices</h2>
          <p className="text-sm text-slate-500">Stay updated with hostel announcements and alerts.</p>
        </div>
        {canCreate && <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>Create Notice</Button>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={setSearch} placeholder="Search notices…" className="sm:w-80" />
        <Select
          value={category}
          onChange={setCategory}
          ariaLabel="Filter by category"
          options={[{ value: 'all', label: 'All Categories' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]}
        />
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={<Megaphone className="h-7 w-7" />} title="No notices found" message="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((n) => (
            <Card key={n.id} hover className={n.pinned ? 'border-gold-300 bg-gold-50/30' : ''}>
              <div className="flex items-center justify-between">
                <Badge status={n.category} tone={n.category === 'Emergency' ? 'danger' : undefined} />
                {n.pinned && <Pin className="h-4 w-4 text-gold-500" />}
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-navy-950">{n.title}</h3>
              <p className="mt-1.5 line-clamp-3 text-sm text-slate-500">{n.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDateIN(n.publishDate)}</span>
                <span>By {n.author}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {canCreate && (
        <CreateNoticeModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreate={(n) => {
            createNotice({ ...n, author: user!.name });
            toast.success('Notice published successfully.');
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

function CreateNoticeModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (n: Omit<Notice, 'id' | 'publishDate' | 'author'>) => void }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'General' as NoticeCategory, priority: 'Medium' as NoticePriority, expiryDate: '2026-10-20',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Please fill in the title and description.');
      return;
    }
    onCreate({ ...form, audience: 'All', pinned: form.priority === 'High' });
    setForm({ title: '', description: '', category: 'General', priority: 'Medium', expiryDate: '2026-10-20' });
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Notice" subtitle="Publish an announcement visible to residents">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-900">Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="e.g. Water supply maintenance" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-900">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="Describe the notice in detail…" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-900">Category</label>
            <Select value={form.category} onChange={(v) => setForm({ ...form, category: v as NoticeCategory })} options={CATEGORIES.map((c) => ({ value: c, label: c }))} className="w-full" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-900">Priority</label>
            <Select value={form.priority} onChange={(v) => setForm({ ...form, priority: v as NoticePriority })} options={['Low', 'Medium', 'High'].map((c) => ({ value: c, label: c }))} className="w-full" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-900">Expiry Date</label>
          <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
        </div>
        <Button type="submit" fullWidth>Publish Notice</Button>
      </form>
    </Modal>
  );
}
