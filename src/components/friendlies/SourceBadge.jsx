import React from 'react';
import { ShieldCheck, ShieldAlert, Users, Award, Sparkles, Clock } from 'lucide-react';

/**
 * SourceBadge displays the 4 source tiers:
 * - Official fixture
 * - Verified organiser
 * - Community proposal
 * - Demo data
 * Also displays "Last verified" date or "Not verified".
 */
export default function SourceBadge({ source, lastVerified, showDate = false, className = '' }) {
  let badgeConfig = {
    label: 'Demo data',
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700',
    icon: Sparkles
  };

  switch (source) {
    case 'official_fixture':
      badgeConfig = {
        label: 'Official fixture',
        bg: 'bg-[#00D9FF]/10',
        text: 'text-[#00D9FF]',
        border: 'border-[#00D9FF]/40',
        icon: Award
      };
      break;
    case 'verified_organiser':
      badgeConfig = {
        label: 'Verified organiser',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/40',
        icon: ShieldCheck
      };
      break;
    case 'community_proposal':
      badgeConfig = {
        label: 'Community proposal',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/40',
        icon: Users
      };
      break;
    case 'demo_data':
    default:
      badgeConfig = {
        label: 'Demo data',
        bg: 'bg-slate-800/80',
        text: 'text-slate-400',
        border: 'border-[#293442]',
        icon: Sparkles
      };
      break;
  }

  const Icon = badgeConfig.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border}`}
      >
        <Icon className="w-3 h-3" />
        <span>{badgeConfig.label}</span>
      </span>

      {showDate && (
        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
          <Clock className="w-2.5 h-2.5 text-slate-500" />
          <span>{lastVerified ? `Verified: ${lastVerified}` : 'Not verified'}</span>
        </span>
      )}
    </div>
  );
}
