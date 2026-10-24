import React from 'react';
import { cn } from '../../utils/cn';
import { toneFor, type BadgeTone } from '../../utils/status';

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  danger: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  gold: 'bg-gold-50 text-gold-700 ring-gold-400/30',
  purple: 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

const DOT_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  neutral: 'bg-slate-400',
  gold: 'bg-gold-500',
  purple: 'bg-violet-500',
};

export function Badge({
  status,
  children,
  tone,
  dot = true,
  className,
}: {
  status?: string;
  children?: React.ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}) {
  const resolvedTone = tone ?? (status ? toneFor(status) : 'neutral');
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset whitespace-nowrap',
        TONE_CLASSES[resolvedTone],
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', DOT_CLASSES[resolvedTone])} />}
      {children ?? status}
    </span>
  );
}
