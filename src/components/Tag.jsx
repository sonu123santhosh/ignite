import React from 'react';

export default function Tag({
  children,
  variant = 'lime',
  className = ''
}) {
  const variantStyles = {
    lime: 'bg-[#c6ff3d]/10 text-[#c6ff3d] border-[#c6ff3d]/30',
    slate: 'bg-slate-800/80 text-slate-300 border-[#2a3652]',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  };

  return (
    <span
      className={`inline-flex items-center text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full border ${
        variantStyles[variant] || variantStyles.lime
      } ${className}`}
    >
      {children}
    </span>
  );
}
