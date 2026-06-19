import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Settings,
  EyeOff,
  FileSearch,
  CameraOff,
  Wallet,
  Gavel,
  CreditCard,
  Image,
  MessageSquare,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Building2,
  FolderKanban,
  Banknote,
  Zap,
} from 'lucide-react';
import Button from '../components/ui/Button';
import LandingNav from '../components/landing/LandingNav';
import LandingFooter from '../components/landing/LandingFooter';

const problems = [
  {
    icon: EyeOff,
    title: 'Citizens do not know where local budget goes',
    desc: 'Ward allocations are published in dense PDFs or notice boards that most residents never see or understand.',
    color: 'from-red-500/10 to-orange-500/10',
    iconColor: 'text-red-600 bg-red-50',
  },
  {
    icon: FileSearch,
    title: 'Tender and contractor details are hard to access',
    desc: 'Who won the contract, for how much, and on what terms — this information is scattered and outdated.',
    color: 'from-amber-500/10 to-yellow-500/10',
    iconColor: 'text-amber-600 bg-amber-50',
  },
  {
    icon: CameraOff,
    title: 'Public work progress is not easily verifiable',
    desc: 'Citizens cannot confirm if money released matches work done on the ground without visiting offices in person.',
    color: 'from-slate-500/10 to-slate-400/10',
    iconColor: 'text-slate-600 bg-slate-100',
  },
];

const flowSteps = [
  { icon: Wallet, label: 'Budget Allocation', color: 'bg-brand-600' },
  { icon: Gavel, label: 'Tender', color: 'bg-brand-700' },
  { icon: Building2, label: 'Contractor', color: 'bg-emerald-600' },
  { icon: CreditCard, label: 'Payment', color: 'bg-emerald-700' },
  { icon: Image, label: 'Proof', color: 'bg-teal-600' },
  { icon: MessageSquare, label: 'Citizen Feedback', color: 'bg-teal-700' },
];

const features = [
  {
    icon: Wallet,
    title: 'Budget Transparency',
    desc: 'See ward-wise allocations and how much has been spent vs. approved budgets.',
  },
  {
    icon: Gavel,
    title: 'Tender Tracking',
    desc: 'Follow tender amounts, awarded contractors, and procurement milestones publicly.',
  },
  {
    icon: CreditCard,
    title: 'Payment Proof',
    desc: 'Every payment release linked to milestones, dates, and official remarks.',
  },
  {
    icon: Sparkles,
    title: 'AI Citizen Summary',
    desc: 'Plain-language summaries so any citizen can understand complex project data instantly.',
  },
  {
    icon: AlertTriangle,
    title: 'Risk Flag Detection',
    desc: 'Automated alerts for payment-without-proof, delays, and budget mismatches.',
  },
  {
    icon: MessageSquare,
    title: 'Citizen Complaint System',
    desc: 'File and track public complaints tied to specific ward projects.',
  },
  {
    icon: QrCode,
    title: 'QR Project Access',
    desc: 'Scan a code at any project site to open live progress on your phone.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust Score',
    desc: 'A 0–100 transparency rating computed from proofs, payments, and citizen feedback.',
  },
];

const impactStats = [
  { icon: Building2, value: '5', label: 'Demo Wards', sub: 'Kathmandu Metropolitan City' },
  { icon: FolderKanban, value: '10', label: 'Public Projects', sub: 'Roads, health, water & more' },
  { icon: Banknote, value: 'NPR 12.5 Cr', label: 'Tracked', sub: 'Budget & payments monitored' },
  { icon: Zap, value: 'Real-time', label: 'Risk Flags', sub: 'Automated trust scoring' },
];

function FlowArrow() {
  return (
    <div className="hidden sm:flex items-center justify-center shrink-0 px-1">
      <ChevronRight className="h-5 w-5 text-slate-300" />
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <LandingNav />

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-emerald-50/40" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-brand-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.15) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-brand-200/60 text-brand-800 text-sm font-medium mb-8 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Civic-tech for local government transparency
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.08]">
              Track Every Rupee of{' '}
              <span className="gradient-text">Local Government Spending</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              WardWatch helps citizens see budget allocation, tenders, payments, proof photos, and project progress in one transparent public dashboard.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
              <Link to="/dashboard">
                <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto min-w-[220px] shadow-lg shadow-brand-900/20">
                  View Public Dashboard
                </Button>
              </Link>
              <Link to="/admin">
                <Button variant="emerald" size="lg" icon={Settings} className="w-full sm:w-auto min-w-[220px] shadow-lg shadow-emerald-900/20">
                  Open Ward Admin Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero preview card */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-sm p-2 shadow-2xl shadow-brand-900/10">
              <div className="rounded-xl bg-gradient-to-br from-brand-900 via-brand-800 to-emerald-900 p-6 sm:p-8 text-white">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {impactStats.map(({ icon: Icon, value, label }) => (
                    <div key={label} className="text-center sm:text-left">
                      <Icon className="h-5 w-5 text-emerald-300 mb-2 mx-auto sm:mx-0 opacity-80" />
                      <p className="text-2xl sm:text-3xl font-bold">{value}</p>
                      <p className="text-sm text-blue-200/90 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-brand-700 uppercase tracking-wider mb-3">The Problem</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Public money disappears into a black box
            </h2>
            <p className="text-slate-500 mt-4 text-lg">
              Local governance fails when citizens cannot follow the money trail from budget to finished work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {problems.map(({ icon: Icon, title, desc, color, iconColor }) => (
              <div
                key={title}
                className={`group relative rounded-2xl border border-slate-200/80 bg-gradient-to-br ${color} p-6 sm:p-8 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`inline-flex p-3 rounded-xl ${iconColor} mb-5`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 leading-snug">{title}</h3>
                <p className="text-slate-600 mt-3 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution flow */}
      <section id="solution" className="py-20 sm:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-3">The Solution</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              One transparent chain of accountability
            </h2>
            <p className="text-slate-500 mt-4 text-lg">
              WardWatch connects every step from budget approval to citizen feedback — nothing hidden in between.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm card-shadow-lg">
            <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap items-center justify-center gap-2 sm:gap-0">
              {flowSteps.map((step, i) => (
                <div key={step.label} className="flex flex-col sm:flex-row items-center">
                  <div className="flex flex-col items-center text-center min-w-[100px] sm:min-w-[110px]">
                    <div className={`h-14 w-14 rounded-2xl ${step.color} text-white flex items-center justify-center shadow-lg mb-3`}>
                      <step.icon className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 max-w-[120px] leading-tight">{step.label}</p>
                  </div>
                  {i < flowSteps.length - 1 && <FlowArrow />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-brand-700 uppercase tracking-wider mb-3">Key Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Everything judges — and citizens — need to see
            </h2>
            <p className="text-slate-500 mt-4 text-lg">
              Built for ward IT teams, auditors, journalists, and everyday residents.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-slate-200/80 bg-white p-6 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-50 to-emerald-50 text-brand-700 flex items-center justify-center mb-4 group-hover:from-brand-100 group-hover:to-emerald-100 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo impact */}
      <section id="impact" className="py-20 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-emerald-900" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-emerald-300 uppercase tracking-wider mb-3">Demo Impact</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Live data. Real governance scenarios.
            </h2>
            <p className="text-blue-200/80 mt-4 text-lg">
              Pre-loaded with Kathmandu Metropolitan City demo wards, projects, and risk engine output.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {impactStats.map(({ icon: Icon, value, label, sub }) => (
              <div
                key={label}
                className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-6 sm:p-8 text-center hover:bg-white/15 transition-colors"
              >
                <div className="inline-flex p-3 rounded-xl bg-white/10 text-emerald-300 mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white">{value}</p>
                <p className="text-lg font-medium text-emerald-200 mt-1">{label}</p>
                <p className="text-sm text-blue-200/70 mt-2">{sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link to="/dashboard">
              <Button variant="emerald" size="lg" icon={ArrowRight} iconPosition="right" className="shadow-xl shadow-black/20">
                Explore the Live Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA strip */}
      <section className="py-16 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Ready in 10 seconds. Deep enough for auditors.
          </h2>
          <p className="text-slate-500 mt-3 text-lg">
            No login. No setup. Open the dashboard and follow the money.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
            <Link to="/dashboard">
              <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                View Public Dashboard
              </Button>
            </Link>
            <Link to="/projects">
              <Button variant="secondary" size="lg">
                Browse 10 Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
