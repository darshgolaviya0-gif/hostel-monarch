import React from 'react';
import toast from 'react-hot-toast';
import { FileStack, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Misc';
import { formatDateIN } from '../../utils/format';

export default function DietRequests() {
  const { user } = useAuth();
  const { dietRequests, reviewDietRequest } = useAppData();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-extrabold text-navy-950">Diet Requests</h2>
        <p className="text-sm text-slate-500">Review special, medical and religious dietary requests from students.</p>
      </div>

      {dietRequests.length === 0 ? (
        <EmptyState icon={<FileStack className="h-7 w-7" />} title="No diet requests" message="No dietary requests have been submitted yet." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {dietRequests.map((d) => (
            <Card key={d.id} hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-navy-950">{d.studentName}</p>
                  <p className="text-xs text-slate-400">{d.room} · Requested {formatDateIN(d.requestedOn)}</p>
                </div>
                <Badge status={d.status} />
              </div>
              <Badge tone="gold" dot={false} className="mt-2">{d.diet}</Badge>
              <p className="mt-2 text-sm text-slate-600">{d.reason}</p>
              {d.status === 'Pending' && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => { reviewDietRequest(d.id, true, user!.name); toast.success('Diet request approved.'); }}>Approve</Button>
                  <Button size="sm" variant="outline" icon={<XCircle className="h-4 w-4" />} onClick={() => { reviewDietRequest(d.id, false, user!.name); toast('Diet request rejected.'); }}>Reject</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
