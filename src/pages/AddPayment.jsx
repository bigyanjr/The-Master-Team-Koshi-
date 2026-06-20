import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { DataResponsibilityNotice } from '../components/admin/AdminActivityFeed';
import { filterProjectsForAdmin, canEditProject } from '../utils/permissions';

export default function AddPayment() {
  const { projects, addPayment } = useData();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const wardProjects = filterProjectsForAdmin(projects, profile);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    projectId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    milestone: '',
    remarks: '',
  });

  const [authError, setAuthError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const project = projects.find((p) => p.id === form.projectId);
    if (!canEditProject(profile, project)) {
      setAuthError('You are not authorised to manage this ward record.');
      return;
    }
    setAuthError('');
    await addPayment(form, { uid: profile?.uid });
    setSuccess(true);
    setTimeout(() => navigate('/admin'), 1500);
  };

  const update = (field, value) => setForm({ ...form, [field]: value });

  return (
    <div className="space-y-6 max-w-2xl">
      <DataResponsibilityNotice />
      <Card>
        <CardHeader title="Add Payment Update" subtitle="Record a milestone payment — visible to citizens immediately" />

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Payment recorded! Returning to dashboard…
          </div>
        )}

        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
            <select required value={form.projectId} onChange={(e) => update('projectId', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30">
              <option value="">Select project</option>
              {wardProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (NPR)</label>
              <input required type="number" min="0" value={form.amount} onChange={(e) => update('amount', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
              <input required type="date" value={form.date} onChange={(e) => update('date', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Milestone</label>
            <input required value={form.milestone} onChange={(e) => update('milestone', e.target.value)}
              placeholder="e.g. Phase 2 completion (30%)"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
            <textarea rows={3} value={form.remarks} onChange={(e) => update('remarks', e.target.value)}
              placeholder="Official remarks for public record…"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit">Publish Payment</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/admin')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
