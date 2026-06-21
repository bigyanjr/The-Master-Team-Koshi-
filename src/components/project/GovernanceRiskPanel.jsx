import { Shield, AlertTriangle, CheckCircle2, Info, Scale } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import { RiskLevelBadge } from '../ui/Badge';
import TrustScoreRing from '../ui/TrustScoreRing';
import { RiskFlagList } from '../ui/RiskFlag';
import {
  getRiskFlags,
  calculateTrustScore,
  getRiskLevel,
  generateRiskExplanation,
} from '../../utils/riskEngine';

const riskBorder = {
  'Low Risk': 'border-emerald-200/80',
  'Medium Risk': 'border-amber-200/80',
  'High Risk': 'border-red-200/80',
};

export default function GovernanceRiskPanel({ project, allProjects = [] }) {
  const flags = getRiskFlags(project, allProjects);
  const score = calculateTrustScore(project, allProjects);
  const risk = getRiskLevel(project, allProjects);
  const explanation = generateRiskExplanation(project, allProjects);
  const border = riskBorder[risk.label] || riskBorder['Low Risk'];

  return (
    <Card className={`overflow-hidden ${border}`}>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-4 w-4 text-brand-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Governance Risk Detector
              </span>
            </div>
            <CardHeader
              title="Transparency & Accountability Check"
              subtitle="Neutral analysis — flags items that need public verification"
              className="!mb-0 !p-0"
            />
          </div>
          {flags.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200/80">
              <AlertTriangle className="h-3.5 w-3.5" />
              Potential Governance Risk
            </span>
          )}
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-6">
              <TrustScoreRing score={score} size="lg" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Transparency Score</p>
                <p className="text-sm text-slate-600 mt-1 max-w-xs leading-relaxed">
                  {flags.length === 0
                    ? 'Public records appear consistent with reported progress.'
                    : 'Citizens and ward officials should verify flagged items.'}
                </p>
                <div className="mt-3">
                  <RiskLevelBadge level={risk.label} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 p-4 rounded-lg bg-white border border-slate-200/80 text-sm text-slate-600 min-w-[200px]">
              <div className="flex items-center gap-2 font-medium text-slate-800">
                <Shield className="h-4 w-4 text-brand-700" />
                {flags.length} flag{flags.length !== 1 ? 's' : ''} for review
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Score reflects proofs, payments, delays, and citizen feedback on public records.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 mb-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-50 text-brand-800 shrink-0">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                Auto Red Flag Explanation
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">{explanation}</p>
              <p className="text-xs text-slate-400 mt-3">
                This is a transparency concern summary — not proof of wrongdoing.
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Active transparency flags
          </p>
          {flags.length > 0 ? (
            <RiskFlagList flags={flags} />
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50/80 border border-emerald-200/60">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <p className="text-sm text-emerald-800 font-medium">
                No potential governance risks detected on public records.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
