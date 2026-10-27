import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Users,
  User,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  HelpCircle,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  checkEligibility,
  formatDateDisplay,
  daysUntil
} from '../data/tournamentsData';

export default function TournamentRegister({
  sharedTournamentsState,
  setSharedTournamentsState,
  currentDemoUser,
  tournamentRole = 'player'
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const tournament = sharedTournamentsState.tournaments.find((t) => t.id === id);

  // Stepper state (1: Type, 2: Details, 3: Eligibility, 4: Review, 5: Result)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [participationType, setParticipationType] = useState('individual');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [playerName, setPlayerName] = useState(currentDemoUser?.name || '');
  const [playerEmail, setPlayerEmail] = useState(currentDemoUser?.email || '');
  const [playerPhone, setPlayerPhone] = useState(currentDemoUser?.phone || '');
  const [playerAge, setPlayerAge] = useState(currentDemoUser?.age || 20);
  const [playerCollege, setPlayerCollege] = useState(currentDemoUser?.college || '');
  const [playerPosition, setPlayerPosition] = useState('Forward');
  const [uploadedDocs, setUploadedDocs] = useState(['student_identity_card.pdf']);
  const [rulesAccepted, setRulesAccepted] = useState(false);

  // Submission result & errors
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissionError, setSubmissionError] = useState('');

  // Eligible teams captained by this user
  const userTeams = (sharedTournamentsState.teams || []).filter(
    (team) => team.captainId === currentDemoUser?.id || team.sport.toLowerCase() === (tournament?.sport || '').toLowerCase()
  );

  useEffect(() => {
    if (tournament) {
      document.title = `Register for ${tournament.name} | SportLink`;
      if (tournament.participationType === 'team') {
        setParticipationType('team');
      } else if (tournament.participationType === 'individual') {
        setParticipationType('individual');
      }
      if (userTeams.length > 0 && !selectedTeamId) {
        setSelectedTeamId(userTeams[0].id);
      }
    }
  }, [tournament, userTeams]);

  if (!tournament) {
    return (
      <div className="py-20 text-center max-w-lg mx-auto px-4">
        <h2 className="font-['Barlow_Condensed'] text-3xl font-bold uppercase text-white mb-2">
          Tournament Not Found
        </h2>
        <Link to="/tournaments" className="text-xs font-bold text-[#B6FF3B] hover:underline">
          Return to Tournaments
        </Link>
      </div>
    );
  }

  // Selected Team Object
  const selectedTeam = userTeams.find((t) => t.id === selectedTeamId);
  const joinedMembersCount = (selectedTeam?.members || []).filter(
    (m) => m.invitationStatus === 'Joined'
  ).length;

  // Run eligibility check
  const entrantDetails = {
    playerId: currentDemoUser?.id,
    teamId: participationType === 'team' ? selectedTeamId : null,
    age: Number(playerAge),
    college: playerCollege || selectedTeam?.collegeOrOrg,
    rosterSize: participationType === 'team' ? joinedMembersCount : 1
  };

  const eligibility = checkEligibility(
    tournament,
    entrantDetails,
    sharedTournamentsState.registrations
  );

  // Handle Next step with validation
  const handleNext = () => {
    setSubmissionError('');

    if (currentStep === 1) {
      if (tournament.participationType === 'team' && participationType !== 'team') {
        setSubmissionError('This tournament only accepts squad/team registrations.');
        return;
      }
      if (tournament.participationType === 'individual' && participationType !== 'individual') {
        setSubmissionError('This tournament only accepts individual registrations.');
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (participationType === 'team') {
        if (!selectedTeamId) {
          setSubmissionError('Please select a team or create one first.');
          return;
        }
      } else {
        if (!playerName.trim() || !playerPhone.trim() || !playerEmail.trim()) {
          setSubmissionError('Please complete all required contact details.');
          return;
        }
        if (tournament.eligibility?.collegeOnly && !playerCollege.trim()) {
          setSubmissionError('Collegiate tournament requires a valid College/University name.');
          return;
        }
      }
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!eligibility.eligible && !eligibility.willWaitlist) {
        setSubmissionError('Cannot proceed while eligibility criteria fail.');
        return;
      }
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      if (!rulesAccepted) {
        setSubmissionError('You must acknowledge and accept tournament rules and refund policies.');
        return;
      }
      handleConfirmRegistration();
    }
  };

  const handleBack = () => {
    setSubmissionError('');
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Final confirmation execution
  const handleConfirmRegistration = () => {
    // 1. Recheck deadline and closed status at exact moment of confirmation
    const latestDaysLeft = daysUntil(tournament.registrationDeadline);
    if (tournament.status !== 'Registration Open' || latestDaysLeft < 0) {
      setSubmissionError('Registration closed while you were completing this form.');
      return;
    }

    // 2. Recheck duplicate
    const entrantId = participationType === 'team' ? selectedTeamId : currentDemoUser?.id;
    const isDup = sharedTournamentsState.registrations.some(
      (r) =>
        r.tournamentId === tournament.id &&
        r.entrantId === entrantId &&
        ['Submitted', 'Approved', 'Waitlisted', 'Pending'].includes(r.registrationStatus)
    );
    if (isDup) {
      setSubmissionError('A registration for this squad/player was already recorded in the system.');
      return;
    }

    // 3. Determine status (Waitlisted or Submitted)
    const newRegStatus = eligibility.willWaitlist ? 'Waitlisted' : 'Submitted';
    const newRegId = `SL-REG-${Math.floor(10000 + Math.random() * 90000)}`;

    const newRegistration = {
      id: newRegId,
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      participationType,
      entrantId,
      entrantName: participationType === 'team' ? selectedTeam?.name : playerName,
      captainId: currentDemoUser?.id,
      captainName: currentDemoUser?.name,
      captainPhone: playerPhone,
      captainEmail: playerEmail,
      playerCount: participationType === 'team' ? joinedMembersCount : 1,
      submittedOn: new Date().toISOString(),
      registrationStatus: newRegStatus,
      paymentStatus: tournament.entryFee === 0 ? 'Not required' : 'Demo-paid',
      amountPaid: tournament.entryFee,
      missingInfoReason: '',
      rejectionReason: '',
      verifiedDocs: [],
      documents: uploadedDocs.map((d) => ({ name: d, verified: false }))
    };

    // Update shared state
    setSharedTournamentsState((prev) => ({
      ...prev,
      registrations: [newRegistration, ...prev.registrations],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: 'Tournament Application Submitted',
          message: `Application ${newRegId} for ${tournament.name} has been received.`,
          tournamentId: tournament.id,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'info',
          targetUserId: currentDemoUser?.id
        },
        ...prev.notifications
      ]
    }));

    setSubmissionResult(newRegistration);
    setCurrentStep(5);
  };

  const steps = [
    { num: 1, label: 'Type' },
    { num: 2, label: 'Details' },
    { num: 3, label: 'Eligibility' },
    { num: 4, label: 'Review' },
    { num: 5, label: 'Status' }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F7FA] pb-24">
      {/* Header bar */}
      <div className="bg-[#141B24] border-b border-[#293442] py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link
            to={`/tournaments/${tournament.id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#B6FF3B]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel Registration</span>
          </Link>
          <div className="text-right">
            <span className="text-[11px] text-[#94A3B8] uppercase tracking-wider block">Tournament</span>
            <span className="font-bold text-xs text-white truncate max-w-[200px] sm:max-w-none block">
              {tournament.name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        {/* Stepper Progress Bar */}
        <div className="bg-[#141B24] border border-[#293442] p-4 sm:p-6 rounded-2xl mb-8 shadow-lg">
          <div className="flex items-center justify-between relative">
            {steps.map((st) => {
              const isPast = currentStep > st.num;
              const isCurrent = currentStep === st.num;

              return (
                <div key={st.num} className="flex flex-col items-center z-10">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isPast
                        ? 'bg-[#B6FF3B] text-[#0B0F14]'
                        : isCurrent
                        ? 'bg-[#00D4FF] text-[#0B0F14] ring-4 ring-[#00D4FF]/20 shadow-[0_0_15px_rgba(0,212,255,0.4)]'
                        : 'bg-[#1B2530] text-slate-500 border border-[#293442]'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4" /> : st.num}
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs font-semibold mt-2 ${
                      isCurrent ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {submissionError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/40 rounded-xl flex items-start gap-3 text-xs sm:text-sm text-red-400">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{submissionError}</span>
          </div>
        )}

        {/* Step 1: Participation Type */}
        {currentStep === 1 && (
          <div className="bg-[#141B24] border border-[#293442] p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl">
            <div>
              <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                1. Select Entry Participation Type
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                Choose whether you are registering an official team squad or an individual competitor.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Team Option */}
              <button
                type="button"
                disabled={tournament.participationType === 'individual'}
                onClick={() => setParticipationType('team')}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  tournament.participationType === 'individual'
                    ? 'opacity-40 cursor-not-allowed bg-[#0B0F14] border-[#293442]'
                    : participationType === 'team'
                    ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] shadow-[0_0_20px_rgba(182,255,59,0.15)]'
                    : 'bg-[#1B2530] border-[#293442] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-[#0B0F14] text-[#B6FF3B]">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">Squad / Team</h3>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Register a squad roster you captain. Minimum {tournament.teamSize?.min || 1} players required.
                </p>
              </button>

              {/* Individual Option */}
              <button
                type="button"
                disabled={tournament.participationType === 'team'}
                onClick={() => setParticipationType('individual')}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  tournament.participationType === 'team'
                    ? 'opacity-40 cursor-not-allowed bg-[#0B0F14] border-[#293442]'
                    : participationType === 'individual'
                    ? 'bg-[#00D4FF]/10 border-[#00D4FF] shadow-[0_0_20px_rgba(0,212,255,0.15)]'
                    : 'bg-[#1B2530] border-[#293442] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-[#0B0F14] text-[#00D4FF]">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">Solo Competitor</h3>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Register yourself as an individual participant for singles draws or open seeds.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === 2 && (
          <div className="bg-[#141B24] border border-[#293442] p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl">
            <div>
              <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                2. Entrant Details &amp; Squad Selection
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                Provide required roster and contact credentials for match officials.
              </p>
            </div>

            {participationType === 'team' ? (
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                  Select Team You Captain
                </label>
                {userTeams.length === 0 ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400 space-y-2">
                    <p>You currently do not have a squad matching this sport ({tournament.sport}).</p>
                    <Link
                      to="/tournaments/teams"
                      className="inline-block px-3 py-1.5 bg-amber-400 text-[#0B0F14] font-bold rounded-lg text-xs"
                    >
                      Create Squad in &quot;My Teams&quot;
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userTeams.map((team) => {
                      const isSelected = selectedTeamId === team.id;
                      const joinedCount = team.members.filter((m) => m.invitationStatus === 'Joined').length;

                      return (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => setSelectedTeamId(team.id)}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-white shadow-sm'
                              : 'bg-[#1B2530] border-[#293442] text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-white">{team.name}</span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0B0F14] text-[#B6FF3B]">
                              {joinedCount} players
                            </span>
                          </div>
                          <span className="text-xs text-[#94A3B8] block">{team.collegeOrOrg}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={playerPhone}
                    onChange={(e) => setPlayerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={playerEmail}
                    onChange={(e) => setPlayerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                    Age
                  </label>
                  <input
                    type="number"
                    value={playerAge}
                    onChange={(e) => setPlayerAge(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none"
                  />
                </div>

                {tournament.eligibility?.collegeOnly && (
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                      College / University Name *
                    </label>
                    <input
                      type="text"
                      value={playerCollege}
                      onChange={(e) => setPlayerCollege(e.target.value)}
                      placeholder="e.g. Pune University / Fergusson College"
                      className="w-full px-3 py-2 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Document Placeholder slot */}
            <div className="pt-4 border-t border-[#293442] space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                Verification Documents Placeholder (Simulated File Slot)
              </label>
              <div className="p-3 bg-[#1B2530] border border-[#293442] rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#B6FF3B]" />
                  <span className="text-slate-300">
                    Required: {tournament.eligibility?.documents?.join(', ')}
                  </span>
                </div>
                <span className="text-[11px] text-[#00D4FF] font-semibold bg-[#00D4FF]/10 px-2 py-0.5 rounded">
                  Mock Attached
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] italic">
                Note: File upload storage requires cloud integration in production.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Eligibility Check */}
        {currentStep === 3 && (
          <div className="bg-[#141B24] border border-[#293442] p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl">
            <div>
              <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                3. Automated Eligibility Verification
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                Checking tournament regulations, age brackets, duplicates, and capacity quota.
              </p>
            </div>

            {/* Check Results List */}
            <div className="space-y-3">
              {eligibility.checks.map((chk, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                    chk.passed
                      ? chk.isWaitlistNotice
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                        : 'bg-[#1B2530] border-emerald-500/40 text-slate-200'
                      : 'bg-red-500/10 border-red-500/40 text-red-400'
                  }`}
                >
                  {chk.passed ? (
                    chk.isWaitlistNotice ? (
                      <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    )
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                      {chk.title}
                    </h4>
                    <p className="text-xs mt-0.5 leading-relaxed">{chk.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {!eligibility.eligible && !eligibility.willWaitlist && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
                You cannot register because one or more tournament criteria were not satisfied. Go back to adjust squad or details.
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review & Payment simulation */}
        {currentStep === 4 && (
          <div className="bg-[#141B24] border border-[#293442] p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl">
            <div>
              <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                4. Application Summary &amp; Entry Fee
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                Verify application details before confirming registration.
              </p>
            </div>

            {/* Price breakdown */}
            <div className="p-5 bg-[#1B2530] border border-[#293442] rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">Entrant:</span>
                <span className="font-bold text-white">
                  {participationType === 'team' ? selectedTeam?.name : playerName}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">Tournament Entry Fee:</span>
                <span className="font-bold text-white">
                  {tournament.entryFee === 0 ? 'FREE' : `₹${tournament.entryFee.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">Platform &amp; Referee Levy:</span>
                <span className="text-emerald-400 font-semibold">₹0 (Waived for demo)</span>
              </div>
              <div className="pt-2 border-t border-[#293442] flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-white">
                  Total Payable (Demo):
                </span>
                <span className="font-['Barlow_Condensed'] text-2xl font-black text-[#B6FF3B]">
                  ₹{tournament.entryFee.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Refund & Rules acknowledgement */}
            <div className="space-y-3">
              <div className="p-3.5 bg-[#0B0F14] border border-[#293442] rounded-xl text-xs text-[#94A3B8] space-y-1">
                <span className="font-bold text-white block">Refund Policy Text:</span>
                <p>{tournament.refundPolicy}</p>
              </div>

              <label className="flex items-start gap-3 p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rulesAccepted}
                  onChange={(e) => setRulesAccepted(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#B6FF3B] mt-0.5 cursor-pointer"
                />
                <span>
                  I have read and agree to follow all official tournament rules, referee decisions, and the specified refund schedule.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Step 5: Result Screen */}
        {currentStep === 5 && submissionResult && (
          <div className="bg-[#141B24] border border-[#293442] p-6 sm:p-10 rounded-2xl text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#B6FF3B]/10 border border-[#B6FF3B] text-[#B6FF3B] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(182,255,59,0.3)]">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B6FF3B]">
                {submissionResult.registrationStatus === 'Waitlisted' ? 'Waitlist Confirmed' : 'Application Submitted'}
              </span>
              <h2 className="font-['Barlow_Condensed'] text-3xl sm:text-4xl font-black uppercase text-white">
                Registration Reference: {submissionResult.id}
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md mx-auto">
                Demo registration: no payment taken and no entry confirmed with the organiser.
              </p>
            </div>

            {/* Summary card */}
            <div className="max-w-md mx-auto p-4 bg-[#1B2530] border border-[#293442] rounded-xl text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Tournament:</span>
                <span className="font-semibold text-white">{tournament.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Entrant:</span>
                <span className="font-semibold text-white">{submissionResult.entrantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Registration Status:</span>
                <span className="font-bold text-[#00D4FF]">{submissionResult.registrationStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Payment Status:</span>
                <span className="font-semibold text-emerald-400">{submissionResult.paymentStatus}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                to="/tournaments/my-registrations"
                className="px-5 py-2.5 rounded-xl bg-[#B6FF3B] text-[#0B0F14] font-bold text-xs uppercase tracking-wider hover:bg-[#a3ee28]"
              >
                View in My Registrations
              </Link>
              <Link
                to="/tournaments"
                className="px-5 py-2.5 rounded-xl bg-[#1B2530] text-white border border-[#293442] font-semibold text-xs hover:bg-slate-700"
              >
                Browse More Events
              </Link>
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={handleBack}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                currentStep === 1
                  ? 'opacity-30 cursor-not-allowed text-slate-500'
                  : 'bg-[#1B2530] hover:bg-slate-700 text-white border border-[#293442] cursor-pointer'
              }`}
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-[#B6FF3B] hover:bg-[#a3ee28] text-[#0B0F14] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <span>{currentStep === 4 ? 'Confirm Demo Registration' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
