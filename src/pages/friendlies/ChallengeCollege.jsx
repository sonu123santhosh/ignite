import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Swords,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Users,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Search
} from 'lucide-react';
import { useFriendlies } from '../../context/FriendliesContext';
import GroundFinder from '../../components/friendlies/GroundFinder';
import {
  formatDateDisplay,
  detectMatchConflicts,
  getRelativeDate
} from '../../data/friendliesData';

export default function ChallengeCollege() {
  const navigate = useNavigate();
  const {
    role,
    currentActor,
    colleges,
    teams,
    matches,
    sendChallenge
  } = useFriendlies();

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');

  // Selected values
  const [selectedSport, setSelectedSport] = useState('Football');
  const [selectedOpponentTeamId, setSelectedOpponentTeamId] = useState('');
  const [selectedMyTeamId, setSelectedMyTeamId] = useState(currentActor?.teamId || '');
  const [proposedDate, setProposedDate] = useState(getRelativeDate(5, 17, 0).slice(0, 10));
  const [proposedTime, setProposedTime] = useState('17:00');
  const [proposedDuration, setProposedDuration] = useState(90);
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [linkedFacilityId, setLinkedFacilityId] = useState(null);
  const [format, setFormat] = useState('7-a-side Friendly (2 x 35 min)');
  const [message, setMessage] = useState('');

  // GroundFinder modal
  const [isGroundFinderOpen, setIsGroundFinderOpen] = useState(false);

  // Result state
  const [sentInvitation, setSentInvitation] = useState(null);

  useEffect(() => {
    document.title = 'Challenge a College Team | SportLink';
  }, []);

  // Filter captain's own teams
  const myTeams = teams.filter(
    (t) => t.captainId === currentActor?.id || t.id === currentActor?.teamId
  );

  // Opponent teams in the selected sport (exclude own team and teams of the same college!)
  const opponentTeams = teams.filter((t) => {
    if (t.sport.toLowerCase() !== selectedSport.toLowerCase()) return false;
    if (myTeams.some((myT) => myT.id === t.id)) return false;
    if (myTeams.some((myT) => myT.collegeId === t.collegeId)) return false; // Rule: cannot invite team of same college
    return true;
  });

  const selectedOpponent = teams.find((t) => t.id === selectedOpponentTeamId);
  const selectedMyTeam = teams.find((t) => t.id === selectedMyTeamId) || myTeams[0];

  // Non-captain guard
  if (role !== 'captain') {
    return (
      <div className="min-h-screen bg-transparent text-white py-16 px-4">
        <div className="max-w-lg mx-auto bg-[#151B23] border border-[#293442] rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Swords className="w-8 h-8" />
          </div>
          <h2 className="font-['Barlow_Condensed'] text-3xl font-bold uppercase text-white">
            Captain Role Required
          </h2>
          <p className="text-sm text-[#9CA3AF] leading-relaxed">
            Only designated collegiate Team Captains can initiate friendly match challenges and negotiate terms with rival colleges.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/friendlies"
              className="px-4 py-2 bg-[#1B2530] text-slate-300 border border-[#293442] rounded-xl text-xs font-semibold hover:text-white"
            >
              Back to Matches
            </Link>
            <Link
              to="/friendlies/register-team"
              className="px-5 py-2 bg-[#B6FF3B] text-[#0B0F14] rounded-xl text-xs font-bold hover:bg-[#a3ee28]"
            >
              Register as Team Captain
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Step validation
  const validateStep = (step) => {
    setError('');

    if (step === 1) {
      if (!selectedOpponentTeamId) return 'Please select an opponent collegiate squad.';
    }

    if (step === 2) {
      if (!selectedMyTeamId && myTeams.length === 0) return 'You do not have a squad matching this sport.';
    }

    if (step === 3) {
      if (!proposedDate) return 'Please pick a proposed date.';
      if (!proposedTime) return 'Please pick a proposed kickoff time.';
      const propD = new Date(`${proposedDate}T${proposedTime}`);
      if (propD < new Date()) return 'Match date and time cannot be in the past.';

      // Check conflicts
      const conflicts = detectMatchConflicts(
        matches,
        selectedMyTeam?.id,
        proposedDate,
        proposedTime,
        proposedDuration,
        venueName
      );
      if (conflicts.length > 0) {
        return conflicts[0].message;
      }
    }

    if (step === 4) {
      if (!venueName.trim()) return 'Please enter a venue or ground name, or use Find a Ground.';
    }

    return '';
  };

  const handleNext = () => {
    const err = validateStep(currentStep);
    if (err) {
      setError(err);
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => prev - 1);
  };

  const handleSend = () => {
    const err = validateStep(4);
    if (err) {
      setError(err);
      return;
    }

    const res = sendChallenge({
      senderTeamId: selectedMyTeam?.id,
      senderTeamName: selectedMyTeam?.name,
      senderCollegeId: selectedMyTeam?.collegeId,
      recipientTeamId: selectedOpponent.id,
      recipientCollegeId: selectedOpponent.collegeId,
      recipientCaptainId: selectedOpponent.captainId,
      sport: selectedSport,
      date: proposedDate,
      startTime: proposedTime,
      durationMinutes: proposedDuration,
      venueName,
      venueAddress,
      format,
      message: message.trim() || 'Friendly collegiate exhibition match proposal.'
    });

    if (res.success) {
      setSentInvitation(res.invitation);
      setCurrentStep(6);
    }
  };

  const steps = [
    { num: 1, label: 'Opponent' },
    { num: 2, label: 'Your Squad' },
    { num: 3, label: 'Date & Time' },
    { num: 4, label: 'Venue' },
    { num: 5, label: 'Review' }
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#FFFFFF] pb-24">
      {/* Top Bar */}
      <div className="bg-[#151B23] border-b border-[#293442] py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link
            to="/friendlies"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel &amp; Exit</span>
          </Link>
          <span className="text-xs text-[#9CA3AF]">
            Challenging as Captain: <strong className="text-white">{currentActor?.name}</strong>
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        {/* Stepper Progress Bar */}
        {currentStep < 6 && (
          <div className="bg-[#151B23] border border-[#293442] p-4 sm:p-5 rounded-2xl mb-8 shadow-lg">
            <div className="flex items-center justify-between">
              {steps.map((st) => (
                <div key={st.num} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                      currentStep > st.num
                        ? 'bg-[#B6FF3B] text-[#0B0F14]'
                        : currentStep === st.num
                        ? 'bg-[#00D9FF] text-[#0B0F14] ring-4 ring-[#00D9FF]/20'
                        : 'bg-[#1B2530] text-slate-500 border border-[#293442]'
                    }`}
                  >
                    {currentStep > st.num ? <Check className="w-4 h-4" /> : st.num}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold mt-2 ${
                      currentStep === st.num ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/40 rounded-xl flex items-center gap-2.5 text-xs text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Select Opponent College & Squad */}
        {currentStep === 1 && (
          <div className="bg-[#151B23] border border-[#293442] p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl">
            <div>
              <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                1. Select Rival College Squad
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Choose the sport and select the opponent college squad to challenge.
              </p>
            </div>

            {/* Sport selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-[#9CA3AF] block">
                Competition Sport
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {['Football', 'Cricket', 'Basketball', 'Volleyball', 'Badminton'].map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => {
                      setSelectedSport(sp);
                      setSelectedOpponentTeamId('');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      selectedSport === sp
                        ? 'bg-[#B6FF3B] text-[#0B0F14]'
                        : 'bg-[#1B2530] text-slate-300 hover:text-white'
                    }`}
                  >
                    {sp}
                  </button>
                ))}
              </div>
            </div>

            {/* Opponent squads list */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold uppercase text-[#9CA3AF] block">
                Available Opponent Squads ({opponentTeams.length})
              </label>

              {opponentTeams.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#9CA3AF] bg-[#0B0F14] border border-[#293442] rounded-xl">
                  No registered college squads available in this sport to challenge.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {opponentTeams.map((team) => {
                    const isSelected = selectedOpponentTeamId === team.id;
                    return (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => setSelectedOpponentTeamId(team.id)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-[#00D9FF]/10 border-[#00D9FF] text-white shadow-md'
                            : 'bg-[#1B2530] border-[#293442] text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-['Barlow_Condensed'] font-black text-white shrink-0 text-base"
                          style={{ backgroundColor: team.primaryColor || '#00D9FF' }}
                        >
                          {team.logoInitials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white truncate">{team.name}</h4>
                          <span className="text-xs text-[#9CA3AF] block truncate">{team.collegeName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Skill: {team.skillLevel}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Select Your Team */}
        {currentStep === 2 && (
          <div className="bg-[#151B23] border border-[#293442] p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl">
            <div>
              <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                2. Select Your Squad
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Choose which of your registered squads will represent your college in this match.
              </p>
            </div>

            <div className="space-y-3">
              {myTeams.map((team) => {
                const isSelected = selectedMyTeamId === team.id;
                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => setSelectedMyTeamId(team.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-white shadow-md'
                        : 'bg-[#1B2530] border-[#293442] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-['Barlow_Condensed'] font-black text-white shrink-0"
                        style={{ backgroundColor: team.primaryColor || '#00D9FF' }}
                      >
                        {team.logoInitials}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{team.name}</h4>
                        <span className="text-xs text-[#9CA3AF]">{team.collegeName} &bull; {team.sport}</span>
                      </div>
                    </div>
                    <span className="text-xs text-[#B6FF3B] font-bold">
                      {team.roster?.length || 0} players
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Propose Date & Time */}
        {currentStep === 3 && (
          <div className="bg-[#151B23] border border-[#293442] p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl">
            <div>
              <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                3. Propose Match Schedule
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Propose a tentative match date and kickoff time for opponent captain review.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-[#9CA3AF] block mb-1">
                  Proposed Date *
                </label>
                <input
                  type="date"
                  required
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  className="w-full p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-sm text-white focus:border-[#B6FF3B] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#9CA3AF] block mb-1">
                  Kickoff Time *
                </label>
                <input
                  type="time"
                  required
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  className="w-full p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-sm text-white focus:border-[#B6FF3B] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#9CA3AF] block mb-1">
                Match Duration (minutes)
              </label>
              <select
                value={proposedDuration}
                onChange={(e) => setProposedDuration(Number(e.target.value))}
                className="w-full p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none cursor-pointer"
              >
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes (Standard)</option>
                <option value={120}>120 minutes</option>
                <option value={180}>180 minutes (Cricket T20)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Suggest Venue (with Find a Ground integration) */}
        {currentStep === 4 && (
          <div className="bg-[#151B23] border border-[#293442] p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                  4. Propose Venue &amp; Ground
                </h2>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Enter a ground manually or choose a verified facility from SportLink Grounds.
                </p>
              </div>

              {/* Find a ground Button (Integration requirement) */}
              <button
                type="button"
                onClick={() => setIsGroundFinderOpen(true)}
                className="px-4 py-2 bg-[#00D9FF] hover:bg-[#00b3d6] text-[#0B0F14] font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
              >
                <Building2 className="w-4 h-4" />
                <span>Find a Ground</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-[#9CA3AF] block mb-1">
                  Ground / Stadium Name *
                </label>
                <input
                  type="text"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. Elite Football Arena (Pitch 1) or College Main Turf"
                  className="w-full p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-sm text-white focus:border-[#B6FF3B] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#9CA3AF] block mb-1">
                  Match Format Tag
                </label>
                <input
                  type="text"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  placeholder="e.g. 7-a-side Friendly (2 x 35 min)"
                  className="w-full p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#9CA3AF] block mb-1">
                  Message to Opponent Captain (Max 200 chars)
                </label>
                <textarea
                  rows={2}
                  maxLength={200}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Propose kit colours, referee arrangements, or friendly sparring objectives..."
                  className="w-full p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none"
                />
                <span className="text-[10px] text-slate-500 text-right block">
                  {message.length} / 200 characters
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Send Challenge */}
        {currentStep === 5 && (
          <div className="bg-[#151B23] border border-[#293442] p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl">
            <div>
              <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                5. Review Challenge Terms
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Verify proposed terms before sending invitation to the opponent captain.
              </p>
            </div>

            <div className="p-5 bg-[#1B2530] border border-[#293442] rounded-xl space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Your Squad:</span>
                <span className="font-bold text-white">{selectedMyTeam?.name} ({selectedMyTeam?.collegeName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Opponent Squad:</span>
                <span className="font-bold text-[#00D9FF]">{selectedOpponent?.name} ({selectedOpponent?.collegeName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Date &amp; Kickoff:</span>
                <span className="font-semibold text-white">{formatDateDisplay(proposedDate)} at {proposedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Venue Ground:</span>
                <span className="font-semibold text-white">{venueName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Format:</span>
                <span className="font-semibold text-white">{format}</span>
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-xl text-xs text-amber-300">
              <strong>Match Agreement Rule:</strong> Sending this challenge sets status to <em>Pending</em>. The match is not confirmed until the other captain accepts or counter-proposes.
            </div>
          </div>
        )}

        {/* Step 6: Result Screen */}
        {currentStep === 6 && sentInvitation && (
          <div className="bg-[#151B23] border border-[#293442] p-8 sm:p-12 rounded-2xl text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#B6FF3B]/10 border border-[#B6FF3B] text-[#B6FF3B] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(182,255,59,0.3)]">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-['Barlow_Condensed'] text-3xl sm:text-4xl font-black uppercase text-white">
                Invitation Sent
              </h2>
              {/* EXACT RESULT SCREEN REQUIREMENT */}
              <p className="text-sm text-[#9CA3AF] max-w-md mx-auto">
                Invitation sent. The match isn&apos;t confirmed until the other captain accepts.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 bg-[#1B2530] border border-[#293442] rounded-xl text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Reference ID:</span>
                <span className="font-mono font-bold text-[#B6FF3B]">{sentInvitation.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Recipient:</span>
                <span className="font-semibold text-white">{selectedOpponent?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Status:</span>
                <span className="font-bold text-[#00D9FF]">{sentInvitation.status}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/friendlies/inbox"
                className="px-5 py-2.5 bg-[#B6FF3B] text-[#0B0F14] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#a3ee28]"
              >
                Go to Inbox
              </Link>
              <Link
                to="/friendlies"
                className="px-5 py-2.5 bg-[#1B2530] text-white border border-[#293442] font-semibold text-xs rounded-xl hover:bg-slate-700"
              >
                Browse Matches
              </Link>
            </div>
          </div>
        )}

        {/* Stepper Buttons */}
        {currentStep < 6 && (
          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={handleBack}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold ${
                currentStep === 1 ? 'opacity-30 cursor-not-allowed text-slate-500' : 'bg-[#1B2530] text-white hover:bg-slate-700'
              }`}
            >
              Back
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#B6FF3B] text-[#0B0F14] font-bold text-xs uppercase tracking-wider hover:bg-[#a3ee28] flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                className="px-6 py-2.5 rounded-xl bg-[#00D9FF] text-[#0B0F14] font-black text-xs uppercase tracking-wider hover:bg-[#00b3d6] flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Swords className="w-4 h-4" />
                <span>Send Challenge</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* GroundFinder Modal */}
      <GroundFinder
        isOpen={isGroundFinderOpen}
        onClose={() => setIsGroundFinderOpen(false)}
        sport={selectedSport}
        dateStr={proposedDate}
        onSelectGround={(ground) => {
          setVenueName(ground.name);
          setVenueAddress(ground.address);
          setLinkedFacilityId(ground.facilityId);
        }}
      />
    </div>
  );
}
