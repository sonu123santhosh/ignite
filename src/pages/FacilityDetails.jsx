import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Star
} from 'lucide-react';
import Button from '../components/Button';
import SlotTable from '../components/SlotTable';
import PriceSummary from '../components/PriceSummary';
import FacilityOverview from '../components/facility/FacilityOverview';
import FacilityPhotoGallery from '../components/facility/FacilityPhotoGallery';
import FacilityAmenitiesSection from '../components/facility/FacilityAmenitiesSection';
import FacilityPricingSection from '../components/facility/FacilityPricingSection';
import {
  adaptFacility,
  getLocalDateStr
} from '../components/facility/facilityAdapter';
import {
  INITIAL_FACILITIES,
  checkSlotOverlap
} from '../data/facilitiesData';

export default function FacilityDetails({
  sharedState,
  setSharedState,
  _currentBookingSelection,
  setCurrentBookingSelection
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const showToast = outletContext.showToast || (() => {});
  const showToastRef = React.useRef(showToast);
  showToastRef.current = showToast;

  const todayStr = useMemo(() => getLocalDateStr(), []);

  const facilities = sharedState?.facilities || INITIAL_FACILITIES;
  const rawFacility = facilities.find((f) => f && f.id === id);

  // Strictly adapted facility data
  const facility = useMemo(() => {
    return rawFacility ? adaptFacility(rawFacility) : null;
  }, [rawFacility]);

  const bookings = sharedState?.bookings || [];
  const customSlotOverrides = sharedState?.customSlotOverrides || {};

  // Selections state (reset when facility id changes)
  const [selectedGroundId, setSelectedGroundId] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlotTime, setSelectedSlotTime] = useState(null);
  const [durationHours, setDurationHours] = useState(1);

  // 5-minute temporary hold countdown (300 seconds)
  const [holdRemainingSec, setHoldRemainingSec] = useState(300);
  const [holdExpired, setHoldExpired] = useState(false);

  // Reset all selections when navigating between facilities
  useEffect(() => {
    if (facility && facility.grounds && facility.grounds.length > 0) {
      setSelectedGroundId(facility.grounds[0].id);
    } else {
      setSelectedGroundId('');
    }
    setSelectedDate(todayStr);
    setSelectedSlotTime(null);
    setDurationHours(1);
    setHoldRemainingSec(300);
    setHoldExpired(false);
  }, [id, facility, todayStr]);

  // Document title
  useEffect(() => {
    if (facility?.name) {
      document.title = `${facility.name} | SportLink`;
    } else {
      document.title = 'Facility Not Found | SportLink';
    }
  }, [facility?.name]);

  const selectedGround = useMemo(() => {
    if (!facility || !facility.grounds) return null;
    return facility.grounds.find((g) => g.id === selectedGroundId) || facility.grounds[0] || null;
  }, [facility, selectedGroundId]);

  // Hold Timer logic
  useEffect(() => {
    if (!selectedSlotTime) {
      setHoldRemainingSec(300);
      setHoldExpired(false);
      return;
    }

    setHoldRemainingSec(300);
    setHoldExpired(false);

    showToastRef.current({
      title: 'Slot Held for 5 Minutes',
      message: `Held ${selectedSlotTime} on ${selectedGround?.name || 'court'}. Complete checkout before timeout.`,
      type: 'info',
      isDemo: true
    });

    const interval = setInterval(() => {
      setHoldRemainingSec((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setHoldExpired(true);
          setSelectedSlotTime(null);
          showToastRef.current({
            title: 'Reservation Hold Expired',
            message: 'Your 5-minute slot hold has expired and was released. Please pick your slot again.',
            type: 'error',
            isDemo: true
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedSlotTime, selectedGround?.name]);

  // Calculate pricing breakdown for selected slot(s)
  const priceBreakdown = useMemo(() => {
    if (!facility || !selectedSlotTime) {
      return { basePrice: 0, taxPercent: 18, taxes: 0, platformFee: 0, total: 0 };
    }

    const peakHours = facility.pricing?.peakHours || [];
    const standardRate = facility.pricing?.standardHourlyRate || 1000;
    const peakRate = facility.pricing?.peakHourlyRate || 1200;

    let basePrice = 0;
    const startH = parseInt(selectedSlotTime.split(':')[0], 10);
    for (let i = 0; i < durationHours; i++) {
      const hStr = `${(startH + i).toString().padStart(2, '0')}:00`;
      const isPeak = peakHours.includes(hStr);
      basePrice += isPeak ? peakRate : standardRate;
    }

    const taxPercent = facility.pricing?.taxPercent ?? 18;
    const taxes = Math.round((basePrice * taxPercent) / 100);
    const platformFee = facility.pricing?.platformFee ?? 30;
    const total = basePrice + taxes + platformFee;

    return {
      basePrice,
      taxPercent,
      taxes,
      platformFee,
      total
    };
  }, [facility, selectedSlotTime, durationHours]);

  // Demo simulator tool (conflict simulation)
  const handleSimulateConflict = (facId, groundId, dateStr, startTime) => {
    if (!facility || !selectedGround) return;

    const conflictBooking = {
      id: `bk-conflict-${Date.now()}`,
      facilityId: facId,
      facilityName: facility.name,
      groundId: groundId,
      groundName: selectedGround.name,
      sport: facility.sports[0] || 'Sport',
      date: dateStr,
      startTime: startTime,
      durationHours: 1,
      endTime: `${parseInt(startTime.split(':')[0], 10) + 1}:00`,
      amount: facility.pricing?.peakHourlyRate || 1200,
      playerName: 'Simulated Concurrent Player',
      playerPhone: '+91 99999 00000',
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      isSample: true
    };

    setSharedState((prev) => ({
      ...prev,
      bookings: [conflictBooking, ...(prev.bookings || [])]
    }));

    showToast({
      title: 'Second Player Simulated',
      message: `Another player just confirmed a booking for ${startTime} on ${selectedGround.name}!`,
      type: 'warning',
      isDemo: true
    });
  };

  const handleReleaseSlot = () => {
    setSelectedSlotTime(null);
    setHoldRemainingSec(300);
    setHoldExpired(false);
  };

  // Recheck availability before navigating to checkout
  const handleContinueToCheckout = () => {
    if (!selectedSlotTime || !rawFacility || !selectedGround) return;

    // CRITICAL: Double-booking prevention at the exact moment user proceeds
    const isOverlapping = checkSlotOverlap(
      rawFacility.id,
      selectedGround.id,
      selectedDate,
      selectedSlotTime,
      durationHours,
      bookings
    );

    if (isOverlapping) {
      showToast({
        title: 'Slot Conflict Detected',
        message: 'That slot was just booked by another player. Please choose another time.',
        type: 'error',
        isDemo: true
      });
      setSelectedSlotTime(null);
      return;
    }

    // Pass selection data to checkout using exact existing hand-off contract
    setCurrentBookingSelection({
      facility: rawFacility,
      ground: selectedGround,
      date: selectedDate,
      startTime: selectedSlotTime,
      durationHours,
      priceBreakdown,
      holdRemainingSec
    });

    navigate(`/facilities/${rawFacility.id}/checkout`);
  };

  // 1. Not Found State for unknown facility ID
  if (!rawFacility || !facility) {
    return (
      <div className="py-16 sm:py-24 max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#141B24] border border-[#293442] flex items-center justify-center text-amber-400 mx-auto">
          <Building2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E5C378]">
            Error 404
          </span>
          <h1 className="font-['Barlow_Condensed'] text-4xl font-black uppercase text-[#F5F7FA]">
            Facility Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            We couldn&apos;t find a venue matching ID &quot;{id}&quot;. It may have been removed or the link might be incorrect.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/facilities">
            <Button variant="gold" size="md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Facilities Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-hero-fade">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/facilities"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#94A3B8] hover:text-[#E5C378] transition-colors focus-visible:ring-1 focus-visible:ring-[#E5C378] rounded p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Facilities Directory</span>
        </Link>
        <span className="text-[11px] text-[#94A3B8] bg-[#141B24] border border-[#293442] px-2.5 py-1 rounded-full">
          Venue Profile
        </span>
      </div>

      {/* SECTION 1: OVERVIEW */}
      <FacilityOverview facility={facility} />

      {/* SECTION 2: PHOTOS */}
      <FacilityPhotoGallery photos={facility.photos} venueName={facility.name} />

      {/* SECTION 3: AMENITIES */}
      <FacilityAmenitiesSection amenities={facility.amenities} />

      {/* SECTION 4: PRICING */}
      <FacilityPricingSection pricing={facility.pricing} />

      {/* SECTION 5: AVAILABILITY AND BOOKING CALENDAR */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E5C378]">
            Availability &amp; Booking
          </span>
          <h2 className="font-['Barlow_Condensed'] text-3xl font-black uppercase text-[#F5F7FA] mt-1 tracking-wide">
            Reserve Ground Time
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Slot Table */}
          <div className="lg:col-span-8 space-y-8">
            <SlotTable
              facility={facility}
              selectedGroundId={selectedGroundId}
              onSelectGround={setSelectedGroundId}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              selectedSlotTime={selectedSlotTime}
              onSelectSlotTime={setSelectedSlotTime}
              durationHours={durationHours}
              onChangeDuration={setDurationHours}
              existingBookings={bookings}
              customSlotOverrides={customSlotOverrides}
              onSimulateConflict={handleSimulateConflict}
              onReleaseSlot={handleReleaseSlot}
              holdRemainingSec={holdRemainingSec}
              holdExpired={holdExpired}
            />

            {/* Real Player Reviews (Only shown when reviews exist; no fake ratings) */}
            {facility.reviews && facility.reviews.length > 0 && (
              <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
                <div className="flex justify-between items-center pb-4 border-b border-[#293442]">
                  <div>
                    <h3 className="font-['Barlow_Condensed'] text-2xl font-black uppercase text-[#F5F7FA]">
                      Player Reviews
                    </h3>
                    <p className="text-xs text-[#94A3B8]">
                      Verified reviews submitted by players who booked this ground.
                    </p>
                  </div>

                  {facility.rating != null && (
                    <div className="text-right">
                      <div className="text-2xl font-black text-amber-400 font-['Barlow_Condensed'] flex items-center gap-1 justify-end">
                        <Star className="w-5 h-5 fill-current" />
                        <span>{facility.rating}</span>
                      </div>
                      <span className="text-[10px] text-[#94A3B8]">
                        {facility.reviewCount} {facility.reviewCount === 1 ? 'review' : 'reviews'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Reviews List */}
                <div className="space-y-3">
                  {facility.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-[#0B0F14] border border-[#293442] space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{rev.user}</span>
                          {rev.verifiedBooking && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                              Verified Booking
                            </span>
                          )}
                        </div>
                        {rev.rating != null && (
                          <span className="text-xs text-amber-400 font-bold">{rev.rating} ★</span>
                        )}
                      </div>

                      {rev.comment && (
                        <p className="text-xs text-[#94A3B8] leading-relaxed">
                          &quot;{rev.comment}&quot;
                        </p>
                      )}

                      {rev.date && (
                        <span className="text-[10px] text-slate-500 block">{rev.date}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Summary Panel */}
          <div className="lg:col-span-4">
            <PriceSummary
              facility={facility}
              selectedGround={selectedGround}
              selectedDate={selectedDate}
              selectedSlotTime={selectedSlotTime}
              durationHours={durationHours}
              priceBreakdown={priceBreakdown}
              onContinueToCheckout={handleContinueToCheckout}
              canContinue={Boolean(selectedSlotTime && !holdExpired)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
