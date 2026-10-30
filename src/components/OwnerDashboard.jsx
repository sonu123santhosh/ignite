import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  PlusCircle,
  Edit,
  PauseCircle,
  PlayCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Filter,
  MessageSquare,
  Send,
  Layers
} from 'lucide-react';
import Button from './Button';
import Tag from './Tag';
import { getRelativeDateStr } from '../data/facilitiesData';

export default function OwnerDashboard({
  facilities,
  onSaveFacility,
  onToggleFacilityStatus,
  bookings,
  onUpdateBookingStatus,
  customSlotOverrides,
  onUpdateSlotOverride,
  onShowToast
}) {
  const [activeTab, setActiveTab] = useState('facilities'); // 'facilities' | 'add_facility' | 'slots' | 'reservations' | 'reviews'
  const [editingFacility, setEditingFacility] = useState(null);

  // Filters for Reservations tab
  const [reservationStatusFilter, setReservationStatusFilter] = useState('All');
  const [reservationDateFilter, setReservationDateFilter] = useState('');

  // Manage Slots state
  const [slotFacilityId, setSlotFacilityId] = useState(facilities[0]?.id || 'fac-1');
  const selectedFacility = facilities.find((f) => f.id === slotFacilityId) || facilities[0];
  const [slotGroundId, setSlotGroundId] = useState(selectedFacility?.grounds[0]?.id || 'g1-1');
  const [slotDate, setSlotDate] = useState(getRelativeDateStr(0));
  const [bulkPrice, setBulkPrice] = useState(1200);

  // Form State for Add/Edit Facility
  const [facilityForm, setFacilityForm] = useState({
    name: '',
    sport: 'Football',
    type: 'Turf Arena',
    area: 'Koramangala',
    address: '',
    description: '',
    openTime: '06:00',
    closeTime: '23:00',
    surface: 'FIFA 2-Star AstroTurf',
    capacity: '16 players',
    indoor: false,
    amenities: ['Floodlights', 'Changing Rooms', 'Parking'],
    groundsCount: 2,
    offPeakPrice: 1000,
    peakPrice: 1200,
    cancellationPolicy: 'Free cancellation up to 4 hours before match.'
  });

  const [formErrors, setFormErrors] = useState({});

  // Review reply state
  const [replies, setReplies] = useState({});

  // Stat metrics (labelled demo figures)
  const totalFacilities = facilities.length;
  const bookingsToday = bookings.filter((b) => b.date === getRelativeDateStr(0)).length;
  const upcomingBookings = bookings.filter((b) => b.status === 'Confirmed' || b.status === 'Pending').length;
  const estimatedRevenue = bookings
    .filter((b) => b.status === 'Confirmed' || b.status === 'Completed')
    .reduce((sum, b) => sum + b.amount, 0);

  // Form handling
  const handleStartAdd = () => {
    setEditingFacility(null);
    setFacilityForm({
      name: '',
      sport: 'Football',
      type: 'Turf Arena',
      area: 'Koramangala',
      address: '',
      description: '',
      openTime: '06:00',
      closeTime: '23:00',
      surface: 'FIFA 2-Star AstroTurf',
      capacity: '16 players',
      indoor: false,
      amenities: ['Floodlights', 'Changing Rooms', 'Parking'],
      groundsCount: 2,
      offPeakPrice: 1000,
      peakPrice: 1200,
      cancellationPolicy: 'Free cancellation up to 4 hours before match.'
    });
    setFormErrors({});
    setActiveTab('add_facility');
  };

  const handleStartEdit = (fac) => {
    setEditingFacility(fac);
    setFacilityForm({
      name: fac.name,
      sport: fac.sport,
      type: fac.type,
      area: fac.area,
      address: fac.address,
      description: fac.description,
      openTime: fac.openTime,
      closeTime: fac.closeTime,
      surface: fac.surface,
      capacity: fac.capacity,
      indoor: fac.indoor,
      amenities: [...fac.amenities],
      groundsCount: fac.grounds.length,
      offPeakPrice: fac.pricing.offPeak,
      peakPrice: fac.pricing.peak,
      cancellationPolicy: fac.cancellationPolicy
    });
    setFormErrors({});
    setActiveTab('add_facility');
  };

  const validateForm = () => {
    const errs = {};
    if (!facilityForm.name.trim()) errs.name = 'Facility name is required';
    if (!facilityForm.address.trim()) errs.address = 'Full address is required';
    if (!facilityForm.description.trim() || facilityForm.description.length < 10) {
      errs.description = 'Description must be at least 10 characters';
    }
    if (facilityForm.offPeakPrice <= 0) errs.offPeakPrice = 'Valid tariff required';
    if (facilityForm.peakPrice < facilityForm.offPeakPrice) {
      errs.peakPrice = 'Peak price should be greater than or equal to off-peak price';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const groundsArray = [];
    for (let i = 1; i <= facilityForm.groundsCount; i++) {
      groundsArray.push({
        id: `g-${editingFacility ? editingFacility.id : 'new'}-${i}`,
        name: `Ground / Court ${i}`
      });
    }

    const updatedFacility = {
      id: editingFacility ? editingFacility.id : `fac-${Date.now()}`,
      name: facilityForm.name,
      sport: facilityForm.sport,
      type: facilityForm.type,
      area: facilityForm.area,
      city: 'Bengaluru',
      lat: editingFacility ? editingFacility.lat : 12.9352,
      lng: editingFacility ? editingFacility.lng : 77.6245,
      address: facilityForm.address,
      description: facilityForm.description,
      surface: facilityForm.surface,
      indoor: facilityForm.indoor,
      capacity: facilityForm.capacity,
      openTime: facilityForm.openTime,
      closeTime: facilityForm.closeTime,
      grounds: groundsArray,
      amenities: facilityForm.amenities,
      pricing: {
        offPeak: Number(facilityForm.offPeakPrice),
        peak: Number(facilityForm.peakPrice),
        peakHours: ['18:00', '19:00', '20:00', '21:00'],
        taxPercent: 18,
        platformFee: 40
      },
      cancellationPolicy: facilityForm.cancellationPolicy,
      rating: editingFacility ? editingFacility.rating : 5.0,
      reviewCount: editingFacility ? editingFacility.reviewCount : 0,
      reviews: editingFacility ? editingFacility.reviews : [],
      // HONESTY RULE: A new listing shows as Unverified and Pending review. Never auto-verify.
      verified: editingFacility ? editingFacility.verified : false,
      status: editingFacility ? editingFacility.status : 'Pending review',
      ownerId: 'own-1',
      isSample: true
    };

    onSaveFacility(updatedFacility);
    onShowToast({
      title: editingFacility ? 'Facility Updated' : 'Facility Submitted',
      message: editingFacility
        ? `"${updatedFacility.name}" changes saved to inventory.`
        : `"${updatedFacility.name}" created as Unverified & Pending Review.`,
      type: 'success',
      isDemo: true
    });
    setActiveTab('facilities');
  };

  // Manage slots bulk action
  const handleSetSlotStatus = (startStr, newStatus) => {
    // Check if slot has a confirmed booking!
    const slotKey = `${slotFacilityId}_${slotGroundId}_${slotDate}_${startStr}`;
    const startHour = parseInt(startStr.split(':')[0], 10);

    const hasConfirmedBooking = bookings.some((b) => {
      if (b.facilityId !== slotFacilityId || b.groundId !== slotGroundId || b.date !== slotDate) return false;
      if (b.status !== 'Confirmed') return false;
      const bStart = parseInt(b.startTime.split(':')[0], 10);
      const bEnd = bStart + (b.durationHours || 1);
      return startHour >= bStart && startHour < bEnd;
    });

    if (hasConfirmedBooking && newStatus === 'Block') {
      onShowToast({
        title: 'Action Prohibited',
        message: 'Cannot block slot with a confirmed booking. Please coordinate cancellation with the player first.',
        type: 'error',
        isDemo: true
      });
      return;
    }

    onUpdateSlotOverride(slotKey, { status: newStatus });
    onShowToast({
      title: 'Slot State Updated',
      message: `${startStr} marked as ${newStatus} for selected ground.`,
      type: 'info',
      isDemo: true
    });
  };

  const handleBulkApplyPrice = () => {
    selectedFacility.grounds.forEach((g) => {
      const openHour = parseInt(selectedFacility.openTime.split(':')[0], 10);
      const closeHour = parseInt(selectedFacility.closeTime.split(':')[0], 10);
      for (let h = openHour; h < closeHour; h++) {
        const timeStr = `${h.toString().padStart(2, '0')}:00`;
        const key = `${selectedFacility.id}_${slotGroundId}_${slotDate}_${timeStr}`;
        onUpdateSlotOverride(key, { price: Number(bulkPrice) });
      }
    });

    onShowToast({
      title: 'Bulk Pricing Applied',
      message: `Updated all slots on ${slotDate} to ₹${bulkPrice}/hr.`,
      type: 'success',
      isDemo: true
    });
  };

  // Filtered reservations
  const filteredReservations = bookings.filter((b) => {
    if (reservationStatusFilter !== 'All' && b.status !== reservationStatusFilter) return false;
    if (reservationDateFilter && b.date !== reservationDateFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header & Quick Stat Cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Facility Owner Suite
              </span>
              <span className="text-[10px] text-[#94A3B8] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Demo figures
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-[#F5F7FA] font-['Barlow_Condensed']">
              Manage Your Grounds.
            </h2>
          </div>

          <Button variant="crimson" size="md" onClick={handleStartAdd} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            <span>List a New Facility</span>
          </Button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#141B24] border border-[#293442] rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-[#94A3B8] mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Total Facilities</span>
              <Building2 className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#F5F7FA] font-['Barlow_Condensed']">
              {totalFacilities}
            </div>
            <span className="text-[11px] text-[#94A3B8]">Active listings</span>
          </div>

          <div className="bg-[#141B24] border border-[#293442] rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-[#94A3B8] mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Bookings Today</span>
              <Clock className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-300 font-['Barlow_Condensed']">
              {bookingsToday}
            </div>
            <span className="text-[11px] text-[#94A3B8]">Scheduled matches</span>
          </div>

          <div className="bg-[#141B24] border border-[#293442] rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-[#94A3B8] mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Upcoming Bookings</span>
              <Calendar className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#F5F7FA] font-['Barlow_Condensed']">
              {upcomingBookings}
            </div>
            <span className="text-[11px] text-[#94A3B8]">Pending & confirmed</span>
          </div>

          <div className="bg-[#141B24] border border-[#293442] rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-[#94A3B8] mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Est. Revenue</span>
              <DollarSign className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#22C55E] font-['Barlow_Condensed']">
              ₹{estimatedRevenue.toLocaleString()}
            </div>
            <span className="text-[11px] text-[#94A3B8]">Demo estimate</span>
          </div>
        </div>
      </div>

      {/* 2. Owner Navigation Tabs */}
      <div className="border-b border-[#293442] flex overflow-x-auto gap-2">
        {[
          { id: 'facilities', label: 'My Facilities' },
          { id: 'add_facility', label: editingFacility ? 'Edit Facility' : 'Add Facility' },
          { id: 'slots', label: 'Manage Slots' },
          { id: 'reservations', label: `Reservations (${bookings.length})` },
          { id: 'reviews', label: 'Reviews & Feedback' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-[#94A3B8] hover:text-[#F5F7FA]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. TAB 1: My Facilities Table */}
      {activeTab === 'facilities' && (
        <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-['Barlow_Condensed'] text-2xl font-black uppercase text-[#F5F7FA]">
              Managed Grounds &amp; Facilities
            </h3>
            <span className="text-xs text-[#94A3B8]">
              {facilities.length} listings in memory
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#F5F7FA]">
              <thead className="bg-[#0B0F14] text-[11px] uppercase tracking-wider text-[#94A3B8] border-b border-[#293442]">
                <tr>
                  <th className="py-3 px-4">Facility Name</th>
                  <th className="py-3 px-4">Sport</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Pitches</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#293442]/60 font-medium">
                {facilities.map((fac) => (
                  <tr key={fac.id} className="hover:bg-[#1B2530]/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div>{fac.name}</div>
                      <div className="text-[11px] font-normal text-[#94A3B8]">{fac.area}</div>
                    </td>
                    <td className="py-3.5 px-4">{fac.sport}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          fac.status === 'Live'
                            ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30'
                            : fac.status === 'Paused'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {fac.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#94A3B8]">{fac.grounds.length} grounds</td>
                    <td className="py-3.5 px-4">
                      {fac.verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#22C55E]">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#94A3B8]">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(fac)}
                        className="px-2.5 py-1 text-xs rounded bg-[#0B0F14] border border-[#293442] text-slate-300 hover:text-white hover:border-rose-400"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleFacilityStatus(fac.id)}
                        className="px-2.5 py-1 text-xs rounded bg-[#0B0F14] border border-[#293442] text-slate-300 hover:text-white"
                      >
                        {fac.status === 'Live' ? 'Pause' : 'Resume'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSlotFacilityId(fac.id);
                          setSlotGroundId(fac.grounds[0]?.id || 'g1-1');
                          setActiveTab('slots');
                        }}
                        className="px-2.5 py-1 text-xs rounded bg-rose-500/15 border border-rose-500/30 text-rose-200 hover:bg-rose-500/25"
                      >
                        Slots
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB 2: Add or Edit Facility Form */}
      {activeTab === 'add_facility' && (
        <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 sm:p-8 shadow-xl max-w-3xl">
          <div className="mb-6 pb-4 border-b border-[#293442]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
              Inventory Configuration
            </span>
            <h3 className="font-['Barlow_Condensed'] text-2xl font-black uppercase text-[#F5F7FA] mt-1">
              {editingFacility ? `Edit Facility: ${editingFacility.name}` : 'List a New Sports Facility'}
            </h3>
            <p className="text-xs text-[#94A3B8] mt-1">
              New submissions are registered as Unverified and marked Pending Review.
            </p>
          </div>

          <form onSubmit={handleSaveForm} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-1.5">
                  Facility Name *
                </label>
                <input
                  type="text"
                  value={facilityForm.name}
                  onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })}
                  placeholder="e.g. Koramangala Champions Arena"
                  className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500"
                />
                {formErrors.name && (
                  <p className="text-rose-400 text-[11px] mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-1.5">
                  Sport
                </label>
                <select
                  value={facilityForm.sport}
                  onChange={(e) => setFacilityForm({ ...facilityForm, sport: e.target.value })}
                  className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl px-3.5 py-2.5"
                >
                  {['Football', 'Cricket', 'Badminton', 'Basketball', 'Tennis', 'Volleyball', 'Swimming'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-1.5">
                  Area / Locality
                </label>
                <input
                  type="text"
                  value={facilityForm.area}
                  onChange={(e) => setFacilityForm({ ...facilityForm, area: e.target.value })}
                  placeholder="e.g. Koramangala, Bengaluru"
                  className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl px-3.5 py-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-1.5">
                  Number of Pitches / Courts
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={facilityForm.groundsCount}
                  onChange={(e) => setFacilityForm({ ...facilityForm, groundsCount: Number(e.target.value) })}
                  className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl px-3.5 py-2.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-1.5">
                Full Physical Address *
              </label>
              <input
                type="text"
                value={facilityForm.address}
                onChange={(e) => setFacilityForm({ ...facilityForm, address: e.target.value })}
                placeholder="Door, Street, Landmark, Pin code"
                className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl px-3.5 py-2.5"
              />
              {formErrors.address && (
                <p className="text-rose-400 text-[11px] mt-1">{formErrors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-1.5">
                Description *
              </label>
              <textarea
                rows="3"
                value={facilityForm.description}
                onChange={(e) => setFacilityForm({ ...facilityForm, description: e.target.value })}
                placeholder="Details on surface quality, lighting, and squad capacity..."
                className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl p-3"
              />
              {formErrors.description && (
                <p className="text-rose-400 text-[11px] mt-1">{formErrors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-1.5">
                  Off-Peak Price (₹/hr) *
                </label>
                <input
                  type="number"
                  value={facilityForm.offPeakPrice}
                  onChange={(e) => setFacilityForm({ ...facilityForm, offPeakPrice: e.target.value })}
                  className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl px-3.5 py-2.5"
                />
                {formErrors.offPeakPrice && (
                  <p className="text-rose-400 text-[11px] mt-1">{formErrors.offPeakPrice}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-1.5">
                  Peak Price (₹/hr) *
                </label>
                <input
                  type="number"
                  value={facilityForm.peakPrice}
                  onChange={(e) => setFacilityForm({ ...facilityForm, peakPrice: e.target.value })}
                  className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl px-3.5 py-2.5"
                />
                {formErrors.peakPrice && (
                  <p className="text-rose-400 text-[11px] mt-1">{formErrors.peakPrice}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-1.5">
                Cancellation Policy Text
              </label>
              <input
                type="text"
                value={facilityForm.cancellationPolicy}
                onChange={(e) => setFacilityForm({ ...facilityForm, cancellationPolicy: e.target.value })}
                className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl px-3.5 py-2.5"
              />
            </div>

            <div className="pt-4 border-t border-[#293442] flex gap-3">
              <Button type="submit" variant="crimson" size="md">
                {editingFacility ? 'Save Changes' : 'Submit Facility (Unverified)'}
              </Button>
              <Button type="button" variant="secondary" size="md" onClick={() => setActiveTab('facilities')}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 5. TAB 3: Manage Slots */}
      {activeTab === 'slots' && (
        <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#293442]">
            <div>
              <h3 className="font-['Barlow_Condensed'] text-2xl font-black uppercase text-[#F5F7FA]">
                Manage Schedule &amp; Bulk Rates
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Open, block for maintenance, or close slots. Blocking slots with active bookings will be refused.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#94A3B8]">Facility:</span>
              <select
                value={slotFacilityId}
                onChange={(e) => {
                  setSlotFacilityId(e.target.value);
                  const f = facilities.find((fac) => fac.id === e.target.value);
                  if (f && f.grounds.length > 0) setSlotGroundId(f.grounds[0].id);
                }}
                className="bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-lg px-2.5 py-1.5"
              >
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>{fac.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sub-controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Select Ground</label>
              <select
                value={slotGroundId}
                onChange={(e) => setSlotGroundId(e.target.value)}
                className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl px-3 py-2"
              >
                {selectedFacility.grounds.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Target Date</label>
              <input
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl px-3 py-2 [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Bulk Apply Rate (₹/hr)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl px-3 py-2"
                />
                <Button variant="outline" size="sm" onClick={handleBulkApplyPrice}>
                  Apply
                </Button>
              </div>
            </div>
          </div>

          {/* Slots Table with Owner Quick Controls */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#F5F7FA]">
              <thead className="bg-[#0B0F14] text-[11px] uppercase tracking-wider text-[#94A3B8] border-b border-[#293442]">
                <tr>
                  <th className="py-2.5 px-4">Hour Window</th>
                  <th className="py-2.5 px-4">Current Price</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#293442]/60">
                {Array.from({ length: 15 }, (_, i) => {
                  const hour = 7 + i;
                  if (hour > 22) return null;
                  const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                  const key = `${slotFacilityId}_${slotGroundId}_${slotDate}_${timeStr}`;
                  const override = customSlotOverrides[key] || {};
                  const currentPrice = override.price || selectedFacility.pricing.offPeak;

                  return (
                    <tr key={timeStr} className="hover:bg-[#1B2530]/40">
                      <td className="py-3 px-4 font-semibold text-white">
                        {timeStr} - {(hour + 1).toString().padStart(2, '0')}:00
                      </td>
                      <td className="py-3 px-4 text-rose-200 font-bold">
                        ₹{currentPrice}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleSetSlotStatus(timeStr, 'Open')}
                          className="px-2 py-1 text-[11px] rounded bg-[#0B0F14] border border-[#293442] text-emerald-400 hover:border-emerald-400"
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetSlotStatus(timeStr, 'Block')}
                          className="px-2 py-1 text-[11px] rounded bg-[#0B0F14] border border-[#293442] text-amber-400 hover:border-amber-400"
                        >
                          Block (Maint.)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetSlotStatus(timeStr, 'Close')}
                          className="px-2 py-1 text-[11px] rounded bg-[#0B0F14] border border-[#293442] text-rose-400 hover:border-rose-400"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB 4: Reservations */}
      {activeTab === 'reservations' && (
        <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#293442]">
            <h3 className="font-['Barlow_Condensed'] text-2xl font-black uppercase text-[#F5F7FA]">
              Customer Bookings &amp; Schedules
            </h3>

            {/* Filter by status */}
            <div className="flex gap-2">
              {['All', 'Confirmed', 'Pending', 'Cancelled', 'Completed'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setReservationStatusFilter(st)}
                  className={`px-3 py-1 text-xs rounded-lg font-semibold transition-colors border ${
                    reservationStatusFilter === st
                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white border-rose-500 font-bold shadow-md shadow-red-950/40'
                      : 'bg-[#0B0F14] text-[#94A3B8] border-[#293442]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#F5F7FA]">
              <thead className="bg-[#0B0F14] text-[11px] uppercase tracking-wider text-[#94A3B8] border-b border-[#293442]">
                <tr>
                  <th className="py-3 px-4">Ref</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Facility &amp; Ground</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Valid Transitions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#293442]/60 font-medium">
                {filteredReservations.map((b) => (
                  <tr key={b.id} className="hover:bg-[#1B2530]/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-300">{b.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-bold">{b.playerName}</div>
                      <div className="text-[11px] text-[#94A3B8]">{b.playerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{b.facilityName}</div>
                      <div className="text-[11px] text-[#94A3B8]">{b.groundName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{b.date}</div>
                      <div className="text-[11px] text-rose-300">{b.startTime} ({b.durationHours}h)</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">₹{b.amount}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {/* Transition rules: Pending -> Confirmed or Declined */}
                      {b.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onUpdateBookingStatus(b.id, 'Confirmed')}
                            className="px-2.5 py-1 text-xs rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateBookingStatus(b.id, 'Cancelled')}
                            className="px-2.5 py-1 text-xs rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {/* Transition rules: Confirmed -> Cancelled or Completed */}
                      {b.status === 'Confirmed' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onUpdateBookingStatus(b.id, 'Completed')}
                            className="px-2.5 py-1 text-xs rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 hover:bg-sky-500/20"
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateBookingStatus(b.id, 'Cancelled')}
                            className="px-2.5 py-1 text-xs rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {(b.status === 'Cancelled' || b.status === 'Completed') && (
                        <span className="text-[11px] text-[#94A3B8] italic">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. TAB 5: Reviews */}
      {activeTab === 'reviews' && (
        <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="pb-3 border-b border-[#293442]">
            <h3 className="font-['Barlow_Condensed'] text-2xl font-black uppercase text-[#F5F7FA]">
              Customer Reviews &amp; Category Scores
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Read-only player reviews with an owner response simulation box.
            </p>
          </div>

          <div className="space-y-4">
            {facilities
              .flatMap((f) => f.reviews.map((r) => ({ ...r, facilityName: f.name })))
              .map((rev) => (
                <div key={rev.id} className="bg-[#0B0F14] border border-[#293442] rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{rev.user}</span>
                        {rev.verifiedBooking && (
                          <span className="text-[10px] text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/30 px-2 py-0.5 rounded-full font-bold">
                            Verified Booking
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#94A3B8]">{rev.facilityName} &bull; {rev.date}</span>
                    </div>

                    <div className="text-amber-400 font-bold text-sm">
                      {rev.rating} / 5
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    &quot;{rev.comment}&quot;
                  </p>

                  {/* Reply Box */}
                  <div className="pt-2 border-t border-[#293442] flex gap-2">
                    <input
                      type="text"
                      placeholder="Write an official owner reply (sample)..."
                      value={replies[rev.id] || ''}
                      onChange={(e) => setReplies({ ...replies, [rev.id]: e.target.value })}
                      className="flex-1 bg-[#141B24] border border-[#293442] rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (replies[rev.id]) {
                          onShowToast({
                            title: 'Reply Submitted (Demo)',
                            message: `Owner response posted to ${rev.user}'s review.`,
                            type: 'success',
                            isDemo: true
                          });
                          setReplies({ ...replies, [rev.id]: '' });
                        }
                      }}
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
