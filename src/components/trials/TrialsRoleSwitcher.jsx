import React, { useState } from 'react';
import { User, Shield, ChevronDown, CheckCircle2, Sparkles, X } from 'lucide-react';
import { useTrials } from '../../context/TrialsContext';
import { DEMO_PERSONAS } from '../../data/trialsData';

export default function TrialsRoleSwitcher() {
  const { role, setRole, activeUser, setActiveUser } = useTrials();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141B24] border border-[#293442] p-2.5 rounded-2xl shadow-lg">
        {/* Role Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0B0F14] rounded-xl border border-[#293442]">
          <button
            type="button"
            onClick={() => setRole('athlete')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              role === 'athlete'
                ? 'bg-[#B6FF3B] text-[#0B0F14] shadow-md shadow-[#B6FF3B]/10'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Athlete / Player</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('organiser')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              role === 'organiser'
                ? 'bg-[#00D4FF] text-[#0B0F14] shadow-md shadow-[#00D4FF]/10'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Trial Organiser</span>
          </button>
        </div>

        {/* Current Demo Persona Pill */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-[11px] font-mono text-[#94A3B8]">
            Demo Persona:
          </span>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1B2530] hover:bg-[#22303e] border border-[#293442] text-xs font-semibold text-white transition-all cursor-pointer"
          >
            <img
              src={activeUser.avatar}
              alt={activeUser.name}
              className="w-5 h-5 rounded-full object-cover border border-[#B6FF3B]/50"
            />
            <span className="max-w-[120px] truncate">{activeUser.name}</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {activeUser.role}
            </span>
            <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
          </button>
        </div>
      </div>

      {/* Demo Persona Switcher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#141B24] border border-[#293442] rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#293442] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B6FF3B]" />
                  <h3 className="font-extrabold text-white text-base">Select Demo Persona</h3>
                </div>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Test the role-based features from the viewpoint of different athletes and trial directors.
                </p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3">
              {DEMO_PERSONAS.map((p) => {
                const isSelected = activeUser.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setActiveUser(p);
                      setRole(p.role);
                      setIsModalOpen(false);
                    }}
                    className={`w-full flex items-start gap-3.5 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1B2530] border-[#B6FF3B]/60 shadow-lg shadow-[#B6FF3B]/5'
                        : 'bg-[#0B0F14] border-[#293442] hover:border-slate-500 hover:bg-[#141B24]'
                    }`}
                  >
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-sm truncate">{p.name}</span>
                        <span
                          className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                            p.role === 'athlete'
                              ? 'bg-[#B6FF3B]/15 text-[#B6FF3B] border border-[#B6FF3B]/30'
                              : 'bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30'
                          }`}
                        >
                          {p.role}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        {p.role === 'athlete'
                          ? `${p.sport} • ${p.position || p.experience} • ${p.city} (${p.age} yrs)`
                          : `${p.title} • ${p.organisationName}`}
                      </p>
                      {p.age && p.age < 18 && (
                        <span className="inline-block mt-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          Minor Athlete (Requires Guardian Consent)
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-[#B6FF3B] shrink-0 self-center" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#293442] flex items-center justify-between">
              <span className="text-[11px] text-[#94A3B8]">
                Changes dashboard, action buttons, and access rights instantly.
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1B2530] hover:bg-[#253241] text-xs font-bold text-white border border-[#293442] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
