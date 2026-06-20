import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, FolderKanban, X, LayoutDashboard } from 'lucide-react';
import { useData } from '../context/DataContext';
import ProjectListCard from '../components/project/ProjectListCard';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import WardSelect from '../components/form/WardSelect';
import { getWardByNo } from '../utils/formatters';
import { MUNICIPALITY_NAME } from '../config/branding';
import { useLanguage } from '../context/LanguageContext';

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
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [wardFilter, setWardFilter] = useState(() => searchParams.get('ward') || 'all');

  const hasActiveFilters = wardFilter !== 'all' || search.trim() !== '';

  const filtered = useMemo(() => {
    return publicProjects.filter((p) => {
      if (wardFilter !== 'all' && p.wardNo !== Number(wardFilter)) return false;
      if (!matchesSearch(p, search, wards)) return false;
      return true;
    });
  }, [publicProjects, wards, wardFilter, search]);

  const clearFilters = () => {
    setSearch('');
    setWardFilter('all');
  };

  return (
    <div className="min-h-screen dashboard-bg">
      <div className="page-container py-8 sm:py-10 space-y-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 card-shadow dark:bg-slate-900 dark:border-slate-800">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight dark:text-slate-50">
            {t('projects.title')}
          </h1>
          <p className="text-slate-600 mt-2 max-w-2xl text-base leading-relaxed dark:text-slate-400">
            Browse official projects published by {MUNICIPALITY_NAME} ward offices.
          </p>
          <Link to="/dashboard" className="inline-block mt-4">
            <Button variant="secondary" size="md" icon={LayoutDashboard}>{t('projects.backToSpending')}</Button>
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 card-shadow space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <WardSelect
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            includeAllOption
            allOptionLabel={t('ward.all')}
            includeEmptyOption={false}
            selectClassName="w-full sm:max-w-xs px-4 py-4 rounded-xl border-2 border-slate-200 text-base font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
          />
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder={t('projects.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50 dark:placeholder:text-slate-500"
            />
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              <X className="h-3.5 w-3.5" />
              {t('projects.clearFilters')}
            </button>
          )}
        </div>

        {publicProjects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title={t('projects.noneYet')}
            description="Projects will appear here after ward offices publish them."
            actionLabel="Go to spending"
            actionTo="/dashboard"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title={t('projects.noMatch')}
            description="Try a different ward or search term."
            actionLabel={t('projects.clearFilters')}
            onAction={clearFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((project) => (
              <ProjectListCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
