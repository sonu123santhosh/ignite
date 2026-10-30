import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Map as MapIcon,
  Navigation,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Button from '../components/Button';
import RoleSwitcher from '../components/RoleSwitcher';
import FacilityCard from '../components/FacilityCard';
import FilterPanel from '../components/FilterPanel';
import FacilityMap from '../components/FacilityMap';
import EmptyState from '../components/EmptyState';
import MyBookingsModal from '../components/MyBookingsModal';
import OwnerDashboard from '../components/OwnerDashboard';
import { cancelSplitForBooking } from '../services/costSplitService';
import {
  INITIAL_FACILITIES,
  INITIAL_BOOKINGS,
  AREA_COORDINATES,
  DEFAULT_COORDS,
  getRelativeDateStr,
  filterAndSortFacilities
} from '../data/facilitiesData';

export default function Facilities({ sharedRole, onRoleChange, sharedState, setSharedState }) {
  const outletContext = useOutletContext() || {};
  const showToast = outletContext.showToast || (() => { });
  const todayStr = getRelativeDateStr(0);

  // Role: 'player' | 'owner'
  const role = sharedRole || 'player';

  // Facilities, Bookings, Slot Overrides
  const facilities = sharedState?.facilities || INITIAL_FACILITIES;
  const bookings = sharedState?.bookings || INITIAL_BOOKINGS;
  const customSlotOverrides = sharedState?.customSlotOverrides || {};

  // View mode for players: 'grid' | 'list' | 'map'
  const [viewMode, setViewMode] = useState('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [selectedMapFacilityId, setSelectedMapFacilityId] = useState(null);

  // Search & Geolocation State
  const [locationInput, setLocationInput] = useState('Bengaluru');
  const [referenceCoords, setReferenceCoords] = useState(DEFAULT_COORDS);
  const [geoStatus, setGeoStatus] = useState(null); // 'locating' | 'granted' | 'denied'
  const [searchQuery, setSearchQuery] = useState('');

  // Primary Filters
  const [filters, setFilters] = useState({
    sport: 'All',
    locality: 'All',
    maxDistance: 20,
    searchQuery: '',
    priceRange: 2000,
    minRating: 0,
    indoorOutdoor: 'all',
    selectedSurface: 'all',
    selectedAmenities: [],
    availableSlotsOnly: false,
    selectedDate: todayStr,
    preferredTime: 'all',
    sortBy: 'popular'
  });

  useEffect(() => {
    document.title = role === 'player' ? 'Facilities & Grounds | SportLink' : 'Owner Dashboard | SportLink';
  }, [role]);

  // Handle Geolocation with fallback
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('unavailable');
      showToast({
        title: 'Geolocation Unavailable',
        message: 'Browser geolocation is not supported. Manual location entry remains available.',
        type: 'error',
        isDemo: true
      });
      return;
    }

    setGeoStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: 'Current Device Location'
        };
        setReferenceCoords(coords);
        setLocationInput('Near Me (GPS)');
        setGeoStatus('granted');
        showToast({
          title: 'Location Acquired',
          message: 'Distances now computed from your device location (approx).',
          type: 'success',
          isDemo: true
        });
      },
      (error) => {
        setGeoStatus('denied');
        showToast({
          title: 'Location Permission Denied',
          message: 'Location access was blocked. Defaulting to manual area entry without blocking.',
          type: 'info',
          isDemo: true
        });
      },
      { timeout: 7000, maximumAge: 60000 }
    );
  };

  // Location text entry resolution
  const handleLocationSubmit = (e) => {
    e?.preventDefault();
    const clean = locationInput.trim().toLowerCase();
    const match = AREA_COORDINATES[clean];
    if (match) {
      setReferenceCoords(match);
      showToast({
        title: 'Area Selected',
        message: `Set reference center to ${match.name}.`,
        type: 'info',
        isDemo: true
      });
    } else {
      // Default to city center
      setReferenceCoords(DEFAULT_COORDS);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      sport: 'All',
      locality: 'All',
      maxDistance: 20,
      searchQuery: '',
      priceRange: 2000,
      minRating: 0,
      indoorOutdoor: 'all',
      selectedSurface: 'all',
      selectedAmenities: [],
      availableSlotsOnly: false,
      selectedDate: todayStr,
      preferredTime: 'all',
      sortBy: 'popular'
    });
    setSearchQuery('');
  };

  // Update in-memory facilities state
  const handleSaveFacility = (updatedFac) => {
    const existingIndex = facilities.findIndex((f) => f.id === updatedFac.id);
    let nextFacilities;
    if (existingIndex >= 0) {
      nextFacilities = [...facilities];
      nextFacilities[existingIndex] = updatedFac;
    } else {
      nextFacilities = [updatedFac, ...facilities];
    }
    setSharedState((prev) => ({ ...prev, facilities: nextFacilities }));
  };

  const handleToggleFacilityStatus = (facId) => {
    const nextFacilities = facilities.map((f) => {
      if (f.id === facId) {
        return { ...f, status: f.status === 'Live' ? 'Paused' : 'Live' };
      }
      return f;
    });
    setSharedState((prev) => ({ ...prev, facilities: nextFacilities }));
  };

  const handleUpdateBookingStatus = (bookingId, newStatus) => {
    const nextBookings = bookings.map((b) => {
      if (b.id === bookingId) {
        return { ...b, status: newStatus };
      }
      return b;
    });
    setSharedState((prev) => ({ ...prev, bookings: nextBookings }));
    showToast({
      title: 'Booking Status Updated',
      message: `Reservation ${bookingId} marked as ${newStatus}.`,
      type: 'info',
      isDemo: true
    });
  };

  const handleUpdateSlotOverride = (slotKey, overrideData) => {
    setSharedState((prev) => ({
      ...prev,
      customSlotOverrides: {
        ...prev.customSlotOverrides,
        [slotKey]: {
          ...(prev.customSlotOverrides?.[slotKey] || {}),
          ...overrideData
        }
      }
    }));
  };

  const handleCancelPlayerBooking = (bookingId) => {
    handleUpdateBookingStatus(bookingId, 'Cancelled');
    cancelSplitForBooking(bookingId);
    showToast({
      title: 'Booking Cancelled',
      message: 'Slot has been released back into inventory. Demo refund calculated.',
      type: 'info',
      isDemo: true
    });
  };

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    return filterAndSortFacilities(
      facilities,
      { ...filters, searchQuery },
      referenceCoords
    );
  }, [facilities, filters, searchQuery, referenceCoords]);

  // Active filter chip counter
  const activeChips = [];
  if (filters.sport !== 'All') activeChips.push({ label: `Sport: ${filters.sport}`, key: 'sport', val: 'All' });
  if (filters.locality !== 'All') activeChips.push({ label: `Area: ${filters.locality}`, key: 'locality', val: 'All' });
  if (filters.maxDistance !== 20) activeChips.push({ label: `Within ${filters.maxDistance}km`, key: 'maxDistance', val: 20 });
  if (filters.priceRange < 2000) activeChips.push({ label: `Max ₹${filters.priceRange}`, key: 'priceRange', val: 2000 });
  if (filters.minRating > 0) activeChips.push({ label: `${filters.minRating}+ Stars`, key: 'minRating', val: 0 });
  if (filters.indoorOutdoor !== 'all') activeChips.push({ label: filters.indoorOutdoor, key: 'indoorOutdoor', val: 'all' });
  if (filters.availableSlotsOnly) activeChips.push({ label: 'Available Slots', key: 'availableSlotsOnly', val: false });

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-hero-fade">
      {/* 1. Visible Demo Role Switcher */}
      <RoleSwitcher
        currentRole={role}
        onRoleChange={onRoleChange}
      />

      {/* 2. PLAYER VIEW */}
      {role === 'player' && (
        <div className="space-y-8">
          {/* Header & Search Bar */}
          <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Sports Facility Discovery
                </span>
                <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-[#F5F7FA] font-['Barlow_Condensed'] leading-tight mt-1">
                  Find Your Game.
                </h1>
                <p className="text-sm sm:text-base text-slate-300 mt-1.5 max-w-2xl">
                  Discover, compare and book the best sports facilities around you.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link to="/facilities/my-bookings">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs hover:border-rose-400 hover:text-white cursor-pointer"
                  >
                    <BookmarkCheck className="w-4 h-4 text-rose-400" />
                    <span>My Bookings</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Search Controls Form */}
            <form onSubmit={handleLocationSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              {/* Location Input & Geolocation */}
              <div className="lg:col-span-4 space-y-1.5">
                <label htmlFor="search-loc-field" className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">
                  Location / Area
                </label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3.5 w-4 h-4 text-rose-400" />
                  <input
                    id="search-loc-field"
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="Enter locality (e.g. Koramangala)"
                    className="w-full bg-[#0B0F14] border border-[#293442] text-[#F5F7FA] text-xs rounded-xl pl-10 pr-24 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="absolute right-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-300 bg-white/5 hover:bg-white/10 border border-white/15 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>GPS</span>
                  </button>
                </div>
              </div>

              {/* Free-text Turf Search */}
              <div className="lg:col-span-4 space-y-1.5">
                <label htmlFor="search-query-field" className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">
                  Search Facilities
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    id="search-query-field"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search turfs, grounds, courts or areas..."
                    className="w-full bg-[#0B0F14] border border-[#293442] text-[#F5F7FA] text-xs rounded-xl pl-10 pr-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="lg:col-span-2 space-y-1.5">
                <label htmlFor="search-date-field" className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">
                  Playing Date
                </label>
                <input
                  id="search-date-field"
                  type="date"
                  min={todayStr}
                  value={filters.selectedDate}
                  onChange={(e) => handleFilterChange('selectedDate', e.target.value)}
                  className="w-full bg-[#0B0F14] border border-[#293442] text-[#F5F7FA] text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-rose-500 [color-scheme:dark] outline-none"
                />
              </div>

              {/* Action Button */}
              <div className="lg:col-span-2">
                <Button
                  type="submit"
                  variant="crimson"
                  size="md"
                  className="w-full h-[40px] text-xs font-bold"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Active Chips Row & Sort / View Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#F5F7FA]">
                {filteredFacilities.length} Grounds Available
              </span>

              {/* Mobile Filter Trigger */}
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#141B24] border border-rose-500/40 text-rose-300"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters {activeChips.length > 0 && `(${activeChips.length})`}</span>
              </button>

              {activeChips.map((chip, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#F5F7FA] bg-[#141B24] border border-[#293442] px-2.5 py-1 rounded-full"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={() => handleFilterChange(chip.key, chip.val)}
                    className="hover:text-rose-400 text-[#94A3B8]"
                  >
                    <span className="sr-only">Remove filter {chip.label}</span>
                    &times;
                  </button>
                </span>
              ))}

              {activeChips.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-bold ml-1 cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Sort Dropdown & View Mode Buttons */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#94A3B8] hidden sm:inline">Sort:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="bg-[#141B24] border border-[#293442] text-[#F5F7FA] text-xs rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-rose-500 cursor-pointer outline-none"
                >
                  <option value="popular">Popular</option>
                  <option value="nearest">Nearest First</option>
                  <option value="price_low">Lowest Price</option>
                  <option value="rating_high">Highest Rated</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="inline-flex p-1 bg-[#141B24] border border-[#293442] rounded-xl" role="group" aria-label="View layout switch">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-md shadow-red-950/40' : 'text-[#94A3B8] hover:text-[#F5F7FA]'
                    }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${viewMode === 'list' ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-md shadow-red-950/40' : 'text-[#94A3B8] hover:text-[#F5F7FA]'
                    }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  aria-pressed={viewMode === 'map'}
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${viewMode === 'map' ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-md shadow-red-950/40' : 'text-[#94A3B8] hover:text-[#F5F7FA]'
                    }`}
                  title="Map View"
                >
                  <MapIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Layout: Filters Sidebar + Results / Map */}
          <div className="flex gap-8 items-start">
            {/* Desktop Filters Sidebar */}
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              totalResults={filteredFacilities.length}
              isMobileOpen={isMobileFiltersOpen}
              onCloseMobile={() => setIsMobileFiltersOpen(false)}
            />

            {/* Results Grid / List / Map */}
            <div className="flex-1 min-w-0">
              {viewMode === 'map' ? (
                <div className="space-y-6">
                  <FacilityMap
                    facilities={filteredFacilities}
                    selectedFacilityId={selectedMapFacilityId}
                    onSelectFacility={(id) => setSelectedMapFacilityId(id)}
                    referenceCoords={referenceCoords}
                  />

                  {/* List below map */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredFacilities.map((fac) => (
                      <FacilityCard
                        key={fac.id}
                        facility={fac}
                        referenceCoords={referenceCoords}
                        selectedDate={filters.selectedDate}
                        existingBookings={bookings}
                        viewMode="grid"
                      />
                    ))}
                  </div>
                </div>
              ) : filteredFacilities.length > 0 ? (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                      : 'space-y-4'
                  }
                >
                  {filteredFacilities.map((fac) => (
                    <FacilityCard
                      key={fac.id}
                      facility={fac}
                      referenceCoords={referenceCoords}
                      selectedDate={filters.selectedDate}
                      existingBookings={bookings}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState onClearFilters={handleResetFilters} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. OWNER VIEW */}
      {role === 'owner' && (
        <OwnerDashboard
          facilities={facilities}
          onSaveFacility={handleSaveFacility}
          onToggleFacilityStatus={handleToggleFacilityStatus}
          bookings={bookings}
          onUpdateBookingStatus={handleUpdateBookingStatus}
          customSlotOverrides={customSlotOverrides}
          onUpdateSlotOverride={handleUpdateSlotOverride}
          onShowToast={showToast}
        />
      )}

      {/* Player My Bookings Modal */}
      <MyBookingsModal
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
        bookings={bookings}
        onCancelBooking={handleCancelPlayerBooking}
      />
    </div>
  );
}
