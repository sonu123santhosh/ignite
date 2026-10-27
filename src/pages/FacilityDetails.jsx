import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Star,
  ShieldCheck,
  Clock,
  Users,
  Layers,
  Sparkles,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Button from '../components/Button';
import Tag from '../components/Tag';
import SlotTable from '../components/SlotTable';
import PriceSummary from '../components/PriceSummary';
import {
  INITIAL_FACILITIES,
  getRelativeDateStr,
  calculateBookingPrice,
  checkSlotOverlap,
  generateSlotsForGroundAndDate
} from '../data/facilitiesData';

export default function FacilityDetails({
  sharedState,
  setSharedState,
  currentBookingSelection,
  setCurrentBookingSelection
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  const todayStr = getRelativeDateStr(0);

  const facilities = sharedState?.facilities || INITIAL_FACILITIES;
  const facility = facilities.find((f) => f.id === id) || facilities[0];
  const bookings = sharedState?.bookings || [];
  const customSlotOverrides = sharedState?.customSlotOverrides || {};

  // Booking Flow Selections
  const [selectedGroundId, setSelectedGroundId] = useState(facility.grounds[0]?.id || 'g1-1');
  const selectedGround = facility.grounds.find((g) => g.id === selectedGroundId) || facility.grounds[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlotTime, setSelectedSlotTime] = useState(null);
  const [durationHours, setDurationHours] = useState(1);

  // 5-minute temporary hold countdown (300 seconds)
  const [holdRemainingSec, setHoldRemainingSec] = useState(300);
  const [holdExpired, setHoldExpired] = useState(false);

  useEffect(() => {
    document.title = `${facility.name} | SportLink`;
  }, [facility]);

  // Hold Timer logic
  useEffect(() => {
    if (!selectedSlotTime) {
      setHoldRemainingSec(300);
      setHoldExpired(false);
      return;
    }

    setHoldRemainingSec(300);
    setHoldExpired(false);

    // Announce hold start to assistive technology
    showToast({
      title: 'Slot Held for 5 Minutes',
      message: `Held ${selectedSlotTime} on ${selectedGround.name}. Please complete checkout before the timer expires.`,
      type: 'info',
      isDemo: true
    });

    const interval = setInterval(() => {
      setHoldRemainingSec((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setHoldExpired(true);
          setSelectedSlotTime(null);
          showToast({
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
  }, [selectedSlotTime]);

  // Generate slots to compute exact price breakdown
  const slots = useMemo(() => {
    return generateSlotsForGroundAndDate(
      facility,
      selectedGroundId,
      selectedDate,
      bookings,
      customSlotOverrides
    );
  }, [facility, selectedGroundId, selectedDate, bookings, customSlotOverrides]);

  const selectedSlots = useMemo(() => {
    if (!selectedSlotTime) return [];
    const startIndex = slots.findIndex((s) => s.startStr === selectedSlotTime);
    if (startIndex === -1) return [];

    const result = [];
    for (let i = 0; i < durationHours; i++) {
      const current = slots[startIndex + i];
      if (current) result.push(current);
    }
    return result;
  }, [slots, selectedSlotTime, durationHours]);

  const priceBreakdown = useMemo(() => {
    return calculateBookingPrice(facility, durationHours, selectedSlots);
  }, [facility, durationHours, selectedSlots]);

  // Conflict simulator (second player booking)
  const handleSimulateConflict = (facId, groundId, dateStr, startTime) => {
    const conflictBooking = {
      id: `bk-conflict-${Date.now()}`,
      facilityId: facId,
      facilityName: facility.name,
      groundId: groundId,
      groundName: selectedGround.name,
      sport: facility.sport,
      date: dateStr,
      startTime: startTime,
      durationHours: 1,
      endTime: `${parseInt(startTime.split(':')[0], 10) + 1}:00`,
      amount: facility.pricing.peak,
      playerName: 'Simulated Rival Player',
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
    if (!selectedSlotTime) return;

    // CRITICAL RULE: Recheck availability at the moment the user confirms!
    const isOverlapping = checkSlotOverlap(
      facility.id,
      selectedGroundId,
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
      // Release slot selection without losing the other choices (date, ground remain intact)
      setSelectedSlotTime(null);
      return;
    }

    // Pass selection data to checkout
    setCurrentBookingSelection({
      facility,
      ground: selectedGround,
      date: selectedDate,
      startTime: selectedSlotTime,
      durationHours,
      priceBreakdown,
      holdRemainingSec
    });

    navigate(`/facilities/${facility.id}/checkout`);
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-hero-fade">
      {/* Top Breadcrumb & Back button */}
      <div className="flex items-center justify-between">
        <Link to="/facilities" className="inline-flex items-center gap-2 text-xs font-bold text-[#94A3B8] hover:text-[#E5C378] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Facilities Directory</span>
        </Link>
        <span className="text-[11px] text-[#94A3B8] bg-[#141B24] border border-[#293442] px-2.5 py-1 rounded-full">
          Demo Facility Profile
        </span>
      </div>

      {/* Main Header & Photo Replacement Gallery Slot */}
      <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Photo Gallery Slot */}
        <div
          className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-[#0B0F14] border border-[#293442] flex flex-col justify-between p-6"
          role="img"
          aria-label={`Photo gallery slot for ${facility.name}`}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0B0F14] via-[#1B2530]/70 to-[#141B24]" />

          {/* Top Gallery Tags */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E5C378] bg-[#0B0F14]/90 px-3 py-1 rounded-full border border-[#D4AF37]/35">
                {facility.sport}
              </span>
              <span className="text-xs font-medium text-[#94A3B8] bg-[#0B0F14]/90 px-2.5 py-1 rounded-full border border-[#293442]">
                {facility.indoor ? 'Indoor Facility' : 'Outdoor Turf'}
              </span>
            </div>
            {facility.verified && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-[#0B0F14]/90 border border-emerald-500/40 px-3 py-1 rounded-full">
                <ShieldCheck className="w-4 h-4" />
                Verified Facility
              </span>
            )}
          </div>

          {/* Central schematic illustration */}
          <div className="relative z-10 text-center space-y-1">
            <h1 className="text-3xl sm:text-5xl font-black uppercase text-[#F5F7FA] font-['Barlow_Condensed'] leading-tight">
              {facility.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] flex items-center justify-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              {facility.address}
            </p>
          </div>

          {/* Bottom Note */}
          <div className="relative z-10 flex justify-between text-[11px] text-[#94A3B8]">
            <span>Photo Replacement Slot (High-res photo ready)</span>
            <span>Operating Hours: {facility.openTime} - {facility.closeTime}</span>
          </div>
        </div>

        {/* Quick Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Surface Quality</span>
            <div className="text-sm font-bold text-white mt-0.5 truncate">{facility.surface}</div>
          </div>
          <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Player Capacity</span>
            <div className="text-sm font-bold text-white mt-0.5">{facility.capacity}</div>
          </div>
          <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Overall Rating</span>
            <div className="text-sm font-bold text-amber-400 mt-0.5 flex items-center gap-1">
              <Star className="w-4 h-4 fill-current" />
              {facility.rating} <span className="text-xs text-[#94A3B8]">({facility.reviewCount} reviews)</span>
            </div>
          </div>
          <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Available Grounds</span>
            <div className="text-sm font-bold text-[#E5C378] mt-0.5">{facility.grounds.length} Pitches</div>
          </div>
        </div>

        {/* Description & Verified Amenities */}
        <div className="space-y-4 pt-2">
          <div>
            <h3 className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-[#F5F7FA]">
              About the Ground
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed mt-1">
              {facility.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-2">
              Facility Amenities (Show only present)
            </h4>
            <div className="flex flex-wrap gap-2">
              {facility.amenities.map((amenity, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 text-xs text-[#F5F7FA] bg-[#0B0F14] border border-[#293442] px-3 py-1.5 rounded-lg"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5C378]" />
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Engine & Sticky Price Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Slot Table */}
        <div className="lg:col-span-8 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E5C378]">
              Step 1 &bull; Choose Slot
            </span>
            <h2 className="font-['Barlow_Condensed'] text-3xl font-black uppercase text-[#F5F7FA] mt-1">
              Reserve Ground Time
            </h2>
          </div>

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
            onShowToast={showToast}
          />

          {/* Customer Reviews Section */}
          <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 sm:p-7 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-[#293442]">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-2xl font-black uppercase text-[#F5F7FA]">
                  Player Ratings &amp; Reviews
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Verified reviews only carry the badge when linked to completed sample reservations.
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-amber-400 font-['Barlow_Condensed'] flex items-center gap-1">
                  <Star className="w-5 h-5 fill-current" />
                  {facility.rating}
                </div>
                <span className="text-[10px] text-[#94A3B8]">{facility.reviewCount} total scores</span>
              </div>
            </div>

            {/* Category Scores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0B0F14] border border-[#293442] rounded-xl p-4 text-xs">
              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase">Cleanliness</span>
                <strong className="text-white">4.8 / 5.0</strong>
              </div>
              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase">Pitch Quality</span>
                <strong className="text-white">4.9 / 5.0</strong>
              </div>
              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase">Staff &amp; Referee</span>
                <strong className="text-white">4.7 / 5.0</strong>
              </div>
              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase">Value for Money</span>
                <strong className="text-white">4.6 / 5.0</strong>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {facility.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-[#0B0F14] border border-[#293442] space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{rev.user}</span>
                      {rev.verifiedBooking && (
                        <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/30 px-2 py-0.5 rounded-full">
                          Verified Booking
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-amber-400 font-bold">{rev.rating} ★</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    &quot;{rev.comment}&quot;
                  </p>
                  <span className="text-[10px] text-slate-500 block">{rev.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sticky Price & Booking Summary Panel */}
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
  );
}
