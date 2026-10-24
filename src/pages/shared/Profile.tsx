import React, { useState } from 'react';
import { Pencil, Save, X, Mail, Phone, Droplet, Cake, GraduationCap, MapPin, Users2, ShieldAlert, DoorOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { useCurrentStudent } from '../../hooks/useCurrentStudent';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/Misc';
import { formatDateIN } from '../../utils/format';
import { ROLE_META } from '../../data/users';

function Field({ label, value, name, editing, onChange, type = 'text' }: {
  label: string; value: string; name: string; editing: boolean; onChange: (n: string, v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</label>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100"
        />
      ) : (
        <p className="text-sm font-semibold text-navy-950">{value || '—'}</p>
      )}
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const { updateStudent } = useAppData();
  const isStudent = user?.role === 'student';
  const student = useCurrentStudent();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(student);

  if (!user) return null;

  const handleChange = (field: string, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };
  const handleNested = (group: 'address' | 'guardian' | 'emergency', field: string, value: string) => {
    setDraft((prev) => ({ ...prev, [group]: { ...(prev as any)[group], [field]: value } }));
  };

  const save = () => {
    updateStudent(student.id, draft);
    setEditing(false);
    toast.success('Profile updated successfully.');
  };
  const cancel = () => {
    setDraft(student);
    setEditing(false);
  };

  if (!isStudent) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <div className="flex items-center gap-4">
            <img src={user.avatar} alt={user.name} className="h-20 w-20 rounded-2xl object-cover ring-4 ring-navy-50" />
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-950">{user.name}</h2>
              <p className="text-sm text-slate-500">{user.designation}</p>
              <Badge tone="gold" dot={false} className="mt-2">{ROLE_META.find((r) => r.id === user.role)?.label}</Badge>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-navy-950"><Mail className="h-4 w-4 text-slate-400" /> {user.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-navy-950"><Phone className="h-4 w-4 text-slate-400" /> {user.phone}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Employee ID</p>
              <p className="mt-1 text-sm font-semibold text-navy-950">{user.id}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Role</p>
              <p className="mt-1 text-sm font-semibold text-navy-950">{ROLE_META.find((r) => r.id === user.role)?.label}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <img src={student.avatar} alt={student.name} className="h-20 w-20 rounded-2xl object-cover ring-4 ring-navy-50" />
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-950">{student.name}</h2>
              <p className="text-sm text-slate-500">{student.enrollmentNo}</p>
              <Badge status={student.status} className="mt-2" />
            </div>
          </div>
          {editing ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={<X className="h-4 w-4" />} onClick={cancel}>Cancel</Button>
              <Button size="sm" icon={<Save className="h-4 w-4" />} onClick={save}>Save Changes</Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" icon={<Pencil className="h-4 w-4" />} onClick={() => setEditing(true)}>Edit Profile</Button>
          )}
        </div>
        <div className="mt-5 rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between text-sm">
            <p className="font-semibold text-navy-900">Profile Completion</p>
            <span className="font-bold text-gold-600">{student.profileCompletion}%</span>
          </div>
          <div className="mt-2"><ProgressBar value={student.profileCompletion} tone="gold" /></div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Personal Information" icon={<Cake className="h-4.5 w-4.5" />} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Full Name" name="name" value={draft.name} editing={editing} onChange={handleChange} />
          <Field label="Date of Birth" name="dob" value={draft.dob} editing={editing} onChange={handleChange} type="date" />
          <Field label="Gender" name="gender" value={draft.gender} editing={false} onChange={handleChange} />
          <Field label="Blood Group" name="bloodGroup" value={draft.bloodGroup} editing={false} onChange={handleChange} />
          <Field label="Phone" name="phone" value={draft.phone} editing={editing} onChange={handleChange} />
          <Field label="Email" name="email" value={draft.email} editing={editing} onChange={handleChange} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Academic Information" icon={<GraduationCap className="h-4.5 w-4.5" />} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="College / Institute" name="college" value={draft.college} editing={false} onChange={handleChange} />
          <Field label="Course" name="course" value={draft.course} editing={false} onChange={handleChange} />
          <Field label="Semester / Year" name="semester" value={draft.semester} editing={false} onChange={handleChange} />
          <Field label="Enrollment Number" name="enrollmentNo" value={draft.enrollmentNo} editing={false} onChange={handleChange} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Contact Information" icon={<MapPin className="h-4.5 w-4.5" />} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Field label="Current Address" name="line" value={draft.address.line} editing={editing} onChange={(n, v) => handleNested('address', n, v)} />
          </div>
          <Field label="City" name="city" value={draft.address.city} editing={editing} onChange={(n, v) => handleNested('address', n, v)} />
          <Field label="State" name="state" value={draft.address.state} editing={editing} onChange={(n, v) => handleNested('address', n, v)} />
          <Field label="Pincode" name="pincode" value={draft.address.pincode} editing={editing} onChange={(n, v) => handleNested('address', n, v)} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Guardian Information" icon={<Users2 className="h-4.5 w-4.5" />} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Guardian Name" name="name" value={draft.guardian.name} editing={editing} onChange={(n, v) => handleNested('guardian', n, v)} />
            <Field label="Relationship" name="relationship" value={draft.guardian.relationship} editing={editing} onChange={(n, v) => handleNested('guardian', n, v)} />
            <Field label="Phone" name="phone" value={draft.guardian.phone} editing={editing} onChange={(n, v) => handleNested('guardian', n, v)} />
            <Field label="Email" name="email" value={draft.guardian.email} editing={editing} onChange={(n, v) => handleNested('guardian', n, v)} />
          </div>
        </Card>

        <Card className="border-rose-100">
          <CardHeader title="Emergency Contact" icon={<ShieldAlert className="h-4.5 w-4.5 text-rose-600" />} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Contact Person" name="name" value={draft.emergency.name} editing={editing} onChange={(n, v) => handleNested('emergency', n, v)} />
            <Field label="Relationship" name="relationship" value={draft.emergency.relationship} editing={editing} onChange={(n, v) => handleNested('emergency', n, v)} />
            <Field label="Phone" name="phone" value={draft.emergency.phone} editing={editing} onChange={(n, v) => handleNested('emergency', n, v)} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Hostel Allocation" icon={<DoorOpen className="h-4.5 w-4.5" />} />
        {student.allocation ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {[
              ['Building', student.allocation.building],
              ['Floor', student.allocation.floor],
              ['Room', student.allocation.room],
              ['Bed', student.allocation.bed],
              ['Joining Date', formatDateIN(student.allocation.joiningDate)],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-bold text-navy-950">{value}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No active hostel allocation.</p>
        )}
      </Card>
    </div>
  );
}
