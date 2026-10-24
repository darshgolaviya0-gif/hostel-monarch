import React, { useState } from 'react';
import { Bell, CalendarCheck, MessageSquareWarning, Wallet, Package, UtensilsCrossed, Megaphone, UserCheck, Settings2, CheckCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { Card } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/ui/Misc';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import { timeAgo } from '../../utils/format';
import type { AppNotification } from '../../types';

const ICONS: Record<AppNotification['category'], React.ElementType> = {
  Leave: CalendarCheck,
  Complaint: MessageSquareWarning,
  Fees: Wallet,
  Parcel: Package,
  Mess: UtensilsCrossed,
  Notice: Megaphone,
  Visitor: UserCheck,
  System: Settings2,
};

export default function Notifications() {
  const { user } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppData();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!user) return null;
  const mine = notifications.filter((n) => !n.forRole || n.forRole === user.role);
  const list = filter === 'unread' ? mine.filter((n) => !n.read) : mine;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-950">Notification Center</h2>
          <p className="text-sm text-slate-500">{mine.filter((n) => !n.read).length} unread notifications</p>
        </div>
        <Button variant="outline" size="sm" icon={<CheckCheck className="h-4 w-4" />} onClick={() => markAllNotificationsRead(user.role)}>
          Mark all as read
        </Button>
      </div>

      <Tabs tabs={[{ id: 'all', label: 'All' }, { id: 'unread', label: 'Unread', badge: mine.filter((n) => !n.read).length }]} onChange={(id) => setFilter(id as any)} />

      {list.length === 0 ? (
        <EmptyState icon={<Bell className="h-7 w-7" />} title="You're all caught up" message="No notifications to show here." />
      ) : (
        <div className="space-y-3">
          {list.map((n) => {
            const Icon = ICONS[n.category];
            return (
              <Card key={n.id} padded={false} className={cn('flex items-start gap-4 p-4 transition', !n.read && 'border-gold-200 bg-gold-50/30')}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-navy-950">{n.title}</p>
                    {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold-400" />}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{n.message}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-slate-400">{timeAgo(n.timestamp)}</p>
                    {!n.read && (
                      <button onClick={() => markNotificationRead(n.id)} className="text-xs font-semibold text-navy-700 hover:text-gold-600">
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
