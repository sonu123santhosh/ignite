import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  Sparkles,
  Flame,
  GraduationCap,
  Gift,
  PlusCircle,
  Users,
  CalendarCheck,
  ChevronRight
} from 'lucide-react';
import TournamentRoleSwitcher from '../components/tournaments/TournamentRoleSwitcher';
import DemoToolsModal from '../components/tournaments/DemoToolsModal';
import NotificationDrawer from '../components/tournaments/NotificationDrawer';
import TournamentCard from '../components/tournaments/TournamentCard';
import TournamentFilterPanel from '../components/tournaments/TournamentFilterPanel';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import {
  filterTournaments,
  sortTournaments,
  daysUntil
} from '../data/tournamentsData';

export default function Tournaments({
  tournamentRole = 'player',
  setTournamentRole,
  currentDemoUser,
  setCurrentDemoUser,
  sharedTournamentsState,
  setSharedTournamentsState
}) {
  const navigate = useNavigate();

  // Search & Filters state
  const [keyword, setKeyword] = useState('');
  const [activeCollection, setActiveCollection] = useState('all');
  const [filters, setFilters] = useState({
    sport: 'all',
    city: '',
    participationType: 'all',
    maxFee: '',
    freeOnly: false,
    minPrize: '',
    collegeOnly: false,
    status: 'all'
  });

  const [sortKey, setSortKey] = useState('starting_soon');
  const [viewMode, setViewMode] = useState('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Modals & Drawers
  const [isDemoToolsOpen, setIsDemoToolsOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.title = 'Tournaments & Leagues | SportLink';
  }, []);

  const showToast = ({ title, message, type = 'info' }) => {
    setToast({ title, message, type });
  };

  // Filter change handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setKeyword('');
    setActiveCollection('all');
    setFilters({
      sport: 'all',
      city: '',
      participationType: 'all',
      maxFee: '',
      freeOnly: false,
      minPrize: '',
      collegeOnly: false,
      status: 'all'
    });
  };

  // Collection shortcut click
  const handleCollectionClick = (colId) => {
    setActiveCollection(colId);
    if (colId === 'all') {
      handleResetFilters();
    } else if (colId === 'closing_soon') {
      setFilters((prev) => ({ ...prev, status: 'closing_soon' }));
    } else if (colId === 'college') {
      setFilters((prev) => ({ ...prev, collegeOnly: true }));
    } else if (colId === 'free') {
      setFilters((prev) => ({ ...prev, freeOnly: true }));
    } else if (colId === 'prize_pool') {
      setFilters((prev) => ({ ...prev, minPrize: '20000' }));
    } else if (colId === 'open') {
      setFilters((prev) => ({ ...prev, status: 'Registration Open' }));
    }
  };

  // Compute filtered & sorted tournaments
  const filteredList = useMemo(() => {
    const combinedFilters = {
      ...filters,
      keyword
    };
    const list = filterTournaments(sharedTournamentsState.tournaments || [], combinedFilters);
    return sortTournaments(list, sortKey);
  }, [sharedTournamentsState.tournaments, filters, keyword, sortKey]);

  // Active filter chips list for quick deletion
  const activeChips = useMemo(() => {
    const chips = [];
    if (keyword.trim()) chips.push({ key: 'keyword', label: `Search: "${keyword}"` });
    if (filters.sport && filters.sport !== 'all') chips.push({ key: 'sport', label: `Sport: ${filters.sport}` });
    if (filters.city.trim()) chips.push({ key: 'city', label: `City: ${filters.city}` });
    if (filters.participationType && filters.participationType !== 'all') chips.push({ key: 'participationType', label: `Type: ${filters.participationType}` });
    if (filters.maxFee) chips.push({ key: 'maxFee', label: `Max Fee: ₹${Number(filters.maxFee).toLocaleString('en-IN')}` });
    if (filters.freeOnly) chips.push({ key: 'freeOnly', label: 'Free Entry' });
    if (filters.minPrize) chips.push({ key: 'minPrize', label: `Min Prize: ₹${Number(filters.minPrize).toLocaleString('en-IN')}` });
    if (filters.collegeOnly) chips.push({ key: 'collegeOnly', label: 'College Only' });
    if (filters.status && filters.status !== 'all') chips.push({ key: 'status', label: `Status: ${filters.status}` });
    return chips;
  }, [keyword, filters]);

  const removeChip = (key) => {
    if (key === 'keyword') setKeyword('');
    else if (key === 'sport') handleFilterChange('sport', 'all');
    else if (key === 'city') handleFilterChange('city', '');
    else if (key === 'participationType') handleFilterChange('participationType', 'all');
    else if (key === 'maxFee') handleFilterChange('maxFee', '');
    else if (key === 'freeOnly') handleFilterChange('freeOnly', false);
    else if (key === 'minPrize') handleFilterChange('minPrize', '');
    else if (key === 'collegeOnly') handleFilterChange('collegeOnly', false);
    else if (key === 'status') handleFilterChange('status', 'all');
  };

  // Demo simulation triggers
  const handleSimulateAcceptInvite = () => {
    setSharedTournamentsState((prev) => {
      const updatedTeams = prev.teams.map((team) => {
        if (team.id === 'team-1') {
          return {
            ...team,
            members: team.members.map((m) =>
              m.id === 'm-9' ? { ...m, invitationStatus: 'Joined' } : m
            )
          };
        }
        return team;
      });
      return { ...prev, teams: updatedTeams };
    });
  };

  const handleSimulateDeadlinePass = () => {
    setSharedTournamentsState((prev) => {
      const updatedTournaments = prev.tournaments.map((t) => {
        if (t.id === 'tourn-1') {
          const pastDate = new Date();
          pastDate.setDate(pastDate.getDate() - 1);
          return {
            ...t,
            registrationDeadline: pastDate.toISOString(),
            status: 'Registration Closed'
          };
        }
        return t;
      });
      return { ...prev, tournaments: updatedTournaments };
    });
  };

  const handleSimulateFillCapacity = () => {
    setSharedTournamentsState((prev) => {
      const updatedTournaments = prev.tournaments.map((t) => {
        if (t.id === 'tourn-1') {
          return {
            ...t,
            capacity: 4 // Since 4 registrations are already approved
          };
        }
        return t;
      });
      return { ...prev, tournaments: updatedTournaments };
    });
  };

  const unreadNotifCount = (sharedTournamentsState.notifications || []).filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-transparent text-[#F5F7FA] pb-24">
      {/* Toast notifications */}
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Banner Notice */}
      <div className="bg-[#141B24]/90 border-b border-[#293442] py-2 px-4 text-center text-xs text-[#94A3B8]">
        <span className="font-bold text-[#E5C378]">PROTOTYPE DEMO:</span> All tournaments, prizes, and registrations are simulated sample data. No real fees or payments taken.
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Role Switcher & Persona Bar */}
        <TournamentRoleSwitcher
          currentRole={tournamentRole}
          onRoleChange={setTournamentRole}
          currentUser={currentDemoUser}
          unreadCount={unreadNotifCount}
          onOpenNotifications={() => setIsNotifDrawerOpen(true)}
          onOpenDemoTools={() => setIsDemoToolsOpen(true)}
        />

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#141B24]/95 via-[#1B2530]/90 to-[#141B24]/95 border border-[#293442] p-6 sm:p-10 mb-8 shadow-2xl backdrop-blur-md">
          <div className="max-w-3xl space-y-4">
            <h1 className="font-['Barlow_Condensed'] text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
              Compete. Challenge. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E5C378] via-[#F6E7B0] to-[#D4AF37]">
                Become a Champion.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300/90 max-w-2xl leading-relaxed">
              Discover tournaments, register your team, and take your game to the next level. Live brackets, automated schedules, and verified organisers across all major sports.
            </p>

            {/* Quick Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const target = document.getElementById('tournaments-listing');
                  target?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C378] to-[#C59B27] hover:brightness-110 text-[#0F141C] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-[0_4px_16px_rgba(212,175,55,0.25)]"
              >
                Explore Tournaments
              </button>

              <Link
                to="/tournaments/my-registrations"
                className="px-4 py-2.5 rounded-xl bg-[#1B2530] hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-[#293442] transition-all flex items-center gap-1.5"
              >
                <CalendarCheck className="w-4 h-4 text-sky-300" />
                <span>My Registrations</span>
              </Link>

              {/* Your League Hub - Custom Round-Robin Leagues */}
              <Link
                to="/tournaments/your-league"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c6ff3d]/15 to-emerald-400/15 hover:from-[#c6ff3d]/25 hover:to-emerald-400/25 text-[#c6ff3d] font-bold text-xs sm:text-sm border border-[#c6ff3d]/35 transition-all flex items-center gap-1.5 shadow-[0_2px_10px_rgba(198,255,61,0.15)]"
              >
                <Trophy className="w-4 h-4 text-[#c6ff3d]" />
                <span>Your League</span>
              </Link>

              {/* Show Team Captain squad button if Captain or Organiser */}
              {(tournamentRole === 'captain' || tournamentRole === 'organiser') && (
                <Link
                  to="/tournaments/teams"
                  className="px-4 py-2.5 rounded-xl bg-[#1B2530] hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-[#293442] transition-all flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4 text-[#E5C378]" />
                  <span>My Teams</span>
                </Link>
              )}

              {/* Show Organiser Create button ONLY if Organiser */}
              {tournamentRole === 'organiser' && (
                <Link
                  to="/tournaments/organiser"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-[#0B0F14] font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Organiser Dashboard</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Search & Quick Filter Chips */}
        <div id="tournaments-listing" className="space-y-4 mb-8">
          {/* Main Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search tournaments, sports, cities, or organisers..."
              className="w-full pl-12 pr-4 py-3 bg-[#141B24]/90 border border-[#293442] focus:border-[#D4AF37] rounded-2xl text-sm text-white placeholder-slate-500 outline-none transition-colors shadow-lg backdrop-blur-sm"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Collection Shortcuts Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: 'All Events', icon: Sparkles },
              { id: 'closing_soon', label: 'Closing Soon', icon: Flame },
              { id: 'college', label: 'College Cups', icon: GraduationCap },
              { id: 'free', label: 'Free Entry', icon: Gift },
              { id: 'prize_pool', label: 'Big Prize Pool (₹20k+)', icon: Trophy }
            ].map((col) => {
              const Icon = col.icon;
              const isActive = activeCollection === col.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => handleCollectionClick(col.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F141C] font-bold shadow-sm'
                      : 'bg-[#141B24]/90 text-slate-300 hover:text-white border border-[#293442]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{col.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Filter Chips Row */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-[#94A3B8]">Active filters:</span>
              {activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#1B2530] text-slate-200 border border-[#293442]"
                >
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={() => removeChip(chip.key)}
                    className="hover:text-red-400 cursor-pointer"
                    aria-label={`Remove filter ${chip.label}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-[#E5C378] hover:underline font-semibold cursor-pointer ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Main Body: Filter Sidebar + Listings Grid/List */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Desktop Filter Sidebar */}
          <TournamentFilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            isOpenOnMobile={isMobileFiltersOpen}
            onCloseMobile={() => setIsMobileFiltersOpen(false)}
            totalResults={filteredList.length}
          />

          {/* Right Column: Results Header + Cards */}
          <main className="flex-1 w-full min-w-0 space-y-6">
            {/* Controls Bar: Count, Sort, View Toggle, Mobile Filter Trigger */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141B24]/90 border border-[#293442] p-4 rounded-2xl shadow-md backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white">
                  Showing {filteredList.length} Tournament{filteredList.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Trigger */}
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2530] text-xs font-semibold text-slate-200 border border-[#293442] rounded-xl cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#E5C378]" />
                  <span>Filters</span>
                </button>

                {/* Sort Selector */}
                <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                  <span className="hidden sm:inline">Sort:</span>
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    className="bg-[#1B2530] border border-[#293442] rounded-xl px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-[#D4AF37]"
                  >
                    <option value="starting_soon">Starting Soon</option>
                    <option value="closing_soon">Closing Soon</option>
                    <option value="fee_low">Lowest Entry Fee</option>
                    <option value="prize_high">Highest Prize Pool</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>

                {/* Grid / List Mode */}
                <div className="inline-flex p-1 bg-[#0B0F14] border border-[#293442] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-[#1B2530] text-[#E5C378]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-[#1B2530] text-[#E5C378]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Listings Grid or List */}
            {filteredList.length === 0 ? (
              <EmptyState
                title="No tournaments matched your filters"
                message="Widen your entry fee range, remove active sport/status filters, or try another city."
                onClearFilters={handleResetFilters}
              />
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredList.map((t) => (
                  <TournamentCard
                    key={t.id}
                    tournament={t}
                    registrations={sharedTournamentsState.registrations}
                    viewMode="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredList.map((t) => (
                  <TournamentCard
                    key={t.id}
                    tournament={t}
                    registrations={sharedTournamentsState.registrations}
                    viewMode="list"
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Demo Tools Modal */}
      <DemoToolsModal
        isOpen={isDemoToolsOpen}
        onClose={() => setIsDemoToolsOpen(false)}
        currentUser={currentDemoUser}
        onSelectUser={setCurrentDemoUser}
        currentRole={tournamentRole}
        onRoleChange={setTournamentRole}
        onSimulateAcceptInvite={handleSimulateAcceptInvite}
        onSimulateDeadlinePass={handleSimulateDeadlinePass}
        onSimulateFillCapacity={handleSimulateFillCapacity}
        onShowToast={showToast}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={sharedTournamentsState.notifications}
        onMarkAllAsRead={() => {
          setSharedTournamentsState((prev) => ({
            ...prev,
            notifications: prev.notifications.map((n) => ({ ...n, read: true }))
          }));
        }}
        onMarkAsRead={(id) => {
          setSharedTournamentsState((prev) => ({
            ...prev,
            notifications: prev.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            )
          }));
        }}
      />
    </div>
  );
}
