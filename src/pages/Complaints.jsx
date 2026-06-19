import { useState } from 'react';
import { MessageSquareWarning, Send } from 'lucide-react';
import { useData } from '../context/DataContext';
import Card, { CardHeader } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { formatDate } from '../utils/formatters';

export default function Complaints() {
  const { complaints, wards, projects, addComplaint } = useData();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    citizenName: '',
    wardId: '',
    projectId: '',
    subject: '',
    description: '',
    category: 'Transparency',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addComplaint({
      ...form,
      projectId: form.projectId || null,
      wardId: form.wardId,
    });
    setSubmitted(true);
    setShowForm(false);
    setForm({ citizenName: '', wardId: '', projectId: '', subject: '', description: '', category: 'Transparency' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  const wardProjects = form.wardId
    ? projects.filter((p) => p.wardId === form.wardId)
    : projects;

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
          Your complaint has been submitted and is now publicly visible.
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Ward</label>
                <select
                  required
                  value={form.wardId}
                  onChange={(e) => setForm({ ...form, wardId: e.target.value, projectId: '' })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                >
                  <option value="">Select ward</option>
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>Ward {w.number} — {w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Related Project (optional)</label>
                <select
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                >
                  <option value="">General ward concern</option>
                  {wardProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                >
                  {['Transparency', 'Financial', 'Delay', 'Quality', 'Infrastructure', 'Water Supply'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                placeholder="Brief summary of your concern"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
                placeholder="Describe the issue in detail..."
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
          {complaints.map((complaint) => {
            const ward = wards.find((w) => w.id === complaint.wardId);
            const project = projects.find((p) => p.id === complaint.projectId);
            return (
              <Card key={complaint.id}>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={complaint.status} />
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{complaint.category}</span>
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(complaint.date)}</span>
                </div>
                <h3 className="font-semibold text-slate-900">{complaint.subject}</h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{complaint.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-slate-500">
                  <span>By: {complaint.citizenName}</span>
                  {ward && <span>Ward {ward.number} — {ward.name}</span>}
                  {project && <span>Project: {project.title}</span>}
                </div>
                {complaint.resolution && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-800">
                    <span className="font-medium">Resolution: </span>{complaint.resolution}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
