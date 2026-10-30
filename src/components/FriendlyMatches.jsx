import React from 'react';
import { Users, Send, ShieldCheck, Check, Calendar, MapPin, Swords, PlusCircle } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Button from './Button';
import Card from './Card';
import { SAMPLE_COLLEGE_TEAMS } from '../data/sampleData';

export default function FriendlyMatches({ onShowToast }) {
  const handleSendInvite = (team) => {
    onShowToast({
      title: `Invite Sent: ${team.name}`,
      message: `Friendly challenge request dispatched to ${team.captain}. Scheduled slot preference: ${team.preferredSlot}. (Demo simulation)`,
      type: 'success',
      isDemo: true
    });
  };

  const handlePostRequest = () => {
    onShowToast({
      title: 'Match Request Form (Demo)',
      message: 'Varsity friendly match request broadcast is simulated in this prototype.',
      type: 'info',
      isDemo: true
    });
  };

  const handleFindFriendlyMatches = () => {
    onShowToast({
      title: 'College Matchmaking Directory',
      message: 'Displaying 4 active collegiate rosters ready for weekend fixtures.',
      type: 'info',
      isDemo: true
    });
  };

  return (
    <section id="friendly-matches" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        tag="College Matchmaking"
        title="Your College. Their Challenge."
        subtitle="Coordinate competitive weekend friendlies, arrange turf bookings, and play against collegiate squads at your skill tier."
        action={
          <Button variant="stadium" size="md" onClick={handleFindFriendlyMatches}>
            Find Friendly Matches
          </Button>
        }
      />

      {/* Two Strategy Panels: Find Opponents vs Post a Match Request */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Panel 1: Find Opponents */}
        <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 hover:border-sky-400/50 hover:shadow-[0_12px_36px_rgba(14,165,233,0.15)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all">
          <div>
            <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 mb-4 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <Swords className="w-6 h-6" />
            </div>
            <h3 className="font-['Barlow_Condensed'] text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
              Find Opponents
            </h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Discover verified collegiate squads and university clubs across football, cricket, basketball, and badminton.
            </p>

            <ul className="mt-5 space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                <span>Filter by athletic division (Varsity D1, Inter-Collegiate, Club).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                <span>Transparent ground sharing: home ground ready or split-cost away fixture.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                <span>Direct captain-to-captain match requests without leaked contact info.</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-sky-500/20">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto hover:border-sky-400 hover:text-sky-300"
              onClick={handleFindFriendlyMatches}
            >
              Browse Active Rosters
            </Button>
          </div>
        </div>

        {/* Panel 2: Post a Match Request */}
        <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 hover:border-emerald-400/50 hover:shadow-[0_12px_36px_rgba(16,185,129,0.15)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="font-['Barlow_Condensed'] text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
              Post a Match Request
            </h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Have an open turf slot this weekend? Broadcast a game invitation to rival colleges in your city.
            </p>

            <ul className="mt-5 space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Specify preferred match date, kick-off time, and turf venue.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Indicate team skill level to ensure competitive, balanced fixtures.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Automated confirmation notice when both teams agree on rules.</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-sky-500/20">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto hover:border-emerald-400 hover:text-emerald-300"
              onClick={handlePostRequest}
            >
              Post Fixture Notice (Demo)
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Sample College Team Cards */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-['Barlow_Condensed'] text-xl font-bold uppercase tracking-wide text-white">
          Active Collegiate Teams (Sample Roster)
        </h3>
        <span className="text-xs text-sky-300 bg-sky-500/15 px-2.5 py-0.5 rounded-full border border-sky-400/30">
          Demo listings
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {SAMPLE_COLLEGE_TEAMS.map((team) => (
          <Card
            key={team.id}
            className="flex flex-col justify-between group hover:border-sky-400/50 hover:shadow-[0_12px_36px_rgba(14,165,233,0.15)] bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 transition-all p-5"
          >
            <div>
              {/* Sport & City */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 bg-sky-500/15 px-2 py-0.5 rounded border border-sky-400/30">
                  {team.sport}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-sky-400" />
                  {team.city}
                </span>
              </div>

              {/* Team Name & College */}
              <h4 className="font-['Barlow_Condensed'] text-xl font-black text-white group-hover:text-sky-300 transition-colors leading-snug">
                {team.name}
              </h4>
              <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                {team.college}
              </p>

              {/* Level & Record Badge */}
              <div className="mt-3 flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-[#070d1a]/80 border border-sky-500/20">
                <span className="text-slate-300 font-medium">{team.level}</span>
                <span className="text-emerald-400 font-bold">{team.record}</span>
              </div>

              {/* Ground Availability */}
              <div className="mt-3 text-xs space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                      team.groundAvailable ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    }`}
                  />
                  <span className="text-slate-300 leading-tight">
                    {team.groundDetails}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Preferred slot: <span className="text-slate-200">{team.preferredSlot}</span>
                </div>
              </div>
            </div>

            {/* Bottom: Verification status & Send Invite Button */}
            <div className="mt-5 pt-3 border-t border-sky-500/20 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  {team.verificationStatus}
                </span>
                <span className="text-slate-400 truncate max-w-[110px]">
                  Capt: {team.captain.split(' ')[0]}
                </span>
              </div>

              <Button
                variant="stadium"
                size="sm"
                className="w-full flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/30"
                onClick={() => handleSendInvite(team)}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Invite</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
