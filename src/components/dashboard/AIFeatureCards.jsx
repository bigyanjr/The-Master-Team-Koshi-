import { Link } from 'react-router-dom';
import {
  Scale, Bot, FileSearch, QrCode, ArrowRight, Sparkles,
} from 'lucide-react';
import { DEMO_PROJECT_IDS } from '../../config/branding';

const features = [
  {
    icon: Scale,
    title: 'Governance Risk Detector',
    desc: '0–100 transparency score with neutral governance risk flags.',
    to: `/projects/${DEMO_PROJECT_IDS.drainage}`,
    cta: 'View demo',
  },
  {
    icon: Bot,
    title: 'Citizen Query Bot',
    desc: 'Ask about budgets and projects in English or Roman Nepali.',
    to: '/ask',
    cta: 'Open bot',
  },
  {
    icon: FileSearch,
    title: 'Auto Red Flag Explanation',
    desc: 'Plain-language summaries for items needing verification.',
    to: `/projects/${DEMO_PROJECT_IDS.streetLight}`,
    cta: 'See example',
  },
  {
    icon: QrCode,
    title: 'Live QR Scan',
    desc: 'Site QR opens mobile project facts for citizens on-site.',
    to: `/qr-demo/${DEMO_PROJECT_IDS.qrScan}`,
    cta: 'Show QR code',
  },
];

export default function AIFeatureCards() {
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Intelligence Layer
          </div>
          <h2 className="text-base font-semibold text-slate-900">AI & Transparency Tools</h2>
        </div>
        <Link to="/ask" className="text-sm font-semibold text-brand-800 hover:text-brand-900 inline-flex items-center gap-1">
          Query bot <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {features.map(({ icon: Icon, title, desc, to, cta }) => (
          <Link
            key={title}
            to={to}
            className="group rounded-xl border border-slate-200/90 bg-white p-5 card-shadow hover:card-shadow-md hover:border-slate-300/80 transition-all duration-200"
          >
            <div className="p-2 rounded-lg bg-slate-50 text-slate-600 w-fit mb-4 group-hover:bg-brand-50 group-hover:text-brand-800 transition-colors">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{desc}</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-800 mt-4 group-hover:gap-2 transition-all">
              {cta} <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
