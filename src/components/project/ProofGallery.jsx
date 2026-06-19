import { Camera } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatDate } from '../../utils/formatters';

const TYPE_COLORS = {
  before: 'slate',
  during: 'blue',
  after: 'emerald',
  document: 'brand',
};

const TYPE_LABELS = {
  before: 'Before',
  during: 'During',
  after: 'After',
  document: 'Document',
};

export default function ProofGallery({ proofs }) {
  if (!proofs.length) {
    return (
      <div className="text-center py-8 text-sm text-slate-500">
        <Camera className="h-8 w-8 mx-auto text-slate-300 mb-2" />
        No proof documents uploaded yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {proofs.map((proof, i) => (
        <div key={`${proof.title}-${i}`} className="rounded-xl overflow-hidden border border-slate-200 bg-white group">
          <div className="aspect-video bg-slate-100 overflow-hidden relative">
            <img
              src={proof.url}
              alt={proof.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute top-2 left-2">
              <Badge color={TYPE_COLORS[proof.type] || 'slate'}>
                {TYPE_LABELS[proof.type] || proof.type}
              </Badge>
            </div>
          </div>
          <div className="p-3">
            <h4 className="text-sm font-semibold text-slate-900">{proof.title}</h4>
            <p className="text-xs text-slate-500 mt-1">{formatDate(proof.uploadedAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
