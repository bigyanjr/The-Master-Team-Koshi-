import { useData } from '../context/DataContext';
import AdminKPIs from '../components/admin/AdminKPIs';
import AdminQuickActions from '../components/admin/AdminQuickActions';
import AdminProjectTable from '../components/admin/AdminProjectTable';
import { DataResponsibilityNotice } from '../components/admin/AdminActivityFeed';

export default function AdminDashboard() {
  const { projects, wards, demoAdminWard } = useData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-brand-950">Ward Admin</h1>
        <p className="text-sm text-slate-500 mt-1">Publish project updates for Itahari citizens.</p>
      </div>

      <AdminQuickActions />

      <section>
        <h2 className="text-sm font-bold text-slate-700 mb-3">Your ward at a glance</h2>
        <AdminKPIs projects={projects} wards={wards} demoWardNo={demoAdminWard} />
      </section>

      <section>
        <AdminProjectTable projects={projects} wards={wards} />
      </section>

      <DataResponsibilityNotice />
    </div>
  );
}
