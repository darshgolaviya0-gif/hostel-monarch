import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Users, FileStack, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { MealTrendChart } from '../../components/charts/Charts';
import { MEAL_TREND } from '../../data/mess';

export default function MessDashboard() {
  const { user } = useAuth();
  const { menu, participation, dietRequests, feedback } = useAppData();
  const today = menu[0];
  const expected = participation.filter((p) => p.dinner).length;
  const specialDiets = dietRequests.filter((d) => d.status === 'Approved').length;
  const avgRating = (feedback.reduce((a, f) => a + f.rating, 0) / feedback.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-navy-950">Mess Dashboard — {user?.name.split(' ')[0]}</h2>
        <p className="mt-1 text-sm text-slate-500">Plan menus, track participation and review feedback.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Meals" value="4 Scheduled" icon={<UtensilsCrossed className="h-5 w-5" />} tone="gold" />
        <StatCard label="Expected (Dinner)" value={expected} icon={<Users className="h-5 w-5" />} tone="navy" />
        <StatCard label="Special Diets" value={specialDiets} icon={<FileStack className="h-5 w-5" />} tone="sky" />
        <StatCard label="Avg. Feedback Rating" value={`${avgRating} / 5`} icon={<Star className="h-5 w-5" />} tone="emerald" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Weekly Meal Participation Trend" />
          <MealTrendChart data={MEAL_TREND} />
        </Card>
        <Card>
          <CardHeader title="Today's Menu" subtitle={today.day} action={<Link to="/app/mess-today" className="text-xs font-bold text-navy-700 hover:text-gold-600">Edit →</Link>} />
          <div className="space-y-3">
            {Object.entries(today.meals).map(([meal, info]) => (
              <div key={meal} className="rounded-xl border border-slate-100 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-gold-600">{meal} · {info.time}</p>
                <p className="mt-1 text-sm text-navy-900">{info.items.join(', ')}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
