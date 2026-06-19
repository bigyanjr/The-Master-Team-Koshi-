import { useState } from 'react';
import { Sparkles, Loader2, Cpu, ShieldCheck } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { getPublicSummary, hasAIConfigured } from '../../utils/aiSummary';

export default function AISummaryPanel({ project }) {
  const [summary, setSummary] = useState('');
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setSummary('');
    setSource(null);
    setError(null);

    try {
      const result = await getPublicSummary(project);
      setSummary(result.summary);
      setSource(result.source);
    } catch {
      setError('Could not generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const aiAvailable = hasAIConfigured();

  return (
    <Card className="border-brand-200/60 bg-gradient-to-br from-brand-50/50 via-white to-emerald-50/30">
      <CardHeader
        title="AI Transparency Summary"
        subtitle="Plain-language public accountability report for citizens"
      />

      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
        Get a simple explanation of this project&apos;s budget, contractor, payments, proofs, and
        transparency concerns — written for everyday citizens in clear English.
      </p>

      {!summary && !loading && (
        <div className="space-y-3">
          <Button variant="primary" icon={Sparkles} onClick={handleGenerate} className="w-full sm:w-auto">
            Generate AI Public Summary
          </Button>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 shrink-0" />
            {aiAvailable
              ? 'Live AI enabled via API key — local fallback used if the request fails.'
              : 'Using local summary (add VITE_AI_API_KEY to .env for live AI).'}
          </p>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 p-5 rounded-xl bg-white border border-slate-200/80 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-brand-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-800">Generating public summary…</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {aiAvailable ? 'Contacting AI service…' : 'Building summary from project records…'}
            </p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {summary && !loading && (
        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-600" />
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  Public Transparency Summary
                </span>
              </div>
              <Badge color={source === 'ai' ? 'brand' : 'slate'}>
                {source === 'ai' ? 'AI generated' : 'Local summary'}
              </Badge>
            </div>

            {summary.split('\n\n').map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="text-sm text-slate-700 leading-relaxed mb-3 last:mb-0 whitespace-pre-line">
                {paragraph}
              </p>
            ))}

            <div className="flex items-start gap-2 mt-4 pt-4 border-t border-slate-100">
              <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                This summary is for public understanding only. Always verify details using payments,
                proofs, and official records on this page.
              </p>
            </div>
          </div>

          <Button variant="secondary" size="sm" icon={Sparkles} onClick={handleGenerate}>
            Regenerate summary
          </Button>
        </div>
      )}
    </Card>
  );
}
