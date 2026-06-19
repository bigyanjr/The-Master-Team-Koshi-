import { useState } from 'react';
import { resolveFileUrl } from '../../services/uploadService';
import { Camera, FileText, ImageIcon } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatDate } from '../../utils/formatters';

const SECTIONS = [
  { type: 'before', label: 'Before Work', icon: Camera, gradient: 'from-slate-600 to-slate-800' },
  { type: 'during', label: 'During Work', icon: ImageIcon, gradient: 'from-blue-600 to-brand-800' },
  { type: 'after', label: 'After Work', icon: Camera, gradient: 'from-emerald-600 to-teal-800' },
  { type: 'document', label: 'Documents', icon: FileText, gradient: 'from-brand-700 to-indigo-900' },
];

const TYPE_COLORS = {
  before: 'slate',
  during: 'blue',
  after: 'emerald',
  document: 'brand',
};

function ProofCard({ proof, section }) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = resolveFileUrl(proof);

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white group hover:shadow-md transition-shadow">
      <div className="aspect-video relative overflow-hidden">
        <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${section.gradient}`}>
          <section.icon className="h-8 w-8 text-white/80 mb-2" />
          <span className="text-xs font-medium text-white/90 px-3 text-center line-clamp-2">{proof.title}</span>
        </div>
        {src && !imgFailed && (
          <img
            src={src}
            alt={proof.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        )}
        <div className="absolute top-2 left-2 z-10">
          <Badge color={TYPE_COLORS[proof.type] || 'slate'}>{section.label}</Badge>
        </div>
      </div>
      <div className="p-3">
        <h4 className="text-sm font-semibold text-slate-900 line-clamp-2">{proof.title}</h4>
        <p className="text-xs text-slate-500 mt-1">{formatDate(proof.uploadedAt)}</p>
      </div>
    </div>
  );
}

function EmptySection({ section }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center">
      <section.icon className="h-6 w-6 mx-auto text-slate-300 mb-2" />
      <p className="text-xs text-slate-400">No {section.label.toLowerCase()} proofs uploaded</p>
    </div>
  );
}

export default function ProofGallery({ proofs = [] }) {
  if (!proofs.length) {
    return (
      <div className="text-center py-12 text-sm text-slate-500 rounded-xl border border-dashed border-slate-200 bg-slate-50">
        <Camera className="h-10 w-10 mx-auto text-slate-300 mb-3" />
        <p className="font-medium text-slate-600">No proof documents uploaded yet</p>
        <p className="text-xs text-slate-400 mt-1">Before, during, after photos and documents will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {SECTIONS.map((section) => {
        const items = proofs.filter((p) => p.type === section.type);
        return (
          <div key={section.type}>
            <div className="flex items-center gap-2 mb-3">
              <section.icon className="h-4 w-4 text-slate-500" />
              <h4 className="text-sm font-semibold text-slate-800">{section.label}</h4>
              <span className="text-xs text-slate-400">({items.length})</span>
            </div>
            {items.length === 0 ? (
              <EmptySection section={section} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((proof, i) => (
                  <ProofCard key={`${proof.title}-${i}`} proof={proof} section={section} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
