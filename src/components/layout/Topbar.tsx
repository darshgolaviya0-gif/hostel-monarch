import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, ChevronDown, LogOut, Settings, User as UserIcon, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { Avatar } from '../ui/Misc';
import { BackButton } from './BackButton';
import { cn } from '../../utils/cn';
import { timeAgo } from '../../utils/format';
import toast from 'react-hot-toast';

function titleFromPath(pathname: string) {
  const seg = pathname.split('/').filter(Boolean).pop() ?? 'dashboard';
  return seg
    .split('-')
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(' ');
}

export function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { user, logout } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppData();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;
  const myNotifs = notifications.filter((n) => !n.forRole || n.forRole === user.role);
  const unread = myNotifs.filter((n) => !n.read).length;

  const doLogout = () => {
    logout();
    toast.success('You have been signed out securely.');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-1 sm:gap-3">
        <button onClick={onOpenMobile} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        {location.pathname !== '/app/dashboard' && (
          <BackButton fallback="/app/dashboard" className="hidden sm:inline-flex" />
        )}
        <div>
          <p className="text-xs text-slate-400">Hostel Monarch / {titleFromPath(location.pathname)}</p>
          <h1 className="font-display text-base font-bold text-navy-950 sm:text-lg">{titleFromPath(location.pathname)}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <button
            onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-80 animate-scale-in rounded-2xl border border-slate-100 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="font-display text-sm font-bold text-navy-950">Notifications</p>
                  <button onClick={() => markAllNotificationsRead(user.role)} className="text-xs font-semibold text-navy-600 hover:text-navy-900">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {myNotifs.slice(0, 8).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={cn('block w-full border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50', !n.read && 'bg-navy-50/50')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-navy-950">{n.title}</p>
                        {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold-400" />}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.message}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{timeAgo(n.timestamp)}</p>
                    </button>
                  ))}
                  {myNotifs.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet.</p>}
                </div>
                <Link to="/app/notifications" onClick={() => setNotifOpen(false)} className="block border-t border-slate-100 px-4 py-2.5 text-center text-xs font-bold text-navy-700 hover:bg-slate-50">
                  View all notifications
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-slate-100"
          >
            <Avatar name={user.name} src={user.avatar} size="sm" />
            <span className="hidden text-sm font-semibold text-navy-900 sm:block">{user.name.split(' ')[0]}</span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-56 animate-scale-in rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-bold text-navy-950">{user.name}</p>
                  <p className="truncate text-xs text-slate-400">{user.email}</p>
                </div>
                <div className="my-1 h-px bg-slate-100" />
                <Link to="/app/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <UserIcon className="h-4 w-4" /> My Profile
                </Link>
                <Link to="/app/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <div className="my-1 h-px bg-slate-100" />
                <button
                  onClick={() => { setProfileOpen(false); setConfirmLogout(true); }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {confirmLogout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm" onClick={() => setConfirmLogout(false)} />
          <div className="relative z-10 w-full max-w-sm animate-scale-in rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <LogOut className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-center font-display text-lg font-bold text-navy-950">Confirm Logout</h3>
            <p className="mt-1 text-center text-sm text-slate-500">
              Are you sure you want to end your session, {user.name.split(' ')[0]}? Any unsaved changes may be lost.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setConfirmLogout(false)} className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={doLogout} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">
                <Check className="h-4 w-4" /> Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
