import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, AlertCircle, Info } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import Button from '../components/ui/Button';
import { inputClass } from '../components/admin/FormSection';
import { useAuth } from '../context/AuthContext';
import {
  canAccessAdmin,
  getAdminAccessBlockReason,
  getUserHomeRoute,
  ROLES,
} from '../utils/permissions';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, getPostLoginPath } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from || null;
  const requiresAdmin = Boolean(
    location.state?.requiresAdmin || redirectTo?.startsWith('/admin'),
  );
  const deniedMessage = location.state?.message;

  const finishLogin = async (profile) => {
    const wantsAdmin = requiresAdmin || redirectTo?.startsWith('/admin');

    if (wantsAdmin && profile.role === ROLES.PUBLIC) {
      await logout();
      setError('You are not authorised to access ward admin records.');
      return;
    }

    if (wantsAdmin && !canAccessAdmin(profile)) {
      setError(getAdminAccessBlockReason(profile) || 'Ward admin access is not available for this account.');
      navigate(getUserHomeRoute(profile), { replace: true });
      return;
    }

    navigate(redirectTo || getPostLoginPath(), { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const profile = await login(identifier, password);
      await finishLogin(profile);
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid login ID or password.');
      } else if (err.code === 'auth/username-not-found') {
        setError('Username not found.');
      } else if (err.code === 'auth/ward-admin-not-found') {
        setError('Ward admin profile not found.');
      } else if (err.code === 'auth/incomplete-admin-profile') {
        setError('Your admin profile is incomplete.');
      } else {
        setError(err.message || 'Could not sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to track Itahari ward projects, submit feedback, or manage authorised ward records."
    >
      {requiresAdmin && (
        <div className="mb-5 flex gap-2.5 p-3.5 rounded-xl bg-brand-50 border border-brand-100 text-sm text-brand-900">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-brand-600" />
          <p className="leading-relaxed">
            Admin access is restricted. Sign in with a Ward IT/Admin account to manage projects, payments, and complaints.
          </p>
        </div>
      )}

      {(error || deniedMessage) && (
        <div className="mb-4 flex gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error || deniedMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-slate-700 mb-1">
            Email or Username
          </label>
          <input
            id="identifier"
            type="text"
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={inputClass(false)}
            placeholder="Enter email, username, or ward login ID"
            required
          />
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
            Citizens can login using email or username. Ward admins can use ward1@itahari, ward2@itahari, etc.
          </p>
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
          disabled={loading}
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
