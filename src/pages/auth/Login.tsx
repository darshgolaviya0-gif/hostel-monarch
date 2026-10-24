import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  GraduationCap, ShieldCheck, KeyRound, Shield, Wrench, UtensilsCrossed, Wallet,
  Eye, EyeOff, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight, Sparkles,
} from 'lucide-react';
import { Logo } from '../../components/layout/Logo';
import { BackButton } from '../../components/layout/BackButton';
import { useAuth } from '../../contexts/AuthContext';
import { DEMO_USERS, ROLE_META } from '../../data/users';
import type { Role } from '../../types';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { isLiveMode } from '../../lib/supabase';

const ICONS: Record<string, React.ElementType> = {
  GraduationCap, ShieldCheck, KeyRound, Shield, Wrench, UtensilsCrossed, Wallet,
};

export default function Login() {
  const [params] = useSearchParams();
  const initialRole = (params.get('role') as Role) ?? null;
  const roleGroup = params.get('role');
  const defaultRole: Role = roleGroup === 'admin' ? 'admin' : roleGroup === 'staff' ? 'warden' : initialRole && ROLE_META.some(r => r.id === initialRole) ? initialRole : 'student';

  const [selectedRole, setSelectedRole] = useState<Role>(defaultRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const { login, loginWithDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setStatus('error');
      setError('Please enter both your email/username and password.');
      return;
    }
    setStatus('loading');
    setError('');
    const result = await login(selectedRole, identifier, password, remember);
    if (result.success) {
      setStatus('success');
      if (result.accountStatus) {
        toast(`Signed in — your account is ${result.accountStatus}.`, { icon: '⏳' });
        setTimeout(() => navigate('/account-status'), 400);
        return;
      }
      toast.success(`Welcome back! Signed in as ${ROLE_META.find((r) => r.id === selectedRole)?.label}.`);
      setTimeout(() => navigate('/app/dashboard'), 500);
    } else {
      setStatus('error');
      setError(result.error ?? 'Login failed. Please try again.');
    }
  };

  const handleDemo = async () => {
    setStatus('loading');
    setError('');
    const result = await loginWithDemo(selectedRole);
    if (result.success) {
      setStatus('success');
      toast.success(`Demo session started as ${ROLE_META.find((r) => r.id === selectedRole)?.label}.`);
      setTimeout(() => navigate('/app/dashboard'), 500);
    } else {
      setStatus('error');
      setError(result.error ?? 'Could not start demo session.');
    }
  };

  const demoUser = DEMO_USERS[selectedRole];

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="brand-gradient relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 15% 15%, white 0, transparent 30%), radial-gradient(circle at 85% 85%, #e0ab38 0, transparent 35%)' }} />
        <Link to="/" className="relative z-10">
          <Logo dark subtitle={false} />
        </Link>
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-gold-300 ring-1 ring-white/20">
            <Sparkles className="h-3.5 w-3.5" /> Smart Hostel Management Platform
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold leading-snug text-white">
            One secure login for your entire hostel ecosystem.
          </h2>
          <p className="mt-3 max-w-md text-sm text-navy-300">
            Students, wardens, security, mess staff, maintenance and administration — every role has a tailored
            dashboard built for their daily workflow.
          </p>
        </div>
        <p className="relative z-10 text-xs text-navy-400">
          {isLiveMode ? '© 2026 Hostel Monarch. All rights reserved.' : '© 2026 Hostel Monarch. Demo environment — no real data is processed.'}
        </p>
      </div>

      {/* Right: login form */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <BackButton fallback="/" label="Back" className="mb-6 -ml-2.5 lg:hidden" />
          <div className="mb-6 lg:hidden"><Link to="/" aria-label="Go to homepage"><Logo /></Link></div>

          <h1 className="font-display text-2xl font-extrabold text-navy-950">Sign in to Hostel Monarch</h1>
          <p className="mt-1 text-sm text-slate-500">Choose your role, then sign in with your credentials.</p>

          {/* Role picker */}
          <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {ROLE_META.map((r) => {
              const Icon = ICONS[r.icon];
              const active = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => { setSelectedRole(r.id); setStatus('idle'); setError(''); }}
                  title={r.label}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-all ${
                    active ? 'border-navy-800 bg-navy-900 text-gold-400 shadow-md' : 'border-slate-200 text-slate-400 hover:border-navy-200 hover:text-navy-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[9px] font-bold leading-tight">{r.id === 'admin' ? 'Admin' : r.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-400">{ROLE_META.find((r) => r.id === selectedRole)?.description}</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="identifier" className="mb-1.5 block text-sm font-semibold text-navy-900">Email or Username</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={demoUser.email}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100"
                />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-navy-900">Password</label>
                <button type="button" onClick={() => setShowForgot(true)} className="text-xs font-semibold text-navy-600 hover:text-gold-600">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-10 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-navy-700 focus:ring-navy-400" />
                Remember me
              </label>
              {status === 'success' && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Signed in</span>
              )}
            </div>

            {status === 'error' && (
              <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-700 animate-fade-in">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={status === 'loading'} icon={<ArrowRight className="h-4 w-4" />}>
              Sign In
            </Button>
          </form>

          {!isLiveMode && (
            <>
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-xs font-semibold text-slate-400">OR</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <button
                onClick={handleDemo}
                disabled={status === 'loading'}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold-300 bg-gold-50 py-3 text-sm font-bold text-gold-800 transition hover:bg-gold-100 disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" /> Use Demo {ROLE_META.find((r) => r.id === selectedRole)?.label} Account
              </button>

              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                <p className="font-bold text-slate-600">Demo credentials ({ROLE_META.find((r) => r.id === selectedRole)?.label})</p>
                <p className="mt-1">Email: <span className="font-mono text-slate-700">{demoUser.email}</span></p>
                <p>Password: <span className="font-mono text-slate-700">Demo@123</span></p>
              </div>
            </>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            New here? <Link to="/signup" className="font-semibold text-navy-700 hover:text-gold-600">Create an account</Link>
          </p>

          <p className="mt-4 text-center text-xs text-slate-400">
            {isLiveMode
              ? 'Protected by Hostel Monarch account security. New accounts require admin approval.'
              : 'Protected by Hostel Monarch session security. For demonstration purposes only — no real data is stored.'}
          </p>
        </div>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
}

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { requestPasswordReset } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return;
    setLoading(true);
    await requestPasswordReset(email);
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm animate-scale-in rounded-2xl bg-white p-6 shadow-2xl">
        {sent ? (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-navy-950">Recovery Link Sent</h3>
            <p className="mt-1 text-sm text-slate-500">
              {isLiveMode
                ? `We've sent password reset instructions to ${email}. Check your inbox for the link.`
                : `We've sent password reset instructions to ${email}. (Demo simulation — no email is actually sent.)`}
            </p>
            <Button className="mt-5" fullWidth onClick={onClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h3 className="font-display text-lg font-bold text-navy-950">Reset your password</h3>
            <p className="mt-1 text-sm text-slate-500">Enter your account email and we'll send recovery instructions.</p>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="you@hostelmonarch.in"
              className="mt-4 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100"
            />
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <Button type="submit" className="flex-1" loading={loading}>Send Link</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
