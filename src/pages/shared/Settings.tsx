import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Lock, Bell, Shield, Clock, RefreshCcw, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-semibold text-navy-900">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-navy-800' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user, session, extendSession } = useAuth();
  const [prefs, setPrefs] = useState({ email: true, sms: false, push: true, marketing: false });
  const [showPw, setShowPw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  if (!user || !session) return null;

  const expiresInMin = Math.max(0, Math.round((session.expiresAt - Date.now()) / 60000));

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.current || !pwForm.next) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (pwForm.next.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      toast.error('New password and confirmation do not match.');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Password updated successfully (demo simulation).');
      setPwForm({ current: '', next: '', confirm: '' });
    }, 900);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader title="Session & Security" icon={<Shield className="h-4.5 w-4.5" />} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 p-3.5">
            <p className="text-xs text-slate-400">Logged in as</p>
            <p className="mt-1 text-sm font-bold text-navy-950">{user.role.toUpperCase()}</p>
          </div>
          <div className="rounded-xl border border-slate-100 p-3.5">
            <p className="flex items-center gap-1 text-xs text-slate-400"><Clock className="h-3.5 w-3.5" /> Session expires in</p>
            <p className="mt-1 text-sm font-bold text-navy-950">{expiresInMin} minutes</p>
          </div>
          <div className="flex items-center">
            <Button variant="outline" size="sm" icon={<RefreshCcw className="h-4 w-4" />} onClick={() => { extendSession(); toast.success('Session extended by 30 minutes.'); }}>
              Extend Session
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Change Password" icon={<Lock className="h-4.5 w-4.5" />} subtitle="Demo simulation — no real credentials are changed" />
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-900">Current Password</label>
            <input type="password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="Enter current password" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy-900">New Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-10 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="New password" />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy-900">Confirm Password</label>
              <input type={showPw ? 'text' : 'password'} value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="Confirm new password" />
            </div>
          </div>
          <Button type="submit" loading={saving}>Update Password</Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Notification Preferences" icon={<Bell className="h-4.5 w-4.5" />} />
        <div className="divide-y divide-slate-100">
          <Toggle checked={prefs.email} onChange={(v) => setPrefs({ ...prefs, email: v })} label="Email Notifications" desc="Fee reminders, approvals and important updates" />
          <Toggle checked={prefs.sms} onChange={(v) => setPrefs({ ...prefs, sms: v })} label="SMS Alerts" desc="Critical alerts sent via SMS to your registered number" />
          <Toggle checked={prefs.push} onChange={(v) => setPrefs({ ...prefs, push: v })} label="Push Notifications" desc="Real-time alerts within the Hostel Monarch app" />
          <Toggle checked={prefs.marketing} onChange={(v) => setPrefs({ ...prefs, marketing: v })} label="Newsletters & Updates" desc="Occasional product updates from Hostel Monarch" />
        </div>
        <Button className="mt-4" size="sm" onClick={() => toast.success('Notification preferences saved.')}>Save Preferences</Button>
      </Card>
    </div>
  );
}
