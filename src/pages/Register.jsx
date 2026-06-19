import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertTriangle, Info } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import Button from '../components/ui/Button';
import { FieldError, inputClass } from '../components/admin/FormSection';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getPostLoginPath, ROLES } from '../services/authService';

export default function Register() {
  const navigate = useNavigate();
  const { register, validateRegistration } = useAuth();
  const { wards } = useData();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ROLES.PUBLIC,
    wardNo: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const isWardAdmin = form.role === ROLES.WARD_ADMIN;

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const validation = validateRegistration(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const profile = await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
        wardNo: isWardAdmin ? form.wardNo : null,
        phone: form.phone,
      });
      navigate(getPostLoginPath(profile), { replace: true });
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setSubmitError('An account with this email already exists.');
      } else {
        setSubmitError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join WardWatch Itahari to track ward budgets, ask AI, and submit project feedback."
    >
      {isWardAdmin && (
        <div className="mb-5 flex gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-sm text-amber-900">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
          <p className="leading-relaxed">
            Demo role selection is enabled for hackathon prototype. In production, ward admin accounts must be approved by municipality.
          </p>
        </div>
      )}

      {submitError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            className={inputClass(errors.fullName)}
            placeholder="Your full name"
          />
          <FieldError message={errors.fullName} />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className={inputClass(errors.email)}
            placeholder="you@example.com"
          />
          <FieldError message={errors.email} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className={inputClass(errors.password)}
              placeholder="Min. 6 characters"
            />
            <FieldError message={errors.password} />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
              Confirm password <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              className={inputClass(errors.confirmPassword)}
              placeholder="Repeat password"
            />
            <FieldError message={errors.confirmPassword} />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
            Phone <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className={inputClass(false)}
            placeholder="98XXXXXXXX"
          />
        </div>

        <div>
          <p className="block text-sm font-medium text-slate-700 mb-2">
            Account type <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors ${
                form.role === ROLES.PUBLIC
                  ? 'border-brand-500 bg-brand-50/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={ROLES.PUBLIC}
                checked={form.role === ROLES.PUBLIC}
                onChange={() => update('role', ROLES.PUBLIC)}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">Public Citizen</p>
                <p className="text-xs text-slate-500 mt-0.5">View projects, ask AI, submit complaints</p>
              </div>
            </label>
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors ${
                isWardAdmin
                  ? 'border-brand-500 bg-brand-50/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={ROLES.WARD_ADMIN}
                checked={isWardAdmin}
                onChange={() => update('role', ROLES.WARD_ADMIN)}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">Ward IT/Admin</p>
                <p className="text-xs text-slate-500 mt-0.5">Manage projects, payments, and complaints</p>
              </div>
            </label>
          </div>
        </div>

        {isWardAdmin && (
          <div>
            <label htmlFor="wardNo" className="block text-sm font-medium text-slate-700 mb-1">
              Ward number <span className="text-red-500">*</span>
            </label>
            <select
              id="wardNo"
              value={form.wardNo}
              onChange={(e) => update('wardNo', e.target.value)}
              className={inputClass(errors.wardNo)}
            >
              <option value="">Select your ward</option>
              {wards.map((w) => (
                <option key={w.id} value={w.number}>
                  Ward {w.number} — {w.name}
                </option>
              ))}
            </select>
            <FieldError message={errors.wardNo} />
          </div>
        )}

        <div className="flex gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-500">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>Your profile is created automatically when you register.</span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          icon={UserPlus}
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
