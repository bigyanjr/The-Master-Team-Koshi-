import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, FolderKanban, X, LayoutDashboard } from 'lucide-react';
import { useData } from '../context/DataContext';
import ProjectListCard from '../components/project/ProjectListCard';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import WardSelect from '../components/form/WardSelect';
import { getWardByNo } from '../utils/formatters';

function matchesSearch(project, query, wards) {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();
  const ward = getWardByNo(wards, project.wardNo);
  return (
    project.title.toLowerCase().includes(q)
    || String(project.wardNo).includes(q)
    || ward?.name.toLowerCase().includes(q)
    || (project.contractorName?.toLowerCase().includes(q) ?? false)
  );
}

export default function Projects() {
  const { publicProjects, wards } = useData();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState(() => searchParams.get('ward') || 'all');
  const [statusFilter, setStatusFilter] = useState('all');

  const hasActiveFilters = wardFilter !== 'all' || statusFilter !== 'all' || search.trim() !== '';

  const filtered = useMemo(() => {
    return publicProjects.filter((p) => {
      if (wardFilter !== 'all' && p.wardNo !== Number(wardFilter)) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (!matchesSearch(p, search, wards)) return false;
      return true;
    });
  }, [publicProjects, wards, wardFilter, statusFilter, search]);

  const clearFilters = () => {
    setSearch('');
    setWardFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="min-h-screen dashboard-bg">
      <div className="page-container py-8 sm:py-10 space-y-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 card-shadow">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight">
            Published Ward Projects
          </h1>
          <p className="text-slate-600 mt-2 max-w-2xl text-base leading-relaxed">
            Browse official Itahari ward projects published by Ward IT/Admin teams.
          </p>
          <Link to="/dashboard" className="inline-block mt-4">
            <Button variant="secondary" size="sm" icon={LayoutDashboard}>Back to Dashboard</Button>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 card-shadow space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search by project name, ward, or contractor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-400"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <WardSelect
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              includeAllOption
              allOptionLabel="All Wards"
              includeEmptyOption={false}
              selectClassName="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            >
              <option value="all">All Status</option>
              <option value="Planned">Planned</option>
              <option value="Tender Open">Tender Open</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>

        {publicProjects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects available yet"
            description="Published ward projects will appear here after Ward IT/Admin teams add them."
            actionLabel="Go to Dashboard"
            actionTo="/dashboard"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects match your filters"
            description="Try a different ward, status, or search term."
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((project) => (
              <ProjectListCard key={project.id} project={project} allProjects={publicProjects} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
