import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, IndianRupee, Star, AlertCircle, CheckCircle, RefreshCw, Clock } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { SPORTS_OPTIONS, SAMPLE_VENUES, SAMPLE_DISCLAIMER } from '../data/sampleData';

export default function SearchPanel({ preselectedSport, onShowToast }) {
  // Today's date in YYYY-MM-DD format for min date attribute
  const todayStr = new Date().toISOString().split('T')[0];

  const [sport, setSport] = useState(preselectedSport || '');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(todayStr);
  const [budget, setBudget] = useState(2500);

  // Validation errors
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(SAMPLE_VENUES.slice(0, 4));
  const [hasSearched, setHasSearched] = useState(false);

  // Field refs for focusing on error
  const sportRef = useRef(null);
  const locationRef = useRef(null);
  const dateRef = useRef(null);

  // Listen to preselected sport changes from CategoryCards
  useEffect(() => {
    if (preselectedSport) {
      setSport(preselectedSport);
      setErrors((prev) => ({ ...prev, sport: null }));
    }
  }, [preselectedSport]);

  const validate = () => {
    const newErrors = {};

    if (!sport || sport === '' || sport === 'Choose your sport') {
      newErrors.sport = 'Please choose a sport to search facilities.';
    }

    if (!location.trim() || location.trim().length < 2) {
      newErrors.location = 'Please enter a city or area (at least 2 characters).';
    }

    if (!date) {
      newErrors.date = 'Please select a date.';
    } else {
      const selected = new Date(date);
      const today = new Date(todayStr);
      // Zero out time
      selected.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.date = 'Date cannot be in the past.';
      }
    }

    setErrors(newErrors);

    // Focus the first offending field
    if (newErrors.sport && sportRef.current) {
      sportRef.current.focus();
    } else if (newErrors.location && locationRef.current) {
      locationRef.current.focus();
    } else if (newErrors.date && dateRef.current) {
      dateRef.current.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setHasSearched(true);

    // Simulate realistic 350ms network delay
    setTimeout(() => {
      const queryLoc = location.trim().toLowerCase();
      const filtered = SAMPLE_VENUES.filter((venue) => {
        const matchesSport =
          sport === 'All Sports' || venue.sport.toLowerCase() === sport.toLowerCase();
        const matchesLocation =
          !queryLoc || venue.location.toLowerCase().includes(queryLoc);
        const matchesBudget = venue.pricePerHour <= budget;
        return matchesSport && matchesLocation && matchesBudget;
      });

      setSearchResults(filtered);
      setIsLoading(false);
    }, 350);
  };

  const handleResetSearch = () => {
    setSport('');
    setLocation('');
    setDate(todayStr);
    setBudget(2500);
    setErrors({});
    setSearchResults(SAMPLE_VENUES.slice(0, 4));
    setHasSearched(false);
  };

  const handleBookDemo = (venue) => {
    onShowToast({
      title: `Slot Request: ${venue.name}`,
      message: `Simulated availability inquiry for ${venue.courtType} at ₹${venue.pricePerHour}/hr. No actual booking or payment was executed.`,
      type: 'success',
      isDemo: true
    });
  };

  return (
    <section id="search-panel" className="relative -mt-10 sm:-mt-14 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Outer Search Container */}
      <div className="bg-[#131a2b] border border-[#2a3652] shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-2xl p-5 sm:p-7 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-[#2a3652]/80 mb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#c6ff3d]">
              Quick Search &amp; Venue Explorer
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Barlow_Condensed'] uppercase tracking-wide">
              Find Available Grounds &amp; Courts
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
              Demo search &bull; Availability is sample only
            </span>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            {/* 1. Sport Select */}
            <div className="lg:col-span-3 space-y-1.5">
              <label
                htmlFor="search-sport"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Sport <span className="text-[#c6ff3d]">*</span>
              </label>
              <div className="relative">
                <select
                  id="search-sport"
                  ref={sportRef}
                  value={sport}
                  onChange={(e) => {
                    setSport(e.target.value);
                    if (errors.sport) setErrors({ ...errors, sport: null });
                  }}
                  aria-invalid={errors.sport ? 'true' : 'false'}
                  aria-describedby={errors.sport ? 'sport-error' : undefined}
                  className={`w-full bg-[#172033] text-white text-sm rounded-xl px-3.5 py-2.5 border transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#c6ff3d] ${
                    errors.sport ? 'border-rose-500 bg-rose-500/5' : 'border-[#2a3652] hover:border-slate-500'
                  }`}
                >
                  <option value="" disabled>Choose your sport</option>
                  {SPORTS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="bg-[#131a2b] text-white">
                      {s}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
              {errors.sport && (
                <p id="sport-error" className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.sport}
                </p>
              )}
            </div>

            {/* 2. Location Input */}
            <div className="lg:col-span-3 space-y-1.5">
              <label
                htmlFor="search-location"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Location <span className="text-[#c6ff3d]">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="search-location"
                  ref={locationRef}
                  type="text"
                  placeholder="City or area (e.g. Koramangala)"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (errors.location) setErrors({ ...errors, location: null });
                  }}
                  aria-invalid={errors.location ? 'true' : 'false'}
                  aria-describedby={errors.location ? 'location-error' : undefined}
                  className={`w-full bg-[#172033] text-white text-sm rounded-xl pl-10 pr-3.5 py-2.5 border transition-colors focus:outline-none focus:ring-2 focus:ring-[#c6ff3d] ${
                    errors.location ? 'border-rose-500 bg-rose-500/5' : 'border-[#2a3652] hover:border-slate-500'
                  }`}
                />
              </div>
              {errors.location && (
                <p id="location-error" className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.location}
                </p>
              )}
            </div>

            {/* 3. Date Picker */}
            <div className="lg:col-span-2 space-y-1.5">
              <label
                htmlFor="search-date"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Date <span className="text-[#c6ff3d]">*</span>
              </label>
              <div className="relative">
                <input
                  id="search-date"
                  ref={dateRef}
                  type="date"
                  min={todayStr}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) setErrors({ ...errors, date: null });
                  }}
                  aria-invalid={errors.date ? 'true' : 'false'}
                  aria-describedby={errors.date ? 'date-error' : undefined}
                  className={`w-full bg-[#172033] text-white text-sm rounded-xl px-3 py-2.5 border transition-colors focus:outline-none focus:ring-2 focus:ring-[#c6ff3d] [color-scheme:dark] ${
                    errors.date ? 'border-rose-500 bg-rose-500/5' : 'border-[#2a3652] hover:border-slate-500'
                  }`}
                />
              </div>
              {errors.date && (
                <p id="date-error" className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.date}
                </p>
              )}
            </div>

            {/* 4. Budget Slider */}
            <div className="lg:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="search-budget"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                >
                  Budget
                </label>
                <span className="text-xs font-bold text-[#c6ff3d]">
                  Up to ₹{budget}/hr
                </span>
              </div>
              <div className="pt-2">
                <input
                  id="search-budget"
                  type="range"
                  min="400"
                  max="3500"
                  step="100"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-2 bg-[#172033] rounded-lg appearance-none cursor-pointer accent-[#c6ff3d]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>₹400</span>
                  <span>₹3,500</span>
                </div>
              </div>
            </div>

            {/* 5. Search Button */}
            <div className="lg:col-span-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isLoading}
                className="w-full h-[42px]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Live Search Results / Recommendations */}
        <div className="mt-8 pt-6 border-t border-[#2a3652]/70" aria-live="polite">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                {hasSearched ? 'Search Results' : 'Featured Venues (Sample)'}
              </h3>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                {searchResults.length} matches
              </span>
            </div>
            {hasSearched && (
              <button
                type="button"
                onClick={handleResetSearch}
                className="text-xs text-slate-400 hover:text-[#c6ff3d] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset filters
              </button>
            )}
          </div>

          {/* Results Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8 text-center">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[#172033] border border-[#2a3652] rounded-2xl p-5 animate-pulse h-56 flex flex-col justify-between">
                  <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-700/30 rounded w-1/2 mb-4" />
                  <div className="h-16 bg-slate-800/60 rounded-xl" />
                  <div className="h-8 bg-slate-700/50 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {searchResults.map((venue) => (
                <Card
                  key={venue.id}
                  className="flex flex-col justify-between p-4 bg-[#172033] hover:border-[#c6ff3d]/60 relative group"
                >
                  <div>
                    {/* Top Tag & Demo Badge */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#c6ff3d] bg-[#c6ff3d]/10 px-2 py-0.5 rounded border border-[#c6ff3d]/20">
                        {venue.sport}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium bg-slate-800/80 px-1.5 py-0.5 rounded">
                        Sample listing
                      </span>
                    </div>

                    <h4 className="font-['Barlow_Condensed'] text-lg font-bold text-white group-hover:text-[#c6ff3d] transition-colors leading-snug">
                      {venue.name}
                    </h4>

                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {venue.location}
                    </p>

                    <div className="mt-3 py-1.5 px-2.5 rounded-lg bg-[#0a1020]/60 border border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{venue.courtType}</span>
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {venue.rating}
                      </span>
                    </div>

                    {/* Amenities chips */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {venue.amenities.slice(0, 2).map((a, idx) => (
                        <span key={idx} className="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#2a3652]/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Tariff (Sample)</div>
                      <div className="text-base font-black text-white font-['Barlow_Condensed']">
                        ₹{venue.pricePerHour}<span className="text-xs font-normal text-slate-400">/hr</span>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleBookDemo(venue)}
                    >
                      Check Slot
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-[#172033]/60 border border-[#2a3652] rounded-2xl p-8 text-center max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white font-['Barlow_Condensed'] uppercase tracking-wide">
                No matching venues found
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                We couldn&apos;t find any demo grounds matching &quot;{location}&quot; for {sport} under ₹{budget}/hr.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setBudget(3500)}
                  className="text-xs text-[#c6ff3d] bg-[#c6ff3d]/10 border border-[#c6ff3d]/20 px-3 py-1.5 rounded-lg hover:bg-[#c6ff3d]/20 cursor-pointer"
                >
                  Try higher budget (₹3,500/hr)
                </button>
                <button
                  type="button"
                  onClick={() => setLocation('Bengaluru')}
                  className="text-xs text-slate-300 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg hover:text-white cursor-pointer"
                >
                  Search &quot;Bengaluru&quot;
                </button>
                <button
                  type="button"
                  onClick={() => setSport('Football')}
                  className="text-xs text-slate-300 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg hover:text-white cursor-pointer"
                >
                  Select &quot;Football&quot;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
