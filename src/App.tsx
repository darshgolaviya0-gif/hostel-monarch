import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppDataProvider } from './store/AppDataContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { SessionExpiredModal } from './components/layout/SessionExpiredModal';

import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

import Home from './pages/public/Home';
import About from './pages/public/About';
import Facilities from './pages/public/Facilities';
import Rooms from './pages/public/Rooms';
import Services from './pages/public/Services';
import Contact from './pages/public/Contact';
import ApplyAdmission from './pages/public/ApplyAdmission';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';
import RefundPolicy from './pages/public/RefundPolicy';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AccountStatus from './pages/auth/AccountStatus';
import ResetPassword from './pages/auth/ResetPassword';
import Unauthorized from './pages/auth/Unauthorized';

import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/shared/Profile';
import Notifications from './pages/shared/Notifications';
import Settings from './pages/shared/Settings';
import NoticesPage from './pages/shared/NoticesPage';

import MyRoom from './pages/student/MyRoom';
import StudentFees from './pages/student/Fees';
import Complaints from './pages/shared/Complaints';
import Leave from './pages/shared/Leave';
import Visitors from './pages/shared/Visitors';
import Parcels from './pages/shared/Parcels';
import Mess from './pages/student/Mess';

import Students from './pages/shared/Students';
import Admissions from './pages/admin/Admissions';
import RoomsBoard from './pages/shared/RoomsBoard';
import AdminFees from './pages/admin/AdminFees';
import Staff from './pages/admin/Staff';
import Approvals from './pages/admin/Approvals';
import Reports from './pages/admin/Reports';
import AuditTrail from './pages/admin/AuditTrail';

import LeaveApprovals from './pages/warden/LeaveApprovals';
import Emergency from './pages/shared/Emergency';

import QRVerification from './pages/security/QRVerification';
import GateLogs from './pages/security/GateLogs';

import Tickets from './pages/maintenance/Tickets';
import Progress from './pages/maintenance/Progress';
import HistoryPage from './pages/maintenance/History';

import TodayMenu from './pages/mess/TodayMenu';
import MealCount from './pages/mess/MealCount';
import DietRequests from './pages/mess/DietRequests';
import MessFeedback from './pages/mess/MessFeedback';
import MenuManagement from './pages/mess/MenuManagement';

import Invoices from './pages/accounts/Invoices';
import Payments from './pages/accounts/Payments';
import PendingFees from './pages/accounts/PendingFees';
import Receipts from './pages/accounts/Receipts';
import AccountsReports from './pages/accounts/AccountsReports';

function HomeRedirect() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            style: { borderRadius: '12px', fontSize: '14px', fontWeight: 500 },
          }} />
          <SessionExpiredModal />
          <Routes>
            {/* Public site */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/facilities" element={<Facilities />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/apply-admission" element={<ApplyAdmission />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/account-status" element={<AccountStatus />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/start" element={<HomeRedirect />} />

            {/* Authenticated app */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="notices" element={<NoticesPage />} />

              {/* Student */}
              <Route path="my-room" element={<ProtectedRoute allow={['student']}><MyRoom /></ProtectedRoute>} />
              <Route path="fees" element={<ProtectedRoute allow={['student']}><StudentFees /></ProtectedRoute>} />
              <Route path="complaints" element={<ProtectedRoute allow={['student']}><Complaints variant="student" /></ProtectedRoute>} />
              <Route path="leave" element={<ProtectedRoute allow={['student']}><Leave variant="student" /></ProtectedRoute>} />
              <Route path="visitors" element={<ProtectedRoute allow={['student']}><Visitors variant="student" /></ProtectedRoute>} />
              <Route path="parcels" element={<ProtectedRoute allow={['student']}><Parcels variant="student" /></ProtectedRoute>} />
              <Route path="mess" element={<ProtectedRoute allow={['student']}><Mess /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="students" element={<ProtectedRoute allow={['admin']}><Students variant="admin" /></ProtectedRoute>} />
              <Route path="admissions" element={<ProtectedRoute allow={['admin']}><Admissions /></ProtectedRoute>} />
              <Route path="rooms" element={<ProtectedRoute allow={['admin']}><RoomsBoard variant="admin" /></ProtectedRoute>} />
              <Route path="admin-fees" element={<ProtectedRoute allow={['admin']}><AdminFees /></ProtectedRoute>} />
              <Route path="admin-complaints" element={<ProtectedRoute allow={['admin']}><Complaints variant="admin" /></ProtectedRoute>} />
              <Route path="staff" element={<ProtectedRoute allow={['admin']}><Staff /></ProtectedRoute>} />
              <Route path="approvals" element={<ProtectedRoute allow={['admin']}><Approvals /></ProtectedRoute>} />
              <Route path="reports" element={<ProtectedRoute allow={['admin']}><Reports /></ProtectedRoute>} />
              <Route path="audit-trail" element={<ProtectedRoute allow={['admin']}><AuditTrail /></ProtectedRoute>} />

              {/* Warden */}
              <Route path="warden-students" element={<ProtectedRoute allow={['warden']}><Students variant="warden" /></ProtectedRoute>} />
              <Route path="warden-rooms" element={<ProtectedRoute allow={['warden']}><RoomsBoard variant="warden" /></ProtectedRoute>} />
              <Route path="leave-approvals" element={<ProtectedRoute allow={['warden']}><LeaveApprovals /></ProtectedRoute>} />
              <Route path="warden-complaints" element={<ProtectedRoute allow={['warden']}><Complaints variant="warden" /></ProtectedRoute>} />
              <Route path="warden-visitors" element={<ProtectedRoute allow={['warden']}><Visitors variant="warden" /></ProtectedRoute>} />
              <Route path="emergency" element={<ProtectedRoute allow={['warden', 'security']}><Emergency /></ProtectedRoute>} />

              {/* Security */}
              <Route path="qr-verification" element={<ProtectedRoute allow={['security']}><QRVerification /></ProtectedRoute>} />
              <Route path="security-visitors" element={<ProtectedRoute allow={['security']}><Visitors variant="security" /></ProtectedRoute>} />
              <Route path="security-parcels" element={<ProtectedRoute allow={['security']}><Parcels variant="security" /></ProtectedRoute>} />
              <Route path="gate-logs" element={<ProtectedRoute allow={['security']}><GateLogs /></ProtectedRoute>} />

              {/* Maintenance */}
              <Route path="tickets" element={<ProtectedRoute allow={['maintenance']}><Tickets /></ProtectedRoute>} />
              <Route path="assignments" element={<ProtectedRoute allow={['maintenance']}><Tickets priorityOnly /></ProtectedRoute>} />
              <Route path="progress" element={<ProtectedRoute allow={['maintenance']}><Progress /></ProtectedRoute>} />
              <Route path="history" element={<ProtectedRoute allow={['maintenance']}><HistoryPage /></ProtectedRoute>} />

              {/* Mess */}
              <Route path="mess-today" element={<ProtectedRoute allow={['mess']}><TodayMenu /></ProtectedRoute>} />
              <Route path="meal-count" element={<ProtectedRoute allow={['mess']}><MealCount /></ProtectedRoute>} />
              <Route path="diet-requests" element={<ProtectedRoute allow={['mess']}><DietRequests /></ProtectedRoute>} />
              <Route path="mess-feedback" element={<ProtectedRoute allow={['mess']}><MessFeedback /></ProtectedRoute>} />
              <Route path="menu-management" element={<ProtectedRoute allow={['mess']}><MenuManagement /></ProtectedRoute>} />

              {/* Accounts */}
              <Route path="invoices" element={<ProtectedRoute allow={['accounts']}><Invoices /></ProtectedRoute>} />
              <Route path="payments" element={<ProtectedRoute allow={['accounts']}><Payments /></ProtectedRoute>} />
              <Route path="pending-fees" element={<ProtectedRoute allow={['accounts']}><PendingFees /></ProtectedRoute>} />
              <Route path="receipts" element={<ProtectedRoute allow={['accounts']}><Receipts /></ProtectedRoute>} />
              <Route path="accounts-reports" element={<ProtectedRoute allow={['accounts']}><AccountsReports /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppDataProvider>
    </AuthProvider>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <p className="font-display text-7xl font-extrabold text-navy-100">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-navy-950">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="mt-6 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-950">Back to Home</Link>
    </div>
  );
}
