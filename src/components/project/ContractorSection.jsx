import { HardHat, Calendar, Banknote, MapPin } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function ContractorSection({ project }) {
  return (
    <Card>
      <CardHeader title="Contractor Details" subtitle="Awarded vendor and contract terms" />
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-sm shrink-0">
          <HardHat className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Contractor Name</p>
            <p className="font-semibold text-slate-900 mt-1">
              {project.contractorName || 'Not yet assigned'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <Banknote className="h-3 w-3" /> Contract Amount
            </p>
            <p className={`font-semibold mt-1 ${project.tenderAmount > project.allocatedBudget ? 'text-red-600' : 'text-slate-900'}`}>
              {formatCurrency(project.tenderAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Start Date
            </p>
            <p className="font-medium text-slate-800 mt-1">{formatDate(project.startDate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Deadline
            </p>
            <p className="font-medium text-slate-800 mt-1">{formatDate(project.deadline)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Work Location
            </p>
            <p className="font-medium text-slate-800 mt-1">{project.location}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
