import { useEffect, useRef, useState } from 'react';
import {
  Wallet, Gavel, Building2, CreditCard, Image, MessageSquare,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const steps = [
  { icon: Wallet, labelKey: 'flow.budget.label', hintKey: 'flow.budget.hint' },
  { icon: Gavel, labelKey: 'flow.tender.label', hintKey: 'flow.tender.hint' },
  { icon: Building2, labelKey: 'flow.contractor.label', hintKey: 'flow.contractor.hint' },
  { icon: CreditCard, labelKey: 'flow.payment.label', hintKey: 'flow.payment.hint' },
  { icon: Image, labelKey: 'flow.proof.label', hintKey: 'flow.proof.hint' },
  { icon: MessageSquare, labelKey: 'flow.feedback.label', hintKey: 'flow.feedback.hint' },
];

export default function MoneyFlowDiagram({ compact = false, className = '' }) {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const [highlightStyle, setHighlightStyle] = useState(null);

  // Advance which card the "wheel" is rolling toward.
  useEffect(() => {
    if (reducedMotion) return undefined;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length);
    }, 1600);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  // Measure the active card's position so the highlighter can glide
  // smoothly to it (like a wheel rolling along the row) instead of
  // teleporting between cards.
  useEffect(() => {
    function measure() {
      const container = containerRef.current;
      const card = cardRefs.current[activeIndex];
      if (!container || !card) return;
      const containerRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      setHighlightStyle({
        width: `${cardRect.width}px`,
        height: `${cardRect.height}px`,
        transform: `translate(${cardRect.left - containerRect.left}px, ${cardRect.top - containerRect.top}px)`,
      });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeIndex]);

  return (
    <div className={`rounded-2xl border border-slate-200/90 bg-white card-shadow dark:bg-slate-900 dark:border-slate-800 ${compact ? 'p-4' : 'p-5 sm:p-6'} ${className}`}>
      <div className={`flex items-center gap-2 ${compact ? 'mb-1.5' : 'mb-1'}`}>
        <p className={`font-bold text-brand-950 dark:text-slate-50 ${compact ? 'text-sm' : 'text-sm sm:text-base'}`}>
          {t('flow.title')}
        </p>
        <span className="text-base leading-none" role="img" aria-label="Nepal flag">🇳🇵</span>
      </div>
      <div
        className={`h-1 w-16 rounded-full animate-flow-shimmer ${compact ? 'mb-3' : 'mb-4 sm:mb-5'}`}
        style={{ backgroundImage: 'linear-gradient(90deg, #dc143c, #003893, #dc143c)' }}
      />

      <div ref={containerRef} className="relative">
        {highlightStyle && (
          <div
            className="pointer-events-none absolute rounded-xl border-2 border-emerald-400 ring-4 ring-emerald-200/50 transition-transform duration-700 ease-in-out dark:border-emerald-500 dark:ring-emerald-700/40"
            style={highlightStyle}
          >
            {/* Little rolling wheel riding along the active card, like a car wheel turning as it moves */}
            <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-emerald-600 shadow-md ring-2 ring-white dark:ring-slate-900 overflow-hidden flex items-center justify-center">
              <span
                className={`block h-full w-full rounded-full ${reducedMotion ? '' : 'animate-wheel-spin'}`}
                style={{
                  background: 'conic-gradient(#ffffff 0deg 90deg, transparent 90deg 180deg, #ffffff 180deg 270deg, transparent 270deg 360deg)',
                }}
              />
            </span>
          </div>
        )}

        <div className={`grid gap-2.5 ${compact ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'}`}>
          {steps.map((step, i) => (
            <div
              key={step.labelKey}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`group relative flex flex-col items-center text-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 dark:bg-slate-800/50 dark:border-slate-800 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md dark:hover:border-emerald-800 animate-flow-in ${
                compact ? 'py-2.5 px-1.5' : 'py-4 px-2'
              }`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className="relative inline-flex">
                <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-60 group-hover:animate-ping motion-reduce:hidden" />
                <span className={`relative inline-flex items-center gap-0.5 rounded-full bg-emerald-700 text-white font-bold uppercase tracking-wide transition-colors group-hover:bg-emerald-600 ${
                  compact ? 'px-1.5 py-0.5 text-[8px]' : 'px-2 py-0.5 text-[9px]'
                }`}>
                  {t('flow.stepLabel')} {i + 1}
                </span>
              </span>
              <div className={`rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:bg-emerald-700 ${
                compact ? 'h-8 w-8' : 'h-10 w-10'
              }`}>
                <step.icon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
              </div>
              <div className="min-w-0">
                <span className={`font-semibold text-brand-950 dark:text-slate-100 block ${
                  compact ? 'text-xs' : 'text-sm'
                }`}>
                  {t(step.labelKey)}
                </span>
                {!compact && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{t(step.hintKey)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
