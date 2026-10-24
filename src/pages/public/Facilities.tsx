import React from 'react';
import {
  ShieldCheck, Wifi, UtensilsCrossed, Sparkles, Shirt, BookOpen, Camera, Wrench, UserCheck, Zap, Droplets, Dumbbell,
} from 'lucide-react';

const FACILITIES = [
  { icon: ShieldCheck, label: '24/7 Security', desc: 'Trained security personnel stationed at all entry/exit points round the clock, backed by digital gate logs.' },
  { icon: Wifi, label: 'High-Speed Wi-Fi', desc: 'Dedicated fibre broadband with full coverage across rooms, study halls and common areas.' },
  { icon: UtensilsCrossed, label: 'Mess & Dining', desc: 'Freshly prepared, hygienic meals four times a day with Jain, vegetarian & medical diet options.' },
  { icon: Sparkles, label: 'Housekeeping', desc: 'Daily room and common-area cleaning performed by a dedicated housekeeping team.' },
  { icon: Shirt, label: 'Laundry Service', desc: 'Scheduled laundry pick-up & drop with turnaround within 48 hours.' },
  { icon: BookOpen, label: 'Study Area', desc: 'Dedicated quiet zones with desks, lighting and power outlets for focused study sessions.' },
  { icon: Camera, label: 'CCTV Surveillance', desc: 'Comprehensive camera coverage of corridors, gates and common areas, monitored 24/7.' },
  { icon: Wrench, label: 'Maintenance Support', desc: 'Dedicated maintenance staff resolving electrical, plumbing & furniture issues promptly.' },
  { icon: UserCheck, label: 'Visitor Management', desc: 'Digital visitor pre-registration, ID verification and check-in/check-out tracking at the gate.' },
  { icon: Zap, label: 'Power Backup', desc: 'Generator backup ensures uninterrupted electricity supply across all residential blocks.' },
  { icon: Droplets, label: 'RO Drinking Water', desc: 'Purified drinking water stations available on every floor.' },
  { icon: Dumbbell, label: 'Recreation Area', desc: 'Indoor games, common lounge and outdoor recreational space for relaxation.' },
];

export default function Facilities() {
  return (
    <div>
      <section className="brand-gradient px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-400">Facilities</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-white">World-class hostel facilities</h1>
        <p className="mx-auto mt-4 max-w-2xl text-navy-200">
          Every facility at Hostel Monarch is designed around comfort, safety and convenience — monitored and
          managed through our digital platform.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FACILITIES.map((f) => (
            <div key={f.label} className="card-surface card-surface-hover p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-700">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-navy-950">{f.label}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
