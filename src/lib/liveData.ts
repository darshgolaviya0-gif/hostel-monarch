// ============================================================================
// HOSTEL MONARCH — Live data access layer (Supabase)
// ============================================================================
// Thin mapping + CRUD helpers between the Postgres tables defined in
// supabase/operational_schema.sql (+ v2 patch) and the app's TypeScript
// domain types in src/types/index.ts. Used only when isLiveMode is true
// (see src/lib/supabase.ts) — AppDataContext falls back to in-memory demo
// data otherwise.
//
// Design: each table stores most fields as real columns (used by RLS
// policies and useful for future server-side queries), plus an `extra`
// jsonb column holding any nested/less-common fields that don't map
// cleanly to a flat column. Every fetch/save function below hides that
// detail behind a plain TypeScript object matching the app's existing type.
// ============================================================================

import { supabase } from './supabase';
import type {
  Admission,
  AppNotification,
  AuditLog,
  Complaint,
  DietRequest,
  GateLog,
  Invoice,
  LeaveRequest,
  MealParticipationEntry,
  MessFeedback,
  MessMenuDay,
  Notice,
  Parcel,
  Payment,
  Room,
  Student,
  Visitor,
} from '../types';

function db() {
  if (!supabase) throw new Error('Supabase client not configured (not in live mode).');
  return supabase;
}

function dayName(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'long' });
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// STUDENTS
// ---------------------------------------------------------------------------
export function dbToStudent(row: any): Student {
  const extra = row.extra ?? {};
  return {
    id: row.id,
    enrollmentNo: extra.enrollmentNo ?? '',
    name: row.name,
    avatar: extra.avatar ?? '',
    dob: row.dob ?? '',
    gender: row.gender ?? 'Other',
    bloodGroup: extra.bloodGroup ?? 'O+',
    phone: row.phone ?? '',
    email: row.email,
    college: row.college ?? '',
    course: row.course ?? '',
    semester: row.semester ?? '',
    address: extra.address ?? { line: '', city: '', state: '', pincode: '' },
    guardian: extra.guardian ?? { name: '', relationship: '', phone: '', email: '' },
    emergency: extra.emergency ?? { name: '', relationship: '', phone: '' },
    allocation: row.allocation ?? null,
    status: row.status ?? 'Active',
    profileCompletion: row.profile_completion ?? 0,
    feeDue: Number(row.fee_due ?? 0),
    admissionStatus: row.admission_status ?? 'Approved',
  };
}

export function studentToDb(s: Student, profileId?: string | null) {
  return {
    id: s.id,
    profile_id: profileId ?? undefined,
    name: s.name,
    email: s.email,
    phone: s.phone,
    gender: s.gender,
    dob: s.dob || null,
    course: s.course,
    college: s.college,
    semester: s.semester,
    status: s.status,
    admission_status: s.admissionStatus,
    profile_completion: s.profileCompletion,
    fee_due: s.feeDue,
    allocation: s.allocation,
    extra: {
      enrollmentNo: s.enrollmentNo,
      avatar: s.avatar,
      bloodGroup: s.bloodGroup,
      address: s.address,
      guardian: s.guardian,
      emergency: s.emergency,
    },
  };
}

export const StudentsAPI = {
  async fetchAll(): Promise<Student[]> {
    const { data, error } = await db().from('students').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(dbToStudent);
  },
  async upsert(s: Student, profileId?: string | null): Promise<void> {
    const { error } = await db().from('students').upsert(studentToDb(s, profileId));
    if (error) throw error;
  },
};

// ---------------------------------------------------------------------------
// ROOMS
// ---------------------------------------------------------------------------
export function dbToRoom(row: any): Room {
  return {
    id: row.id,
    roomNo: row.room_no,
    floor: row.floor,
    building: row.building,
    type: row.type,
    capacity: row.capacity,
    beds: row.beds ?? [],
    amenities: row.amenities ?? [],
    monthlyRent: Number(row.monthly_rent ?? 0),
  };
}

export function roomToDb(r: Room) {
  return {
    id: r.id,
    building: r.building,
    floor: r.floor,
    room_no: r.roomNo,
    type: r.type,
    capacity: r.capacity,
    monthly_rent: r.monthlyRent,
    amenities: r.amenities,
    beds: r.beds,
  };
}

export const RoomsAPI = {
  async fetchAll(): Promise<Room[]> {
    const { data, error } = await db().from('rooms').select('*');
    if (error) throw error;
    return (data ?? []).map(dbToRoom);
  },
  async upsert(r: Room): Promise<void> {
    const { error } = await db().from('rooms').upsert(roomToDb(r));
    if (error) throw error;
  },
};

// ---------------------------------------------------------------------------
// ADMISSIONS
// ---------------------------------------------------------------------------
export function dbToAdmission(row: any): Admission {
  const extra = row.extra ?? {};
  return {
    id: row.id,
    applicationNo: row.application_no,
    studentName: row.student_name,
    studentId: extra.studentId ?? '',
    avatar: extra.avatar ?? '',
    course: row.course ?? '',
    college: row.college ?? '',
    phone: row.phone,
    email: row.email,
    appliedOn: row.applied_on,
    stage: row.stage,
    documents: row.documents ?? [],
    history: row.history ?? [],
    preferredBuilding: row.preferred_building ?? undefined,
    visitDate: row.visit_date ?? undefined,
    visitSlot: row.visit_slot ?? undefined,
    visitNote: row.visit_note ?? undefined,
  };
}

export function admissionToDb(a: Admission) {
  return {
    id: a.id,
    application_no: a.applicationNo,
    student_name: a.studentName,
    email: a.email,
    phone: a.phone,
    course: a.course,
    college: a.college,
    preferred_building: a.preferredBuilding ?? null,
    stage: a.stage,
    applied_on: a.appliedOn,
    visit_date: a.visitDate || null,
    visit_slot: a.visitSlot || null,
    visit_note: a.visitNote || null,
    documents: a.documents,
    history: a.history,
    extra: { studentId: a.studentId, avatar: a.avatar },
  };
}

export const AdmissionsAPI = {
  async fetchAll(): Promise<Admission[]> {
    const { data, error } = await db().from('admissions').select('*').order('applied_on', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(dbToAdmission);
  },
  /** Public insert — used by the unauthenticated "Apply for Admission" page. */
  async create(a: Admission): Promise<void> {
    const { error } = await db().from('admissions').insert(admissionToDb(a));
    if (error) throw error;
  },
  async update(a: Admission): Promise<void> {
    const { id, ...rest } = admissionToDb(a);
    const { error } = await db().from('admissions').update(rest).eq('id', id);
    if (error) throw error;
  },
};

// ---------------------------------------------------------------------------
// INVOICES & PAYMENTS
// ---------------------------------------------------------------------------
export function dbToInvoice(row: any): Invoice {
  return {
    id: row.id,
    invoiceNo: row.invoice_no,
    studentId: row.student_id,
    studentName: row.student_name,
    room: row.room ?? '',
    title: row.title,
    amount: Number(row.amount),
    paidAmount: Number(row.paid_amount ?? 0),
    dueDate: row.due_date,
    issuedDate: row.issued_date,
    status: row.status,
    period: row.period ?? '',
    semester: row.semester,
  };
}

export function invoiceToDb(i: Invoice) {
  return {
    id: i.id,
    invoice_no: i.invoiceNo,
    student_id: i.studentId,
    student_name: i.studentName,
    room: i.room,
    title: i.title,
    amount: i.amount,
    paid_amount: i.paidAmount,
    due_date: i.dueDate,
    issued_date: i.issuedDate,
    status: i.status,
    period: i.period,
    semester: i.semester,
  };
}

export const InvoicesAPI = {
  async fetchAll(): Promise<Invoice[]> {
    const { data, error } = await db().from('invoices').select('*');
    if (error) throw error;
    return (data ?? []).map(dbToInvoice);
  },
  async upsert(i: Invoice): Promise<void> {
    const { error } = await db().from('invoices').upsert(invoiceToDb(i));
    if (error) throw error;
  },
};

export function dbToPayment(row: any): Payment {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    invoiceId: row.invoice_id,
    invoiceNo: row.invoice_no,
    studentId: row.student_id,
    studentName: row.student_name,
    amount: Number(row.amount),
    method: row.method,
    status: row.status,
    date: row.date,
    verifiedBy: row.verified_by ?? undefined,
  };
}

export function paymentToDb(p: Payment) {
  return {
    id: p.id,
    transaction_id: p.transactionId,
    invoice_id: p.invoiceId,
    invoice_no: p.invoiceNo,
    student_id: p.studentId,
    student_name: p.studentName,
    amount: p.amount,
    method: p.method,
    status: p.status,
    date: p.date,
    verified_by: p.verifiedBy ?? null,
  };
}

export const PaymentsAPI = {
  async fetchAll(): Promise<Payment[]> {
    const { data, error } = await db().from('payments').select('*');
    if (error) throw error;
    return (data ?? []).map(dbToPayment);
  },
  async create(p: Payment): Promise<void> {
    const { error } = await db().from('payments').insert(paymentToDb(p));
    if (error) throw error;
  },
};

// ---------------------------------------------------------------------------
// COMPLAINTS
// ---------------------------------------------------------------------------
export function dbToComplaint(row: any): Complaint {
  const extra = row.extra ?? {};
  return {
    id: row.id,
    ticketNo: row.ticket_no,
    studentId: row.student_id,
    studentName: row.student_name,
    room: row.room ?? '',
    category: row.category,
    priority: row.priority,
    status: row.status,
    title: row.title,
    description: row.description ?? '',
    imageAttached: !!extra.imageAttached,
    createdAt: row.created_at,
    assignedTo: row.assignee ?? undefined,
    timeline: row.timeline ?? [],
  };
}

export function complaintToDb(c: Complaint) {
  return {
    id: c.id,
    ticket_no: c.ticketNo,
    student_id: c.studentId,
    student_name: c.studentName,
    room: c.room,
    category: c.category,
    title: c.title,
    description: c.description,
    priority: c.priority,
    status: c.status,
    assignee: c.assignedTo ?? null,
    created_at: c.createdAt,
    timeline: c.timeline,
    extra: { imageAttached: c.imageAttached },
  };
}

export const ComplaintsAPI = {
  async fetchAll(): Promise<Complaint[]> {
    const { data, error } = await db().from('complaints').select('*');
    if (error) throw error;
    return (data ?? []).map(dbToComplaint);
  },
  async create(c: Complaint): Promise<void> {
    const { error } = await db().from('complaints').insert(complaintToDb(c));
    if (error) throw error;
  },
  async update(c: Complaint): Promise<void> {
    const { id, ...rest } = complaintToDb(c);
    const { error } = await db().from('complaints').update(rest).eq('id', id);
    if (error) throw error;
  },
};

// ---------------------------------------------------------------------------
// LEAVE REQUESTS & GATE LOGS
// ---------------------------------------------------------------------------
export function dbToLeave(row: any): LeaveRequest {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    room: row.room ?? '',
    type: row.type,
    startDate: row.start_date,
    endDate: row.end_date,
    reason: row.reason ?? '',
    destination: row.destination ?? '',
    emergencyContact: row.emergency_contact ?? '',
    status: row.status,
    appliedOn: row.applied_on,
    reviewedBy: row.reviewed_by ?? undefined,
    reviewRemark: row.review_remark ?? undefined,
    qrPass: row.qr_pass ?? undefined,
  };
}

export function leaveToDb(l: LeaveRequest) {
  return {
    id: l.id,
    student_id: l.studentId,
    student_name: l.studentName,
    room: l.room,
    type: l.type,
    start_date: l.startDate,
    end_date: l.endDate,
    reason: l.reason,
    destination: l.destination,
    emergency_contact: l.emergencyContact,
    status: l.status,
    applied_on: l.appliedOn,
    reviewed_by: l.reviewedBy ?? null,
    review_remark: l.reviewRemark ?? null,
    qr_pass: l.qrPass ?? null,
  };
}

export const LeavesAPI = {
  async fetchAll(): Promise<LeaveRequest[]> {
    const { data, error } = await db().from('leave_requests').select('*');
    if (error) throw error;
    return (data ?? []).map(dbToLeave);
  },
  async create(l: LeaveRequest): Promise<void> {
    const { error } = await db().from('leave_requests').insert(leaveToDb(l));
    if (error) throw error;
  },
  async update(l: LeaveRequest): Promise<void> {
    const { id, ...rest } = leaveToDb(l);
    const { error } = await db().from('leave_requests').update(rest).eq('id', id);
    if (error) throw error;
  },
};

export function dbToGateLog(row: any): GateLog {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    passId: row.pass_id,
    direction: row.direction,
    timestamp: row.timestamp,
    verifiedBy: row.verified_by,
    result: row.result,
  };
}

export function gateLogToDb(g: GateLog) {
  return {
    id: g.id,
    student_id: g.studentId,
    student_name: g.studentName,
    pass_id: g.passId,
    direction: g.direction,
    timestamp: g.timestamp,
    verified_by: g.verifiedBy,
    result: g.result,
  };
}

export const GateLogsAPI = {
  async fetchAll(): Promise<GateLog[]> {
    const { data, error } = await db().from('gate_logs').select('*');
    if (error) throw error;
    return (data ?? []).map(dbToGateLog);
  },
  async create(g: GateLog): Promise<void> {
    const { error } = await db().from('gate_logs').insert(gateLogToDb(g));
    if (error) throw error;
  },
};

// ---------------------------------------------------------------------------
// VISITORS & PARCELS
// ---------------------------------------------------------------------------
export function dbToVisitor(row: any): Visitor {
  const extra = row.extra ?? {};
  return {
    id: row.id,
    visitorName: row.visitor_name,
    phone: row.phone ?? '',
    relationship: row.relation ?? '',
    studentId: row.student_id,
    studentName: row.student_name,
    room: extra.room ?? '',
    visitDate: row.expected_date ?? '',
    expectedTime: extra.expectedTime ?? '',
    purpose: row.purpose ?? '',
    status: row.status,
    checkInTime: row.checked_in_at ?? undefined,
    checkOutTime: row.checked_out_at ?? undefined,
  };
}

export function visitorToDb(v: Visitor) {
  return {
    id: v.id,
    student_id: v.studentId,
    student_name: v.studentName,
    visitor_name: v.visitorName,
    relation: v.relationship,
    phone: v.phone,
    purpose: v.purpose,
    expected_date: v.visitDate || null,
    status: v.status,
    checked_in_at: v.checkInTime ?? null,
    checked_out_at: v.checkOutTime ?? null,
    extra: { room: v.room, expectedTime: v.expectedTime },
  };
}

export const VisitorsAPI = {
  async fetchAll(): Promise<Visitor[]> {
    const { data, error } = await db().from('visitors').select('*');
    if (error) throw error;
    return (data ?? []).map(dbToVisitor);
  },
  async create(v: Visitor): Promise<void> {
    const { error } = await db().from('visitors').insert(visitorToDb(v));
    if (error) throw error;
  },
  async update(v: Visitor): Promise<void> {
    const { id, ...rest } = visitorToDb(v);
    const { error } = await db().from('visitors').update(rest).eq('id', id);
    if (error) throw error;
  },
};

export function dbToParcel(row: any): Parcel {
  const extra = row.extra ?? {};
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    room: extra.room ?? '',
    courier: row.courier ?? '',
    trackingNo: row.tracking_id ?? '',
    arrivalDate: row.received_at ?? '',
    status: row.status,
    pickupDate: row.collected_at ?? undefined,
  };
}

export function parcelToDb(p: Parcel) {
  return {
    id: p.id,
    student_id: p.studentId,
    student_name: p.studentName,
    courier: p.courier,
    tracking_id: p.trackingNo,
    received_at: p.arrivalDate,
    status: p.status,
    collected_at: p.pickupDate ?? null,
    extra: { room: p.room },
  };
}

export const ParcelsAPI = {
  async fetchAll(): Promise<Parcel[]> {
    const { data, error } = await db().from('parcels').select('*');
    if (error) throw error;
    return (data ?? []).map(dbToParcel);
  },
  async upsert(p: Parcel): Promise<void> {
    const { error } = await db().from('parcels').upsert(parcelToDb(p));
    if (error) throw error;
  },
};

// ---------------------------------------------------------------------------
// MESS: MENU, PARTICIPATION, DIET REQUESTS, FEEDBACK
// ---------------------------------------------------------------------------
export function dbToMenuDay(row: any): MessMenuDay {
  return { date: row.date, day: dayName(row.date), meals: row.meals ?? {} };
}

export function menuDayToDb(m: MessMenuDay) {
  return { date: m.date, meals: m.meals };
}

export const MenuAPI = {
  async fetchAll(): Promise<MessMenuDay[]> {
    const { data, error } = await db().from('mess_menu_days').select('*').order('date', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(dbToMenuDay);
  },
  async upsert(m: MessMenuDay): Promise<void> {
    const { error } = await db().from('mess_menu_days').upsert(menuDayToDb(m));
    if (error) throw error;
  },
};

export function dbToParticipation(row: any): MealParticipationEntry {
  return {
    studentId: row.student_id,
    studentName: row.student_name ?? '',
    room: row.room ?? '',
    breakfast: row.breakfast,
    lunch: row.lunch,
    snacks: row.snacks,
    dinner: row.dinner,
    diet: row.diet ?? 'Regular',
  };
}

export function participationToDb(p: MealParticipationEntry) {
  return {
    id: p.studentId,
    student_id: p.studentId,
    breakfast: p.breakfast,
    lunch: p.lunch,
    snacks: p.snacks,
    dinner: p.dinner,
    diet: p.diet,
    extra: { studentName: p.studentName, room: p.room },
  };
}

export const ParticipationAPI = {
  async fetchAll(): Promise<MealParticipationEntry[]> {
    const { data, error } = await db().from('meal_participation').select('*');
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      studentId: row.student_id,
      studentName: row.extra?.studentName ?? '',
      room: row.extra?.room ?? '',
      breakfast: row.breakfast,
      lunch: row.lunch,
      snacks: row.snacks,
      dinner: row.dinner,
      diet: row.diet ?? 'Regular',
    }));
  },
  async upsert(p: MealParticipationEntry): Promise<void> {
    const { error } = await db().from('meal_participation').upsert(participationToDb(p));
    if (error) throw error;
  },
};

export function dbToDietRequest(row: any): DietRequest {
  const extra = row.extra ?? {};
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    room: extra.room ?? '',
    diet: row.request_type,
    reason: row.reason ?? '',
    status: row.status,
    requestedOn: row.requested_on,
  };
}

export function dietRequestToDb(d: DietRequest) {
  return {
    id: d.id,
    student_id: d.studentId,
    student_name: d.studentName,
    request_type: d.diet,
    reason: d.reason,
    status: d.status,
    requested_on: d.requestedOn,
    extra: { room: d.room },
  };
}

export const DietRequestsAPI = {
  async fetchAll(): Promise<DietRequest[]> {
    const { data, error } = await db().from('diet_requests').select('*');
    if (error) throw error;
    return (data ?? []).map(dbToDietRequest);
  },
  async create(d: DietRequest): Promise<void> {
    const { error } = await db().from('diet_requests').insert(dietRequestToDb(d));
    if (error) throw error;
  },
  async update(d: DietRequest): Promise<void> {
    const { id, ...rest } = dietRequestToDb(d);
    const { error } = await db().from('diet_requests').update(rest).eq('id', id);
    if (error) throw error;
  },
};

export function dbToFeedback(row: any): MessFeedback {
  const extra = row.extra ?? {};
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    date: row.date,
    meal: extra.meal ?? 'Lunch',
    rating: row.rating,
    comment: row.comment ?? '',
  };
}

export function feedbackToDb(f: MessFeedback) {
  return {
    id: f.id,
    student_id: f.studentId,
    student_name: f.studentName,
    date: f.date,
    rating: f.rating,
    comment: f.comment,
    extra: { meal: f.meal },
  };
}

export const FeedbackAPI = {
  async fetchAll(): Promise<MessFeedback[]> {
    const { data, error } = await db().from('mess_feedback').select('*');
    if (error) throw error;
    return (data ?? []).map(dbToFeedback);
  },
  async create(f: MessFeedback): Promise<void> {
    const { error } = await db().from('mess_feedback').insert(feedbackToDb(f));
    if (error) throw error;
  },
};

// ---------------------------------------------------------------------------
// NOTICES & NOTIFICATIONS
// ---------------------------------------------------------------------------
export function dbToNotice(row: any): Notice {
  const extra = row.extra ?? {};
  return {
    id: row.id,
    title: row.title,
    description: row.body ?? '',
    category: extra.category ?? 'General',
    priority: extra.priority ?? 'Medium',
    audience: row.audience ?? 'All',
    publishDate: row.publish_date,
    expiryDate: extra.expiryDate ?? row.publish_date,
    author: row.posted_by ?? '',
    pinned: !!extra.pinned,
  };
}

export function noticeToDb(n: Notice) {
  return {
    id: n.id,
    title: n.title,
    body: n.description,
    audience: n.audience,
    publish_date: n.publishDate,
    posted_by: n.author,
    extra: { category: n.category, priority: n.priority, expiryDate: n.expiryDate, pinned: !!n.pinned },
  };
}

export const NoticesAPI = {
  async fetchAll(): Promise<Notice[]> {
    const { data, error } = await db().from('notices').select('*').order('publish_date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(dbToNotice);
  },
  async create(n: Notice): Promise<void> {
    const { error } = await db().from('notices').insert(noticeToDb(n));
    if (error) throw error;
  },
};

export function dbToNotification(row: any): AppNotification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    category: row.category ?? 'System',
    timestamp: row.timestamp,
    read: row.read,
    forRole: row.for_role ?? undefined,
  };
}

export function notificationToDb(n: AppNotification) {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    category: n.category,
    for_role: n.forRole ?? 'student',
    timestamp: n.timestamp,
    read: n.read,
  };
}

export const NotificationsAPI = {
  async fetchAll(): Promise<AppNotification[]> {
    const { data, error } = await db().from('notifications').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(dbToNotification);
  },
  async create(n: AppNotification): Promise<void> {
    const { error } = await db().from('notifications').insert(notificationToDb(n));
    if (error) throw error;
  },
  async markRead(id: string): Promise<void> {
    const { error } = await db().from('notifications').update({ read: true }).eq('id', id);
    if (error) throw error;
  },
  async markAllReadForRole(role: string): Promise<void> {
    const { error } = await db().from('notifications').update({ read: true }).eq('for_role', role);
    if (error) throw error;
  },
};

// ---------------------------------------------------------------------------
// AUDIT LOGS
// ---------------------------------------------------------------------------
export function dbToAudit(row: any): AuditLog {
  const extra = row.extra ?? {};
  return {
    id: row.id,
    user: row.actor_name,
    role: row.role,
    action: row.action,
    module: row.module,
    date: extra.date ?? '',
    time: extra.time ?? '',
    status: row.status,
  };
}

export function auditToDb(a: AuditLog) {
  return {
    id: a.id,
    actor_name: a.user,
    role: a.role,
    action: a.action,
    module: a.module,
    status: a.status,
    extra: { date: a.date, time: a.time },
  };
}

export const AuditAPI = {
  async fetchAll(): Promise<AuditLog[]> {
    const { data, error } = await db().from('audit_logs').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) throw error;
    return (data ?? []).map(dbToAudit);
  },
  async create(a: AuditLog): Promise<void> {
    // audit_logs.id is a uuid generated by the DB — don't send our local "AUD-..." id.
    const { id: _ignored, ...rest } = auditToDb(a);
    const { error } = await db().from('audit_logs').insert(rest);
    if (error) throw error;
  },
};

// ---------------------------------------------------------------------------
// CONTACT MESSAGES (public contact form — no app type, used directly)
// ---------------------------------------------------------------------------
export const ContactAPI = {
  async submit(payload: { name: string; email: string; phone?: string; message: string }): Promise<void> {
    const { error } = await db().from('contact_messages').insert(payload);
    if (error) throw error;
  },
};
