/**
 * LoginPage.jsx
 * Route: /login
 *
 * Features:
 *  - Email + password fields with inline validation
 *  - Show/hide password toggle
 *  - Loading state on submit
 *  - Generic error banner (never reveals which field was wrong)
 *  - Link to /register (preserves ?redirect= param)
 *  - ?redirect= param: redirects after successful login
 *  - First invalid field receives focus automatically
 *  - Sports-themed animations & transparent glass styling (Football Turf Stadium)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from '../services/authService';
import AuthCard from '../components/auth/AuthCard';
import FieldError from '../components/auth/FieldError';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // Redirect away if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate(redirect, { replace: true });
  }, [isAuthenticated, navigate, redirect]);

  // Client-side validation
  function validate() {
    const errors = {};
    const emailErr = validateEmail(form.email);
    if (emailErr) errors.email = emailErr;
    if (!form.password) errors.password = 'Password is required.';
    return errors;
  }

  function focusFirstError(errors) {
    if (errors.email) emailRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
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
      const result = await login({ email: form.email, password: form.password });
      if (result.success) {
        navigate(redirect, { replace: true });
      } else {
        // Always show generic message — never reveal which field is wrong
        setFormError(result.error || 'Invalid email or password.');
      }
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (formError) setFormError('');
  }

  const registerHref = redirect && redirect !== '/'
    ? `/register?redirect=${encodeURIComponent(redirect)}`
    : '/register';

  return (
    <AuthCard
      title="Welcome"
      titleHighlight="Back"
      subtitle="Sign in to your SportLink pitch account"
      sport="football"
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

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-xs font-['Barlow_Condensed'] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Email address
          </label>
          <input
            ref={emailRef}
            id="login-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="you@college.edu"
            aria-describedby={fieldErrors.email ? 'login-email-err' : undefined}
            aria-invalid={Boolean(fieldErrors.email)}
            className={`w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 ${fieldErrors.email ? 'border-[#EF4444]! shadow-[0_0_0_1px_#EF4444]!' : ''}`}
          />
          <FieldError message={fieldErrors.email} />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-xs font-['Barlow_Condensed'] font-bold uppercase tracking-wider text-slate-300">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              ref={passwordRef}
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••"
              aria-describedby={fieldErrors.password ? 'login-pwd-err' : undefined}
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
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white font-['Barlow_Condensed'] text-base uppercase tracking-wider font-black transition-all hover:brightness-105 active:translate-y-0.5 shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
          <span>{loading ? 'Entering Pitch…' : 'Log In to SportLink'}</span>
        </button>
      </form>

      {/* Switch to Sign Up */}
      <div className="pt-1 text-center">
        <p className="text-sm text-slate-400 font-sans">
          Don&apos;t have an account?{' '}
          <Link
            to={registerHref}
            className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline transition-colors"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
