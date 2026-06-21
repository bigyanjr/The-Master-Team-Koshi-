import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Users, Shield } from 'lucide-react';
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
    subtitle: 'Manage ward projects, payments, proof uploads, and citizen complaints.',
  },
];

const POSITION_OPTIONS = [
  'Ward IT Officer',
  'Ward Admin',
  'Municipality Admin',
  'Project Officer',
];

const EMPTY_FORM = {
  role: ROLES.PUBLIC,
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  citizenshipNumber: '',
  wardNo: '',
  positionTitle: '',
};

export default function Register() {
  const navigate = useNavigate();
  const { register, validateRegistration } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
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
      // Clear fields that don't belong to the newly selected account type.
      fullName: '',
      phone: '',
      citizenshipNumber: '',
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
      const payload = isWardAdmin
        ? {
          accountType: 'ward_admin',
          role: form.role,
          username: form.username,
          email: form.email,
          password: form.password,
          municipality: MUNICIPALITY_NAME,
          wardNo: form.wardNo,
          positionTitle: form.positionTitle,
        }
        : {
          accountType: 'citizen',
          role: form.role,
          fullName: form.fullName,
          username: form.username,
          email: form.email,
          password: form.password,
          phone: form.phone,
          citizenshipNumber: form.citizenshipNumber,
        };

      const profile = await register(payload);

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
      subtitle="Create your WardWatch account to track ward projects, budgets, complaints, and updates."
    >
      {submitError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <p className="block text-sm font-medium text-slate-700 mb-3 dark:text-slate-300">
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
                      ? 'border-brand-600 bg-brand-50/70 shadow-sm dark:border-emerald-600 dark:bg-emerald-950/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    selected ? 'bg-brand-100 text-brand-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed dark:text-slate-400">{subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {!isWardAdmin && (
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
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
        )}

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
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
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Lowercase letters, numbers, and underscore only. Minimum 3 characters.
          </p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
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
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
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
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
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

        {!isWardAdmin && (
          <>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                Phone <span className="text-red-500">*</span>
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
              <label htmlFor="citizenshipNumber" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                Nagarikta / Citizenship number <span className="text-red-500">*</span>
              </label>
              <input
                id="citizenshipNumber"
                value={form.citizenshipNumber}
                onChange={(e) => update('citizenshipNumber', e.target.value)}
                className={inputClass(errors.citizenshipNumber)}
                placeholder="e.g. 12-34-56-78901"
              />
              <FieldError message={errors.citizenshipNumber} />
            </div>
          </>
        )}

        {isWardAdmin && (
          <>
            <div>
              <label htmlFor="municipality" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                Municipality <span className="text-red-500">*</span>
              </label>
              <input
                id="municipality"
                value={MUNICIPALITY_NAME}
                readOnly
                className={`${inputClass(false)} bg-slate-50 text-slate-600 cursor-not-allowed dark:bg-slate-800 dark:text-slate-400`}
              />
            </div>

            <div>
              <label htmlFor="wardNo" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                Ward <span className="text-red-500">*</span>
              </label>
              <WardSelect
                id="wardNo"
                value={form.wardNo}
                onChange={(e) => update('wardNo', e.target.value)}
                emptyLabel="Select your assigned ward"
                selectClassName={inputClass(errors.wardNo)}
              />
              <FieldError message={errors.wardNo} />
            </div>

            <div>
              <label htmlFor="positionTitle" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                Position <span className="text-red-500">*</span>
              </label>
              <select
                id="positionTitle"
                value={form.positionTitle}
                onChange={(e) => update('positionTitle', e.target.value)}
                className={inputClass(errors.positionTitle)}
              >
                <option value="">Select position</option>
                {POSITION_OPTIONS.map((position) => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
              <FieldError message={errors.positionTitle} />
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

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800 dark:text-emerald-400 dark:hover:text-emerald-300">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
