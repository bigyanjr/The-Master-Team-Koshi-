import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  AlertTriangle, Database, HardDrive, RefreshCw, Trash2, CheckCircle,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import {
  isDevResetEnabled,
  FIREBASE_AUTH_RESET_NOTE,
  FIREBASE_STORAGE_RESET_NOTE,
} from '../services/resetService';
import { FRESH_PROJECT_TITLES } from '../services/seedService';

function ResultLog({ result }) {
  if (!result) return null;
  return (
    <pre className="mt-4 p-4 rounded-xl bg-slate-900 text-emerald-300 text-xs overflow-x-auto max-h-64">
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

export default function DevReset() {
  const {
    firebaseEnabled,
    devClearLocalDemoData,
    devSeedFreshItahariData,
    devResetAndSeedFreshData,
  } = useData();
  const { logout, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [lastResult, setLastResult] = useState(null);

  if (!isDevResetEnabled()) {
    return <Navigate to="/" replace />;
  }

  const runAction = async (key, action, successMsg) => {
    setLoading(key);
    setError('');
    setMessage('');
    try {
      const result = await action();
      if (isAuthenticated) await logout();
      setLastResult(result);
      setMessage(successMsg);
    } catch (err) {
      setError(err.message || 'Reset failed.');
      setLastResult(null);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen dashboard-bg">
      <div className="page-container py-10 max-w-2xl">
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 sm:p-6 mb-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
            <div>
              <h1 className="text-lg font-bold text-amber-950">Development reset</h1>
              <p className="text-sm text-amber-900 mt-2 leading-relaxed">
                This will clear WardWatch demo data. Use only during development.
                You will be signed out after each action.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 card-shadow space-y-4">
          <p className="text-sm text-slate-600">
            Mode: {firebaseEnabled ? 'Firebase + local fallback' : 'Local fallback only'}
          </p>

          <div className="space-y-3">
            <Button
              variant="secondary"
              className="w-full justify-start"
              icon={HardDrive}
              disabled={Boolean(loading)}
              onClick={() => runAction(
                'local',
                devClearLocalDemoData,
                'Local demo data cleared and fresh seed loaded in memory.',
              )}
            >
              {loading === 'local' ? 'Clearing…' : 'Clear Local Demo Data'}
            </Button>

            <Button
              variant="secondary"
              className="w-full justify-start"
              icon={Database}
              disabled={Boolean(loading)}
              onClick={() => runAction(
                'seed',
                devSeedFreshItahariData,
                'Fresh Itahari demo data seeded.',
              )}
            >
              {loading === 'seed' ? 'Seeding…' : 'Seed Fresh Itahari Demo Data'}
            </Button>

            <Button
              variant="primary"
              className="w-full justify-start"
              icon={RefreshCw}
              disabled={Boolean(loading)}
              onClick={() => runAction(
                'reset',
                devResetAndSeedFreshData,
                'Demo data reset complete. Fresh Itahari seed applied.',
              )}
            >
              {loading === 'reset' ? 'Resetting…' : 'Reset and Seed Fresh Data'}
            </Button>
          </div>

          {message && (
            <div className="flex gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {message}
            </div>
          )}

          {error && (
            <div className="flex gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
              <Trash2 className="h-4 w-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <ResultLog result={lastResult} />
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 card-shadow space-y-4 text-sm text-slate-600">
          <h2 className="font-bold text-slate-900">Firebase manual steps</h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>{FIREBASE_AUTH_RESET_NOTE}</li>
            <li>{FIREBASE_STORAGE_RESET_NOTE}</li>
            <li>Firestore collections cleared by reset (not Auth users).</li>
          </ul>

          <h2 className="font-bold text-slate-900 pt-2">Fresh seed includes</h2>
          <p>Itahari Sub-Metropolitan City · Koshi Province · FY 2081/82 Demo</p>
          <p>Wards 1–5 · {FRESH_PROJECT_TITLES.length} projects:</p>
          <ul className="text-xs space-y-1 text-slate-500">
            {FRESH_PROJECT_TITLES.map((title) => (
              <li key={title}>• {title}</li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/" className="font-semibold text-brand-700 hover:text-brand-800">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
