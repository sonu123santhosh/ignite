import React, { useState, useMemo } from 'react';
import { Trophy, Calendar, MapPin, Users, IndianRupee, Clock, Filter, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Button from './Button';
import Card from './Card';
import { SAMPLE_TOURNAMENTS, SPORTS_OPTIONS } from '../data/sampleData';

export default function TournamentSection({ onShowToast }) {
  const [sportFilter, setSportFilter] = useState('All');
  const [locationQuery, setLocationQuery] = useState('');
  const [onOrAfterDate, setOnOrAfterDate] = useState('');
  const [maxEntryFee, setMaxEntryFee] = useState(5000);

  // Filter tournaments instantly
  const filteredTournaments = useMemo(() => {
    return SAMPLE_TOURNAMENTS.filter((t) => {
      const matchSport = sportFilter === 'All' || t.sport.toLowerCase() === sportFilter.toLowerCase();
      const matchLocation =
        !locationQuery.trim() ||
        t.location.toLowerCase().includes(locationQuery.trim().toLowerCase());
      const matchDate =
        !onOrAfterDate || new Date(t.eventDate) >= new Date(onOrAfterDate);
      const matchFee = t.entryFee <= maxEntryFee;

      return matchSport && matchLocation && matchDate && matchFee;
    });
  }, [sportFilter, locationQuery, onOrAfterDate, maxEntryFee]);

  const handleRegisterClick = (tourn) => {
    onShowToast({
      title: `Registration Request: ${tourn.name}`,
      message: `Simulated registration for ${tourn.teamSize}. Entry fee: ₹${tourn.entryFee}. No fee or real entry was processed.`,
      type: 'info',
      isDemo: true
    });
  };

  const handleResetFilters = () => {
    setSportFilter('All');
    setLocationQuery('');
    setOnOrAfterDate('');
    setMaxEntryFee(5000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Closing soon':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Waitlist':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <section id="tournaments" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        tag="Compete & Win"
        title="Your Next Competition Awaits"
        subtitle="Browse verified local leagues, collegiate Invitationals, and knockout tournaments. All listings marked as sample data."
        action={
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              handleResetFilters();
              onShowToast({
                title: 'All Tournaments (Demo)',
                message: 'Viewing all 6 sample tournament brackets currently scheduled.',
                type: 'info',
                isDemo: true
              });
            }}
          >
            View All Tournaments
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <div className="bg-[#131a2b] border border-[#2a3652] rounded-2xl p-4 sm:p-5 mb-8">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-[#c6ff3d]">
          <Filter className="w-4 h-4" />
          <span>Filter Tournaments</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Sport Filter */}
          <div>
            <label htmlFor="filter-tourn-sport" className="block text-xs font-semibold text-slate-300 mb-1">
              Sport
            </label>
            <select
              id="filter-tourn-sport"
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="w-full bg-[#172033] border border-[#2a3652] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c6ff3d] cursor-pointer"
            >
              <option value="All">All Sports</option>
              {SPORTS_OPTIONS.filter((s) => s !== 'All Sports').map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Location Query */}
          <div>
            <label htmlFor="filter-tourn-loc" className="block text-xs font-semibold text-slate-300 mb-1">
              Location / City
            </label>
            <input
              id="filter-tourn-loc"
              type="text"
              placeholder="e.g. Bengaluru, Mumbai..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full bg-[#172033] border border-[#2a3652] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c6ff3d]"
            />
          </div>

          {/* On or after Date */}
          <div>
            <label htmlFor="filter-tourn-date" className="block text-xs font-semibold text-slate-300 mb-1">
              On or After Date
            </label>
            <input
              id="filter-tourn-date"
              type="date"
              value={onOrAfterDate}
              onChange={(e) => setOnOrAfterDate(e.target.value)}
              className="w-full bg-[#172033] border border-[#2a3652] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c6ff3d] [color-scheme:dark]"
            />
          </div>

          {/* Max Entry Fee */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Max Entry Fee</span>
              <span className="text-[#c6ff3d] font-bold">₹{maxEntryFee}</span>
            </div>
            <input
              id="filter-tourn-fee"
              type="range"
              min="800"
              max="5000"
              step="200"
              value={maxEntryFee}
              onChange={(e) => setMaxEntryFee(Number(e.target.value))}
              className="w-full h-2 bg-[#172033] rounded-lg appearance-none cursor-pointer accent-[#c6ff3d]"
            />
          </div>
        </div>
      </div>

      {/* Tournaments Grid */}
      {filteredTournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-live="polite">
          {filteredTournaments.map((tourn) => (
            <Card
              key={tourn.id}
              className="flex flex-col justify-between group hover:border-[#c6ff3d] p-6 relative bg-[#172033]"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#c6ff3d] bg-[#c6ff3d]/10 px-2.5 py-0.5 rounded-full border border-[#c6ff3d]/25">
                    {tourn.sport}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(
                        tourn.status
                      )}`}
                    >
                      {tourn.status}
                    </span>
                  </div>
                </div>

                {/* Name */}
                <h3 className="font-['Barlow_Condensed'] text-2xl font-black text-white group-hover:text-[#c6ff3d] transition-colors leading-tight">
                  {tourn.name}
                </h3>

                {/* Meta details */}
                <div className="space-y-2 mt-4 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{tourn.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Match Date: <strong className="text-white">{tourn.eventDate}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      Registration Deadline: <strong className="text-slate-200">{tourn.registrationDeadline}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Format: {tourn.teamSize} &bull; {tourn.format}</span>
                  </div>
                </div>

                {/* Prize and Pool highlight box */}
                <div className="mt-4 p-3 rounded-xl bg-[#0a1020]/70 border border-[#2a3652] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Prize Pool (Sample)
                    </span>
                    <div className="text-sm font-bold text-[#c6ff3d] font-['Barlow_Condensed'] text-base">
                      {tourn.prize}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Entry Fee
                    </span>
                    <div className="text-sm font-bold text-white font-['Barlow_Condensed'] text-base">
                      ₹{tourn.entryFee}
                    </div>
                  </div>
                </div>

                {/* Verification label */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    Status: <em className="not-italic text-slate-300">{tourn.verificationStatus}</em>
                  </span>
                  {tourn.spotsLeft > 0 ? (
                    <span className="text-emerald-400 font-medium">{tourn.spotsLeft} spots remaining</span>
                  ) : (
                    <span className="text-rose-400 font-medium">Waitlist active</span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-[#2a3652] flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                  Demo listing
                </span>
                <Button
                  variant={tourn.status === 'Waitlist' ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => handleRegisterClick(tourn)}
                >
                  {tourn.status === 'Waitlist' ? 'Join Waitlist (Demo)' : 'Register Team'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#172033] border border-[#2a3652] rounded-2xl p-10 text-center max-w-lg mx-auto" aria-live="polite">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Trophy className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white font-['Barlow_Condensed'] uppercase tracking-wide">
            No Tournaments Match Your Filters
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            There are currently no demo competitions matching sport &quot;{sportFilter}&quot;, location &quot;{locationQuery || 'any'}&quot; under ₹{maxEntryFee}.
          </p>
          <div className="mt-6 flex justify-center">
            <Button variant="primary" size="sm" onClick={handleResetFilters}>
              Reset All Tournament Filters
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
