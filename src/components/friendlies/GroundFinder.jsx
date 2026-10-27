import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, Calendar, Clock, DollarSign, ExternalLink, Check, X, Building2 } from 'lucide-react';
import { INITIAL_FACILITIES, haversineDistance, getNextAvailableSlot } from '../../data/facilitiesData';

export default function GroundFinder({
  isOpen,
  onClose,
  sport = 'Football',
  dateStr = '',
  userCoords = null,
  onSelectGround
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState(sport);

  if (!isOpen) return null;

  // Verify Facilities presence
  const hasFacilities = Array.isArray(INITIAL_FACILITIES) && INITIAL_FACILITIES.length > 0;

  if (!hasFacilities) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-[#151B23] border border-[#293442] w-full max-w-md rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white">Find a Ground</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-xs text-amber-400">Ground search needs the Facilities section. Please enter your venue manually.</p>
        </div>
      </div>
    );
  }

  // Filter facilities by sport & query, take up to 5
  const matchingFacilities = INITIAL_FACILITIES.filter((f) => {
    if (selectedSport && selectedSport !== 'all' && f.sport.toLowerCase() !== selectedSport.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inName = f.name.toLowerCase().includes(q);
      const inArea = f.area.toLowerCase().includes(q);
      const inCity = f.city.toLowerCase().includes(q);
      if (!inName && !inArea && !inCity) return false;
    }
    return true;
  }).slice(0, 5);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ground-finder-title"
    >
      <div className="bg-[#151B23] border border-[#293442] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#293442] bg-[#0B0F14] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#B6FF3B]/10 text-[#B6FF3B]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="ground-finder-title" className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white tracking-wide">
                Find a Verified Sports Ground
              </h3>
              <p className="text-xs text-[#9CA3AF]">
                Select a certified venue from SportLink Facilities to prefill venue details.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="p-4 bg-[#1B2530] border-b border-[#293442] flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by facility name, area, or turf type..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#0B0F14] border border-[#293442] rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-[#B6FF3B]"
            />
          </div>

          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-[#0B0F14] border border-[#293442] rounded-xl text-xs text-white outline-none cursor-pointer focus:border-[#B6FF3B]"
          >
            <option value="Football">Football</option>
            <option value="Cricket">Cricket</option>
            <option value="Badminton">Badminton</option>
            <option value="Basketball">Basketball</option>
            <option value="Volleyball">Volleyball</option>
            <option value="Tennis">Tennis</option>
          </select>
        </div>

        {/* List of facilities */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          {matchingFacilities.length === 0 ? (
            <div className="py-12 text-center text-[#9CA3AF] text-xs">
              No matching sports facilities found. Try changing the sport or search terms.
            </div>
          ) : (
            matchingFacilities.map((fac) => {
              const distanceKm = userCoords && fac.lat && fac.lng
                ? haversineDistance(userCoords.lat, userCoords.lng, fac.lat, fac.lng)
                : null;

              const nextSlot = getNextAvailableSlot(fac, dateStr || new Date().toISOString().slice(0, 10));

              return (
                <div
                  key={fac.id}
                  className="p-4 bg-[#1B2530]/70 border border-[#293442] hover:border-[#B6FF3B]/50 rounded-2xl transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{fac.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-[#00D9FF] border border-[#00D9FF]/30">
                          {fac.sport}
                        </span>
                        {fac.verified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Verified Venue
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#9CA3AF] mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{fac.area}, {fac.city}</span>
                        </span>
                        {distanceKm !== null && (
                          <span className="text-[11px] text-slate-400">
                            ~{distanceKm} km away
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="font-['Barlow_Condensed'] text-lg font-bold text-[#B6FF3B]">
                        ₹{fac.pricing?.offPeak || fac.pricing?.peak}/hr
                      </div>
                      <span className="text-[10px] text-slate-400 block">Est. rate</span>
                    </div>
                  </div>

                  {/* Slot availability & Action buttons */}
                  <div className="pt-2 border-t border-[#293442] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-[#00D9FF]" />
                      <span>Next Slot: <strong className="text-white">{nextSlot}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/facilities/${fac.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-slate-300 hover:text-white bg-[#0B0F14] border border-[#293442] rounded-xl flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <span>View Facility</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectGround({
                            name: fac.name,
                            address: fac.address,
                            facilityId: fac.id,
                            lat: fac.lat,
                            lng: fac.lng
                          });
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-[#B6FF3B] text-[#0B0F14] hover:bg-[#a3ee28] font-bold rounded-xl flex items-center gap-1 text-[11px] cursor-pointer shadow-sm"
                      >
                        <Check className="w-3 h-3" />
                        <span>Select Venue</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-[#0B0F14] border-t border-[#293442] text-center text-[11px] text-[#9CA3AF] italic">
          Selecting a facility fills the venue field. Venue booking is never automatic and takes place inside the Facilities booking flow.
        </div>
      </div>
    </div>
  );
}
