import React, { useState } from 'react';
import { cn } from '../../utils/cn';

export function Tabs({
  tabs,
  defaultTab,
  onChange,
  className,
}: {
  tabs: { id: string; label: string; icon?: React.ReactNode; badge?: number }[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  className?: string;
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  const select = (id: string) => {
    setActive(id);
    onChange?.(id);
  };
  return (
    <div className={cn('flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1', className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => select(t.id)}
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
            active === t.id ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-navy-800'
          )}
        >
          {t.icon}
          {t.label}
          {t.badge !== undefined && t.badge > 0 && (
            <span className="ml-0.5 rounded-full bg-gold-100 px-1.5 py-0.5 text-[10px] font-bold text-gold-700">{t.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function useTabState(initial: string) {
  return useState(initial);
}
