import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Logo } from './Logo';
import { ROLE_NAV, COMMON_BOTTOM } from '../../utils/navConfig';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';
import { ROLE_META } from '../../data/users';

export function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  const { user } = useAuth();
  if (!user) return null;
  const items = ROLE_NAV[user.role];
  const roleMeta = ROLE_META.find((r) => r.id === user.role);

  const content = (
    <div className="flex h-full flex-col bg-navy-950">
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/app/dashboard" onClick={onCloseMobile} aria-label="Go to dashboard">
          <Logo dark subtitle={false} />
        </Link>
        <button onClick={onCloseMobile} className="rounded-lg p-1.5 text-navy-300 hover:bg-navy-900 lg:hidden" aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-4 mb-4 rounded-xl bg-navy-900/60 px-3.5 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gold-400">Signed in as</p>
        <p className="mt-0.5 truncate text-sm font-bold text-white">{user.name}</p>
        <p className="truncate text-xs text-navy-300">{roleMeta?.label}</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
                isActive ? 'bg-gold-400 text-navy-950 shadow-sm' : 'text-navy-200 hover:bg-navy-900 hover:text-white'
              )
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-navy-900 px-3 py-4">
        {COMMON_BOTTOM.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
                isActive ? 'bg-navy-900 text-white' : 'text-navy-300 hover:bg-navy-900 hover:text-white'
              )
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-64">{content}</aside>
      {/* Mobile */}
      <div className={cn('fixed inset-0 z-40 lg:hidden', mobileOpen ? '' : 'pointer-events-none')}>
        <div
          className={cn('absolute inset-0 bg-navy-950/50 transition-opacity', mobileOpen ? 'opacity-100' : 'opacity-0')}
          onClick={onCloseMobile}
        />
        <div className={cn('absolute inset-y-0 left-0 w-72 transition-transform duration-200', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
          {content}
        </div>
      </div>
    </>
  );
}
