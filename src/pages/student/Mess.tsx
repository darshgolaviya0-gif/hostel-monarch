import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { UtensilsCrossed, Star, Send, Clock } from 'lucide-react';
import { useCurrentStudent } from '../../hooks/useCurrentStudent';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Misc';
import { Tabs } from '../../components/ui/Tabs';
import type { DietType, MealType } from '../../types';

const DIETS: DietType[] = ['Regular', 'Jain', 'Vegetarian', 'Medical/Special'];
const MEALS: MealType[] = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

export default function Mess() {
  const student = useCurrentStudent();
  const { menu, participation, toggleMealParticipation, submitDietRequest, submitFeedback, dietRequests } = useAppData();
  const myParticipation = participation.find((p) => p.studentId === student.id);
  const myDietRequests = dietRequests.filter((d) => d.studentId === student.id);

  const [dietForm, setDietForm] = useState({ diet: 'Regular' as DietType, reason: '' });
  const [feedbackForm, setFeedbackForm] = useState({ meal: 'Dinner' as MealType, rating: 5, comment: '' });
  const today = menu[0];

  const submitDiet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dietForm.reason.trim()) { toast.error('Please provide a reason for your diet request.'); return; }
    submitDietRequest({ ...dietForm, studentId: student.id, studentName: student.name, room: student.allocation?.room ?? '—' });
    toast.success('Diet request submitted for review.');
    setDietForm({ diet: 'Regular', reason: '' });
  };

  const submitFb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.comment.trim()) { toast.error('Please share a brief comment.'); return; }
    submitFeedback({ ...feedbackForm, studentId: student.id, studentName: student.name });
    toast.success('Thank you for your feedback!');
    setFeedbackForm({ meal: 'Dinner', rating: 5, comment: '' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title={`Today's Menu — ${today.day}`} icon={<UtensilsCrossed className="h-4.5 w-4.5" />} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MEALS.map((meal) => {
            const info = today.meals[meal];
            return (
              <div key={meal} className="rounded-2xl border border-slate-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gold-600">{meal}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400"><Clock className="h-3 w-3" /> {info.time}</p>
                <ul className="mt-3 space-y-1 text-sm text-navy-900">
                  {info.items.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader title="Meal Participation" subtitle="Toggle whether you'll be eating each meal today" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map((m) => {
            const active = myParticipation?.[m] ?? false;
            return (
              <button
                key={m}
                onClick={() => { toggleMealParticipation(student.id, m, !active); toast.success(`${m[0].toUpperCase() + m.slice(1)} preference updated.`); }}
                className={`rounded-2xl border p-4 text-center font-semibold transition ${active ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-400'}`}
              >
                <p className="text-sm capitalize">{m}</p>
                <p className="mt-1 text-xs">{active ? 'Attending' : 'Skipping'}</p>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Diet Request" subtitle="Request a special or medical diet" />
          <form onSubmit={submitDiet} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy-900">Diet Type</label>
              <Select value={dietForm.diet} onChange={(v) => setDietForm({ ...dietForm, diet: v as DietType })} options={DIETS.map((d) => ({ value: d, label: d }))} className="w-full" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy-900">Reason</label>
              <textarea value={dietForm.reason} onChange={(e) => setDietForm({ ...dietForm, reason: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="Explain your dietary requirement…" />
            </div>
            <Button type="submit" fullWidth icon={<Send className="h-4 w-4" />}>Submit Request</Button>
          </form>
          {myDietRequests.length > 0 && (
            <div className="mt-4 space-y-2">
              {myDietRequests.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                  <span className="font-semibold text-navy-900">{d.diet} — {d.requestedOn}</span>
                  <span className={`font-bold ${d.status === 'Approved' ? 'text-emerald-600' : d.status === 'Rejected' ? 'text-rose-600' : 'text-amber-600'}`}>{d.status}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Mess Feedback" subtitle="Rate your recent meal experience" />
          <form onSubmit={submitFb} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy-900">Meal</label>
              <Select value={feedbackForm.meal} onChange={(v) => setFeedbackForm({ ...feedbackForm, meal: v as MealType })} options={MEALS.map((m) => ({ value: m, label: m }))} className="w-full" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy-900">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} type="button" onClick={() => setFeedbackForm({ ...feedbackForm, rating: r })}>
                    <Star className={`h-7 w-7 ${r <= feedbackForm.rating ? 'fill-gold-400 text-gold-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy-900">Comment</label>
              <textarea value={feedbackForm.comment} onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="Tell us what you thought…" />
            </div>
            <Button type="submit" fullWidth icon={<Send className="h-4 w-4" />}>Submit Feedback</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
