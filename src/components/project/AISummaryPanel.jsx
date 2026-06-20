import { useState } from 'react';
import { Bot, Loader2 } from 'lucide-react';
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
        title="Ward Mitra summary"
        subtitle="Plain-language explanation for citizens"
      />

      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
        Get a simple explanation of this project&apos;s budget, contractor, payments, and proof photos.
      </p>

      {!summary && !loading && (
        <div className="space-y-3">
          <Button variant="primary" size="md" icon={Bot} onClick={handleGenerate} className="w-full sm:w-auto">
            Explain in simple words
          </Button>
          {!aiAvailable && (
            <p className="text-xs text-slate-400">
              Built from published records on this page.
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 p-5 rounded-xl bg-white border border-slate-200/80 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-brand-600 shrink-0" />
          <p className="text-sm font-medium text-slate-800">Preparing summary…</p>
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
              <Badge color={source === 'ai' ? 'brand' : 'slate'}>
                {source === 'ai' ? 'Ward Mitra' : 'From records'}
              </Badge>
            </div>

            {summary.split('\n\n').map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="text-sm text-slate-700 leading-relaxed mb-3 last:mb-0 whitespace-pre-line">
                {paragraph}
              </p>
            ))}

            <p className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100 leading-relaxed">
              For important decisions, check the payments and proof photos on this page or contact your ward office.
            </p>
          </div>

          <Button variant="secondary" size="sm" icon={Bot} onClick={handleGenerate}>
            Refresh summary
          </Button>
        </div>
      )}
    </Card>
  );
}
