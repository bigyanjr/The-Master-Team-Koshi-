import { useMemo, useState } from 'react';

import { useLocation, useNavigate, Link } from 'react-router-dom';

import { CheckCircle, X, FolderKanban, Bot, Shield } from 'lucide-react';

import { useData } from '../context/DataContext';

import LoadingSpinner from '../components/ui/LoadingSpinner';

import DashboardHeader from '../components/dashboard/DashboardHeader';

import DashboardKPIs from '../components/dashboard/DashboardKPIs';

import RecentUpdates from '../components/dashboard/RecentUpdates';

import { BudgetByWardChart, ProjectsByStatusChart } from '../components/dashboard/DashboardCharts';

import EmptyState from '../components/ui/EmptyState';

import Button from '../components/ui/Button';



export default function PublicDashboard() {

  const { wards, publicProjects, dataLoading } = useData();

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



  if (dataLoading) {

    return (

      <div className="min-h-[60vh] dashboard-bg flex items-center justify-center">

        <LoadingSpinner label="Loading public data…" />

      </div>

    );

  }



  return (

    <div className="min-h-screen dashboard-bg pb-10">

      <div className="page-container py-8 sm:py-10 space-y-8">

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



        <DashboardHeader wardFilter={wardFilter} onWardChange={setWardFilter} />



        <section>

          <h2 className="sr-only">Summary</h2>

          <DashboardKPIs projects={filteredProjects} />

        </section>



        {!hasData ? (

          <section className="rounded-2xl border border-dashed border-slate-200 bg-white card-shadow">

            <EmptyState

              icon={FolderKanban}

              title="No public ward projects published yet"

              description="Once Itahari ward admins publish project budgets, tenders, payments, proof photos, and progress updates, citizens will see them here."

            >

              <div className="flex flex-wrap items-center justify-center gap-3 mt-5">

                <Link to="/ask">

                  <Button variant="primary" size="sm" icon={Bot}>Ask Ward Mitra</Button>

                </Link>

                <Link to="/login" state={{ requiresAdmin: true }}>

                  <Button variant="secondary" size="sm" icon={Shield}>Login as Ward IT/Admin</Button>

                </Link>

              </div>

            </EmptyState>

          </section>

        ) : (

          <>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <BudgetByWardChart wards={wards} projects={filteredProjects} />

              <ProjectsByStatusChart projects={filteredProjects} />

            </section>

            <RecentUpdates projects={filteredProjects} limit={5} />

          </>

        )}

      </div>

    </div>

  );

}


