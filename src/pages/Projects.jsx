import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, Filter, FolderKanban, ArrowUpDown, X, LayoutDashboard,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import ProjectListCard from '../components/project/ProjectListCard';
import EmptyState from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { getWardByNo } from '../utils/formatters';
import {
  getRiskLevel,
  calculateTrustScore,
  getLastUpdatedDate,
  getDelayScore,
} from '../utils/riskEngine';

const SORT_OPTIONS = [
  { value: 'default', label: 'Default order' },
  { value: 'budget-desc', label: 'Highest budget' },
  { value: 'trust-asc', label: 'Lowest trust score' },
  { value: 'delayed-desc', label: 'Most delayed' },
  { value: 'updated-desc', label: 'Recently updated' },
];

function matchesSearch(project, query, wards) {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();
  const ward = getWardByNo(wards, project.wardNo);

  return (
    project.title.toLowerCase().includes(q)
    || project.category.toLowerCase().includes(q)
    || String(project.wardNo).includes(q)
    || ward?.name.toLowerCase().includes(q)
    || (project.contractorName?.toLowerCase().includes(q) ?? false)
  );
}

function sortProjects(list, sortBy, allProjects) {
  const sorted = [...list];

  switch (sortBy) {
    case 'budget-desc':
      return sorted.sort((a, b) => (b.allocatedBudget ?? 0) - (a.allocatedBudget ?? 0));
    case 'trust-asc':
      return sorted.sort((a, b) => calculateTrustScore(a, allProjects) - calculateTrustScore(b, allProjects));
    case 'delayed-desc':
      return sorted.sort((a, b) => getDelayScore(b) - getDelayScore(a));
    case 'updated-desc':
      return sorted.sort((a, b) => {
        const da = getLastUpdatedDate(a);
        const db = getLastUpdatedDate(b);
        return new Date(db || 0) - new Date(da || 0);
      });
    default:
      return sorted;
  }
}

export default function Projects() {
  const { projects, wards, municipality } = useData();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState(() => searchParams.get('ward') || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const categories = useMemo(() => [...new Set(projects.map((p) => p.category))].sort(), [projects]);

  const hasActiveFilters = wardFilter !== 'all' || statusFilter !== 'all'
    || categoryFilter !== 'all' || riskFilter !== 'all' || search.trim() !== '';

  const filtered = useMemo(() => {
    const result = projects.filter((p) => {
      if (wardFilter !== 'all' && p.wardNo !== Number(wardFilter)) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (riskFilter !== 'all' && getRiskLevel(p, projects).label !== riskFilter) return false;
      if (!matchesSearch(p, search, wards)) return false;
      return true;
    });
    return sortProjects(result, sortBy, projects);
  }, [projects, wards, wardFilter, statusFilter, categoryFilter, riskFilter, search, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setWardFilter('all');
    setStatusFilter('all');
    setCategoryFilter('all');
    setRiskFilter('all');
    setSortBy('default');
  };

  const statusCounts = useMemo(() => {
    const counts = {};
    projects.forEach((p) => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return counts;
  }, [projects]);

  return (
    <div className="min-h-screen dashboard-bg">
      <div className="page-container py-8 sm:py-10 section-gap">
        {/* Page header */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 sm:p-8 card-shadow">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Itahari Public Project Registry
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                All Itahari Ward Projects
              </h1>
              <p className="text-slate-500 mt-2 max-w-xl text-sm leading-relaxed">
                Explore {projects.length} publicly tracked ward projects in Itahari under{' '}
                <span className="font-medium text-slate-700">{municipality.name}</span>.
                Search by name, ward, contractor, or category.
              </p>
            </div>
            <Link to="/dashboard" className="shrink-0">
              <Button variant="secondary" size="sm" icon={LayoutDashboard}>
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
                className={`inline-flex items-center gap-1.5 transition-opacity ${statusFilter === status ? 'opacity-100 ring-2 ring-brand-600/20 rounded-md' : 'opacity-80 hover:opacity-100'}`}
              >
                <StatusBadge status={status} />
                <span className="text-xs font-medium text-slate-500">{count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & filters toolbar */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 card-shadow space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search by project name, ward, contractor, category…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-400"
              />
            </div>
            <div className="flex items-center gap-2 lg:w-56">
              <ArrowUpDown className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            >
              <option value="all">All Wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.number}>Ward {w.number}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            >
              <option value="all">All Status</option>
              <option value="Planned">Planned</option>
              <option value="Tender Open">Tender Open</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Delayed">Delayed</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            >
              <option value="all">All Risk Levels</option>
              <option value="Low Risk">Low Risk</option>
              <option value="Medium Risk">Medium Risk</option>
              <option value="High Risk">High Risk</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of {projects.length} projects
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
              >
                <X className="h-3 w-3" />
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Results grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects found"
            description="Try adjusting your search or filters to find what you're looking for."
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((project) => (
              <ProjectListCard key={project.id} project={project} wards={wards} allProjects={projects} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
