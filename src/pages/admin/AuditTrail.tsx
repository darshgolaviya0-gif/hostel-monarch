import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { History, Download } from 'lucide-react';
import { useAppData } from '../../store/AppDataContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState, Pagination, SearchInput, Select } from '../../components/ui/Misc';
import { exportToCSV } from '../../utils/csv';
import { ROLE_META } from '../../data/users';

const PAGE_SIZE = 10;

export default function AuditTrail() {
  const { auditLogs } = useAppData();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = auditLogs.filter((l) => {
    const matchSearch = l.action.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase()) || l.module.toLowerCase().includes(search.toLowerCase());
    const matchRole = role === 'all' || l.role === role;
    return matchSearch && matchRole;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-950">Audit Trail</h2>
          <p className="text-sm text-slate-500">Complete activity log across every role and module.</p>
        </div>
        <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => { exportToCSV('hostel-monarch-audit-trail.csv', filtered); toast.success('Audit trail exported.'); }}>
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by user, action or module…" className="sm:w-96" />
        <Select value={role} onChange={setRole} ariaLabel="Filter by role" options={[{ value: 'all', label: 'All Roles' }, ...ROLE_META.map((r) => ({ value: r.id, label: r.label }))]} />
      </div>

      {paged.length === 0 ? (
        <EmptyState icon={<History className="h-7 w-7" />} title="No activity found" message="Try a different search or filter." />
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Module</th>
                  <th className="px-5 py-3">Date & Time</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((log) => (
                  <tr key={log.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-semibold text-navy-950">{log.user}</td>
                    <td className="px-5 py-3.5 text-slate-500 capitalize">{log.role}</td>
                    <td className="px-5 py-3.5 text-slate-600">{log.action}</td>
                    <td className="px-5 py-3.5 text-slate-500">{log.module}</td>
                    <td className="px-5 py-3.5 text-slate-500">{log.date}, {log.time}</td>
                    <td className="px-5 py-3.5"><Badge status={log.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-5"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
        </Card>
      )}
    </div>
  );
}
