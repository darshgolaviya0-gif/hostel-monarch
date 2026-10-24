import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_NAV } from '../utils/navConfig';
import { cn } from '../utils/cn';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  if (!user) return null;
  const mobileItems = ROLE_NAV[user.role].slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="animate-fade-in px-4 pb-24 pt-5 sm:px-6 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        {mobileItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold',
                isActive ? 'text-navy-900' : 'text-slate-400'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('h-5 w-5', isActive && 'text-gold-500')} />
                <span className="truncate">{item.label.split(' ')[0]}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
