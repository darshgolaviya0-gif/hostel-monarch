import React from 'react';
import { Star, MessageSquareText } from 'lucide-react';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { EmptyState } from '../../components/ui/Misc';

export default function MessFeedback() {
  const { feedback } = useAppData();
  const avg = feedback.length ? (feedback.reduce((a, f) => a + f.rating, 0) / feedback.length).toFixed(1) : '0';
  const low = feedback.filter((f) => f.rating <= 2).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-extrabold text-navy-950">Mess Feedback</h2>
        <p className="text-sm text-slate-500">Student feedback and ratings on meal quality.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Average Rating" value={`${avg} / 5`} icon={<Star className="h-5 w-5" />} tone="gold" />
        <StatCard label="Total Reviews" value={feedback.length} icon={<MessageSquareText className="h-5 w-5" />} tone="navy" />
        <StatCard label="Low Ratings (≤2)" value={low} icon={<Star className="h-5 w-5" />} tone="rose" />
      </div>

      {feedback.length === 0 ? (
        <EmptyState icon={<MessageSquareText className="h-7 w-7" />} title="No feedback yet" message="Student feedback will appear here." />
      ) : (
        <Card>
          <CardHeader title="Recent Feedback" />
          <div className="space-y-3">
            {feedback.map((f) => (
              <div key={f.id} className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-navy-950">{f.studentName} · {f.meal}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < f.rating ? 'fill-gold-400 text-gold-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="mt-1.5 text-sm text-slate-500">{f.comment}</p>
                <p className="mt-1 text-xs text-slate-400">{f.date}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
