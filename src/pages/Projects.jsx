import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { useData } from '../context/DataContext';
import ProjectCard from '../components/project/ProjectCard';
import EmptyState from '../components/ui/EmptyState';
import { FolderKanban } from 'lucide-react';

export default function Projects() {
  const { projects, wards, payments, proofs, updates, complaints, contractors } = useData();
  const context = { payments, proofs, updates, complaints, contractors };

  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = useMemo(() => [...new Set(projects.map((p) => p.category))], [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (wardFilter !== 'all' && p.wardId !== wardFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [projects, wardFilter, statusFilter, categoryFilter, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">All Projects</h1>
        <p className="text-slate-500 mt-1">{projects.length} ward projects tracked publicly</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 card-shadow">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <option value="all">All Wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>Ward {w.number} — {w.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <option value="all">All Status</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="delayed">Delayed</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
          <Filter className="h-3 w-3" />
          Showing {filtered.length} of {projects.length} projects
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Try adjusting your filters or search query."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((project) => {
            const ward = wards.find((w) => w.id === project.wardId);
            return (
              <ProjectCard key={project.id} project={project} ward={ward} context={context} />
            );
          })}
        </div>
      )}
    </div>
  );
}
