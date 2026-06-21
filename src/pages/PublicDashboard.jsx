import { useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, X, FolderKanban, Bot } from 'lucide-react';
import { useData } from '../context/DataContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardKPIs from '../components/dashboard/DashboardKPIs';
import CitizenActions from '../components/dashboard/CitizenActions';
import WardBudgetSummary from '../components/dashboard/WardBudgetSummary';
import MoneyFlowDiagram from '../components/transparency/MoneyFlowDiagram';
import RecentUpdates from '../components/dashboard/RecentUpdates';
import DashboardFooterNote from '../components/dashboard/DashboardFooterNote';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

export default function PublicDashboard() {
  const { publicProjects, municipality, dataLoading, getWardBudgetSummary } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [wardFilter, setWardFilter] = useState('all');
  const [dismissedSuccess, setDismissedSuccess] = useState(false);
  const successMessage = dismissedSuccess ? null : location.state?.registrationSuccess;

  const dismissSuccess = () => {
    setDismissedSuccess(true);
    navigate(location.pathname, { replace: true, state: {} });
  };

  const filteredProjects = useMemo(() => {
    if (wardFilter === 'all') return publicProjects;
    return publicProjects.filter((p) => p.wardNo === Number(wardFilter));
  }, [publicProjects, wardFilter]);

  const hasData = filteredProjects.length > 0;
  const selectedWardNo = wardFilter !== 'all' ? Number(wardFilter) : null;
  const wardBudgetSummary = useMemo(
    () => (selectedWardNo ? getWardBudgetSummary(selectedWardNo) : null),
    [selectedWardNo, getWardBudgetSummary],
  );

  if (dataLoading) {
    return (
      <div className="min-h-[60vh] dashboard-bg flex items-center justify-center">
        <LoadingSpinner label="Loading public records…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen dashboard-bg pb-10">
      <div className="page-container py-8 sm:py-10 space-y-8">
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

        <DashboardHeader wardFilter={wardFilter} onWardChange={setWardFilter} />

        {selectedWardNo && wardBudgetSummary && (
          <WardBudgetSummary wardNo={selectedWardNo} summary={wardBudgetSummary} />
        )}

        <CitizenActions />

        <section>
          <h2 className="sr-only">Summary</h2>
          <DashboardKPIs projects={filteredProjects} />
        </section>

        <MoneyFlowDiagram />

        {!hasData ? (
          <section className="rounded-2xl border border-dashed border-slate-200 bg-white card-shadow dark:bg-slate-900 dark:border-slate-700">
            <EmptyState
              icon={FolderKanban}
              title="No ward projects published yet"
              description="When your ward office adds project budgets, payments, and proof photos, they will appear here."
            >
              <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                <Link to="/ask">
                  <Button variant="primary" size="md" icon={Bot}>Ask Ward Mitra</Button>
                </Link>
                <Link to="/projects">
                  <Button variant="secondary" size="md">Browse projects</Button>
                </Link>
              </div>
            </EmptyState>
          </section>
        ) : (
          <RecentUpdates projects={filteredProjects} limit={5} />
        )}

        <DashboardFooterNote municipality={municipality} />
      </div>
    </div>
  );
}
