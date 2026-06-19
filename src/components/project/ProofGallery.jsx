import { Camera, CheckCircle, Clock } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatDate } from '../../utils/formatters';

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
      {proofs.map((proof) => (
        <div key={proof.id} className="rounded-xl overflow-hidden border border-slate-200 bg-white group">
          <div className="aspect-video bg-slate-100 overflow-hidden relative">
            <img
              src={proof.url}
              alt={proof.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute top-2 right-2">
              {proof.verified ? (
                <Badge color="emerald" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Verified
                </Badge>
              ) : (
                <Badge color="amber" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Pending
                </Badge>
              )}
            </div>
          </div>
          <div className="p-3">
            <h4 className="text-sm font-semibold text-slate-900">{proof.title}</h4>
            <p className="text-xs text-slate-500 mt-1">
              {formatDate(proof.uploadedDate)} · {proof.uploadedBy}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
