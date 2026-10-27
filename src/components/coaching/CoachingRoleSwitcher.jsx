import React, { useState } from 'react';
import { 
  User, 
  Briefcase, 
  Sliders, 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Award,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import { DEMO_PERSONAS } from '../../data/coachingData';

export default function CoachingRoleSwitcher() {
  const { role, setRole, activeUser, setActiveUser } = useCoaching();
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);

  return (
    <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-3 sm:p-4 shadow-lg mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Role Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] shrink-0">
            Role:
          </span>
          <div className="inline-flex p-1 bg-[#0B0F14] border border-[#293442] rounded-xl" role="group" aria-label="Role Switcher">
            <button
              type="button"
              onClick={() => setRole('player')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === 'player'
                  ? 'bg-[#B6FF3B] text-[#0B0F14] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F5F7FA]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Player / Athlete</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('owner')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === 'owner'
                  ? 'bg-[#00D4FF] text-[#0B0F14] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F5F7FA]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Coach / Academy Owner</span>
            </button>
          </div>
        </div>

        {/* Right: Active Persona Card & Demo Persona Switcher Trigger */}
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
          <div className="flex items-center gap-2.5 bg-[#1B2530] border border-[#293442] px-3 py-1.5 rounded-xl">
            <img 
              src={activeUser.avatar} 
              alt={activeUser.name} 
              className="w-6 h-6 rounded-full object-cover border border-[#293442]" 
            />
            <div className="text-left">
              <div className="text-xs font-bold text-[#F5F7FA] leading-tight flex items-center gap-1.5">
                <span>{activeUser.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/50 text-[#00D4FF] font-mono">
                  {role === 'player' ? 'Athlete' : 'Academy Owner'}
                </span>
              </div>
              <div className="text-[10px] text-[#94A3B8]">
                {role === 'player' ? activeUser.locality || 'Pune' : activeUser.academyName || 'Sports Director'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPersonaModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#1B2530] text-[#F5F7FA] hover:text-white border border-[#293442] hover:border-[#00D4FF]/60 rounded-xl transition-all cursor-pointer"
            title="Switch demo persona"
          >
            <Sliders className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span className="hidden sm:inline">Demo Personas</span>
          </button>
        </div>
      </div>

      {/* Demo Persona Modal */}
      {isPersonaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141B24] border border-[#293442] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#293442] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Sliders className="w-5 h-5 text-[#00D4FF]" />
                <span>Test Role Personas</span>
              </div>
              <button 
                onClick={() => setIsPersonaModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-[#1B2530]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#94A3B8]">
              Switch demo accounts to test how SportLink behaves for both young athletes booking trial batches and academy owners managing coaches and schedules.
            </p>

            <div className="space-y-3">
              {DEMO_PERSONAS.map((persona) => {
                const isSelected = activeUser.id === persona.id;
                return (
                  <div
                    key={persona.id}
                    onClick={() => {
                      setActiveUser(persona);
                      setRole(persona.role);
                      setIsPersonaModalOpen(false);
                    }}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#1B2530] border-[#B6FF3B] shadow-md'
                        : 'bg-[#0B0F14] border-[#293442] hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className="w-10 h-10 rounded-xl object-cover border border-[#293442]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{persona.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            persona.role === 'player'
                              ? 'bg-[#B6FF3B]/15 text-[#B6FF3B]'
                              : 'bg-[#00D4FF]/15 text-[#00D4FF]'
                          }`}>
                            {persona.role === 'player' ? 'Athlete' : 'Academy Owner'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{persona.description}</p>
                      </div>
                    </div>

                    {isSelected ? (
                      <Check className="w-5 h-5 text-[#B6FF3B] shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#293442] text-[11px] text-gray-500 text-center">
              Prototype mode: In production, user roles and coaching authority are enforced via authenticated sessions.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
