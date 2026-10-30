import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Edit,
  Calendar,
  Tag,
  PauseCircle,
  PlayCircle,
  ShieldCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useFacilities } from '../../context/FacilitiesContext.jsx';
import Button from '../../components/Button.jsx';
import { formatINR } from '../../components/facility/facilityAdapter.js';

export default function OwnerFacilities() {
  const { facilities, session, toggleFacilityStatus } = useFacilities();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Confirmation modal state for Pause / Resume
  const [confirmDialog, setConfirmDialog] = useState(null); // { facility, targetStatus }

  // Filter facilities strictly owned by session user
  const myFacilities = useMemo(() => {
    return facilities.filter((f) => f.ownerId === session.user.id);
  }, [facilities, session.user.id]);

  const filtered = useMemo(() => {
    let list = [...myFacilities];
    if (sportFilter !== 'All') {
      list = list.filter((f) => f.sport.toLowerCase() === sportFilter.toLowerCase());
    }
    if (statusFilter !== 'All') {
      list = list.filter((f) => (f.status || 'Live').toLowerCase() === statusFilter.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (f) => f.name.toLowerCase().includes(q) || f.area.toLowerCase().includes(q)
      );
    }
    return list;
  }, [myFacilities, sportFilter, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedFacilities = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handleExecuteStatusToggle = async () => {
    if (!confirmDialog) return;
    try {
      await toggleFacilityStatus(confirmDialog.facility.id, confirmDialog.targetStatus);
      setConfirmDialog(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const sportsList = useMemo(() => {
    const set = new Set(myFacilities.map((f) => f.sport));
    return ['All', ...Array.from(set)];
  }, [myFacilities]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E5C378]">
            Venue Management
          </span>
          <h1 className="font-['Barlow_Condensed'] text-3xl sm:text-4xl font-black uppercase text-[#F5F7FA] tracking-wide mt-1">
            My Sports Facilities
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Manage court inventory, listing status, pricing, and operating parameters.
          </p>
        </div>

        <Link to="/owner/add-facility">
          <Button variant="gold" size="md" className="gap-2">
            <PlusCircle className="w-4 h-4" />
            <span>Add New Facility</span>
          </Button>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search venue name or locality..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#0B0F14] border border-[#293442] text-xs text-[#F5F7FA] pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sport Filter */}
          <select
            value={sportFilter}
            onChange={(e) => {
              setSportFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0B0F14] border border-[#293442] text-xs font-bold text-[#F5F7FA] px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
          >
            {sportsList.map((s) => (
              <option key={s} value={s}>
                Sport: {s}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0B0F14] border border-[#293442] text-xs font-bold text-[#F5F7FA] px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="Live">Live</option>
            <option value="Paused">Paused</option>
            <option value="Pending review">Pending review</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Facilities Table (Desktop) / Cards (Mobile) */}
      <div className="bg-[#141B24] border border-[#293442] rounded-2xl shadow-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <Building2 className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No facilities match your search</h3>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
              Try adjusting your sport or status filters, or clear your query to view all venues.
            </p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-[#F5F7FA]">
                <thead className="bg-[#0B0F14] text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider border-b border-[#293442]">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">Venue Name</th>
                    <th scope="col" className="py-3.5 px-4">Sport &amp; Pitches</th>
                    <th scope="col" className="py-3.5 px-4">Location</th>
                    <th scope="col" className="py-3.5 px-4">Standard Rate</th>
                    <th scope="col" className="py-3.5 px-4">Listing Status</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#293442]/50">
                  {paginatedFacilities.map((fac) => {
                    const rate = fac.pricing?.offPeak ?? fac.pricing?.standardHourlyRate;
                    const isLive = fac.status === 'Live';

                    return (
                      <tr key={fac.id} className="hover:bg-[#0B0F14]/50 transition-colors">
                        <td className="py-4 px-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span>{fac.name}</span>
                            {fac.verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" title="Verified Facility" />
                            )}
                          </div>
                          <span className="text-[10px] text-[#94A3B8] block font-mono">ID: {fac.id}</span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-semibold text-[#E5C378]">{fac.sport}</div>
                          <div className="text-[10px] text-[#94A3B8]">{fac.grounds?.length || 1} pitches / courts</div>
                        </td>

                        <td className="py-4 px-4">
                          <div>{fac.area}</div>
                          <div className="text-[10px] text-[#94A3B8] truncate max-w-[150px]">{fac.city}</div>
                        </td>

                        <td className="py-4 px-4 font-bold text-white">
                          {rate ? formatINR(rate) : 'Not set'}
                          <span className="text-[10px] text-[#94A3B8] font-normal block">/ hour</span>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              fac.status === 'Live'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : fac.status === 'Paused'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {fac.status || 'Live'}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Public View */}
                            <Link
                              to={`/facilities/${fac.id}`}
                              className="p-1.5 rounded-lg bg-[#0B0F14] border border-[#293442] text-[#94A3B8] hover:text-[#E5C378] hover:border-[#D4AF37]"
                              title="View Public Page"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            {/* Edit */}
                            <Link
                              to={`/owner/facilities/${fac.id}/edit`}
                              className="p-1.5 rounded-lg bg-[#0B0F14] border border-[#293442] text-[#94A3B8] hover:text-white hover:border-slate-500"
                              title="Edit Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>

                            {/* Slots */}
                            <Link
                              to={`/owner/slots?facilityId=${fac.id}`}
                              className="p-1.5 rounded-lg bg-[#0B0F14] border border-[#293442] text-[#94A3B8] hover:text-emerald-400 hover:border-emerald-500"
                              title="Manage Availability"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </Link>

                            {/* Pricing */}
                            <Link
                              to={`/owner/pricing?facilityId=${fac.id}`}
                              className="p-1.5 rounded-lg bg-[#0B0F14] border border-[#293442] text-[#94A3B8] hover:text-[#E5C378] hover:border-[#D4AF37]"
                              title="Manage Pricing"
                            >
                              <Tag className="w-3.5 h-3.5" />
                            </Link>

                            {/* Pause / Resume */}
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmDialog({
                                  facility: fac,
                                  targetStatus: isLive ? 'Paused' : 'Live'
                                })
                              }
                              className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                                isLive
                                  ? 'bg-[#0B0F14] border-amber-500/40 text-amber-400 hover:bg-amber-500/10'
                                  : 'bg-[#0B0F14] border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                              title={isLive ? 'Pause Listing' : 'Resume Listing'}
                            >
                              {isLive ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards View */}
            <div className="md:hidden divide-y divide-[#293442]/60 p-4 space-y-4">
              {paginatedFacilities.map((fac) => {
                const rate = fac.pricing?.offPeak ?? fac.pricing?.standardHourlyRate;
                const isLive = fac.status === 'Live';

                return (
                  <div key={fac.id} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-[#E5C378]">{fac.sport}</div>
                        <h3 className="text-sm font-bold text-white">{fac.name}</h3>
                        <span className="text-xs text-[#94A3B8]">{fac.area}, {fac.city}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isLive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {fac.status || 'Live'}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline text-xs bg-[#0B0F14] p-2.5 rounded-xl border border-[#293442]">
                      <span className="text-[#94A3B8]">Rate:</span>
                      <strong className="text-white">{rate ? formatINR(rate) : 'Not set'} / hr</strong>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-1 text-center text-xs">
                      <Link
                        to={`/facilities/${fac.id}`}
                        className="py-1.5 px-2 rounded-lg bg-[#0B0F14] border border-[#293442] text-[#94A3B8]"
                      >
                        View
                      </Link>
                      <Link
                        to={`/owner/facilities/${fac.id}/edit`}
                        className="py-1.5 px-2 rounded-lg bg-[#0B0F14] border border-[#293442] text-[#94A3B8]"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/owner/slots?facilityId=${fac.id}`}
                        className="py-1.5 px-2 rounded-lg bg-[#0B0F14] border border-[#293442] text-emerald-400"
                      >
                        Slots
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDialog({
                            facility: fac,
                            targetStatus: isLive ? 'Paused' : 'Live'
                          })
                        }
                        className={`py-1.5 px-2 rounded-lg border font-bold ${
                          isLive ? 'border-amber-500/30 text-amber-400' : 'border-emerald-500/30 text-emerald-400'
                        }`}
                      >
                        {isLive ? 'Pause' : 'Resume'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 bg-[#0B0F14] border-t border-[#293442] flex items-center justify-between text-xs text-[#94A3B8]">
                <span>
                  Showing {paginatedFacilities.length} of {filtered.length} venues
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-[#141B24] border border-[#293442] disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 font-mono font-bold text-white">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg bg-[#141B24] border border-[#293442] disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog Modal for Pause / Resume */}
      {confirmDialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#0B0F14]/90 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-['Barlow_Condensed'] text-2xl font-black uppercase text-white">
              {confirmDialog.targetStatus === 'Paused' ? 'Pause Facility Listing?' : 'Resume Facility Listing?'}
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {confirmDialog.targetStatus === 'Paused'
                ? `Pausing "${confirmDialog.facility.name}" hides it from player search and stops new reservations. Existing confirmed bookings remain valid.`
                : `Resuming "${confirmDialog.facility.name}" immediately makes its available slots bookable to players on the platform.`}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDialog(null)}
              >
                Cancel
              </Button>
              <Button
                variant={confirmDialog.targetStatus === 'Paused' ? 'primary' : 'gold'}
                size="sm"
                onClick={handleExecuteStatusToggle}
              >
                Confirm {confirmDialog.targetStatus}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
