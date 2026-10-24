import React from 'react';

export function PolicyLayout({
  icon, eyebrow, title, subtitle, children,
}: {
  icon: React.ReactNode; eyebrow: string; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div>
      <section className="brand-gradient px-4 py-14 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-gold-400">
          {icon}
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gold-400">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-navy-200">{subtitle}</p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="card-surface space-y-8 p-6 sm:p-8">{children}</div>
      </section>
    </div>
  );
}

export function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-base font-bold text-navy-950">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}
