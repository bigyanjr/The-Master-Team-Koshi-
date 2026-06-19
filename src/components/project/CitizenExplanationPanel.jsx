import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { generateCitizenExplanation } from '../../utils/citizenExplanation';

export default function CitizenExplanationPanel({ project }) {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setExplanation('');
    // Simulate brief AI processing for demo effect
    setTimeout(() => {
      setExplanation(generateCitizenExplanation(project));
      setLoading(false);
    }, 600);
  };

  return (
    <Card className="border-brand-200/60 bg-gradient-to-br from-brand-50/50 via-white to-emerald-50/30">
      <CardHeader
        title="Citizen Explanation"
        subtitle="Plain-language summary — no technical jargon"
      />
      <p className="text-sm text-slate-600 mb-4">
        Get a simple explanation of this project&apos;s budget, contractor, payments, proofs, and any concerns — written for everyday citizens.
      </p>

      {!explanation && !loading && (
        <Button variant="primary" icon={Sparkles} onClick={handleGenerate} className="w-full sm:w-auto">
          Explain this project to citizens
        </Button>
      )}

      {loading && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          Generating citizen-friendly summary…
        </div>
      )}

      {explanation && !loading && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">AI-Style Summary (Local Demo)</span>
            </div>
            {explanation.split('\n\n').map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-sm text-slate-700 leading-relaxed mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
          <Button variant="secondary" size="sm" icon={Sparkles} onClick={handleGenerate}>
            Regenerate explanation
          </Button>
        </div>
      )}
    </Card>
  );
}
