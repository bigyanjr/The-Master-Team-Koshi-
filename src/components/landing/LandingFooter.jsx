import { Link } from 'react-router-dom';
import { Shield, Heart } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="relative bg-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-slate-950 to-emerald-950 opacity-80" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-3xl rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-6 w-6 text-emerald-400" />
            <span className="font-bold text-xl">WardWatch</span>
          </div>
          <p className="text-lg sm:text-xl font-medium text-slate-200 leading-relaxed flex items-center gap-2 flex-wrap justify-center">
            <Heart className="h-5 w-5 text-emerald-400 shrink-0" />
            Built for Good Governance, Transparency, and Citizen Accountability.
          </p>
          <p className="text-sm text-slate-400 mt-4">
            Civic-tech demo · Kathmandu Metropolitan City · Hackathon MVP
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p>© 2025 WardWatch. Public Money, Public Visibility.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
            <Link to="/projects" className="hover:text-emerald-400 transition-colors">Projects</Link>
            <Link to="/complaints" className="hover:text-emerald-400 transition-colors">Complaints</Link>
            <Link to="/admin" className="hover:text-emerald-400 transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
