import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TimerOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function SessionExpiredModal() {
  const { sessionExpired, dismissExpiry } = useAuth();
  const navigate = useNavigate();
  if (!sessionExpired) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-sm animate-scale-in rounded-2xl bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <TimerOff className="h-7 w-7" />
        </div>
        <h3 className="mt-4 font-display text-lg font-bold text-navy-950">Your session has expired</h3>
        <p className="mt-1.5 text-sm text-slate-500">For your security, you've been signed out after a period of inactivity. Please sign in again to continue.</p>
        <button
          onClick={() => { dismissExpiry(); navigate('/login'); }}
          className="mt-6 w-full rounded-xl bg-navy-900 py-2.5 text-sm font-semibold text-white hover:bg-navy-950"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}
