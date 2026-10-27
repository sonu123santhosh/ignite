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
    'inline-flex items-center justify-center font-semibold transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-full tracking-wide select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c6ff3d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1020]';

  const sizeStyles = {
    sm: 'text-xs px-4 py-2 gap-1.5 font-medium',
    md: 'text-sm px-6 py-2.5 gap-2',
    lg: 'text-base px-7 py-3 gap-2.5 font-bold'
  };

  const variantStyles = {
    primary:
      'bg-[#c6ff3d] text-[#0a1020] hover:bg-[#b8f226] active:translate-y-0.5 shadow-[0_2px_12px_rgba(198,255,61,0.25)] hover:shadow-[0_4px_18px_rgba(198,255,61,0.35)]',
    outline:
      'border border-[#2a3652] text-slate-100 hover:border-[#c6ff3d] hover:text-[#c6ff3d] hover:bg-[#c6ff3d]/5 active:translate-y-0.5',
    secondary:
      'bg-[#172033] border border-[#2a3652] text-slate-200 hover:text-white hover:border-slate-400 hover:bg-[#1d2942]',
    ghost:
      'text-slate-300 hover:text-[#c6ff3d] hover:bg-white/5 active:bg-white/10',
    dark:
      'bg-[#0a1020] text-slate-100 border border-[#2a3652] hover:border-[#c6ff3d] hover:text-[#c6ff3d]'
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
