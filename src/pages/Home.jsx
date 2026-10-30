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
        {/* THEMATIC ANIMATED SPORTS TACTICAL PITCH HERO BACKGROUND */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden select-none">
          {/* Sweeping Stadium Night Floodlights */}
          <div
            className="absolute -top-24 -left-24 w-[720px] h-[520px] rounded-full blur-[110px] pointer-events-none opacity-45 animate-pitch-sweep"
            style={{
              background: 'radial-gradient(circle, rgba(198, 255, 61, 0.22) 0%, rgba(16, 185, 129, 0.10) 45%, transparent 70%)'
            }}
          />
          <div
            className="absolute -bottom-24 -right-24 w-[650px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-40 animate-pitch-sweep"
            style={{
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(198, 255, 61, 0.08) 50%, transparent 70%)',
              animationDelay: '-8s'
            }}
          />

          {/* High-Visibility Full Sports Tactical Playbook SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 760"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="tacticalNeonGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c6ff3d" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.45" />
              </linearGradient>
              <linearGradient id="tacticalShotCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#c6ff3d" stopOpacity="0.7" />
              </linearGradient>
              <filter id="sportsGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Pitch Turf Grid & Touchline Markings */}
            <g opacity="0.38">
              {/* Outer Pitch Touchlines */}
              <rect x="60" y="40" width="1320" height="680" rx="16" fill="none" stroke="#c6ff3d" strokeWidth="1.5" strokeDasharray="16 10" />
              
              {/* Midfield Halfway Line */}
              <line x1="720" y1="40" x2="720" y2="720" stroke="#c6ff3d" strokeWidth="1.5" strokeDasharray="8 6" />
              
              {/* Center Circle & Center Spot */}
              <circle cx="720" cy="380" r="130" fill="none" stroke="#c6ff3d" strokeWidth="1.5" />
              <circle cx="720" cy="380" r="130" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="6 8" className="animate-spin-slow origin-[720px_380px]" />
              <circle cx="720" cy="380" r="5" fill="#c6ff3d" />

              {/* Left Penalty Box & Goal Arc */}
              <rect x="60" y="210" width="220" height="340" fill="none" stroke="#c6ff3d" strokeWidth="1.25" />
              <path d="M 280 320 A 70 70 0 0 1 280 440" fill="none" stroke="#c6ff3d" strokeWidth="1.25" strokeDasharray="5 5" />
              <circle cx="210" cy="380" r="4" fill="#c6ff3d" />

              {/* Right Penalty Box & Goal Arc */}
              <rect x="1160" y="210" width="220" height="340" fill="none" stroke="#c6ff3d" strokeWidth="1.25" />
              <path d="M 1160 320 A 70 70 0 0 0 1160 440" fill="none" stroke="#c6ff3d" strokeWidth="1.25" strokeDasharray="5 5" />
              <circle cx="1230" cy="380" r="4" fill="#c6ff3d" />

              {/* Corner Quarter Circles */}
              <path d="M 60 75 A 35 35 0 0 0 95 40" fill="none" stroke="#c6ff3d" strokeWidth="1.5" />
              <path d="M 1380 75 A 35 35 0 0 1 1345 40" fill="none" stroke="#c6ff3d" strokeWidth="1.5" />
              <path d="M 60 685 A 35 35 0 0 1 95 720" fill="none" stroke="#c6ff3d" strokeWidth="1.5" />
              <path d="M 1380 685 A 35 35 0 0 0 1345 720" fill="none" stroke="#c6ff3d" strokeWidth="1.5" />
            </g>

            {/* Multi-Sport Court Accent: Basketball / Badminton Key Wireframe in upper area */}
            <g opacity="0.3">
              <path d="M 60 120 H 180 A 90 90 0 0 1 180 260 H 60" fill="none" stroke="#38bdf8" strokeWidth="1.25" strokeDasharray="6 4" />
              <circle cx="150" cy="190" r="14" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
            </g>

            {/* Athletics Track Sprint Lanes with Speed Markers along lower boundary */}
            <g opacity="0.32">
              <line x1="80" y1="670" x2="650" y2="670" stroke="#c6ff3d" strokeWidth="1" strokeDasharray="14 8" className="animate-dash-flow" />
              <line x1="80" y1="695" x2="650" y2="695" stroke="#38bdf8" strokeWidth="1" strokeDasharray="14 8" className="animate-dash-flow" style={{ animationDirection: 'reverse' }} />
              <text x="90" y="663" fill="#c6ff3d" fontFamily="monospace" fontSize="9" fontWeight="bold" letterSpacing="2">LANE 01 // 100M SPRINT VELOCITY</text>
              <text x="90" y="714" fill="#38bdf8" fontFamily="monospace" fontSize="9" fontWeight="bold" letterSpacing="2">LANE 02 // AGILITY ACCELERATION</text>
            </g>

            {/* DYNAMIC TACTICAL ATTACK PLAYBOOK (PASS & MOVE SEQUENCING) */}
            <g filter="url(#sportsGlow)" opacity="0.8">
              {/* Tactical Pass 1: Midfielder [08] to Playmaker [10] */}
              <path
                d="M 230 520 Q 340 380, 480 340"
                fill="none"
                stroke="url(#tacticalNeonGreen)"
                strokeWidth="2.5"
                strokeDasharray="10 8"
                className="animate-dash-flow"
              />

              {/* Tactical Pass 2: Playmaker [10] Through-Ball to Striker [09] */}
              <path
                d="M 520 320 Q 720 180, 890 240"
                fill="none"
                stroke="url(#tacticalNeonGreen)"
                strokeWidth="2.5"
                strokeDasharray="12 8"
                className="animate-dash-flow"
                style={{ animationDuration: '6s' }}
              />

              {/* Tactical Shot on Goal: Striker [09] to Goal Target */}
              <path
                d="M 930 230 L 1150 150"
                fill="none"
                stroke="url(#tacticalShotCyan)"
                strokeWidth="3"
                strokeDasharray="14 6"
                className="animate-dash-flow"
                style={{ animationDuration: '3s' }}
              />
              {/* Arrowhead on Shot Vector */}
              <polygon points="1155,148 1135,140 1142,156" fill="#38bdf8" />

              {/* Player Node 08 (Center Midfielder) */}
              <g transform="translate(210, 530)">
                <circle cx="0" cy="0" r="18" fill="#0B0F14" stroke="#c6ff3d" strokeWidth="2" />
                <circle cx="0" cy="0" r="26" fill="none" stroke="#c6ff3d" strokeWidth="1" strokeDasharray="4 4" className="animate-spin-slow origin-center" />
                <text x="0" y="4" textAnchor="middle" fill="#c6ff3d" fontFamily="monospace" fontSize="10" fontWeight="bold">08</text>
                <text x="28" y="4" fill="#c6ff3d" fontFamily="monospace" fontSize="9" fontWeight="bold" letterSpacing="1">MID</text>
              </g>

              {/* Player Node 10 (Playmaker) */}
              <g transform="translate(500, 330)">
                <circle cx="0" cy="0" r="20" fill="#0B0F14" stroke="#c6ff3d" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="30" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="6 4" className="animate-spin-slow origin-center" />
                <text x="0" y="5" textAnchor="middle" fill="#c6ff3d" fontFamily="monospace" fontSize="11" fontWeight="bold">10</text>
                <text x="32" y="5" fill="#38bdf8" fontFamily="monospace" fontSize="9" fontWeight="bold" letterSpacing="1">PLAYMAKER</text>
              </g>

              {/* Player Node 09 (Striker) */}
              <g transform="translate(910, 235)">
                <circle cx="0" cy="0" r="20" fill="#0B0F14" stroke="#c6ff3d" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="32" fill="none" stroke="#c6ff3d" strokeWidth="1.25" strokeDasharray="5 5" className="animate-spin-slow origin-center" />
                <text x="0" y="5" textAnchor="middle" fill="#c6ff3d" fontFamily="monospace" fontSize="11" fontWeight="bold">09</text>
                <text x="32" y="5" fill="#c6ff3d" fontFamily="monospace" fontSize="9" fontWeight="bold" letterSpacing="1">STRIKER</text>
              </g>

              {/* Goal Post Target Lock Reticle */}
              <g transform="translate(1160, 145)">
                <circle cx="0" cy="0" r="16" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 4" className="animate-spin-slow origin-center" />
                <circle cx="0" cy="0" r="5" fill="#38bdf8" />
                <line x1="-22" y1="0" x2="22" y2="0" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="0" y1="-22" x2="0" y2="22" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="26" y="4" fill="#38bdf8" fontFamily="monospace" fontSize="9" fontWeight="bold" letterSpacing="1">TARGET LOCK</text>
              </g>

              {/* Opposition Defenders 'X' Markers */}
              <g transform="translate(680, 260)" opacity="0.65">
                <line x1="-8" y1="-8" x2="8" y2="8" stroke="#ef4444" strokeWidth="2.5" />
                <line x1="8" y1="-8" x2="-8" y2="8" stroke="#ef4444" strokeWidth="2.5" />
                <text x="12" y="4" fill="#ef4444" fontFamily="monospace" fontSize="8" fontWeight="bold">DEF</text>
              </g>
              <g transform="translate(820, 360)" opacity="0.65">
                <line x1="-8" y1="-8" x2="8" y2="8" stroke="#ef4444" strokeWidth="2.5" />
                <line x1="8" y1="-8" x2="-8" y2="8" stroke="#ef4444" strokeWidth="2.5" />
                <text x="12" y="4" fill="#ef4444" fontFamily="monospace" fontSize="8" fontWeight="bold">DEF</text>
              </g>
            </g>

            {/* Pitch Telemetry HUD Readout */}
            <g opacity="0.45">
              <text x="90" y="80" fill="#c6ff3d" fontFamily="monospace" fontSize="11" fontWeight="bold" letterSpacing="2">SPORTLINK TACTICAL PITCH // LIVE PLAYBOOK</text>
              <text x="90" y="100" fill="#94a3b8" fontFamily="monospace" fontSize="9" letterSpacing="1">TACTIC: 4-3-3 ATTACK // TEMPO: HIGH</text>
              <text x="1120" y="80" fill="#38bdf8" fontFamily="monospace" fontSize="10" fontWeight="bold" letterSpacing="2">SECTOR: ATTACKING THIRD</text>
            </g>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Headlines & Navigation */}
            <div className="lg:col-span-7 space-y-6 text-left">
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
              <div
                className="w-full max-w-md rounded-[24px] p-6 sm:p-8 shadow-2xl relative group transition-all duration-300 backdrop-blur-2xl hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 25%, rgba(15, 23, 42, 0.45) 60%, rgba(10, 16, 28, 0.55) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.38)',
                  boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.55), 0 0 30px -5px rgba(198, 255, 61, 0.10), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)'
                }}
              >
                {/* Subtle glass reflection highlight streak */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

                <div className="space-y-3">
                  <h2 className="font-['Barlow_Condensed'] text-2xl sm:text-3xl font-black uppercase tracking-wide text-white leading-tight">
                    Your next game starts here
                  </h2>
                  <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
                    Navigate to dedicated sections for turf booking, competitive tournament registrations, college matchmaking, and talent scouting.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Ready to play?</span>
                  <Link to="/facilities" className="text-[#c6ff3d] font-bold hover:underline flex items-center gap-1 transition-colors group-hover:text-[#d4ff66]">
                    Browse grounds <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
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
      <section className="py-20 sm:py-24 bg-[#131a2b]/75 backdrop-blur-md border-y border-[#2a3652]/60">
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
