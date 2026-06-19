import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, User, Shield, AlertCircle, Info } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import Button from '../components/ui/Button';
import { inputClass } from '../components/admin/FormSection';
import { useAuth } from '../context/AuthContext';
import { getPostLoginPath, isWardAdmin } from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginDemo, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  const redirectTo = location.state?.from || null;
  const requiresAdmin = Boolean(
    location.state?.requiresAdmin || redirectTo?.startsWith('/admin'),
  );

  const finishLogin = async (profile) => {
    const wantsAdmin = requiresAdmin || redirectTo?.startsWith('/admin');

    if (wantsAdmin && !isWardAdmin(profile)) {
      await logout();
      setError('Ward Admin login required. Use admin@itahari.demo or sign in with a ward admin account.');
      return;
    }

    if (wantsAdmin && isWardAdmin(profile)) {
      navigate(redirectTo || '/admin', { replace: true });
      return;
    }

    navigate(redirectTo || getPostLoginPath(profile), { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const profile = await login(email, password);
      await finishLogin(profile);
    } catch (err) {
      setError(err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
        ? 'Invalid email or password.'
        : err.message || 'Could not sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (type) => {
    if (requiresAdmin && type !== 'admin') {
      setError('This page requires Ward Admin login. Use “Continue as Ward Admin”.');
      return;
    }

    setError('');
    setDemoLoading(type);

    try {
      const profile = await loginDemo(type);
      await finishLogin(profile);
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <AuthLayout
      title={requiresAdmin ? 'Ward Admin sign in' : 'Welcome back'}
      subtitle={
        requiresAdmin
          ? 'Sign in with a valid ward admin email and password to manage projects, payments, and complaints.'
          : 'Sign in to track Itahari ward projects, submit feedback, or manage ward records.'
      }
    >
      {requiresAdmin && (
        <div className="mb-5 flex gap-2.5 p-3.5 rounded-xl bg-brand-50 border border-brand-100 text-sm text-brand-900">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-brand-600" />
          <p className="leading-relaxed">
            Admin access is restricted. You must sign in with a Ward IT/Admin account — public citizen accounts cannot open the admin portal.
          </p>
        </div>
      )}

      {/* Quick demo login */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-brand-50 to-emerald-50/60 border border-brand-100">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-700 mb-3">
          Quick demo login
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {!requiresAdmin && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={User}
              className="w-full"
              disabled={Boolean(demoLoading || loading)}
              onClick={() => handleDemoLogin('citizen')}
            >
              {demoLoading === 'citizen' ? 'Signing in…' : 'Continue as Citizen'}
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={Shield}
            className={`w-full ${requiresAdmin ? 'sm:col-span-2' : ''}`}
            disabled={Boolean(demoLoading || loading)}
            onClick={() => handleDemoLogin('admin')}
          >
            {demoLoading === 'admin' ? 'Signing in…' : 'Continue as Ward Admin'}
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-medium text-slate-400">or sign in with email</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass(false)}
            placeholder={requiresAdmin ? 'admin@itahari.demo' : 'you@example.com'}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass(false)}
            placeholder="••••••••"
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          icon={LogIn}
          className="w-full"
          disabled={loading || Boolean(demoLoading)}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New here?{' '}
        <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
