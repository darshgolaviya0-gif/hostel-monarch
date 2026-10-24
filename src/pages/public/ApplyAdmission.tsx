import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Send, CheckCircle2, User, Mail, Phone, Calendar, GraduationCap, Building2, BedDouble,
  MapPin, Clock3, FileText, ShieldCheck, Sparkles, ArrowRight, Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { useAppData } from '../../store/AppDataContext';

const BUILDINGS = ['No preference', 'Shivaji Bhavan', 'Rajwada Bhavan'];
const ROOM_TYPES = ['No preference', 'Single Sharing', 'Double Sharing', 'Triple Sharing', 'Dormitory'];
const VISIT_SLOTS = ['Morning (10:00 AM – 12:00 PM)', 'Afternoon (12:00 PM – 3:00 PM)', 'Evening (3:00 PM – 6:00 PM)'];

const NEXT_STEPS = [
  { icon: FileText, title: 'Application Review', desc: 'Our admissions team reviews your details within 2–3 business days.' },
  { icon: Calendar, title: 'Hostel Visit (optional)', desc: "If you requested one, we'll call to confirm your visit slot." },
  { icon: ShieldCheck, title: 'Document Verification', desc: 'Upload your ID & academic documents once your account is approved.' },
  { icon: BedDouble, title: 'Room Allocation', desc: 'Get your building, floor, room & bed assigned and move in.' },
];

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  course: string;
  college: string;
  year: string;
  building: string;
  roomType: string;
  wantsVisit: boolean;
  visitDate: string;
  visitSlot: string;
  note: string;
}

const INITIAL: FormState = {
  fullName: '', email: '', phone: '', dob: '', gender: '',
  course: '', college: '', year: '',
  building: 'No preference', roomType: 'No preference',
  wantsVisit: false, visitDate: '', visitSlot: VISIT_SLOTS[0], note: '',
};

const todayISO = () => new Date('2026-10-04').toISOString().slice(0, 10);

export default function ApplyAdmission() {
  const { createAdmission } = useAppData();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; applicationNo: string } | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!/^[+]?[\d\s]{10,14}$/.test(form.phone)) e.phone = 'Enter a valid phone number.';
    if (!form.dob) e.dob = 'Date of birth is required.';
    if (!form.gender) e.gender = 'Please select a gender.';
    if (!form.course.trim()) e.course = 'Course / program is required.';
    if (!form.college.trim()) e.college = 'College / institution is required.';
    if (form.wantsVisit && !form.visitDate) e.visitDate = 'Choose a preferred visit date.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = createAdmission({
        studentName: form.fullName,
        email: form.email,
        phone: form.phone,
        course: form.course,
        college: form.college,
        preferredBuilding: form.building === 'No preference' ? undefined : form.building,
        visitDate: form.wantsVisit ? form.visitDate : undefined,
        visitSlot: form.wantsVisit ? form.visitSlot : undefined,
        visitNote: form.note || undefined,
      });
      setLoading(false);
      setResult(res);
      toast.success('Admission application submitted!');
    }, 900);
  };

  const copyAppNo = () => {
    if (!result) return;
    navigator.clipboard?.writeText(result.applicationNo);
    toast.success('Application number copied.');
  };

  return (
    <div>
      <section className="brand-gradient px-4 py-16 text-center sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-gold-300 ring-1 ring-white/20">
          <Sparkles className="h-3.5 w-3.5" /> Admissions Open for 2026–27
        </span>
        <h1 className="mt-4 font-display text-4xl font-extrabold text-white">Apply for Admission</h1>
        <p className="mx-auto mt-4 max-w-2xl text-navy-200">
          Fill in your details below, optionally schedule a hostel visit, and our admissions team will take it from
          there — fully digital, no paperwork required to get started.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          {/* Left info rail */}
          <div className="space-y-5 lg:col-span-2">
            <div className="card-surface p-6">
              <h3 className="font-display text-sm font-bold text-navy-950">What happens next</h3>
              <div className="mt-4 space-y-4">
                {NEXT_STEPS.map((s) => (
                  <div key={s.title} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                      <s.icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy-900">{s.title}</p>
                      <p className="text-xs text-slate-500">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-surface p-6">
              <MapPin className="h-6 w-6 text-navy-700" />
              <h3 className="mt-3 font-display text-sm font-bold text-navy-950">Visit Us</h3>
              <p className="mt-1 text-sm text-slate-500">Hostel Monarch Campus, Surat, Gujarat, India</p>
              <p className="mt-2 text-sm text-slate-500">Admissions Desk: +91 90000 54321</p>
              <p className="text-sm text-slate-500">admissions@hostelmonarch.in</p>
            </div>
            <div className="card-surface border-gold-200 bg-gold-50/60 p-6">
              <p className="text-xs font-semibold text-gold-800">
                Already applied? Once approved, create your student account to track status, upload documents and get
                your room allocated — all from your dashboard.
              </p>
              <Link to="/signup?role=student" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-navy-800 hover:text-gold-700">
                Create a student account <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Form / success */}
          <div className="lg:col-span-3">
            <div className="card-surface p-7">
              {result ? (
                <div className="flex flex-col items-center py-6 text-center animate-fade-in">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-extrabold text-navy-950">Application Submitted!</h3>
                  <p className="mt-2 max-w-md text-sm text-slate-500">
                    Thank you, {form.fullName.split(' ')[0]}. Your admission application is now in our system with
                    status <strong>"Application Started"</strong>.
                    {form.wantsVisit && ` We'll call you to confirm your hostel visit on ${form.visitDate}.`}
                  </p>

                  <button
                    onClick={copyAppNo}
                    className="mt-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-mono font-semibold text-navy-800 hover:bg-slate-100"
                  >
                    {result.applicationNo} <Copy className="h-3.5 w-3.5 text-slate-400" />
                  </button>

                  <div className="mt-7 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
                    <Link to="/signup?role=student" className="flex-1">
                      <Button fullWidth icon={<ArrowRight className="h-4 w-4" />}>Create Account to Track Status</Button>
                    </Link>
                    <Link to="/" className="flex-1">
                      <Button fullWidth variant="outline">Back to Home</Button>
                    </Link>
                  </div>
                  <button
                    onClick={() => { setForm(INITIAL); setResult(null); }}
                    className="mt-4 text-xs font-semibold text-slate-400 hover:text-navy-700"
                  >
                    Submit another application
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-6" noValidate>
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy-500">Personal Details</h3>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Full Name" error={errors.fullName} icon={User}>
                        <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Aarav Patel" className={inputClass} />
                      </Field>
                      <Field label="Date of Birth" error={errors.dob} icon={Calendar}>
                        <input type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} max={todayISO()} className={inputClass} />
                      </Field>
                      <Field label="Email Address" error={errors.email} icon={Mail}>
                        <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" className={inputClass} />
                      </Field>
                      <Field label="Phone Number" error={errors.phone} icon={Phone}>
                        <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 98250 11234" className={inputClass} />
                      </Field>
                      <Field label="Gender" error={errors.gender}>
                        <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className={inputClass}>
                          <option value="">Select gender</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </Field>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy-500">Academic Details</h3>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Course / Program" error={errors.course} icon={GraduationCap}>
                        <input value={form.course} onChange={(e) => set('course', e.target.value)} placeholder="B.Tech Computer Engineering" className={inputClass} />
                      </Field>
                      <Field label="Year of Study" error={errors.year}>
                        <select value={form.year} onChange={(e) => set('year', e.target.value)} className={inputClass}>
                          <option value="">Select year</option>
                          <option>1st Year</option>
                          <option>2nd Year</option>
                          <option>3rd Year</option>
                          <option>4th Year</option>
                        </select>
                      </Field>
                      <Field label="College / Institution" error={errors.college} className="sm:col-span-2">
                        <input value={form.college} onChange={(e) => set('college', e.target.value)} placeholder="Sarvajanik College of Engineering & Technology" className={inputClass} />
                      </Field>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy-500">Hostel Preference</h3>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Preferred Building" icon={Building2}>
                        <select value={form.building} onChange={(e) => set('building', e.target.value)} className={inputClass}>
                          {BUILDINGS.map((b) => <option key={b}>{b}</option>)}
                        </select>
                      </Field>
                      <Field label="Preferred Room Type" icon={BedDouble}>
                        <select value={form.roomType} onChange={(e) => set('roomType', e.target.value)} className={inputClass}>
                          {ROOM_TYPES.map((r) => <option key={r}>{r}</option>)}
                        </select>
                      </Field>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input type="checkbox" checked={form.wantsVisit} onChange={(e) => set('wantsVisit', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-navy-700 focus:ring-navy-400" />
                      <span className="text-sm font-bold text-navy-900">I'd like to schedule a hostel visit before admission</span>
                    </label>
                    {form.wantsVisit && (
                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 animate-fade-in">
                        <Field label="Preferred Visit Date" error={errors.visitDate} icon={Calendar}>
                          <input type="date" value={form.visitDate} onChange={(e) => set('visitDate', e.target.value)} min={todayISO()} className={inputClass} />
                        </Field>
                        <Field label="Preferred Time Slot" icon={Clock3}>
                          <select value={form.visitSlot} onChange={(e) => set('visitSlot', e.target.value)} className={inputClass}>
                            {VISIT_SLOTS.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </Field>
                        <Field label="Anything you'd like us to know?" className="sm:col-span-2">
                          <textarea rows={3} value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="e.g. Coming with a parent, need wheelchair access, preferred language…" className={inputClass} />
                        </Field>
                      </div>
                    )}
                  </div>

                  <Button type="submit" fullWidth loading={loading} icon={<Send className="h-4 w-4" />}>
                    Submit Application
                  </Button>
                  <p className="text-center text-xs text-slate-400">
                    By submitting, you agree to be contacted by our admissions team regarding your application.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const inputClass = 'w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100';

function Field({
  label, error, icon: Icon, children, className,
}: { label: string; error?: string; icon?: React.ElementType; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-navy-900">
        {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />} {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
