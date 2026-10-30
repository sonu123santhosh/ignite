import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  LayoutGrid,
  List,
  Map as MapIcon,
  SlidersHorizontal,
  PlusCircle,
  Shield,
  Layers,
  ArrowRight,
  AlertCircle,
  Trophy
} from 'lucide-react';
import { useTrials } from '../../context/TrialsContext';
import TrialsHeader from '../../components/trials/TrialsHeader';
import TrialCard from '../../components/trials/TrialCard';
import TrialsFilterPanel from '../../components/trials/TrialsFilterPanel';
import TrialsMapView from '../../components/trials/TrialsMapView';
import { filterTrials, sortTrials } from '../../data/trialsData';

export default function TrialsLanding() {
  const { trials, activeUser, applications } = useTrials();
  const navigate = useNavigate();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [filters, setFilters] = useState({
    sport: 'all',
    city: 'all',
    maxDistance: null,
    organisationType: 'all',
    skillLevel: 'all',
    status: 'all',
    entryFee: 'all',
    verifiedOnly: false
  });
  const [sortKey, setSortKey] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'map'
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // User Geolocation
  const [userCoords, setUserCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleUseMyLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
        },
        () => {
          // Fallback to Pune center
          setUserCoords({ lat: 18.5204, lng: 73.8567 });
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setUserCoords({ lat: 18.5204, lng: 73.8567 });
      setIsLocating(false);
    }
  };

  // Filter & sort trials
  const filteredTrials = useMemo(() => {
    const combined = {
      ...filters,
      sport: selectedSport !== 'all' ? selectedSport : filters.sport,
      city: selectedCity !== 'all' ? selectedCity : filters.city,
      keyword: searchQuery
    };
    const list = filterTrials(trials, combined, userCoords);
    return sortTrials(list, sortKey, userCoords);
  }, [trials, filters, selectedSport, selectedCity, searchQuery, sortKey, userCoords]);

  // Statistics
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    return {
      upcomingCount: trials.filter((t) => new Date(t.trialDate) >= now).length,
      nearYouCount: userCoords ? 6 : 4,
      openCount: trials.filter((t) => t.status === 'Open').length,
      thisMonthCount: trials.filter(
        (t) => new Date(t.trialDate).getMonth() === currentMonth
      ).length
    };
  }, [trials, userCoords]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSport('all');
    setSelectedCity('all');
    setFilters({
      sport: 'all',
      city: 'all',
      maxDistance: null,
      organisationType: 'all',
      skillLevel: 'all',
      status: 'all',
      entryFee: 'all',
      verifiedOnly: false
    });
    setUserCoords(null);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F5F7FA] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero & Discovery Search Header */}
        <TrialsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSport={selectedSport}
          onSportSelect={setSelectedSport}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          userCoords={userCoords}
          onUseMyLocation={handleUseMyLocation}
          isLocating={isLocating}
          stats={stats}
          onExploreClick={() => {
            const el = document.getElementById('trials-listing-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Main Trial Listings Section */}
        <div id="trials-listing-section" className="space-y-6 pt-4">
          {/* Top Control Bar: Results count, sorting, view toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a0d16]/85 border border-amber-500/20 p-4 rounded-2xl shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {filteredTrials.length} {filteredTrials.length === 1 ? 'Trial' : 'Trials'} Found
              </span>
              {(selectedSport !== 'all' || selectedCity !== 'all' || searchQuery) && (
                <span className="text-xs text-amber-300">• Active filters applied</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Trigger Button */}
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141824] text-xs font-bold text-amber-200 border border-amber-500/30 hover:bg-amber-950/40 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>Filters</span>
              </button>

              {/* Sorting Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="hidden sm:inline">Sort by:</span>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#07090e] border border-amber-500/20 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="nearest">Nearest to Location</option>
                  <option value="upcoming">Trial Date (Earliest)</option>
                  <option value="deadline">Application Deadline</option>
                </select>
              </div>

              {/* View Mode Toggle: Grid | List | Map */}
              <div className="flex items-center p-1 bg-[#07090e] rounded-xl border border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="List View"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  title="Map View"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'map'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MapIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Grid Layout: Desktop Filter Sidebar + Main Trial Cards / Map */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Desktop Sticky Filters Sidebar */}
            <div className="hidden lg:block lg:col-span-1 sticky top-28">
              <TrialsFilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                userCoords={userCoords}
              />
            </div>

            {/* Trial Cards / Map View Area */}
            <div className="lg:col-span-3 space-y-4">
              {viewMode === 'map' ? (
                <TrialsMapView trials={filteredTrials} userCoords={userCoords} />
              ) : filteredTrials.length === 0 ? (
                <div className="bg-[#0a0d16]/85 border border-amber-500/20 rounded-3xl p-12 text-center space-y-4 backdrop-blur-md">
                  <div className="w-14 h-14 rounded-full bg-[#141824] text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">No Sports Trials Found</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      No trials match your current search criteria or radius filters. Try resetting filters or expanding your location.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-xs font-black uppercase tracking-wider hover:shadow-[0_4px_18px_rgba(245,158,11,0.5)] border border-amber-400/40 cursor-pointer transition-all"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredTrials.map((trial) => (
                    <TrialCard
                      key={trial.id}
                      trial={trial}
                      userCoords={userCoords}
                      viewMode="grid"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTrials.map((trial) => (
                    <TrialCard
                      key={trial.id}
                      trial={trial}
                      userCoords={userCoords}
                      viewMode="list"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm lg:hidden animate-in fade-in duration-150">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <TrialsFilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              userCoords={userCoords}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setIsMobileFiltersOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
