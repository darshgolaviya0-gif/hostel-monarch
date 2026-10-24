import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ScanLine, Camera, CheckCircle2, XCircle, LogIn, LogOut, Clock, AlertCircle, BadgeCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Misc';

export default function QRVerification() {
  const { user } = useAuth();
  const { leaves, verifyQRPass, gateLogs } = useAppData();
  const [scanning, setScanning] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [result, setResult] = useState<{ result: 'Valid' | 'Invalid' | 'Expired'; passId: string; direction: 'Entry' | 'Exit' } | null>(null);

  const allPasses = leaves.filter((l) => l.qrPass).map((l) => l.qrPass!);
  const matchedLeave = result ? leaves.find((l) => l.qrPass?.passId === result.passId) : null;
  // gateLogs is prepended on each verification, so the first matching entry is the one just recorded.
  const matchedLog = result ? gateLogs.find((g) => g.passId === result.passId) : null;

  const simulateScan = () => {
    if (allPasses.length === 0) { toast.error('No gate passes available to simulate.'); return; }
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      const sample = allPasses[Math.floor(Math.random() * allPasses.length)];
      setScanning(false);
      setPassInput(sample.passId);
      const res = verifyQRPass(sample.passId, 'Entry', user!.name);
      setResult({ result: res.result, passId: sample.passId, direction: 'Entry' });
      if (res.result === 'Valid') toast.success('Pass verified — Entry recorded.');
      else toast.error(`Pass is ${res.result}.`);
    }, 1400);
  };

  const manualVerify = (direction: 'Entry' | 'Exit') => {
    if (!passInput.trim()) { toast.error('Enter a pass ID to verify.'); return; }
    const res = verifyQRPass(passInput.trim(), direction, user!.name);
    setResult({ result: res.result, passId: passInput.trim(), direction });
    if (res.result === 'Valid') toast.success(`Pass verified — ${direction} recorded.`);
    else toast.error(`Pass is ${res.result}.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-extrabold text-navy-950">QR Pass Verification</h2>
        <p className="text-sm text-slate-500">Scan or enter a student's gate pass ID to verify and record entry/exit.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Camera Scanner" icon={<Camera className="h-4.5 w-4.5" />} />
          <div className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed ${scanning ? 'border-gold-400 bg-navy-950' : 'border-slate-200 bg-slate-50'}`}>
            {scanning ? (
              <div className="text-center text-white">
                <div className="mx-auto h-40 w-40 animate-pulse rounded-2xl border-4 border-gold-400" />
                <p className="mt-4 text-sm font-semibold">Scanning for QR code…</p>
              </div>
            ) : (
              <div className="text-center text-slate-300">
                <ScanLine className="mx-auto h-16 w-16" />
                <p className="mt-3 text-sm font-semibold text-slate-400">Camera preview placeholder</p>
              </div>
            )}
          </div>
          <Button fullWidth className="mt-4" loading={scanning} icon={<ScanLine className="h-4 w-4" />} onClick={simulateScan}>
            {scanning ? 'Scanning…' : 'Simulate QR Scan'}
          </Button>

          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-semibold text-navy-900">Or enter Pass ID manually</label>
            <input
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              placeholder="e.g. HM-PASS-88291"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100"
            />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button variant="secondary" icon={<LogIn className="h-4 w-4" />} onClick={() => manualVerify('Entry')}>Verify Entry</Button>
              <Button variant="outline" icon={<LogOut className="h-4 w-4" />} onClick={() => manualVerify('Exit')}>Verify Exit</Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Verification Result" />
          {!result ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-slate-400">
              <ScanLine className="h-10 w-10" />
              <p className="mt-3 text-sm">Scan a QR pass to see verification details here.</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className={`flex items-center gap-3 rounded-2xl p-4 ${result.result === 'Valid' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                {result.result === 'Valid' ? <CheckCircle2 className="h-9 w-9 text-emerald-600" /> : <XCircle className="h-9 w-9 text-rose-600" />}
                <div>
                  <p className={`font-display text-lg font-extrabold ${result.result === 'Valid' ? 'text-emerald-700' : 'text-rose-700'}`}>{result.result.toUpperCase()}</p>
                  <p className="text-xs text-slate-500">Pass ID: {result.passId} · {result.direction} requested</p>
                </div>
              </div>

              {matchedLeave?.qrPass ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={matchedLeave.studentName} />
                      <div>
                        <p className="text-sm font-bold text-navy-950">{matchedLeave.studentName}</p>
                        <p className="text-xs text-slate-400">{matchedLeave.studentId} · {matchedLeave.qrPass.hostel} · {matchedLeave.qrPass.room}</p>
                      </div>
                    </div>
                    {result.result === 'Valid' && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                        <BadgeCheck className="h-3.5 w-3.5" /> Cleared
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Info label="Leave Period" value={matchedLeave.qrPass.leavePeriod} />
                    <Info label="Expires" value={matchedLeave.qrPass.expiresAt} />
                  </div>
                  {result.result === 'Expired' && (
                    <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> This pass expired on {matchedLeave.qrPass.expiresAt}. Verify with the warden before allowing {result.direction.toLowerCase()}.
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" /> {matchedLog ? `${matchedLog.direction} logged at ${matchedLog.timestamp} by ${matchedLog.verifiedBy}` : 'Gate decision recorded.'}
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> No matching gate pass found for this Pass ID. Double-check the code or ask the student to show their Leave &amp; Gate Pass screen.
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent Verifications" />
        <div className="space-y-2">
          {gateLogs.slice(0, 5).map((g) => (
            <div key={g.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm">
              <span className="font-semibold text-navy-900">{g.studentName} — {g.direction}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{g.timestamp}</span>
                <Badge status={g.result} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 font-semibold text-navy-900">{value}</p>
    </div>
  );
}
