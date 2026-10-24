import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { UtensilsCrossed, Pencil } from 'lucide-react';
import { useAppData } from '../../store/AppDataContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import type { MealType } from '../../types';

export default function MenuManagement() {
  const { menu, updateMenuDay } = useAppData();
  const [editing, setEditing] = useState<{ date: string; meal: MealType; items: string } | null>(null);

  const save = () => {
    if (!editing) return;
    updateMenuDay(editing.date, editing.meal, editing.items.split(',').map((i) => i.trim()).filter(Boolean));
    toast.success(`${editing.meal} menu updated.`);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-extrabold text-navy-950">Menu Management</h2>
        <p className="text-sm text-slate-500">Edit upcoming meal plans for the week.</p>
      </div>

      <div className="space-y-5">
        {menu.map((day) => (
          <Card key={day.date}>
            <CardHeader title={day.day} subtitle={day.date} icon={<UtensilsCrossed className="h-4.5 w-4.5" />} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.entries(day.meals) as [MealType, typeof day.meals[MealType]][]).map(([meal, info]) => (
                <div key={meal} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-gold-600">{meal}</p>
                    <button onClick={() => setEditing({ date: day.date, meal, items: info.items.join(', ') })} className="text-slate-400 hover:text-navy-700" aria-label={`Edit ${meal}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-navy-900">
                    {info.items.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit ${editing?.meal} Menu`} subtitle={editing?.date}>
        <label className="mb-1.5 block text-sm font-semibold text-navy-900">Menu Items (comma separated)</label>
        <textarea
          value={editing?.items ?? ''}
          onChange={(e) => setEditing((prev) => (prev ? { ...prev, items: e.target.value } : prev))}
          rows={4}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100"
        />
        <Button fullWidth className="mt-4" onClick={save}>Save Menu</Button>
      </Modal>
    </div>
  );
}
