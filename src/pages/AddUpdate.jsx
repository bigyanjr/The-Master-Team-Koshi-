import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';

export default function AddUpdate() {
  const { projects, addUpdate } = useData();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    projectId: '',
    title: '',
    description: '',
    progressAfter: '',
    postedBy: 'Ward Admin',
    date: new Date().toISOString().split('T')[0],
  });

  const selectedProject = projects.find((p) => p.id === form.projectId);

  const handleSubmit = (e) => {
    e.preventDefault();
    addUpdate({
      ...form,
      progressAfter: Number(form.progressAfter),
    });
    setSuccess(true);
    setTimeout(() => navigate(`/projects/${form.projectId}`), 1500);
  };

  const update = (field, value) => setForm({ ...form, [field]: value });

  return (
    <Card>
      <CardHeader
        title="Post Progress Update"
        subtitle="Share milestone progress with citizens publicly"
      />

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Update posted! Redirecting to project...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
          <select
            required
            value={form.projectId}
            onChange={(e) => update('projectId', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title} ({p.progress}%)</option>
            ))}
          </select>
        </div>

        {selectedProject && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 mb-2">Current progress</p>
            <ProgressBar value={selectedProject.progress} />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Update Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              placeholder="e.g. Phase 2 foundation complete"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Progress After Update (%)</label>
            <input
              required
              type="number"
              min="0"
              max="100"
              value={form.progressAfter}
              onChange={(e) => update('progressAfter', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              placeholder="0–100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => update('date', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Posted By</label>
            <input
              required
              value={form.postedBy}
              onChange={(e) => update('postedBy', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              placeholder="Department or official name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
            placeholder="Describe work completed, inspections passed, next steps..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Post Update</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/admin')}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
