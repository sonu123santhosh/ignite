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
      <div className="relative overflow-hidden bg-gradient-to-r from-[#141B24] via-[#1B2530] to-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B6FF3B]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#00D4FF]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Coaching & Academy Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Train Better. <span className="text-[#B6FF3B]">Play Stronger.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-2xl">
            Find the right coaches, discover training programmes, and take your sporting skills to the next level. Compare academy facilities, check certified coach qualifications, and book your trial session today.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to="/coaching/my-training"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B2530] text-[#00D4FF] border border-[#00D4FF]/30 hover:border-[#00D4FF] text-xs font-bold transition-all shadow-sm"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Go to My Training Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Prominent Search & Quick Filters Bar */}
      <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          
          {/* Main Keyword Search */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search sports, coaching centres, coaches, or locations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#B6FF3B] transition-colors"
            />
          </div>

          {/* City / Locality Selector */}
          <div className="lg:col-span-3 relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00D4FF] appearance-none cursor-pointer"
            >
              <option value="all">All Cities (Pune & Surrounds)</option>
              <option value="pune">Pune</option>
              <option value="mumbai">Mumbai</option>
            </select>
          </div>

          {/* Training Time Selector */}
          <div className="lg:col-span-2 relative">
            <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <select
              value={selectedTime}
              onChange={(e) => onTimeChange(e.target.value)}
              className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00D4FF] appearance-none cursor-pointer"
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
                  ? 'bg-[#B6FF3B]/10 border-[#B6FF3B]/50 text-[#B6FF3B]'
                  : 'bg-[#1B2530] border-[#293442] text-slate-200 hover:text-white hover:border-slate-500'
              }`}
              title="Detect nearby coaching centres within Pune"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="truncate">{userCoords ? 'Near Me (Active)' : 'Use My Location'}</span>
            </button>
          </div>
        </div>

        {/* Quick Sports Categories Carousel / Pills */}
        <div className="pt-2 border-t border-[#293442]/50">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#293442]">
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
                      ? 'bg-[#B6FF3B] text-[#0B0F14] font-bold shadow-md shadow-[#B6FF3B]/20'
                      : 'bg-[#0B0F14] text-[#94A3B8] border border-[#293442] hover:text-white hover:border-slate-500'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
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
