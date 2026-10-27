import React from 'react';
import { Trophy, Calendar, CheckCircle2, ChevronRight, LayoutDashboard, Shield, Swords, Layers } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Button from './Button';
import Card from './Card';
import { SAMPLE_MANAGER_DATA } from '../data/sampleData';

export default function ManagerPreview({ onShowToast }) {
  const { tournamentTitle, category, standings, upcomingFixture, recentResult, knockoutBracket } =
    SAMPLE_MANAGER_DATA;

  const handleExploreManager = () => {
    onShowToast({
      title: 'Tournament Manager Portal (Demo)',
      message: 'Automated bracket generation, schedule builder, and live scorekeeping engine demo preview.',
      type: 'info',
      isDemo: true
    });
  };

  return (
    <section id="manager-preview" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        tag="Organiser Suite"
        title="Run Tournaments Without the Chaos."
        subtitle="Manage registrations, build real-time knockout brackets, automate standings, and broadcast fixtures without spreadsheets."
        action={
          <Button variant="primary" size="md" onClick={handleExploreManager}>
            Explore Tournament Manager
          </Button>
        }
      />

      {/* Main SaaS Dashboard Container */}
      <div className="bg-[#131a2b] border border-[#2a3652] rounded-[22px] p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Header of the simulated software */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#2a3652]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c6ff3d]/10 border border-[#c6ff3d]/30 flex items-center justify-center text-[#c6ff3d]">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Barlow_Condensed'] text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                  {tournamentTitle}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c6ff3d] bg-[#c6ff3d]/10 border border-[#c6ff3d]/30 px-2 py-0.5 rounded">
                  Live Stage
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {category} &bull; 16 Teams Registered &bull; Sample Manager View
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 bg-slate-800/90 px-3 py-1 rounded-lg border border-slate-700">
              Sample Control Centre
            </span>
          </div>
        </div>

        {/* Dashboard Grid: Left Table & Match Widgets; Right Bracket */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Column (Standings + Match Widgets) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Standings Table */}
            <div className="bg-[#172033] border border-[#2a3652] rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#c6ff3d]" />
                  Group Stage Standings (Sample)
                </h4>
                <span className="text-[11px] text-slate-400">P = Played, Pts = Points</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0a1020]/70 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-[#2a3652]">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Team</th>
                      <th className="py-2.5 px-2 text-center">P</th>
                      <th className="py-2.5 px-2 text-center">W</th>
                      <th className="py-2.5 px-2 text-center">D</th>
                      <th className="py-2.5 px-2 text-center">L</th>
                      <th className="py-2.5 px-2 text-center">GD</th>
                      <th className="py-2.5 px-3 text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a3652]/60 font-medium">
                    {standings.map((row) => (
                      <tr key={row.pos} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 font-bold">{row.pos}</td>
                        <td className="py-2.5 px-3 text-white font-semibold flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${row.pos <= 2 ? 'bg-[#c6ff3d]' : 'bg-slate-500'}`} />
                          {row.team}
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-300">{row.p}</td>
                        <td className="py-2.5 px-2 text-center text-emerald-400">{row.w}</td>
                        <td className="py-2.5 px-2 text-center text-amber-400">{row.d}</td>
                        <td className="py-2.5 px-2 text-center text-rose-400">{row.l}</td>
                        <td className="py-2.5 px-2 text-center text-slate-300">{row.gd}</td>
                        <td className="py-2.5 px-3 text-right font-black text-[#c6ff3d]">{row.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upcoming Fixture + Recent Result 2-column cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Upcoming Fixture */}
              <div className="bg-[#172033] border border-[#2a3652] rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Upcoming Fixture
                </span>
                <h5 className="font-['Barlow_Condensed'] text-base font-bold text-white mt-2 leading-tight">
                  {upcomingFixture.match}
                </h5>
                <div className="mt-2 text-xs text-slate-400 space-y-1">
                  <div>Timing: <span className="text-slate-200">{upcomingFixture.date}</span></div>
                  <div>Ground: <span className="text-slate-200">{upcomingFixture.venue}</span></div>
                </div>
              </div>

              {/* Recent Result */}
              <div className="bg-[#172033] border border-[#2a3652] rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                  Recent Result
                </span>
                <h5 className="font-['Barlow_Condensed'] text-base font-bold text-white mt-2 leading-tight">
                  {recentResult.match}
                </h5>
                <div className="mt-2 text-xs text-slate-400 space-y-1">
                  <div>Status: <span className="text-emerald-400 font-semibold">{recentResult.status}</span></div>
                  <div>Note: <span className="text-slate-200">{recentResult.topScorer}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 4-Team Knockout Bracket */}
          <div className="lg:col-span-5 bg-[#172033] border border-[#2a3652] rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#2a3652]">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-[#c6ff3d]" />
                  4-Team Knockout Bracket
                </h4>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Sample Bracket
                </span>
              </div>

              {/* Visual Bracket Flow */}
              <div className="mt-4 space-y-5">
                {/* Semi-Finals Label */}
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Semi-Finals &rarr; Grand Final
                </div>

                {/* Match 1 */}
                <div className="bg-[#0a1020]/90 border border-[#2a3652] rounded-lg p-2.5 space-y-1.5">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Semi-Final 1</div>
                  <div className="flex items-center justify-between text-xs py-0.5 px-2 rounded bg-slate-800/60 font-semibold text-emerald-400">
                    <span>{knockoutBracket.semis[0].teamA.name}</span>
                    <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded">{knockoutBracket.semis[0].teamA.score}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-0.5 px-2 rounded bg-slate-900/40 text-slate-400">
                    <span>{knockoutBracket.semis[0].teamB.name}</span>
                    <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded">{knockoutBracket.semis[0].teamB.score}</span>
                  </div>
                </div>

                {/* Match 2 */}
                <div className="bg-[#0a1020]/90 border border-[#2a3652] rounded-lg p-2.5 space-y-1.5">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Semi-Final 2</div>
                  <div className="flex items-center justify-between text-xs py-0.5 px-2 rounded bg-slate-800/60 font-semibold text-emerald-400">
                    <span>{knockoutBracket.semis[1].teamA.name}</span>
                    <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded">{knockoutBracket.semis[1].teamA.score}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-0.5 px-2 rounded bg-slate-900/40 text-slate-400">
                    <span>{knockoutBracket.semis[1].teamB.name}</span>
                    <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded">{knockoutBracket.semis[1].teamB.score}</span>
                  </div>
                </div>

                {/* Championship Match Card */}
                <div className="bg-gradient-to-r from-[#1b263b] to-[#121c2e] border border-[#c6ff3d]/50 rounded-xl p-3 shadow-lg">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#c6ff3d] mb-1.5">
                    <span>Final Match</span>
                    <span className="text-slate-400 text-[10px]">{knockoutBracket.final.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-white py-1 px-2">
                    <span>{knockoutBracket.final.teamA.name}</span>
                    <span className="text-[#c6ff3d]">VS</span>
                    <span>{knockoutBracket.final.teamB.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#2a3652] flex items-center justify-between">
              <span className="text-xs text-slate-400">Automated Seeding Engine</span>
              <button
                type="button"
                onClick={handleExploreManager}
                className="text-xs text-[#c6ff3d] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                Launch Live View &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
