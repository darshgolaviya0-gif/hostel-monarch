import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock3, XCircle, Ban, RefreshCw, LogOut } from 'lucide-react';
import { Logo } from '../../components/layout/Logo';
import { BackButton } from '../../components/layout/BackButton';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { ROLE_META } from '../../data/users';

const CONTENT: Record<string, { icon: React.ElementType; tone: string; title: string; body: string }> = {
  pending: {
    icon: Clock3,
    tone: 'text-gold-700 bg-gold-50',
    title: 'Your account is awaiting approval',
    body: 'Thanks for signing up! A hostel administrator needs to review and approve your account before you can access the dashboard. You\'ll be able to sign in as soon as it\'s approved.',
  },
  rejected: {
    icon: XCircle,
    tone: 'text-rose-700 bg-rose-50',
    title: 'Your application was not approved',
    body: 'An administrator has reviewed your application and it was not approved at this time. If you believe this is a mistake, please contact the hostel administration office.',
  },
  suspended: {
    icon: Ban,
    tone: 'text-rose-700 bg-rose-50',
    title: 'Your account has been suspended',
    body: 'Your access has been temporarily suspended by an administrator. Please contact the hostel administration office for more information.',
  },
};

export default function AccountStatus() {
  const { accountStatus, user, logout } = useAuth();
  const navigate = useNavigate();
  const info = CONTENT[accountStatus ?? 'pending'];
  const Icon = info.icon;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 px-4">
      <div className="mb-6 w-full max-w-md"><BackButton fallback="/login" label="Back to sign in" className="text-navy-200 hover:bg-white/10 hover:text-white" /></div>
      <Link to="/" aria-label="Go to homepage"><Logo dark subtitle={false} /></Link>
      <div className="mt-8 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl animate-scale-in">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${info.tone}`}>
          <Icon className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-display text-xl font-extrabold text-navy-950">{info.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{info.body}</p>
        {user && (
          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-left text-xs text-slate-500">
            <p><span className="font-semibold text-slate-700">Name:</span> {user.name}</p>
            <p><span className="font-semibold text-slate-700">Email:</span> {user.email}</p>
            <p><span className="font-semibold text-slate-700">Requested Role:</span> {ROLE_META.find((r) => r.id === user.role)?.label}</p>
          </div>
        )}
        <div className="mt-6 flex gap-3">
          <button onClick={() => window.location.reload()} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <RefreshCw className="h-4 w-4" /> Refresh Status
          </button>
          <Button className="flex-1" icon={<LogOut className="h-4 w-4" />} onClick={() => { logout(); navigate('/login'); }}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
