import { useData } from '../context/DataContext';
import Card, { CardHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { DataResponsibilityNotice } from '../components/admin/AdminActivityFeed';
import { formatDate, getWardByNo } from '../utils/formatters';
import { Link } from 'react-router-dom';
import { User, ExternalLink, Tag } from 'lucide-react';
import { getCitizenDisplayName, getComplaintCategoryLabel } from '../services/complaintService';

const REVIEW_STATUSES = ['Pending', 'Under Review', 'Verified', 'Resolved', 'Rejected'];

export default function AdminComplaints() {
  const { projects, wards, updateComplaintStatus } = useData();

  const allComplaints = projects.flatMap((p) =>
    (p.complaints ?? []).map((c) => ({
      ...c,
      projectId: p.id,
      projectTitle: p.title,
      wardNo: p.wardNo,
    }))
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const pendingCount = allComplaints.filter(
    (c) => c.status === 'Pending' || c.status === 'Under Review'
  ).length;

  return (
    <div className="space-y-6">
      <DataResponsibilityNotice />

      <Card padding={false}>
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-start justify-between gap-4">
          <CardHeader
            title="Review Complaints"
            subtitle={`${pendingCount} complaint(s) awaiting ward action`}
            className="!mb-0"
          />
          <Link to="/complaints">
            <Button variant="secondary" size="sm" icon={ExternalLink}>
              Public complaints page
            </Button>
          </Link>
        </div>

        {allComplaints.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No complaints filed yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {allComplaints.map((c, i) => {
              const ward = getWardByNo(wards, c.wardNo);
              return (
                <div key={`${c.projectId}-${c.createdAt}-${i}`} className="p-5 sm:p-6 hover:bg-slate-50/50">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={c.status} />
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        <Tag className="h-3 w-3" />
                        {getComplaintCategoryLabel(c.category)}
                      </span>
                      <span className="text-xs text-slate-500">Ward {c.wardNo} · {ward?.name}</span>
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                  </div>
                  <Link to={`/projects/${c.projectId}`} className="text-sm font-semibold text-brand-700 hover:underline">
                    {c.projectTitle}
                  </Link>
                  <p className="text-sm text-slate-700 mt-2 leading-relaxed">{c.message}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                    <User className="h-3 w-3" /> {getCitizenDisplayName(c.citizenName)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="text-xs font-medium text-slate-500">Update status:</span>
                    {REVIEW_STATUSES.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updateComplaintStatus({
                          projectId: c.projectId,
                          complaintCreatedAt: c.createdAt,
                          status,
                        })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          c.status === status
                            ? 'bg-brand-700 text-white border-brand-700'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
