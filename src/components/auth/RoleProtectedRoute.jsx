import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../services/authService';

function UnauthorizedAdmin() {
  return (
    <div className="min-h-[50vh] dashboard-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center card-shadow">
        <div className="inline-flex p-3 rounded-full bg-red-50 text-red-600 mb-4">
          <Shield className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-bold text-slate-900">Access denied</h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          You are not authorised to access ward admin records.
        </p>
        <Link to="/dashboard" className="inline-block mt-6">
          <Button variant="primary" icon={ArrowLeft}>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

export default function RoleProtectedRoute({ role = ROLES.WARD_ADMIN }) {
  const { isAuthenticated, loading, profile, canAccessAdminPortal } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center dashboard-bg">
        <LoadingSpinner label="Checking permissions…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, requiresAdmin: true }}
      />
    );
  }

  if (profile?.role === ROLES.PUBLIC) {
    return <UnauthorizedAdmin />;
  }

  const hasAccess = role === ROLES.WARD_ADMIN
    ? canAccessAdminPortal
    : profile?.role === role;

  if (!hasAccess) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          requiresAdmin: true,
          message: profile?.role === ROLES.WARD_ADMIN && !profile?.wardNo
            ? 'Your ward admin profile is incomplete. Please select or contact support.'
            : 'Ward Admin login required.',
        }}
      />
    );
  }

  return <Outlet />;
}
