import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  Clock, 
  Swords, 
  Star, 
  GraduationCap, 
  MapPin, 
  ChevronRight, 
  X, 
  PlusCircle,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useFriendlies } from '../../context/FriendliesContext';
import FriendliesHeader from '../../components/friendlies/FriendliesHeader';
import FriendliesRoleSwitcher from '../../components/friendlies/FriendliesRoleSwitcher';

export default function TeamsDirectory() {
  const { teams, colleges, collegesMap, activeRole, activeUser, toggleFollowTeam, checkPermission } = useFriendlies();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [activeModalRoster, setActiveModalRoster] = useState(null);

  const sportsList = ['All', 'Football', 'Cricket', 'Basketball', 'Badminton', 'Volleyball'];

  // Filtered teams
  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      if (selectedSport !== 'All' && team.sport.toLowerCase() !== selectedSport.toLowerCase()) return false;
      if (selectedCollege !== 'All' && team.collegeId !== selectedCollege) return false;
      if (verifiedOnly && team.status?.toLowerCase() !== 'verified') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = team.name.toLowerCase().includes(q);
        const matchesSport = team.sport.toLowerCase().includes(q);
        const colObj = collegesMap?.[team.collegeId] || (Array.isArray(colleges) ? colleges.find(c => c.id === team.collegeId) : null);
        const matchesCollege = (colObj?.name || team.collegeName || '').toLowerCase().includes(q);
        const matchesCaptain = (team.captainName || team.captain?.name || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSport && !matchesCollege && !matchesCaptain) return false;
      }
      return true;
    });
  }, [teams, selectedSport, selectedCollege, verifiedOnly, searchQuery, colleges, collegesMap]);

  const canChallenge = typeof checkPermission === 'function' ? checkPermission('canSendInvitations') : false;

  return (
    <div className="min-h-screen bg-transparent text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header and Role Switcher */}
        <FriendliesHeader />
        <FriendliesRoleSwitcher />

        {/* Directory Banner & Sub-Nav */}
        <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_12px_40px_rgba(14,165,233,0.12)]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <Users className="w-4 h-4" />
              <span>Inter-Collegiate Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Registered College Squads
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Browse verified college teams, view official squad rosters, follow match schedules, and initiate friendly match challenges.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/friendlies/register-team"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-bold text-sm shadow-[0_4px_20px_rgba(14,165,233,0.35)] hover:shadow-[0_4px_28px_rgba(14,165,233,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Register Squad
            </Link>
            <Link
              to="/friendlies"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 text-sky-200 border border-sky-400/30 font-semibold text-sm hover:text-white hover:bg-sky-500/20 transition-all"
            >
              Browse Matches
            </Link>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by team, college, captain, or sport..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#070d1a]/80 border border-sky-500/30 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sport Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full bg-[#070d1a]/80 border border-sky-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-all"
              >
                {sportsList.map(sport => (
                  <option key={sport} value={sport} className="bg-[#0c1629] text-white">{sport === 'All' ? 'All Sports' : sport}</option>
                ))}
              </select>
            </div>

            {/* College Filter */}
            <div className="md:col-span-4">
              <select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="w-full bg-[#070d1a]/80 border border-sky-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-all"
              >
                <option value="All" className="bg-[#0c1629] text-white">All Colleges / Universities</option>
                {(Array.isArray(colleges) ? colleges : Object.values(colleges || {})).map(c => (
                  <option key={c.id} value={c.id} className="bg-[#0c1629] text-white">{c.name} ({c.city})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-sky-500/20 text-xs">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-sky-500/40 bg-[#070d1a] text-sky-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>Verified by Coordinator only</span>
              </label>
            </div>

            <div className="text-slate-400 font-mono">
              Showing <span className="text-sky-300 font-semibold">{filteredTeams.length}</span> squads
            </div>
          </div>
        </div>

        {/* Squad Cards Grid */}
        {filteredTeams.length === 0 ? (
          <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-12 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No College Teams Found</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                No registered squads match your active filters. Try resetting your search or register your college squad today.
              </p>
            </div>
            <button
              onClick={() => { setSelectedSport('All'); setSelectedCollege('All'); setSearchQuery(''); setVerifiedOnly(false); }}
              className="px-4 py-2 rounded-xl bg-sky-500/10 text-sky-200 border border-sky-400/30 hover:text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map(team => {
              const college = collegesMap?.[team.collegeId] || (Array.isArray(colleges) ? colleges.find(c => c.id === team.collegeId) : null) || { name: team.collegeName || 'Unknown College', city: 'Pune' };
              const isFollowed = (activeUser?.followedTeamIds || []).includes(team.id);

              return (
                <div 
                  key={team.id}
                  className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 flex flex-col justify-between hover:border-sky-400/50 hover:shadow-[0_12px_36px_rgba(14,165,233,0.15)] transition-all group"
                >
                  <div className="space-y-4">
                    {/* Header: Logo, Name, Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center font-['Barlow_Condensed'] font-black text-base text-slate-100 shrink-0 bg-gradient-to-br from-[#182235] via-[#0f1726] to-[#080d18] border border-sky-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.6)] relative overflow-hidden group-hover:border-sky-400/50 transition-colors"
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-transparent pointer-events-none" />
                          <span className="relative z-10 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                            {team.initials || team.name.slice(0, 3).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-white group-hover:text-sky-300 transition-colors leading-snug">
                            {team.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate max-w-[170px]" title={college.name}>{college.name}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Tag */}
                      {team.status?.toLowerCase() === 'verified' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-300 border border-sky-400/40 shrink-0">
                          <ShieldCheck className="w-3 h-3 text-sky-400" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                          <Clock className="w-3 h-3" />
                          Unverified
                        </span>
                      )}
                    </div>

                    {/* Metadata & Stats */}
                    <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-[#070d1a]/80 rounded-xl border border-sky-500/20 text-center">
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Sport</div>
                        <div className="text-xs font-bold text-white mt-0.5">{team.sport}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Squad</div>
                        <div className="text-xs font-bold text-sky-300 mt-0.5">{team.roster?.length || 0} Players</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Record</div>
                        <div className="text-xs font-bold text-emerald-400 mt-0.5">
                          {team.stats?.wins || 0}W - {team.stats?.losses || 0}L
                        </div>
                      </div>
                    </div>

                    {/* Captain & City */}
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Captain:</span>
                        <span className="text-white font-medium">{team.captainName || team.captain?.name || 'Squad Captain'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Location:</span>
                        <span className="text-slate-300 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-sky-400" />
                          {college.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-5 mt-4 border-t border-sky-500/20 flex items-center gap-2">
                    <button
                      onClick={() => setActiveModalRoster(team)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-500/10 text-sky-200 border border-sky-400/30 hover:bg-sky-500/20 hover:text-white transition-all text-xs font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                      View Roster
                    </button>

                    {canChallenge ? (
                      <button
                        onClick={() => navigate(`/friendlies/challenge?opponentTeamId=${team.id}`)}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs shadow-md shadow-sky-600/30 hover:from-sky-400 hover:to-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        title="Propose a friendly match challenge"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        Challenge
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleFollowTeam(team.id)}
                        className={`inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl border text-xs font-semibold transition-all ${
                          isFollowed 
                            ? 'bg-sky-500/15 text-sky-300 border-sky-400/40' 
                            : 'bg-sky-500/10 text-slate-300 border-sky-500/20 hover:text-white hover:bg-sky-500/20'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isFollowed ? 'fill-sky-400 text-sky-400' : 'text-slate-400'}`} />
                        {isFollowed ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Squad Roster Modal */}
        {activeModalRoster && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0c1629] border border-sky-500/30 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="p-6 border-b border-sky-500/20 flex items-center justify-between bg-[#070d1a]/80">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-['Barlow_Condensed'] font-black text-sm text-slate-100 shrink-0 bg-gradient-to-br from-[#182235] via-[#0f1726] to-[#080d18] border border-sky-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_10px_rgba(0,0,0,0.5)] relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-transparent pointer-events-none" />
                    <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {activeModalRoster.initials || 'SQD'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      {activeModalRoster.name}
                      {activeModalRoster.status === 'verified' && (
                        <ShieldCheck className="w-4 h-4 text-sky-400" />
                      )}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {colleges[activeModalRoster.collegeId]?.name} • {activeModalRoster.sport}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModalRoster(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-sky-500/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5">
                {/* Captain Card */}
                <div className="bg-[#070d1a]/90 border border-sky-500/30 rounded-xl p-4 flex items-center justify-between shadow-inner">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Squad Captain</div>
                    <div className="text-sm font-bold text-white mt-0.5">{activeModalRoster.captainName || activeModalRoster.captain?.name || 'Squad Captain'}</div>
                    <div className="text-xs text-slate-400">Class of 2026 • Verified Student</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] px-2.5 py-1 rounded bg-sky-500/15 text-sky-200 border border-sky-400/30 font-mono">
                      Jersey #{activeModalRoster.captainJersey || activeModalRoster.captain?.jerseyNumber || '10'}
                    </span>
                  </div>
                </div>

                {/* Players Table */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                    <span>Registered Players ({activeModalRoster.roster?.length || 0})</span>
                    <span className="text-[11px] text-slate-500 font-normal">Student verification on file</span>
                  </h4>

                  <div className="bg-[#070d1a]/80 border border-sky-500/20 rounded-xl overflow-hidden divide-y divide-sky-500/20">
                    {(activeModalRoster.roster || []).map((player, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-sky-500/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-6 text-center font-mono font-bold text-sky-400/70">
                            {player.jerseyNumber || idx + 1}
                          </span>
                          <div>
                            <div className="font-semibold text-white">{player.name}</div>
                            <div className="text-[11px] text-slate-400">{player.position || 'Player'}</div>
                          </div>
                        </div>
                        <div className="text-right text-slate-400">
                          <span className="text-[11px] bg-sky-500/15 text-sky-200 border border-sky-400/20 px-2 py-0.5 rounded">
                            {player.role || 'Regular'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-sky-500/20 bg-[#0c1629] flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Data confirmed by College Sports Department
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveModalRoster(null)}
                    className="px-4 py-2 rounded-xl bg-sky-500/10 text-sky-200 border border-sky-400/30 text-xs font-semibold hover:text-white hover:bg-sky-500/20 transition-all"
                  >
                    Close
                  </button>
                  {canChallenge && (
                    <button
                      onClick={() => {
                        const targetId = activeModalRoster.id;
                        setActiveModalRoster(null);
                        navigate(`/friendlies/challenge?opponentTeamId=${targetId}`);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-600/30 transition-all"
                    >
                      Challenge This Squad
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
