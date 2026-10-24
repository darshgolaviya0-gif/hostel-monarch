import React from 'react';
import { Inbox, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { initials } from '../../utils/format';

export function EmptyState({
  title = 'Nothing here yet',
  message = 'There is no data to display right now.',
  icon,
  action,
}: {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
        {icon ?? <Inbox className="h-7 w-7" />}
      </div>
      <h4 className="font-display text-base font-bold text-navy-950">{title}</h4>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100"
      />
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className={cn(
        'rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm font-medium text-slate-700 focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100',
        className
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
      <p className="text-xs text-slate-500">
        Page <span className="font-semibold text-slate-700">{page}</span> of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function Avatar({ name, src, size = 'md' }: { name: string; src?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'h-8 w-8 text-[10px]', md: 'h-10 w-10 text-xs', lg: 'h-14 w-14 text-sm' }[size];
  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover ring-2 ring-white', sizeClasses)} />;
  }
  return (
    <div className={cn('flex items-center justify-center rounded-full bg-navy-100 font-bold text-navy-700 ring-2 ring-white', sizeClasses)}>
      {initials(name)}
    </div>
  );
}

export function ProgressBar({ value, tone = 'navy' }: { value: number; tone?: 'navy' | 'gold' | 'emerald' }) {
  const toneClass = { navy: 'bg-navy-700', gold: 'bg-gold-400', emerald: 'bg-emerald-500' }[tone];
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={cn('h-full rounded-full transition-all duration-500', toneClass)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-lg', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="card-surface p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-7 w-16" />
      <Skeleton className="mt-4 h-2 w-full" />
    </div>
  );
}
