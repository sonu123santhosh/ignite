/**
 * AuthCard.jsx
 * Shared card wrapper for Login and Register pages.
 * Uses the existing Liquid Glass / glass-input style from index.css.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function AuthCard({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Back to home link */}
      <Link
        to="/"
        className="absolute top-6 left-6 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors group"
      >
        <span className="text-slate-500 group-hover:text-[#B6FF3B] transition-colors">←</span>
        Back to home
      </Link>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c6ff3d] to-emerald-400 flex items-center justify-center text-[#0a1020] font-black shadow-[0_0_18px_rgba(198,255,61,0.35)] transition-transform group-hover:scale-105">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <span className="font-display text-2xl font-black tracking-wider uppercase text-white leading-none">
          Sport<span className="text-[#c6ff3d]">Link</span>
        </span>
      </Link>

      {/* Card */}
      <div
        className="w-full max-w-md rounded-2xl p-8 space-y-6"
        style={{
          background: 'rgba(16, 24, 38, 0.72)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 24px 48px -12px rgba(0,0,0,0.7), 0 0 1px 1px rgba(255,255,255,0.06)'
        }}
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-400">{subtitle}</p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}

