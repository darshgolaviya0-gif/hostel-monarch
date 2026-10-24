import React, { useState } from 'react';
import { Users, Mail, Phone, DoorOpen } from 'lucide-react';
import { useAppData } from '../../store/AppDataContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar, EmptyState, Pagination, SearchInput, Select } from '../../components/ui/Misc';
import { Modal } from '../../components/ui/Modal';
import { formatDateIN, formatINR } from '../../utils/format';
import type { Student } from '../../types';

const PAGE_SIZE = 8;

export default function Students({ variant }: { variant: 'admin' | 'warden' }) {
  const { students } = useAppData();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Student | null>(null);

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.enrollmentNo.toLowerCase().includes(search.toLowerCase()) || (s.allocation?.room ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'all' || s.status === status;
    return matchSearch && matchStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-950">Student Directory</h2>
          <p className="text-sm text-slate-500">{filtered.length} students {variant === 'admin' ? 'across all buildings' : 'under your supervision'}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, enrollment no. or room…" className="sm:w-80" />
        <Select value={status} onChange={setStatus} ariaLabel="Filter by status" options={[{ value: 'all', label: 'All Status' }, { value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }, { value: 'Suspended', label: 'Suspended' }]} />
      </div>

      {paged.length === 0 ? (
        <EmptyState icon={<Users className="h-7 w-7" />} title="No students found" message="Try a different search term or filter." />
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Course</th>
                  <th className="px-5 py-3">Room</th>
                  <th className="px-5 py-3">Fee Due</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} src={s.avatar} size="sm" />
                        <div>
                          <p className="font-semibold text-navy-950">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.enrollmentNo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{s.course}</td>
                    <td className="px-5 py-3.5 text-slate-500">{s.allocation ? `${s.allocation.room} / ${s.allocation.bed}` : '—'}</td>
                    <td className="px-5 py-3.5 font-semibold text-navy-950">{formatINR(s.feeDue)}</td>
                    <td className="px-5 py-3.5"><Badge status={s.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => setSelected(s)} className="text-xs font-bold text-navy-700 hover:text-gold-600">View Profile</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-5"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
        </Card>
      )}

      {selected && (
        <Modal open onClose={() => setSelected(null)} title={selected.name} subtitle={selected.enrollmentNo} size="lg">
          <div className="flex items-center gap-4">
            <Avatar name={selected.name} src={selected.avatar} size="lg" />
            <div>
              <Badge status={selected.status} />
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500"><Mail className="h-3.5 w-3.5" /> {selected.email}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500"><Phone className="h-3.5 w-3.5" /> {selected.phone}</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Info label="Course" value={selected.course} />
            <Info label="Semester" value={selected.semester} />
            <Info label="College" value={selected.college} />
            <Info label="Blood Group" value={selected.bloodGroup} />
            <Info label="Guardian" value={`${selected.guardian.name} (${selected.guardian.relationship})`} />
            <Info label="Guardian Phone" value={selected.guardian.phone} />
          </div>
          <div className="mt-5 rounded-xl border border-slate-100 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-navy-950"><DoorOpen className="h-4 w-4" /> Hostel Allocation</p>
            {selected.allocation ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 text-sm">
                <Info label="Building" value={selected.allocation.building} />
                <Info label="Floor" value={selected.allocation.floor} />
                <Info label="Room" value={selected.allocation.room} />
                <Info label="Bed" value={selected.allocation.bed} />
                <Info label="Joined" value={formatDateIN(selected.allocation.joiningDate)} />
              </div>
            ) : <p className="text-sm text-slate-400">No active allocation.</p>}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-rose-50 p-4">
            <span className="text-sm font-semibold text-rose-700">Outstanding Fee Due</span>
            <span className="font-display text-lg font-extrabold text-rose-700">{formatINR(selected.feeDue)}</span>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-navy-950">{value}</p>
    </div>
  );
}
