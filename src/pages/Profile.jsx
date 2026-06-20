import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, Shield, Phone, Calendar, LogOut, MessageSquareHeart, FolderKanban, Briefcase, CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Button from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { formatDate } from '../utils/formatters';
import { getAllComplaints } from '../utils/riskEngine';
import { getComplaintCategoryLabel } from '../services/complaintService';
import { ROLES } from '../services/authService';

function ProfileField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
      <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-900 mt-0.5 break-words">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const { profile, logout, isWardAdmin, isApprovedWardAdmin } = useAuth();
  const { projects } = useData();

  const myComplaints = useMemo(() => {
    if (!profile || profile.role !== ROLES.PUBLIC) return [];

    return getAllComplaints(projects)
      .filter((c) => {
        if (c.submittedByUid && profile.uid) return c.submittedByUid === profile.uid;
        if (profile.email && c.email) {
          return c.email.toLowerCase() === profile.email.toLowerCase();
        }
        if (profile.fullName && c.citizenName) {
          return c.citizenName.toLowerCase() === profile.fullName.toLowerCase();
        }
        return false;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [projects, profile]);

  const roleLabel = isWardAdmin ? 'Ward IT/Admin' : 'Public Citizen';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="dashboard-bg min-h-screen">
      <div className="page-container py-8 sm:py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-4">
              <User className="h-3.5 w-3.5" />
              Your account
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Profile
            </h1>
            <p className="text-slate-500 mt-2 max-w-xl leading-relaxed">
              Manage your WardWatch Itahari account
              {profile?.role === ROLES.PUBLIC ? ' and view complaints you have submitted.' : '.'}
            </p>
          </div>
          <Button variant="secondary" size="sm" icon={LogOut} onClick={handleLogout}>
            Sign out
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 card-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-600 to-emerald-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {profile?.fullName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-slate-900 truncate">{profile?.fullName}</p>
                  <span className={`inline-flex mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                    isWardAdmin ? 'bg-brand-900 text-emerald-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {roleLabel}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <ProfileField icon={Mail} label="Email" value={profile?.email} />
                <ProfileField icon={Shield} label="Role" value={roleLabel} />
                {profile?.wardNo && (
                  <ProfileField
                    icon={FolderKanban}
                    label="Ward number"
                    value={`Ward ${profile.wardNo}`}
                  />
                )}
                {isWardAdmin && (
                  <>
                    <ProfileField
                      icon={CheckCircle}
                      label="Status"
                      value={profile?.approved ? 'Approved' : 'Pending'}
                    />
                    {profile?.positionTitle && (
                      <ProfileField icon={Briefcase} label="Position" value={profile.positionTitle} />
                    )}
                    {profile?.municipality && (
                      <ProfileField icon={Shield} label="Municipality" value={profile.municipality} />
                    )}
                  </>
                )}
                {profile?.phone && (
                  <ProfileField icon={Phone} label="Phone" value={profile.phone} />
                )}
                <ProfileField
                  icon={Calendar}
                  label="Member since"
                  value={profile?.createdAt ? formatDate(profile.createdAt) : '—'}
                />
              </div>

              {isApprovedWardAdmin && (
                <Link to="/admin" className="block mt-6">
                  <Button variant="primary" size="sm" icon={Shield} className="w-full">
                    Go to Ward Admin Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {profile?.role === ROLES.PUBLIC && (
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden card-shadow">
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-brand-50/60 to-slate-50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-brand-100 text-brand-700">
                      <MessageSquareHeart className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">My submitted complaints</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Feedback linked to your account</p>
                    </div>
                  </div>
                  <Link to="/complaints">
                    <Button variant="secondary" size="sm">Submit new</Button>
                  </Link>
                </div>

                <div className="p-6">
                  {myComplaints.length === 0 ? (
                    <EmptyState
                      icon={MessageSquareHeart}
                      title="No complaints yet"
                      description="When you submit feedback while signed in, it will appear here so you can track review status."
                      action={(
                        <Link to="/complaints">
                          <Button variant="primary" size="sm">Submit feedback</Button>
                        </Link>
                      )}
                    />
                  ) : (
                    <div className="space-y-4">
                      {myComplaints.map((complaint) => {
                        const project = projects.find((p) => p.id === complaint.projectId);

                        return (
                          <article
                            key={`${complaint.projectId}-${complaint.id || complaint.createdAt}`}
                            className="rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors"
                          >
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <StatusBadge status={complaint.status} />
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                {getComplaintCategoryLabel(complaint.category)}
                              </span>
                              <span className="text-xs text-slate-400 ml-auto">
                                {formatDate(complaint.createdAt)}
                              </span>
                            </div>
                            {project && (
                              <Link
                                to={`/projects/${complaint.projectId}`}
                                className="text-sm font-semibold text-brand-700 hover:underline"
                              >
                                {project.title}
                              </Link>
                            )}
                            <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-3">
                              {complaint.message}
                            </p>
                            {project && (
                              <p className="text-xs text-slate-400 mt-2">Ward {project.wardNo}</p>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
