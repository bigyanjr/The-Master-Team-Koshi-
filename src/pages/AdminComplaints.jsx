import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Card, { CardHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { DataResponsibilityNotice } from '../components/admin/AdminActivityFeed';
import { formatDate, getWardByNo } from '../utils/formatters';
import { Link } from 'react-router-dom';
import { User, ExternalLink, Tag } from 'lucide-react';
import { getCitizenDisplayName, getComplaintCategoryLabel } from '../services/complaintService';
import { filterComplaintsForAdmin, canReviewComplaint } from '../utils/permissions';

const REVIEW_STATUSES = ['Pending', 'Under Review', 'Verified', 'Resolved', 'Rejected'];

export default function AdminComplaints() {
  const { projects, wards, updateComplaintStatus } = useData();
  const { profile } = useAuth();

  const allComplaints = useMemo(
    () => filterComplaintsForAdmin(projects, profile)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [projects, profile],
  );

  const pendingCount = allComplaints.filter(
    (c) => c.status === 'Pending' || c.status === 'Under Review',
  ).length;

  const handleStatusChange = (complaint, status) => {
    if (!canReviewComplaint(profile, complaint)) return;
    const complaintId = complaint.id || `${complaint.projectId}-${complaint.createdAt}`;
    updateComplaintStatus(complaintId, status);
  };

  return (
    <div className="space-y-6">
      <DataResponsibilityNotice />

      <Card padding={false}>
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-start justify-between gap-4">
          <CardHeader
            title={`Ward ${profile?.wardNo} Complaints`}
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
          <p className="p-8 text-center text-sm text-slate-500">No complaints for your ward yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {allComplaints.map((complaint) => {
              const ward = getWardByNo(wards, complaint.wardNo);
              const complaintId = complaint.id || `${complaint.projectId}-${complaint.createdAt}`;

              return (
                <div key={complaintId} className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={complaint.status} />
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        <Tag className="h-3 w-3" />
                        {getComplaintCategoryLabel(complaint.category)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(complaint.createdAt)}</span>
                  </div>

                  <Link
                    to={`/projects/${complaint.projectId}`}
                    className="text-sm font-semibold text-brand-700 hover:underline"
                  >
                    {complaint.projectTitle}
                  </Link>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{complaint.message}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {getCitizenDisplayName(complaint.citizenName)}
                    </span>
                    {ward && <span>Ward {ward.number}</span>}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {REVIEW_STATUSES.map((status) => (
                      <Button
                        key={status}
                        variant={complaint.status === status ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleStatusChange(complaint, status)}
                      >
                        {status}
                      </Button>
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
