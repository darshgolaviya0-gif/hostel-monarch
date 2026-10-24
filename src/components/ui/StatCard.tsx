import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
  tone = 'navy',
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  tone?: 'navy' | 'gold' | 'emerald' | 'rose' | 'sky';
}) {
  const toneClasses: Record<string, string> = {
    navy: 'bg-navy-50 text-navy-700',
    gold: 'bg-gold-50 text-gold-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
    sky: 'bg-sky-50 text-sky-700',
  };
  return (
    <div className="card-surface card-surface-hover p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 font-display text-2xl font-extrabold tracking-tight text-navy-950">{value}</p>
        </div>
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', toneClasses[tone])}>{icon}</div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-xs font-semibold">
          {trend >= 0 ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" />
          )}
          <span className={trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{Math.abs(trend)}%</span>
          <span className="text-slate-400">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
