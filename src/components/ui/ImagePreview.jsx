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
      <div className={`overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 ${className}`}>
        <img
          src={url}
          alt={alt || fileName || 'Preview'}
          className={compact ? 'h-24 w-full object-cover' : 'w-full max-h-64 object-cover'}
        />
        {(fileName || fileSize) && (
          <div className="px-3 py-2 border-t border-slate-100 bg-white text-xs text-slate-500 flex justify-between gap-2 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400">
            <span className="truncate font-medium text-slate-700 dark:text-slate-200">{fileName}</span>
            {fileSize ? <span className="shrink-0">{formatFileSize(fileSize)}</span> : null}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 ${className}`}>
      <div className="h-14 w-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 dark:bg-slate-900 dark:border-slate-700">
        <FileText className="h-7 w-7 text-brand-700 dark:text-emerald-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 truncate dark:text-slate-100">{fileName || 'Document'}</p>
        <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">
          PDF document{fileSize ? ` · ${formatFileSize(fileSize)}` : ''}
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-xs font-semibold text-brand-700 hover:text-brand-800 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          Open document
        </a>
      </div>
    </div>
  );
}
