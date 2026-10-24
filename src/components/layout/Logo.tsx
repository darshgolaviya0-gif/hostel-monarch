import React from 'react';
import { cn } from '../../utils/cn';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('h-9 w-9', className)} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="16" fill="#0C1630" />
      <path
        d="M14 40 L14 25 L20.5 19 L27 25.5 L32 17 L37 25.5 L43.5 19 L50 25 L50 40 Z"
        fill="none"
        stroke="#E0AB38"
        strokeWidth="3.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <rect x="14" y="40.5" width="36" height="5" rx="1.6" fill="#E0AB38" />
    </svg>
  );
}

export function Logo({ className, subtitle = true, dark }: { className?: string; subtitle?: boolean; dark?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      <div className="leading-tight">
        <p className={cn('font-display text-[1.05rem] font-extrabold tracking-tight', dark ? 'text-white' : 'text-navy-950')}>
          HOSTEL <span className="gold-gradient-text">MONARCH</span>
        </p>
        {subtitle && (
          <p className={cn('text-[10px] font-semibold uppercase tracking-[0.14em]', dark ? 'text-navy-200' : 'text-slate-400')}>
            Smart Hostel Management
          </p>
        )}
      </div>
    </div>
  );
}
