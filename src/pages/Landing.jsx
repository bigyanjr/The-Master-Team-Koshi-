import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Wallet,
  Gavel,
  CreditCard,
  Image,
  MessageSquare,
  Building2,
  Users,
  Landmark,
  ScanLine,
  Bot,
  ShieldCheck,
  ChevronRight,
  QrCode,
  Sparkles,
  AlertTriangle,
  Upload,
  Brain,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Button from '../components/ui/Button';
import LandingNav from '../components/landing/LandingNav';
import LandingFooter from '../components/landing/LandingFooter';
import { getProjectScanUrl } from '../utils/qrUrl';
import { DEMO_PROJECT_IDS, PRODUCT_NAME, MUNICIPALITY_DEMO } from '../config/branding';

const flowStrip = [
  { icon: Wallet, label: 'Budget' },
  { icon: Gavel, label: 'Tender' },
  { icon: Building2, label: 'Contractor' },
  { icon: CreditCard, label: 'Payment' },
  { icon: Image, label: 'Proof' },
  { icon: MessageSquare, label: 'Citizen Feedback' },
];

const audienceCards = [
  {
    icon: Users,
    title: 'Citizens',
    desc: 'View budget, projects, proof, complaints, and risk flags.',
    color: 'from-blue-50 to-white border-blue-100',
    iconBg: 'bg-blue-100 text-blue-700',
    cta: { to: '/dashboard', label: 'Open dashboard' },
  },
  {
    icon: Upload,
    title: 'Ward IT/Admin',
    desc: 'Publish official project, payment, and proof updates.',
    color: 'from-emerald-50 to-white border-emerald-100',
    iconBg: 'bg-emerald-100 text-emerald-700',
    cta: { to: '/login', label: 'Admin login', state: { from: '/admin', requiresAdmin: true } },
  },
  {
    icon: Landmark,
    title: 'Municipality',
    desc: 'Build public trust through transparent reporting.',
    color: 'from-slate-50 to-white border-slate-200',
    iconBg: 'bg-brand-100 text-brand-800',
    cta: { to: '/projects', label: 'Browse projects' },
  },
];

const howItWorks = [
  {
    step: '1',
    icon: Upload,
    title: 'Ward publishes updates',
    desc: 'Official budget, tender, payment, and proof records go live.',
  },
  {
    step: '2',
    icon: Users,
    title: 'Citizens track progress',
    desc: 'Dashboard, QR scan, or project pages — no login needed.',
  },
  {
    step: '3',
    icon: Brain,
    title: 'AI flags risks',
    desc: 'Plain-language alerts when something needs a closer look.',
  },
];

const features = [
  { icon: Wallet, title: 'Ward budgets', desc: 'See how much is allocated and spent.' },
  { icon: Gavel, title: 'Tenders', desc: 'Who won the contract and for how much.' },
  { icon: CreditCard, title: 'Payments', desc: 'Every release linked to milestones.' },
  { icon: Image, title: 'Proof photos', desc: 'Before, during, and after work on site.' },
  { icon: AlertTriangle, title: 'Risk flags', desc: 'Delays and payment-without-proof alerts.' },
  { icon: Sparkles, title: 'AI summaries', desc: 'Complex data explained simply.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />

      {/* Hero */}
      <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/40 via-white to-white pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-100/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative page-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold mb-6 card-shadow">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {PRODUCT_NAME} · {MUNICIPALITY_DEMO}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-brand-950 tracking-tight leading-[1.12]">
              Track Itahari Ward Budget in Public
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              See how ward budget is allocated, which contractor got the work, how much payment was released,
              what proof is uploaded, and what citizens are reporting.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-8">
              <Link to="/dashboard" className="sm:flex-1 sm:max-w-[220px]">
                <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" className="w-full">
                  View Itahari Dashboard
                </Button>
              </Link>
              <Link to={`/qr-demo/${DEMO_PROJECT_IDS.qrScan}`} className="sm:flex-1 sm:max-w-[200px]">
                <Button variant="secondary" size="lg" icon={ScanLine} className="w-full">
                  Scan QR Demo
                </Button>
              </Link>
              <Link to="/ask" className="sm:flex-1 sm:max-w-[220px]">
                <Button variant="emerald" size="lg" icon={Bot} className="w-full">
                  Ask AI About Budget
                </Button>
              </Link>
            </div>
          </div>

          {/* Flow strip */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 card-shadow-md">
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-0">
                {flowStrip.map((step, i) => (
                  <div key={step.label} className="flex items-center">
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-2">
                      <div className="h-9 w-9 rounded-lg bg-brand-800 text-white flex items-center justify-center shrink-0">
                        <step.icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-brand-950 whitespace-nowrap">{step.label}</span>
                    </div>
                    {i < flowStrip.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 hidden sm:block mx-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audience cards */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
            {audienceCards.map(({ icon: Icon, title, desc, color, iconBg, cta }) => (
              <div
                key={title}
                className={`rounded-2xl border bg-gradient-to-br ${color} p-6 card-shadow hover:card-shadow-md transition-shadow`}
              >
                <div className={`inline-flex p-3 rounded-xl ${iconBg} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-brand-950">{title}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{desc}</p>
                <Link
                  to={cta.to}
                  state={cta.state}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 mt-4 hover:text-brand-900"
                >
                  {cta.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-slate-50/80 border-y border-slate-100">
        <div className="page-container">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-950">How it works</h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">Three steps. No jargon.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {howItWorks.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="rounded-2xl border border-slate-200/90 bg-white p-6 card-shadow text-center">
                <div className="inline-flex h-10 w-10 rounded-full bg-brand-800 text-white text-sm font-bold items-center justify-center mb-4">
                  {step}
                </div>
                <div className="inline-flex p-2 rounded-lg bg-slate-50 text-brand-700 mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-brand-950">{title}</h3>
                <p className="text-sm text-slate-500 mt-2">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-20 bg-white">
        <div className="page-container">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-950">What you can see</h2>
            <p className="text-slate-500 mt-2 text-sm">Everything in one public dashboard.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl border border-slate-200/90 bg-white card-shadow">
                <div className="h-11 w-11 rounded-xl bg-brand-50 text-brand-800 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-950">{title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QR Demo */}
      <section id="impact" className="py-16 sm:py-20 gradient-hero">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-4">
                <QrCode className="h-3.5 w-3.5" />
                Try it now
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                Scan a project QR at the site
              </h2>
              <p className="text-slate-300 mt-4 text-sm sm:text-base leading-relaxed max-w-md">
                Budget, contractor, payments, and proof — on your phone in seconds.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link to={`/qr-demo/${DEMO_PROJECT_IDS.qrScan}`}>
                  <Button variant="secondary" size="md" icon={ScanLine} className="bg-white text-brand-900 border-white">
                    Scan QR Demo
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="ghost" size="md" className="text-white hover:bg-white/10">
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="rounded-[2rem] border-4 border-white/20 bg-brand-950 p-4 shadow-2xl w-[260px]">
                <div className="rounded-xl bg-white/5 p-4 text-center">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                  <p className="text-white text-sm font-bold">Itahari Main Road Repair</p>
                  <p className="text-brand-300 text-xs mt-1">Ward 1 · 78% complete</p>
                  <div className="p-3 bg-white rounded-xl mt-4 inline-block">
                    <QRCodeSVG value={getProjectScanUrl(DEMO_PROJECT_IDS.qrScan)} size={120} level="M" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 bg-white border-t border-slate-100">
        <div className="page-container text-center max-w-lg mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-950">Ready to explore?</h2>
          <p className="text-slate-500 mt-2 text-sm">No login needed for the public dashboard.</p>
          <Link to="/dashboard" className="inline-block mt-6">
            <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
              View Itahari Dashboard
            </Button>
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
