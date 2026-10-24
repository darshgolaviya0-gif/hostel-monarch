import React from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Users, CheckCircle2, Wifi, Wind } from 'lucide-react';
import { formatINR } from '../../utils/format';

const ROOM_TYPES = [
  {
    name: 'Triple Sharing',
    price: 7500,
    occupancy: 3,
    tag: 'Most Affordable',
    amenities: ['Wi-Fi', 'Study Table', 'Wardrobe', 'Common Washroom'],
  },
  {
    name: 'Double Sharing',
    price: 9000,
    occupancy: 2,
    tag: 'Most Popular',
    highlight: true,
    amenities: ['Wi-Fi', 'Attached Washroom', 'Study Table', 'Wardrobe'],
  },
  {
    name: 'Double Sharing — Premium',
    price: 9500,
    occupancy: 2,
    tag: 'Premium',
    amenities: ['Wi-Fi', 'AC', 'Geyser', 'Attached Washroom', 'Study Table', 'Wardrobe'],
  },
];

export default function Rooms() {
  return (
    <div>
      <section className="brand-gradient px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-400">Room Types</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-white">Choose your comfort</h1>
        <p className="mx-auto mt-4 max-w-2xl text-navy-200">
          Across Shivaji Bhavan and Rajwada Bhavan, we offer flexible sharing options to fit every budget and preference.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {ROOM_TYPES.map((r) => (
            <div
              key={r.name}
              className={`relative rounded-2xl border p-7 ${r.highlight ? 'border-gold-300 bg-gold-50/40 shadow-lg' : 'border-slate-100 bg-white shadow-sm'}`}
            >
              <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${r.highlight ? 'bg-gold-400 text-navy-950' : 'bg-navy-50 text-navy-700'}`}>
                {r.tag}
              </span>
              <h3 className="mt-4 font-display text-xl font-extrabold text-navy-950">{r.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-3xl font-extrabold text-navy-950">{formatINR(r.price)}</span>
                <span className="text-sm text-slate-400">/ month</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
                <Users className="h-4 w-4" /> {r.occupancy} Students per room
              </div>
              <ul className="mt-5 space-y-2.5">
                {r.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {a}
                  </li>
                ))}
              </ul>
              <Link
                to="/login?role=student"
                className={`mt-7 block rounded-xl py-3 text-center text-sm font-bold ${r.highlight ? 'bg-navy-900 text-white hover:bg-navy-950' : 'border border-slate-300 text-navy-800 hover:bg-slate-50'}`}
              >
                Apply for Admission
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 rounded-3xl bg-slate-50 p-8 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <BedDouble className="h-6 w-6 text-navy-700" />
            <div>
              <p className="font-display text-sm font-bold text-navy-950">58 Total Beds</p>
              <p className="text-xs text-slate-500">Across 2 residential blocks</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Wifi className="h-6 w-6 text-navy-700" />
            <div>
              <p className="font-display text-sm font-bold text-navy-950">Campus-wide Wi-Fi</p>
              <p className="text-xs text-slate-500">High speed, always on</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Wind className="h-6 w-6 text-navy-700" />
            <div>
              <p className="font-display text-sm font-bold text-navy-950">Premium AC Rooms</p>
              <p className="text-xs text-slate-500">Available on select floors</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
