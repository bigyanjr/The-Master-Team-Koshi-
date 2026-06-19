import { Receipt } from 'lucide-react';
import { StatusBadge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function PaymentTable({ payments }) {
  if (!payments.length) {
    return (
      <div className="text-center py-8 text-sm text-slate-500">
        <Receipt className="h-8 w-8 mx-auto text-slate-300 mb-2" />
        No payment records yet.
      </div>
    );
  }

  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <div className="overflow-x-auto -mx-5 sm:-mx-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="px-5 sm:px-6 py-3 font-medium text-slate-500">Date</th>
              <th className="px-3 py-3 font-medium text-slate-500">Milestone</th>
              <th className="px-3 py-3 font-medium text-slate-500">Reference</th>
              <th className="px-3 py-3 font-medium text-slate-500 text-right">Amount</th>
              <th className="px-5 sm:px-6 py-3 font-medium text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="px-5 sm:px-6 py-3 text-slate-600 whitespace-nowrap">{formatDate(payment.date)}</td>
                <td className="px-3 py-3 text-slate-800 font-medium">{payment.milestone}</td>
                <td className="px-3 py-3 text-slate-500 font-mono text-xs">{payment.referenceNo}</td>
                <td className="px-3 py-3 text-right font-semibold text-slate-900">{formatCurrency(payment.amount)}</td>
                <td className="px-5 sm:px-6 py-3"><StatusBadge status={payment.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end px-5 sm:px-6 pt-4 border-t border-slate-100">
        <div className="text-sm">
          <span className="text-slate-500">Total Released: </span>
          <span className="font-bold text-slate-900">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
