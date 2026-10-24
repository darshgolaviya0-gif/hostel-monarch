import React from 'react';
import { FileCheck2, Building2, Wallet, MessageSquareWarning, QrCode, UserCheck, UtensilsCrossed, Megaphone } from 'lucide-react';

const SERVICES = [
  { icon: FileCheck2, title: 'Digital Admission & Documents', desc: 'Apply online, upload documents, and track your application through every stage — from submission to approval.' },
  { icon: Building2, title: 'Smart Room Allocation', desc: 'Transparent building, floor, room and bed allocation with live vacancy tracking and transfer history.' },
  { icon: Wallet, title: 'Fees & Digital Payments', desc: 'Pay hostel & mess fees via UPI, cards or net banking with instant receipts — no manual bookkeeping.' },
  { icon: MessageSquareWarning, title: 'Complaint Ticketing', desc: 'Raise maintenance complaints with photo evidence and track resolution status in real time.' },
  { icon: QrCode, title: 'Leave & QR Gate Pass', desc: 'Apply for leave digitally, get warden approval and receive a secure, time-bound QR exit pass.' },
  { icon: UserCheck, title: 'Visitor & Parcel Management', desc: 'Pre-register visitors and track parcels with real-time notifications at every stage.' },
  { icon: UtensilsCrossed, title: 'Mess & Diet Management', desc: 'View daily menus, mark meal participation, request special diets and share feedback.' },
  { icon: Megaphone, title: 'Notices & Communication', desc: 'Stay informed with categorized, priority-tagged notices from administration and wardens.' },
];

export default function Services() {
  return (
    <div>
      <section className="brand-gradient px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-400">Our Services</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-white">A complete digital hostel experience</h1>
        <p className="mx-auto mt-4 max-w-2xl text-navy-200">
          Every service a resident needs — admissions, rooms, fees, complaints, leave, visitors and mess — unified
          into one secure platform.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {SERVICES.map((s) => (
            <div key={s.title} className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-gold-400">
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-navy-950">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
