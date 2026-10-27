import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  Swords,
  Calendar,
  Sparkles,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users
} from 'lucide-react';
import { useFriendlies } from '../../context/FriendliesContext';
import FriendliesHeader from '../../components/friendlies/FriendliesHeader';
import FriendliesRoleSwitcher from '../../components/friendlies/FriendliesRoleSwitcher';
import FriendliesFilterPanel from '../../components/friendlies/FriendliesFilterPanel';
import MatchCard from '../../components/friendlies/MatchCard';
import FriendliesNotificationDrawer from '../../components/friendlies/FriendliesNotificationDrawer';
import Toast from '../../components/Toast';
import {
  filterMatches,
  sortMatches,
  haversineDistance
} from '../../data/friendliesData';

export default function FriendliesDiscovery() {
  const navigate = useNavigate();
  const {
    role,
    currentActor,
    matches,
    teams,
    colleges,
    registerForMatch
  } = useFriendlies();

  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState({
    sport: 'all',
    city: 'all',
    source: 'all',
    skillLevel: 'all',
    freeOnly: false,
    status: 'all'
  });
  const [sortKey, setSortKey] = useState('upcoming');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Approximate reference coordinates (Pune City Centre default)
  const [userCoords, setUserCoords] = useState({ lat: 18.5204, lng: 73.8567 });

  useEffect(() => {
    document.title = 'College Friendlies | SportLink';
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setKeyword('');
    setFilters({
      sport: 'all',
      city: 'all',
      source: 'all',
      skillLevel: 'all',
      freeOnly: false,
      status: 'all'
    });
  };

  // Search suggestions: list of matching colleges, sports, venues
  const searchSuggestions = useMemo(() => {
    if (!keyword.trim() || keyword.length < 2) return [];
    const q = keyword.toLowerCase().trim();
    const suggestions = [];

    colleges.forEach((col) => {
      if (col.name.toLowerCase().includes(q) || col.shortName.toLowerCase().includes(q)) {
        suggestions.push({ type: 'College', text: col.name, filterKey: 'keyword', value: col.shortName });
      }
    });

    ['Football', 'Cricket', 'Basketball', 'Volleyball', 'Badminton'].forEach((sp) => {
      if (sp.toLowerCase().includes(q)) {
        suggestions.push({ type: 'Sport', text: sp, filterKey: 'sport', value: sp.toLowerCase() });
      }
    });

    return suggestions.slice(0, 5);
  }, [keyword, colleges]);

  // Compute filtered & sorted matches
  const filteredMatches = useMemo(() => {
    const combined = { ...filters, keyword };
    const list = filterMatches(matches, combined);
    return sortMatches(list, sortKey, userCoords);
  }, [matches, filters, keyword, sortKey, userCoords]);

  // Active filter chips
  const activeChips = useMemo(() => {
    const chips = [];
    if (keyword.trim()) chips.push({ key: 'keyword', label: `Search: "${keyword}"` });
    if (filters.sport && filters.sport !== 'all') chips.push({ key: 'sport', label: `Sport: ${filters.sport}` });
    if (filters.city && filters.city !== 'all') chips.push({ key: 'city', label: `City: ${filters.city}` });
    if (filters.source && filters.source !== 'all') chips.push({ key: 'source', label: `Source: ${filters.source}` });
    if (filters.skillLevel && filters.skillLevel !== 'all') chips.push({ key: 'skillLevel', label: `Skill: ${filters.skillLevel}` });
    if (filters.freeOnly) chips.push({ key: 'freeOnly', label: 'Free Matches Only' });
    if (filters.status && filters.status !== 'all') chips.push({ key: 'status', label: `Status: ${filters.status}` });
    return chips;
  }, [keyword, filters]);

  const removeChip = (key) => {
    if (key === 'keyword') setKeyword('');
    else if (key === 'sport') handleFilterChange('sport', 'all');
    else if (key === 'city') handleFilterChange('city', 'all');
    else if (key === 'source') handleFilterChange('source', 'all');
    else if (key === 'skillLevel') handleFilterChange('skillLevel', 'all');
    else if (key === 'freeOnly') handleFilterChange('freeOnly', false);
    else if (key === 'status') handleFilterChange('status', 'all');
  };

  const handleRegisterTeamForOpenMatch = (match) => {
    if (!currentActor?.teamId) {
      setToast({
        title: 'Squad Required',
        message: 'You need an active team squad to register for an open match challenge.',
        type: 'warning'
      });
      return;
    }

    if (match.homeTeamId === currentActor.teamId) {
      setToast({
        title: 'Invalid Action',
        message: 'Your squad originally posted this match challenge.',
        type: 'error'
      });
      return;
    }

    registerForMatch(match.id, currentActor.teamId);
    setToast({
      title: 'Slot Accepted!',
      message: `Your squad (${currentActor.teamName}) registered for match #${match.id}. Match is now Confirmed!`,
      type: 'success'
    });
  };

  const scrollToMatches = () => {
    const el = document.getElementById('matches-listing');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#FFFFFF] pb-24">
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Role Switcher & Persona Bar */}
        <FriendliesRoleSwitcher onOpenNotifications={() => setIsNotifDrawerOpen(true)} />

        {/* Hero Header with 3 buttons and demo notice */}
        <FriendliesHeader onScrollToMatches={scrollToMatches} />

        {/* Search & Suggestions */}
        <div id="matches-listing" className="space-y-4 mb-8">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search colleges, rival teams, sports, or grounds..."
              className="w-full pl-12 pr-10 py-3 bg-[#151B23] border border-[#293442] focus:border-[#B6FF3B] rounded-2xl text-sm text-white placeholder-slate-500 outline-none transition-colors shadow-lg"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Autocomplete Search Suggestions */}
            {searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#151B23] border border-[#293442] rounded-xl p-2 shadow-2xl z-30 space-y-1">
                {searchSuggestions.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => {
                      if (sug.filterKey === 'sport') {
                        handleFilterChange('sport', sug.value);
                        setKeyword('');
                      } else {
                        setKeyword(sug.text);
                      }
                    }}
                    className="w-full p-2 rounded-lg text-left text-xs hover:bg-[#1B2530] flex items-center justify-between text-slate-300 hover:text-white cursor-pointer"
                  >
                    <span>{sug.text}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#0B0F14] text-[#00D9FF]">
                      {sug.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Collection Shortcuts Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: 'All Fixtures' },
              { id: 'open', label: 'Seeking Opponent (Open Slots)' },
              { id: 'confirmed', label: 'Confirmed Matches' },
              { id: 'free', label: 'Free Matches' },
              { id: 'official', label: 'Official Fixtures' }
            ].map((col) => {
              const isActive =
                (col.id === 'open' && filters.status === 'Open for Teams') ||
                (col.id === 'confirmed' && filters.status === 'Confirmed') ||
                (col.id === 'free' && filters.freeOnly) ||
                (col.id === 'official' && filters.source === 'official_fixture') ||
                (col.id === 'all' && filters.status === 'all' && !filters.freeOnly && filters.source === 'all');

              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => {
                    if (col.id === 'open') handleFilterChange('status', 'Open for Teams');
                    else if (col.id === 'confirmed') handleFilterChange('status', 'Confirmed');
                    else if (col.id === 'free') handleFilterChange('freeOnly', true);
                    else if (col.id === 'official') handleFilterChange('source', 'official_fixture');
                    else handleResetFilters();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#B6FF3B] text-[#0B0F14] font-bold shadow-sm'
                      : 'bg-[#151B23] text-slate-300 hover:text-white border border-[#293442]'
                  }`}
                >
                  {col.label}
                </button>
              );
            })}
          </div>

          {/* Active Filter Chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-[#9CA3AF]">Active filters:</span>
              {activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#1B2530] text-white border border-[#293442]"
                >
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={() => removeChip(chip.key)}
                    className="hover:text-red-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-[#B6FF3B] hover:underline font-semibold cursor-pointer ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Main Body: Filter Sidebar + Listings */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Desktop Filter Sidebar */}
          <FriendliesFilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            isOpenOnMobile={isMobileFiltersOpen}
            onCloseMobile={() => setIsMobileFiltersOpen(false)}
            totalResults={filteredMatches.length}
          />

          {/* Results Main Column */}
          <main className="flex-1 w-full min-w-0 space-y-6">
            {/* Header controls: count, sort, mobile filter trigger */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#151B23] border border-[#293442] p-4 rounded-2xl shadow-md">
              <div className="flex items-center gap-2">
                <span className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white">
                  Showing {filteredMatches.length} Match{filteredMatches.length === 1 ? '' : 'es'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2530] text-xs font-semibold text-white border border-[#293442] rounded-xl cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#B6FF3B]" />
                  <span>Filters</span>
                </button>

                {/* Sort selector */}
                <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                  <span className="hidden sm:inline">Sort:</span>
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    className="bg-[#1B2530] border border-[#293442] rounded-xl px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-[#B6FF3B]"
                  >
                    <option value="upcoming">Upcoming Matches</option>
                    <option value="closing_soon">Registration Closing Soon</option>
                    <option value="recently_posted">Recently Posted</option>
                    <option value="nearest">Nearest (Pune Centre)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Listings Grid or EXACT Empty State */}
            {filteredMatches.length === 0 ? (
              <div className="p-8 sm:p-12 text-center bg-[#151B23] border border-[#293442] rounded-2xl space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                  <Swords className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
                    No Matches Found
                  </h3>
                  {/* EXACT EMPTY STATE TEXT REQUIRED BY SPEC */}
                  <p className="text-sm text-slate-300 leading-relaxed">
                    No upcoming friendly matches have been verified yet. Try another date or create a match proposal.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-[#1B2530] text-white border border-[#293442] text-xs font-semibold rounded-xl hover:bg-slate-700"
                  >
                    Clear All Filters
                  </button>
                  <Link
                    to="/friendlies/challenge"
                    className="px-5 py-2 bg-[#B6FF3B] text-[#0B0F14] font-bold text-xs rounded-xl hover:bg-[#a3ee28]"
                  >
                    Create a Match Proposal
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMatches.map((m) => {
                  const homeTeam = teams.find((t) => t.id === m.homeTeamId);
                  const awayTeam = teams.find((t) => t.id === m.awayTeamId);

                  const distanceKm = userCoords && m.venue?.lat
                    ? haversineDistance(userCoords.lat, userCoords.lng, m.venue.lat, m.venue.lng)
                    : null;

                  return (
                    <MatchCard
                      key={m.id}
                      match={m}
                      homeTeam={homeTeam}
                      awayTeam={awayTeam}
                      userCoords={userCoords}
                      distanceKm={distanceKm}
                      isCaptain={role === 'captain'}
                      onRegisterTeam={handleRegisterTeamForOpenMatch}
                    />
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Notification Drawer */}
      <FriendliesNotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
      />
    </div>
  );
}
