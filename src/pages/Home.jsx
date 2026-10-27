import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Flame,
  Activity,
  Trophy,
  Users,
  GraduationCap,
  Compass,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Tag from '../components/Tag';
import { HOME_CATEGORIES, HOW_IT_WORKS_STEPS } from '../data/sampleData';

export default function Home() {
  useEffect(() => {
    document.title = 'SportLink | Your Game. Your Ground. Your Opportunity.';
  }, []);

  const iconMap = {
    Flame: <Flame className="w-6 h-6 text-emerald-400" />,
    Activity: <Activity className="w-6 h-6 text-sky-400" />,
    Trophy: <Trophy className="w-6 h-6 text-amber-400" />,
    Users: <Users className="w-6 h-6 text-indigo-400" />,
    GraduationCap: <GraduationCap className="w-6 h-6 text-purple-400" />,
    Compass: <Compass className="w-6 h-6 text-rose-400" />
  };

  const stepIcons = {
    Compass: <Compass className="w-7 h-7 text-[#c6ff3d]" />,
    Users: <Users className="w-7 h-7 text-sky-400" />,
    Trophy: <Trophy className="w-7 h-7 text-amber-400" />
  };

  return (
    <div className="animate-hero-fade">
      {/* SECTION A: Hero */}
      <section className="relative pt-12 pb-20 sm:pt-18 sm:pb-28 overflow-hidden border-b border-[#2a3652]/40">
        {/* Background Court Art & Photo Replacement Slot */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          {/* PHOTO SLOT: Replace the below SVG court and gradients with a real stadium/turf photo when available */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#c6ff3d]/10 via-[#1e2d4d]/25 to-transparent rounded-full blur-3xl opacity-70" />
          <div className="absolute top-10 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-emerald-500/10 via-sky-500/5 to-transparent rounded-full blur-3xl opacity-40" />

          {/* SVG Court Line schematic */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.07] stroke-slate-200"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="50%" cy="50%" r="220" />
            <line x1="50%" y1="0" x2="50%" y2="100%" />
            <rect x="25%" y="20%" width="50%" height="60%" rx="14" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1020]/60 via-[#0a1020]/90 to-[#0a1020]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Headlines & Navigation */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <Tag variant="lime">Your Game. Your Ground. Your Opportunity.</Tag>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white font-['Barlow_Condensed'] leading-[0.98]">
                Find Your Game. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#c6ff3d]">
                  Own Your Moment.
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-[#a3afc6] leading-relaxed max-w-2xl">
                Discover sports venues, join tournaments, connect with teams, and unlock opportunities to take your game further, all in one place.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/facilities">
                  <Button variant="primary" size="lg" className="group">
                    <span>Explore Facilities</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/tournaments">
                  <Button variant="outline" size="lg">
                    Discover Tournaments
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Floating Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-md bg-gradient-to-br from-[#172033] to-[#111827] border border-[#2a3652] rounded-[22px] p-6 sm:p-7 shadow-2xl relative group hover:border-[#c6ff3d]/60 transition-all duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-[#2a3652]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#c6ff3d] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#c6ff3d] animate-ping" />
                    SportLink Platform Shell
                  </span>
                  <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    Demo Shell
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#c6ff3d]/10 border border-[#c6ff3d]/30 flex items-center justify-center text-[#c6ff3d]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase tracking-wide text-white">
                    Your next game starts here
                  </h2>
                  <p className="text-xs sm:text-sm text-[#a3afc6] leading-relaxed">
                    Navigate to dedicated sections for turf booking, competitive tournament registrations, college matchmaking, and talent scouting.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#2a3652] flex items-center justify-between text-xs">
                  <span className="text-slate-400">Ready to play?</span>
                  <Link to="/facilities" className="text-[#c6ff3d] font-bold hover:underline flex items-center gap-1">
                    Browse grounds <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: "Find your way to play" */}
      <section className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-left max-w-3xl">
          <Tag variant="lime" className="mb-3">Explore Ecosystem</Tag>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-['Barlow_Condensed'] leading-tight">
            Find your way to play
          </h2>
          <p className="mt-2 text-base text-[#a3afc6]">
            Select a pathway to explore grounds, organize fixtures, or accelerate your athletic career.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {HOME_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={cat.href}
              className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c6ff3d] rounded-[18px]"
            >
              <Card className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.accentColor} border border-white/10 flex items-center justify-center transition-transform group-hover:scale-105`}
                    >
                      {iconMap[cat.icon]}
                    </div>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-[#c6ff3d] flex items-center gap-1 transition-colors">
                      Explore <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>

                  <h3 className="font-['Barlow_Condensed'] text-2xl font-black text-white group-hover:text-[#c6ff3d] transition-colors uppercase tracking-wide">
                    {cat.title}
                  </h3>

                  <p className="text-sm text-[#a3afc6] mt-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#2a3652]/70 flex items-center justify-between text-xs text-slate-400">
                  <span>Go to dedicated page</span>
                  <span className="text-[#c6ff3d] font-bold group-hover:underline">
                    View &rarr;
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION C: "How SportLink works" */}
      <section className="py-20 sm:py-24 bg-[#131a2b] border-y border-[#2a3652]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <Tag variant="lime" className="mb-3">Streamlined Experience</Tag>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-['Barlow_Condensed']">
              How SportLink works
            </h2>
            <p className="mt-2 text-base text-[#a3afc6]">
              A unified network built to connect every tier of modern sports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div
                key={step.step}
                className="bg-[#172033] border border-[#2a3652] rounded-[18px] p-7 flex flex-col justify-between hover:border-[#c6ff3d]/60 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-13 h-13 rounded-2xl bg-[#0a1020] border border-[#2a3652] flex items-center justify-center p-3">
                      {stepIcons[step.icon]}
                    </div>
                    <span className="font-['Barlow_Condensed'] text-3xl font-black text-slate-600">
                      {step.step}
                    </span>
                  </div>

                  <h3 className="font-['Barlow_Condensed'] text-2xl font-black text-white uppercase tracking-wide">
                    {step.title}
                  </h3>

                  <p className="text-sm text-[#a3afc6] mt-2.5 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[#2a3652]/70 text-xs font-semibold text-[#c6ff3d]">
                  Step {step.step} of 03
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION D: Final CTA */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[22px] overflow-hidden border border-[#2a3652] bg-gradient-to-br from-[#172033] via-[#101726] to-[#0a1020] p-8 sm:p-14 text-center sm:text-left shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4">
              <Tag variant="lime">Get In The Game</Tag>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-['Barlow_Condensed'] leading-tight">
                Ready to get in the game?
              </h2>

              <p className="text-base sm:text-lg text-[#a3afc6] max-w-xl">
                Your next venue, teammate, tournament, or opportunity is waiting. Select an option to get started.
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
                <Link to="/facilities">
                  <Button variant="primary" size="lg" className="group">
                    <span>Explore Facilities</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/tournaments">
                  <Button variant="outline" size="lg">
                    Browse Tournaments
                  </Button>
                </Link>
              </div>
            </div>

            <div className="md:col-span-4 flex justify-center md:justify-end">
              <div className="w-44 h-44 rounded-2xl bg-[#0a1020]/90 border border-[#2a3652] p-4 flex flex-col items-center justify-center text-center space-y-2">
                <Trophy className="w-10 h-10 text-[#c6ff3d]" />
                <span className="font-['Barlow_Condensed'] text-lg font-bold uppercase text-white">
                  SportLink Portal
                </span>
                <span className="text-[11px] text-slate-400">
                  Multi-page prototype
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
