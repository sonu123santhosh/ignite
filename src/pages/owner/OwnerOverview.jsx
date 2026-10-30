import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowRight,
  Star,
  Users,
  AlertCircle
} from 'lucide-react';
import { useFacilities } from '../../context/FacilitiesContext.jsx';
import { facilityOwnerApi } from '../../services/facilityOwnerApi.js';
import { formatINR, formatDisplayDate, formatTime12h } from '../../components/facility/facilityAdapter.js';

export default function OwnerOverview() {
  const { session } = useFacilities();

  // Load real overview data scoped strictly to current owner
  const overviewResult = useMemo(() => {
    try {
      return facilityOwnerApi.getOverview(session);
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [session]);

  if (!overviewResult.success) {
    return (
      <div className="bg-[#141B24] border border-rose-500/30 rounded-2xl p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h2 className="text-sm font-bold text-rose-200">Unable to load owner overview</h2>
        <p className="text-xs text-[#94A3B8]">{overviewResult.error}</p>
      </div>
    );
  }

  const {
    totalFacilities,
    upcomingBookingsCount,
    completedBookingsCount,
    pendingRequestsCount,
    totalEarnings,
    hasPaymentData,
    recentBookings,
    facilitySnapshots
  } = overviewResult.data;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#E5C378]">
          Owner Command Center
        </span>
        <h1 className="font-['Barlow_Condensed'] text-3xl sm:text-4xl font-black uppercase text-[#F5F7FA] tracking-wide mt-1">
          Business Overview
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
          Real-time summary of your sports venues, scheduled matches, and financial performance.
        </p>
      </div>

      {/* 5 Summary KPI Cards (Linked to matching sections) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Facilities */}
        <Link
          to="/owner/facilities"
          className="bg-[#141B24] border border-[#293442] hover:border-[#D4AF37]/50 rounded-2xl p-4 transition-all group cursor-pointer shadow-lg block"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">
              Total Venues
            </span>
            <Building2 className="w-4 h-4 text-[#E5C378]" />
          </div>
          <div className="font-['Barlow_Condensed'] text-3xl font-black text-[#F5F7FA] mt-2">
            {totalFacilities}
          </div>
          <span className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-1 group-hover:text-[#E5C378]">
            <span>Manage venues</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        {/* Upcoming Bookings */}
        <Link
          to="/owner/bookings?status=Confirmed"
          className="bg-[#141B24] border border-[#293442] hover:border-[#D4AF37]/50 rounded-2xl p-4 transition-all group cursor-pointer shadow-lg block"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">
              Upcoming
            </span>
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-['Barlow_Condensed'] text-3xl font-black text-emerald-400 mt-2">
            {upcomingBookingsCount}
          </div>
          <span className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-1 group-hover:text-emerald-400">
            <span>View scheduled</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        {/* Completed Bookings */}
        <Link
          to="/owner/bookings?status=Completed"
          className="bg-[#141B24] border border-[#293442] hover:border-[#D4AF37]/50 rounded-2xl p-4 transition-all group cursor-pointer shadow-lg block"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">
              Completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-['Barlow_Condensed'] text-3xl font-black text-sky-400 mt-2">
            {completedBookingsCount}
          </div>
          <span className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-1 group-hover:text-sky-400">
            <span>Past matches</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        {/* Pending Requests */}
        <Link
          to="/owner/bookings?status=Pending"
          className="bg-[#141B24] border border-[#293442] hover:border-amber-400/50 rounded-2xl p-4 transition-all group cursor-pointer shadow-lg block"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">
              Pending
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-['Barlow_Condensed'] text-3xl font-black text-amber-400 mt-2">
            {pendingRequestsCount}
          </div>
          <span className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-1 group-hover:text-amber-400">
            <span>Needs review</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        {/* Total Confirmed Earnings */}
        <Link
          to="/owner/earnings"
          className="bg-[#141B24] border border-[#293442] hover:border-[#D4AF37]/50 rounded-2xl p-4 transition-all group cursor-pointer shadow-lg block col-span-2 sm:col-span-1"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">
              Confirmed Rev.
            </span>
            <DollarSign className="w-4 h-4 text-[#E5C378]" />
          </div>
          <div className="font-['Barlow_Condensed'] text-3xl font-black text-[#E5C378] mt-2">
            {hasPaymentData ? formatINR(totalEarnings) : 'N/A'}
          </div>
          <span className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-1 group-hover:text-[#E5C378]">
            <span>{hasPaymentData ? 'Financial reports' : 'No payments yet'}</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Facility Performance Snapshot */}
      <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-[#293442]">
          <div>
            <h2 className="font-['Barlow_Condensed'] text-2xl font-black uppercase text-[#F5F7FA]">
              Venue Performance Snapshot
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Status, reservation volume, and verified player ratings.
            </p>
          </div>
          <Link
            to="/owner/facilities"
            className="text-xs font-bold text-[#E5C378] hover:underline"
          >
            All Venues
          </Link>
        </div>

        {facilitySnapshots.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#94A3B8]">
            No venues listed yet. Click &quot;Add Facility&quot; to register your first ground.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {facilitySnapshots.map((fac) => (
              <div
                key={fac.id}
                className="bg-[#0B0F14] border border-[#293442] rounded-xl p-4 space-y-2.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#E5C378]">
                      {fac.sport}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate max-w-[200px]">
                      {fac.name}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      fac.status === 'Live'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : fac.status === 'Paused'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {fac.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#293442]/60">
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block">Active Bookings</span>
                    <strong className="text-[#F5F7FA] font-bold">{fac.activeBookingsCount}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block">Player Score</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{fac.rating > 0 ? fac.rating : 'New'}</span>
                      {fac.reviewCount > 0 && (
                        <span className="text-[10px] text-[#94A3B8]">({fac.reviewCount})</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Link
                    to={`/owner/slots?facilityId=${fac.id}`}
                    className="text-[11px] font-bold text-[#E5C378] hover:underline"
                  >
                    Manage Slots &rarr;
                  </Link>
                  <span className="text-[#293442]">|</span>
                  <Link
                    to={`/facilities/${fac.id}`}
                    className="text-[11px] text-[#94A3B8] hover:text-white"
                  >
                    Public Page
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Bookings Feed */}
      <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-[#293442]">
          <div>
            <h2 className="font-['Barlow_Condensed'] text-2xl font-black uppercase text-[#F5F7FA]">
              Recent Bookings
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Latest reservations recorded across your facilities.
            </p>
          </div>
          <Link
            to="/owner/bookings"
            className="text-xs font-bold text-[#E5C378] hover:underline"
          >
            All Bookings ({recentBookings.length})
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#94A3B8]">
            No booking reservations recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#F5F7FA]">
              <thead className="bg-[#0B0F14] text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider border-b border-[#293442]">
                <tr>
                  <th scope="col" className="py-3 px-3">Booking ID</th>
                  <th scope="col" className="py-3 px-3">Facility &amp; Pitch</th>
                  <th scope="col" className="py-3 px-3">Player</th>
                  <th scope="col" className="py-3 px-3">Date &amp; Time</th>
                  <th scope="col" className="py-3 px-3">Amount</th>
                  <th scope="col" className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#293442]/50">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#0B0F14]/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">
                      {b.id}
                    </td>
                    <td className="py-3 px-3 font-medium">
                      <div className="text-white truncate max-w-[180px]">{b.facilityName}</div>
                      <div className="text-[10px] text-[#94A3B8]">{b.groundName}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{b.playerName}</div>
                      <div className="text-[10px] text-[#94A3B8]">{b.playerPhone}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div>{b.date}</div>
                      <div className="text-[10px] text-[#94A3B8]">
                        {b.startTime} ({b.durationHours || 1} hr)
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-[#E5C378]">
                      {formatINR(b.amount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          b.status === 'Confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : b.status === 'Completed'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                            : b.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
