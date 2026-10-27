import React, { useState } from 'react';
import { User, Users, Trophy, Sliders, Bell } from 'lucide-react';

export default function TournamentRoleSwitcher({
  currentRole,
  onRoleChange,
  currentUser,
  unreadCount = 0,
  onOpenNotifications,
  onOpenDemoTools
}) {
  return (
    <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg mb-8">
      {/* Role Tabs */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] shrink-0">
          Demo Role:
        </span>
        <div className="inline-flex p-1 bg-[#0B0F14] border border-[#293442] rounded-xl flex-wrap" role="group" aria-label="Tournament Role Switcher">
          <button
            type="button"
            onClick={() => onRoleChange('player')}
            aria-pressed={currentRole === 'player'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentRole === 'player'
                ? 'bg-[#B6FF3B] text-[#0B0F14] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F5F7FA]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Player</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleChange('captain')}
            aria-pressed={currentRole === 'captain'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentRole === 'captain'
                ? 'bg-[#00D4FF] text-[#0B0F14] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F5F7FA]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Captain</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleChange('organiser')}
            aria-pressed={currentRole === 'organiser'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentRole === 'organiser'
                ? 'bg-amber-400 text-[#0B0F14] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F5F7FA]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Tournament Organiser</span>
          </button>
        </div>
      </div>

      {/* Right Tools & Disclaimer */}
      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
        <div className="flex items-center gap-2">
          {/* Demo Tools Button */}
          <button
            type="button"
            onClick={onOpenDemoTools}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#1B2530] text-[#F5F7FA] hover:text-white border border-[#293442] hover:border-[#B6FF3B]/50 rounded-xl transition-all cursor-pointer shadow-sm"
            title="Open Demo tools (switch personas, test collisions)"
          >
            <Sliders className="w-3.5 h-3.5 text-[#B6FF3B]" />
            <span className="hidden sm:inline">Demo Tools</span>
            <span className="sm:hidden">Tools</span>
          </button>

          {/* Notifications Button */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 bg-[#1B2530] text-slate-300 hover:text-white border border-[#293442] hover:border-slate-500 rounded-xl transition-colors cursor-pointer"
            aria-label={`View notifications (${unreadCount} unread)`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <p className="text-[11px] text-[#94A3B8] italic leading-tight text-right max-w-[200px] sm:max-w-none">
          Demo only. In production, roles come from the signed-in account.
        </p>
      </div>
    </div>
  );
}
