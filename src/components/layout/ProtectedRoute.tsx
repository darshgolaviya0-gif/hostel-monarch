import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Role } from '../../types';

export function ProtectedRoute({ children, allow }: { children: React.ReactNode; allow?: Role[] }) {
  const { isAuthenticated, user, accountStatus } = useAuth();
  const location = useLocation();

  if (accountStatus && accountStatus !== 'approved') {
    return <Navigate to="/account-status" replace />;
  }
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (allow && !allow.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}
