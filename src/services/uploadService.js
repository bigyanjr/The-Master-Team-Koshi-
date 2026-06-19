import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirebaseApp, isFirebaseConfigured } from '../firebase/config';

export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const UPLOAD_ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
export const UPLOAD_ACCEPT_STRING = UPLOAD_ACCEPT.join(',');

const EXTENSION_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

let storageInstance = null;

function getFirebaseStorage() {
  if (!isFirebaseConfigured()) return null;
  if (!storageInstance) {
    const app = getFirebaseApp();
    if (app) storageInstance = getStorage(app);
  }
  return storageInstance;
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageFileType(fileType) {
  return Boolean(fileType?.startsWith('image/'));
}

/** Resolve URL from proof, complaint evidence, or legacy fields. */
export function resolveFileUrl(item) {
  if (!item) return null;
  if (item.evidence?.fileUrl) return item.evidence.fileUrl;
  return item.fileUrl || item.url || item.evidenceUrl || null;
}

export function resolveFileName(item) {
  if (!item) return null;
  if (item.evidence?.fileName) return item.evidence.fileName;
  return item.fileName || item.evidenceFileName || null;
}

export function resolveFileType(item) {
  if (!item) return null;
  if (item.evidence?.fileType) return item.evidence.fileType;
  return item.fileType || null;
}

export function validateUploadFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (!UPLOAD_ACCEPT.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, WEBP images and PDF documents are allowed' };
  }

  if (file.size > UPLOAD_MAX_BYTES) {
    return { valid: false, error: `File must be ${formatFileSize(UPLOAD_MAX_BYTES)} or smaller` };
  }

  return { valid: true, error: null };
}

function sanitizeFileName(name) {
  return name.replace(/[^\w.\-() ]+/g, '_').replace(/\s+/g, '-');
}

function buildStoragePath(folder, file) {
  const ext = EXTENSION_BY_TYPE[file.type] || 'bin';
  const base = sanitizeFileName(file.name.replace(/\.[^.]+$/, '')).slice(0, 48);
  return `wardwatch/${folder}/${Date.now()}-${base}.${ext}`;
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * @returns {Promise<{ fileUrl: string, fileName: string, fileType: string, fileSize: number, isLocal: boolean }>}
 */
export async function uploadFile(file, { folder = 'uploads', onProgress } = {}) {
  const validation = validateUploadFile(file);
  if (!validation.valid) {
    const err = new Error(validation.error);
    err.code = 'upload/invalid-file';
    throw err;
  }

  const baseResult = {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  };

  const storage = getFirebaseStorage();

  if (storage) {
    try {
      const path = buildStoragePath(folder, file);
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata: { originalName: file.name },
      });

      await new Promise((resolve, reject) => {
        task.on(
          'state_changed',
          (snapshot) => {
            if (onProgress && snapshot.totalBytes > 0) {
              onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
            }
          },
          reject,
          resolve,
        );
      });

      const downloadUrl = await getDownloadURL(task.snapshot.ref);
      if (onProgress) onProgress(100);

      return {
        ...baseResult,
        fileUrl: downloadUrl,
        isLocal: false,
      };
    } catch (error) {
      console.warn('[WardWatch] Firebase Storage upload failed; using local preview.', error);
    }
  }

  const dataUrl = await readFileAsDataUrl(file);
  if (onProgress) onProgress(100);

  return {
    ...baseResult,
    fileUrl: dataUrl,
    isLocal: true,
  };
}

export function isStorageAvailable() {
  return Boolean(getFirebaseStorage());
}
