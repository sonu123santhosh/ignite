import React from 'react';
import { ArrowRight, Trophy, Users, ShieldCheck, Play, Sparkles, MapPin, Calendar } from 'lucide-react';
import Button from './Button';
import { STATS_STRIP } from '../data/sampleData';

export default function Hero({ onExploreSports, onDiscoverTournaments }) {
  return (
    <section id="home" className="relative pt-8 pb-20 sm:pt-14 sm:pb-28 overflow-hidden">
      {/* Background Court Line Graphic / Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#c6ff3d]/10 via-[#1e2d4d]/30 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-10 right-0 w-[450px] h-[450px] bg-gradient-to-bl from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl opacity-50" />

        {/* SVG Court Art Overlay */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.06] stroke-slate-200"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="50%" cy="50%" r="220" />
          <line x1="50%" y1="0" x2="50%" y2="100%" />
          <rect x="25%" y="20%" width="50%" height="60%" rx="12" />
          <circle cx="50%" cy="50%" r="6" fill="currentColor" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 text-left space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#172033] border border-[#2a3652] text-xs font-semibold tracking-wider uppercase text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#c6ff3d] animate-pulse" />
              <span>Your Game. Your Ground. Your Opportunity.</span>
            </div>

            {/* H1 Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white font-['Barlow_Condensed'] leading-[0.98]">
              Find Your Game. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#c6ff3d]">
                Own Your Moment.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg md:text-xl text-[#a3afc6] leading-relaxed max-w-2xl font-normal">
              Discover sports venues, join tournaments, connect with college teams, and unlock opportunities to take your game further, all in one place.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
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
                onClick={onDiscoverTournaments}
              >
                Discover Tournaments
              </Button>
            </div>

            {/* Micro Credibility Text */}
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#c6ff3d]" /> Transparent Pricing
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#c6ff3d]" /> College Team Matchmaking
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#c6ff3d]" /> Bracket Management
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual Card Slot & Floating Card */}
          <div className="lg:col-span-5 relative">
            {/* Visual Container representing a sports pitch / dynamic arena */}
            <div className="relative rounded-[22px] overflow-hidden border border-[#2a3652] bg-gradient-to-br from-[#172033] via-[#101726] to-[#0a1020] p-6 sm:p-8 shadow-2xl shadow-black/60">
              {/* Slot easy to replace with real photo */}
              <div
                className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-[#2a3652]/60 bg-[#0d1424] flex flex-col justify-between p-5"
                role="img"
                aria-label="Court-line schematic illustration and active game matchmaker slot"
              >
                {/* SVG Court schematic background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/40 via-[#131d33]/80 to-[#192642]/60" />
                <svg
                  className="absolute inset-0 w-full h-full stroke-[#c6ff3d]/20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  strokeWidth="1.2"
                >
                  <circle cx="50%" cy="50%" r="60" strokeDasharray="3 3" />
                  <rect x="15" y="15" width="calc(100% - 30px)" height="calc(100% - 30px)" rx="10" />
                  <line x1="50%" y1="15" x2="50%" y2="calc(100% - 15px)" />
                  <rect x="15" y="30%" width="30%" height="40%" />
                  <rect x="calc(70% - 15px)" y="30%" width="30%" height="40%" />
                </svg>

                {/* Top tags on visual */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-[#0a1020]/80 border border-[#2a3652] text-[11px] font-bold text-[#c6ff3d] flex items-center gap-1.5 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c6ff3d] animate-ping" />
                    MATCHDAY LIVE (SAMPLE)
                  </span>
                  <span className="text-[11px] text-slate-300 bg-[#0a1020]/70 px-2 py-0.5 rounded border border-slate-700">
                    Slot: Koramangala 7v7
                  </span>
                </div>

                {/* Middle Match preview mockup */}
                <div className="relative z-10 bg-[#0a1020]/90 border border-[#2a3652] rounded-xl p-3 backdrop-blur-md">
                  <div className="flex items-center justify-between text-xs text-slate-300 pb-1.5 border-b border-slate-800">
                    <span className="font-semibold text-white">St. Joseph's Hawks</span>
                    <span className="text-[#c6ff3d] font-bold">VS</span>
                    <span className="font-semibold text-white">Apex Strikers</span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#c6ff3d]" /> Apex Turf Arena
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> Saturday, 18:00
                    </span>
                  </div>
                </div>

                {/* Bottom caption */}
                <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Photo / Graphic Demonstration Slot</span>
                  <span className="text-[#c6ff3d]">Ready for photo drop-in</span>
                </div>
              </div>

              {/* Floating Card: "Your next game starts here" */}
              <div className="mt-5 bg-[#172033] border border-[#2a3652] hover:border-[#c6ff3d]/60 rounded-xl p-4 shadow-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#c6ff3d]/10 border border-[#c6ff3d]/30 flex items-center justify-center text-[#c6ff3d]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-['Barlow_Condensed'] text-base tracking-wide uppercase">
                      Your next game starts here
                    </h3>
                    <p className="text-xs text-[#a3afc6]">
                      Connect with local squads and turf owners across 8+ cities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Strip with Demo Data labels */}
        <div className="mt-14 pt-8 border-t border-[#2a3652]/70">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {STATS_STRIP.map((stat, idx) => (
              <div
                key={idx}
                className="bg-[#172033]/60 border border-[#2a3652] rounded-xl p-4 sm:p-5 text-center sm:text-left transition-colors hover:border-[#2a3652]/90"
              >
                <div className="flex items-baseline justify-center sm:justify-start gap-2">
                  <span className="font-['Barlow_Condensed'] text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#c6ff3d] bg-[#c6ff3d]/10 px-1.5 py-0.5 rounded">
                    {stat.note}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
