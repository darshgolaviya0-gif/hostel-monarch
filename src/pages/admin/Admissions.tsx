import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FileCheck2, CheckCircle2, XCircle, FileText, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Avatar, EmptyState, SearchInput, Select } from '../../components/ui/Misc';
import { formatDateIN } from '../../utils/format';
import type { Admission, AdmissionStage } from '../../types';

const STAGES: AdmissionStage[] = ['Application Started', 'Documents Uploaded', 'Under Review', 'Verification', 'Approved', 'Rejected'];

export default function Admissions() {
  const { user } = useAuth();
  const { admissions, reviewAdmission, verifyDocument } = useAppData();
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('all');
  const [selected, setSelected] = useState<Admission | null>(null);

  const filtered = admissions.filter((a) => {
    const matchSearch = a.studentName.toLowerCase().includes(search.toLowerCase()) || a.applicationNo.toLowerCase().includes(search.toLowerCase());
    const matchStage = stage === 'all' || a.stage === stage;
    return matchSearch && matchStage;
  });

  const selectedFresh = selected ? admissions.find((a) => a.id === selected.id) ?? null : null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-extrabold text-navy-950">Admission & Documents</h2>
        <p className="text-sm text-slate-500">Review applications through each stage of the admission workflow.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STAGES.map((s) => (
          <button key={s} onClick={() => setStage(stage === s ? 'all' : s)} className={`rounded-xl border p-3 text-center transition ${stage === s ? 'border-navy-700 bg-navy-50' : 'border-slate-100 bg-white'}`}>
            <p className="font-display text-lg font-extrabold text-navy-950">{admissions.filter((a) => a.stage === s).length}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{s}</p>
          </button>
        ))}
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search by applicant name or application no…" className="sm:w-96" />

      {filtered.length === 0 ? (
        <EmptyState icon={<FileCheck2 className="h-7 w-7" />} title="No applications found" message="Try a different search term or filter." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((a) => (
            <Card key={a.id} hover padded={false}>
              <button onClick={() => setSelected(a)} className="block w-full p-5 text-left">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={a.studentName} src={a.avatar} />
                    <div>
                      <p className="text-sm font-bold text-navy-950">{a.studentName}</p>
                      <p className="text-xs text-slate-400">{a.applicationNo}</p>
                    </div>
                  </div>
                  <Badge status={a.stage} />
                </div>
                <p className="mt-3 text-sm text-slate-500">{a.course}</p>
                <p className="text-xs text-slate-400">
                  Applied {formatDateIN(a.appliedOn)} · Preferred: {a.preferredBuilding ?? 'No preference'}
                  {a.visitDate && ' · Visit requested'}
                </p>
              </button>
            </Card>
          ))}
        </div>
      )}

      {selectedFresh && (
        <Modal open onClose={() => setSelected(null)} title={selectedFresh.studentName} subtitle={selectedFresh.applicationNo} size="lg">
          <div className="flex items-center justify-between">
            <Badge status={selectedFresh.stage} />
            <span className="text-xs text-slate-400">Applied {formatDateIN(selectedFresh.appliedOn)}</span>
          </div>

          {selectedFresh.visitDate && (
            <div className="mt-4 rounded-xl border border-gold-200 bg-gold-50/60 px-4 py-3">
              <p className="text-xs font-bold text-gold-800">
                Requested a hostel visit on {formatDateIN(selectedFresh.visitDate)}{selectedFresh.visitSlot ? ` · ${selectedFresh.visitSlot}` : ''}
              </p>
              {selectedFresh.visitNote && <p className="mt-1 text-xs text-gold-700">"{selectedFresh.visitNote}"</p>}
            </div>
          )}

          <div className="mt-4">
            <p className="mb-2 text-sm font-bold text-navy-950">Documents</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {selectedFresh.documents.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs font-semibold text-navy-900">{d.type}</p>
                      <p className="text-[11px] text-slate-400">{d.fileName || 'Not uploaded'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge status={d.status} />
                    {d.status === 'Uploaded' && (
                      <>
                        <button onClick={() => { verifyDocument(selectedFresh.id, d.id, 'Verified'); toast.success(`${d.type} verified.`); }} className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-50" aria-label="Verify document"><CheckCircle2 className="h-4 w-4" /></button>
                        <button onClick={() => { verifyDocument(selectedFresh.id, d.id, 'Rejected'); toast('Document rejected.'); }} className="rounded-lg p-1 text-rose-600 hover:bg-rose-50" aria-label="Reject document"><XCircle className="h-4 w-4" /></button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-bold text-navy-950">Verification History</p>
            <ol className="relative space-y-4 border-l-2 border-slate-100 pl-5">
              {selectedFresh.history.map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[26px] flex h-4 w-4 items-center justify-center rounded-full bg-navy-700 ring-4 ring-white"><Clock className="h-2.5 w-2.5 text-white" /></span>
                  <p className="text-sm font-semibold text-navy-900">{h.stage}</p>
                  <p className="text-xs text-slate-400">{formatDateIN(h.date)} · {h.by}</p>
                  {h.remark && <p className="mt-1 rounded-lg bg-slate-50 p-2 text-xs text-slate-500">{h.remark}</p>}
                </li>
              ))}
            </ol>
          </div>

          {selectedFresh.stage !== 'Approved' && selectedFresh.stage !== 'Rejected' && (
            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              {selectedFresh.stage === 'Documents Uploaded' && (
                <Button size="sm" onClick={() => { reviewAdmission(selectedFresh.id, 'Under Review', user!.name); toast.success('Moved to Under Review.'); }}>Start Review</Button>
              )}
              {selectedFresh.stage === 'Under Review' && (
                <Button size="sm" onClick={() => { reviewAdmission(selectedFresh.id, 'Verification', user!.name); toast.success('Moved to Verification.'); }}>Move to Verification</Button>
              )}
              {selectedFresh.stage === 'Verification' && (
                <>
                  <Button size="sm" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => { reviewAdmission(selectedFresh.id, 'Approved', user!.name, 'Documents verified. Room allocation pending.'); toast.success('Application approved!'); setSelected(null); }}>Approve</Button>
                  <Button size="sm" variant="danger" icon={<XCircle className="h-4 w-4" />} onClick={() => { reviewAdmission(selectedFresh.id, 'Rejected', user!.name, 'Documents incomplete or invalid.'); toast('Application rejected.'); setSelected(null); }}>Reject</Button>
                </>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
