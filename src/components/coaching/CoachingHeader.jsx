import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Filter, 
  Clock, 
  IndianRupee, 
  Trophy, 
  Flame, 
  Zap, 
  Waves, 
  Activity, 
  Target, 
  Users, 
  Compass, 
  Shield, 
  Swords, 
  Sparkles,
  CalendarCheck
} from 'lucide-react';
import { SPORTS_CATEGORIES } from '../../data/coachingData';

export default function CoachingHeader({
  searchQuery,
  onSearchChange,
  selectedSport,
  onSportSelect,
  selectedCity,
  onCityChange,
  selectedTime,
  onTimeChange,
  maxBudget,
  onBudgetChange,
  userCoords,
  onUseMyLocation,
  isLocating
}) {
  const [isQuickFilterOpen, setIsQuickFilterOpen] = useState(false);

  // Icon map for sports categories
  const getSportIcon = (iconName) => {
    switch (iconName) {
      case 'Trophy': return Trophy;
      case 'Flame': return Flame;
      case 'Zap': return Zap;
      case 'Waves': return Waves;
      case 'Activity': return Activity;
      case 'Target': return Target;
      case 'Users': return Users;
      case 'Compass': return Compass;
      case 'Shield': return Shield;
      case 'Swords': return Swords;
      case 'Sparkles':
      default:
        return Sparkles;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Title & Subtitle Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#160c14]/90 via-[#1c0f18]/90 to-[#120810]/90 border border-red-500/25 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Train Better. <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-red-500 drop-shadow-[0_2px_10px_rgba(239,68,68,0.35)]">Play Stronger.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Find the right coaches, discover training programmes, and take your sporting skills to the next level. Compare academy facilities, check certified coach qualifications, and book your trial session today.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to="/coaching/my-training"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white border border-red-500/40 hover:from-red-500 hover:to-red-600 text-xs font-bold transition-all shadow-md shadow-red-950/50"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Go to My Training Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Prominent Search & Quick Filters Bar */}
      <div className="bg-[#0c0d15]/85 backdrop-blur-xl border border-red-500/25 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          
          {/* Main Keyword Search */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search sports, coaching centres, coaches, or locations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#07070d] border border-red-500/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/40 transition-colors"
            />
          </div>

          {/* City / Locality Selector */}
          <div className="lg:col-span-3 relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="w-full bg-[#07070d] border border-red-500/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
            >
              <option value="all">All Cities (Pune & Surrounds)</option>
              <option value="pune">Pune</option>
              <option value="mumbai">Mumbai</option>
            </select>
          </div>

          {/* Training Time Selector */}
          <div className="lg:col-span-2 relative">
            <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedTime}
              onChange={(e) => onTimeChange(e.target.value)}
              className="w-full bg-[#07070d] border border-red-500/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
            >
              <option value="all">Any Training Time</option>
              <option value="morning">Morning (6 AM - 10 AM)</option>
              <option value="evening">Evening (4 PM - 8 PM)</option>
              <option value="weekend">Weekend Batches</option>
            </select>
          </div>

          {/* Use My Location Button */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onUseMyLocation}
              disabled={isLocating}
              className={`w-full py-3 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                userCoords
                  ? 'bg-red-500/20 border-red-500 text-red-300 shadow-sm'
                  : 'bg-[#140f17] border-red-500/25 text-slate-200 hover:text-white hover:border-red-500/50'
              }`}
              title="Detect nearby coaching centres within Pune"
            >
              <Navigation className={`w-3.5 h-3.5 text-red-400 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="truncate">{userCoords ? 'Near Me (Active)' : 'Use My Location'}</span>
            </button>
          </div>
        </div>

        {/* Quick Sports Categories Carousel / Pills */}
        <div className="pt-2 border-t border-red-500/20">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-red-950">
            {SPORTS_CATEGORIES.map((cat) => {
              const Icon = getSportIcon(cat.icon);
              const isSelected = selectedSport.toLowerCase() === cat.id.toLowerCase();
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSportSelect(cat.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-bold shadow-md shadow-red-900/40 border border-red-400/40'
                      : 'bg-[#07070d] text-slate-400 border border-red-500/20 hover:text-white hover:border-red-500/40 hover:bg-red-500/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-red-400" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
