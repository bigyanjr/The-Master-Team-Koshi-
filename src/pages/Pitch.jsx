import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Building2,
  ChevronRight,
  CreditCard,
  Eye,
  Gavel,
  Image,
  LayoutDashboard,
  MessageSquare,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import BrandLogo from '../components/layout/BrandLogo';
import Button from '../components/ui/Button';
import {
  DEMO_PROJECT_IDS,
  MUNICIPALITY_DEMO,
  PRODUCT_NAME,
  TAGLINE,
} from '../config/branding';
import { getProjectScanUrl } from '../utils/qrUrl';

const sections = [
  { id: 'problem', label: 'Problem' },
  { id: 'solution', label: 'Solution' },
  { id: 'how', label: 'How it works' },
  { id: 'ai', label: 'AI' },
  { id: 'qr', label: 'QR Demo' },
  { id: 'impact', label: 'Impact' },
  { id: 'future', label: 'Future' },
];

const flow = [
  { icon: Wallet, label: 'Budget' },
  { icon: Gavel, label: 'Tender' },
  { icon: Building2, label: 'Contractor' },
  { icon: CreditCard, label: 'Payment' },
  { icon: Image, label: 'Proof' },
  { icon: MessageSquare, label: 'Feedback' },
];

const steps = [
  {
    icon: Upload,
    title: 'Ward publishes',
    desc: 'Official budget, tender, payment & proof go live.',
  },
  {
    icon: Users,
    title: 'Citizens track',
    desc: 'Dashboard, QR scan, or project pages — no login needed.',
  },
  {
    icon: ShieldCheck,
    title: 'System flags risk',
    desc: 'Trust scores & alerts when something looks off.',
  },
];

const aiFeatures = [
  {
    icon: Bot,
    title: 'Citizen Query Bot',
    desc: 'Ask in English or Roman Nepali — instant answers from public data.',
    to: '/ask',
  },
  {
    icon: Sparkles,
    title: 'AI Project Summary',
    desc: 'Plain-language transparency brief on every project page.',
    to: `/projects/${DEMO_PROJECT_IDS.drainage}`,
  },
  {
    icon: AlertTriangle,
    title: 'Risk Detection',
    desc: 'Auto-flags payment-without-proof, delays, budget mismatches.',
    to: `/projects/${DEMO_PROJECT_IDS.drainage}`,
  },
  {
    icon: Eye,
    title: 'Trust Score',
    desc: '0–100 score citizens can understand at a glance.',
    to: '/dashboard',
  },
];

const impactStats = [
  { value: '5', label: 'Wards tracked', sub: 'Itahari demo' },
  { value: '10', label: 'Public projects', sub: 'Full lifecycle' },
  { value: '<5s', label: 'Citizen clarity', sub: 'Summary-first dashboard' },
  { value: '1 scan', label: 'Site transparency', sub: 'QR → live project data' },
];

const futureItems = [
  'Nepali UI (Devanagari) & SMS alerts',
  'Multi-municipality rollout',
  'Government open-data API integration',
  'Offline PWA for field QR scans',
  'PDF ward transparency reports',
];

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600 mb-2">
      {children}
    </p>
  );
}

export default function Pitch() {
  const qrUrl = getProjectScanUrl(DEMO_PROJECT_IDS.qrScan);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90">
        <div className="page-container py-3 flex items-center justify-between gap-4">
          <BrandLogo to="/" size="sm" />
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
            {sections.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-brand-800 hover:bg-brand-50 whitespace-nowrap"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/dashboard" className="hidden sm:block">
              <Button variant="ghost" size="sm" icon={LayoutDashboard}>
                Live demo
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                Launch
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.12) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative page-container py-16 sm:py-20 text-center max-w-3xl mx-auto">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wide mb-6">
            <Zap className="h-3.5 w-3.5" />
            Hackathon pitch · {MUNICIPALITY_DEMO}
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {PRODUCT_NAME}
          </h1>
          <p className="text-lg sm:text-xl text-brand-100 mt-3 font-medium">{TAGLINE}</p>
          <p className="text-sm sm:text-base text-brand-200/90 mt-4 leading-relaxed max-w-xl mx-auto">
            Ward-level budget transparency for Itahari — so every citizen can see where public money goes.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link to="/dashboard">
              <Button variant="emerald" size="lg" icon={LayoutDashboard}>
                Open dashboard
              </Button>
            </Link>
            <Link to={`/qr-demo/${DEMO_PROJECT_IDS.qrScan}`}>
              <Button variant="secondary" size="lg" icon={ScanLine} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                QR wow demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="page-container py-12 sm:py-16 space-y-16 sm:space-y-20">
        {/* 1. Problem */}
        <section id="problem" className="scroll-mt-24">
          <SectionLabel>1 · Problem</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight mb-6">
            Public money is hard to follow
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Where did the ward budget go?',
              'Who won the tender — and for how much?',
              'Was payment released with proof of work?',
              'Is the project on track or delayed?',
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 p-4 sm:p-5 rounded-2xl border border-red-100 bg-red-50/50"
              >
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-slate-800">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-4 max-w-2xl">
            Data lives in PDFs and office files — not in a form citizens can search, verify, or question.
          </p>
        </section>

        {/* 2. Solution */}
        <section id="solution" className="scroll-mt-24">
          <SectionLabel>2 · Solution</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight mb-6">
            One portal for the full accountability chain
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-6 sm:p-8 card-shadow">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {flow.map(({ icon: Icon, label }, i) => (
                <div key={label} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm text-brand-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 text-center">{label}</span>
                  </div>
                  {i < flow.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-slate-300 hidden sm:block shrink-0" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-slate-600 mt-6 max-w-lg mx-auto">
              WardWatch connects budget → tender → contractor → payment → proof → citizen feedback in one public platform.
            </p>
          </div>
        </section>

        {/* 3. How it works */}
        <section id="how" className="scroll-mt-24">
          <SectionLabel>3 · How it works</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight mb-6">
            Three steps to transparency
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 card-shadow min-h-[160px]"
              >
                <span className="absolute top-4 right-4 text-3xl font-black text-slate-100">{i + 1}</span>
                <div className="p-2.5 rounded-xl bg-brand-100 text-brand-800 w-fit mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-brand-950">{title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. AI features */}
        <section id="ai" className="scroll-mt-24">
          <SectionLabel>4 · AI features</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight mb-6">
            AI that citizens actually understand
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {aiFeatures.map(({ icon: Icon, title, desc, to }) => (
              <Link
                key={title}
                to={to}
                className="group rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 card-shadow hover:border-brand-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-violet-100 text-violet-700 shrink-0 group-hover:bg-violet-200 transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-950 group-hover:text-brand-800">{title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{desc}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 mt-3">
                      Try it <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 5. QR scan demo */}
        <section id="qr" className="scroll-mt-24">
          <SectionLabel>5 · QR wow demo</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight mb-6">
            Scan a site sign → see live project data
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="rounded-2xl border-2 border-brand-900/20 bg-white p-8 flex flex-col items-center card-shadow-lg">
              <div className="p-4 bg-white border-4 border-brand-900 rounded-2xl shadow-lg">
                <QRCodeSVG value={qrUrl} size={200} level="H" includeMargin />
              </div>
              <p className="text-sm font-semibold text-brand-800 mt-4 flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Itahari Main Road Repair · Ward 1
              </p>
              <p className="text-xs text-slate-400 mt-2 text-center max-w-xs">
                Point your phone camera — opens mobile project view with budget, payments & proof.
              </p>
            </div>
            <div className="space-y-4">
              {[
                'QR codes on construction site boards',
                'Citizens scan without installing an app',
                'Live trust score, payments & proof on phone',
                'Works on local Wi‑Fi with VITE_PUBLIC_URL',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  {item}
                </div>
              ))}
              <Link to={`/qr-demo/${DEMO_PROJECT_IDS.qrScan}`} className="inline-block pt-2">
                <Button variant="primary" icon={ScanLine}>
                  Open full QR demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 6. Impact */}
        <section id="impact" className="scroll-mt-24">
          <SectionLabel>6 · Impact</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight mb-6">
            Built for real civic accountability
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {impactStats.map(({ value, label, sub }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 text-center card-shadow min-h-[120px] flex flex-col justify-center"
              >
                <p className="text-3xl sm:text-4xl font-extrabold text-brand-900 tabular-nums">{value}</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-5 flex gap-3">
            <Target className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-900 leading-relaxed">
              <strong>Goal:</strong> A first-time citizen understands the platform in under 5 seconds —
              public money tracking, ward projects, trust scores, complaints, and AI help — all in one place.
            </p>
          </div>
        </section>

        {/* 7. Future scope */}
        <section id="future" className="scroll-mt-24">
          <SectionLabel>7 · Future scope</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-950 tracking-tight mb-6">
            What comes next
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {futureItems.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700"
              >
                <ChevronRight className="h-4 w-4 text-brand-600 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-brand-950 text-white p-8 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold">Ready to explore?</h2>
          <p className="text-brand-200 text-sm mt-2 max-w-md mx-auto">
            Demo accounts: citizen@itahari.demo / admin@itahari.demo — password: demo123
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link to="/dashboard">
              <Button variant="emerald" icon={LayoutDashboard}>Dashboard</Button>
            </Link>
            <Link to="/ask">
              <Button variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20" icon={Bot}>
                Ask AI
              </Button>
            </Link>
            <Link to="/login" state={{ from: '/admin', requiresAdmin: true }}>
              <Button variant="ghost" className="text-white hover:bg-white/10" icon={Upload}>
                Admin login
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>{PRODUCT_NAME} · {TAGLINE} · Hackathon MVP — not an official government record</p>
      </footer>
    </div>
  );
}
