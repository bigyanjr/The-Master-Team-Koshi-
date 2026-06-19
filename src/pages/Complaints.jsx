import { useState } from 'react';
import { MessageSquareWarning, Send } from 'lucide-react';
import { useData } from '../context/DataContext';
import Card, { CardHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { formatDate, getWardByNo } from '../utils/formatters';
import { getAllComplaints } from '../utils/riskEngine';

export default function Complaints() {
  const { projects, wards, addComplaint } = useData();
  const complaints = getAllComplaints(projects);

  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    citizenName: '',
    projectId: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addComplaint(form);
    setSubmitted(true);
    setShowForm(false);
    setForm({ citizenName: '', projectId: '', message: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Citizen Complaints</h1>
          <p className="text-slate-500 mt-1">Report concerns about ward projects and budget transparency</p>
        </div>
        <Button icon={MessageSquareWarning} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'File a Complaint'}
        </Button>
      </div>

      {submitted && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
          Your complaint has been submitted and is now publicly visible on the linked project.
        </div>
      )}

      {showForm && (
        <Card className="mb-8">
          <CardHeader title="New Complaint" subtitle="All submissions are publicly visible for transparency" />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                <input
                  required
                  value={form.citizenName}
                  onChange={(e) => setForm({ ...form, citizenName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Related Project</label>
                <select
                  required
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                >
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>Ward {p.wardNo} — {p.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
                placeholder="Describe your concern in detail..."
              />
            </div>
            <Button type="submit" icon={Send}>Submit Complaint</Button>
          </form>
        </Card>
      )}

      {complaints.length === 0 ? (
        <EmptyState
          icon={MessageSquareWarning}
          title="No complaints yet"
          description="Be the first to raise a transparency concern."
          actionLabel="File a Complaint"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint, i) => {
            const project = projects.find((p) => p.id === complaint.projectId);
            const ward = project ? getWardByNo(wards, project.wardNo) : null;
            return (
              <Card key={`${complaint.projectId}-${complaint.createdAt}-${i}`}>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <StatusBadge status={complaint.status} />
                  <span className="text-xs text-slate-400">{formatDate(complaint.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{complaint.message}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-slate-500">
                  <span>By: {complaint.citizenName}</span>
                  {ward && <span>Ward {ward.number} — {ward.name}</span>}
                  {project && <span>Project: {project.title}</span>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
