/**
 * MyBookingsPage.jsx
 * Route: /facilities/my-bookings and /facilities/my-bookings/:id
 *
 * Dedicated, authoritative booking history view inside the Facilities section.
 *
 * Features:
 *  - Authentication required: redirects to /login?redirect=... if logged out
 *  - Filter bar: status tabs with live counts, date range (from <= to), sport dropdown
 *  - Synchronized bidirectional URL query params (?status, ?sport, ?from, ?to, ?page, ?sort)
 *  - Table view on desktop, polished card layout on mobile
 *  - Server-side / service pagination (10 per page)
 *  - Skeleton loading, error banner with retry, and contextual empty states
 *  - "Book Again" and "Cancel Booking" with server-computed window and confirmation
 *  - Deep linking to single booking modal via URL /facilities/my-bookings/:id
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  BookmarkCheck,
  Search,
  Filter,
  X,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowUpDown,
  ExternalLink,
  Users,
  ShieldAlert,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import {
  getUserBookings,
  getBookingById,
  cancelBooking
} from '../../services/bookingHistoryService';
import BookingDetailsModal from '../../components/facility/BookingDetailsModal';

export default function MyBookingsPage() {
  const { id: paramBookingId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthenticated, authLoading } = useAuth();

  // Active query parameters
  const statusParam = searchParams.get('status') || 'all';
  const sportParam = searchParams.get('sport') || 'all';
  const fromParam = searchParams.get('from') || '';
  const toParam = searchParams.get('to') || '';
  const sortParam = searchParams.get('sort') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Local filter states
  const [statusTab, setStatusTab] = useState(statusParam);
  const [selectedSport, setSelectedSport] = useState(sportParam);
  const [fromDate, setFromDate] = useState(fromParam);
  const [toDate, setToDate] = useState(toParam);
  const [dateError, setDateError] = useState('');
  const [sortOrder, setSortOrder] = useState(sortParam);
  const [currentPage, setCurrentPage] = useState(pageParam);

  // Data fetching state
  const [data, setData] = useState({
    bookings: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    counts: { all: 0, upcoming: 0, completed: 0, cancelled: 0, pending: 0 },
    availableSports: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [selectedBookingForModal, setSelectedBookingForModal] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Schedule conflict');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Sync state with URL params
  useEffect(() => {
    setStatusTab(statusParam);
    setSelectedSport(sportParam);
    setFromDate(fromParam);
    setToDate(toParam);
    setSortOrder(sortParam);
    setCurrentPage(pageParam);
  }, [statusParam, sportParam, fromParam, toParam, sortParam, pageParam]);

  // Auth Protection: redirect logged-out users to login preserving return path
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${returnUrl}`, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, location]);

  // Fetch bookings from service
  const fetchBookings = useCallback(() => {
    if (!isAuthenticated || !currentUser) return;

    setDateError('');
    if (fromDate && toDate && fromDate > toDate) {
      setDateError("'From' date must be before or equal to 'To' date.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const session = {
        userId: currentUser.id,
        userName: currentUser.name
      };

      const result = getUserBookings(session, {
        statusTab,
        sport: selectedSport,
        fromDate,
        toDate,
        sortBy: 'date',
        sortOrder,
        page: currentPage,
        limit: 10
      });

      setData(result);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load booking history.');
      setLoading(false);
    }
  }, [currentUser, isAuthenticated, statusTab, selectedSport, fromDate, toDate, sortOrder, currentPage]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Deep linking: if :id is provided in URL, open the details modal
  useEffect(() => {
    if (paramBookingId && currentUser) {
      try {
        const session = { userId: currentUser.id, userName: currentUser.name };
        const found = getBookingById(session, paramBookingId);
        setSelectedBookingForModal(found);
      } catch (err) {
        setError(err.message || 'Reservation not found.');
      }
    }
  }, [paramBookingId, currentUser]);

  // Update URL Query Params helper
  const updateQueryParams = (updates) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === 'all' || v === 1 || v === null || v === undefined) {
        nextParams.delete(k);
      } else {
        nextParams.set(k, String(v));
      }
    });
    setSearchParams(nextParams);
  };

  // Filter Handlers
  const handleStatusTabChange = (newStatus) => {
    setStatusTab(newStatus);
    setCurrentPage(1);
    updateQueryParams({ status: newStatus, page: 1 });
  };

  const handleSportChange = (sport) => {
    setSelectedSport(sport);
    setCurrentPage(1);
    updateQueryParams({ sport, page: 1 });
  };

  const handleDateChange = (from, to) => {
    setFromDate(from);
    setToDate(to);
    setCurrentPage(1);
    updateQueryParams({ from, to, page: 1 });
  };

  const handleClearFilters = () => {
    setStatusTab('all');
    setSelectedSport('all');
    setFromDate('');
    setToDate('');
    setDateError('');
    setCurrentPage(1);
    setSortOrder('');
    setSearchParams(new URLSearchParams());
  };

  const handleToggleSort = () => {
    const nextSort = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(nextSort);
    updateQueryParams({ sort: nextSort });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    updateQueryParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Perform Cancellation
  const handleConfirmCancel = async () => {
    if (!cancelModalBooking || !currentUser) return;

    setIsCancelling(true);
    setCancelError('');

    try {
      const session = { userId: currentUser.id, userName: currentUser.name };
      const res = cancelBooking(session, cancelModalBooking.id, cancelReason);

      setIsCancelling(false);
      setCancelModalBooking(null);
      setSelectedBookingForModal(null);

      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 4000);

      fetchBookings();
    } catch (err) {
      setIsCancelling(false);
      setCancelError(err.message || 'Could not cancel booking.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Completed':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'Cancelled':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'Pending':
      case 'Pending confirmation':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const isAnyFilterActive =
    statusTab !== 'all' || selectedSport !== 'all' || Boolean(fromDate) || Boolean(toDate);

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <div className="w-8 h-8 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-hero-fade">
      {/* Toast alert notice */}
      {toastMessage && (
        <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button type="button" onClick={() => setToastMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#293442]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 mb-1">
            <Link to="/facilities" className="hover:underline flex items-center gap-1">
              <span>Facilities</span>
            </Link>
            <span>&bull;</span>
            <span className="text-slate-300">My Bookings</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F7FA] font-['Barlow_Condensed']">
            Player Reservation History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            View, filter, inspect and manage your verified venue reservations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/facilities">
            <Button variant="crimson" size="sm" className="text-xs gap-1.5">
              <span>Browse Facilities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Tabs Bar with Live Server Counts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: 'all', label: 'All Bookings', count: data.counts.all },
          { key: 'upcoming', label: 'Upcoming', count: data.counts.upcoming },
          { key: 'completed', label: 'Completed', count: data.counts.completed },
          { key: 'cancelled', label: 'Cancelled', count: data.counts.cancelled },
          { key: 'pending', label: 'Pending', count: data.counts.pending }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleStatusTabChange(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
              statusTab === tab.key
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white border-rose-500 shadow-md shadow-red-950/40'
                : 'bg-[#141B24] border-[#293442] text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                statusTab === tab.key ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Combinable Filter Bar: Date Range, Sport Dropdown, Sort */}
      <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          {/* Sport Filter */}
          <div className="lg:col-span-3 space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Sport
            </label>
            <select
              value={selectedSport}
              onChange={(e) => handleSportChange(e.target.value)}
              className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="all">All Sports ({data.availableSports.length})</option>
              {data.availableSports.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range: From */}
          <div className="lg:col-span-3 space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => handleDateChange(e.target.value, toDate)}
              className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-rose-500 [color-scheme:dark]"
            />
          </div>

          {/* Date Range: To */}
          <div className="lg:col-span-3 space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => handleDateChange(fromDate, e.target.value)}
              className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-rose-500 [color-scheme:dark]"
            />
          </div>

          {/* Sort & Reset Actions */}
          <div className="lg:col-span-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSort}
              className="flex-1 h-[36px] bg-[#0B0F14] border border-[#293442] hover:border-slate-600 text-slate-200 text-xs font-semibold rounded-xl px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Toggle sorting order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-rose-400" />
              <span>
                {sortOrder === 'asc'
                  ? 'Soonest First'
                  : sortOrder === 'desc'
                  ? 'Latest First'
                  : statusTab === 'upcoming'
                  ? 'Soonest'
                  : 'Latest'}
              </span>
            </button>

            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="h-[36px] px-3 bg-white/5 hover:bg-white/10 border border-[#293442] text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {dateError && (
          <div className="text-xs text-rose-400 flex items-center gap-1.5 pt-1">
            <AlertCircle className="w-4 h-4" />
            <span>{dateError}</span>
          </div>
        )}
      </div>

      {/* Error state with retry */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-sm text-slate-200 font-semibold">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchBookings}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !error && (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[#141B24] border border-[#293442] rounded-2xl" />
          ))}
        </div>
      )}

      {/* Empty States */}
      {!loading && !error && data.bookings.length === 0 && (
        <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#0B0F14] border border-[#293442] flex items-center justify-center text-rose-400 mx-auto">
            <BookmarkCheck className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="font-['Barlow_Condensed'] text-2xl font-black uppercase text-white">
              {isAnyFilterActive ? 'No Bookings Match Your Filters' : 'You Have No Bookings Yet'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {isAnyFilterActive
                ? 'Try clearing active filters or selecting a wider date range to find your reservations.'
                : 'Browse our directory of football arenas, badminton courts, and multi-sport grounds to reserve your next match slot.'}
            </p>
          </div>

          <div className="pt-2">
            {isAnyFilterActive ? (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Link to="/facilities">
                <Button variant="crimson" size="md">
                  Browse Facilities
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Desktop Tabular View (hidden on small screens) ── */}
      {!loading && !error && data.bookings.length > 0 && (
        <>
          <div className="hidden md:block bg-[#141B24] border border-[#293442] rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0B0F14] border-b border-[#293442] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Facility & Court</th>
                  <th className="py-3.5 px-4">Sport</th>
                  <th className="py-3.5 px-4">Scheduled Date & Time</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#293442]/60 text-slate-200">
                {data.bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Booking ID */}
                    <td className="py-4 px-4 font-mono font-bold text-rose-300">
                      {b.id}
                    </td>

                    {/* Facility & Pitch */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{b.facilityName}</div>
                      <div className="text-[11px] text-slate-400">
                        {b.groundName} &bull; {b.area}
                      </div>
                    </td>

                    {/* Sport */}
                    <td className="py-4 px-4">
                      <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[11px] font-medium text-slate-300">
                        {b.sport}
                      </span>
                    </td>

                    {/* Timing */}
                    <td className="py-4 px-4">
                      <div className="font-medium text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-400" />
                        <span>{b.date}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{b.startTime} ({b.durationHours}h)</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 text-right font-mono font-bold text-white">
                      ₹{b.amount}
                      {b.hasSplit && (
                        <div className="text-[10px] text-emerald-400 font-normal">
                          Split active
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          b.derivedStatus
                        )}`}
                      >
                        {b.derivedStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedBookingForModal(b)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-[#293442] hover:text-white transition-colors"
                        >
                          Details
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/facilities/${b.facilityId}`)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors"
                          title="Book this facility again"
                        >
                          Book Again
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Card View (shown only on small screens) ── */}
          <div className="md:hidden space-y-4">
            {data.bookings.map((b) => (
              <div
                key={b.id}
                className="bg-[#141B24] border border-[#293442] rounded-2xl p-4 space-y-3.5 shadow-xl"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#293442]">
                  <span className="font-mono text-xs font-bold text-rose-300">{b.id}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(
                      b.derivedStatus
                    )}`}
                  >
                    {b.derivedStatus}
                  </span>
                </div>

                <div>
                  <h3 className="font-['Barlow_Condensed'] text-xl font-black uppercase text-white leading-tight">
                    {b.facilityName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {b.groundName} &bull; {b.sport}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-[#0B0F14] border border-[#293442] rounded-xl p-3">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold block">Date</span>
                    <span className="font-semibold text-white">{b.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold block">Time</span>
                    <span className="font-semibold text-white">{b.startTime} ({b.durationHours}h)</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-[#293442] flex justify-between items-center">
                    <span className="text-slate-400">Total:</span>
                    <span className="font-mono font-bold text-rose-300">₹{b.amount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setSelectedBookingForModal(b)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="crimson"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => navigate(`/facilities/${b.facilityId}`)}
                  >
                    Book Again
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[#293442] text-xs text-slate-400">
              <span>
                Showing {((data.page - 1) * data.limit) + 1} to {Math.min(data.page * data.limit, data.total)} of {data.total} bookings
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={data.page <= 1}
                  onClick={() => handlePageChange(data.page - 1)}
                  className="p-1.5 rounded-lg bg-[#141B24] border border-[#293442] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="font-semibold text-white px-2">
                  Page {data.page} of {data.totalPages}
                </span>

                <button
                  type="button"
                  disabled={data.page >= data.totalPages}
                  onClick={() => handlePageChange(data.page + 1)}
                  className="p-1.5 rounded-lg bg-[#141B24] border border-[#293442] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBookingForModal}
        isOpen={Boolean(selectedBookingForModal)}
        onClose={() => {
          setSelectedBookingForModal(null);
          if (paramBookingId) navigate('/facilities/my-bookings');
        }}
        onOpenCancelDialog={(booking) => {
          setCancelModalBooking(booking);
          setCancelError('');
        }}
      />

      {/* Cancellation Confirmation Dialog */}
      {cancelModalBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#141B24] border border-rose-500/50 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-['Barlow_Condensed'] text-2xl font-black uppercase text-white">
                  Cancel Reservation?
                </h3>
                <span className="font-mono text-xs text-rose-300">#{cancelModalBooking.id}</span>
              </div>
            </div>

            <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-3.5 space-y-2 text-xs text-slate-300">
              <div>
                <strong>Venue:</strong> {cancelModalBooking.facilityName}
              </div>
              <div>
                <strong>Scheduled:</strong> {cancelModalBooking.date} at {cancelModalBooking.startTime}
              </div>
              <p className="text-[11px] text-amber-300 font-medium pt-1">
                Policy Notice: {cancelModalBooking.refundNotice || 'Refunds are settled outside SportLink directly with the venue.'}
              </p>
            </div>

            {/* Reason selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Cancellation Reason
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-[#0B0F14] border border-[#293442] text-white text-xs rounded-xl px-3 py-2 outline-none"
              >
                <option value="Schedule conflict">Schedule conflict / Change of plans</option>
                <option value="Weather / Personal emergency">Weather / Personal emergency</option>
                <option value="Booking error">Booked wrong court or date</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {cancelError && (
              <p className="text-xs text-rose-400 font-medium">{cancelError}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCancelModalBooking(null)}
                disabled={isCancelling}
              >
                Keep Booking
              </Button>
              <Button
                variant="crimson"
                size="sm"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

