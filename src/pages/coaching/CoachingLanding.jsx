import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building, 
  Users, 
  Calendar, 
  Award, 
  PlusCircle, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  Map as MapIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  TrendingUp, 
  Star, 
  ChevronRight,
  Filter,
  Eye,
  Check,
  X,
  CreditCard,
  UserCheck,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import CoachingRoleSwitcher from '../../components/coaching/CoachingRoleSwitcher';
import CoachingHeader from '../../components/coaching/CoachingHeader';
import CoachingFilterPanel from '../../components/coaching/CoachingFilterPanel';
import AcademyCard from '../../components/coaching/AcademyCard';
import CoachingMapView from '../../components/coaching/CoachingMapView';
import BookTrialModal from '../../components/coaching/BookTrialModal';
import EnrolmentModal from '../../components/coaching/EnrolmentModal';
import AddAcademyModal from '../../components/coaching/AddAcademyModal';
import AddProgrammeModal from '../../components/coaching/AddProgrammeModal';
import AddBatchModal from '../../components/coaching/AddBatchModal';
import AttendanceModal from '../../components/coaching/AttendanceModal';
import { filterAcademies, sortAcademies } from '../../data/coachingData';

export default function CoachingLanding() {
  const { 
    role, 
    activeUser, 
    academies, 
    coaches, 
    programmes, 
    batches, 
    trialBookings, 
    enrolments, 
    payments, 
    favourites, 
    toggleFavourite,
    updateEnrolmentStatus,
    updateTrialStatus,
    recordPayment,
    toggleAcademyStatus,
    toggleCoachStatus
  } = useCoaching();

  const navigate = useNavigate();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedTime, setSelectedTime] = useState('all');
  const [filters, setFilters] = useState({
    sport: 'all',
    minBudget: '',
    maxBudget: 8000,
    maxDistance: null,
    skillLevel: 'all',
    ageGroup: 'all',
    facilityType: 'all',
    trialOnly: false,
    freeTrialOnly: false,
    womenCoaches: false,
    womenFocusedBatches: false,
    beginnerFriendly: false,
    accessible: false,
    scholarshipsOnly: false,
    verifiedOnly: false
  });
  const [sortKey, setSortKey] = useState('relevant');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'map'
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // User Geolocation (Pune City Centre default fallback)
  const [userCoords, setUserCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Modals state
  const [modalTrialAcademy, setModalTrialAcademy] = useState(null);
  const [modalEnrolAcademy, setModalEnrolAcademy] = useState(null);
  const [isAddAcademyOpen, setIsAddAcademyOpen] = useState(false);
  const [isAddProgrammeOpen, setIsAddProgrammeOpen] = useState(false);
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [attendanceModalBatch, setAttendanceModalBatch] = useState(null);

  // Owner active sub-tab state
  const [ownerActiveTab, setOwnerActiveTab] = useState('academies'); // 'academies' | 'coaches' | 'programmes' | 'enrolments' | 'trials' | 'attendance' | 'payments' | 'analytics'

  // Rejection modal state for owner
  const [rejectItemModal, setRejectItemModal] = useState(null); // { type: 'enrolment' | 'trial', id: string, name: string }
  const [rejectReason, setRejectReason] = useState('');

  // Handle location detection
  const handleUseMyLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
        },
        () => {
          // Fallback to Pune center
          setUserCoords({ lat: 18.5204, lng: 73.8567 });
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setUserCoords({ lat: 18.5204, lng: 73.8567 });
      setIsLocating(false);
    }
  };

  // Filter & sort academies for athlete view
  const filteredAcademies = useMemo(() => {
    const combined = {
      ...filters,
      sport: selectedSport !== 'all' ? selectedSport : filters.sport,
      city: selectedCity !== 'all' ? selectedCity : 'all',
      keyword: searchQuery
    };
    const list = filterAcademies(academies, combined, userCoords);
    return sortAcademies(list, sortKey, userCoords);
  }, [academies, filters, selectedSport, selectedCity, searchQuery, sortKey, userCoords]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSport('all');
    setSelectedCity('all');
    setSelectedTime('all');
    setFilters({
      sport: 'all',
      minBudget: '',
      maxBudget: 8000,
      maxDistance: null,
      skillLevel: 'all',
      ageGroup: 'all',
      facilityType: 'all',
      trialOnly: false,
      freeTrialOnly: false,
      womenCoaches: false,
      womenFocusedBatches: false,
      beginnerFriendly: false,
      accessible: false,
      scholarshipsOnly: false,
      verifiedOnly: false
    });
    setUserCoords(null);
  };

  // Handle owner rejection confirmation
  const handleConfirmReject = () => {
    if (!rejectItemModal || !rejectReason.trim()) return;
    if (rejectItemModal.type === 'enrolment') {
      updateEnrolmentStatus(rejectItemModal.id, 'Rejected', rejectReason);
    } else if (rejectItemModal.type === 'trial') {
      updateTrialStatus(rejectItemModal.id, 'Rejected', rejectReason);
    }
    setRejectItemModal(null);
    setRejectReason('');
  };

  // Owner summary statistics
  const ownerAcademies = (academies || []).filter(a => a.ownerId === activeUser?.id || activeUser?.role === 'owner');
  const myAcademyIds = ownerAcademies.map(a => a.id);
  const ownerProgrammes = (programmes || []).filter(p => myAcademyIds.includes(p.academyId));
  const ownerBatches = (batches || []).filter(b => myAcademyIds.includes(b.academyId));
  const ownerEnrolments = (enrolments || []).filter(e => myAcademyIds.includes(e.academyId));
  const ownerTrials = (trialBookings || []).filter(t => myAcademyIds.includes(t.academyId));
  const pendingEnrolmentsCount = ownerEnrolments.filter(e => (e.enrolmentStatus || e.status) === 'Pending Approval').length;
  const pendingTrialsCount = ownerTrials.filter(t => t.status === 'Pending').length;
  const totalStudentsCount = ownerEnrolments.filter(e => (e.enrolmentStatus || e.status) === 'Active' || (e.enrolmentStatus || e.status) === 'Approved').length;
  const totalCapacity = ownerBatches.reduce((acc, b) => acc + (b.capacity || 0), 0);
  const totalEnrolled = ownerBatches.reduce((acc, b) => acc + (b.enrolledCount || 0), 0);
  const availableSeats = Math.max(0, totalCapacity - totalEnrolled);

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F7FA] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Role Switcher */}
        <CoachingRoleSwitcher />

        {/* ========================================================================= */}
        {/* 1. ATHLETE / PLAYER EXPERIENCE                                           */}
        {/* ========================================================================= */}
        {role === 'player' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header & Prominent Search */}
            <CoachingHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedSport={selectedSport}
              onSportSelect={(s) => setSelectedSport(s)}
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
              selectedTime={selectedTime}
              onTimeChange={setSelectedTime}
              maxBudget={filters.maxBudget}
              onBudgetChange={(b) => setFilters(prev => ({ ...prev, maxBudget: b }))}
              userCoords={userCoords}
              onUseMyLocation={handleUseMyLocation}
              isLocating={isLocating}
            />

            {/* Main Content Layout: Sidebar Filters + Main Results */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              
              {/* Filter Panel (Desktop Sticky / Mobile Drawer) */}
              <CoachingFilterPanel
                filters={filters}
                onFilterChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
                onResetFilters={handleResetFilters}
                isOpenOnMobile={isMobileFiltersOpen}
                onCloseMobile={() => setIsMobileFiltersOpen(false)}
                totalResults={filteredAcademies.length}
              />

              {/* Main Results Column */}
              <main className="flex-1 w-full min-w-0 space-y-6">
                
                {/* Control bar: count, mobile filter trigger, sort, view mode */}
                <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white tracking-wide">
                      Showing {filteredAcademies.length} Coaching Centre{filteredAcademies.length === 1 ? '' : 's'}
                    </span>
                    {userCoords && (
                      <span className="text-[11px] font-mono text-[#B6FF3B] bg-[#B6FF3B]/10 px-2 py-0.5 rounded-full border border-[#B6FF3B]/30">
                        Sorted by Distance
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Mobile Filters Drawer Trigger */}
                    <button
                      type="button"
                      onClick={() => setIsMobileFiltersOpen(true)}
                      className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2530] text-xs font-semibold text-white border border-[#293442] rounded-xl cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#B6FF3B]" />
                      <span>Filters</span>
                    </button>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                      <span className="hidden sm:inline">Sort:</span>
                      <select
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value)}
                        className="bg-[#0B0F14] border border-[#293442] rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-[#B6FF3B]"
                      >
                        <option value="relevant">Most Relevant</option>
                        <option value="nearest">Nearest First</option>
                        <option value="lowest_fee">Lowest Monthly Fee</option>
                        <option value="highest_rated">Highest Rated</option>
                        <option value="trial_available">Trial Available First</option>
                      </select>
                    </div>

                    {/* View Mode Toggle: Grid, List, Map */}
                    <div className="inline-flex p-1 bg-[#0B0F14] border border-[#293442] rounded-xl">
                      <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          viewMode === 'grid' ? 'bg-[#1B2530] text-[#B6FF3B]' : 'text-gray-400 hover:text-white'
                        }`}
                        title="Grid View"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          viewMode === 'list' ? 'bg-[#1B2530] text-[#B6FF3B]' : 'text-gray-400 hover:text-white'
                        }`}
                        title="List View"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('map')}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          viewMode === 'map' ? 'bg-[#1B2530] text-[#00D4FF]' : 'text-gray-400 hover:text-white'
                        }`}
                        title="Interactive Map View"
                      >
                        <MapIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* VIEW 1: Map View */}
                {viewMode === 'map' ? (
                  <CoachingMapView
                    academies={filteredAcademies}
                    userCoords={userCoords}
                  />
                ) : filteredAcademies.length === 0 ? (
                  /* Empty state */
                  <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-12 text-center space-y-4 shadow-xl">
                    <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                      <Building className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
                        No Coaching Centres Match Your Filters
                      </h3>
                      <p className="text-sm text-[#94A3B8] max-w-md mx-auto">
                        Try expanding your distance radius, adjusting budget parameters, or clearing active preference filters.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="px-5 py-2.5 rounded-xl bg-[#1B2530] text-gray-200 border border-[#293442] hover:text-white text-xs font-bold transition-all"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : viewMode === 'list' ? (
                  /* VIEW 2: List View */
                  <div className="space-y-4">
                    {filteredAcademies.map((acad) => (
                      <AcademyCard
                        key={acad.id}
                        academy={acad}
                        userCoords={userCoords}
                        isFavourite={favourites.includes(acad.id)}
                        onToggleFavourite={toggleFavourite}
                        onBookTrial={(a) => setModalTrialAcademy(a)}
                        viewMode="list"
                      />
                    ))}
                  </div>
                ) : (
                  /* VIEW 3: Grid View (Default) */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredAcademies.map((acad) => (
                      <AcademyCard
                        key={acad.id}
                        academy={acad}
                        userCoords={userCoords}
                        isFavourite={favourites.includes(acad.id)}
                        onToggleFavourite={toggleFavourite}
                        onBookTrial={(a) => setModalTrialAcademy(a)}
                        viewMode="grid"
                      />
                    ))}
                  </div>
                )}
              </main>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. COACH / ACADEMY OWNER EXPERIENCE                                      */}
        {/* ========================================================================= */}
        {role === 'owner' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Owner Header & Summary Bar */}
            <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 tracking-wide uppercase">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Academy Operations Console</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Manage Your Coaching.
                </h1>
                <p className="text-sm text-[#94A3B8] max-w-2xl">
                  Manage programmes, organise batches, handle student enrolments, track session attendance, and grow your coaching community.
                </p>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddAcademyOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00D4FF] text-black font-extrabold text-xs hover:bg-[#00c2e6] transition-all shadow-md cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Add Coaching Centre</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddProgrammeOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B6FF3B] text-black font-extrabold text-xs hover:bg-[#a5ef28] transition-all shadow-md cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Create Programme</span>
                </button>
              </div>
            </div>

            {/* Metrics Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-4 space-y-1">
                <div className="text-[11px] font-bold text-gray-400 uppercase">Centres</div>
                <div className="text-2xl font-extrabold text-white">{ownerAcademies.length}</div>
                <div className="text-[10px] text-gray-500">Active listings</div>
              </div>

              <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-4 space-y-1">
                <div className="text-[11px] font-bold text-gray-400 uppercase">Programmes</div>
                <div className="text-2xl font-extrabold text-[#00D4FF]">{ownerProgrammes.length}</div>
                <div className="text-[10px] text-gray-500">{ownerBatches.length} active batches</div>
              </div>

              <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-4 space-y-1">
                <div className="text-[11px] font-bold text-gray-400 uppercase">Enrolled Students</div>
                <div className="text-2xl font-extrabold text-[#B6FF3B]">{totalStudentsCount}</div>
                <div className="text-[10px] text-gray-500">Confirmed athletes</div>
              </div>

              <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-4 space-y-1">
                <div className="text-[11px] font-bold text-gray-400 uppercase">Pending Enrolments</div>
                <div className="text-2xl font-extrabold text-amber-400">{pendingEnrolmentsCount}</div>
                <div className="text-[10px] text-gray-500">Awaiting approval</div>
              </div>

              <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-4 space-y-1">
                <div className="text-[11px] font-bold text-gray-400 uppercase">Upcoming Trials</div>
                <div className="text-2xl font-extrabold text-purple-400">{pendingTrialsCount}</div>
                <div className="text-[10px] text-gray-500">Trial bookings</div>
              </div>

              <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-4 space-y-1">
                <div className="text-[11px] font-bold text-gray-400 uppercase">Available Seats</div>
                <div className="text-2xl font-extrabold text-white">{availableSeats}</div>
                <div className="text-[10px] text-gray-500">Across {ownerBatches.length} batches</div>
              </div>
            </div>

            {/* Owner Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#293442]">
              {[
                { id: 'academies', label: 'My Coaching Centres' },
                { id: 'coaches', label: 'Coaches' },
                { id: 'programmes', label: 'Programmes & Batches' },
                { id: 'enrolments', label: `Student Enrolments ${pendingEnrolmentsCount > 0 ? `(${pendingEnrolmentsCount})` : ''}` },
                { id: 'trials', label: `Trial Bookings ${pendingTrialsCount > 0 ? `(${pendingTrialsCount})` : ''}` },
                { id: 'attendance', label: 'Attendance & Tracking' },
                { id: 'payments', label: 'Fees & Payments' },
                { id: 'analytics', label: 'Analytics' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setOwnerActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    ownerActiveTab === tab.id
                      ? 'bg-[#B6FF3B] text-[#0B0F14] shadow-md'
                      : 'bg-[#141B24] text-gray-400 border border-[#293442] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: My Coaching Centres Table */}
            {ownerActiveTab === 'academies' && (
              <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">My Coaching Centres</h3>
                    <p className="text-xs text-gray-400">View and maintain your published academy profiles</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddAcademyOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#00D4FF] text-black text-xs font-bold"
                  >
                    + New Centre
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#0B0F14] text-gray-400 uppercase font-mono text-[11px] border-b border-[#293442]">
                      <tr>
                        <th className="p-3.5">Academy</th>
                        <th className="p-3.5">Sports</th>
                        <th className="p-3.5">Location</th>
                        <th className="p-3.5">Programmes</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Rating</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#293442]">
                      {ownerAcademies.map((acad) => (
                        <tr key={acad.id} className="hover:bg-[#1B2530]/50 transition-colors">
                          <td className="p-3.5 font-bold text-white flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-[#1B2530] text-[#00D4FF] flex items-center justify-center font-bold text-[11px]">
                              {acad.logoInitials}
                            </span>
                            <span>{acad.name}</span>
                          </td>
                          <td className="p-3.5">{acad.sports?.join(', ') || 'Multi-Sport'}</td>
                          <td className="p-3.5">{acad.locality}, {acad.city}</td>
                          <td className="p-3.5 font-mono">{programmes.filter(p => p.academyId === acad.id).length} Active</td>
                          <td className="p-3.5">
                            {acad.status === 'Active' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                {acad.status}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 font-bold text-white flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span>{acad.rating}</span>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            <Link
                              to={`/coaching/${acad.id}`}
                              className="px-2.5 py-1 rounded-lg bg-[#1B2530] text-gray-200 border border-[#293442] hover:text-white"
                            >
                              View
                            </Link>
                            <button
                              type="button"
                              onClick={() => toggleAcademyStatus(acad.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#0B0F14] text-gray-400 border border-[#293442] hover:text-white"
                            >
                              {acad.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: Coach Management */}
            {ownerActiveTab === 'coaches' && (
              <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Academy Coaches</h3>
                    <p className="text-xs text-gray-400">Manage coaching staff profiles, qualifications, and assignments</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#0B0F14] text-gray-400 uppercase font-mono text-[11px] border-b border-[#293442]">
                      <tr>
                        <th className="p-3.5">Coach</th>
                        <th className="p-3.5">Sport</th>
                        <th className="p-3.5">Experience</th>
                        <th className="p-3.5">Qualifications</th>
                        <th className="p-3.5">Rating</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#293442]">
                      {coaches.filter(c => myAcademyIds.includes(c.academyId)).map((coach) => (
                        <tr key={coach.id} className="hover:bg-[#1B2530]/50 transition-colors">
                          <td className="p-3.5 font-bold text-white flex items-center gap-2.5">
                            <img src={coach.photo} alt={coach.name} className="w-8 h-8 rounded-full object-cover" />
                            <span>{coach.name}</span>
                          </td>
                          <td className="p-3.5">{coach.sport}</td>
                          <td className="p-3.5">{coach.experienceYears} Years</td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <span>{coach.qualifications[0]}</span>
                              {coach.qualificationsVerified ? (
                                <span className="text-[10px] font-bold text-emerald-400" title="Verified Credential">✓</span>
                              ) : (
                                <span className="text-[10px] font-mono text-gray-500" title="Profile Claim (Unverified)">?</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 font-bold text-white">★ {coach.rating}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              coach.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-400'
                            }`}>
                              {coach.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => toggleCoachStatus(coach.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#1B2530] text-gray-300 border border-[#293442] hover:text-white"
                            >
                              {coach.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: Programmes & Batches */}
            {ownerActiveTab === 'programmes' && (
              <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Programmes & Batch Capacity</h3>
                    <p className="text-xs text-gray-400">Review enrolled student counts, configure batches, and detect time clashes</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddBatchOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#1B2530] border border-[#293442] text-white text-xs font-bold hover:bg-[#222f3d]"
                    >
                      + Create Batch
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddProgrammeOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#B6FF3B] text-black text-xs font-bold"
                    >
                      + Create Programme
                    </button>
                  </div>
                </div>

                {/* Batches Table with Capacity & Seats */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#0B0F14] text-gray-400 uppercase font-mono text-[11px] border-b border-[#293442]">
                      <tr>
                        <th className="p-3.5">Batch</th>
                        <th className="p-3.5">Programme</th>
                        <th className="p-3.5">Coach</th>
                        <th className="p-3.5">Days</th>
                        <th className="p-3.5">Time</th>
                        <th className="p-3.5">Capacity</th>
                        <th className="p-3.5">Enrolled</th>
                        <th className="p-3.5">Available Seats</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#293442]">
                      {ownerBatches.map((b) => {
                        const free = Math.max(0, b.capacity - b.enrolledCount);
                        const isFull = free === 0;
                        const prog = programmes.find(p => p.id === b.programmeId);

                        return (
                          <tr key={b.id} className="hover:bg-[#1B2530]/50 transition-colors">
                            <td className="p-3.5 font-bold text-white">{b.name}</td>
                            <td className="p-3.5 text-gray-300">{prog?.name || 'Programme'}</td>
                            <td className="p-3.5">{b.coachName}</td>
                            <td className="p-3.5">{b.days.join(', ')}</td>
                            <td className="p-3.5 font-mono">{b.startTime} - {b.endTime}</td>
                            <td className="p-3.5 font-mono">{b.capacity}</td>
                            <td className="p-3.5 font-mono font-bold text-white">{b.enrolledCount}</td>
                            <td className="p-3.5">
                              {isFull ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                                  Full (0 Left)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#B6FF3B]/15 text-[#B6FF3B] border border-[#B6FF3B]/30 font-mono">
                                  {free} Available
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => setAttendanceModalBatch(b)}
                                className="px-2.5 py-1 rounded-lg bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40 text-xs font-semibold hover:bg-[#00D4FF]/30"
                              >
                                Take Attendance
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

            {/* TAB 4: Student Enrolments */}
            {ownerActiveTab === 'enrolments' && (
              <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Student Enrolment Applications</h3>
                    <p className="text-xs text-gray-400">Review admission requests, enforce batch capacity, or place applicants on the waitlist</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#0B0F14] text-gray-400 uppercase font-mono text-[11px] border-b border-[#293442]">
                      <tr>
                        <th className="p-3.5">Student</th>
                        <th className="p-3.5">Programme</th>
                        <th className="p-3.5">Batch</th>
                        <th className="p-3.5">Submitted</th>
                        <th className="p-3.5">Payment</th>
                        <th className="p-3.5">Enrolment Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#293442]">
                      {ownerEnrolments.map((enr) => (
                        <tr key={enr.id} className="hover:bg-[#1B2530]/50 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-white">{enr.athleteName}</div>
                            <div className="text-[11px] text-gray-400">Age: {enr.athleteAge} • {enr.athletePhone}</div>
                          </td>
                          <td className="p-3.5 text-gray-200">{enr.programmeName}</td>
                          <td className="p-3.5 text-gray-400">{enr.batchName}</td>
                          <td className="p-3.5 font-mono">{enr.submittedOn}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              enr.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {enr.paymentStatus}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              enr.enrolmentStatus === 'Active' || enr.enrolmentStatus === 'Approved' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                              enr.enrolmentStatus === 'Waitlisted' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' :
                              enr.enrolmentStatus === 'Rejected' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                              'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            }`}>
                              {enr.enrolmentStatus}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            {enr.enrolmentStatus === 'Pending Approval' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => updateEnrolmentStatus(enr.id, 'Approved')}
                                  className="px-2.5 py-1 rounded-lg bg-[#B6FF3B] text-black font-bold text-xs"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectItemModal({ type: 'enrolment', id: enr.id, name: enr.athleteName })}
                                  className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {enr.enrolmentStatus === 'Waitlisted' && (
                              <button
                                type="button"
                                onClick={() => updateEnrolmentStatus(enr.id, 'Approved')}
                                className="px-2.5 py-1 rounded-lg bg-[#00D4FF] text-black font-bold text-xs"
                              >
                                Move to Batch
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: Trial Bookings */}
            {ownerActiveTab === 'trials' && (
              <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Trial Session Bookings</h3>
                    <p className="text-xs text-gray-400">Confirm prospective student trial appointments and track attendance</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#0B0F14] text-gray-400 uppercase font-mono text-[11px] border-b border-[#293442]">
                      <tr>
                        <th className="p-3.5">Booking ID</th>
                        <th className="p-3.5">Athlete</th>
                        <th className="p-3.5">Programme</th>
                        <th className="p-3.5">Coach</th>
                        <th className="p-3.5">Date & Time</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#293442]">
                      {ownerTrials.map((tb) => (
                        <tr key={tb.id} className="hover:bg-[#1B2530]/50 transition-colors">
                          <td className="p-3.5 font-mono text-gray-400">{tb.id}</td>
                          <td className="p-3.5">
                            <div className="font-bold text-white">{tb.athleteName}</div>
                            <div className="text-[11px] text-gray-400">{tb.athletePhone}</div>
                          </td>
                          <td className="p-3.5 text-gray-200">{tb.programmeName}</td>
                          <td className="p-3.5 text-gray-400">{tb.coachName}</td>
                          <td className="p-3.5 font-mono">{tb.date} ({tb.time})</td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              tb.status === 'Confirmed' ? 'bg-[#B6FF3B]/15 text-[#B6FF3B] border-[#B6FF3B]/30' :
                              tb.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                              tb.status === 'Cancelled' || tb.status === 'Rejected' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                              'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            }`}>
                              {tb.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            {tb.status === 'Pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => updateTrialStatus(tb.id, 'Confirmed')}
                                  className="px-2.5 py-1 rounded-lg bg-[#B6FF3B] text-black font-bold text-xs"
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectItemModal({ type: 'trial', id: tb.id, name: tb.athleteName })}
                                  className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            {tb.status === 'Confirmed' && (
                              <button
                                type="button"
                                onClick={() => updateTrialStatus(tb.id, 'Completed')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-bold text-xs"
                              >
                                Mark Completed
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: Attendance Tracking */}
            {ownerActiveTab === 'attendance' && (
              <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Student Attendance Records</h3>
                    <p className="text-xs text-gray-400">Review past training attendance logs and confidential internal coaching notes</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ownerBatches.map((b) => (
                    <div key={b.id} className="p-4 bg-[#0B0F14] border border-[#293442] rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-sm">{b.name}</div>
                        <div className="text-xs text-gray-400">{b.days.join(', ')} • {b.startTime} - {b.endTime}</div>
                        <div className="text-[11px] text-[#00D4FF] mt-1 font-mono">{b.enrolledCount} Students Enrolled</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttendanceModalBatch(b)}
                        className="px-3 py-1.5 rounded-xl bg-[#00D4FF] text-black font-bold text-xs hover:bg-[#00c2e6]"
                      >
                        Take Attendance
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: Fees & Payments */}
            {ownerActiveTab === 'payments' && (
              <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Fees & Payment Tracking</h3>
                    <p className="text-xs text-gray-400">Track paid and outstanding monthly fees (Demo financial records)</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#0B0F14] text-gray-400 uppercase font-mono text-[11px] border-b border-[#293442]">
                      <tr>
                        <th className="p-3.5">Transaction Ref</th>
                        <th className="p-3.5">Student</th>
                        <th className="p-3.5">Programme</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5">Due Date</th>
                        <th className="p-3.5">Payment Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#293442]">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-[#1B2530]/50 transition-colors">
                          <td className="p-3.5 font-mono text-[#00D4FF]">{p.refId || p.id}</td>
                          <td className="p-3.5 font-bold text-white">{p.studentName}</td>
                          <td className="p-3.5 text-gray-300">{p.programmeName}</td>
                          <td className="p-3.5 font-bold text-white">₹{p.amount.toLocaleString('en-IN')}</td>
                          <td className="p-3.5 font-mono">{p.dueDate}</td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              p.status === 'Paid' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                              p.status === 'Refunded' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' :
                              'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            {p.status !== 'Paid' && (
                              <button
                                type="button"
                                onClick={() => recordPayment(p.id, 'Paid')}
                                className="px-2.5 py-1 rounded-lg bg-[#B6FF3B] text-black font-bold text-xs"
                              >
                                Mark Paid
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 8: Owner Analytics */}
            {ownerActiveTab === 'analytics' && (
              <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 space-y-6 shadow-xl">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#B6FF3B]" />
                    Academy Performance Analytics (Simulated Demo Data)
                  </h3>
                  <p className="text-xs text-gray-400">Key metrics on student growth, batch utilisation, and trial conversion rates</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-[#0B0F14] border border-[#293442] rounded-xl space-y-1">
                    <span className="text-xs text-gray-400 font-semibold">Trial-to-Enrolment Conversion</span>
                    <div className="text-2xl font-extrabold text-[#B6FF3B]">68%</div>
                    <span className="text-[10px] text-gray-500">Above Pune regional average (54%)</span>
                  </div>

                  <div className="p-4 bg-[#0B0F14] border border-[#293442] rounded-xl space-y-1">
                    <span className="text-xs text-gray-400 font-semibold">Batch Seat Utilisation</span>
                    <div className="text-2xl font-extrabold text-[#00D4FF]">
                      {totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0}%
                    </div>
                    <span className="text-[10px] text-gray-500">{totalEnrolled} active of {totalCapacity} seats</span>
                  </div>

                  <div className="p-4 bg-[#0B0F14] border border-[#293442] rounded-xl space-y-1">
                    <span className="text-xs text-gray-400 font-semibold">Average Attendance Rate</span>
                    <div className="text-2xl font-extrabold text-white">92.4%</div>
                    <span className="text-[10px] text-gray-500">Last 30 days sessions</span>
                  </div>

                  <div className="p-4 bg-[#0B0F14] border border-[#293442] rounded-xl space-y-1">
                    <span className="text-xs text-gray-400 font-semibold">Student Satisfaction Rating</span>
                    <div className="text-2xl font-extrabold text-amber-400">4.9 / 5.0</div>
                    <span className="text-[10px] text-gray-500">Based on 148 verified reviews</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODALS SECTION                                                           */}
        {/* ========================================================================= */}

        {/* 1. Book Trial Modal */}
        {modalTrialAcademy && (
          <BookTrialModal
            academy={modalTrialAcademy}
            onClose={() => setModalTrialAcademy(null)}
          />
        )}

        {/* 2. Enrolment Modal */}
        {modalEnrolAcademy && (
          <EnrolmentModal
            academy={modalEnrolAcademy}
            onClose={() => setModalEnrolAcademy(null)}
          />
        )}

        {/* 3. Add Academy Modal */}
        {isAddAcademyOpen && (
          <AddAcademyModal
            onClose={() => setIsAddAcademyOpen(false)}
          />
        )}

        {/* 4. Add Programme Modal */}
        {isAddProgrammeOpen && ownerAcademies.length > 0 && (
          <AddProgrammeModal
            academy={ownerAcademies[0]}
            onClose={() => setIsAddProgrammeOpen(false)}
          />
        )}

        {/* 5. Add Batch Modal */}
        {isAddBatchOpen && ownerAcademies.length > 0 && (
          <AddBatchModal
            academy={ownerAcademies[0]}
            onClose={() => setIsAddBatchOpen(false)}
          />
        )}

        {/* 6. Attendance Modal */}
        {attendanceModalBatch && (
          <AttendanceModal
            academy={academies.find(a => a.id === attendanceModalBatch.academyId) || ownerAcademies[0]}
            batch={attendanceModalBatch}
            onClose={() => setAttendanceModalBatch(null)}
          />
        )}

        {/* 7. Rejection Reason Modal */}
        {rejectItemModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#141B24] border border-[#293442] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#293442] pb-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  Decline Application
                </h3>
                <button onClick={() => setRejectItemModal(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-gray-300">
                  Please provide feedback to <strong className="text-white">{rejectItemModal.name}</strong> explaining why this request cannot be accepted (e.g. age eligibility, lack of equipment, or trial slot booked out).
                </p>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter rejection reason..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-white focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectItemModal(null)}
                  className="px-4 py-2 rounded-xl bg-[#1B2530] text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!rejectReason.trim()}
                  onClick={handleConfirmReject}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 disabled:opacity-50"
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
