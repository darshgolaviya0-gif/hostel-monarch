import React, { useState } from 'react';
import { MapPin, Phone, Mail, Siren, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { isLiveMode } from '../../lib/supabase';
import { ContactAPI } from '../../lib/liveData';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!/^[+]?[\d\s]{10,14}$/.test(form.phone)) e.phone = 'Enter a valid phone number';
    if (form.message.trim().length < 10) e.message = 'Message should be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError(null);
    try {
      if (isLiveMode) {
        await ContactAPI.submit({ name: form.name, email: form.email, phone: form.phone, message: form.message });
      } else {
        await new Promise((r) => setTimeout(r, 1000));
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="brand-gradient px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-400">Contact Us</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-white">We'd love to hear from you</h1>
        <p className="mx-auto mt-4 max-w-2xl text-navy-200">
          Reach out for admissions, partnership enquiries, or general questions about Hostel Monarch.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="card-surface p-6">
              <MapPin className="h-6 w-6 text-navy-700" />
              <h3 className="mt-3 font-display text-sm font-bold text-navy-950">Campus Address</h3>
              <p className="mt-1 text-sm text-slate-500">Hostel Monarch Campus, Surat, Gujarat, India</p>
            </div>
            <div className="card-surface p-6">
              <Phone className="h-6 w-6 text-navy-700" />
              <h3 className="mt-3 font-display text-sm font-bold text-navy-950">Phone</h3>
              <p className="mt-1 text-sm text-slate-500">Front Desk: +91 90000 12345</p>
              <p className="text-sm text-slate-500">Admissions: +91 90000 54321</p>
            </div>
            <div className="card-surface p-6">
              <Mail className="h-6 w-6 text-navy-700" />
              <h3 className="mt-3 font-display text-sm font-bold text-navy-950">Email</h3>
              <p className="mt-1 text-sm text-slate-500">hello@hostelmonarch.in</p>
            </div>
            <div className="card-surface border-rose-100 bg-rose-50/50 p-6">
              <Siren className="h-6 w-6 text-rose-600" />
              <h3 className="mt-3 font-display text-sm font-bold text-rose-700">24x7 Emergency Contact</h3>
              <p className="mt-1 text-sm text-rose-600">+91 90000 99999 (Security Desk)</p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="card-surface p-7">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-navy-950">Message Sent Successfully</h3>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    Thank you, {form.name.split(' ')[0]}. Our team will get back to you within 24 hours.
                  </p>
                  <Button variant="outline" className="mt-5" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', message: '' }); }}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4" noValidate>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-navy-900">Full Name</label>
                      <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="Your full name" />
                      {errors.name && <p className="mt-1 text-xs font-medium text-rose-600">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-navy-900">Phone Number</label>
                      <input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="+91 98250 11234" />
                      {errors.phone && <p className="mt-1 text-xs font-medium text-rose-600">{errors.phone}</p>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-navy-900">Email Address</label>
                    <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="you@example.com" />
                    {errors.email && <p className="mt-1 text-xs font-medium text-rose-600">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-navy-900">Message</label>
                    <textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100" placeholder="Tell us how we can help…" />
                    {errors.message && <p className="mt-1 text-xs font-medium text-rose-600">{errors.message}</p>}
                  </div>
                  {submitError && (
                    <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{submitError}</p>
                  )}
                  <Button type="submit" loading={loading} icon={<Send className="h-4 w-4" />} fullWidth>
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
          <div className="text-center">
            <MapPin className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2">Interactive campus map placeholder — Surat, Gujarat</p>
          </div>
        </div>
      </section>
    </div>
  );
}
