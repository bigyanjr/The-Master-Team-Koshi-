import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import {
  canAccessAdmin,
  getAdminAccessBlockReason,
  normalizeProfileRole,
  ROLES,
} from '../../utils/permissions';
import { AdminAccessBlocked, PublicAdminDenied } from './AdminAccessMessages';

export default function RoleProtectedRoute() {
  const { isAuthenticated, loading, profile } = useAuth();
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

  if (normalizeProfileRole(profile) === ROLES.PUBLIC) {
    return <PublicAdminDenied />;
  }

  if (!canAccessAdmin(profile)) {
    const message = getAdminAccessBlockReason(profile)
      || 'Ward admin approval is required before you can manage official records.';
    return <AdminAccessBlocked message={message} />;
  }

  return <Outlet />;
}
