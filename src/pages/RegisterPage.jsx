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
 *  - Sports-themed animations & transparent glass styling (Athletics Arena & Court)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateName, validateEmail, validatePassword } from '../services/authService';
import AuthCard from '../components/auth/AuthCard';
import FieldError from '../components/auth/FieldError';
import PasswordStrengthBar from '../components/auth/PasswordStrengthBar';

const ACCOUNT_TYPES = [
  { value: 'player', label: 'Player', description: 'Join tournaments, book facilities, and discover trials' },
  { value: 'captain', label: 'Student / Team Captain', description: 'Manage college teams and challenge rival colleges' },
  { value: 'facility_owner', label: 'Facility Owner', description: 'List and manage sports arenas & turf grounds' },
  { value: 'coach', label: 'Coach / Academy Owner', description: 'Run coaching programmes and recruit athletes' }
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
        role: form.role
      });

      if (result.success) {
        setSuccess(true);
        // Small delay so user sees the success state before redirecting
        setTimeout(() => {
          navigate(redirect, { replace: true });
        }, 800);
      } else {
        setFormError(result.error || 'Failed to create account. Please try again.');
        if (result.error?.toLowerCase().includes('email')) {
          emailRef.current?.focus();
        }
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

  return (
    <AuthCard
      title="Join the"
      titleHighlight="Squad"
      subtitle="Create your official SportLink athlete account"
      sport="athletics"
    >
      {/* Form-level error banner */}
      {formError && (
        <div
          className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm text-[#EF4444] bg-[#EF4444]/15 border border-[#EF4444]/30 backdrop-blur-md animate-hero-fade"
          role="alert"
          aria-live="assertive"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium">{formError}</span>
        </div>
      )}

      {/* Success banner */}
      {success && (
        <div
          className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm text-[#00D4FF] bg-[#00D4FF]/15 border border-[#00D4FF]/30 backdrop-blur-md animate-hero-fade"
          role="status"
          aria-live="polite"
        >
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium font-['Barlow_Condensed'] uppercase tracking-wider text-base">Account created! Preparing your dashboard…</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="reg-name" className="block text-xs font-['Barlow_Condensed'] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Full name
          </label>
          <input
            ref={nameRef}
            id="reg-name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="John Doe"
            aria-describedby={fieldErrors.name ? 'reg-name-err' : undefined}
            aria-invalid={Boolean(fieldErrors.name)}
            className={`w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 ${fieldErrors.name ? 'border-[#EF4444]! shadow-[0_0_0_1px_#EF4444]!' : ''}`}
          />
          <FieldError message={fieldErrors.name} />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="block text-xs font-['Barlow_Condensed'] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
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
            aria-describedby={fieldErrors.email ? 'reg-email-err' : undefined}
            aria-invalid={Boolean(fieldErrors.email)}
            className={`w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 ${fieldErrors.email ? 'border-[#EF4444]! shadow-[0_0_0_1px_#EF4444]!' : ''}`}
          />
          <FieldError message={fieldErrors.email} />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password" className="block text-xs font-['Barlow_Condensed'] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
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
              aria-describedby={fieldErrors.password ? 'reg-pwd-err' : undefined}
              aria-invalid={Boolean(fieldErrors.password)}
              className={`w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-400 ${fieldErrors.password ? 'border-[#EF4444]! shadow-[0_0_0_1px_#EF4444]!' : ''}`}
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
          <label htmlFor="reg-confirm" className="block text-xs font-['Barlow_Condensed'] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
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
              aria-describedby={fieldErrors.confirmPassword ? 'reg-confirm-err' : undefined}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              className={`w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-400 ${fieldErrors.confirmPassword ? 'border-[#EF4444]! shadow-[0_0_0_1px_#EF4444]!' : ''}`}
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

        {/* Account Type Selector */}
        <div>
          <label className="block text-xs font-['Barlow_Condensed'] font-bold uppercase tracking-wider text-slate-300 mb-2">
            Select Your Role
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ACCOUNT_TYPES.map((type) => {
              const selected = form.role === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleChange('role', type.value)}
                  className={`text-left px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer backdrop-blur-md ${
                    selected
                      ? 'border-[#00D4FF]/70 bg-[#00D4FF]/15 shadow-[0_0_14px_rgba(0,212,255,0.22)]'
                      : 'border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.08]'
                  }`}
                  aria-pressed={selected}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-['Barlow_Condensed'] font-bold uppercase tracking-wide ${selected ? 'text-[#00D4FF]' : 'text-slate-200'}`}>
                      {type.label}
                    </span>
                    {selected && (
                      <CheckCircle className="w-3.5 h-3.5 text-[#00D4FF] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-1">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || success}
          className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-[#00D4FF] via-cyan-400 to-sky-500 hover:from-cyan-300 hover:via-cyan-400 hover:to-sky-400 text-[#07131d] font-['Barlow_Condensed'] text-base uppercase tracking-wider font-black transition-all hover:brightness-105 active:translate-y-0.5 shadow-[0_4px_20px_rgba(0,212,255,0.35)] hover:shadow-[0_6px_25px_rgba(0,212,255,0.45)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin text-[#07131d]" />}
          <span>{loading ? 'Registering Athlete…' : 'Join SportLink'}</span>
        </button>
      </form>

      {/* Switch to Login */}
      <div className="pt-1 text-center">
        <p className="text-sm text-slate-400 font-sans">
          Already have an account?{' '}
          <Link to={loginHref} className="text-[#00D4FF] font-bold hover:text-cyan-300 hover:underline transition-colors">
            Log In
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
