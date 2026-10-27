import React from 'react';
import { ArrowRight, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import Button from './Button';

export default function FinalCTA({ onExploreSports, onJoinSportLink }) {
  return (
    <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-[26px] overflow-hidden border border-[#2a3652] bg-gradient-to-br from-[#172033] via-[#101726] to-[#0a1020] p-8 sm:p-14 lg:p-16 shadow-2xl">
        {/* Background Court Art / Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-[#c6ff3d]/10 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-0 left-10 w-[350px] h-[350px] bg-sky-500/10 rounded-full blur-3xl opacity-40" />

          {/* SVG Court schematic */}
          <svg
            className="absolute inset-0 w-full h-full opacity-5 stroke-white"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <rect x="5%" y="10%" width="90%" height="80%" rx="16" />
            <circle cx="50%" cy="50%" r="160" />
            <line x1="50%" y1="10%" x2="50%" y2="90%" />
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a1020] border border-[#2a3652] text-xs font-bold text-[#c6ff3d] uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Get Connected Today</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-['Barlow_Condensed'] leading-[1.02]">
              Ready to Get in the Game?
            </h2>

            <p className="text-base sm:text-lg text-[#a3afc6] max-w-2xl leading-relaxed">
              Your next venue, teammate, tournament, or opportunity is waiting. Whether you are an athlete, academy, or ground owner &mdash; SportLink brings it together.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Button
                variant="primary"
                size="lg"
                onClick={onExploreSports}
                className="group"
              >
                <span>Explore Sports</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onJoinSportLink}
              >
                Join SportLink
              </Button>
            </div>
          </div>

          {/* Photo / Graphic Replacement Slot */}
          <div className="lg:col-span-4">
            <div
              className="relative h-56 sm:h-64 rounded-2xl overflow-hidden border border-[#2a3652] bg-[#0d1424] p-5 flex flex-col justify-between"
              role="img"
              aria-label="Athletic stadium floodlight illustration and photo replacement slot"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/40 to-[#192642]/60" />
              <svg
                className="absolute inset-0 w-full h-full stroke-[#c6ff3d]/15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                strokeWidth="1.5"
              >
                <circle cx="50%" cy="50%" r="50" />
                <path d="M0 0L100 100M100 0L0 100" strokeWidth="0.5" />
              </svg>

              <div className="relative z-10 flex items-center justify-between text-xs text-slate-300">
                <span className="bg-[#0a1020]/90 px-2.5 py-1 rounded-md border border-slate-700 font-bold text-[#c6ff3d]">
                  SLOT: CTA ART
                </span>
                <span className="text-[11px] text-slate-400">Sample Visual</span>
              </div>

              <div className="relative z-10 text-center space-y-1">
                <div className="text-sm font-bold text-white font-['Barlow_Condensed'] uppercase tracking-wider">
                  Stadium Photo Replacement Slot
                </div>
                <div className="text-xs text-slate-400">
                  Ready to accept high-res sports photography with responsive fallbacks.
                </div>
              </div>

              <div className="relative z-10 text-[10px] text-slate-500 text-center">
                Replace with &lt;img src=&quot;...&quot; alt=&quot;Athletes celebrating on turf&quot; /&gt;
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
