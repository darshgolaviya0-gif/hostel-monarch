import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Wifi, UtensilsCrossed, Sparkles, Shirt, BookOpen, Camera, Wrench, UserCheck,
  ArrowRight, Star, CheckCircle2, QrCode, CreditCard, BarChart3, Building2,
} from 'lucide-react';

const FACILITIES = [
  { icon: ShieldCheck, label: '24/7 Security', desc: 'Manned gates with CCTV & QR-based entry control.' },
  { icon: Wifi, label: 'High-Speed Wi-Fi', desc: 'Fibre broadband across every floor & common area.' },
  { icon: UtensilsCrossed, label: 'Hygienic Mess', desc: 'Nutritious meals with diet-specific menus.' },
  { icon: Sparkles, label: 'Housekeeping', desc: 'Daily cleaning of rooms & common spaces.' },
  { icon: Shirt, label: 'Laundry Service', desc: 'Scheduled laundry pickup and delivery.' },
  { icon: BookOpen, label: 'Study Area', desc: 'Quiet, well-lit zones for focused study.' },
  { icon: Camera, label: 'CCTV Surveillance', desc: 'Round-the-clock monitored campus perimeter.' },
  { icon: Wrench, label: 'Maintenance', desc: 'Rapid-response repair & upkeep teams.' },
  { icon: UserCheck, label: 'Visitor Management', desc: 'Digital visitor pre-registration & verification.' },
];

const WHY_US = [
  { icon: QrCode, title: 'QR-based Smart Security', desc: 'Every leave is a verified, time-bound digital pass — scanned at the gate in seconds.' },
  { icon: CreditCard, title: 'Seamless Digital Payments', desc: 'UPI, cards & net banking with instant receipts. No more cash receipts or queues.' },
  { icon: BarChart3, title: 'Real-time Transparency', desc: 'Students, parents and wardens stay informed with live dashboards and notices.' },
  { icon: Building2, title: 'Thoughtfully Designed Rooms', desc: 'Single, double & triple sharing options with modern amenities across two blocks.' },
];

const STEPS = [
  { step: '01', title: 'Apply Online', desc: 'Submit your admission application and documents digitally in minutes.' },
  { step: '02', title: 'Get Verified', desc: 'Our administration team reviews and verifies your documents securely.' },
  { step: '03', title: 'Room Allocated', desc: 'Receive your building, floor, room & bed allocation instantly.' },
  { step: '04', title: 'Move In & Manage', desc: 'Pay fees, raise complaints, apply leave — all from one dashboard.' },
];

const TESTIMONIALS = [
  { name: 'Aarav Patel', role: 'B.Tech Computer Engineering, 3rd Year', quote: 'Hostel Monarch completely changed how I manage hostel life. Fee payments and complaint tracking are so simple now.', rating: 5 },
  { name: 'Mrs. Nisha Patel', role: 'Parent', quote: 'As a parent, the visitor and leave tracking gives me real peace of mind about my son\'s safety.', rating: 5 },
  { name: 'Riya Shah', role: 'B.Tech Information Technology, 2nd Year', quote: 'The QR gate pass feature is brilliant — quick, safe, and I never have to carry paperwork while travelling home.', rating: 4 },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden brand-gradient">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 0, transparent 35%), radial-gradient(circle at 80% 60%, #e0ab38 0, transparent 40%)' }} />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-gold-300 ring-1 ring-white/20">
              <Sparkles className="h-3.5 w-3.5" /> India's Smart Hostel Operating System
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Welcome to <span className="gold-gradient-text">HOSTEL MONARCH</span>
            </h1>
            <p className="mt-5 text-lg font-medium text-navy-200">Smart Living. Seamless Management.</p>
            <p className="mt-4 max-w-lg text-navy-300">
              A premium, secure and digitally managed hostel experience for students — with real-time room allocation,
              digital payments, QR gate passes and transparent communication for every stakeholder.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/apply-admission" className="inline-flex items-center gap-2 rounded-xl bg-gold-400 px-6 py-3.5 text-sm font-bold text-navy-950 shadow-lg shadow-gold-500/20 transition hover:bg-gold-300">
                Apply for Admission <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/rooms" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur hover:bg-white/10">
                Explore Hostel
              </Link>
              <Link to="/login?role=student" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur hover:bg-white/10">
                Student Login
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-navy-200">
              {['Premium hostel experience', 'Safe environment', '24/7 security', 'Digital payments'].map((t) => (
                <div key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-gold-400" /> {t}</div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-in">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur">
              <div className="rounded-2xl bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-bold text-navy-950">Occupancy Overview</p>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">LIVE</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-navy-50 p-3.5">
                    <p className="text-xs text-slate-500">Total Beds</p>
                    <p className="font-display text-xl font-extrabold text-navy-950">58</p>
                  </div>
                  <div className="rounded-xl bg-gold-50 p-3.5">
                    <p className="text-xs text-slate-500">Occupancy</p>
                    <p className="font-display text-xl font-extrabold text-gold-700">78%</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3.5">
                    <p className="text-xs text-slate-500">Fee Collected</p>
                    <p className="font-display text-xl font-extrabold text-emerald-700">₹8.1L</p>
                  </div>
                  <div className="rounded-xl bg-sky-50 p-3.5">
                    <p className="text-xs text-slate-500">Active Students</p>
                    <p className="font-display text-xl font-extrabold text-sky-700">312</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-slate-100 p-3.5">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-navy-700" />
                    <p className="text-sm font-bold text-navy-950">Gate Pass Verified</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Aarav Patel · A-204 · Exit recorded 09:30 AM</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-4 shadow-xl sm:block">
              <p className="text-xs text-slate-400">Student satisfaction</p>
              <div className="mt-1 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />)}
                <span className="ml-1 text-sm font-bold text-navy-950">4.8/5</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-600">Facilities</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-navy-950 sm:text-4xl">Everything your stay needs</h2>
          <p className="mt-3 text-slate-500">Thoughtfully designed amenities that make hostel life comfortable, safe and productive.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Why choose us */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-600">Why Choose Us</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-navy-950 sm:text-4xl">A real digital hostel operating system</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {WHY_US.map((w) => (
              <div key={w.title} className="flex gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-gold-400">
                  <w.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-navy-950">{w.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-600">How Hostel Monarch Works</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-navy-950 sm:text-4xl">From application to move-in</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.step} className="relative rounded-2xl border border-slate-100 bg-white p-6">
              <span className="font-display text-4xl font-extrabold text-slate-100">{s.step}</span>
              <h3 className="mt-2 font-display text-base font-bold text-navy-950">{s.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{s.desc}</p>
              {i < STEPS.length - 1 && <ArrowRight className="absolute -right-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-slate-200 lg:block" />}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="brand-gradient py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-400">Testimonials</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">Loved by students & parents</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < t.rating ? 'fill-gold-400 text-gold-400' : 'text-navy-700'}`} />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-navy-100">"{t.quote}"</p>
                <p className="mt-5 text-sm font-bold text-white">{t.name}</p>
                <p className="text-xs text-navy-400">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-extrabold text-navy-950 sm:text-4xl">Ready to experience smarter hostel living?</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-500">Join hundreds of students already managing their hostel life digitally with Hostel Monarch.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/apply-admission" className="rounded-xl bg-navy-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-navy-950">
            Apply for Admission
          </Link>
          <Link to="/contact" className="rounded-xl border border-slate-300 px-6 py-3.5 text-sm font-bold text-navy-800 hover:bg-slate-50">
            Talk to Us
          </Link>
        </div>
      </section>
    </div>
  );
}
