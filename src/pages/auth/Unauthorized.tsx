import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

export default function Unauthorized() {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-500">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-extrabold text-navy-950">Access Restricted</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        {user
          ? `Your current role (${user.role}) does not have permission to view this page. If you believe this is an error, please contact your administrator.`
          : 'You need to sign in to access this page.'}
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/app/dashboard"><Button variant="primary">Back to Dashboard</Button></Link>
        <Link to="/"><Button variant="outline">Go to Homepage</Button></Link>
      </div>
    </div>
  );
}
