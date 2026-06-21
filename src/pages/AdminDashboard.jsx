import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, X, FolderKanban, Wallet } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { filterProjectsForAdmin } from '../utils/permissions';
import { MUNICIPALITY_NAME } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import AdminKPIs from '../components/admin/AdminKPIs';
import AdminQuickActions from '../components/admin/AdminQuickActions';
import AdminProjectTable from '../components/admin/AdminProjectTable';
import WardBudgetModal from '../components/admin/WardBudgetModal';
import WardBudgetSummary from '../components/dashboard/WardBudgetSummary';
import { DataResponsibilityNotice } from '../components/admin/AdminActivityFeed';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

export default function AdminDashboard() {
  const { projects, wards, adminActivity, getWardBudgetSummary, saveWardBudget } = useData();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [dismissedSuccess, setDismissedSuccess] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
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

  const budgetSummary = useMemo(
    () => getWardBudgetSummary(wardNo),
    [getWardBudgetSummary, wardNo],
  );

  const wardActivity = useMemo(() => {
    const wardProjectIds = new Set(wardProjects.map((p) => p.id));
    return adminActivity.filter((a) => !a.projectId || wardProjectIds.has(a.projectId));
  }, [adminActivity, wardProjects]);

  const handleSaveBudget = async (payload) => {
    await saveWardBudget(payload, { uid: profile?.uid });
  };

  return (
    <div className="space-y-8">
      {successMessage && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-200">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5 dark:text-emerald-400" />
          <p className="flex-1 leading-relaxed">{successMessage}</p>
          <button
            type="button"
            onClick={dismissSuccess}
            className="text-emerald-600 hover:text-emerald-800 shrink-0 dark:text-emerald-400 dark:hover:text-emerald-300"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-950 dark:text-slate-50">
            Ward {wardNo} — Office Portal
          </h1>
          <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
            Publish projects, payments, and proof photos for citizens to see.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          icon={Wallet}
          className="shrink-0"
          onClick={() => setBudgetModalOpen(true)}
        >
          {budgetSummary.isPublished ? t('wardBudget.manage') : t('wardBudget.set')}
        </Button>
      </div>

      <AdminQuickActions />

      <section>
        <h2 className="text-sm font-bold text-slate-700 mb-3 dark:text-slate-300">Your ward at a glance</h2>
        <div className="space-y-4">
          <WardBudgetSummary wardNo={wardNo} summary={budgetSummary} />
          <AdminKPIs projects={wardProjects} demoWardNo={wardNo} />
        </div>
      </section>

      {wardProjects.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-200 bg-white card-shadow dark:bg-slate-900 dark:border-slate-700">
          <EmptyState
            icon={FolderKanban}
            title={`No projects added for Ward ${wardNo} yet`}
            description="Start by adding your first ward project to make budget, tender, payment, and proof details visible to citizens."
            actionLabel="Add First Project"
            actionTo="/admin/add-project"
            actionVariant="primary"
          />
        </section>
      ) : (
        <section>
          <AdminProjectTable projects={wardProjects} wards={wards} />
        </section>
      )}
      {wardActivity.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 card-shadow dark:bg-slate-900 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-700 mb-3 dark:text-slate-300">Recent ward activity</h2>
          <ul className="space-y-2">
            {wardActivity.slice(0, 6).map((item) => (
              <li key={item.id} className="text-sm text-slate-600 flex justify-between gap-3 dark:text-slate-300">
                <span>{item.title} — {item.detail}</span>
                <span className="text-xs text-slate-400 shrink-0 dark:text-slate-500">{item.date}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="rounded-xl border border-dashed border-slate-200 bg-white p-5 card-shadow dark:bg-slate-900 dark:border-slate-700">
          <EmptyState
            compact
            title="No ward activity yet"
            description="Activity will appear here when you publish projects, payments, proofs, or progress updates."
          />
        </section>
      )}

      <DataResponsibilityNotice />

      <WardBudgetModal
        open={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        wardNo={wardNo}
        municipalityName={MUNICIPALITY_NAME}
        existingBudget={budgetSummary.budgetRecord}
        onSave={handleSaveBudget}
      />
    </div>
  );
}
