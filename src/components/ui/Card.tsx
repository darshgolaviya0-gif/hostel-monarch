import React from 'react';
import { cn } from '../../utils/cn';

export function Card({
  children,
  className,
  hover = false,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padded?: boolean;
}) {
  return (
    <div className={cn('card-surface', padded && 'p-5 sm:p-6', hover && 'card-surface-hover', className)}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon && <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700">{icon}</div>}
        <div>
          <h3 className="font-display text-base font-bold text-navy-950">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
