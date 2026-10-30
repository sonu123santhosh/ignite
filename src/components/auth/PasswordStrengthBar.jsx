/**
 * PasswordStrengthBar.jsx
 * Visual password strength indicator (0–4 segments).
 * Uses existing SportLink colour palette.
 */

import React from 'react';
import { passwordStrength } from '../../services/authService';

const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const SEGMENT_COLORS = [
  '',                    // 0 — unused
  'bg-[#EF4444]',        // 1 — Weak (red)
  'bg-[#F59E0B]',        // 2 — Fair (amber)
  'bg-[#00D4FF]',        // 3 — Good (cyan)
  'bg-[#B6FF3B]'         // 4 — Strong (lime)
];

export default function PasswordStrengthBar({ password }) {
  const strength = passwordStrength(password || '');
  if (!password) return null;

  const label = LABELS[strength] || '';
  const color = SEGMENT_COLORS[strength] || SEGMENT_COLORS[1];

  return (
    <div className="mt-2 space-y-1.5" aria-live="polite" aria-label={`Password strength: ${label}`}>
      {/* Four segment bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((seg) => (
          <div
            key={seg}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              seg <= strength ? color : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      {/* Label */}
      <p className={`text-xs font-medium ${strength >= 3 ? 'text-[#B6FF3B]' : strength === 2 ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>
        {label}
      </p>

      {/* Requirements hint */}
      <ul className="space-y-0.5 text-[11px] text-slate-400">
        {[
          { test: (p) => p.length >= 8, label: 'At least 8 characters' },
          { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter' },
          { test: (p) => /[a-z]/.test(p), label: 'One lowercase letter' },
          { test: (p) => /[0-9]/.test(p), label: 'One number' }
        ].map(({ test, label: reqLabel }) => {
          const met = test(password);
          return (
            <li key={reqLabel} className={`flex items-center gap-1.5 ${met ? 'text-[#B6FF3B]' : 'text-slate-400'}`}>
              <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[9px] font-bold border ${met ? 'bg-[#B6FF3B]/20 border-[#B6FF3B]/50 text-[#B6FF3B]' : 'border-white/20'}`}>
                {met ? '✓' : ''}
              </span>
              {reqLabel}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

