import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function AddProject() {
  const { wards, addProject } = useData();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    wardNo: '',
    title: '',
    category: 'Roads',
    description: '',
    allocatedBudget: '',
    tenderAmount: '',
    contractorName: '',
    startDate: '',
    deadline: '',
    location: '',
    status: 'Planned',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = addProject(form);
    setSuccess(true);
    setTimeout(() => navigate(`/projects/${id}`), 1500);
  };

  const update = (field, value) => setForm({ ...form, [field]: value });

  return (
    <Card>
      <CardHeader title="Add New Project" subtitle="Create a ward project record for public tracking" />

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
            <input required value={form.title} onChange={(e) => update('title', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              placeholder="e.g. Ward Road Resurfacing Phase 2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ward</label>
            <select required value={form.wardNo} onChange={(e) => update('wardNo', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30">
              <option value="">Select ward</option>
              {wards.map((w) => (
                <option key={w.id} value={w.number}>Ward {w.number} — {w.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select value={form.category} onChange={(e) => update('category', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30">
              {['Roads', 'Drainage', 'Electrical', 'Education', 'Healthcare', 'Water Supply', 'Sanitation', 'Parks', 'Footpath', 'Digital Infrastructure'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Allocated Budget (NPR)</label>
            <input required type="number" min="0" value={form.allocatedBudget} onChange={(e) => update('allocatedBudget', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" placeholder="5000000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tender Amount (NPR)</label>
            <input type="number" min="0" value={form.tenderAmount} onChange={(e) => update('tenderAmount', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" placeholder="Same as budget if unknown" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contractor (optional)</label>
            <input value={form.contractorName} onChange={(e) => update('contractorName', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" placeholder="Contractor name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select value={form.status} onChange={(e) => update('status', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30">
              {['Planned', 'Tender Open', 'Ongoing', 'Completed', 'Delayed'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input required type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
            <input required type="date" value={form.deadline} onChange={(e) => update('deadline', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input required value={form.location} onChange={(e) => update('location', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" placeholder="Street / area description" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea required rows={4} value={form.description} onChange={(e) => update('description', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none" placeholder="Project scope and objectives..." />
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
