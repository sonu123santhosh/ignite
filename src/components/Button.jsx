import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-full tracking-wide select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1020]';

  const sizeStyles = {
    sm: 'text-xs px-4 py-2 gap-1.5 font-medium',
    md: 'text-sm px-6 py-2.5 gap-2',
    lg: 'text-base px-7 py-3 gap-2.5 font-bold'
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white hover:brightness-110 active:translate-y-0.5 shadow-[0_4px_16px_rgba(225,29,72,0.35)] hover:shadow-[0_6px_22px_rgba(225,29,72,0.5)] font-bold',
    crimson:
      'bg-gradient-to-r from-[#DC2626] via-[#E11D48] to-[#BE123C] text-white hover:brightness-110 active:translate-y-0.5 shadow-[0_4px_16px_rgba(225,29,72,0.35)] hover:shadow-[0_6px_22px_rgba(225,29,72,0.5)] font-bold',
    stadium:
      'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white hover:brightness-110 active:translate-y-0.5 shadow-[0_4px_16px_rgba(14,165,233,0.35)] hover:shadow-[0_6px_22px_rgba(14,165,233,0.5)] font-bold',
    pitch:
      'bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white hover:brightness-110 active:translate-y-0.5 shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_22px_rgba(16,185,129,0.5)] font-bold',
    skyGlass:
      'bg-sky-500/15 border border-sky-400/30 text-sky-100 hover:bg-sky-500/25 hover:border-sky-300 hover:text-white active:translate-y-0.5 backdrop-blur-sm',
    gold:
      'bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#B45309] text-white hover:brightness-110 active:translate-y-0.5 shadow-[0_4px_16px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.4)] font-bold',
    outline:
      'border border-white/20 text-slate-100 hover:border-rose-400 hover:text-white hover:bg-rose-500/10 active:translate-y-0.5 backdrop-blur-sm',
    secondary:
      'bg-white/10 border border-white/15 text-slate-100 hover:text-white hover:border-white/30 hover:bg-white/15 active:translate-y-0.5 backdrop-blur-sm',
    ghost:
      'text-slate-300 hover:text-rose-300 hover:bg-white/5 active:bg-white/10',
    dark:
      'bg-black/40 text-slate-100 border border-white/15 hover:border-rose-400 hover:text-white backdrop-blur-sm'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
