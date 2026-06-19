import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../services/authService';

export default function RoleProtectedRoute({ role = ROLES.WARD_ADMIN }) {
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

  if (profile?.role !== role) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          requiresAdmin: true,
          denied: true,
          message: 'Ward Admin login required. Public accounts cannot access this area.',
        }}
      />
    );
  }

  return <Outlet />;
}
