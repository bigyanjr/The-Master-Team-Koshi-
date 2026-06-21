import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Users, Landmark, Bot, ShieldCheck, Upload, Search,
} from 'lucide-react';
import Button from '../components/ui/Button';
import LandingNav from '../components/landing/LandingNav';
import LandingFooter from '../components/landing/LandingFooter';
import MoneyFlowDiagram from '../components/transparency/MoneyFlowDiagram';
import { PRODUCT_NAME, TAGLINE, MUNICIPALITY_NAME } from '../config/branding';
import { useLanguage } from '../context/LanguageContext';
import useInView from '../hooks/useInView';

const quickActions = [
  { labelKey: 'quick.viewSpending', to: '/dashboard' },
  { labelKey: 'quick.browseProjects', to: '/projects' },
  { labelKey: 'quick.askMitra', to: '/ask' },
  { labelKey: 'quick.shareFeedback', to: '/complaints' },
];

const audienceCards = [
  {
    icon: Users,
    titleKey: 'audience.citizens.title',
    desc: 'See where ward money goes — projects, payments, and proof photos.',
    panel: 'from-emerald-500 to-emerald-700',
    cta: { to: '/dashboard', labelKey: 'audience.citizens.cta' },
  },
  {
    icon: Upload,
    titleKey: 'audience.wardOffice.title',
    desc: 'Publish project records, payments, and site photos for the public.',
    panel: 'from-green-500 to-green-700',
    cta: { to: '/login', labelKey: 'audience.wardOffice.cta', state: { requiresAdmin: true } },
  },
  {
    icon: Landmark,
    titleKey: 'audience.itahari.title',
    desc: 'Build trust by showing how ward budgets are used.',
    panel: 'from-teal-500 to-teal-700',
    cta: { to: '/projects', labelKey: 'audience.itahari.cta' },
  },
];

const howItWorks = [
  {
    step: '1',
    titleKey: 'how.step1.title',
    desc: 'Budget, payments, and proof photos go on the public portal.',
  },
  {
    step: '2',
    titleKey: 'how.step2.title',
    desc: 'View projects and payments — no login required.',
  },
  {
    step: '3',
    titleKey: 'how.step3.title',
    desc: 'Share concerns; the ward office reviews and responds.',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { t } = useLanguage();
  const [howItWorksRef, howItWorksInView] = useInView({ threshold: 0.25, once: false });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    navigate(`/projects${params}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <LandingNav />

      <section className="relative min-h-screen flex items-center overflow-hidden bg-emerald-950">
        <img
          src="/land.png"
          alt="Itahari Sub-Metropolitan City gate"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.92) contrast(1.05) saturate(1.05)' }}
        />
        {/* Dim tint ("madhuro") for polish + text legibility — darker at
            top/bottom (nav + scroll-seam blending), lighter through the
            middle so the photo still reads clearly behind the text. */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/78 via-emerald-900/52 to-emerald-950/78 pointer-events-none" />
        {/* Soft fade into the section below for a smoother seam */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/10 to-transparent dark:from-slate-950/20 pointer-events-none" />

        <div className="relative page-container py-32">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/65 border border-white/25 text-white text-xs font-semibold mb-7 backdrop-blur-md shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              {PRODUCT_NAME} · {TAGLINE}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white tracking-tight leading-[1.3] [text-shadow:0_2px_10px_rgba(0,0,0,0.45)]">
              {t('hero.headline.l1')}
              <br />
              {t('hero.headline.l2')}
            </h1>

            <p className="mt-4 text-sm sm:text-base text-emerald-50 leading-relaxed max-w-lg mx-auto [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 mt-8 max-w-md mx-auto">
              <Link to="/dashboard" className="flex-1">
                <Button variant="emerald" size="lg" icon={ArrowRight} iconPosition="right" className="w-full">
                  {t('hero.viewSpending')}
                </Button>
              </Link>
              <Link to="/ask" className="flex-1">
                <Button variant="secondary" size="lg" icon={Bot} className="w-full">
                  {t('hero.askMitra')}
                </Button>
              </Link>
            </div>

            <form onSubmit={handleSearch} className="mt-6 max-w-lg mx-auto">
              <div className="flex items-stretch gap-1.5 p-1.5 rounded-full bg-white/95 card-shadow-lg">
                <div className="relative flex-1 flex items-center">
                  <Search className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('hero.searchPlaceholder')}
                    className="w-full pl-11 pr-2 py-2.5 rounded-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 rounded-full bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition-colors shrink-0"
                >
                  {t('hero.searchBtn')}
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-7 pt-5 border-t border-white/10">
              {quickActions.map(({ labelKey, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="rounded-full bg-white px-3.5 py-1.5 text-xs sm:text-sm font-bold text-emerald-700 shadow-sm hover:bg-emerald-50 transition-colors"
                >
                  {t(labelKey)}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-14 max-w-4xl mx-auto">
            <MoneyFlowDiagram />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white dark:bg-slate-950">
        <div className="page-container">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-slate-50">{t('audience.title')}</h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-base dark:text-slate-400">{t('audience.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {audienceCards.map(({ icon: Icon, titleKey, desc, panel, cta }) => (
              <div
                key={titleKey}
                className="rounded-2xl border border-emerald-100 bg-white overflow-hidden flex card-shadow hover:card-shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800"
              >
                <div className={`w-24 sm:w-28 shrink-0 bg-gradient-to-br ${panel} flex items-center justify-center`}>
                  <div className="h-11 w-11 rounded-full bg-white/15 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="p-5 flex flex-col">
                  <h3 className="text-lg font-bold text-emerald-950 dark:text-slate-50">{t(titleKey)}</h3>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed dark:text-slate-400">{desc}</p>
                  <Link
                    to={cta.to}
                    state={cta.state}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 mt-3 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    {t(cta.labelKey)}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 sm:py-20 bg-emerald-50/70 border-y border-emerald-100 dark:bg-emerald-950/20 dark:border-slate-800">
        <div className="page-container">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-slate-50">{t('how.title')}</h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-base dark:text-slate-400">Three simple steps for {MUNICIPALITY_NAME}.</p>
          </div>
          <div ref={howItWorksRef} className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {howItWorks.map(({ step, titleKey, desc }, i) => (
              <div
                key={step}
                className={`rounded-2xl border border-emerald-100 bg-white p-6 card-shadow text-center dark:bg-slate-900 dark:border-slate-800 ${
                  howItWorksInView ? 'animate-drop-bounce' : 'opacity-0'
                }`}
                style={howItWorksInView ? { animationDelay: `${i * 200}ms` } : undefined}
              >
                <div className="inline-flex h-10 w-10 rounded-full bg-emerald-700 text-white text-sm font-bold items-center justify-center mb-4">
                  {step}
                </div>
                <h3 className="font-bold text-emerald-950 text-lg dark:text-slate-50">{t(titleKey)}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-white border-t border-emerald-100 dark:bg-slate-950 dark:border-slate-800">
        <div className="page-container text-center max-w-lg mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-950 dark:text-slate-50">{t('ready.title')}</h2>
          <p className="text-slate-500 mt-2 text-sm dark:text-slate-400">{t('ready.subtitle')}</p>
          <Link to="/dashboard" className="inline-block mt-6 w-full sm:w-auto">
            <Button variant="emerald" size="lg" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto min-w-[240px]">
              {t('ready.cta')}
            </Button>
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
