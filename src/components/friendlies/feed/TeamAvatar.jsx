/**
 * src/components/friendlies/feed/TeamAvatar.jsx
 * 
 * Displays team/college logo or a clean initials avatar fallback.
 * Never shows unrelated stock images.
 */
import React from 'react';

export default function TeamAvatar({ team, college, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const primaryColor = team?.primaryColor || college?.primaryColor || '#00D9FF';
  const initials =
    team?.logoInitials ||
    (team?.name ? team.name.slice(0, 2).toUpperCase() : null) ||
    college?.logoInitials ||
    (college?.shortName ? college.shortName.slice(0, 2).toUpperCase() : '??');

  const isVerified = team?.verified || college?.verified;

  return (
    <div className={`relative shrink-0 ${className}`}>
      <div
        className={`${sizeClass} rounded-xl flex items-center justify-center font-['Barlow_Condensed'] font-black text-white shadow-md border border-white/10`}
        style={{ backgroundColor: primaryColor }}
        role="img"
        aria-label={team?.name || college?.name || 'Team Avatar'}
      >
        {initials}
      </div>
      {isVerified && (
        <span
          className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#141B24] flex items-center justify-center"
          title="Verified team"
          aria-label="Verified"
        >
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </div>
  );
}

