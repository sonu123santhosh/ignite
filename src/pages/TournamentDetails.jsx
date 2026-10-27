import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  FileText,
  AlertCircle,
  Mail,
  Phone,
  CheckCircle2,
  Table,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import StatusBadge from '../components/tournaments/StatusBadge';
import { SportCourtSVG } from '../components/tournaments/TournamentCard';
import BracketView from '../components/tournaments/BracketView';
import StandingsTable from '../components/tournaments/StandingsTable';
import FixtureTable from '../components/tournaments/FixtureTable';
import ResultEntryModal from '../components/tournaments/ResultEntryModal';
import Toast from '../components/Toast';
import {
  formatDateDisplay,
  formatTimeDisplay,
  daysUntil,
  getDerivedLabels
} from '../data/tournamentsData';

export default function TournamentDetails({
  sharedTournamentsState,
  setSharedTournamentsState,
  tournamentRole = 'player',
  currentDemoUser
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'schedule' | 'standings' | 'rules'
  const [activeView, setActiveView] = useState('table'); // 'table' | 'bracket'
  const [selectedMatchForScoring, setSelectedMatchForScoring] = useState(null);
  const [toast, setToast] = useState(null);

  const tournament = sharedTournamentsState.tournaments.find((t) => t.id === id);

  useEffect(() => {
    if (tournament) {
      document.title = `${tournament.name} | SportLink Tournaments`;
    }
  }, [tournament]);

  if (!tournament) {
    return (
      <div className="py-20 text-center max-w-lg mx-auto px-4">
        <h2 className="font-['Barlow_Condensed'] text-3xl font-bold uppercase text-white mb-2">
          Tournament Not Found
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          The requested tournament listing does not exist or has been removed.
        </p>
        <Link
          to="/tournaments"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F141C] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tournaments</span>
        </Link>
      </div>
    );
  }

  const daysLeft = daysUntil(tournament.registrationDeadline);
  const isRegOpen = tournament.status === 'Registration Open' && daysLeft >= 0;
  const derivedLabels = getDerivedLabels(tournament, sharedTournamentsState.registrations);

  // Active registrations count
  const approvedRegistrations = sharedTournamentsState.registrations.filter(
    (r) => r.tournamentId === tournament.id && (r.registrationStatus === 'Approved' || r.registrationStatus === 'Submitted')
  );

  const isOrganiserOfThisTournament =
    tournamentRole === 'organiser' && tournament.organiserId === currentDemoUser?.id;

  // Format descriptive explanation
  const getFormatExplanation = () => {
    switch (tournament.format) {
      case 'single_elimination':
        return {
          title: 'Single-Elimination Knockout Format',
          description:
            'Teams are seeded into a direct bracket draw. Winning a match advances the squad to the subsequent round, while losing teams are eliminated. In the event of a tie at full time, match will be settled via penalty kicks / tiebreak.'
        };
      case 'round_robin':
      case 'league':
        return {
          title: 'Round-Robin League Format',
          description:
            'Every team plays every other team once. Points are awarded: 3 for a win, 1 for a draw, and 0 for a loss. Final standings are calculated via Points, followed by Head-to-Head and Goal/Score Difference.'
        };
      case 'group_knockout':
        return {
          title: 'Group Stage + Knockout Stage',
          description:
            'Entrants are split into round-robin groups. The top 2 squads from each group qualify for the semi-final elimination bracket.'
        };
      case 'individual':
        return {
          title: 'Individual Seeded Draw',
          description:
            'Singles knockout draw seeded by ranking. Matches are best-of-3 sets. Winners advance to the championship podium.'
        };
      default:
        return {
          title: 'Championship Format',
          description: 'Official tournament structure and regulations governed by the organising body.'
        };
    }
  };

  const formatExpl = getFormatExplanation();

  // Save result handler (if organiser edits/enters score)
  const handleSaveResult = (matchId, result) => {
    setSharedTournamentsState((prev) => {
      const updatedTournaments = prev.tournaments.map((t) => {
        if (t.id === tournament.id) {
          const updatedFixtures = (t.fixtures || []).map((m) => {
            if (m.id === matchId) {
              return {
                ...m,
                status: 'Completed',
                result
              };
            }
            return m;
          });

          // If knockout, auto advance winner to subsequent match!
          if (t.format === 'single_elimination' && result.winnerId) {
            const currentMatch = updatedFixtures.find((m) => m.id === matchId);
            if (currentMatch && currentMatch.roundIndex) {
              const nextRoundIndex = currentMatch.roundIndex + 1;
              const nextMatchNumber = Math.ceil(currentMatch.matchNumber / 2);

              const nextMatch = updatedFixtures.find(
                (m) => m.roundIndex === nextRoundIndex && m.matchNumber === nextMatchNumber
              );

              if (nextMatch) {
                const winnerTeamObj =
                  result.winnerId === currentMatch.teamA?.id
                    ? currentMatch.teamA
                    : currentMatch.teamB;

                if (currentMatch.matchNumber % 2 !== 0) {
                  nextMatch.teamA = { id: winnerTeamObj.id, name: winnerTeamObj.name };
                } else {
                  nextMatch.teamB = { id: winnerTeamObj.id, name: winnerTeamObj.name };
                }
              }
            }
          }

          return { ...t, fixtures: updatedFixtures, resultsPublished: true };
        }
        return t;
      });

      // Add in-app notification
      const newNotif = {
        id: `notif-${Date.now()}`,
        title: 'Match Result Finalised',
        message: `Results updated for ${tournament.name}. Standings and bracket recalculated.`,
        tournamentId: tournament.id,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'info',
        targetUserId: 'all'
      };

      return {
        ...prev,
        tournaments: updatedTournaments,
        notifications: [newNotif, ...(prev.notifications || [])]
      };
    });

    setToast({
      title: 'Result Finalised',
      message: 'Scores published. Standings and knockout brackets have been recomputed.',
      type: 'success'
    });
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F5F7FA] pb-24">
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-[#141B24]/90 border-b border-[#293442] py-3 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to="/tournaments"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#E5C378] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Tournaments</span>
          </Link>

          {isOrganiserOfThisTournament && (
            <Link
              to={`/tournaments/organiser/${tournament.id}`}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-[#0B0F14] font-bold text-xs hover:brightness-110 transition-colors shadow-sm"
            >
              Manage This Tournament
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">
        {/* Hero Banner Slot with Court SVG Schematic */}
        <div className="relative rounded-3xl overflow-hidden bg-[#141B24]/95 border border-[#293442] shadow-2xl backdrop-blur-md">
          <div className="h-48 sm:h-64 w-full relative">
            <SportCourtSVG sport={tournament.sport} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141B24] via-transparent to-black/40" />

            {/* Badges on top of banner */}
            <div className="absolute top-4 inset-x-4 sm:inset-x-6 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0B0F14]/90 text-white border border-[#293442]">
                  {tournament.sport}
                </span>
                <StatusBadge type="tournament" status={tournament.status} />
                {derivedLabels.map((lbl, idx) => (
                  <StatusBadge key={idx} derived={true} status={lbl.text} />
                ))}
              </div>

              <span className="px-2 py-0.5 rounded bg-black/70 text-slate-400 text-[11px] font-mono">
                Demo Listing
              </span>
            </div>
          </div>

          {/* Banner Bottom Header info */}
          <div className="p-6 sm:p-8 pt-2 sm:pt-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#94A3B8]">Organised by</span>
                  <span className="text-xs font-semibold text-white">{tournament.organiserName}</span>
                  {tournament.organiserVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Organiser</span>
                    </span>
                  )}
                </div>

                <h1 className="font-['Barlow_Condensed'] text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                  {tournament.name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-[#94A3B8]">
                  <span className="flex items-center gap-1.5 text-white">
                    <MapPin className="w-4 h-4 text-sky-300" />
                    <span>{tournament.venue}, {tournament.city}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-white">
                    <Calendar className="w-4 h-4 text-[#E5C378]" />
                    <span>{formatDateDisplay(tournament.startDate)} &ndash; {formatDateDisplay(tournament.endDate)}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-300" />
                    <span>
                      {approvedRegistrations.length} / {tournament.capacity} Spots Filled
                    </span>
                  </span>
                </div>
              </div>

              {/* Action Buttons & Entry Fee */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
                <div className="text-left sm:text-right">
                  <span className="text-xs text-[#94A3B8] block">Entry Fee</span>
                  <div className="font-['Barlow_Condensed'] text-3xl font-black text-[#E5C378] leading-none">
                    {tournament.entryFee === 0 ? 'FREE ENTRY' : `₹${tournament.entryFee.toLocaleString('en-IN')}`}
                    {tournament.entryFee > 0 && (
                      <span className="text-xs font-normal text-slate-400 ml-1 font-sans">
                        /{tournament.feeUnit === 'per player' ? 'player' : 'team'}
                      </span>
                    )}
                  </div>
                </div>

                {isRegOpen ? (
                  <Link
                    to={`/tournaments/${tournament.id}/register`}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C378] to-[#C59B27] hover:brightness-110 text-[#0F141C] font-black text-sm uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:scale-105"
                  >
                    <span>Register Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="px-6 py-3.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs uppercase tracking-wider cursor-not-allowed border border-slate-700"
                  >
                    {tournament.status}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#293442] overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview & Prizes' },
            { id: 'schedule', label: `Fixtures & Schedule (${tournament.fixtures?.length || 0})` },
            ...(tournament.format === 'round_robin' || tournament.format === 'league' || tournament.format === 'group_knockout'
              ? [{ id: 'standings', label: 'League Standings' }]
              : []),
            { id: 'rules', label: 'Rules & Eligibility' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#141B24] text-[#E5C378] border border-[#293442] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Overview & Prizes */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Format description card */}
              <div className="bg-[#141B24]/90 border border-[#293442] p-6 rounded-2xl space-y-2 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300">
                  <Sparkles className="w-4 h-4" />
                  <span>Competition Structure</span>
                </div>
                <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
                  {formatExpl.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {formatExpl.description}
                </p>
              </div>

              {/* Venue details */}
              <div className="bg-[#141B24]/90 border border-[#293442] p-6 rounded-2xl space-y-3 backdrop-blur-sm">
                <h3 className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white tracking-wide">
                  Venue &amp; Location
                </h3>
                <div className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                  <div className="font-semibold text-white">{tournament.venue}</div>
                  <div className="text-slate-400">{tournament.address}</div>
                </div>
              </div>

              {/* Prize Pool Breakdown Table */}
              {tournament.prizePool > 0 && (
                <div className="bg-[#141B24]/90 border border-[#293442] p-6 rounded-2xl space-y-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                        Prize Pool Breakdown
                      </h3>
                      <span className="text-xs text-[#94A3B8]">
                        Total Pool: ₹{tournament.prizePool.toLocaleString('en-IN')} (Demo figures)
                      </span>
                    </div>
                    <Trophy className="w-6 h-6 text-amber-300" />
                  </div>

                  <div className="overflow-hidden border border-[#293442] rounded-xl">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-[#1B2530] text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] border-b border-[#293442]">
                        <tr>
                          <th className="py-2.5 px-4">Standing / Rank</th>
                          <th className="py-2.5 px-4">Award Amount</th>
                          <th className="py-2.5 px-4 text-right">Trophy / Medal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#293442]/60">
                        {tournament.prizeDistribution?.map((p, idx) => (
                          <tr key={idx} className="hover:bg-[#1B2530]/40">
                            <td className="py-2.5 px-4 font-semibold text-white">{p.rank}</td>
                            <td className="py-2.5 px-4 font-bold text-[#E5C378]">
                              ₹{p.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-4 text-right text-amber-300">
                              {p.trophy ? 'Championship Trophy' : 'Certificate'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right sidebar: Registration Progress & Organiser Contact */}
            <div className="space-y-6">
              {/* Quota widget */}
              <div className="bg-[#141B24]/90 border border-[#293442] p-5 rounded-2xl space-y-4 backdrop-blur-sm">
                <h4 className="font-['Barlow_Condensed'] text-lg font-bold uppercase text-white">
                  Registration Progress
                </h4>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8]">Approved Entries</span>
                    <span className="font-bold text-white">
                      {approvedRegistrations.length} of {tournament.capacity}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#0B0F14] rounded-full overflow-hidden border border-[#293442]">
                    <div
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E5C378]"
                      style={{
                        width: `${Math.min(100, (approvedRegistrations.length / tournament.capacity) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-[#293442]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Registration Closes:</span>
                    <span className="font-semibold text-amber-300">
                      {formatDateDisplay(tournament.registrationDeadline)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Waitlist:</span>
                    <span className="font-semibold text-white">
                      {tournament.waitlistEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Organiser Support */}
              <div className="bg-[#141B24]/90 border border-[#293442] p-5 rounded-2xl space-y-3 backdrop-blur-sm">
                <h4 className="font-['Barlow_Condensed'] text-lg font-bold uppercase text-white">
                  Organiser Contact
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-sky-300" />
                    <span>{tournament.contact?.email || 'help@sportlink.in'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#E5C378]" />
                    <span>{tournament.contact?.phone || '+91 20 2500 0000'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Fixtures & Schedule */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
                Match Schedule &amp; Results
              </h3>

              {/* Knockout view toggle between Table & Bracket */}
              {tournament.format === 'single_elimination' && (
                <div className="inline-flex p-1 bg-[#141B24] border border-[#293442] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveView('table')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                      activeView === 'table' ? 'bg-[#1B2530] text-[#E5C378]' : 'text-slate-400'
                    }`}
                  >
                    Table View
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('bracket')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                      activeView === 'bracket' ? 'bg-[#1B2530] text-[#E5C378]' : 'text-slate-400'
                    }`}
                  >
                    Bracket View
                  </button>
                </div>
              )}
            </div>

            {/* Fixtures list */}
            {tournament.format === 'single_elimination' && activeView === 'bracket' ? (
              <BracketView
                fixtures={tournament.fixtures || []}
                onMatchClick={isOrganiserOfThisTournament ? (m) => setSelectedMatchForScoring(m) : null}
              />
            ) : (
              <FixtureTable
                fixtures={tournament.fixtures || []}
                sport={tournament.sport}
                canEnterResults={isOrganiserOfThisTournament}
                onOpenResultEntry={(m) => setSelectedMatchForScoring(m)}
              />
            )}
          </div>
        )}

        {/* TAB 3: Standings */}
        {activeTab === 'standings' && (
          <div className="space-y-4">
            <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
              Official League Standings
            </h3>
            <StandingsTable
              fixtures={tournament.fixtures || []}
              scoringConfig={tournament.scoringConfig}
              teams={approvedRegistrations.map((r) => ({ id: r.entrantId, name: r.entrantName }))}
            />
          </div>
        )}

        {/* TAB 4: Rules & Eligibility */}
        {activeTab === 'rules' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#141B24]/90 border border-[#293442] p-6 rounded-2xl space-y-4 backdrop-blur-sm">
              <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
                Eligibility Criteria
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Age Limits: {tournament.eligibility?.minAge} to {tournament.eligibility?.maxAge} years old.
                  </span>
                </li>
                {tournament.eligibility?.collegeOnly && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
                    <span>Collegiate validation mandatory. Valid student ID required.</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Squad Size: Minimum {tournament.teamSize?.min || 1} player(s), maximum {tournament.teamSize?.max || 10} players (+{tournament.teamSize?.substitutes || 0} substitutes).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Required verification documents: {tournament.eligibility?.documents?.join(', ')}.
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-[#141B24]/90 border border-[#293442] p-6 rounded-2xl space-y-4 backdrop-blur-sm">
              <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
                Tournament Rules &amp; Refund Policy
              </h3>
              <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                <ul className="space-y-2 list-disc list-inside">
                  {tournament.rules?.map((rule, idx) => (
                    <li key={idx} className="leading-relaxed">{rule}</li>
                  ))}
                </ul>

                <div className="p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-amber-300 block uppercase tracking-wider">
                    Refund Policy
                  </span>
                  <p>{tournament.refundPolicy}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result Entry Modal (Accessible to Organiser) */}
      {selectedMatchForScoring && (
        <ResultEntryModal
          isOpen={Boolean(selectedMatchForScoring)}
          onClose={() => setSelectedMatchForScoring(null)}
          match={selectedMatchForScoring}
          sport={tournament.sport}
          format={tournament.format}
          onSaveResult={handleSaveResult}
        />
      )}
    </div>
  );
}
