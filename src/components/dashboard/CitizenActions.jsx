import { Link } from 'react-router-dom';
import { Bot, MessageSquareHeart, ScanLine, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { DEMO_PROJECT_IDS } from '../../config/branding';

const actions = [
  {
    icon: Bot,
    title: 'Ask AI About Projects',
    line: 'Simple answers about ward spending.',
    to: '/ask',
    cta: 'Ask AI',
    variant: 'primary',
    iconBg: 'bg-brand-100 text-brand-800',
  },
  {
    icon: MessageSquareHeart,
    title: 'Report a Complaint',
    line: 'Share concerns about any ward project.',
    to: '/complaints',
    cta: 'Report',
    variant: 'emerald',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: ScanLine,
    title: 'Scan Project QR',
    line: 'See live project info at a site.',
    to: `/qr-demo/${DEMO_PROJECT_IDS.qrScan}`,
    cta: 'Scan QR',
    variant: 'secondary',
    iconBg: 'bg-blue-100 text-blue-700',
  },
];

export default function CitizenActions() {
  return (
    <section>
      <h2 className="text-base font-bold text-brand-950 mb-4">What would you like to do?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions.map(({ icon: Icon, title, line, to, cta, variant, iconBg }) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 card-shadow flex flex-col min-h-[160px]"
          >
            <div className={`inline-flex p-2.5 rounded-xl ${iconBg} mb-4 w-fit`}>
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-brand-950 text-sm sm:text-base">{title}</h3>
            <p className="text-sm text-slate-500 mt-1 flex-1">{line}</p>
            <Link to={to} className="mt-4">
              <Button variant={variant} size="sm" icon={ArrowRight} iconPosition="right" className="w-full">
                {cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
