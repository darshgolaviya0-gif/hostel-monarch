import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  GraduationCap, ShieldCheck, KeyRound, Shield, Wrench, UtensilsCrossed, Wallet,
  Eye, EyeOff, Mail, Lock, User as UserIcon, Phone, AlertCircle, ArrowRight, Sparkles, ArrowLeft, MailCheck, ServerCog,
} from 'lucide-react';
import { Logo } from '../../components/layout/Logo';
import { BackButton } from '../../components/layout/BackButton';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_META } from '../../data/users';
import type { Role } from '../../types';
import { Button } from '../../components/ui/Button';
import { isLiveMode } from '../../lib/supabase';

const ICONS: Record<string, React.ElementType> = {
  GraduationCap, ShieldCheck, KeyRound, Shield, Wrench, UtensilsCrossed, Wallet,
};

export default function Signup() {
  const [params] = useSearchParams();
  const initialRole = (params.get('role') as Role) ?? 'student';
  const [selectedRole, setSelectedRole] = useState<Role>(ROLE_META.some((r) => r.id === initialRole) ? initialRole : 'student');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [course, setCourse] = useState('');
  const [designation, setDesignation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'sent'>('idle');
  const [error, setError] = useState('');

  const { signUp } = useAuth();
  const navigate = useNavigate();

  if (!isLiveMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-50 text-gold-700">
            <ServerCog className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-xl font-extrabold text-navy-950">Live Mode Not Connected</h1>
          <p className="mt-2 text-sm text-slate-500">
            This demo is currently running in <strong>demo mode</strong> with simulated accounts. To let real staff
            and students create their own accounts, connect a free Supabase project — see{' '}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">.env.example</code> and{' '}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">supabase/schema.sql</code> in the project files.
          </p>
          <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:text-gold-600">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setStatus('error'); setError('Please fill in all required fields.'); return;
    }
    if (password.length < 8) {
      setStatus('error'); setError('Password must be at least 8 characters.'); return;
    }
    if (password !== confirm) {
      setStatus('error'); setError('Passwords do not match.'); return;
    }
    setStatus('loading');
    const meta: Record<string, unknown> = selectedRole === 'student' ? { course } : { designation };
    const result = await signUp({ role: selectedRole, fullName, email, phone, password, meta });
    if (!result.success) {
      setStatus('error');
      setError(result.error ?? 'Could not create your account. Please try again.');
      return;
    }
    if (result.needsEmailConfirmation) {
      setStatus('sent');
    } else {
      navigate('/account-status');
    }
  };

  if (status === 'sent') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl animate-scale-in">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <MailCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-xl font-extrabold text-navy-950">Check your inbox</h1>
          <p className="mt-2 text-sm text-slate-500">
            We've sent a verification link to <strong>{email}</strong>. Click it to confirm your email, then sign in —
            your account will be <strong>pending admin approval</strong> until a hostel administrator activates it.
          </p>
          <Link to="/login">
            <Button className="mt-6" fullWidth>Back to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="brand-gradient relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 15% 15%, white 0, transparent 30%), radial-gradient(circle at 85% 85%, #e0ab38 0, transparent 35%)' }} />
        <Link to="/" className="relative z-10"><Logo dark subtitle={false} /></Link>
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-gold-300 ring-1 ring-white/20">
            <Sparkles className="h-3.5 w-3.5" /> Create your account
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold leading-snug text-white">
            Join Hostel Monarch — built for your role.
          </h2>
          <p className="mt-3 max-w-md text-sm text-navy-300">
            Submit your details once. An administrator reviews and approves every new staff or student account before
            it goes live, keeping your hostel's data secure.
          </p>
        </div>
        <p className="relative z-10 text-xs text-navy-400">© 2026 Hostel Monarch.</p>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <BackButton fallback="/" label="Back" className="mb-6 -ml-2.5 lg:hidden" />
          <div className="mb-6 lg:hidden"><Link to="/" aria-label="Go to homepage"><Logo /></Link></div>

          <h1 className="font-display text-2xl font-extrabold text-navy-950">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Choose your role to get started.</p>

          <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {ROLE_META.map((r) => {
              const Icon = ICONS[r.icon];
              const active = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
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

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy-900">Full Name</label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Aarav Patel"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy-900">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy-900">Phone</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
                </div>
              </div>
            </div>

            {selectedRole === 'student' ? (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy-900">Course / Program</label>
                <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="B.Tech Computer Engineering"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy-900">Designation</label>
                <input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Assistant Warden"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy-900">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-9 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy-900">Confirm Password</label>
                <input type={showPassword ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" />
              </div>
            </div>

            {status === 'error' && (
              <div className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-700 animate-fade-in">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={status === 'loading'} icon={<ArrowRight className="h-4 w-4" />}>
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="font-semibold text-navy-700 hover:text-gold-600">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
