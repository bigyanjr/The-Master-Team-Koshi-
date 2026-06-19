import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import FileUpload from '../components/ui/FileUpload';
import { DataResponsibilityNotice } from '../components/admin/AdminActivityFeed';

const PROOF_TYPES = [
  { value: 'before', label: 'Before Work' },
  { value: 'during', label: 'During Work' },
  { value: 'after', label: 'After Work' },
  { value: 'document', label: 'Document' },
];

export default function UploadProof() {
  const { projects, addProof } = useData();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [form, setForm] = useState({
    projectId: '',
    title: '',
    type: 'during',
    uploadedAt: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofFile?.fileUrl) {
      setFileError('Please upload a proof image or document');
      return;
    }

    setFileError('');
    await addProof({
      ...form,
      ...proofFile,
      uploadedBy: profile?.uid || null,
    });
    setSuccess(true);
    setTimeout(() => navigate('/admin'), 1500);
  };

  const update = (field, value) => setForm({ ...form, [field]: value });

  return (
    <div className="space-y-6 max-w-2xl">
      <DataResponsibilityNotice />
      <Card>
        <CardHeader title="Upload Proof" subtitle="Add photo or document proof for citizen verification" />

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Proof uploaded! Returning to dashboard…
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
            <select required value={form.projectId} onChange={(e) => update('projectId', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30">
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>W{p.wardNo} — {p.title}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Proof Type</label>
              <select value={form.type} onChange={(e) => update('type', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30">
                {PROOF_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Upload Date</label>
              <input required type="date" value={form.uploadedAt} onChange={(e) => update('uploadedAt', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title / Description</label>
            <input required value={form.title} onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Road resurfacing — Sector A complete"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
          <FileUpload
            id="standaloneProofFile"
            label="Proof file"
            hint="Drop image or PDF here"
            value={proofFile}
            onChange={(file) => {
              setProofFile(file);
              setFileError('');
            }}
            error={fileError}
            storageFolder="proofs"
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit">Publish Proof</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/admin')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
