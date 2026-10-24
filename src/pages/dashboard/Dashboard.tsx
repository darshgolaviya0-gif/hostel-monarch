import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';
import WardenDashboard from './WardenDashboard';
import SecurityDashboard from './SecurityDashboard';
import MaintenanceDashboard from './MaintenanceDashboard';
import MessDashboard from './MessDashboard';
import AccountsDashboard from './AccountsDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'warden':
      return <WardenDashboard />;
    case 'security':
      return <SecurityDashboard />;
    case 'maintenance':
      return <MaintenanceDashboard />;
    case 'mess':
      return <MessDashboard />;
    case 'accounts':
      return <AccountsDashboard />;
    default:
      return null;
  }
}
