import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Clock } from 'lucide-react';
import Button from '../ui/Button';

export function PublicAdminDenied() {
  return (
    <div className="min-h-[50vh] dashboard-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center card-shadow">
        <div className="inline-flex p-3 rounded-full bg-red-50 text-red-600 mb-4">
          <Shield className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-bold text-slate-900">Access denied</h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          You are not authorised to access ward admin records. Public citizen accounts cannot open the admin portal.
        </p>
        <Link to="/dashboard" className="inline-block mt-6">
          <Button variant="primary" icon={ArrowLeft}>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

export function AdminAccessBlocked({ message, title = 'Admin access unavailable' }) {
  return (
    <div className="min-h-[50vh] dashboard-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-amber-200 bg-white p-8 text-center card-shadow">
        <div className="inline-flex p-3 rounded-full bg-amber-50 text-amber-700 mb-4">
          <Clock className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{message}</p>
        <Link to="/dashboard" className="inline-block mt-6">
          <Button variant="primary" icon={ArrowLeft}>Go to public dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
