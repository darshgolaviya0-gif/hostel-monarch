import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { PublicFooter } from '../components/layout/PublicFooter';
import { BackButton } from '../components/layout/BackButton';

export default function PublicLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicNavbar />
      {!isHome && (
        <div className="border-b border-slate-100 bg-slate-50/70">
          <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
            <BackButton fallback="/" />
          </div>
        </div>
      )}
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
