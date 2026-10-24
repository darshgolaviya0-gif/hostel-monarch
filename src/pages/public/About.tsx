import React from 'react';
import { ShieldCheck, Sofa, Cpu, Users, HeartHandshake, Target, Eye, Gem } from 'lucide-react';

const PILLARS = [
  { icon: ShieldCheck, title: 'Safety', desc: 'Round-the-clock security, CCTV coverage and verified digital gate passes keep every resident safe.' },
  { icon: Sofa, title: 'Comfort', desc: 'Well-maintained rooms, hygienic mess facilities and dependable housekeeping for a true home away from home.' },
  { icon: Cpu, title: 'Technology', desc: 'A unified digital platform for fees, complaints, leave, mess and communication — no paperwork, no queues.' },
  { icon: Users, title: 'Community', desc: 'Cultural events, shared study spaces and a vibrant student community across our residential blocks.' },
  { icon: HeartHandshake, title: 'Convenience', desc: 'From digital payments to visitor management, everything is designed around resident convenience.' },
];

export default function About() {
  return (
    <div>
      <section className="brand-gradient px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-400">About Us</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-white">About Hostel Monarch</h1>
        <p className="mx-auto mt-4 max-w-2xl text-navy-200">
          Hostel Monarch is a modern, professionally managed Indian hostel built around safety, comfort, technology,
          community and convenience — combining hospitality with a complete digital operating system.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="card-surface p-6">
            <Target className="h-8 w-8 text-navy-700" />
            <h3 className="mt-3 font-display text-lg font-bold text-navy-950">Our Mission</h3>
            <p className="mt-2 text-sm text-slate-500">
              To provide every student with a secure, comfortable and digitally empowered residential experience that
              lets them focus entirely on their education and growth.
            </p>
          </div>
          <div className="card-surface p-6">
            <Eye className="h-8 w-8 text-navy-700" />
            <h3 className="mt-3 font-display text-lg font-bold text-navy-950">Our Vision</h3>
            <p className="mt-2 text-sm text-slate-500">
              To become India's most trusted smart hostel management platform — setting the benchmark for
              transparency, safety and student satisfaction nationwide.
            </p>
          </div>
          <div className="card-surface p-6">
            <Gem className="h-8 w-8 text-navy-700" />
            <h3 className="mt-3 font-display text-lg font-bold text-navy-950">Our Values</h3>
            <p className="mt-2 text-sm text-slate-500">
              Integrity, discipline, hospitality and innovation — guiding every interaction between students, parents,
              staff and administration.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-extrabold text-navy-950">What Hostel Monarch Stands For</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {PILLARS.map((p) => (
              <div key={p.title} className="card-surface card-surface-hover p-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-gold-400">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-3 font-display text-sm font-bold text-navy-950">{p.title}</h3>
                <p className="mt-1.5 text-xs text-slate-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { label: 'Students Hosted', value: '2,400+' },
            { label: 'Years of Operation', value: '9' },
            { label: 'Rooms Across Blocks', value: '20' },
            { label: 'Student Satisfaction', value: '4.8 / 5' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-extrabold text-navy-900">{s.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
