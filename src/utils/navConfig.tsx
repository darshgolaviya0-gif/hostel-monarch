import type React from 'react';
import {
  LayoutDashboard, User, Bell, Settings, Users, FileStack, DoorOpen, Wallet, MessageSquareWarning,
  QrCode, UserCheck, Package, UtensilsCrossed, Megaphone, ShieldAlert, Wrench, ClipboardList,
  Receipt, BarChart3, Siren, History, ListChecks, ChefHat, ThumbsUp, CalendarCheck, ScanLine,
  BadgeIndianRupee, FileCheck2, Building2, UserCog,
} from 'lucide-react';
import type { Role } from '../types';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  end?: boolean;
}

export const COMMON_BOTTOM: NavItem[] = [
  { label: 'Notifications', path: '/app/notifications', icon: Bell },
  { label: 'Settings', path: '/app/settings', icon: Settings },
];

export const ROLE_NAV: Record<Role, NavItem[]> = {
  student: [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, end: true },
    { label: 'My Profile', path: '/app/profile', icon: User },
    { label: 'My Room', path: '/app/my-room', icon: DoorOpen },
    { label: 'Fees & Payments', path: '/app/fees', icon: Wallet },
    { label: 'Complaints', path: '/app/complaints', icon: MessageSquareWarning },
    { label: 'Leave & QR Pass', path: '/app/leave', icon: QrCode },
    { label: 'Visitors', path: '/app/visitors', icon: UserCheck },
    { label: 'Parcels', path: '/app/parcels', icon: Package },
    { label: 'Mess Services', path: '/app/mess', icon: UtensilsCrossed },
    { label: 'Notices', path: '/app/notices', icon: Megaphone },
  ],
  admin: [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Students', path: '/app/students', icon: Users },
    { label: 'Admissions', path: '/app/admissions', icon: FileCheck2 },
    { label: 'Rooms & Beds', path: '/app/rooms', icon: Building2 },
    { label: 'Fees Overview', path: '/app/admin-fees', icon: BadgeIndianRupee },
    { label: 'Complaints', path: '/app/admin-complaints', icon: MessageSquareWarning },
    { label: 'Staff Directory', path: '/app/staff', icon: ClipboardList },
    { label: 'Account Approvals', path: '/app/approvals', icon: UserCog },
    { label: 'Notices', path: '/app/notices', icon: Megaphone },
    { label: 'Reports & Analytics', path: '/app/reports', icon: BarChart3 },
    { label: 'Audit Trail', path: '/app/audit-trail', icon: History },
  ],
  warden: [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Students', path: '/app/warden-students', icon: Users },
    { label: 'Rooms', path: '/app/warden-rooms', icon: Building2 },
    { label: 'Leave Approvals', path: '/app/leave-approvals', icon: CalendarCheck },
    { label: 'Complaints', path: '/app/warden-complaints', icon: MessageSquareWarning },
    { label: 'Visitors', path: '/app/warden-visitors', icon: UserCheck },
    { label: 'Notices', path: '/app/notices', icon: Megaphone },
    { label: 'Emergency', path: '/app/emergency', icon: Siren },
  ],
  security: [
    { label: 'Gate Dashboard', path: '/app/dashboard', icon: LayoutDashboard, end: true },
    { label: 'QR Verification', path: '/app/qr-verification', icon: ScanLine },
    { label: 'Visitors', path: '/app/security-visitors', icon: UserCheck },
    { label: 'Parcels', path: '/app/security-parcels', icon: Package },
    { label: 'Gate Logs', path: '/app/gate-logs', icon: ListChecks },
    { label: 'Emergency', path: '/app/emergency', icon: Siren },
  ],
  maintenance: [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Tickets', path: '/app/tickets', icon: Wrench },
    { label: 'Priority Queue', path: '/app/assignments', icon: ShieldAlert },
    { label: 'Progress Updates', path: '/app/progress', icon: ClipboardList },
    { label: 'Resolution History', path: '/app/history', icon: History },
  ],
  mess: [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, end: true },
    { label: "Today's Menu", path: '/app/mess-today', icon: ChefHat },
    { label: 'Meal Count', path: '/app/meal-count', icon: Users },
    { label: 'Diet Requests', path: '/app/diet-requests', icon: FileStack },
    { label: 'Feedback', path: '/app/mess-feedback', icon: ThumbsUp },
    { label: 'Menu Management', path: '/app/menu-management', icon: UtensilsCrossed },
  ],
  accounts: [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Invoices', path: '/app/invoices', icon: Receipt },
    { label: 'Payments', path: '/app/payments', icon: Wallet },
    { label: 'Pending Fees', path: '/app/pending-fees', icon: BadgeIndianRupee },
    { label: 'Receipts', path: '/app/receipts', icon: FileCheck2 },
    { label: 'Financial Reports', path: '/app/accounts-reports', icon: BarChart3 },
  ],
};
