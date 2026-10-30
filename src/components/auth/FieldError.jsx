/**
 * FieldError.jsx
 * Inline field error displayed under each form input.
 * Reuses existing error colour (#EF4444) from index.css / Tailwind theme.
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#EF4444]" role="alert">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

