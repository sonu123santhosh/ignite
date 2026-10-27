import React from 'react';
import { User, Building2 } from 'lucide-react';

export default function RoleSwitcher({ currentRole, onRoleChange }) {
  return (
    <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
          Demo View Role:
        </span>
        <div className="inline-flex p-1 bg-[#0B0F14] border border-[#293442] rounded-xl" role="group" aria-label="Role Switcher">
          <button
            type="button"
            onClick={() => onRoleChange('player')}
            aria-pressed={currentRole === 'player'}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentRole === 'player'
                ? 'bg-[#B6FF3B] text-[#0B0F14] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F5F7FA]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Player Mode</span>
          </button>
          <button
            type="button"
            onClick={() => onRoleChange('owner')}
            aria-pressed={currentRole === 'owner'}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentRole === 'owner'
                ? 'bg-[#00D4FF] text-[#0B0F14] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F5F7FA]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Facility Owner</span>
          </button>
        </div>
      </div>

      <p className="text-[11px] text-[#94A3B8] italic leading-tight">
        Demo only. In production the role comes from the signed-in account.
      </p>
    </div>
  );
}
