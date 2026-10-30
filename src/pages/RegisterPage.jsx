/**
 * RegisterPage.jsx
 * Route: /register
 *
 * Features:
 *  - Full name, email, password, confirm password fields
 *  - Show/hide toggle on both password fields
 *  - Live password strength indicator + requirements list
 *  - Account type selector (safe roles only)
 *  - Client + server-side validation with inline errors
 *  - Loading state, success auto-login + redirect
 *  - Preserves ?redirect= when switching to /login
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateName, validateEmail, validatePassword } from '../services/authService';
import AuthCard from '../components/auth/AuthCard';
import FieldError from '../components/auth/FieldError';
import PasswordStrengthBar from '../components/auth/PasswordStrengthBar';

const ACCOUNT_TYPES = [
  { value: 'player', label: 'Player', description: 'Join tournaments, book facilities, find trials' },
  { value: 'captain', label: 'Student / Team Captain', description: 'Manage your college team, post friendly match requests' },
  { value: 'facility_owner', label: 'Facility Owner', description: 'List and manage your sports grounds' },
  { value: 'coach', label: 'Coach / Academy Owner', description: 'Run coaching programmes and academies' }
];

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'player'
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate(redirect, { replace: true });
  }, [isAuthenticated, navigate, redirect]);

  function validate() {
    const errors = {};
    const nameErr = validateName(form.name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(form.email);
    if (emailErr) errors.email = emailErr;

    const passwordErr = validatePassword(form.password);
    if (passwordErr) errors.password = passwordErr;

    if (form.password && form.confirmPassword !== form.password) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    }

    return errors;
  }

  function focusFirstError(errors) {
    if (errors.name) nameRef.current?.focus();
    else if (errors.email) emailRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
    else if (errors.confirmPassword) confirmRef.current?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      focusFirstError(errors);
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role
      });

      if (result.success) {
        setSuccess(true);
        // Brief success flash then redirect
        setTimeout(() => navigate(redirect, { replace: true }), 1000);
      } else if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
        focusFirstError(result.fieldErrors);
      } else {
        setFormError(result.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (formError) setFormError('');
  }

  const loginHref = redirect && redirect !== '/'
    ? `/login?redirect=${encodeURIComponent(redirect)}`
    : '/login';

  if (success) {
    return (
      <AuthCard title="You're in!" subtitle="Account created successfully">
        <div className="flex flex-col items-center gap-4 py-4">
          <CheckCircle className="w-14 h-14 text-[#B6FF3B]" />
          <p className="text-slate-300 text-sm text-center">
            Welcome to SportLink, <strong className="text-white">{form.name.trim()}</strong>!<br />
            Taking you in…
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create your account" subtitle="Join thousands of athletes on SportLink">
      {/* Form-level error */}
      {formError && (
        <div
          className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/25"
          role="alert"
          aria-live="assertive"
        >
          <span className="shrink-0 mt-0.5">⚠</span>
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Full Name */}
        <div>
          <label htmlFor="reg-name" className="block text-sm font-semibold text-slate-200 mb-1.5">
            Full name
          </label>
          <input
            ref={nameRef}
            id="reg-name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Arjun Mehta"
            aria-invalid={Boolean(fieldErrors.name)}
            className={`w-full rounded-xl px-4 py-3 text-sm ${fieldErrors.name ? 'border-[#EF4444]! shadow-[0_0_0_1px_#EF4444]!' : ''}`}
          />
          <FieldError message={fieldErrors.name} />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-200 mb-1.5">
            Email address
          </label>
          <input
            ref={emailRef}
            id="reg-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="you@college.edu"
            aria-invalid={Boolean(fieldErrors.email)}
            className={`w-full rounded-xl px-4 py-3 text-sm ${fieldErrors.email ? 'border-[#EF4444]! shadow-[0_0_0_1px_#EF4444]!' : ''}`}
          />
          <FieldError message={fieldErrors.email} />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-200 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              ref={passwordRef}
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••"
              aria-invalid={Boolean(fieldErrors.password)}
              className={`w-full rounded-xl px-4 py-3 pr-11 text-sm ${fieldErrors.password ? 'border-[#EF4444]! shadow-[0_0_0_1px_#EF4444]!' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <FieldError message={fieldErrors.password} />
          <PasswordStrengthBar password={form.password} />
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="reg-confirm" className="block text-sm font-semibold text-slate-200 mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <input
              ref={confirmRef}
              id="reg-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              className={`w-full rounded-xl px-4 py-3 pr-11 text-sm ${fieldErrors.confirmPassword ? 'border-[#EF4444]! shadow-[0_0_0_1px_#EF4444]!' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <FieldError message={fieldErrors.confirmPassword} />
        </div>

        {/* Account Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            Account type
          </label>
          <div className="grid grid-cols-1 gap-2">
            {ACCOUNT_TYPES.map((type) => {
              const selected = form.role === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleChange('role', type.value)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                    selected
                      ? 'border-[#B6FF3B]/60 bg-[#B6FF3B]/10 shadow-[0_0_12px_rgba(182,255,59,0.12)]'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
                  }`}
                  aria-pressed={selected}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${selected ? 'text-[#B6FF3B]' : 'text-slate-200'}`}>
                      {type.label}
                    </span>
                    {selected && (
                      <CheckCircle className="w-4 h-4 text-[#B6FF3B] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#c6ff3d] text-[#0a1020] font-bold text-sm transition-all hover:bg-[#b8f226] active:translate-y-0.5 shadow-[0_2px_12px_rgba(198,255,61,0.25)] hover:shadow-[0_4px_18px_rgba(198,255,61,0.35)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      {/* Switch to Login */}
      <p className="text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to={loginHref} className="text-[#c6ff3d] font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}

