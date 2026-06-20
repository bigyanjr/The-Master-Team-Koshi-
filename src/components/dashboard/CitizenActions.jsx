import { Link } from 'react-router-dom';
import { Bot, MessageSquareHeart, ScanLine, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';

const actions = [
  {
    icon: Bot,
    titleKey: 'nav.ask',
    line: 'Get simple answers about ward spending in English or Nepali.',
    to: '/ask',
    ctaKey: 'nav.ask',
    variant: 'primary',
    iconBg: 'bg-brand-100 text-brand-800',
  },
  {
    icon: MessageSquareHeart,
    titleKey: 'quick.shareFeedback',
    line: 'Tell the ward office about delays, quality, or missing proof.',
    to: '/complaints',
    ctaKey: 'nav.feedback',
    variant: 'emerald',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: ScanLine,
    titleKey: 'action.scanQr.title',
    line: 'Open a project to view its QR code for on-site transparency.',
    to: '/projects',
    ctaKey: 'audience.itahari.cta',
    variant: 'secondary',
    iconBg: 'bg-blue-100 text-blue-700',
  },
];

export default function CitizenActions() {
  const { t } = useLanguage();
  return (
    <section>
      <h2 className="text-lg font-bold text-brand-950 mb-4 dark:text-slate-50">{t('dashboard.whatToDo')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions.map(({ icon: Icon, titleKey, line, to, ctaKey, variant, iconBg }) => (
          <div
            key={titleKey}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 card-shadow flex flex-col min-h-[180px] dark:bg-slate-900 dark:border-slate-800"
          >
            <div className={`inline-flex p-3 rounded-xl ${iconBg} mb-4 w-fit`}>
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-brand-950 text-base dark:text-slate-50">{t(titleKey)}</h3>
            <p className="text-sm text-slate-500 mt-2 flex-1 leading-relaxed dark:text-slate-400">{line}</p>
            <Link to={to} className="mt-5">
              <Button variant={variant} size="md" icon={ArrowRight} iconPosition="right" className="w-full">
                {t(ctaKey)}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
