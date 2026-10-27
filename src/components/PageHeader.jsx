import React from 'react';
import Tag from './Tag';

export default function PageHeader({
  tag,
  title,
  description,
  sampleBadge = true,
  className = ''
}) {
  return (
    <div className={`mb-10 max-w-4xl ${className}`}>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {tag && <Tag variant="lime">{tag}</Tag>}
        {sampleBadge && <Tag variant="slate">Prototype Shell</Tag>}
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white font-['Barlow_Condensed'] leading-[1.02]">
        {title}
      </h1>

      {description && (
        <p className="mt-3 text-base sm:text-lg text-[#a3afc6] leading-relaxed max-w-3xl">
          {description}
        </p>
      )}
    </div>
  );
}
