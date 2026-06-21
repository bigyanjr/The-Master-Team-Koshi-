import { useRef, useState, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import ImagePreview from './ImagePreview';
import { FieldError } from '../admin/FormSection';
import {
  uploadFile,
  UPLOAD_ACCEPT_STRING,
  UPLOAD_MAX_BYTES,
  formatFileSize,
  validateUploadFile,
  isStorageAvailable,
} from '../../services/uploadService';

/**
 * @typedef {{ fileUrl: string, fileName: string, fileType: string, fileSize: number, isLocal?: boolean }} UploadValue
 */

export default function FileUpload({
  id = 'file-upload',
  label,
  hint = 'Drop image or PDF here',
  value = null,
  onChange,
  error,
  disabled = false,
  storageFolder = 'uploads',
  className = '',
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localError, setLocalError] = useState('');

  const displayError = error || localError;

  const processFile = useCallback(async (file) => {
    if (!file || disabled) return;

    const validation = validateUploadFile(file);
    if (!validation.valid) {
      setLocalError(validation.error);
      return;
    }

    setLocalError('');
    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadFile(file, {
        folder: storageFolder,
        onProgress: setProgress,
      });
      onChange?.(result);
    } catch (err) {
      setLocalError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [disabled, onChange, storageFolder]);

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !uploading) setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleClear = () => {
    setLocalError('');
    setProgress(0);
    onChange?.(null);
  };

  const openBrowse = () => {
    if (!disabled && !uploading) inputRef.current?.click();
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
          {label}
        </label>
      )}

      {!value && !uploading ? (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openBrowse(); }}
          onClick={openBrowse}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            disabled
              ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
              : dragging
                ? 'border-brand-500 bg-brand-50/60 scale-[1.01] dark:border-emerald-500 dark:bg-emerald-950/30'
                : displayError
                  ? 'border-red-300 bg-red-50/40 hover:border-red-400 dark:border-red-800 dark:bg-red-950/20'
                  : 'border-slate-200 bg-slate-50/50 hover:border-brand-300 hover:bg-brand-50/30 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20'
          }`}
        >
          <div className="p-3 rounded-xl bg-white border border-slate-200 text-brand-700 shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:text-emerald-400">
            <Upload className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{hint}</p>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">or click to browse</p>
            <p className="text-xs text-slate-400 mt-2 dark:text-slate-500">
              JPEG, PNG, WEBP, PDF · max {formatFileSize(UPLOAD_MAX_BYTES)}
            </p>
            {!isStorageAvailable() && (
              <p className="text-xs text-amber-600 mt-2 font-medium dark:text-amber-400">
                Demo mode — file preview stored locally
              </p>
            )}
          </div>
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={UPLOAD_ACCEPT_STRING}
            onChange={handleInputChange}
            disabled={disabled}
            className="sr-only"
          />
        </div>
      ) : uploading ? (
        <div className="p-8 rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/40 text-center dark:border-emerald-800 dark:bg-emerald-950/20">
          <Loader2 className="h-8 w-8 mx-auto text-brand-700 animate-spin mb-3 dark:text-emerald-400" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Uploading…</p>
          <div className="mt-4 h-2 rounded-full bg-white border border-brand-100 overflow-hidden max-w-xs mx-auto dark:bg-slate-900 dark:border-emerald-900">
            <div
              className="h-full bg-brand-600 transition-all duration-200 dark:bg-emerald-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 dark:text-slate-400">{progress}%</p>
        </div>
      ) : (
        <div className="space-y-3">
          <ImagePreview
            fileUrl={value.fileUrl}
            fileName={value.fileName}
            fileType={value.fileType}
            fileSize={value.fileSize}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate dark:text-slate-200">{value.fileName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatFileSize(value.fileSize)}
                {value.isLocal ? ' · local preview' : ' · uploaded'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-100 transition-colors disabled:opacity-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950/30"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      )}

      <FieldError message={displayError} />
    </div>
  );
}
