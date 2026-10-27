import React from 'react';

export default function SectionHeading({
  tag,
  title,
  subtitle,
  centered = false,
  light = false,
  sampleBadge = true,
  action,
  className = ''
}) {
  return (
    <div className={`mb-8 sm:mb-12 ${centered ? 'text-center max-w-3xl mx-auto' : 'max-w-4xl'} ${className}`}>
      <div className={`flex flex-wrap items-center gap-2 mb-3 ${centered ? 'justify-center' : 'justify-start'}`}>
        {tag && (
          <span
            className={`inline-flex items-center text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${
              light
                ? 'bg-slate-200/80 text-slate-800 border-slate-300'
                : 'bg-[#c6ff3d]/10 text-[#c6ff3d] border-[#c6ff3d]/25'
            }`}
          >
            {tag}
          </span>
        )}
        {sampleBadge && (
          <span
            className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${
              light
                ? 'bg-slate-200 text-slate-600 border-slate-300'
                : 'bg-slate-800/80 text-slate-400 border-[#2a3652]'
            }`}
          >
            Demo / Sample Data
          </span>
        )}
      </div>

      <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 ${centered ? 'md:flex-col' : ''}`}>
        <div>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight font-['Barlow_Condensed'] leading-[1.05] ${
              light ? 'text-[#0a1020]' : 'text-white'
            }`}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={`mt-3 text-base sm:text-lg leading-relaxed ${
                light ? 'text-slate-600' : 'text-[#a3afc6]'
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
