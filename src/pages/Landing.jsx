import { Link } from 'react-router-dom';
import {
  Shield, ArrowRight, Eye, BarChart3, QrCode, Users, CheckCircle2, Building2,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useData } from '../context/DataContext';
import { formatCompactCurrency } from '../utils/formatters';
import { getTotalPaid } from '../utils/riskEngine';

const features = [
  { icon: Eye, title: 'Public Visibility', desc: 'Every ward project, tender, and payment is open for citizen scrutiny.' },
  { icon: BarChart3, title: 'Budget Tracking', desc: 'Real-time charts show how allocated funds are being utilized across wards.' },
  { icon: QrCode, title: 'QR Transparency', desc: 'Scan project QR codes at construction sites for instant progress updates.' },
  { icon: Shield, title: 'Trust Scoring', desc: 'Automated risk flags and trust scores highlight projects needing attention.' },
  { icon: Users, title: 'Citizen Complaints', desc: 'Residents can report concerns and track resolution status publicly.' },
  { icon: CheckCircle2, title: 'Proof Verification', desc: 'Photo proofs and milestone documents uploaded by ward officials.' },
];

export default function Landing() {
  const { municipality, projects } = useData();
  const totalSpent = projects.reduce((s, p) => s + getTotalPaid(p), 0);

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-sm font-medium mb-6 backdrop-blur-sm border border-white/10">
              <Building2 className="h-4 w-4" />
              {municipality.name}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Public Money,<br />
              <span className="text-emerald-300">Public Visibility</span>
            </h1>
            <p className="mt-6 text-lg text-blue-100/90 leading-relaxed max-w-2xl">
              WardWatch empowers citizens to track how ward budgets are spent — from tender awards to contractor payments, progress updates, and proof documents.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/dashboard">
                <Button variant="emerald" size="lg" icon={ArrowRight} iconPosition="right">
                  Explore Dashboard
                </Button>
              </Link>
              <Link to="/projects">
                <Button variant="secondary" size="lg" className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
                  View All Projects
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-3xl">
            {[
              { label: 'Wards', value: municipality.wards },
              { label: 'Projects', value: projects.length },
              { label: 'FY Budget', value: formatCompactCurrency(municipality.totalBudget) },
              { label: 'Spent', value: formatCompactCurrency(totalSpent) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-blue-200 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-slate-900">Built for Transparent Governance</h2>
            <p className="text-slate-500 mt-3">Every rupee tracked. Every milestone verified. Every citizen informed.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <Card key={title} hover>
                <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700 w-fit mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Card className="!bg-brand-900 !border-brand-800 text-center py-10">
              <h2 className="text-2xl font-bold text-white">Ready to see where your ward money goes?</h2>
              <p className="text-blue-200 mt-2 max-w-lg mx-auto">Browse live project data, trust scores, and payment records — no login required.</p>
              <Link to="/dashboard" className="inline-block mt-6">
                <Button variant="emerald" size="lg" icon={ArrowRight} iconPosition="right">
                  Open Public Dashboard
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
