import { Receipt, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Badge from '../ui/Badge';
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

export default function PaymentTable({ payments, proofs = [] }) {
  if (!payments.length) {
    return (
      <div className="text-center py-10 text-sm text-slate-500">
        <Receipt className="h-10 w-10 mx-auto text-slate-300 mb-3" />
        No payment records yet.
      </div>
    );
  }

  const total = payments.reduce((s, p) => s + p.amount, 0);
  const sorted = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-100 text-left bg-slate-50/80">
              <th className="px-4 sm:px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Date</th>
              <th className="px-3 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Amount</th>
              <th className="px-3 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Milestone</th>
              <th className="px-3 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Remarks</th>
              <th className="px-4 sm:px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Proof Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((payment, i) => {
              const proofStatus = getPaymentProofStatus(payment, proofs);
              const ProofIcon = proofStatus.icon;
              return (
                <tr key={`${payment.date}-${payment.amount}-${i}`} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 sm:px-6 py-4 text-slate-600 whitespace-nowrap">{formatDate(payment.date)}</td>
                  <td className="px-3 py-4 font-bold text-slate-900 whitespace-nowrap">{formatCurrency(payment.amount)}</td>
                  <td className="px-3 py-4 text-slate-800 font-medium max-w-[180px]">{payment.milestone}</td>
                  <td className="px-3 py-4 text-slate-500 text-xs hidden md:table-cell max-w-[200px]">{payment.remarks || '—'}</td>
                  <td className="px-4 sm:px-6 py-4">
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
      <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50">
        <span className="text-xs text-slate-500">{sorted.length} payment release(s)</span>
        <div className="text-sm">
          <span className="text-slate-500">Total Released: </span>
          <span className="font-bold text-slate-900">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
