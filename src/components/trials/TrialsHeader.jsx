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
  onExploreClick
}) {
  return (
    <div className="space-y-8">
      {/* Hero Banner with Dark Sports Overlay */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/25 shadow-2xl bg-[#0a0d16]/85 backdrop-blur-md">
        {/* Dynamic Sports Tech Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090e]/95 via-[#0a0d16]/85 to-[#0e121d]/70 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-14 space-y-6 max-w-4xl">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-none font-['Barlow_Condensed',sans-serif]">
              Your Next Opportunity <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">Starts Here.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
              Discover verified sports trials, showcase your talent to elite scouts, and advance your athletic journey with direct university and club tryouts.
            </p>
          </div>

          {/* Athlete Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={onExploreClick}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-xs uppercase tracking-wider hover:shadow-[0_4px_20px_rgba(245,158,11,0.45)] border border-amber-400/40 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Trials</span>
            </button>

            <Link
              to="/trials/dashboard"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#141824] hover:bg-amber-950/40 text-amber-200 border border-amber-500/30 hover:border-amber-400 font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>My Applications & Wishlist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Demonstration Sample Data Notice Banner */}
        <div className="relative z-10 bg-[#07090e]/85 border-t border-amber-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Demonstration Prototype: Trials & organisation listings contain sample recruitment schedules.</span>
          </span>
          <span className="hidden sm:inline font-mono text-[11px] text-amber-400/70">
            Athlete Application Portal Active
          </span>
        </div>
      </div>

      {/* Quick Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0a0d16]/85 border border-amber-500/20 hover:border-amber-500/40 p-4 rounded-2xl relative overflow-hidden group transition-all backdrop-blur-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Upcoming Trials</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.upcomingCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Scheduled this season</p>
        </div>

        <div className="bg-[#0a0d16]/85 border border-amber-500/20 hover:border-amber-500/40 p-4 rounded-2xl relative overflow-hidden group transition-all backdrop-blur-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Trials Near You</span>
            <MapPin className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{stats.nearYouCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Within your region</p>
        </div>

        <div className="bg-[#0a0d16]/85 border border-amber-500/20 hover:border-amber-500/40 p-4 rounded-2xl relative overflow-hidden group transition-all backdrop-blur-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Applications Open</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{stats.openCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Accepting registrations</p>
        </div>

        <div className="bg-[#0a0d16]/85 border border-amber-500/20 hover:border-amber-500/40 p-4 rounded-2xl relative overflow-hidden group transition-all backdrop-blur-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Trials This Month</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-orange-400 font-mono">{stats.thisMonthCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Immediate tryouts</p>
        </div>
      </div>

      {/* Prominent Search & Discovery Bar */}
      <div className="bg-[#0a0d16]/85 border border-amber-500/20 p-4 rounded-2xl shadow-xl space-y-4 backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Main search input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search trials, sport, college, club, academy, or location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07090e] border border-amber-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* City / Locality manual selector */}
          <div className="md:col-span-3">
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#07090e] border border-amber-500/20 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
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
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-[#141824] text-slate-300 border-amber-500/20 hover:bg-amber-950/30'
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-amber-400' : ''}`} />
              <span>
                {isLocating
                  ? 'Detecting...'
                  : userCoords
                  ? 'Location Active'
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
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md shadow-amber-500/30 border-transparent'
                    : 'bg-[#07090e] text-slate-300 hover:text-white border border-amber-500/20 hover:border-amber-500/40'
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
