import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  X,
  Check,
  AlertTriangle,
  Clock,
  MapPin,
  Star,
  SlidersHorizontal,
  ExternalLink,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building2,
  RefreshCw
} from 'lucide-react';
import Button from '../../components/Button';
import { useCompare } from '../../context/CompareContext';
import {
  compareFacilities,
  getLocalDateStr,
  STANDARD_AMENITIES
} from '../../services/facilityComparisonService';
import { INITIAL_FACILITIES, INITIAL_BOOKINGS } from '../../data/facilitiesData';

export default function FacilityComparisonPage({ sharedState }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const showToast = outletContext.showToast || (() => {});
  const { selectedIds, removeFromCompare, clearCompare, toggleCompare } = useCompare();

  const todayStr = useMemo(() => getLocalDateStr(), []);

  // Read URL params or fallback to Context & defaults
  const paramIds = useMemo(() => {
    const raw = searchParams.get('ids');
    if (raw) {
      return raw.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return selectedIds;
  }, [searchParams, selectedIds]);

  const paramDate = searchParams.get('date') || todayStr;
  const paramStart = searchParams.get('start') || '18:00';
  const paramDuration = parseInt(searchParams.get('duration') || '1', 10);

  // Local control state synchronized with URL query params
  const [date, setDate] = useState(paramDate < todayStr ? todayStr : paramDate);
  const [startTime, setStartTime] = useState(paramStart);
  const [duration, setDuration] = useState(Math.max(1, Math.min(3, paramDuration)));
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);

  // Sync state to URL params
  const updateUrlParams = (newIds, newDate, newStart, newDuration) => {
    const nextParams = new URLSearchParams();
    if (newIds && newIds.length > 0) {
      nextParams.set('ids', newIds.join(','));
    }
    nextParams.set('date', newDate);
    nextParams.set('start', newStart);
    nextParams.set('duration', newDuration.toString());
    setSearchParams(nextParams, { replace: true });
  };

  // Keep local controls and URL in sync when controls change
  const handleDateChange = (newDate) => {
    const validDate = newDate < todayStr ? todayStr : newDate;
    setDate(validDate);
    updateUrlParams(paramIds, validDate, startTime, duration);
  };

  const handleStartChange = (newStart) => {
    setStartTime(newStart);
    updateUrlParams(paramIds, date, newStart, duration);
  };

  const handleDurationChange = (newDuration) => {
    setDuration(newDuration);
    updateUrlParams(paramIds, date, startTime, newDuration);
  };

  // Compare engine computation
  const allFacilities = sharedState?.facilities || INITIAL_FACILITIES;
  const allBookings = sharedState?.bookings || INITIAL_BOOKINGS;

  const comparisonResult = useMemo(() => {
    if (!paramIds || paramIds.length === 0) {
      return { valid: false, error: 'No facilities selected.', facilities: [] };
    }
    return compareFacilities({
      ids: paramIds,
      date,
      startTime,
      durationHours: duration,
      customFacilities: allFacilities,
      customBookings: allBookings
    });
  }, [paramIds, date, startTime, duration, allFacilities, allBookings]);

  // Handle removing a facility from comparison
  const handleRemove = (facilityId) => {
    const remaining = paramIds.filter((id) => id !== facilityId);
    removeFromCompare(facilityId);
    updateUrlParams(remaining, date, startTime, duration);
  };

  // Quick slot alternative selection
  const handleSelectAlternative = (timeStr) => {
    setStartTime(timeStr);
    updateUrlParams(paramIds, date, timeStr, duration);
    showToast({
      title: 'Time Window Updated',
      message: `Comparison updated for ${timeStr} (${duration} hr).`,
      type: 'info'
    });
  };

  const facilities = comparisonResult.facilities || [];
  const hasEnoughFacilities = facilities.length >= 2;

  // Helper to determine if row has differences across facilities
  const isRowDifferent = (accessor) => {
    if (facilities.length <= 1) return false;
    const values = facilities.map((f) => {
      const v = accessor(f);
      return typeof v === 'object' ? JSON.stringify(v) : v;
    });
    return new Set(values).size > 1;
  };

  // Common time slots list for dropdown
  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#293442]">
        <div className="flex items-center gap-3">
          <Link
            to="/facilities"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#94A3B8] hover:text-[#c6ff3d] transition-colors focus-visible:ring-1 focus-visible:ring-[#c6ff3d] rounded p-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Facilities</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-bold text-[#F5F7FA] tracking-wide uppercase">
            Side-by-Side Facility Comparison
          </span>
        </div>

        {facilities.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Comparing <strong className="text-white">{facilities.length}</strong> of 4 venues
            </span>
            <button
              type="button"
              onClick={() => {
                clearCompare();
                updateUrlParams([], date, startTime, duration);
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2.5 py-1 rounded border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/10 cursor-pointer transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Title & Subtitle */}
      <div>
        <h1 className="font-['Barlow_Condensed'] text-4xl sm:text-5xl font-black uppercase text-[#F5F7FA] tracking-wide">
          Facility Comparison
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Evaluate turf quality, genuine pricing, real-time slot availability, and verified amenities side-by-side using authoritative venue data.
        </p>
      </div>

      {/* Warning Banner: Cross-Sport Comparison Notice */}
      {comparisonResult.differentSports && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">
              Different Sports Detected: {comparisonResult.sportsList}
            </p>
            <p className="text-amber-300/80">
              {comparisonResult.lowestPriceNotice ||
                'Lowest price comparison badge is disabled because compared venues feature different sports.'}
            </p>
          </div>
        </div>
      )}

      {/* Warning Banner: Unrecognized or Missing IDs */}
      {comparisonResult.missingIds && comparisonResult.missingIds.length > 0 && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-200"
        >
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Unpublished or Missing Venues</p>
            <p className="text-rose-300/80">
              The following facility IDs could not be found or have been unlisted: {comparisonResult.missingIds.join(', ')}.
            </p>
          </div>
        </div>
      )}

      {/* Edge Case: Less than 2 Facilities */}
      {!hasEnoughFacilities ? (
        <div className="p-12 text-center rounded-2xl bg-[#141B24]/90 border border-[#293442] space-y-5 my-8">
          <div className="w-16 h-16 rounded-full bg-[#1B2530] border border-[#293442] flex items-center justify-center text-[#c6ff3d] mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
              Select At Least 2 Facilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Side-by-side comparison requires between 2 and 4 facilities. Browse the facilities directory and click &quot;Compare&quot; on the venues you want to compare.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/facilities">
              <Button variant="crimson" size="md" className="gap-2">
                <span>Browse Facilities</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Comparison Controls Bar */}
          <section
            aria-label="Comparison Filters and Slot Settings"
            className="p-4 sm:p-5 rounded-2xl bg-[#141B24]/95 border border-[#293442] shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {/* Date Selector */}
              <div className="space-y-1">
                <label
                  htmlFor="compare-date"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-400"
                >
                  Date
                </label>
                <div className="relative">
                  <input
                    id="compare-date"
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="bg-[#0B0F14] border border-[#293442] hover:border-slate-500 focus:border-[#c6ff3d] text-white text-xs rounded-lg px-3 py-2 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Start Time Selector */}
              <div className="space-y-1">
                <label
                  htmlFor="compare-start-time"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-400"
                >
                  Start Time
                </label>
                <select
                  id="compare-start-time"
                  value={startTime}
                  onChange={(e) => handleStartChange(e.target.value)}
                  className="bg-[#0B0F14] border border-[#293442] hover:border-slate-500 focus:border-[#c6ff3d] text-white text-xs rounded-lg px-3 py-2 outline-none transition-colors cursor-pointer"
                >
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Selector */}
              <div className="space-y-1">
                <label
                  htmlFor="compare-duration"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-400"
                >
                  Duration
                </label>
                <div className="flex items-center gap-1 bg-[#0B0F14] border border-[#293442] rounded-lg p-1">
                  {[1, 2, 3].map((hr) => (
                    <button
                      key={hr}
                      type="button"
                      onClick={() => handleDurationChange(hr)}
                      aria-pressed={duration === hr}
                      className={`text-xs font-bold px-3 py-1 rounded transition-colors cursor-pointer ${
                        duration === hr
                          ? 'bg-[#c6ff3d] text-slate-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {hr}h
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Toggle: Show Only Differences */}
            <div className="flex items-center gap-3 pt-2 sm:pt-0">
              <label
                htmlFor="toggle-differences"
                className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none"
              >
                <input
                  id="toggle-differences"
                  type="checkbox"
                  checked={showOnlyDifferences}
                  onChange={(e) => setShowOnlyDifferences(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    showOnlyDifferences ? 'bg-[#c6ff3d]' : 'bg-[#293442]'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-slate-950 absolute top-0.75 transition-transform ${
                      showOnlyDifferences ? 'left-4.5' : 'left-1'
                    }`}
                  />
                </div>
                <span>Show only differences</span>
              </label>
            </div>
          </section>

          {/* Comparison Table Container (Supports mobile inner horizontal scroll without breaking viewport) */}
          <div className="w-full overflow-x-auto rounded-2xl border border-[#293442] bg-[#141B24]/90 shadow-2xl relative">
            <table className="w-full text-left border-collapse min-w-[700px] table-fixed">
              <caption className="sr-only">
                Authoritative side-by-side facility comparison table
              </caption>

              {/* Column Width Definitions */}
              <colgroup>
                <col className="w-48 sm:w-56" />
                {facilities.map((fac) => (
                  <col key={fac.id} className="min-w-[200px]" />
                ))}
              </colgroup>

              {/* STICKY HEADER: Facility Overview & Jump Actions */}
              <thead>
                <tr className="border-b border-[#293442] bg-[#0B0F14]/95 sticky top-0 z-30 backdrop-blur-md">
                  <th
                    scope="col"
                    className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-slate-400 sticky left-0 z-40 bg-[#0B0F14] border-r border-[#293442]"
                  >
                    Venue Overview
                  </th>
                  {facilities.map((fac) => (
                    <th
                      key={fac.id}
                      scope="col"
                      className="p-4 sm:p-5 align-top border-r border-[#293442] last:border-r-0 relative"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                            {fac.sport}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemove(fac.id)}
                            aria-label={`Remove ${fac.name} from comparison`}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          <h2 className="font-['Barlow_Condensed'] text-2xl font-black text-white leading-tight">
                            {fac.name}
                          </h2>
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span className="truncate">{fac.area}, {fac.city}</span>
                          </div>
                        </div>

                        {/* Top quick-book button */}
                        <div className="pt-1">
                          <Link to={`/facilities/${fac.id}`}>
                            <Button
                              variant="crimson"
                              size="sm"
                              className="w-full text-xs font-bold justify-center"
                            >
                              <span>View Venue</span>
                              <ExternalLink className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* ─────────────────────────────────────────────────────────────
                    SECTION 1: OVERVIEW & GENERAL ATTRIBUTES
                   ───────────────────────────────────────────────────────────── */}
                <tr className="bg-[#1B2530]/50 border-b border-[#293442]">
                  <th
                    colSpan={facilities.length + 1}
                    scope="colgroup"
                    className="px-4 py-2 text-[11px] font-black uppercase tracking-wider text-[#c6ff3d] sticky left-0 z-20"
                  >
                    1. Venue Overview &amp; Location
                  </th>
                </tr>

                {(!showOnlyDifferences || isRowDifferent((f) => f.sport)) && (
                  <tr className="border-b border-[#293442]/60 hover:bg-[#1B2530]/30 transition-colors">
                    <th
                      scope="row"
                      className="p-4 text-xs font-semibold text-slate-300 sticky left-0 z-20 bg-[#141B24] border-r border-[#293442]"
                    >
                      Sport
                    </th>
                    {facilities.map((fac) => (
                      <td key={fac.id} className="p-4 text-xs font-medium text-white border-r border-[#293442] last:border-r-0">
                        {fac.sport}
                      </td>
                    ))}
                  </tr>
                )}

                {(!showOnlyDifferences || isRowDifferent((f) => f.distanceDisplay)) && (
                  <tr className="border-b border-[#293442]/60 hover:bg-[#1B2530]/30 transition-colors">
                    <th
                      scope="row"
                      className="p-4 text-xs font-semibold text-slate-300 sticky left-0 z-20 bg-[#141B24] border-r border-[#293442]"
                    >
                      Distance
                    </th>
                    {facilities.map((fac) => (
                      <td key={fac.id} className="p-4 text-xs text-slate-300 border-r border-[#293442] last:border-r-0">
                        {fac.distanceDisplay}
                      </td>
                    ))}
                  </tr>
                )}

                {(!showOnlyDifferences || isRowDifferent((f) => f.indoor)) && (
                  <tr className="border-b border-[#293442]/60 hover:bg-[#1B2530]/30 transition-colors">
                    <th
                      scope="row"
                      className="p-4 text-xs font-semibold text-slate-300 sticky left-0 z-20 bg-[#141B24] border-r border-[#293442]"
                    >
                      Environment
                    </th>
                    {facilities.map((fac) => (
                      <td key={fac.id} className="p-4 text-xs font-medium text-white border-r border-[#293442] last:border-r-0">
                        {fac.indoor}
                      </td>
                    ))}
                  </tr>
                )}

                {(!showOnlyDifferences || isRowDifferent((f) => f.surface)) && (
                  <tr className="border-b border-[#293442]/60 hover:bg-[#1B2530]/30 transition-colors">
                    <th
                      scope="row"
                      className="p-4 text-xs font-semibold text-slate-300 sticky left-0 z-20 bg-[#141B24] border-r border-[#293442]"
                    >
                      Surface Type
                    </th>
                    {facilities.map((fac) => (
                      <td key={fac.id} className="p-4 text-xs text-slate-300 border-r border-[#293442] last:border-r-0">
                        {fac.surface}
                      </td>
                    ))}
                  </tr>
                )}

                {(!showOnlyDifferences || isRowDifferent((f) => f.capacity)) && (
                  <tr className="border-b border-[#293442]/60 hover:bg-[#1B2530]/30 transition-colors">
                    <th
                      scope="row"
                      className="p-4 text-xs font-semibold text-slate-300 sticky left-0 z-20 bg-[#141B24] border-r border-[#293442]"
                    >
                      Player Capacity
                    </th>
                    {facilities.map((fac) => (
                      <td key={fac.id} className="p-4 text-xs text-slate-300 border-r border-[#293442] last:border-r-0">
                        {fac.capacity}
                      </td>
                    ))}
                  </tr>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    SECTION 2: REAL PRICING & ESTIMATED TOTALS
                   ───────────────────────────────────────────────────────────── */}
                <tr className="bg-[#1B2530]/50 border-b border-[#293442]">
                  <th
                    colSpan={facilities.length + 1}
                    scope="colgroup"
                    className="px-4 py-2 text-[11px] font-black uppercase tracking-wider text-[#c6ff3d] sticky left-0 z-20"
                  >
                    2. Pricing &amp; Estimated Slot Cost
                  </th>
                </tr>

                {(!showOnlyDifferences || isRowDifferent((f) => f.standardRate)) && (
                  <tr className="border-b border-[#293442]/60 hover:bg-[#1B2530]/30 transition-colors">
                    <th
                      scope="row"
                      className="p-4 text-xs font-semibold text-slate-300 sticky left-0 z-20 bg-[#141B24] border-r border-[#293442]"
                    >
                      Standard Rate
                    </th>
                    {facilities.map((fac) => (
                      <td key={fac.id} className="p-4 text-xs text-slate-300 border-r border-[#293442] last:border-r-0">
                        {fac.standardRate ? (
                          <span className="font-bold text-white font-['Barlow_Condensed'] text-base">
                            ₹{fac.standardRate} <span className="text-slate-400 font-normal text-xs">/ hr</span>
                          </span>
                        ) : (
                          'Not available'
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {(!showOnlyDifferences || isRowDifferent((f) => f.peakRate)) && (
                  <tr className="border-b border-[#293442]/60 hover:bg-[#1B2530]/30 transition-colors">
                    <th
                      scope="row"
                      className="p-4 text-xs font-semibold text-slate-300 sticky left-0 z-20 bg-[#141B24] border-r border-[#293442]"
                    >
                      Peak Rate
                    </th>
                    {facilities.map((fac) => (
                      <td key={fac.id} className="p-4 text-xs text-slate-300 border-r border-[#293442] last:border-r-0">
                        {fac.peakRate ? (
                          <div>
                            <span className="font-bold text-rose-300 font-['Barlow_Condensed'] text-base">
                              ₹{fac.peakRate} <span className="text-slate-400 font-normal text-xs">/ hr</span>
                            </span>
                            {fac.peakHours && fac.peakHours.length > 0 && (
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Peak hours: {fac.peakHours[0]} - {fac.peakHours[fac.peakHours.length - 1]}
                              </p>
                            )}
                          </div>
                        ) : (
                          'Not available'
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Estimated Total for the selected window */}
                <tr className="border-b border-[#293442]/60 bg-[#0B0F14]/40 hover:bg-[#1B2530]/30 transition-colors">
                  <th
                    scope="row"
                    className="p-4 text-xs font-semibold text-slate-300 sticky left-0 z-20 bg-[#141B24] border-r border-[#293442]"
                  >
                    <div>
                      <span>Estimated Total</span>
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                        {startTime} ({duration} hr) + taxes
                      </span>
                    </div>
                  </th>
                  {facilities.map((fac) => {
                    const isLowest = comparisonResult.lowestPriceFacilityId === fac.id;
                    const estimate = fac.priceEstimate;
                    return (
                      <td key={fac.id} className="p-4 align-top border-r border-[#293442] last:border-r-0">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-['Barlow_Condensed'] text-2xl font-black text-white">
                              ₹{estimate.total}
                            </span>
                            {isLowest && (
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#c6ff3d] text-slate-950 shadow-[0_0_10px_rgba(198,255,61,0.4)]"
                                title="Lowest estimated price for this slot"
                              >
                                Lowest for this slot
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Base: ₹{estimate.basePrice} | Tax: ₹{estimate.taxes} | Platform: ₹{estimate.platformFee}
                          </p>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* ─────────────────────────────────────────────────────────────
                    SECTION 3: REAL SLOT AVAILABILITY
                   ───────────────────────────────────────────────────────────── */}
                <tr className="bg-[#1B2530]/50 border-b border-[#293442]">
                  <th
                    colSpan={facilities.length + 1}
                    scope="colgroup"
                    className="px-4 py-2 text-[11px] font-black uppercase tracking-wider text-[#c6ff3d] sticky left-0 z-20"
                  >
                    3. Slot Availability ({date} at {startTime})
                  </th>
                </tr>

                <tr className="border-b border-[#293442]/60 hover:bg-[#1B2530]/30 transition-colors">
                  <th
                    scope="row"
                    className="p-4 text-xs font-semibold text-slate-300 sticky left-0 z-20 bg-[#141B24] border-r border-[#293442]"
                  >
                    Slot Status
                  </th>
                  {facilities.map((fac) => {
                    const avail = fac.availability;
                    const isAvailable = avail.status === 'Available';
                    const isClosed = avail.status === 'Closed';

                    return (
                      <td key={fac.id} className="p-4 align-top border-r border-[#293442] last:border-r-0">
                        <div className="space-y-2">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                              isAvailable
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : isClosed
                                ? 'bg-slate-700/30 text-slate-400 border border-slate-700'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isAvailable ? 'bg-emerald-400' : isClosed ? 'bg-slate-400' : 'bg-rose-400'
                              }`}
                            />
                            {avail.status}
                          </span>

                          {/* Alternatives when slot is booked or closed */}
                          {!isAvailable && avail.alternativeSlots && avail.alternativeSlots.length > 0 && (
                            <div className="text-[11px] space-y-1 pt-1">
                              <span className="text-slate-400 block font-medium">Nearest open slots:</span>
                              <div className="flex flex-wrap gap-1">
                                {avail.alternativeSlots.map((altTime) => (
                                  <button
                                    key={altTime}
                                    type="button"
                                    onClick={() => handleSelectAlternative(altTime)}
                                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1B2530] text-[#c6ff3d] hover:bg-[#c6ff3d]/15 border border-[#293442] hover:border-[#c6ff3d] transition-colors cursor-pointer"
                                  >
                                    {altTime}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* ─────────────────────────────────────────────────────────────
                    SECTION 4: QUALITY & REPUTATION
                   ───────────────────────────────────────────────────────────── */}
                <tr className="bg-[#1B2530]/50 border-b border-[#293442]">
                  <th
                    colSpan={facilities.length + 1}
                    scope="colgroup"
                    className="px-4 py-2 text-[11px] font-black uppercase tracking-wider text-[#c6ff3d] sticky left-0 z-20"
                  >
                    4. Verified Player Reviews &amp; Rating
                  </th>
                </tr>

                {(!showOnlyDifferences || isRowDifferent((f) => f.ratingDisplay)) && (
                  <tr className="border-b border-[#293442]/60 hover:bg-[#1B2530]/30 transition-colors">
                    <th
                      scope="row"
                      className="p-4 text-xs font-semibold text-slate-300 sticky left-0 z-20 bg-[#141B24] border-r border-[#293442]"
                    >
                      Player Rating
                    </th>
                    {facilities.map((fac) => (
                      <td key={fac.id} className="p-4 text-xs border-r border-[#293442] last:border-r-0">
                        {fac.rating ? (
                          <div className="flex items-center gap-1.5 font-bold text-amber-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span>{fac.rating}</span>
                            <span className="text-slate-400 font-normal">
                              ({fac.reviewCount} reviews)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">No reviews yet</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    SECTION 5: CONFIRMED AMENITIES CHECKLIST
                   ───────────────────────────────────────────────────────────── */}
                <tr className="bg-[#1B2530]/50 border-b border-[#293442]">
                  <th
                    colSpan={facilities.length + 1}
                    scope="colgroup"
                    className="px-4 py-2 text-[11px] font-black uppercase tracking-wider text-[#c6ff3d] sticky left-0 z-20"
                  >
                    5. Standard Amenities Checklist
                  </th>
                </tr>

                {STANDARD_AMENITIES.map((amenity) => {
                  const hasDiff = isRowDifferent((f) => f.amenitiesMap[amenity]);
                  if (showOnlyDifferences && !hasDiff) return null;

                  return (
                    <tr
                      key={amenity}
                      className="border-b border-[#293442]/60 hover:bg-[#1B2530]/30 transition-colors"
                    >
                      <th
                        scope="row"
                        className="p-4 text-xs font-semibold text-slate-300 sticky left-0 z-20 bg-[#141B24] border-r border-[#293442]"
                      >
                        {amenity}
                      </th>
                      {facilities.map((fac) => {
                        const status = fac.amenitiesMap[amenity];
                        const isConfirmed = status === 'Confirmed';

                        return (
                          <td
                            key={fac.id}
                            className="p-4 text-xs border-r border-[#293442] last:border-r-0"
                          >
                            {isConfirmed ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                                <Check className="w-3.5 h-3.5" />
                                Confirmed
                              </span>
                            ) : (
                              <span className="text-slate-500 font-normal">
                                — Not listed
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Cancellation Policy */}
                {(!showOnlyDifferences || isRowDifferent((f) => f.cancellationPolicy)) && (
                  <tr className="border-b border-[#293442]/60 hover:bg-[#1B2530]/30 transition-colors">
                    <th
                      scope="row"
                      className="p-4 text-xs font-semibold text-slate-300 sticky left-0 z-20 bg-[#141B24] border-r border-[#293442]"
                    >
                      Cancellation Policy
                    </th>
                    {facilities.map((fac) => (
                      <td key={fac.id} className="p-4 text-xs text-slate-400 border-r border-[#293442] last:border-r-0">
                        {fac.cancellationPolicy}
                      </td>
                    ))}
                  </tr>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    SECTION 6: ACTIONS & BOOKING JUMP
                   ───────────────────────────────────────────────────────────── */}
                <tr className="bg-[#0B0F14]/80">
                  <th
                    scope="row"
                    className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 sticky left-0 z-20 bg-[#0B0F14] border-r border-[#293442]"
                  >
                    Actions
                  </th>
                  {facilities.map((fac) => {
                    const isAvailable = fac.availability.status === 'Available';

                    return (
                      <td key={fac.id} className="p-4 align-top border-r border-[#293442] last:border-r-0">
                        <div className="space-y-2">
                          <Link to={`/facilities/${fac.id}`}>
                            <Button
                              variant={isAvailable ? 'gold' : 'outline'}
                              size="sm"
                              className="w-full text-xs font-bold justify-center"
                            >
                              {isAvailable ? 'Book This Slot' : 'View Facility'}
                            </Button>
                          </Link>
                          <p className="text-[10px] text-center text-slate-400">
                            {isAvailable
                              ? `Ready to reserve for ${startTime}`
                              : 'Slot unavailable for chosen window'}
                          </p>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

