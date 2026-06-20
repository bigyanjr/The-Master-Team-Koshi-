import { Link } from 'react-router-dom';
import {
  ArrowRight, Wallet, Gavel, CreditCard, Image, MessageSquare,
  Building2, Users, Landmark, Bot, ShieldCheck, ChevronRight, Upload,
} from 'lucide-react';
import Button from '../components/ui/Button';
import LandingNav from '../components/landing/LandingNav';
import LandingFooter from '../components/landing/LandingFooter';
import { PRODUCT_NAME, TAGLINE, MUNICIPALITY_DEMO } from '../config/branding';

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
    title: 'For Citizens',
    desc: 'See where ward budget is spent and report concerns.',
    color: 'from-blue-50 to-white border-blue-100',
    iconBg: 'bg-blue-100 text-blue-700',
    cta: { to: '/dashboard', label: 'View dashboard' },
  },
  {
    icon: Upload,
    title: 'For Ward IT/Admin',
    desc: 'Publish official project, payment, and proof updates.',
    color: 'from-emerald-50 to-white border-emerald-100',
    iconBg: 'bg-emerald-100 text-emerald-700',
    cta: { to: '/login', label: 'Admin login', state: { requiresAdmin: true } },
  },
  {
    icon: Landmark,
    title: 'For Municipality',
    desc: 'Build public trust through transparent reporting.',
    color: 'from-slate-50 to-white border-slate-200',
    iconBg: 'bg-brand-100 text-brand-800',
    cta: { to: '/projects', label: 'Browse projects' },
  },
];

const howItWorks = [
  {
    step: '1',
    title: 'Ward admins publish records',
    desc: 'Budget, tender, payment, and proof details go live on the public portal.',
  },
  {
    step: '2',
    title: 'Citizens track spending',
    desc: 'View projects, payments, and proof photos — no login required.',
  },
  {
    step: '3',
    title: 'Feedback builds accountability',
    desc: 'Citizens report concerns; ward teams review and respond.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />

      <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white pointer-events-none" />

        <div className="relative page-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold mb-6 card-shadow">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              {PRODUCT_NAME} · {TAGLINE}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-brand-950 tracking-tight leading-[1.12]">
              Track Itahari Ward Budget in Public
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              View ward projects, tender details, contractors, payments, proof photos, progress updates,
              and citizen complaints in one simple transparency portal.
            </p>

            <p className="mt-4 text-sm font-medium text-brand-800 max-w-xl mx-auto">
              See how Itahari ward budget is used — from allocation to project proof.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-8">
              <Link to="/dashboard" className="sm:flex-1 sm:max-w-[240px]">
                <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" className="w-full">
                  View Public Dashboard
                </Button>
              </Link>
              <Link to="/ask" className="sm:flex-1 sm:max-w-[220px]">
                <Button variant="secondary" size="lg" icon={Bot} className="w-full">
                  Ask Ward Mitra
                </Button>
              </Link>
              <Link to="/login" state={{ requiresAdmin: true }} className="sm:flex-1 sm:max-w-[240px]">
                <Button variant="emerald" size="lg" icon={ShieldCheck} className="w-full">
                  Login as Ward IT/Admin
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-12 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 card-shadow-md">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide text-center mb-4">
                How public money becomes visible
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-0">
                {flowStrip.map((step, i) => (
                  <div key={step.label} className="flex items-center">
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-2">
                      <div className="h-10 w-10 rounded-xl bg-brand-800 text-white flex items-center justify-center shrink-0">
                        <step.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-brand-950 whitespace-nowrap">{step.label}</span>
                    </div>
                    {i < flowStrip.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 hidden sm:block mx-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

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

      <section id="how-it-works" className="py-16 sm:py-20 bg-slate-50/80 border-y border-slate-100">
        <div className="page-container">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-950">How it works</h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">Simple steps for {MUNICIPALITY_DEMO}.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {howItWorks.map(({ step, title, desc }) => (
              <div key={step} className="rounded-2xl border border-slate-200/90 bg-white p-6 card-shadow text-center">
                <div className="inline-flex h-10 w-10 rounded-full bg-brand-800 text-white text-sm font-bold items-center justify-center mb-4">
                  {step}
                </div>
                <h3 className="font-bold text-brand-950 text-lg">{title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-white border-t border-slate-100">
        <div className="page-container text-center max-w-lg mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-950">Ready to explore?</h2>
          <p className="text-slate-500 mt-2 text-sm">No login needed to view the public dashboard.</p>
          <Link to="/dashboard" className="inline-block mt-6">
            <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
              View Public Dashboard
            </Button>
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
