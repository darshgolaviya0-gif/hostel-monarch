import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { UserCog, CheckCircle2, XCircle, RefreshCw, ServerCog, Clock3 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState, SearchInput } from '../../components/ui/Misc';
import { Tabs } from '../../components/ui/Tabs';
import { ROLE_META } from '../../data/users';
import { useAppData } from '../../store/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isLiveMode } from '../../lib/supabase';
import { StudentsAPI } from '../../lib/liveData';
import type { Student } from '../../types';
import { formatDateIN } from '../../utils/format';

const STATUS_TONE = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  suspended: 'danger',
} as const;

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  meta: Record<string, unknown> | null;
  created_at: string;
}

export default function Approvals() {
  const { user } = useAuth();
  const { addAudit, addStudentLocal } = useAppData();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [rejecting, setRejecting] = useState<ProfileRow | null>(null);
  const [reason, setReason] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Could not load accounts: ' + error.message);
    setRows((data as ProfileRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!isLiveMode) {
    return (
      <Card>
        <EmptyState
          icon={<ServerCog className="h-8 w-8" />}
          title="Live mode not connected"
          message="Real staff & student signups will appear here for approval once a Supabase project is connected. See .env.example and supabase/schema.sql in the project files to enable live mode."
        />
      </Card>
    );
  }

  const pendingCount = rows.filter((r) => r.status === 'pending').length;
  const visible = (tab === 'pending' ? rows.filter((r) => r.status === 'pending') : rows).filter((r) =>
    r.full_name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase())
  );

  const approve = async (row: ProfileRow) => {
    if (!supabase || !user) return;
    setBusyId(row.id);

    // For students, create their hostel Student record (if they don't already
    // have one) so they instantly show up in the Student Directory, and link
    // it back onto their account (meta.studentId) so their own dashboard
    // knows which record is theirs.
    let metaPatch: Record<string, unknown> | undefined;
    if (row.role === 'student') {
      const meta = (row.meta ?? {}) as Record<string, unknown>;
      const existingStudentId = typeof meta.studentId === 'string' ? meta.studentId : undefined;
      if (!existingStudentId) {
        const studentId = `HM-STU-${row.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
        const newStudent: Student = {
          id: studentId,
          enrollmentNo: '',
          name: row.full_name,
          avatar: '',
          dob: '',
          gender: 'Other',
          bloodGroup: 'O+',
          phone: row.phone ?? '',
          email: row.email,
          college: '',
          course: typeof meta.course === 'string' ? meta.course : '',
          semester: '',
          address: { line: '', city: '', state: '', pincode: '' },
          guardian: { name: '', relationship: '', phone: '', email: '' },
          emergency: { name: '', relationship: '', phone: '' },
          allocation: null,
          status: 'Active',
          profileCompletion: 20,
          feeDue: 0,
          admissionStatus: 'Approved',
        };
        try {
          await StudentsAPI.upsert(newStudent, row.id);
        } catch (err) {
          setBusyId(null);
          toast.error('Could not create student record: ' + (err instanceof Error ? err.message : String(err)));
          return;
        }
        addStudentLocal(newStudent);
        metaPatch = { ...meta, studentId };
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        ...(metaPatch ? { meta: metaPatch } : {}),
      })
      .eq('id', row.id);
    setBusyId(null);
    if (error) { toast.error('Approval failed: ' + error.message); return; }
    toast.success(`${row.full_name} approved as ${ROLE_META.find((r) => r.id === row.role)?.label ?? row.role}.`);
    addAudit(user.name, 'admin', `Approved account for ${row.full_name}`, 'Account Approvals', 'Success');
    load();
  };

  const confirmReject = async () => {
    if (!supabase || !user || !rejecting) return;
    setBusyId(rejecting.id);
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'rejected', rejected_reason: reason || 'Not specified', approved_by: user.id, approved_at: new Date().toISOString() })
      .eq('id', rejecting.id);
    setBusyId(null);
    if (error) { toast.error('Rejection failed: ' + error.message); return; }
    toast(`${rejecting.full_name}'s application was rejected.`, { icon: '🚫' });
    addAudit(user.name, 'admin', `Rejected account for ${rejecting.full_name}`, 'Account Approvals', 'Failed');
    setRejecting(null);
    setReason('');
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-950">Account Approvals</h2>
          <p className="text-sm text-slate-500">Review and approve real staff & student signups before they can access the app.</p>
        </div>
        <button onClick={() => load()} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <Tabs tabs={[{ id: 'pending', label: 'Pending', badge: pendingCount }, { id: 'all', label: 'All Accounts' }]} onChange={(id) => setTab(id as 'pending' | 'all')} />

      <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email…" />

      {visible.length === 0 ? (
        <Card>
          <EmptyState icon={<UserCog className="h-8 w-8" />} title="No accounts here" message={tab === 'pending' ? 'There are no pending signups right now. New staff and student accounts will show up here automatically.' : 'No accounts match your search.'} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visible.map((row) => (
            <Card key={row.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-sm font-bold text-navy-950">{row.full_name}</p>
                  <p className="text-xs text-slate-500">{row.email}</p>
                  {row.phone && <p className="text-xs text-slate-500">{row.phone}</p>}
                </div>
                <Badge tone={STATUS_TONE[row.status]}>{row.status[0].toUpperCase() + row.status.slice(1)}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <Badge tone="info">{ROLE_META.find((r) => r.id === row.role)?.label ?? row.role}</Badge>
                <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {formatDateIN(row.created_at)}</span>
              </div>
              {row.meta && Object.keys(row.meta).length > 0 && (
                <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  {Object.entries(row.meta).map(([k, v]) => (
                    <p key={k}><span className="font-semibold text-slate-600 capitalize">{k}:</span> {String(v)}</p>
                  ))}
                </div>
              )}
              {row.status === 'pending' && (
                <div className="flex gap-2 pt-1">
                  <Button className="flex-1" loading={busyId === row.id} icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => approve(row)}>Approve</Button>
                  <button onClick={() => setRejecting(row)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50">
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {rejecting && (
        <Modal open onClose={() => setRejecting(null)} title={`Reject ${rejecting.full_name}'s application`}>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Optionally let them know why this application was not approved.</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Incomplete details, duplicate account…"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100"
            />
            <div className="flex gap-3">
              <button onClick={() => setRejecting(null)} className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <Button className="flex-1" loading={busyId === rejecting.id} onClick={confirmReject}>Confirm Reject</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
