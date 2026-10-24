import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Logo } from '../../components/layout/Logo';
import { BackButton } from '../../components/layout/BackButton';
import { Button } from '../../components/ui/Button';
import { supabase, isLiveMode } from '../../lib/supabase';

export default function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLiveMode || !supabase) return;
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setStatus('error'); setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setStatus('error'); setError('Passwords do not match.'); return; }
    if (!supabase) return;
    setStatus('loading');
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setStatus('error'); setError(err.message); return; }
    setStatus('success');
    toast.success('Password updated. Please sign in with your new password.');
    setTimeout(() => navigate('/login'), 1500);
  };

  if (!isLiveMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
          <h1 className="font-display text-xl font-extrabold text-navy-950">Not available in demo mode</h1>
          <p className="mt-2 text-sm text-slate-500">Password reset requires a connected Supabase project.</p>
          <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-navy-700 hover:text-gold-600">Back to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 px-4">
      <div className="mb-6 w-full max-w-md"><BackButton fallback="/login" label="Back to sign in" className="text-navy-200 hover:bg-white/10 hover:text-white" /></div>
      <Link to="/" aria-label="Go to homepage"><Logo dark subtitle={false} /></Link>
      <div className="mt-8 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-scale-in">
        {!ready ? (
          <p className="text-center text-sm text-slate-500">Validating your reset link…</p>
        ) : status === 'success' ? (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-display text-xl font-extrabold text-navy-950">Password updated</h1>
            <p className="mt-2 text-sm text-slate-500">Redirecting you to sign in…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1 className="font-display text-xl font-extrabold text-navy-950">Set a new password</h1>
            <p className="mt-1 text-sm text-slate-500">Choose a strong password for your Hostel Monarch account.</p>
            <div className="mt-5 space-y-4">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-9 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <input type={showPassword ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
            </div>
            {status === 'error' && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            <Button type="submit" fullWidth className="mt-5" loading={status === 'loading'} icon={<ArrowRight className="h-4 w-4" />}>
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
