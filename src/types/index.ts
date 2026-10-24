// ============================================================================
// HOSTEL MONARCH — Core Domain Types
// ============================================================================

export type Role =
  | 'student'
  | 'admin'
  | 'warden'
  | 'security'
  | 'maintenance'
  | 'mess'
  | 'accounts';

export interface RoleMeta {
  id: Role;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: Role;
  avatar: string;
  phone: string;
  designation?: string;
  studentId?: string; // link to Student record if role === 'student'
  /** Only present in live mode (real Supabase accounts). Demo accounts are always 'approved'. */
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
}

export interface Session {
  user: User;
  token: string;
  issuedAt: number;
  expiresAt: number;
}

// ---------------------------------------------------------------------------
// Student / Guardian / Academic
// ---------------------------------------------------------------------------

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Gender = 'Male' | 'Female' | 'Other';
export type HostelStatus = 'Active' | 'Inactive' | 'Suspended' | 'Alumni';

export interface Guardian {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Student {
  id: string;
  enrollmentNo: string;
  name: string;
  avatar: string;
  dob: string;
  gender: Gender;
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  college: string;
  course: string;
  semester: string;
  address: { line: string; city: string; state: string; pincode: string };
  guardian: Guardian;
  emergency: EmergencyContact;
  allocation: {
    building: string;
    floor: string;
    room: string;
    bed: string;
    joiningDate: string;
    /** Start date of the current hostel booking/renewal cycle. */
    bookingFrom?: string;
    /** Date the current booking is valid until (renewal due date). */
    validTill?: string;
  } | null;
  status: HostelStatus;
  profileCompletion: number;
  feeDue: number;
  admissionStatus: AdmissionStage;
}

// ---------------------------------------------------------------------------
// Admission & Documents
// ---------------------------------------------------------------------------

export type AdmissionStage =
  | 'Application Started'
  | 'Documents Uploaded'
  | 'Under Review'
  | 'Verification'
  | 'Approved'
  | 'Rejected';

export type DocumentType =
  | 'Aadhaar'
  | 'Student ID'
  | 'College ID'
  | 'Address Proof'
  | 'Passport Photo'
  | 'Guardian ID'
  | 'Medical Document';

export type DocumentStatus = 'Pending' | 'Uploaded' | 'Verified' | 'Rejected';

export interface AdmissionDocument {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  fileName: string;
  uploadedAt: string | null;
  remark?: string;
}

export interface Admission {
  id: string;
  applicationNo: string;
  studentName: string;
  studentId: string;
  avatar: string;
  course: string;
  college: string;
  phone: string;
  email: string;
  appliedOn: string;
  stage: AdmissionStage;
  documents: AdmissionDocument[];
  history: { stage: AdmissionStage; date: string; by: string; remark?: string }[];
  preferredBuilding?: string;
  /** Optional hostel-visit scheduling captured from the public "Apply for Admission" form. */
  visitDate?: string;
  visitSlot?: string;
  visitNote?: string;
}

// ---------------------------------------------------------------------------
// Buildings / Rooms / Beds
// ---------------------------------------------------------------------------

export type BedStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
export type RoomType = 'Single Sharing' | 'Double Sharing' | 'Triple Sharing' | 'Dormitory';

export interface Bed {
  id: string;
  label: string; // Bed 1, Bed 2...
  status: BedStatus;
  studentId?: string;
  studentName?: string;
}

export interface Room {
  id: string;
  roomNo: string;
  floor: string;
  building: string;
  type: RoomType;
  capacity: number;
  beds: Bed[];
  amenities: string[];
  monthlyRent: number;
}

export interface Floor {
  id: string;
  name: string;
  building: string;
  rooms: Room[];
}

export interface Building {
  id: string;
  name: string;
  code: string;
  floors: Floor[];
  description: string;
  totalRooms: number;
  totalBeds: number;
}

export interface AllocationHistoryEntry {
  id: string;
  studentId: string;
  studentName: string;
  room: string;
  bed: string;
  action: 'Allocated' | 'Transferred' | 'Vacated';
  date: string;
  by: string;
}

// ---------------------------------------------------------------------------
// Fees & Payments
// ---------------------------------------------------------------------------

export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid';
export type PaymentMethod = 'UPI' | 'Card' | 'Net Banking' | 'Razorpay Link' | 'Cash' | 'Wallet';

export interface Invoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  room: string;
  title: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  issuedDate: string;
  status: PaymentStatus;
  period: string;
  /** Academic semester this fee applies to, e.g. "Semester 1". */
  semester: string;
}

export interface Payment {
  id: string;
  transactionId: string;
  invoiceId: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  amount: number;
  method: PaymentMethod;
  status: 'Success' | 'Failed' | 'Processing';
  date: string;
  verifiedBy?: string;
}

// ---------------------------------------------------------------------------
// Complaints
// ---------------------------------------------------------------------------

export type ComplaintCategory =
  | 'Electrical'
  | 'Plumbing'
  | 'Cleaning'
  | 'Room'
  | 'Furniture'
  | 'Wi-Fi'
  | 'Water'
  | 'Other';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type ComplaintStatus = 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';

export interface ComplaintTimelineEntry {
  stage: string;
  date: string;
  note?: string;
  by?: string;
}

export interface Complaint {
  id: string;
  ticketNo: string;
  studentId: string;
  studentName: string;
  room: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  title: string;
  description: string;
  imageAttached: boolean;
  createdAt: string;
  assignedTo?: string;
  timeline: ComplaintTimelineEntry[];
}

// ---------------------------------------------------------------------------
// Leave & QR Pass
// ---------------------------------------------------------------------------

export type LeaveType = 'Home Visit' | 'Medical' | 'Personal' | 'Emergency' | 'Academic';
export type LeaveStatus = 'Requested' | 'Warden Review' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  room: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  destination: string;
  emergencyContact: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
  reviewRemark?: string;
  qrPass?: QRPass;
}

export type QRPassStatus = 'Valid' | 'Expired' | 'Used' | 'Invalid';

export interface QRPass {
  id: string;
  passId: string;
  studentId: string;
  studentName: string;
  hostel: string;
  room: string;
  leavePeriod: string;
  issuedAt: string;
  expiresAt: string;
  status: QRPassStatus;
  payload: string;
}

export interface GateLog {
  id: string;
  studentId: string;
  studentName: string;
  passId: string;
  direction: 'Entry' | 'Exit';
  timestamp: string;
  verifiedBy: string;
  result: 'Valid' | 'Invalid' | 'Expired';
}

// ---------------------------------------------------------------------------
// Visitors & Parcels
// ---------------------------------------------------------------------------

export type VisitorStatus = 'Pending' | 'Approved' | 'Checked In' | 'Checked Out' | 'Cancelled';

export interface Visitor {
  id: string;
  visitorName: string;
  phone: string;
  relationship: string;
  studentId: string;
  studentName: string;
  room: string;
  visitDate: string;
  expectedTime: string;
  purpose: string;
  status: VisitorStatus;
  checkInTime?: string;
  checkOutTime?: string;
}

export type ParcelStatus = 'Expected' | 'Received' | 'Notified' | 'Collected';

export interface Parcel {
  id: string;
  studentId: string;
  studentName: string;
  room: string;
  courier: string;
  trackingNo: string;
  arrivalDate: string;
  status: ParcelStatus;
  pickupDate?: string;
}

// ---------------------------------------------------------------------------
// Mess
// ---------------------------------------------------------------------------

export type MealType = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
export type DietType = 'Regular' | 'Jain' | 'Vegetarian' | 'Medical/Special';

export interface MessMenuDay {
  date: string;
  day: string;
  meals: Record<MealType, { items: string[]; time: string }>;
}

export interface MealParticipationEntry {
  studentId: string;
  studentName: string;
  room: string;
  breakfast: boolean;
  lunch: boolean;
  snacks: boolean;
  dinner: boolean;
  diet: DietType;
}

export interface MessFeedback {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  meal: MealType;
  rating: number;
  comment: string;
}

export interface DietRequest {
  id: string;
  studentId: string;
  studentName: string;
  room: string;
  diet: DietType;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedOn: string;
}

// ---------------------------------------------------------------------------
// Notices
// ---------------------------------------------------------------------------

export type NoticeCategory =
  | 'General'
  | 'Emergency'
  | 'Mess'
  | 'Maintenance'
  | 'Events'
  | 'Fees'
  | 'Holiday';

export type NoticePriority = 'Low' | 'Medium' | 'High';

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: NoticeCategory;
  priority: NoticePriority;
  audience: Role[] | 'All';
  publishDate: string;
  expiryDate: string;
  author: string;
  pinned?: boolean;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'Leave' | 'Complaint' | 'Fees' | 'Parcel' | 'Mess' | 'Notice' | 'Visitor' | 'System';
  timestamp: string;
  read: boolean;
  forRole?: Role;
}

// ---------------------------------------------------------------------------
// Audit Trail
// ---------------------------------------------------------------------------

export interface AuditLog {
  id: string;
  user: string;
  role: Role;
  action: string;
  module: string;
  date: string;
  time: string;
  status: 'Success' | 'Failed' | 'Warning';
}
