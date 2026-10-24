import React, { useMemo, useRef, useState } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  Plus, QrCode, CalendarRange, MapPin, Download, ShieldCheck, Crown,
  Printer, Clock3, AlertTriangle, History,
} from 'lucide-react';
import { useCurrentStudent } from '../../hooks/useCurrentStudent';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState, Select } from '../../components/ui/Misc';
import { cn } from '../../utils/cn';
import { formatDateIN } from '../../utils/format';
import type { LeaveType, QRPass } from '../../types';

const LEAVE_TYPES: LeaveType[] = ['Home Visit', 'Medical', 'Personal', 'Emergency', 'Academic'];
const DEMO_NOW = new Date('2026-10-04T22:45:00');

function parsePassDate(str: string) {
  // Handles both ISO strings and "2026-10-13 11:59 PM" style pass timestamps.
  const normalized = str.replace(' ', 'T').replace(/T(\d{1,2}):(\d{2}) (AM|PM)/, (_m, h, mi, ap) => {
    let hour = parseInt(h, 10);
    if (ap === 'PM' && hour !== 12) hour += 12;
    if (ap === 'AM' && hour === 12) hour = 0;
    return `T${String(hour).padStart(2, '0')}:${mi}:00`;
  });
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? new Date(str) : d;
}

function passCountdown(pass: QRPass) {
  const expires = parsePassDate(pass.expiresAt);
  const diffMs = expires.getTime() - DEMO_NOW.getTime();
  const expired = diffMs <= 0;
  const abs = Math.abs(diffMs);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs % 86400000) / 3600000);
  const label = days > 0 ? `${days}d ${hours}h` : `${hours}h`;
  return { expired, label, expiringSoon: !expired && diffMs <= 1000 * 60 * 60 * 24 };
}

export default function Leave({ variant }: { variant: 'student' }) {
  void variant;
  const student = useCurrentStudent();
  const { leaves, createLeave, gateLogs } = useAppData();
  const [showCreate, setShowCreate] = useState(false);
  const [qrView, setQrView] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const hiddenQrRef = useRef<HTMLDivElement>(null);

  const myLeaves = leaves.filter((l) => l.studentId === student.id).sort((a, b) => b.appliedOn.localeCompare(a.appliedOn));
  const activeLeave = myLeaves.find((l) => l.id === qrView);
  const activeQR = activeLeave?.qrPass;
  const passLogs = activeQR ? gateLogs.filter((g) => g.passId === activeQR.passId).sort((a, b) => b.timestamp.localeCompare(a.timestamp)) : [];
  const countdown = activeQR ? passCountdown(activeQR) : null;
  const liveStatus: 'Valid' | 'Expired' | 'Expiring' = !activeQR ? 'Valid' : countdown!.expired ? 'Expired' : countdown!.expiringSoon ? 'Expiring' : 'Valid';

  const downloadPass = async () => {
    if (!activeQR) return;
    setDownloading(true);
    try {
      const canvas = await buildPassImage(activeQR, liveStatus, countdown?.label ?? '');
      canvas.toBlob((blob) => {
        if (!blob) { toast.error('Could not generate pass image.'); setDownloading(false); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeQR.passId}-gate-pass.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success('Gate pass downloaded as image.');
        setDownloading(false);
      }, 'image/png');
    } catch {
      toast.error('Could not generate pass image.');
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-950">Leave & Gate Pass</h2>
          <p className="text-sm text-slate-500">Apply for leave and manage your digital hostel gate passes.</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>Apply for Leave</Button>
      </div>

      {myLeaves.length === 0 ? (
        <EmptyState icon={<CalendarRange className="h-7 w-7" />} title="No leave requests yet" message="Apply for your first leave request to get started." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {myLeaves.map((l) => {
            const lc = l.qrPass ? passCountdown(l.qrPass) : null;
            return (
              <Card key={l.id} hover>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-base font-bold text-navy-950">{l.type} Leave</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500"><CalendarRange className="h-3.5 w-3.5" /> {formatDateIN(l.startDate)} – {formatDateIN(l.endDate)}</p>
                  </div>
                  <Badge status={l.status} />
                </div>
                <p className="mt-3 text-sm text-slate-500">{l.reason}</p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400"><MapPin className="h-3.5 w-3.5" /> {l.destination}</div>
                {l.reviewRemark && (
                  <p className="mt-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-500">
                    <span className="font-semibold text-navy-700">{l.reviewedBy}:</span> {l.reviewRemark}
                  </p>
                )}
                {l.qrPass && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="outline" icon={<QrCode className="h-4 w-4" />} onClick={() => setQrView(l.id)}>
                      View Gate Pass
                    </Button>
                    {lc && (
                      <span className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                        lc.expired ? 'bg-rose-50 text-rose-600' : lc.expiringSoon ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      )}>
                        <Clock3 className="h-3 w-3" /> {lc.expired ? 'Expired' : `${lc.label} left`}
                      </span>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <CreateLeaveModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(data) => {
          createLeave({ ...data, studentId: student.id, studentName: student.name, room: student.allocation?.room ?? '—' });
          toast.success('Leave request submitted for warden review.');
          setShowCreate(false);
        }}
      />

      {/* Off-screen high-density QR used only to build the downloadable pass image */}
      <div ref={hiddenQrRef} style={{ position: 'fixed', top: -9999, left: -9999 }}>
        {activeQR && <QRCodeCanvas id="hidden-qr-canvas" value={activeQR.payload} size={320} level="H" fgColor="#0c1630" />}
      </div>

      <Modal open={!!activeQR} onClose={() => setQrView(null)} title="Digital Gate Pass" size="sm">
        {activeQR && activeLeave && (
          <div>
            <div id="gate-pass-printable" className="overflow-hidden rounded-2xl border border-navy-100 shadow-sm">
              {/* Header band */}
              <div className="brand-gradient relative px-5 pb-6 pt-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                      <Crown className="h-4.5 w-4.5 text-gold-400" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-extrabold leading-tight">HOSTEL MONARCH</p>
                      <p className="text-[10px] uppercase tracking-wider text-navy-200">Digital Gate Pass</p>
                    </div>
                  </div>
                  <span className={cn(
                    'rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide',
                    liveStatus === 'Valid' ? 'bg-emerald-400/20 text-emerald-200' : liveStatus === 'Expiring' ? 'bg-amber-400/20 text-amber-200' : 'bg-rose-400/20 text-rose-200'
                  )}>
                    {liveStatus === 'Valid' ? 'Valid' : liveStatus === 'Expiring' ? 'Expiring Soon' : 'Expired'}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="font-display text-lg font-extrabold">{activeQR.studentName}</p>
                  <p className="text-xs text-navy-200">{student.id} · {activeQR.hostel} · Room {activeQR.room}</p>
                </div>
              </div>

              {/* Perforated divider */}
              <div className="relative flex items-center bg-white px-5">
                <div className="h-4 w-4 -translate-x-1/2 rounded-full bg-slate-100" />
                <div className="my-0 flex-1 border-t-2 border-dashed border-slate-200" />
                <div className="h-4 w-4 translate-x-1/2 rounded-full bg-slate-100" />
              </div>

              {/* Body */}
              <div className="bg-white px-5 pb-5 pt-4">
                <div className="flex justify-center">
                  <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                    <QRCodeSVG value={activeQR.payload} size={168} fgColor="#0c1630" level="H" />
                  </div>
                </div>
                <p className="mt-3 text-center font-mono text-sm font-bold tracking-wider text-navy-950">{activeQR.passId}</p>

                <div className="mt-4 grid grid-cols-2 gap-2.5 text-sm">
                  <InfoCell label="Leave Period" value={activeQR.leavePeriod} />
                  <InfoCell label="Issued" value={activeQR.issuedAt} />
                  <InfoCell label="Expires" value={activeQR.expiresAt} />
                  <InfoCell
                    label={liveStatus === 'Expired' ? 'Expired Since' : 'Time Remaining'}
                    value={countdown ? (countdown.expired ? `${countdown.label} ago` : countdown.label) : '—'}
                    tone={liveStatus === 'Expired' ? 'rose' : liveStatus === 'Expiring' ? 'amber' : 'emerald'}
                  />
                </div>

                {liveStatus !== 'Valid' && (
                  <div className={cn('mt-3 flex items-start gap-2 rounded-xl p-2.5 text-xs', liveStatus === 'Expired' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700')}>
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {liveStatus === 'Expired'
                      ? 'This pass has expired and can no longer be used for gate entry/exit.'
                      : 'This pass expires soon — complete your return before it lapses.'}
                  </div>
                )}

                {passLogs.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500"><History className="h-3.5 w-3.5" /> Gate Activity</p>
                    <div className="space-y-1.5">
                      {passLogs.map((g) => (
                        <div key={g.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs">
                          <span className="font-semibold text-navy-800">{g.direction} · {g.result}</span>
                          <span className="text-slate-400">{g.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-start gap-2 rounded-xl bg-navy-50 p-2.5 text-[11px] text-navy-700">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Present this QR code at the security gate for scanning on both exit and return. This is a demo digital pass, not a legal travel document.
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button variant="outline" fullWidth icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>Print</Button>
              <Button fullWidth loading={downloading} icon={<Download className="h-4 w-4" />} onClick={downloadPass}>
                {downloading ? 'Preparing…' : 'Download PNG'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function InfoCell({ label, value, tone }: { label: string; value: string; tone?: 'emerald' | 'amber' | 'rose' }) {
  const toneClass = tone === 'emerald' ? 'text-emerald-600' : tone === 'amber' ? 'text-amber-600' : tone === 'rose' ? 'text-rose-600' : 'text-navy-950';
  return (
    <div className="rounded-xl bg-slate-50 p-2.5">
      <p className="text-[10px] uppercase text-slate-400">{label}</p>
      <p className={cn('mt-0.5 text-xs font-bold', toneClass)}>{value}</p>
    </div>
  );
}

/** Builds a polished, downloadable PNG replica of the on-screen gate pass using Canvas 2D. */
async function buildPassImage(pass: QRPass, liveStatus: 'Valid' | 'Expiring' | 'Expired', countdownLabel: string): Promise<HTMLCanvasElement> {
  const W = 640, H = 940;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const statusColor = liveStatus === 'Valid' ? '#059669' : liveStatus === 'Expiring' ? '#d97706' : '#e11d48';
  const statusBg = liveStatus === 'Valid' ? '#ecfdf5' : liveStatus === 'Expiring' ? '#fffbeb' : '#fff1f2';

  // Card background
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 0, 0, W, H, 28);
  ctx.fill();

  // Header gradient band
  const grad = ctx.createLinearGradient(0, 0, W, 300);
  grad.addColorStop(0, '#13234a');
  grad.addColorStop(1, '#1f3366');
  ctx.save();
  roundRect(ctx, 0, 0, W, 300, 28, true, false);
  ctx.clip();
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, 300);
  ctx.restore();

  // Crest circle
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.beginPath();
  ctx.arc(60, 60, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e0ab38';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♛', 60, 62);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('HOSTEL MONARCH', 100, 52);
  ctx.fillStyle = '#c3d0ec';
  ctx.font = '13px sans-serif';
  ctx.fillText('DIGITAL GATE PASS', 100, 74);

  // Status pill
  ctx.font = 'bold 13px sans-serif';
  const pillText = liveStatus === 'Valid' ? 'VALID' : liveStatus === 'Expiring' ? 'EXPIRING SOON' : 'EXPIRED';
  const pillW = ctx.measureText(pillText).width + 28;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, W - 36 - pillW, 32, pillW, 32, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(pillText, W - 36 - pillW / 2, 48);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(pass.studentName, 40, 190);
  ctx.fillStyle = '#c3d0ec';
  ctx.font = '14px sans-serif';
  ctx.fillText(`${pass.studentId} · ${pass.hostel} · Room ${pass.room}`, 40, 220);

  // Perforation
  ctx.strokeStyle = '#e2e8f0';
  ctx.setLineDash([8, 8]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, 300);
  ctx.lineTo(W - 30, 300);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath(); ctx.arc(0, 300, 16, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(W, 300, 16, 0, Math.PI * 2); ctx.fill();

  // QR code (rendered off-screen via qrcode.react canvas)
  const qrSourceCanvas = document.getElementById('hidden-qr-canvas') as HTMLCanvasElement | null;
  const qrSize = 230;
  const qrX = W / 2 - qrSize / 2;
  const qrY = 330;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  roundRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 16);
  ctx.fill();
  ctx.stroke();
  if (qrSourceCanvas) {
    ctx.drawImage(qrSourceCanvas, qrX, qrY, qrSize, qrSize);
  }

  // Pass ID
  ctx.fillStyle = '#0c1630';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(pass.passId, W / 2, qrY + qrSize + 48);

  // Info grid
  const infoY = qrY + qrSize + 80;
  const cellW = (W - 80) / 2;
  const cells: [string, string, string][] = [
    ['LEAVE PERIOD', pass.leavePeriod, '#0c1630'],
    ['ISSUED', pass.issuedAt, '#0c1630'],
    ['EXPIRES', pass.expiresAt, '#0c1630'],
    [liveStatus === 'Expired' ? 'EXPIRED SINCE' : 'TIME REMAINING', countdownLabel || '—', statusColor],
  ];
  cells.forEach(([label, value, color], idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 40 + col * (cellW + 20);
    const y = infoY + row * 86;
    ctx.fillStyle = '#f8fafc';
    roundRect(ctx, x, y, cellW, 70, 12);
    ctx.fill();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText(label, x + 16, y + 24);
    ctx.fillStyle = color;
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(value, x + 16, y + 48);
  });

  // Status banner
  const bannerY = infoY + 190;
  ctx.fillStyle = statusBg;
  roundRect(ctx, 40, bannerY, W - 80, 54, 12);
  ctx.fill();
  ctx.fillStyle = statusColor;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  const msg = liveStatus === 'Valid'
    ? 'Valid for single entry & exit during the leave period'
    : liveStatus === 'Expiring'
      ? 'Expires soon — return before the pass lapses'
      : 'This pass has expired and cannot be used for gate entry';
  ctx.fillText(msg, W / 2, bannerY + 33);

  // Footer
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px sans-serif';
  ctx.fillText('Demo digital gate pass · Hostel Monarch · Not a legal travel document', W / 2, H - 24);

  return canvas;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, topOnly = false, bottomOnly = false) {
  ctx.beginPath();
  if (topOnly) {
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    return;
  }
  if (bottomOnly) {
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.closePath();
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function CreateLeaveModal({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void;
  onCreate: (data: { type: LeaveType; startDate: string; endDate: string; reason: string; destination: string; emergencyContact: string }) => void;
}) {
  const [form, setForm] = useState({ type: 'Home Visit' as LeaveType, startDate: '2026-10-12', endDate: '2026-10-14', reason: '', destination: '', emergencyContact: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reason.trim() || !form.destination.trim() || !form.emergencyContact.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    onCreate(form);
    setForm({ type: 'Home Visit', startDate: '2026-10-12', endDate: '2026-10-14', reason: '', destination: '', emergencyContact: '' });
  };

  return (
    <Modal open={open} onClose={onClose} title="Apply for Leave">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-900">Leave Type</label>
          <Select value={form.type} onChange={(v) => setForm({ ...form, type: v as LeaveType })} options={LEAVE_TYPES.map((t) => ({ value: t, label: t }))} className="w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-900">Start Date</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-900">End Date</label>
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-900">Destination</label>
          <input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="e.g. Vadodara, Gujarat" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-900">Reason</label>
          <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="Reason for leave…" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy-900">Emergency Contact (while on leave)</label>
          <input value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} placeholder="+91 98250 11234" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
        </div>
        <Button type="submit" fullWidth>Submit Leave Request</Button>
      </form>
    </Modal>
  );
}
