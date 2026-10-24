import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '../../utils/cn';

const LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Facilities', path: '/facilities' },
  { label: 'Rooms', path: '/rooms' },
  { label: 'Services', path: '/services' },
  { label: 'Contact', path: '/contact' },
];

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [loginMenu, setLoginMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.path}
              to={l.path}
              end={l.path === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                  isActive ? 'text-navy-900' : 'text-slate-500 hover:text-navy-800'
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <div className="relative">
            <button
              onClick={() => setLoginMenu((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-navy-800 hover:bg-slate-50"
            >
              Login <ChevronDown className="h-4 w-4" />
            </button>
            {loginMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLoginMenu(false)} />
                <div className="absolute right-0 z-20 mt-2 w-52 animate-scale-in rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl">
                  <Link to="/login?role=student" onClick={() => setLoginMenu(false)} className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Student Login
                  </Link>
                  <Link to="/login?role=staff" onClick={() => setLoginMenu(false)} className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Staff Login
                  </Link>
                  <Link to="/login?role=admin" onClick={() => setLoginMenu(false)} className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Administration Login
                  </Link>
                </div>
              </>
            )}
          </div>
          <Link to="/apply-admission" className="rounded-xl bg-gold-400 px-4 py-2.5 text-sm font-bold text-navy-950 shadow-sm hover:bg-gold-300">
            Apply for Admission
          </Link>
        </div>

        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-navy-800 lg:hidden" aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div className="absolute inset-0 bg-navy-950/60" onClick={() => setOpen(false)} />
            <div className="animate-slide-in-right absolute inset-y-0 right-0 flex w-[82%] max-w-xs flex-col overflow-y-auto bg-white p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <Link to="/" onClick={() => setOpen(false)}>
                  <Logo />
                </Link>
                <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="mt-6 flex flex-col gap-1">
                {LINKS.map((l) => (
                  <NavLink
                    key={l.path}
                    to={l.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors',
                        isActive ? 'bg-navy-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-6 space-y-2 border-t border-slate-200 pt-5">
                <Link to="/apply-admission" onClick={() => setOpen(false)} className="block rounded-xl bg-gold-400 px-4 py-2.5 text-center text-sm font-bold text-navy-950">
                  Apply for Admission
                </Link>
                <Link to="/login?role=student" onClick={() => setOpen(false)} className="block rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-navy-800 hover:bg-slate-50">
                  Student Login
                </Link>
                <Link to="/login" onClick={() => setOpen(false)} className="block rounded-xl bg-navy-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-navy-800">
                  Staff / Admin Login
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}

