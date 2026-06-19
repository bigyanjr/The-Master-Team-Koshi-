import { Receipt, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';

function getPaymentProofStatus(payment, proofs) {
  if (!proofs.length) {
    return { label: 'No proof', color: 'red', icon: XCircle };
  }
  const paymentDate = new Date(payment.date);
  const hasMatchingProof = proofs.some((p) => new Date(p.uploadedAt) >= paymentDate);
  if (hasMatchingProof) {
    return { label: 'Proof on record', color: 'emerald', icon: CheckCircle2 };
  }
  return { label: 'Awaiting proof', color: 'amber', icon: Clock };
}

function PaymentMobileCard({ payment, proofs }) {
  const proofStatus = getPaymentProofStatus(payment, proofs);
  const ProofIcon = proofStatus.icon;

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
      <div className="flex justify-between items-start gap-2">
        <p className="font-bold text-brand-950">{formatCurrency(payment.amount)}</p>
        <Badge color={proofStatus.color}>
          <span className="inline-flex items-center gap-1">
            <ProofIcon className="h-3 w-3" />
            {proofStatus.label}
          </span>
        </Badge>
      </div>
      <p className="text-sm font-medium text-slate-800">{payment.milestone}</p>
      <p className="text-xs text-slate-500">{formatDate(payment.date)}</p>
      {payment.remarks && (
        <p className="text-xs text-slate-500 leading-relaxed">{payment.remarks}</p>
      )}
    </div>
  );
}

export default function PaymentTable({ payments, proofs = [] }) {
  if (!payments.length) {
    return (
      <EmptyState
        icon={Receipt}
        title="No payment records"
        description="Payment releases will appear here when ward officials publish them."
        compact
      />
    );
  }

  const total = payments.reduce((s, p) => s + p.amount, 0);
  const sorted = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      {/* Mobile cards */}
      <div className="md:hidden p-4 space-y-3">
        {sorted.map((payment, i) => (
          <PaymentMobileCard key={`${payment.date}-${i}`} payment={payment} proofs={proofs} />
        ))}
        <div className="flex justify-between items-center pt-2 text-sm border-t border-slate-100">
          <span className="text-slate-500">{sorted.length} release(s)</span>
          <span className="font-bold text-brand-950">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto -mx-px">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90">
              <th className="px-4 sm:px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Milestone</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Remarks</th>
              <th className="px-4 sm:px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Proof</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((payment, i) => {
              const proofStatus = getPaymentProofStatus(payment, proofs);
              const ProofIcon = proofStatus.icon;
              return (
                <tr key={`${payment.date}-${payment.amount}-${i}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 sm:px-6 py-3.5 text-slate-600 whitespace-nowrap tabular-nums">{formatDate(payment.date)}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap tabular-nums">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-3.5 text-slate-800 font-medium max-w-[200px]">{payment.milestone}</td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs hidden lg:table-cell max-w-[220px] leading-relaxed">{payment.remarks || '—'}</td>
                  <td className="px-4 sm:px-6 py-3.5">
                    <Badge color={proofStatus.color}>
                      <span className="inline-flex items-center gap-1">
                        <ProofIcon className="h-3 w-3" />
                        {proofStatus.label}
                      </span>
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="hidden md:flex flex-wrap justify-between items-center gap-2 px-4 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50/80">
        <span className="text-xs font-medium text-slate-500">{sorted.length} release(s)</span>
        <div className="text-sm">
          <span className="text-slate-500">Total: </span>
          <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
