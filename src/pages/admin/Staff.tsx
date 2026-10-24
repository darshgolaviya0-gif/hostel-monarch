import React, { useState } from 'react';
import { Mail, Phone, Plus } from 'lucide-react';
import { ROLE_META, DEMO_USERS } from '../../data/users';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar, SearchInput } from '../../components/ui/Misc';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const STAFF_ROLES = ROLE_META.filter((r) => r.id !== 'student');

const EXTRA_STAFF = [
  { name: 'Alpesh Zala', role: 'warden' as const, designation: 'Assistant Warden', phone: '+91 98791 44110', email: 'alpesh.zala@hostelmonarch.in' },
  { name: 'Devendra Gohil', role: 'security' as const, designation: 'Security Guard — Night Shift', phone: '+91 98250 77332', email: 'devendra.gohil@hostelmonarch.in' },
  { name: 'Pravin Solanki', role: 'maintenance' as const, designation: 'Electrician', phone: '+91 97250 55443', email: 'pravin.solanki@hostelmonarch.in' },
  { name: 'Hetal Chauhan', role: 'mess' as const, designation: 'Cook', phone: '+91 90330 22114', email: 'hetal.chauhan@hostelmonarch.in' },
  { name: 'Ramesh Patel', role: 'accounts' as const, designation: 'Accounts Assistant', phone: '+91 99250 33667', email: 'ramesh.patel@hostelmonarch.in' },
];

export default function Staff() {
  const [search, setSearch] = useState('');
  const coreStaff = Object.values(DEMO_USERS).filter((u) => u.role !== 'student');
  const all = [...coreStaff.map((u) => ({ name: u.name, role: u.role, designation: u.designation ?? '', phone: u.phone, email: u.email, avatar: u.avatar })), ...EXTRA_STAFF.map((s) => ({ ...s, avatar: undefined }))];
  const filtered = all.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.designation.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-950">Staff Directory</h2>
          <p className="text-sm text-slate-500">Manage wardens, security, maintenance, mess and accounts staff.</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => toast.success('Staff invitation flow (demo).')}>Add Staff Member</Button>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search staff by name or designation…" className="sm:w-96" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => {
          const roleMeta = STAFF_ROLES.find((r) => r.id === s.role);
          return (
            <Card key={s.email} hover>
              <div className="flex items-center gap-3">
                <Avatar name={s.name} src={(s as any).avatar} />
                <div>
                  <p className="text-sm font-bold text-navy-950">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.designation}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><Mail className="h-3.5 w-3.5" /> {s.email}</div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Phone className="h-3.5 w-3.5" /> {s.phone}</div>
              <Badge tone="gold" dot={false} className="mt-3">{roleMeta?.label}</Badge>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
