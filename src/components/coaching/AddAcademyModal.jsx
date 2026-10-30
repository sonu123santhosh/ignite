import React, { useState } from 'react';
import { X, Building, Plus, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';

export default function AddAcademyModal({ onClose }) {
  const { addAcademy, activeUser } = useCoaching();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSports, setSelectedSports] = useState(['Cricket']);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Pune');
  const [locality, setLocality] = useState('');
  const [monthlyFeeMin, setMonthlyFeeMin] = useState('3500');
  const [monthlyFeeMax, setMonthlyFeeMax] = useState('6000');
  const [perSessionFee, setPerSessionFee] = useState('400');
  const [facilityType, setFacilityType] = useState('Indoor & Outdoor');
  const [trialClassAvailable, setTrialClassAvailable] = useState(true);
  const [trialFee, setTrialFee] = useState('0');
  const [phone, setPhone] = useState(activeUser?.phone || '+91 98221 00000');
  const [email, setEmail] = useState(activeUser?.email || 'academy@sportlink.demo');
  const [womenCoaches, setWomenCoaches] = useState(false);
  const [accessible, setAccessible] = useState(true);
  const [cancellationPolicy, setCancellationPolicy] = useState('48 hours notice prior to batch start.');

  const sportsOptions = ['Cricket', 'Football', 'Badminton', 'Basketball', 'Tennis', 'Swimming', 'Volleyball', 'Athletics'];

  const toggleSport = (sport) => {
    setSelectedSports((prev) =>
      prev.includes(sport)
        ? prev.length > 1 ? prev.filter((s) => s !== sport) : prev
        : [...prev, sport]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !locality.trim() || !address.trim()) return;

    addAcademy({
      name,
      tagline,
      description,
      sports: selectedSports,
      address,
      city,
      locality,
      monthlyFeeMin: Number(monthlyFeeMin),
      monthlyFeeMax: Number(monthlyFeeMax),
      perSessionFee: Number(perSessionFee),
      facilityType,
      trialClassAvailable,
      trialFee: Number(trialFee),
      phone,
      email,
      womenCoaches,
      accessible,
      cancellationPolicy
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0c0d15]/95 border border-red-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-red-500/20 flex items-center justify-between bg-red-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">List New Coaching Centre</h2>
              <p className="text-xs text-gray-400">Expand your academy footprint across the SportLink athlete network</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-red-950/40 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Notice: Verification Policy */}
          <div className="bg-[#08050c] border border-red-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-gray-300">
            <ShieldCheck className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p>
              New listings are created under <strong>Pending Verification</strong> status. You can immediately configure coaches and batches; the academy will receive a <strong>Verified</strong> badge upon physical facility inspection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-gray-300">Academy / Centre Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Sports Academy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#08050c] border border-red-500/20 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-300">Catchy Tagline</label>
              <input
                type="text"
                placeholder="e.g. Junior High-Performance Cricket Hub"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#08050c] border border-red-500/20 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Sports Selector Pills */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-300">Sports Offered (Select all that apply) *</label>
            <div className="flex flex-wrap gap-2">
              {sportsOptions.map((sport) => {
                const isSelected = selectedSports.includes(sport);
                return (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => toggleSport(sport)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm'
                        : 'bg-[#08050c] text-gray-400 border border-red-500/20 hover:text-white'
                    }`}
                  >
                    {sport}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-300">Academy Description</label>
            <textarea
              rows={3}
              placeholder="Describe your coaching philosophy, infrastructure, floodlights, turf wickets or court specifications..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#08050c] border border-red-500/20 rounded-xl p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Address & City */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-gray-300">Facility Street Address *</label>
              <input
                type="text"
                required
                placeholder="Plot / Survey number, street, near landmark"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#08050c] border border-red-500/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-300">Locality *</label>
              <input
                type="text"
                required
                placeholder="e.g. Kothrud / Baner"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full bg-[#08050c] border border-red-500/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Fee Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-gray-300">Min Monthly Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={monthlyFeeMin}
                onChange={(e) => setMonthlyFeeMin(e.target.value)}
                className="w-full bg-[#08050c] border border-red-500/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-300">Max Monthly Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={monthlyFeeMax}
                onChange={(e) => setMonthlyFeeMax(e.target.value)}
                className="w-full bg-[#08050c] border border-red-500/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-300">Per Session Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={perSessionFee}
                onChange={(e) => setPerSessionFee(e.target.value)}
                className="w-full bg-[#08050c] border border-red-500/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Trial & Facility Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-gray-300">Facility Type</label>
              <select
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value)}
                className="w-full bg-[#08050c] border border-red-500/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
              >
                <option value="Indoor & Outdoor">Indoor & Outdoor</option>
                <option value="Indoor">Indoor Only</option>
                <option value="Outdoor Turf">Outdoor Turf / Ground</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-300">Trial Class Offering</label>
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                  <input
                    type="checkbox"
                    checked={trialClassAvailable}
                    onChange={(e) => setTrialClassAvailable(e.target.checked)}
                    className="w-4 h-4 rounded accent-red-500 cursor-pointer"
                  />
                  <span>Offer Trial Sessions</span>
                </label>
                {trialClassAvailable && (
                  <input
                    type="number"
                    min="0"
                    placeholder="Fee (0 = Free)"
                    value={trialFee}
                    onChange={(e) => setTrialFee(e.target.value)}
                    className="w-24 bg-[#08050c] border border-red-500/20 rounded-lg p-1 text-center text-white focus:outline-none focus:border-red-500"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Features Checkbox */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-red-500/20">
            <label className="flex items-center gap-2 cursor-pointer text-gray-300">
              <input
                type="checkbox"
                checked={womenCoaches}
                onChange={(e) => setWomenCoaches(e.target.checked)}
                className="w-4 h-4 rounded accent-red-500 cursor-pointer"
              />
              <span>Women Coaches on Staff</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-gray-300">
              <input
                type="checkbox"
                checked={accessible}
                onChange={(e) => setAccessible(e.target.checked)}
                className="w-4 h-4 rounded accent-red-500 cursor-pointer"
              />
              <span>Wheelchair Accessible Infrastructure</span>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-red-500/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#140e18] text-gray-300 border border-red-500/20 hover:text-white font-semibold cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-extrabold hover:shadow-[0_4px_18px_rgba(220,38,38,0.5)] border border-red-500/40 transition-all cursor-pointer"
            >
              Publish Centre Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
