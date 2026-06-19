import { useData } from '../context/DataContext';
import AdminKPIs from '../components/admin/AdminKPIs';
import AdminQuickActions from '../components/admin/AdminQuickActions';
import AdminProjectTable from '../components/admin/AdminProjectTable';
import AdminActivityFeed, { DataResponsibilityNotice } from '../components/admin/AdminActivityFeed';

export default function AdminDashboard() {
  const { projects, wards, adminActivity, demoAdminWard } = useData();

  return (
    <div className="space-y-6 sm:space-y-8">
      <DataResponsibilityNotice />

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Ward Overview</h2>
        <AdminKPIs projects={projects} wards={wards} demoWardNo={demoAdminWard} />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Quick Actions</h2>
        <AdminQuickActions />
      </section>

      <section>
        <AdminProjectTable projects={projects} wards={wards} />
      </section>

      <section>
        <AdminActivityFeed activities={adminActivity} />
      </section>
    </div>
  );
}
