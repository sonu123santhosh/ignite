import React, { useState } from 'react';
import { User, Users, GraduationCap, Trophy, Sliders, Bell, X, ShieldAlert, Check } from 'lucide-react';
import { useFriendlies } from '../../context/FriendliesContext';
import { DEMO_PERSONAS } from '../../data/friendliesData';

export default function FriendliesRoleSwitcher({ onOpenNotifications }) {
  const { role, setRole, currentActor, setCurrentActor, notifications } = useFriendlies();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const roles = [
    { id: 'student', label: 'Student', icon: User },
    { id: 'captain', label: 'Team Captain', icon: Users },
    { id: 'coordinator', label: 'College Coordinator', icon: GraduationCap },
    { id: 'organiser', label: 'Match Organiser', icon: Trophy }
  ];

  return (
    <div className="bg-[#151B23] border border-[#293442] rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg mb-8">
      {/* Role Tabs */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] shrink-0">
          Demo Role:
        </span>
        <div className="inline-flex p-1 bg-[#0B0F14] border border-[#293442] rounded-xl flex-wrap" role="group" aria-label="Friendlies Role Switcher">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                aria-pressed={isSelected}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#B6FF3B] text-[#0B0F14] shadow-sm'
                    : 'text-[#9CA3AF] hover:text-[#FFFFFF]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Tools: Demo Personas Switcher & Notification Bell */}
      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
        <div className="flex items-center gap-2">
          {/* Demo Persona Switcher Trigger */}
          <button
            type="button"
            onClick={() => setIsDemoModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#1B2530] text-[#FFFFFF] hover:text-white border border-[#293442] hover:border-[#00D9FF]/50 rounded-xl transition-all cursor-pointer shadow-sm"
            title="Act as a different captain or coordinator"
          >
            <Sliders className="w-3.5 h-3.5 text-[#00D9FF]" />
            <span className="hidden sm:inline">Act As: {currentActor?.name?.split(' ')[0]}</span>
            <span className="sm:hidden">Personas</span>
          </button>

          {/* Notifications Trigger */}
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

        <p className="text-[11px] text-[#9CA3AF] italic leading-tight text-right max-w-[200px] sm:max-w-none">
          Demo only. In production, roles come from the signed-in account.
        </p>
      </div>

      {/* Demo Personas Modal */}
      {isDemoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#151B23] border border-[#293442] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#293442] bg-[#0B0F14]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#00D9FF]/10 text-[#00D9FF]">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white tracking-wide">
                    Switch Active Demo Persona
                  </h3>
                  <p className="text-xs text-[#9CA3AF]">
                    Test both sides of match negotiations (e.g., PIT Captain vs DCE Captain).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
              {DEMO_PERSONAS.map((persona) => {
                const isSelected = currentActor?.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => {
                      setCurrentActor(persona);
                      setRole(persona.role);
                      setIsDemoModalOpen(false);
                    }}
                    className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-white shadow-md'
                        : 'bg-[#1B2530] border-[#293442] hover:border-slate-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{persona.name}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {persona.role}
                        </span>
                      </div>
                      <div className="text-xs text-[#00D9FF] font-medium mt-0.5">
                        {persona.collegeName || persona.description}
                      </div>
                      <div className="text-[11px] text-[#9CA3AF] mt-1">
                        {persona.description}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-[#B6FF3B] text-[#0B0F14]">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="px-6 py-3 border-t border-[#293442] bg-[#0B0F14] text-right">
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(false)}
                className="px-4 py-2 bg-[#B6FF3B] text-[#0B0F14] font-bold text-xs rounded-xl hover:bg-[#a3ee28]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
