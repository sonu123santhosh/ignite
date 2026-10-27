import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Compass,
  Calendar,
  Sparkles,
  Trophy,
  Activity,
  Layers,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SPORTS_CATEGORIES } from '../../data/trialsData';

export default function TrialsHeader({
  searchQuery,
  onSearchChange,
  selectedSport,
  onSportSelect,
  selectedCity,
  onCityChange,
  userCoords,
  onUseMyLocation,
  isLocating,
  stats,
  onExploreClick,
  onOrganiseClick
}) {
  return (
    <div className="space-y-8">
      {/* Hero Banner with Dark Sports Overlay */}
      <div className="relative rounded-3xl overflow-hidden border border-[#293442] shadow-2xl bg-[#141B24]">
        {/* Background Sports Imagery */}
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-[0.28] contrast-[1.1] scale-105 transform"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1600&q=80")'
          }}
        />

        {/* Dynamic Sports Tech Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F14]/95 via-[#0B0F14]/85 to-[#0B0F14]/60" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B6FF3B]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-[#00D4FF]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-14 space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B6FF3B]/10 border border-[#B6FF3B]/30 text-[#B6FF3B] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Collegiate & Professional Sports Recruitment</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-none font-['Barlow_Condensed',sans-serif]">
              Your Next Opportunity <span className="text-[#B6FF3B]">Starts Here.</span>
            </h1>
            <p className="text-base sm:text-lg text-[#94A3B8] font-normal leading-relaxed max-w-2xl">
              Discover sports trials, showcase your talent, and take the next step in your sporting journey. Connect directly with university sports directors and club scouts.
            </p>
          </div>

          {/* Dual Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={onExploreClick}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#B6FF3B] text-[#0B0F14] font-black text-xs uppercase tracking-wider hover:bg-[#a5ef28] transition-all shadow-lg shadow-[#B6FF3B]/20 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Trials</span>
            </button>

            <button
              type="button"
              onClick={onOrganiseClick}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#1B2530] hover:bg-[#253241] text-white border border-[#293442] font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#00D4FF]" />
              <span>Organise a Trial</span>
            </button>

            <Link
              to="/trials/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-[#00D4FF] hover:underline font-semibold ml-auto"
            >
              <span>My Applications & Wishlist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Demonstration Sample Data Notice Banner */}
        <div className="relative z-10 bg-[#0B0F14]/75 border-t border-[#293442] px-6 py-2.5 flex items-center justify-between text-xs text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Demonstration Prototype: Trials & organisation listings contain sample recruitment schedules.</span>
          </span>
          <span className="hidden sm:inline font-mono text-[11px] text-slate-500">
            Secure Application Simulator Enabled
          </span>
        </div>
      </div>

      {/* Quick Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl relative overflow-hidden group hover:border-[#B6FF3B]/40 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase">Upcoming Trials</span>
            <Calendar className="w-4 h-4 text-[#B6FF3B]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.upcomingCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Scheduled this season</p>
        </div>

        <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl relative overflow-hidden group hover:border-[#00D4FF]/40 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase">Trials Near You</span>
            <MapPin className="w-4 h-4 text-[#00D4FF]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#00D4FF] font-mono">{stats.nearYouCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Within your region</p>
        </div>

        <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase">Applications Open</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{stats.openCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Accepting registrations</p>
        </div>

        <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase">Trials This Month</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{stats.thisMonthCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Immediate tryouts</p>
        </div>
      </div>

      {/* Prominent Search & Discovery Bar */}
      <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Main search input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search trials, sport, college, club, academy, or location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#B6FF3B] transition-colors"
            />
          </div>

          {/* City / Locality manual selector */}
          <div className="md:col-span-3">
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-xs text-white focus:outline-none focus:border-[#B6FF3B] transition-colors cursor-pointer"
            >
              <option value="all">All Cities / Regions</option>
              <option value="Pune">Pune, Maharashtra</option>
              <option value="Mumbai">Mumbai, Maharashtra</option>
            </select>
          </div>

          {/* Geolocation Button */}
          <div className="md:col-span-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onUseMyLocation}
              disabled={isLocating}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                userCoords
                  ? 'bg-[#B6FF3B]/10 text-[#B6FF3B] border-[#B6FF3B]/40'
                  : 'bg-[#1B2530] text-slate-300 border-[#293442] hover:bg-[#253241]'
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-[#B6FF3B]' : ''}`} />
              <span>
                {isLocating
                  ? 'Detecting...'
                  : userCoords
                  ? 'Location Active ✓'
                  : 'Use My Location'}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Sports Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {SPORTS_CATEGORIES.map((sport) => {
            const isSelected = selectedSport === sport.id;
            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => onSportSelect(sport.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#B6FF3B] text-[#0B0F14] shadow-md shadow-[#B6FF3B]/20'
                    : 'bg-[#1B2530] text-[#94A3B8] hover:text-white border border-[#293442]'
                }`}
              >
                <Trophy className="w-3 h-3" />
                <span>{sport.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
