import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Siren, Phone, Flame, HeartPulse, ShieldAlert, MapPin, Megaphone } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

const CONTACTS = [
  { icon: Phone, label: 'Security Desk', value: '+91 90000 99999' },
  { icon: Flame, label: 'Fire Department (Surat)', value: '101' },
  { icon: HeartPulse, label: 'Ambulance', value: '108' },
  { icon: ShieldAlert, label: 'Local Police Station', value: '100' },
  { icon: MapPin, label: 'Nearest Hospital — Surat City Hospital', value: '+91 261 223 4567' },
];

export default function Emergency() {
  const [alertSent, setAlertSent] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const triggerAlert = () => {
    setConfirmOpen(false);
    setAlertSent(true);
    toast.success('Emergency alert broadcast to all staff and wardens.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-extrabold text-navy-950">Emergency Console</h2>
        <p className="text-sm text-slate-500">Quick access to emergency contacts and hostel-wide alert broadcasting.</p>
      </div>

      {alertSent && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 animate-fade-in">
          <Siren className="h-5 w-5 animate-pulse" /> Emergency alert is currently active and has been broadcast to all residents and staff.
        </div>
      )}

      <Card className="border-rose-200 bg-rose-50/40">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-600 text-white">
            <Siren className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-navy-950">Broadcast Emergency Alert</h3>
            <p className="mt-1 max-w-md text-sm text-slate-500">Notify all wardens, security and administration staff immediately of a hostel-wide emergency.</p>
          </div>
          <Button variant="danger" size="lg" icon={<Megaphone className="h-5 w-5" />} onClick={() => setConfirmOpen(true)}>
            Trigger Emergency Alert
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Emergency Contact Directory" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CONTACTS.map((c) => (
            <div key={c.label} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700"><c.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-semibold text-navy-950">{c.label}</p>
                <p className="text-xs text-slate-500">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Emergency Broadcast">
        <p className="text-sm text-slate-600">This will immediately alert all administration, warden and security staff. Use only for genuine emergencies. Continue?</p>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="danger" fullWidth onClick={triggerAlert}>Confirm & Broadcast</Button>
        </div>
      </Modal>
    </div>
  );
}
