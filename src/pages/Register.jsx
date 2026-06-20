import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Info, Users, Shield } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import Button from '../components/ui/Button';
import { FieldError, inputClass } from '../components/admin/FormSection';
import { useAuth } from '../context/AuthContext';
import {
  getPostLoginPath,
  getRegistrationSuccessMessage,
  MUNICIPALITY_NAME,
  ROLES,
} from '../services/authService';

import WardSelect from '../components/form/WardSelect';

const ACCOUNT_TYPES = [
  {
    role: ROLES.PUBLIC,
    icon: Users,
    title: 'I am a Citizen',
    subtitle: 'View projects, ask Ward Mitra AI, submit complaints, and track public updates.',
  },
  {
    role: ROLES.WARD_ADMIN,
    icon: Shield,
    title: 'I am Ward IT/Admin',
    subtitle: 'Manage ward projects, payments, proof uploads, and complaints for your assigned ward.',
  },
];

export default function Register() {
  const navigate = useNavigate();
  const { register, validateRegistration } = useAuth();

  const [form, setForm] = useState({
    role: ROLES.PUBLIC,
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    wardNo: '',
    phone: '',
    positionTitle: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const isWardAdmin = form.role === ROLES.WARD_ADMIN;

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const selectRole = (role) => {
    setForm((prev) => ({
      ...prev,
      role,
      username: '',
      wardNo: '',
      positionTitle: '',
    }));
    setErrors({});
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
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
        wardNo: form.wardNo || null,
        phone: form.phone,
        positionTitle: form.positionTitle,
      });

      const message = getRegistrationSuccessMessage(profile);
      navigate(getPostLoginPath(profile), {
        replace: true,
        state: { registrationSuccess: message },
      });
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setSubmitError('An account with this email already exists.');
      } else if (err.code === 'auth/username-already-in-use') {
        setSubmitError('Username already taken. Please choose another username.');
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
      <div className="mb-5 flex gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-sm text-amber-900">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
        <p className="leading-relaxed">
          <strong>Hackathon demo:</strong> Ward IT/Admin accounts are approved immediately after registration.
          In production, municipality approval would be required before admin access.
        </p>
      </div>

      {submitError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <p className="block text-sm font-medium text-slate-700 mb-3">
            Account type <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACCOUNT_TYPES.map(({ role, icon: Icon, title, subtitle }) => {
              const selected = form.role === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => selectRole(role)}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    selected
                      ? 'border-brand-600 bg-brand-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    selected ? 'bg-brand-100 text-brand-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

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

        {!isWardAdmin && (
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={(e) => update('username', e.target.value.toLowerCase())}
              className={inputClass(errors.username)}
              placeholder="e.g. ram_sharma"
            />
            <FieldError message={errors.username} />
            <p className="mt-1 text-xs text-slate-500">
              Lowercase letters, numbers, and underscore only. Minimum 3 characters.
            </p>
          </div>
        )}

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
            Phone {isWardAdmin ? <span className="text-red-500">*</span> : (
              <span className="text-slate-400 font-normal">(optional)</span>
            )}
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className={inputClass(errors.phone)}
            placeholder="98XXXXXXXX"
          />
          <FieldError message={errors.phone} />
        </div>

        <div>
          <label htmlFor="wardNo" className="block text-sm font-medium text-slate-700 mb-1">
            Ward number {isWardAdmin ? <span className="text-red-500">*</span> : (
              <span className="text-slate-400 font-normal">(optional)</span>
            )}
          </label>
          <WardSelect
            id="wardNo"
            value={form.wardNo}
            onChange={(e) => update('wardNo', e.target.value)}
            emptyLabel={isWardAdmin ? 'Select your assigned ward' : 'Select your ward (optional)'}
            selectClassName={inputClass(errors.wardNo)}
          />
          <FieldError message={errors.wardNo} />
        </div>

        {isWardAdmin && (
          <>
            <div>
              <label htmlFor="municipality" className="block text-sm font-medium text-slate-700 mb-1">
                Municipality
              </label>
              <input
                id="municipality"
                value={MUNICIPALITY_NAME}
                readOnly
                className={`${inputClass(false)} bg-slate-50 text-slate-600 cursor-not-allowed`}
              />
            </div>
            <div>
              <label htmlFor="positionTitle" className="block text-sm font-medium text-slate-700 mb-1">
                Official position/title <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                id="positionTitle"
                value={form.positionTitle}
                onChange={(e) => update('positionTitle', e.target.value)}
                className={inputClass(false)}
                placeholder="e.g. Ward IT Officer"
              />
            </div>
          </>
        )}

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
