import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { filterProjectsForAdmin } from '../services/authService';
import AdminKPIs from '../components/admin/AdminKPIs';
import AdminQuickActions from '../components/admin/AdminQuickActions';
import AdminProjectTable from '../components/admin/AdminProjectTable';
import { DataResponsibilityNotice } from '../components/admin/AdminActivityFeed';

export default function AdminDashboard() {
  const { projects, wards, adminActivity } = useData();
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dismissedSuccess, setDismissedSuccess] = useState(false);
  const successMessage = dismissedSuccess ? null : location.state?.registrationSuccess;

  const dismissSuccess = () => {
    setDismissedSuccess(true);
    navigate(location.pathname, { replace: true, state: {} });
  };

  const wardNo = profile?.wardNo;
  const wardProjects = useMemo(
    () => filterProjectsForAdmin(projects, profile),
    [projects, profile],
  );

  const wardActivity = useMemo(() => {
    const wardProjectIds = new Set(wardProjects.map((p) => p.id));
    return adminActivity.filter((a) => !a.projectId || wardProjectIds.has(a.projectId));
  }, [adminActivity, wardProjects]);

  return (
    <div className="space-y-8">
      {successMessage && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          <p className="flex-1 leading-relaxed">{successMessage}</p>
          <button
            type="button"
            onClick={dismissSuccess}
            className="text-emerald-600 hover:text-emerald-800 shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-brand-950">
          Ward {wardNo} Admin Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Publish and manage official records for Itahari Ward {wardNo}.
        </p>
      </div>

      <AdminQuickActions />

      <section>
        <h2 className="text-sm font-bold text-slate-700 mb-3">Your ward at a glance</h2>
        <AdminKPIs projects={wardProjects} wards={wards} demoWardNo={wardNo} />
      </section>

      <section>
        <AdminProjectTable projects={wardProjects} wards={wards} />
      </section>

      {wardActivity.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 card-shadow">
          <h2 className="text-sm font-bold text-slate-700 mb-3">Recent ward activity</h2>
          <ul className="space-y-2">
            {wardActivity.slice(0, 6).map((item) => (
              <li key={item.id} className="text-sm text-slate-600 flex justify-between gap-3">
                <span>{item.title} — {item.detail}</span>
                <span className="text-xs text-slate-400 shrink-0">{item.date}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <DataResponsibilityNotice />
    </div>
  );
}
