import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  Admission,
  AppNotification,
  AuditLog,
  Complaint,
  ComplaintStatus,
  DietRequest,
  GateLog,
  Invoice,
  LeaveRequest,
  MealParticipationEntry,
  MessFeedback,
  MessMenuDay,
  Notice,
  Parcel,
  ParcelStatus,
  Payment,
  PaymentMethod,
  QRPass,
  Role,
  Room,
  Student,
  Visitor,
  VisitorStatus,
} from '../types';
import { STUDENTS } from '../data/students';
import { ALL_ROOMS } from '../data/buildings';
import { ADMISSIONS } from '../data/admissions';
import { INVOICES, PAYMENTS } from '../data/fees';
import { COMPLAINTS } from '../data/complaints';
import { LEAVE_REQUESTS, GATE_LOGS } from '../data/leaves';
import { VISITORS, PARCELS } from '../data/visitorsParcels';
import { WEEKLY_MENU, MEAL_PARTICIPATION, DIET_REQUESTS, MESS_FEEDBACK } from '../data/mess';
import { NOTICES, AUDIT_LOGS, NOTIFICATIONS } from '../data/notices';
import { isLiveMode } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  StudentsAPI,
  RoomsAPI,
  AdmissionsAPI,
  InvoicesAPI,
  PaymentsAPI,
  ComplaintsAPI,
  LeavesAPI,
  GateLogsAPI,
  VisitorsAPI,
  ParcelsAPI,
  MenuAPI,
  ParticipationAPI,
  DietRequestsAPI,
  FeedbackAPI,
  NoticesAPI,
  NotificationsAPI,
  AuditAPI,
} from '../lib/liveData';

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

/** Swallow + log live-sync failures so a Supabase hiccup never breaks the UI — the
 * optimistic local state update has already happened by the time this runs. */
function sync(label: string, p: Promise<unknown>) {
  if (!isLiveMode) return;
  p.catch((err) => console.error(`[live-sync] ${label} failed:`, err));
}

const ADMISSION_DOC_TYPES: Admission['documents'][number]['type'][] = [
  'Aadhaar',
  'Student ID',
  'College ID',
  'Address Proof',
  'Passport Photo',
  'Guardian ID',
  'Medical Document',
];

function nowISO() {
  return new Date('2026-10-04T22:45:00').toISOString().slice(0, 10);
}

function nowStamp() {
  const d = new Date('2026-10-04T22:45:00');
  return {
    date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    iso: d.toISOString(),
  };
}

interface AppDataState {
  students: Student[];
  rooms: Room[];
  admissions: Admission[];
  invoices: Invoice[];
  payments: Payment[];
  complaints: Complaint[];
  leaves: LeaveRequest[];
  gateLogs: GateLog[];
  visitors: Visitor[];
  parcels: Parcel[];
  menu: MessMenuDay[];
  participation: MealParticipationEntry[];
  dietRequests: DietRequest[];
  feedback: MessFeedback[];
  notices: Notice[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
}

interface AppDataContextValue extends AppDataState {
  /** True while the real Supabase data is still being fetched after login (live mode only). */
  dataLoading: boolean;

  addAudit: (user: string, role: Role, action: string, module: string, status?: AuditLog['status']) => void;
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (role: Role) => void;

  updateStudent: (id: string, patch: Partial<Student>) => void;
  addStudentLocal: (s: Student) => void;

  reviewAdmission: (id: string, stage: Admission['stage'], by: string, remark?: string) => void;
  verifyDocument: (admissionId: string, docId: string, status: 'Verified' | 'Rejected', remark?: string) => void;
  createAdmission: (payload: {
    studentName: string;
    email: string;
    phone: string;
    course: string;
    college: string;
    preferredBuilding?: string;
    visitDate?: string;
    visitSlot?: string;
    visitNote?: string;
  }) => { id: string; applicationNo: string };

  allocateBed: (roomId: string, bedId: string, studentId: string, by: string) => void;
  vacateBed: (roomId: string, bedId: string, by: string) => void;
  transferStudent: (studentId: string, fromRoomId: string, fromBedId: string, toRoomId: string, toBedId: string, by: string) => void;

  payInvoice: (invoiceId: string, amount: number, method: PaymentMethod, by: string) => Payment;

  createComplaint: (c: Omit<Complaint, 'id' | 'ticketNo' | 'status' | 'timeline' | 'createdAt'>) => Complaint;
  assignComplaint: (id: string, assignee: string, by: string) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus, note: string, by: string) => void;

  createLeave: (l: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => LeaveRequest;
  reviewLeave: (id: string, approve: boolean, by: string, remark: string) => void;
  verifyQRPass: (passId: string, direction: 'Entry' | 'Exit', by: string) => { result: 'Valid' | 'Invalid' | 'Expired'; pass?: QRPass };

  registerVisitor: (v: Omit<Visitor, 'id' | 'status'>) => Visitor;
  updateVisitorStatus: (id: string, status: VisitorStatus, by: string) => void;

  updateParcelStatus: (id: string, status: ParcelStatus, by: string) => void;

  toggleMealParticipation: (studentId: string, meal: 'breakfast' | 'lunch' | 'snacks' | 'dinner', value: boolean) => void;
  submitDietRequest: (d: Omit<DietRequest, 'id' | 'status' | 'requestedOn'>) => void;
  reviewDietRequest: (id: string, approve: boolean, by: string) => void;
  submitFeedback: (f: Omit<MessFeedback, 'id' | 'date'>) => void;
  updateMenuDay: (date: string, meal: keyof MessMenuDay['meals'], items: string[]) => void;

  createNotice: (n: Omit<Notice, 'id' | 'publishDate'>) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  const [students, setStudents] = useState<Student[]>(() => (isLiveMode ? [] : clone(STUDENTS)));
  const [rooms, setRooms] = useState<Room[]>(() => (isLiveMode ? [] : clone(ALL_ROOMS)));
  const [admissions, setAdmissions] = useState<Admission[]>(() => (isLiveMode ? [] : clone(ADMISSIONS)));
  const [invoices, setInvoices] = useState<Invoice[]>(() => (isLiveMode ? [] : clone(INVOICES)));
  const [payments, setPayments] = useState<Payment[]>(() => (isLiveMode ? [] : clone(PAYMENTS)));
  const [complaints, setComplaints] = useState<Complaint[]>(() => (isLiveMode ? [] : clone(COMPLAINTS)));
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => (isLiveMode ? [] : clone(LEAVE_REQUESTS)));
  const [gateLogs, setGateLogs] = useState<GateLog[]>(() => (isLiveMode ? [] : clone(GATE_LOGS)));
  const [visitors, setVisitors] = useState<Visitor[]>(() => (isLiveMode ? [] : clone(VISITORS)));
  const [parcels, setParcels] = useState<Parcel[]>(() => (isLiveMode ? [] : clone(PARCELS)));
  const [menu, setMenu] = useState<MessMenuDay[]>(() => (isLiveMode ? [] : clone(WEEKLY_MENU)));
  const [participation, setParticipation] = useState<MealParticipationEntry[]>(() => (isLiveMode ? [] : clone(MEAL_PARTICIPATION)));
  const [dietRequests, setDietRequests] = useState<DietRequest[]>(() => (isLiveMode ? [] : clone(DIET_REQUESTS)));
  const [feedback, setFeedback] = useState<MessFeedback[]>(() => (isLiveMode ? [] : clone(MESS_FEEDBACK)));
  const [notices, setNotices] = useState<Notice[]>(() => (isLiveMode ? [] : clone(NOTICES)));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => (isLiveMode ? [] : clone(AUDIT_LOGS)));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => (isLiveMode ? [] : clone(NOTIFICATIONS)));
  const [dataLoading, setDataLoading] = useState(isLiveMode);

  // Load real data from Supabase once a real session exists. Public/anonymous
  // visitors never trigger this (and never need to — the public "Apply for
  // Admission" / "Contact Us" forms write directly without needing this
  // bulk read first).
  useEffect(() => {
    if (!isLiveMode) return;
    if (!isAuthenticated) {
      setDataLoading(false);
      return;
    }
    let cancelled = false;
    setDataLoading(true);
    (async () => {
      try {
        const [
          s, r, a, inv, pay, c, lv, gl, vis, par, mn, part, diet, fb, not, aud, notif,
        ] = await Promise.all([
          StudentsAPI.fetchAll(), RoomsAPI.fetchAll(), AdmissionsAPI.fetchAll(), InvoicesAPI.fetchAll(),
          PaymentsAPI.fetchAll(), ComplaintsAPI.fetchAll(), LeavesAPI.fetchAll(), GateLogsAPI.fetchAll(),
          VisitorsAPI.fetchAll(), ParcelsAPI.fetchAll(), MenuAPI.fetchAll(), ParticipationAPI.fetchAll(),
          DietRequestsAPI.fetchAll(), FeedbackAPI.fetchAll(), NoticesAPI.fetchAll(), AuditAPI.fetchAll(),
          NotificationsAPI.fetchAll(),
        ]);
        if (cancelled) return;
        setStudents(s); setRooms(r); setAdmissions(a); setInvoices(inv); setPayments(pay);
        setComplaints(c); setLeaves(lv); setGateLogs(gl); setVisitors(vis); setParcels(par);
        setMenu(mn); setParticipation(part); setDietRequests(diet); setFeedback(fb);
        setNotices(not); setAuditLogs(aud); setNotifications(notif);
      } catch (err) {
        console.error('[live-sync] failed to load data from Supabase:', err);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const addAudit = useCallback((user: string, role: Role, action: string, module: string, status: AuditLog['status'] = 'Success') => {
    const { date, time } = nowStamp();
    const entry: AuditLog = { id: `AUD-${Date.now()}`, user, role, action, module, date, time, status };
    setAuditLogs((prev) => [entry, ...prev]);
    sync('addAudit', AuditAPI.create(entry));
  }, []);

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const { date, time } = nowStamp();
    const entry: AppNotification = { ...n, id: `N-${Date.now()}`, timestamp: `${date} ${time}`, read: false };
    setNotifications((prev) => [entry, ...prev]);
    sync('addNotification', NotificationsAPI.create(entry));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    sync('markNotificationRead', NotificationsAPI.markRead(id));
  }, []);

  const markAllNotificationsRead = useCallback((role: Role) => {
    setNotifications((prev) => prev.map((n) => (n.forRole === role ? { ...n, read: true } : n)));
    sync('markAllNotificationsRead', NotificationsAPI.markAllReadForRole(role));
  }, []);

  const updateStudent = useCallback((id: string, patch: Partial<Student>) => {
    setStudents((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...patch } : s));
      const merged = next.find((s) => s.id === id);
      if (merged) sync('updateStudent', StudentsAPI.upsert(merged));
      return next;
    });
  }, []);

  // Inserts a Student record into local state only (no remote write) — used
  // right after a caller has already persisted the record itself, e.g. when
  // an admin approves a student's account and their `students` row is
  // created directly via StudentsAPI.upsert. Keeps the Student Directory in
  // sync immediately without requiring a full page reload.
  const addStudentLocal = useCallback((s: Student) => {
    setStudents((prev) => (prev.some((p) => p.id === s.id) ? prev : [...prev, s]));
  }, []);

  const reviewAdmission = useCallback((id: string, stage: Admission['stage'], by: string, remark?: string) => {
    const { date } = nowStamp();
    setAdmissions((prev) => {
      const next = prev.map((a) =>
        a.id === id
          ? { ...a, stage, history: [...a.history, { stage, date: date, by, remark }] }
          : a
      );
      const merged = next.find((a) => a.id === id);
      if (merged) sync('reviewAdmission', AdmissionsAPI.update(merged));
      return next;
    });
  }, []);

  const verifyDocument = useCallback((admissionId: string, docId: string, status: 'Verified' | 'Rejected', remark?: string) => {
    setAdmissions((prev) => {
      const next = prev.map((a) =>
        a.id === admissionId
          ? { ...a, documents: a.documents.map((d) => (d.id === docId ? { ...d, status, remark } : d)) }
          : a
      );
      const merged = next.find((a) => a.id === admissionId);
      if (merged) sync('verifyDocument', AdmissionsAPI.update(merged));
      return next;
    });
  }, []);

  const createAdmission = useCallback(
    (payload: {
      studentName: string;
      email: string;
      phone: string;
      course: string;
      college: string;
      preferredBuilding?: string;
      visitDate?: string;
      visitSlot?: string;
      visitNote?: string;
    }) => {
      // In live mode this can be called by an anonymous public visitor whose
      // local `admissions` array is empty (RLS hides the real list from
      // non-staff), so a length-based sequence number would collide across
      // applicants. Use a collision-resistant id/number there instead.
      let id: string;
      let applicationNo: string;
      if (isLiveMode) {
        const stamp = Date.now().toString(36).toUpperCase();
        id = `ADM-2026-${stamp}`;
        applicationNo = `HM/ADM/2026/${Date.now().toString().slice(-6)}`;
      } else {
        const seq = admissions.length + 1;
        id = `ADM-2026-${String(seq).padStart(3, '0')}`;
        applicationNo = `HM/ADM/2026/${150 + seq}`;
      }
      const today = nowISO();
      const newAdmission: Admission = {
        id,
        applicationNo,
        studentName: payload.studentName,
        studentId: `HM-STU-PENDING-${Date.now().toString().slice(-4)}`,
        avatar: '',
        course: payload.course,
        college: payload.college,
        phone: payload.phone,
        email: payload.email,
        appliedOn: today,
        stage: 'Application Started',
        documents: ADMISSION_DOC_TYPES.map((type) => ({
          id: `${id}-${type.replace(/\s/g, '')}`,
          type,
          status: 'Pending' as const,
          fileName: '',
          uploadedAt: null,
        })),
        history: [
          {
            stage: 'Application Started',
            date: today,
            by: payload.studentName,
            remark: payload.visitDate
              ? `Application submitted via public admission form. Requested hostel visit on ${payload.visitDate}${payload.visitSlot ? ` (${payload.visitSlot})` : ''}.`
              : 'Application submitted via public admission form.',
          },
        ],
        preferredBuilding: payload.preferredBuilding,
        visitDate: payload.visitDate,
        visitSlot: payload.visitSlot,
        visitNote: payload.visitNote,
      };
      setAdmissions((prev) => [newAdmission, ...prev]);
      sync('createAdmission', AdmissionsAPI.create(newAdmission));
      addAudit(payload.studentName, 'student', `New admission application submitted (${applicationNo})`, 'Admissions', 'Success');
      return { id, applicationNo };
    },
    [admissions.length, addAudit]
  );

  const allocateBed = useCallback((roomId: string, bedId: string, studentId: string, by: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    setRooms((prev) => {
      const next = prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              beds: r.beds.map((b) =>
                b.id === bedId ? { ...b, status: 'Occupied' as const, studentId: student.id, studentName: student.name } : b
              ),
            }
          : r
      );
      const merged = next.find((r) => r.id === roomId);
      if (merged) sync('allocateBed', RoomsAPI.upsert(merged));
      return next;
    });
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      const bed = room.beds.find((b) => b.id === bedId);
      const { iso } = nowStamp();
      const bookingFrom = iso.slice(0, 10);
      const validTillDate = new Date(iso);
      validTillDate.setFullYear(validTillDate.getFullYear() + 1);
      const validTill = validTillDate.toISOString().slice(0, 10);
      updateStudent(studentId, {
        allocation: {
          building: room.building,
          floor: room.floor,
          room: room.roomNo,
          bed: bed?.label ?? '',
          joiningDate: nowStamp().date,
          bookingFrom,
          validTill,
        },
      });
    }
    addAudit(by, 'admin', `Allocated ${roomId} / ${bedId} to ${student.name}`, 'Room Allocation');
  }, [students, rooms, updateStudent, addAudit]);

  const vacateBed = useCallback((roomId: string, bedId: string, by: string) => {
    setRooms((prev) => {
      const next = prev.map((r) =>
        r.id === roomId
          ? { ...r, beds: r.beds.map((b) => (b.id === bedId ? { id: b.id, label: b.label, status: 'Available' as const } : b)) }
          : r
      );
      const merged = next.find((r) => r.id === roomId);
      if (merged) sync('vacateBed', RoomsAPI.upsert(merged));
      return next;
    });
    addAudit(by, 'admin', `Vacated bed ${bedId} in ${roomId}`, 'Room Allocation');
  }, [addAudit]);

  const transferStudent = useCallback((studentId: string, fromRoomId: string, fromBedId: string, toRoomId: string, toBedId: string, by: string) => {
    vacateBed(fromRoomId, fromBedId, by);
    allocateBed(toRoomId, toBedId, studentId, by);
    addAudit(by, 'admin', `Transferred student ${studentId} from ${fromRoomId} to ${toRoomId}`, 'Room Allocation');
  }, [vacateBed, allocateBed, addAudit]);

  const payInvoice = useCallback((invoiceId: string, amount: number, method: PaymentMethod, by: string) => {
    const { date, time } = nowStamp();
    const invoice = invoices.find((i) => i.id === invoiceId);
    const txnId = `HM-TXN-${Math.floor(100000 + Math.random() * 899999)}`;
    const payment: Payment = {
      id: `PAY-${Date.now()}`,
      transactionId: txnId,
      invoiceId,
      invoiceNo: invoice?.invoiceNo ?? '',
      studentId: invoice?.studentId ?? '',
      studentName: invoice?.studentName ?? '',
      amount,
      method,
      status: 'Success',
      date: `${date} ${time}`,
      verifiedBy: by,
    };
    setPayments((prev) => [payment, ...prev]);
    sync('payInvoice:payment', PaymentsAPI.create(payment));
    setInvoices((prev) => {
      const next = prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const newPaid = inv.paidAmount + amount;
        const status = newPaid >= inv.amount ? 'Paid' as const : 'Partially Paid' as const;
        return { ...inv, paidAmount: newPaid, status };
      });
      const merged = next.find((inv) => inv.id === invoiceId);
      if (merged) sync('payInvoice:invoice', InvoicesAPI.upsert(merged));
      return next;
    });
    addAudit(by, 'student', `Paid ${amount} towards invoice ${invoice?.invoiceNo}`, 'Fees');
    return payment;
  }, [invoices, addAudit]);

  const createComplaint = useCallback((c: Omit<Complaint, 'id' | 'ticketNo' | 'status' | 'timeline' | 'createdAt'>) => {
    const { date, time } = nowStamp();
    // Same length-based-sequence hazard as createAdmission: a student's local
    // `complaints` array only ever contains their own complaints in live mode
    // (RLS), so derive the ticket number from a timestamp instead there.
    const ticketNo = isLiveMode
      ? `HM-${Date.now().toString().slice(-6)}`
      : `HM-${1050 + complaints.length}`;
    const newComplaint: Complaint = {
      ...c,
      id: `CMP-${Date.now()}`,
      ticketNo,
      status: 'Open',
      createdAt: `${date} ${time}`,
      timeline: [{ stage: 'Complaint Created', date: `${date} ${time}`, by: c.studentName }],
    };
    setComplaints((prev) => [newComplaint, ...prev]);
    sync('createComplaint', ComplaintsAPI.create(newComplaint));
    addAudit(c.studentName, 'student', `Raised complaint ${ticketNo} (${c.category})`, 'Complaints');
    return newComplaint;
  }, [complaints.length, addAudit]);

  const assignComplaint = useCallback((id: string, assignee: string, by: string) => {
    const { date, time } = nowStamp();
    setComplaints((prev) => {
      const next = prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'Assigned' as const,
              assignedTo: assignee,
              timeline: [...c.timeline, { stage: `Assigned to ${assignee}`, date: `${date} ${time}`, by }],
            }
          : c
      );
      const merged = next.find((c) => c.id === id);
      if (merged) sync('assignComplaint', ComplaintsAPI.update(merged));
      return next;
    });
    addAudit(by, 'admin', `Assigned complaint to ${assignee}`, 'Complaints');
  }, [addAudit]);

  const updateComplaintStatus = useCallback((id: string, status: ComplaintStatus, note: string, by: string) => {
    const { date, time } = nowStamp();
    const stageLabel: Record<ComplaintStatus, string> = {
      Open: 'Complaint Created',
      Assigned: 'Assigned to Maintenance',
      'In Progress': 'Technician Started',
      Resolved: 'Repair Completed',
      Closed: 'Closed',
    };
    setComplaints((prev) => {
      const next = prev.map((c) =>
        c.id === id
          ? { ...c, status, timeline: [...c.timeline, { stage: stageLabel[status], date: `${date} ${time}`, note, by }] }
          : c
      );
      const merged = next.find((c) => c.id === id);
      if (merged) sync('updateComplaintStatus', ComplaintsAPI.update(merged));
      return next;
    });
    addAudit(by, 'maintenance', `Updated complaint status to ${status}`, 'Complaints');
  }, [addAudit]);

  const createLeave = useCallback((l: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => {
    const { date } = nowStamp();
    const newLeave: LeaveRequest = { ...l, id: `LV-${Date.now()}`, status: 'Requested', appliedOn: date };
    setLeaves((prev) => [newLeave, ...prev]);
    sync('createLeave', LeavesAPI.create(newLeave));
    addAudit(l.studentName, 'student', `Applied for ${l.type} leave`, 'Leave Management');
    addNotification({ title: 'New Leave Request', message: `${l.studentName} has requested leave for ${l.startDate} – ${l.endDate}.`, category: 'Leave', forRole: 'warden' });
    return newLeave;
  }, [addAudit, addNotification]);

  const reviewLeave = useCallback((id: string, approve: boolean, by: string, remark: string) => {
    const { date, time } = nowStamp();
    setLeaves((prev) => {
      const next = prev.map((l) => {
        if (l.id !== id) return l;
        if (!approve) {
          return { ...l, status: 'Rejected' as const, reviewedBy: by, reviewRemark: remark };
        }
        const passId = `HM-PASS-${Math.floor(10000 + Math.random() * 89999)}`;
        const qrPass: QRPass = {
          id: `QR-${Date.now()}`,
          passId,
          studentId: l.studentId,
          studentName: l.studentName,
          hostel: 'Hostel Monarch',
          room: l.room,
          leavePeriod: `${l.startDate} – ${l.endDate}`,
          issuedAt: `${date} ${time}`,
          expiresAt: `${l.endDate} 11:59 PM`,
          status: 'Valid',
          payload: `HM|PASS|${passId}|${l.studentId}|${l.endDate}`,
        };
        return { ...l, status: 'Approved' as const, reviewedBy: by, reviewRemark: remark, qrPass };
      });
      const merged = next.find((l) => l.id === id);
      if (merged) sync('reviewLeave', LeavesAPI.update(merged));
      return next;
    });
    addAudit(by, 'warden', `${approve ? 'Approved' : 'Rejected'} leave request ${id}`, 'Leave Management');
    addNotification({
      title: approve ? 'Leave Approved' : 'Leave Rejected',
      message: approve ? 'Your leave request has been approved. QR pass generated.' : `Your leave request was rejected. ${remark}`,
      category: 'Leave',
      forRole: 'student',
    });
  }, [addAudit, addNotification]);

  const verifyQRPass = useCallback((passId: string, direction: 'Entry' | 'Exit', by: string) => {
    const leave = leaves.find((l) => l.qrPass?.passId === passId);
    const { date, time } = nowStamp();
    if (!leave || !leave.qrPass) {
      addAudit(by, 'security', `Attempted verification of unknown pass ${passId}`, 'Leave & Gate', 'Failed');
      return { result: 'Invalid' as const };
    }
    const expired = new Date(leave.endDate) < new Date('2026-10-04');
    const result: 'Valid' | 'Expired' = expired ? 'Expired' : 'Valid';
    const entry: GateLog = { id: `GL-${Date.now()}`, studentId: leave.studentId, studentName: leave.studentName, passId, direction, timestamp: `${date} ${time}`, verifiedBy: by, result };
    setGateLogs((prev) => [entry, ...prev]);
    sync('verifyQRPass', GateLogsAPI.create(entry));
    addAudit(by, 'security', `Verified QR Pass ${passId} (${result})`, 'Leave & Gate');
    return { result, pass: leave.qrPass };
  }, [leaves, addAudit]);

  const registerVisitor = useCallback((v: Omit<Visitor, 'id' | 'status'>) => {
    const newVisitor: Visitor = { ...v, id: `VIS-${Date.now()}`, status: 'Pending' };
    setVisitors((prev) => [newVisitor, ...prev]);
    sync('registerVisitor', VisitorsAPI.create(newVisitor));
    addAudit(v.studentName, 'student', `Pre-registered visitor ${v.visitorName}`, 'Visitor Management');
    addNotification({ title: 'Visitor Pre-registered', message: `A new visitor has pre-registered — ${v.visitorName}.`, category: 'Visitor', forRole: 'security' });
    return newVisitor;
  }, [addAudit, addNotification]);

  const updateVisitorStatus = useCallback((id: string, status: VisitorStatus, by: string) => {
    const { time } = nowStamp();
    setVisitors((prev) => {
      const next = prev.map((v) => {
        if (v.id !== id) return v;
        const patch: Partial<Visitor> = { status };
        if (status === 'Checked In') patch.checkInTime = time;
        if (status === 'Checked Out') patch.checkOutTime = time;
        return { ...v, ...patch };
      });
      const merged = next.find((v) => v.id === id);
      if (merged) sync('updateVisitorStatus', VisitorsAPI.update(merged));
      return next;
    });
    addAudit(by, 'security', `Updated visitor status to ${status}`, 'Visitor Management');
  }, [addAudit]);

  const updateParcelStatus = useCallback((id: string, status: ParcelStatus, by: string) => {
    const { date } = nowStamp();
    setParcels((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, status, pickupDate: status === 'Collected' ? date : p.pickupDate } : p));
      const merged = next.find((p) => p.id === id);
      if (merged) sync('updateParcelStatus', ParcelsAPI.upsert(merged));
      return next;
    });
    const parcel = parcels.find((p) => p.id === id);
    if (status === 'Received' && parcel) {
      addNotification({ title: 'Parcel Arrived', message: 'Your parcel has arrived at Hostel Monarch Security Desk.', category: 'Parcel', forRole: 'student' });
    }
    addAudit(by, 'security', `Updated parcel ${id} status to ${status}`, 'Parcel Management');
  }, [parcels, addAudit, addNotification]);

  const toggleMealParticipation = useCallback((studentId: string, meal: 'breakfast' | 'lunch' | 'snacks' | 'dinner', value: boolean) => {
    setParticipation((prev) => {
      const next = prev.map((p) => (p.studentId === studentId ? { ...p, [meal]: value } : p));
      const merged = next.find((p) => p.studentId === studentId);
      if (merged) sync('toggleMealParticipation', ParticipationAPI.upsert(merged));
      return next;
    });
  }, []);

  const submitDietRequest = useCallback((d: Omit<DietRequest, 'id' | 'status' | 'requestedOn'>) => {
    const { date } = nowStamp();
    const entry: DietRequest = { ...d, id: `DR-${Date.now()}`, status: 'Pending', requestedOn: date };
    setDietRequests((prev) => [entry, ...prev]);
    sync('submitDietRequest', DietRequestsAPI.create(entry));
    addAudit(d.studentName, 'student', `Submitted diet request (${d.diet})`, 'Mess Services');
  }, [addAudit]);

  const reviewDietRequest = useCallback((id: string, approve: boolean, by: string) => {
    setDietRequests((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, status: approve ? 'Approved' as const : 'Rejected' as const } : d));
      const merged = next.find((d) => d.id === id);
      if (merged) sync('reviewDietRequest', DietRequestsAPI.update(merged));
      return next;
    });
    addAudit(by, 'mess', `${approve ? 'Approved' : 'Rejected'} diet request ${id}`, 'Mess Services');
  }, [addAudit]);

  const submitFeedback = useCallback((f: Omit<MessFeedback, 'id' | 'date'>) => {
    const { date } = nowStamp();
    const entry: MessFeedback = { ...f, id: `FB-${Date.now()}`, date };
    setFeedback((prev) => [entry, ...prev]);
    sync('submitFeedback', FeedbackAPI.create(entry));
    addAudit(f.studentName, 'student', `Submitted mess feedback for ${f.meal}`, 'Mess Services');
  }, [addAudit]);

  const updateMenuDay = useCallback((date: string, meal: keyof MessMenuDay['meals'], items: string[]) => {
    setMenu((prev) => {
      const next = prev.map((m) => (m.date === date ? { ...m, meals: { ...m.meals, [meal]: { ...m.meals[meal], items } } } : m));
      const merged = next.find((m) => m.date === date);
      if (merged) sync('updateMenuDay', MenuAPI.upsert(merged));
      return next;
    });
    addAudit('Kavita Nair', 'mess', `Updated ${meal} menu for ${date}`, 'Mess Services');
  }, [addAudit]);

  const createNotice = useCallback((n: Omit<Notice, 'id' | 'publishDate'>) => {
    const { date } = nowStamp();
    const entry: Notice = { ...n, id: `NTC-${Date.now()}`, publishDate: date };
    setNotices((prev) => [entry, ...prev]);
    sync('createNotice', NoticesAPI.create(entry));
    addAudit(n.author, 'admin', `Published notice: ${n.title}`, 'Notices');
  }, [addAudit]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      students,
      rooms,
      admissions,
      invoices,
      payments,
      complaints,
      leaves,
      gateLogs,
      visitors,
      parcels,
      menu,
      participation,
      dietRequests,
      feedback,
      notices,
      auditLogs,
      notifications,
      dataLoading,
      addAudit,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      updateStudent,
      addStudentLocal,
      reviewAdmission,
      verifyDocument,
      createAdmission,
      allocateBed,
      vacateBed,
      transferStudent,
      payInvoice,
      createComplaint,
      assignComplaint,
      updateComplaintStatus,
      createLeave,
      reviewLeave,
      verifyQRPass,
      registerVisitor,
      updateVisitorStatus,
      updateParcelStatus,
      toggleMealParticipation,
      submitDietRequest,
      reviewDietRequest,
      submitFeedback,
      updateMenuDay,
      createNotice,
    }),
    [
      students, rooms, admissions, invoices, payments, complaints, leaves, gateLogs, visitors, parcels,
      menu, participation, dietRequests, feedback, notices, auditLogs, notifications, dataLoading,
      addAudit, addNotification, markNotificationRead, markAllNotificationsRead, updateStudent, addStudentLocal,
      reviewAdmission, verifyDocument, createAdmission, allocateBed, vacateBed, transferStudent, payInvoice,
      createComplaint, assignComplaint, updateComplaintStatus, createLeave, reviewLeave, verifyQRPass,
      registerVisitor, updateVisitorStatus, updateParcelStatus, toggleMealParticipation, submitDietRequest,
      reviewDietRequest, submitFeedback, updateMenuDay, createNotice,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
