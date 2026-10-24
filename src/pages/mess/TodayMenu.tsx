import React from 'react';
import { ChefHat, Clock } from 'lucide-react';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export default function TodayMenu() {
  const { menu } = useAppData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-extrabold text-navy-950">Today's & Upcoming Menu</h2>
        <p className="text-sm text-slate-500">Weekly meal plan for Hostel Monarch residents.</p>
      </div>

      <div className="space-y-5">
        {menu.map((day, idx) => (
          <Card key={day.date}>
            <CardHeader
              title={day.day}
              subtitle={day.date}
              icon={<ChefHat className="h-4.5 w-4.5" />}
              action={idx === 0 && <Badge tone="gold" dot={false}>Today</Badge>}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(day.meals).map(([meal, info]) => (
                <div key={meal} className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gold-600">{meal}</p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400"><Clock className="h-3 w-3" /> {info.time}</p>
                  <ul className="mt-3 space-y-1 text-sm text-navy-900">
                    {info.items.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
