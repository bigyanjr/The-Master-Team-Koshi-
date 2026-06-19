import { FileText } from 'lucide-react';
import { formatFileSize, isImageFileType, resolveFileUrl } from '../../services/uploadService';

export default function ImagePreview({
  fileUrl,
  fileName,
  fileType,
  fileSize,
  alt = 'Uploaded file preview',
  className = '',
  compact = false,
}) {
  const url = fileUrl || resolveFileUrl({ fileUrl });
  const isImage = isImageFileType(fileType) || url?.startsWith('data:image') || /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url || '');

  if (!url) return null;

  if (isImage) {
    return (
      <div className={`overflow-hidden rounded-xl border border-slate-200 bg-slate-50 ${className}`}>
        <img
          src={url}
          alt={alt || fileName || 'Preview'}
          className={compact ? 'h-24 w-full object-cover' : 'w-full max-h-64 object-cover'}
        />
        {(fileName || fileSize) && (
          <div className="px-3 py-2 border-t border-slate-100 bg-white text-xs text-slate-500 flex justify-between gap-2">
            <span className="truncate font-medium text-slate-700">{fileName}</span>
            {fileSize ? <span className="shrink-0">{formatFileSize(fileSize)}</span> : null}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 ${className}`}>
      <div className="h-14 w-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
        <FileText className="h-7 w-7 text-brand-700" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 truncate">{fileName || 'Document'}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          PDF document{fileSize ? ` · ${formatFileSize(fileSize)}` : ''}
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-xs font-semibold text-brand-700 hover:text-brand-800"
        >
          Open document
        </a>
      </div>
    </div>
  );
}
