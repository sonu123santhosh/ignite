import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  FileCheck,
  BookmarkCheck
} from 'lucide-react';
import Button from '../components/Button';
import Tag from '../components/Tag';
import { checkSlotOverlap, INITIAL_FACILITIES } from '../data/facilitiesData';

export default function FacilityCheckout({
  sharedState,
  setSharedState,
  currentBookingSelection
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useOutletContext();

  const facilities = sharedState?.facilities || INITIAL_FACILITIES;
  const facility = facilities.find((f) => f.id === id) || currentBookingSelection?.facility || facilities[0];
  const bookings = sharedState?.bookings || [];

  const selection = currentBookingSelection || {
    facility,
    ground: facility.grounds[0],
    date: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    durationHours: 1,
    priceBreakdown: { basePrice: facility.pricing.peak, taxPercent: 18, taxes: 216, platformFee: 40, total: 1456 }
  };

  // Form State
  const [playerName, setPlayerName] = useState('');
  const [playerPhone, setPlayerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [errors, setErrors] = useState({});

  // Confirmation state
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    document.title = `Checkout &bull; ${facility.name} | SportLink`;
  }, [facility]);

  const validate = () => {
    const errs = {};
    if (!playerName.trim() || playerName.trim().length < 3) {
      errs.playerName = 'Please enter your full name (at least 3 characters)';
    }

    const phoneRegex = /^[+]?[0-9\s-]{10,14}$/;
    if (!playerPhone.trim() || !phoneRegex.test(playerPhone.trim())) {
      errs.playerPhone = 'Please provide a valid 10-digit phone number for match updates';
    }

    if (!agreePolicy) {
      errs.agreePolicy = 'You must acknowledge the cancellation and turf policy before confirming';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // CRITICAL RULE: Recheck availability at the exact moment of confirmation!
    const isOverlapping = checkSlotOverlap(
      facility.id,
      selection.ground.id,
      selection.date,
      selection.startTime,
      selection.durationHours,
      bookings
    );

    if (isOverlapping) {
      showToast({
        title: 'Booking Collision Detected',
        message: 'That slot was just booked by another player! Please return to choose another slot.',
        type: 'error',
        isDemo: true
      });
      return;
    }

    // Create the new demo booking
    const newRef = `SPL-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBooking = {
      id: newRef,
      facilityId: facility.id,
      facilityName: facility.name,
      groundId: selection.ground.id,
      groundName: selection.ground.name,
      sport: facility.sport,
      date: selection.date,
      startTime: selection.startTime,
      durationHours: selection.durationHours,
      endTime: `${parseInt(selection.startTime.split(':')[0], 10) + selection.durationHours}:00`,
      amount: selection.priceBreakdown.total,
      playerName: playerName.trim(),
      playerPhone: playerPhone.trim(),
      notes: notes.trim(),
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      isSample: true
    };

    // Save to shared in-memory bookings state
    setSharedState((prev) => ({
      ...prev,
      bookings: [newBooking, ...(prev.bookings || [])]
    }));

    setConfirmedBooking(newBooking);

    showToast({
      title: 'Demo Reservation Created',
      message: `Reference #${newRef} recorded in My Bookings. No real payment taken.`,
      type: 'success',
      isDemo: true
    });
  };

  // If Confirmed, show Confirmation Screen
  if (confirmedBooking) {
    return (
      <div className="py-12 sm:py-16 max-w-2xl mx-auto px-4 sm:px-6 animate-hero-fade">
        <div className="bg-[#141B24] border border-[#22C55E]/40 rounded-2xl p-6 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E5C378]">
              Demo Booking Confirmed
            </span>
            <h1 className="font-['Barlow_Condensed'] text-4xl font-black uppercase text-[#F5F7FA] mt-1">
              Your Slot is Secured
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
              Demo booking: no payment taken and no real reservation made.
            </p>
          </div>

          {/* Reference Card */}
          <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-5 text-left space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#293442]">
              <span className="text-xs text-[#94A3B8]">Booking Reference:</span>
              <span className="font-mono text-sm font-bold text-amber-400">
                {confirmedBooking.id}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-[#F5F7FA]">
              <div><strong>Facility:</strong> {confirmedBooking.facilityName}</div>
              <div><strong>Pitch:</strong> {confirmedBooking.groundName} ({confirmedBooking.sport})</div>
              <div><strong>Scheduled Date:</strong> {confirmedBooking.date}</div>
              <div><strong>Timing:</strong> {confirmedBooking.startTime} ({confirmedBooking.durationHours} Hour)</div>
              <div><strong>Player Name:</strong> {confirmedBooking.playerName}</div>
              <div><strong>Estimated Total:</strong> ₹{confirmedBooking.amount}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/facilities">
              <Button variant="gold" size="md">
                Browse More Facilities
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-hero-fade">
      {/* Back button */}
      <div>
        <Link
          to={`/facilities/${facility.id}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#94A3B8] hover:text-[#E5C378] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Slot Time</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Player Details Form */}
        <div className="md:col-span-7 bg-[#141B24] border border-[#293442] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E5C378]">
              Step 2 &bull; Player Information
            </span>
            <h1 className="font-['Barlow_Condensed'] text-3xl font-black uppercase text-[#F5F7FA] mt-1">
              Confirm Reservation Details
            </h1>
            <p className="text-xs text-[#94A3B8] mt-1">
              No payment card required. This is a front-end booking simulation.
            </p>
          </div>

          <form onSubmit={handleConfirmBooking} noValidate className="space-y-4">
            <div>
              <label htmlFor="player-name-input" className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-1.5">
                Player / Captain Full Name *
              </label>
              <input
                id="player-name-input"
                type="text"
                placeholder="e.g. Arjun Verma"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  if (errors.playerName) setErrors({ ...errors, playerName: null });
                }}
                aria-invalid={errors.playerName ? 'true' : 'false'}
                className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-[#D4AF37]"
              />
              {errors.playerName && (
                <p role="alert" className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.playerName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="player-phone-input" className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-1.5">
                Phone Number (for Ground SMS) *
              </label>
              <input
                id="player-phone-input"
                type="tel"
                placeholder="+91 98765 43210"
                value={playerPhone}
                onChange={(e) => {
                  setPlayerPhone(e.target.value);
                  if (errors.playerPhone) setErrors({ ...errors, playerPhone: null });
                }}
                aria-invalid={errors.playerPhone ? 'true' : 'false'}
                className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-[#D4AF37]"
              />
              {errors.playerPhone && (
                <p role="alert" className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.playerPhone}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="player-notes-input" className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-1.5">
                Special Requests / Notes (Optional)
              </label>
              <textarea
                id="player-notes-input"
                rows="2"
                placeholder="e.g. Require bibs and footballs, match starting promptly..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl p-3 focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>

            {/* Policy Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreePolicy}
                  onChange={(e) => {
                    setAgreePolicy(e.target.checked);
                    if (errors.agreePolicy) setErrors({ ...errors, agreePolicy: null });
                  }}
                  className="rounded border-[#293442] bg-[#0B0F14] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer mt-0.5 accent-[#D4AF37]"
                />
                <span className="text-xs text-[#94A3B8] leading-tight">
                  I understand the venue&apos;s cancellation policy: &quot;{facility.cancellationPolicy}&quot;
                </span>
              </label>
              {errors.agreePolicy && (
                <p role="alert" className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.agreePolicy}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-[#293442]">
              <Button type="submit" variant="gold" size="lg" className="w-full py-3">
                Confirm Demo Booking
              </Button>
            </div>
          </form>
        </div>

        {/* Right: Booking Summary Receipt */}
        <div className="md:col-span-5 bg-[#141B24] border border-[#293442] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-[#F5F7FA]">
            Reservation Item
          </h3>

          <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-4 space-y-2 text-xs">
            <div className="font-bold text-white text-sm">{facility.name}</div>
            <div className="text-[#94A3B8]">{selection.ground.name}</div>

            <div className="pt-2 border-t border-[#293442]/60 space-y-1 text-[#94A3B8]">
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="text-white">{selection.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Slot Window:</span>
                <span className="text-white">{selection.startTime} ({selection.durationHours}h)</span>
              </div>
              <div className="flex justify-between">
                <span>Base Fee:</span>
                <span className="text-white">₹{selection.priceBreakdown.basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span>GST:</span>
                <span className="text-white">₹{selection.priceBreakdown.taxes}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee:</span>
                <span className="text-white">₹{selection.priceBreakdown.platformFee}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#293442] flex justify-between font-bold">
              <span className="text-white">Total:</span>
              <span className="text-[#E5C378] text-base">₹{selection.priceBreakdown.total}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0B0F14] border border-[#293442] text-[11px] text-[#94A3B8] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0" />
            <span>No payment is processed. Booking appears in My Bookings upon confirmation.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
