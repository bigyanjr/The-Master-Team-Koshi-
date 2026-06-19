import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function AddProject() {
  const { wards, contractors, addProject } = useData();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    wardId: '',
    contractorId: '',
    title: '',
    category: 'Roads',
    description: '',
    budget: '',
    startDate: '',
    expectedEndDate: '',
    location: '',
    status: 'pending',
    progress: 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = addProject({
      ...form,
      budget: Number(form.budget),
      contractorId: form.contractorId || null,
      tenderId: null,
      progress: 0,
    });
    setSuccess(true);
    setTimeout(() => navigate(`/projects/${id}`), 1500);
  };

  const update = (field, value) => setForm({ ...form, [field]: value });

  return (
    <Card>
      <CardHeader
        title="Add New Project"
        subtitle="Create a ward project record for public tracking"
      />

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Project created! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Project Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              placeholder="e.g. Ward Road Resurfacing Phase 2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ward</label>
            <select
              required
              value={form.wardId}
              onChange={(e) => update('wardId', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <option value="">Select ward</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>Ward {w.number} — {w.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              {['Roads', 'Healthcare', 'Water Supply', 'Electrical', 'Parks', 'Drainage', 'Sanitation', 'Education', 'Transport'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Budget (₹)</label>
            <input
              required
              type="number"
              min="0"
              value={form.budget}
              onChange={(e) => update('budget', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              placeholder="5000000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contractor (optional)</label>
            <select
              value={form.contractorId}
              onChange={(e) => update('contractorId', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <option value="">Not assigned yet</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input
              required
              type="date"
              value={form.startDate}
              onChange={(e) => update('startDate', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Expected End Date</label>
            <input
              required
              type="date"
              value={form.expectedEndDate}
              onChange={(e) => update('expectedEndDate', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input
              required
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              placeholder="Street / area description"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
              placeholder="Project scope and objectives..."
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Create Project</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/admin')}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
