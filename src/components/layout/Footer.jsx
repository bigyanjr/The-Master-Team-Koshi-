import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-brand-700" />
              <span className="font-bold text-slate-900">WardWatch</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Civic transparency platform for tracking ward budgets, tenders, contractors, and project progress — built for accountable local governance.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Public Portal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/dashboard" className="hover:text-brand-700 transition-colors">Dashboard</Link></li>
              <li><Link to="/projects" className="hover:text-brand-700 transition-colors">All Projects</Link></li>
              <li><Link to="/complaints" className="hover:text-brand-700 transition-colors">File a Complaint</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">For Officials</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/admin" className="hover:text-brand-700 transition-colors">Admin Dashboard</Link></li>
              <li><Link to="/admin/add-project" className="hover:text-brand-700 transition-colors">Add Project</Link></li>
              <li><Link to="/admin/add-update" className="hover:text-brand-700 transition-colors">Post Update</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-400">
          <p>© 2025 WardWatch Civic Tech. Demo MVP — local data mode.</p>
          <p>Firebase-ready architecture • No backend required for demo</p>
        </div>
      </div>
    </footer>
  );
}
